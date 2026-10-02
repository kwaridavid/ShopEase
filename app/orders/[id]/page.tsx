import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderDetail from "@/components/orders/OrderDetail";
import type { Order } from "@/types";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: { id: string } }) {
  const { data } = await createClient().from("orders").select("*, order_items(*)").eq("id", params.id).maybeSingle(); // RLS: own orders only
  if (!data) notFound();
  return <div className="space-y-4"><Link href="/orders" className="text-sm underline">← All orders</Link><OrderDetail order={data as Order} /></div>;
}
