import Link from "next/link";
export default function NotFound() {
  return <div className="py-16 text-center"><h1 className="mb-2 text-3xl font-bold">Page not found</h1><p className="mb-6 text-ink/70">That page doesn't exist, or you don't have access to it.</p><Link href="/products" className="btn">Back to the shop</Link></div>;
}
