import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendOrderConfirmation } from "@/lib/mailgun";
import { cartLinesSchema, checkoutSchema } from "@/lib/validation";
import type { Order } from "@/types";

export type PlaceOrderResult = { ok: true; orderId: string; emailSent: boolean } | { ok: false; error: string };

/** One implementation for every client. `jwt` is passed when the caller sent a Bearer token (mobile). */
export async function createOrder(supabase: SupabaseClient, rawForm: unknown, rawLines: unknown, jwt?: string): Promise<PlaceOrderResult> {
  const form = checkoutSchema.safeParse(rawForm);
  if (!form.success) return { ok: false, error: form.error.issues[0].message };
  const lines = cartLinesSchema.safeParse(rawLines);
  if (!lines.success) return { ok: false, error: lines.error.issues[0].message };

  const { data: { user } } = await supabase.auth.getUser(jwt);
  if (!user) return { ok: false, error: "Please sign in to place your order." };

  const f = form.data;
  const { data: orderId, error } = await supabase.rpc("place_order", {
    p_items: lines.data.map((l) => ({ product_id: l.productId, quantity: l.quantity })),
    p_name: f.customer_name, p_email: f.customer_email, p_phone: f.phone,
    p_address: f.delivery_address, p_city: f.city, p_state: f.state, p_country: f.country,
  });
  if (error || !orderId) return { ok: false, error: error?.message || "We couldn't place your order. Please try again." };

  let emailSent = false;
  try {
    const { data: order } = await supabase.from("orders").select("*, order_items(*)").eq("id", orderId).single();
    if (order) emailSent = await sendOrderConfirmation(order as Order);
  } catch (err) {
    console.error("[checkout] Confirmation email step failed:", err);
  }
  return { ok: true, orderId: orderId as string, emailSent };
}
