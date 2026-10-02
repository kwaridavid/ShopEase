import "server-only";
import { money, orderRef } from "@/lib/format";
import type { Order } from "@/types";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

/** Returns true when Mailgun accepted the message. Never throws. */
export async function sendOrderConfirmation(order: Order): Promise<boolean> {
  const { MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM_EMAIL } = process.env;
  const base = process.env.MAILGUN_API_BASE || "https://api.mailgun.net";
  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN || !MAILGUN_FROM_EMAIL) {
    console.error("[mailgun] Missing MAILGUN_* environment variables; skipping email.");
    return false;
  }
  const ref = orderRef(order.id);
  const rows = order.order_items
    .map((i) => `<tr><td style="padding:6px 0">${esc(i.product_name)} × ${i.quantity}</td><td align="right">${money(i.subtotal)}</td></tr>`)
    .join("");
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1B1F23">
    <h2>Thanks for your order, ${esc(order.customer_name)}!</h2>
    <p>Your order <strong>${ref}</strong> is confirmed.</p>
    <table width="100%" style="border-collapse:collapse">${rows}
      <tr><td style="padding-top:10px;border-top:1px solid #ddd">Delivery</td><td align="right" style="border-top:1px solid #ddd">${money(order.delivery_fee)}</td></tr>
      <tr><td><strong>Total</strong></td><td align="right"><strong>${money(order.total)}</strong></td></tr></table>
    <h3>Delivering to</h3>
    <p>${esc(order.delivery_address)}<br>${esc(order.city)}, ${esc(order.state)}<br>${esc(order.country)}<br>${esc(order.phone)}</p>
    <p style="color:#666;font-size:12px">ShopEase</p></div>`;
  const text = `Thanks for your order, ${order.customer_name}!\nOrder ${ref}\n\n` +
    order.order_items.map((i) => `${i.product_name} x ${i.quantity}  ${money(i.subtotal)}`).join("\n") +
    `\n\nDelivery: ${money(order.delivery_fee)}\nTotal: ${money(order.total)}\n\nDelivering to:\n${order.delivery_address}, ${order.city}, ${order.state}, ${order.country}`;

  try {
    const body = new URLSearchParams({ from: MAILGUN_FROM_EMAIL, to: order.customer_email, subject: `ShopEase order ${ref} confirmed`, text, html });
    const res = await fetch(`${base}/v3/${MAILGUN_DOMAIN}/messages`, {
      method: "POST",
      headers: { Authorization: "Basic " + Buffer.from(`api:${MAILGUN_API_KEY}`).toString("base64") },
      body,
    });
    if (!res.ok) { console.error("[mailgun] Send failed:", res.status, await res.text()); return false; }
    return true;
  } catch (err) {
    console.error("[mailgun] Send error:", err);
    return false;
  }
}
