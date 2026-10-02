import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddToCart from "@/components/products/AddToCart";
import { StockNote } from "@/components/products/ProductCard";
import { money } from "@/lib/format";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { data } = await createClient().from("products").select("*").eq("slug", params.slug).maybeSingle();
  if (!data) notFound();
  const p = data as Product;
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-lg bg-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image_url ?? ""} alt={p.name} className="h-full w-full object-cover" />
      </div>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{p.name}</h1>
        <p className="text-2xl font-semibold">{money(p.price)}</p>
        <StockNote stock={p.stock_quantity} />
        <p className="max-w-prose text-ink/80">{p.description}</p>
        <AddToCart product={p} />
      </div>
    </div>
  );
}
