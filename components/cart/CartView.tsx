"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/format";

export default function CartView() {
  const { items, ready, subtotal, setQuantity, remove } = useCart();
  if (!ready) return <p className="text-ink/60">Loading your cart…</p>;
  if (items.length === 0)
    return (
      <div className="rounded-lg border border-dashed border-line p-10 text-center">
        <p className="mb-4">Your cart is empty.</p>
        <Link href="/products" className="btn">Browse products</Link>
      </div>
    );
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <ul className="divide-y divide-line rounded-lg border border-line bg-white">
        {items.map((i) => (
          <li key={i.productId} className="flex gap-4 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={i.image ?? ""} alt="" className="h-20 w-20 rounded-md bg-line object-cover" />
            <div className="flex-1">
              <Link href={`/products/${i.slug}`} className="font-medium hover:text-accent">{i.name}</Link>
              <p className="text-sm text-ink/60">{money(i.price)} each</p>
              <div className="mt-2 flex items-center gap-2">
                <button className="btn-ghost px-3" aria-label={`Decrease ${i.name}`} onClick={() => setQuantity(i.productId, i.quantity - 1)} disabled={i.quantity <= 1}>−</button>
                <span aria-live="polite" className="w-8 text-center">{i.quantity}</span>
                <button className="btn-ghost px-3" aria-label={`Increase ${i.name}`} onClick={() => setQuantity(i.productId, i.quantity + 1)} disabled={i.quantity >= i.stock}>+</button>
                <button className="ml-3 text-sm text-warn underline" onClick={() => remove(i.productId)}>Remove</button>
              </div>
              {i.quantity >= i.stock && <p className="mt-1 text-xs text-amber-700">Maximum available quantity</p>}
            </div>
            <p className="font-semibold">{money(i.price * i.quantity)}</p>
          </li>
        ))}
      </ul>
      <aside className="h-fit rounded-lg border border-line bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold">Summary</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
          <div className="flex justify-between text-ink/60"><dt>Delivery</dt><dd>Calculated at checkout</dd></div>
        </dl>
        <Link href="/checkout" className="btn mt-5 w-full">Go to checkout</Link>
      </aside>
    </div>
  );
}
