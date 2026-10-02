import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import Header from "@/components/layout/Header";

const sans = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-sans" });
export const metadata: Metadata = { title: "ShopEase", description: "Everyday things, well made." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body className="font-sans">
        <CartProvider>
          <Header />
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
          <footer className="mt-16 border-t border-line py-8 text-center text-sm text-ink/60">© ShopEase</footer>
        </CartProvider>
      </body>
    </html>
  );
}
