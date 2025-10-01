import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";

export const metadata: Metadata = {
  title: "مراكش - Maraksh Restaurant",
  description: "تجربة قهوة استثنائية في قلب المدينة المنورة",
};

// Force all routes under this layout to be dynamically rendered (SSR)
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
