import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createOrder } from "@/lib/place-order";

export const dynamic = "force-dynamic";

// Used by the mobile app. Auth: "Authorization: Bearer <Supabase access token>".
// Body: { form: {...checkout fields}, items: [{ productId, quantity }] }
export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ ok: false, error: "Please sign in to place your order." }, { status: 401 });

  let body: { form?: unknown; items?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 }); }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const result = await createOrder(supabase, body.form, body.items, token);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
