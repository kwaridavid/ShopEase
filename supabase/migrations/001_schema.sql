-- ShopEase schema, RLS and atomic checkout. Run in Supabase SQL Editor (or `supabase db push`).
create extension if not exists pgcrypto;

create type order_status as enum ('PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, email text, avatar_url text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null, slug text not null unique, description text, image_url text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null, slug text not null unique, description text,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_featured boolean not null default false, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index on public.products (category_id);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  customer_name text not null, customer_email text not null, phone text not null,
  delivery_address text not null, city text not null, state text not null, country text not null,
  subtotal numeric(10,2) not null default 0, delivery_fee numeric(10,2) not null default 0, total numeric(10,2) not null default 0,
  status order_status not null default 'CONFIRMED',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index on public.orders (user_id, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  product_name text not null,             -- snapshot so history stays accurate
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null,      -- snapshot
  subtotal numeric(10,2) not null
);
create index on public.order_items (order_id);

-- ---------- Row Level Security ----------
alter table public.profiles    enable row level security;
alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

create policy "profiles: read own"   on public.profiles for select using (auth.uid() = id);
create policy "profiles: insert own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "categories: public read" on public.categories for select using (true);
create policy "products: public read active" on public.products for select using (is_active);

-- Orders are created only through place_order(); there is deliberately no INSERT/UPDATE policy.
create policy "orders: read own" on public.orders for select using (auth.uid() = user_id);
create policy "order_items: read own" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- ---------- Auto-create profile on first sign-in ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), new.email, new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ---------- Atomic checkout ----------
-- Prices, stock and totals come from the database, never from the client.
-- Delivery rule: flat 5.00, free when subtotal >= 100 (mirror in lib/format.ts).
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

  -- Merge duplicate lines; ordered by id so concurrent orders lock rows in the same order.
  for r in
    select (e->>'product_id')::uuid as pid, sum((e->>'quantity')::int)::int as qty
    from jsonb_array_elements(p_items) e group by 1 order by 1
  loop
    if r.qty < 1 then raise exception 'Invalid quantity.'; end if;
    select * into p from public.products where id = r.pid for update;
    if not found or not p.is_active then
      raise exception 'A product in your cart is no longer available.';
    end if;
    if p.stock_quantity < r.qty then
      raise exception 'Only % of "%" left in stock.', p.stock_quantity, p.name;
    end if;
    update public.products set stock_quantity = stock_quantity - r.qty, updated_at = now() where id = p.id;
    insert into public.order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
    values (v_order, p.id, p.name, r.qty, p.price, p.price * r.qty);
    v_subtotal := v_subtotal + p.price * r.qty;
  end loop;

  v_fee := case when v_subtotal >= 100 then 0 else 5 end;
  update public.orders set subtotal = v_subtotal, delivery_fee = v_fee, total = v_subtotal + v_fee where id = v_order;
  return v_order;
end $$;

revoke all on function public.place_order(jsonb, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.place_order(jsonb, text, text, text, text, text, text, text) to authenticated;
