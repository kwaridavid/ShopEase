-- Server-side cart so web and mobile share one cart per user. Run once in the SQL Editor.
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0 and quantity <= 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.cart_items enable row level security;
create policy "cart: read own"   on public.cart_items for select using (auth.uid() = user_id);
create policy "cart: insert own" on public.cart_items for insert with check (auth.uid() = user_id);
create policy "cart: update own" on public.cart_items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cart: delete own" on public.cart_items for delete using (auth.uid() = user_id);

-- Realtime: push every change to the user's other devices.
-- REPLICA IDENTITY FULL is needed so DELETE events carry user_id and match the per-user filter.
alter table public.cart_items replica identity full;
alter publication supabase_realtime add table public.cart_items;

-- Same checkout function as before, plus: the cart is emptied inside the same transaction,
-- so a successful order empties the cart on every device at once.
create or replace function public.place_order(
  p_items jsonb, p_name text, p_email text, p_phone text,
  p_address text, p_city text, p_state text, p_country text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_order uuid;
  v_subtotal numeric(10,2) := 0;
  v_fee numeric(10,2);
  r record;
  p public.products;
begin
  if v_user is null then raise exception 'Please sign in to place your order.'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty.';
  end if;

  insert into public.orders (user_id, customer_name, customer_email, phone, delivery_address, city, state, country)
  values (v_user, p_name, p_email, p_phone, p_address, p_city, p_state, p_country)
  returning id into v_order;

  for r in
    select (e->>'product_id')::uuid as pid, sum((e->>'quantity')::int)::int as qty
    from jsonb_array_elements(p_items) e group by 1 order by 1
  loop
    if r.qty < 1 then raise exception 'Invalid quantity.'; end if;
    select * into p from public.products where id = r.pid for update;
    if not found or not p.is_active then raise exception 'A product in your cart is no longer available.'; end if;
    if p.stock_quantity < r.qty then raise exception 'Only % of "%" left in stock.', p.stock_quantity, p.name; end if;
    update public.products set stock_quantity = stock_quantity - r.qty, updated_at = now() where id = p.id;
    insert into public.order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
    values (v_order, p.id, p.name, r.qty, p.price, p.price * r.qty);
    v_subtotal := v_subtotal + p.price * r.qty;
  end loop;

  v_fee := case when v_subtotal >= 100 then 0 else 5 end;
  update public.orders set subtotal = v_subtotal, delivery_fee = v_fee, total = v_subtotal + v_fee where id = v_order;
  delete from public.cart_items where user_id = v_user;
  return v_order;
end $$;
