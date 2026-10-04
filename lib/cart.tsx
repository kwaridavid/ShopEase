"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type CartItem = { productId: string; slug: string; name: string; price: number; image: string | null; stock: number; quantity: number };
type Ctx = {
  items: CartItem[]; ready: boolean; count: number; subtotal: number;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  setQuantity: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};
type Row = { product_id: string; quantity: number; products: { name: string; slug: string; price: number; image_url: string | null; stock_quantity: number } | null };

const KEY = "shopease.cart.v1";
const supabase = createClient();
const CartContext = createContext<Ctx | null>(null);

function readLocal(): CartItem[] {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}

async function loadServer(uid: string): Promise<CartItem[]> {
  const { data } = await supabase
    .from("cart_items")
    .select("product_id, quantity, products(name, slug, price, image_url, stock_quantity)")
    .eq("user_id", uid)
    .order("created_at");
  return ((data ?? []) as unknown as Row[])
    .filter((r) => r.products)
    .map((r) => ({
      productId: r.product_id, slug: r.products!.slug, name: r.products!.name, price: Number(r.products!.price),
      image: r.products!.image_url, stock: r.products!.stock_quantity, quantity: Math.min(r.quantity, r.products!.stock_quantity),
    }))
    .filter((i) => i.quantity > 0);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null | undefined>(undefined); // undefined = still checking
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUserId(session?.user.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userId === undefined) return;
    if (userId === null) { setItems(readLocal()); setReady(true); return; }

    let cancelled = false;
    const refresh = async () => { const next = await loadServer(userId); if (!cancelled) setItems(next); };

    (async () => {
      // Merge a guest cart into the account cart once, right after sign-in.
      const local = readLocal();
      if (local.length) {
        const server = await loadServer(userId);
        const merged = new Map(server.map((i) => [i.productId, i.quantity]));
        for (const l of local) merged.set(l.productId, Math.min(l.stock, (merged.get(l.productId) ?? 0) + l.quantity));
        await supabase.from("cart_items").upsert(
          [...merged].filter(([, q]) => q > 0).map(([product_id, quantity]) => ({ user_id: userId, product_id, quantity })),
          { onConflict: "user_id,product_id" },
        );
        localStorage.removeItem(KEY);
      }
      await refresh();
      if (!cancelled) setReady(true);
    })();

    // Any change made on any device (mobile, another tab) arrives here.
    const channel = supabase
      .channel(`cart-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "cart_items", filter: `user_id=eq.${userId}` }, () => { refresh(); })
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [userId]);

  useEffect(() => { if (ready && userId === null) localStorage.setItem(KEY, JSON.stringify(items)); }, [items, ready, userId]);

  const add = useCallback(async (item: Omit<CartItem, "quantity">, qty = 1) => {
    const existing = itemsRef.current.find((i) => i.productId === item.productId);
    const quantity = Math.min(item.stock, (existing?.quantity ?? 0) + qty);
    if (quantity < 1) return;
    setItems((prev) => existing ? prev.map((i) => (i.productId === item.productId ? { ...i, quantity } : i)) : [...prev, { ...item, quantity }]);
    if (userId) await supabase.from("cart_items").upsert({ user_id: userId, product_id: item.productId, quantity }, { onConflict: "user_id,product_id" });
  }, [userId]);

  const setQuantity = useCallback(async (id: string, qty: number) => {
    const item = itemsRef.current.find((i) => i.productId === id);
    if (!item) return;
    const quantity = Math.max(1, Math.min(item.stock, qty));
    setItems((prev) => prev.map((i) => (i.productId === id ? { ...i, quantity } : i)));
    if (userId) await supabase.from("cart_items").update({ quantity, updated_at: new Date().toISOString() }).eq("user_id", userId).eq("product_id", id);
  }, [userId]);

  const remove = useCallback(async (id: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== id));
    if (userId) await supabase.from("cart_items").delete().eq("user_id", userId).eq("product_id", id);
  }, [userId]);

  const clear = useCallback(async () => {
    setItems([]);
    if (userId) await supabase.from("cart_items").delete().eq("user_id", userId);
  }, [userId]);

  const value = useMemo<Ctx>(() => ({
    items, ready, add, setQuantity, remove, clear,
    count: items.reduce((n, i) => n + i.quantity, 0),
    subtotal: items.reduce((n, i) => n + i.quantity * i.price, 0),
  }), [items, ready, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
