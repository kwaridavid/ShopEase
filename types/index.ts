export type Category = { id: string; name: string; slug: string; description: string | null; image_url: string | null };
export type Product = {
  id: string; category_id: string | null; name: string; slug: string; description: string | null; price: number;
  image_url: string | null; stock_quantity: number; is_featured: boolean; is_active: boolean;
};
export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type OrderItem = { id: string; order_id: string; product_id: string; product_name: string; quantity: number; unit_price: number; subtotal: number };
export type Order = {
  id: string; user_id: string; customer_name: string; customer_email: string; phone: string; delivery_address: string;
  city: string; state: string; country: string; subtotal: number; delivery_fee: number; total: number; status: OrderStatus;
  created_at: string; order_items: OrderItem[];
};
