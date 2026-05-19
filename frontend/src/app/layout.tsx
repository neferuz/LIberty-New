import type { Metadata, Viewport } from "next";
import { evolventa } from "@/lib/fonts";
import Script from "next/script";
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
import { ScrollToTop } from "@/components/common/ScrollToTop";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${evolventa.variable}`}>
      <body className="font-sans antialiased bg-white text-brand-blue selection:bg-brand-blue selection:text-white">
        {/* Hidden Google Translate element */}
        <div 
          id="google_translate_element" 
          style={{ 
            position: "absolute", 
            opacity: 0, 
            width: 0, 
            height: 0, 
            overflow: "hidden", 
            pointerEvents: "none" 
          }} 
        />
        
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            window.googleTranslateElementInit = function() {
              new google.translate.TranslateElement({
                pageLanguage: 'ru',
                includedLanguages: 'ru,uz',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />

        <SearchProvider>
          <CartProvider>
            <ScrollToTop />
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
