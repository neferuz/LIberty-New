import { Metadata } from "next";
import { Suspense } from "react";
import ShopContent from "./ShopContent";

export const metadata: Metadata = {
  title: "Каталог премиальной одежды | Liberty Wear",
  description: "Официальный каталог дизайнерской одежды Liberty Wear в Узбекистане. Купить премиальные костюмы, верхнюю одежду, трикотаж из натуральных тканей. Доставка по всей стране.",
  openGraph: {
    title: "Каталог премиальной одежды | Liberty Wear",
    description: "Официальный каталог дизайнерской одежды Liberty Wear в Узбекистане. Купить премиальные костюмы, верхнюю одежду, трикотаж из натуральных тканей.",
    url: "https://libertywear.uz/shop",
    siteName: "Liberty Wear",
    locale: "ru_RU",
    type: "website",
  }
};

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-slate-100 border-t-brand-blue animate-spin" />
            <span className="text-[10px] font-bold tracking-widest text-brand-blue uppercase select-none">L</span>
          </div>
          <span className="text-[8px] font-bold tracking-[0.4em] text-brand-blue/40 uppercase animate-pulse select-none">Liberty</span>
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
