import { Metadata } from "next";
import DeliveryContent from "./DeliveryContent";

export const metadata: Metadata = {
  title: "Доставка и оплата | Liberty Wear",
  description: "Информация о способах доставки и оплаты заказов Liberty Wear по Ташкенту, регионам Узбекистана и СНГ. Условия возврата и обмена товаров.",
  openGraph: {
    title: "Доставка и оплата | Liberty Wear",
    description: "Информация о способах доставки и оплаты заказов Liberty Wear по Ташкенту, регионам Узбекистана и СНГ. Условия возврата и обмена товаров.",
    url: "https://libertywear.uz/delivery",
    siteName: "Liberty Wear",
    locale: "ru_RU",
    type: "website",
  }
};

export default function DeliveryPage() {
  return <DeliveryContent />;
}
