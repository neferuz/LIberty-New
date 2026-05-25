import { Metadata } from "next";
import MenContent from "./MenContent";

export const metadata: Metadata = {
  title: "Мужская премиальная одежда | Коллекция Liberty Wear",
  description: "Дизайнерская мужская одежда премиум-класса от Liberty Wear. Мужские костюмы, верхняя одежда, рубашки и брюки из натуральных материалов с доставкой по Узбекистану.",
  openGraph: {
    title: "Мужская премиальная одежда | Коллекция Liberty Wear",
    description: "Дизайнерская мужская одежда премиум-класса от Liberty Wear. Мужские костюмы, верхняя одежда, рубашки и брюки из натуральных материалов.",
    url: "https://libertywear.uz/men",
    siteName: "Liberty Wear",
    locale: "ru_RU",
    type: "website",
  }
};

export default function MenCategoryPage() {
  return <MenContent />;
}
