import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/products/ProductCard";
import type { Category, Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createClient();
  const [{ data: featured }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("is_featured", true).limit(8),
    supabase.from("categories").select("*").order("name"),
  ]);
  return (
    <div className="space-y-14">
      <section className="max-w-2xl py-6">
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">Everyday things, well made.</h1>
        <p className="mt-4 text-lg text-ink/70">Kitchenware, bags, desk gear and paper goods, picked to last and delivered to your door.</p>
        <Link href="/products" className="btn mt-6">Shop all products</Link>
      </section>
      <section aria-labelledby="cats">
        <h2 id="cats" className="mb-4 text-2xl font-semibold">Shop by category</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(categories as Category[] | null)?.map((c) => (
            <Link key={c.id} href={`/products?category=${c.slug}`} className="rounded-lg border border-line bg-white p-5 hover:border-accent">
              <p className="font-semibold">{c.name}</p><p className="mt-1 text-sm text-ink/60">{c.description}</p>
            </Link>
          ))}
        </div>
      </section>
      <section aria-labelledby="feat">
        <h2 id="feat" className="mb-4 text-2xl font-semibold">Featured</h2>
        {featured?.length ? (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">{(featured as Product[]).map((p) => <ProductCard key={p.id} product={p} />)}</div>
        ) : <p className="text-ink/60">No featured products yet. Run the seed migration to add some.</p>}
      </section>
    </div>
  );
}
