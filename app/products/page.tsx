import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/products/ProductCard";
import type { Category, Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function Products({ searchParams }: { searchParams: { q?: string; category?: string } }) {
  const supabase = createClient();
  const q = searchParams.q?.trim().replace(/[%,()]/g, "") ?? "";
  const { data: categories } = await supabase.from("categories").select("*").order("name");
  const cat = (categories as Category[] | null)?.find((c) => c.slug === searchParams.category);

  let query = supabase.from("products").select("*").order("name");
  if (q) query = query.ilike("name", `%${q}%`);
  if (cat) query = query.eq("category_id", cat.id);
  const { data: products, error } = await query;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">{cat ? cat.name : "All products"}</h1>
      <form className="mb-6 flex flex-wrap gap-3" role="search">
        <label htmlFor="q" className="sr-only">Search products</label>
        <input id="q" name="q" defaultValue={q} placeholder="Search products" className="field max-w-xs" />
        <label htmlFor="category" className="sr-only">Category</label>
        <select id="category" name="category" defaultValue={cat?.slug ?? ""} className="field max-w-[200px]">
          <option value="">All categories</option>
          {(categories as Category[] | null)?.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <button className="btn">Search</button>
        {(q || cat) && <Link href="/products" className="btn-ghost">Clear</Link>}
      </form>
      {error && <p className="err">We couldn't load products. Please refresh the page.</p>}
      {products?.length ? (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">{(products as Product[]).map((p) => <ProductCard key={p.id} product={p} />)}</div>
      ) : !error && <p className="text-ink/60">No products match your search. Try a different word or clear the filters.</p>}
    </div>
  );
}
