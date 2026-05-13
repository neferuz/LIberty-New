import type { Metadata, Viewport } from "next";
import { evolventa } from "@/lib/fonts";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Liberty Wear | Premium Apparel",
  description: "Experience the ultimate in style and comfort with Liberty Wear. Curated collections for the modern individual.",
};

import { ChatWidget } from "@/components/common/ChatWidget";
import { CartProvider } from "@/context/CartContext";
import { SearchProvider } from "@/context/SearchContext";
import { CartDrawer } from "@/components/common/CartDrawer";
import { SearchOverlay } from "@/components/common/SearchOverlay";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${evolventa.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-white text-blue-950 selection:bg-blue-950 selection:text-white">
        <SearchProvider>
          <CartProvider>
            {children}
            <SearchOverlay />
            <CartDrawer />
            <ChatWidget />
          </CartProvider>
        </SearchProvider>
      </body>
    </html>
  );
}
