import { Metadata } from "next";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "О нас | Liberty Wear",
  description: "Узнайте больше о философии бренда Liberty Wear, уникальном архитектурном крое, материалах премиального качества и принципах устойчивого производства.",
  openGraph: {
    title: "О нас | Liberty Wear",
    description: "Философия бренда Liberty Wear, уникальный архитектурный крой, материалы премиального качества и принципы устойчивого производства.",
    url: "https://libertywear.uz/about",
    siteName: "Liberty Wear",
    locale: "ru_RU",
    type: "website",
  }
};

export default function AboutPage() {
  return <AboutContent />;
}
