"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { placeOrder } from "@/actions/checkout";
import { useCart } from "@/lib/cart";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation";
import { deliveryFee, money } from "@/lib/format";

const FIELDS: { name: keyof CheckoutInput; label: string; type?: string; auto: string }[] = [
  { name: "customer_name", label: "Full name", auto: "name" },
  { name: "customer_email", label: "Email", type: "email", auto: "email" },
  { name: "phone", label: "Phone", type: "tel", auto: "tel" },
  { name: "delivery_address", label: "Delivery address", auto: "street-address" },
  { name: "city", label: "City", auto: "address-level2" },
  { name: "state", label: "State", auto: "address-level1" },
  { name: "country", label: "Country", auto: "country-name" },
];

export default function CheckoutForm({ defaults }: { defaults: Partial<CheckoutInput> }) {
  const router = useRouter();
  const { items, ready, subtotal, clear } = useCart();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutInput>({ resolver: zodResolver(checkoutSchema), defaultValues: defaults });

  if (!ready) return <p className="text-ink/60">Loading…</p>;
  if (items.length === 0)
    return <div className="rounded-lg border border-dashed border-line p-10 text-center"><p className="mb-4">Your cart is empty.</p><Link href="/products" className="btn">Browse products</Link></div>;

  const fee = deliveryFee(subtotal);
  const onSubmit = (values: CheckoutInput) => {
    setServerError(null);
    start(async () => {
      const res = await placeOrder(values, items.map((i) => ({ productId: i.productId, quantity: i.quantity })));
      if (!res.ok) { setServerError(res.error); return; }
      clear(); // only after the order exists
      router.push(`/order-success/${res.orderId}`);
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 rounded-lg border border-line bg-white p-5 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.name} className={f.name === "delivery_address" ? "sm:col-span-2" : ""}>
            <label htmlFor={f.name} className="label">{f.label}</label>
            <input id={f.name} type={f.type ?? "text"} autoComplete={f.auto} className="field" aria-invalid={!!errors[f.name]} {...register(f.name)} />
            {errors[f.name] && <p className="err" role="alert">{errors[f.name]?.message}</p>}
          </div>
        ))}
        {serverError && <p className="err sm:col-span-2" role="alert">{serverError}</p>}
        <div className="sm:col-span-2"><button className="btn w-full sm:w-auto" disabled={pending}>{pending ? "Placing order…" : "Place order"}</button></div>
      </form>
      <aside className="h-fit rounded-lg border border-line bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold">Order summary</h2>
        <ul className="space-y-2 text-sm">
          {items.map((i) => <li key={i.productId} className="flex justify-between gap-3"><span>{i.name} × {i.quantity}</span><span>{money(i.price * i.quantity)}</span></li>)}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Delivery</dt><dd>{fee === 0 ? "Free" : money(fee)}</dd></div>
          <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd>{money(subtotal + fee)}</dd></div>
        </dl>
        <p className="mt-3 text-xs text-ink/60">Final prices and stock are confirmed when you place the order.</p>
      </aside>
    </div>
  );
}
