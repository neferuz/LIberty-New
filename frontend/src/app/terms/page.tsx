import { Metadata } from "next";
import TermsContent from "./TermsContent";

export const metadata: Metadata = {
  title: "Условия использования | Liberty Wear",
  description: "Пользовательское соглашение и условия использования интернет-магазина Liberty Wear. Правила оформления заказов, покупки и интеллектуальные права бренда.",
  openGraph: {
    title: "Условия использования | Liberty Wear",
    description: "Пользовательское соглашение и условия использования интернет-магазина Liberty Wear. Правила оформления заказов, покупки и интеллектуальные права бренда.",
    url: "https://libertywear.uz/terms",
    siteName: "Liberty Wear",
    locale: "ru_RU",
    type: "website",
  }
};

export default function TermsPage() {
  return <TermsContent />;
}
