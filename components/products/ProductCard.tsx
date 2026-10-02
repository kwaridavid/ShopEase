import Link from "next/link";
import { money } from "@/lib/format";
import type { Product } from "@/types";

export function StockNote({ stock }: { stock: number }) {
  if (stock <= 0) return <span className="text-sm font-medium text-warn">Out of stock</span>;
  if (stock <= 5) return <span className="text-sm font-medium text-amber-700">Only {stock} left</span>;
  return <span className="text-sm text-emerald-700">In stock</span>;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="aspect-square overflow-hidden rounded-lg bg-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image_url ?? ""} alt={product.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <h3 className="font-medium group-hover:text-accent">{product.name}</h3>
        <p className="font-semibold">{money(product.price)}</p>
      </div>
      <StockNote stock={product.stock_quantity} />
    </Link>
  );
}
