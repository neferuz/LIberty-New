import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Categories } from "@/components/sections/Categories";
import { Products } from "@/components/sections/Products";
import { Partners } from "@/components/sections/Partners";
import { Editorial } from "@/components/sections/Editorial";
import { Newsletter } from "@/components/sections/Newsletter";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liberty Wear | Премиальная одежда в Узбекистане",
  description: "Liberty Wear — бренд дизайнерской премиальной одежды. Уникальный крой, сертифицированный хлопок, кашемир и шерсть мериноса. Доставка по Ташкенту и всему Узбекистану.",
  openGraph: {
    title: "Liberty Wear | Премиальная одежда в Узбекистане",
    description: "Liberty Wear — бренд дизайнерской премиальной одежды. Уникальный крой, сертифицированный хлопок, кашемир и шерсть мериноса.",
    url: "https://libertywear.uz",
    siteName: "Liberty Wear",
    locale: "ru_RU",
    type: "website",
  }
};

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <Header />
      <main>
        <Hero />
        <Categories />
        <Products />
        <Editorial />
        <Partners />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
