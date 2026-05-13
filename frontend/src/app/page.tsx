import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Categories } from "@/components/sections/Categories";
import { Products } from "@/components/sections/Products";
import { Partners } from "@/components/sections/Partners";
import { Editorial } from "@/components/sections/Editorial";
import { Newsletter } from "@/components/sections/Newsletter";

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
