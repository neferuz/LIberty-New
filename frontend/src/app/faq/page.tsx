import { Metadata } from "next";
import FaqContent from "./FaqContent";

export const metadata: Metadata = {
  title: "Часто задаваемые вопросы (FAQ) | Поддержка Liberty Wear",
  description: "Ответы на популярные вопросы покупателей интернет-магазина Liberty Wear: информация о размерах, материалах, заказах, доставке и обслуживании.",
  openGraph: {
    title: "Часто задаваемые вопросы (FAQ) | Поддержка Liberty Wear",
    description: "Ответы на популярные вопросы покупателей интернет-магазина Liberty Wear: информация о размерах, материалах, заказах, доставке и обслуживании.",
    url: "https://libertywear.uz/faq",
    siteName: "Liberty Wear",
    locale: "ru_RU",
    type: "website",
  }
};

export default function FAQPage() {
  return <FaqContent />;
}
