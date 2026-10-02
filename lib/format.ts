const currency = process.env.NEXT_PUBLIC_CURRENCY || "USD";
export const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);

// Display-only estimate. The authoritative rule lives in the place_order() SQL function.
export const FREE_DELIVERY_OVER = 100;
export const DELIVERY_FEE = 5;
export const deliveryFee = (subtotal: number) => (subtotal >= FREE_DELIVERY_OVER || subtotal === 0 ? 0 : DELIVERY_FEE);

export const orderRef = (id: string) => `SE-${id.slice(0, 8).toUpperCase()}`;
export const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
