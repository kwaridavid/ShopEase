"use server";
import { createClient } from "@/lib/supabase/server";
import { createOrder } from "@/lib/place-order";

export async function placeOrder(rawForm: unknown, rawLines: unknown) {
  return createOrder(createClient(), rawForm, rawLines);
}
