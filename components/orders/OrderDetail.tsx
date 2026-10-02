import { money, orderRef, shortDate } from "@/lib/format";
import StatusBadge from "./StatusBadge";
import type { Order } from "@/types";

export default function OrderDetail({ order }: { order: Order }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold">{orderRef(order.id)}</h2>
        <StatusBadge status={order.status} />
        <span className="text-sm text-ink/60">Placed {shortDate(order.created_at)}</span>
      </div>
      <table className="w-full overflow-hidden rounded-lg border border-line bg-white text-sm">
        <thead className="bg-paper text-left"><tr><th className="p-3">Item</th><th className="p-3">Qty</th><th className="p-3 text-right">Price</th><th className="p-3 text-right">Total</th></tr></thead>
        <tbody>
          {order.order_items.map((i) => (
            <tr key={i.id} className="border-t border-line"><td className="p-3">{i.product_name}</td><td className="p-3">{i.quantity}</td><td className="p-3 text-right">{money(i.unit_price)}</td><td className="p-3 text-right">{money(i.subtotal)}</td></tr>
          ))}
        </tbody>
        <tfoot className="border-t border-line">
          <tr><td colSpan={3} className="p-3 text-right">Subtotal</td><td className="p-3 text-right">{money(order.subtotal)}</td></tr>
          <tr><td colSpan={3} className="p-3 text-right">Delivery</td><td className="p-3 text-right">{money(order.delivery_fee)}</td></tr>
          <tr className="font-semibold"><td colSpan={3} className="p-3 text-right">Total</td><td className="p-3 text-right">{money(order.total)}</td></tr>
        </tfoot>
      </table>
      <div className="rounded-lg border border-line bg-white p-4 text-sm">
        <h3 className="mb-1 font-semibold">Delivery</h3>
        <p>{order.customer_name}<br />{order.delivery_address}<br />{order.city}, {order.state}, {order.country}<br />{order.phone}</p>
      </div>
    </div>
  );
}
