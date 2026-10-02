import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/orders/StatusBadge";
import { money, orderRef, shortDate } from "@/lib/format";
import type { Order } from "@/types";

export const dynamic = "force-dynamic";

export default async function Orders() {
  const { data } = await createClient().from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
  const orders = (data ?? []) as Order[];
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">My orders</h1>
      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line p-10 text-center"><p className="mb-4">You haven't placed any orders yet.</p><Link href="/products" className="btn">Start shopping</Link></div>
      ) : (
        <ul className="divide-y divide-line rounded-lg border border-line bg-white">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-paper">
                <div><p className="font-semibold">{orderRef(o.id)}</p><p className="text-sm text-ink/60">{shortDate(o.created_at)} · {o.order_items.reduce((n, i) => n + i.quantity, 0)} items</p></div>
                <StatusBadge status={o.status} /><p className="font-semibold">{money(o.total)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
