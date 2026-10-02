import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CartLink from "@/components/cart/CartLink";
import SignInButton from "@/components/layout/SignInButton";

export default async function Header() {
  const { data: { user } } = await createClient().auth.getUser();
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/95 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="text-xl font-bold tracking-tight">ShopEase</Link>
        <Link href="/products" className="text-sm hover:text-accent">Shop</Link>
        {user && <Link href="/orders" className="text-sm hover:text-accent">My orders</Link>}
        <div className="ml-auto flex items-center gap-3">
          <CartLink />
          {user ? (
            <Link href="/profile" className="btn-ghost">{user.user_metadata?.full_name?.split(" ")[0] ?? "Profile"}</Link>
          ) : (
            <SignInButton compact />
          )}
        </div>
      </nav>
    </header>
  );
}
