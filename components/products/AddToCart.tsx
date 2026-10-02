"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import type { Product } from "@/types";

export default function AddToCart({ product }: { product: Product }) {
  const { add, items } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const inCart = items.find((i) => i.productId === product.id)?.quantity ?? 0;
  const room = product.stock_quantity - inCart;

  if (product.stock_quantity <= 0) return <button className="btn" disabled>Out of stock</button>;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label htmlFor="qty" className="text-sm font-medium">Quantity</label>
        <input id="qty" type="number" min={1} max={Math.max(room, 1)} value={qty} disabled={room < 1}
          onChange={(e) => setQty(Math.max(1, Math.min(Math.max(room, 1), Number(e.target.value) || 1)))} className="field w-20" />
        <button className="btn" disabled={room < 1} onClick={() => {
          add({ productId: product.id, slug: product.slug, name: product.name, price: product.price, image: product.image_url, stock: product.stock_quantity }, qty);
          setAdded(true); setQty(1);
        }}>Add to cart</button>
      </div>
      {room < 1 && <p className="text-sm text-amber-700">You have all available stock in your cart.</p>}
      {added && <p role="status" className="text-sm text-emerald-700">Added. <Link href="/cart" className="underline">View cart</Link></p>}
    </div>
  );
}
