import { createClient } from "@/lib/supabase/server";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>
      <CheckoutForm defaults={{ customer_name: user?.user_metadata?.full_name ?? "", customer_email: user?.email ?? "" }} />
    </div>
  );
}
