import { Metadata } from "next";
import KidsContent from "./KidsContent";

export const metadata: Metadata = {
  title: "Детская премиальная одежда | Liberty Wear Kids",
  description: "Качественная и стильная детская одежда из натурального хлопка и мягких тканей от Liberty Wear. Линейка премиум-класса для мальчиков, девочек и малышей.",
  openGraph: {
    title: "Детская премиальная одежда | Liberty Wear Kids",
    description: "Качественная и стильная детская одежда из натурального хлопка и мягких тканей от Liberty Wear. Линейка премиум-класса для мальчиков, девочек и малышей.",
    url: "https://libertywear.uz/kids",
    siteName: "Liberty Wear",
    locale: "ru_RU",
    type: "website",
  }
};

export default function KidsCategoryPage() {
  return <KidsContent />;
}
