import { Metadata } from "next";
import WomenContent from "./WomenContent";

export const metadata: Metadata = {
  title: "Женская премиальная одежда | Коллекция Liberty Wear",
  description: "Коллекция премиальной женской одежды от дизайнерского бренда Liberty Wear. Стильные костюмы, трикотаж, рубашки и аксессуары высокого качества в Ташкенте.",
  openGraph: {
    title: "Женская премиальная одежда | Коллекция Liberty Wear",
    description: "Коллекция премиальной женской одежды от дизайнерского бренда Liberty Wear. Стильные костюмы, трикотаж, рубашки и аксессуары высокого качества.",
    url: "https://libertywear.uz/women",
    siteName: "Liberty Wear",
    locale: "ru_RU",
    type: "website",
  }
};

export default function WomenCategoryPage() {
  return <WomenContent />;
}
