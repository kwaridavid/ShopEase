"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CartLink() {
  const { count, ready } = useCart();
  return (
    <Link href="/cart" className="btn-ghost gap-2" aria-label={`Cart, ${ready ? count : 0} items`}>
      Cart
      <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">{ready ? count : 0}</span>
    </Link>
  );
}
