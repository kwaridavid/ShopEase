import type { OrderStatus } from "@/types";
const TONE: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800", CONFIRMED: "bg-mint text-emerald-800", PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-indigo-100 text-indigo-800", DELIVERED: "bg-emerald-200 text-emerald-900", CANCELLED: "bg-red-100 text-red-800",
};
export default function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[status]}`}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>;
}
