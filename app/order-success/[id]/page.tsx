import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderDetail from "@/components/orders/OrderDetail";
import type { Order } from "@/types";

export const dynamic = "force-dynamic";

export default async function OrderSuccess({ params }: { params: { id: string } }) {
  const { data } = await createClient().from("orders").select("*, order_items(*)").eq("id", params.id).maybeSingle(); // RLS: own orders only
  if (!data) notFound();
  const order = data as Order;
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-mint p-6">
        <h1 className="text-3xl font-bold">Thank you, {order.customer_name.split(" ")[0]}!</h1>
        <p className="mt-1">Your order is placed. We're sending a confirmation to {order.customer_email}.</p>
      </div>
      <OrderDetail order={order} />
      <div className="flex gap-3"><Link href="/orders" className="btn">View my orders</Link><Link href="/products" className="btn-ghost">Keep shopping</Link></div>
    </div>
  );
}
