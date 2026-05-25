import { Metadata } from "next";
import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = {
  title: "Политика конфиденциальности | Liberty Wear",
  description: "Политика обработки и защиты персональных данных пользователей интернет-магазина Liberty Wear. Мы гарантируем конфиденциальность вашей информации.",
  openGraph: {
    title: "Политика конфиденциальности | Liberty Wear",
    description: "Политика обработки и защиты персональных данных пользователей интернет-магазина Liberty Wear. Мы гарантируем конфиденциальность вашей информации.",
    url: "https://libertywear.uz/privacy",
    siteName: "Liberty Wear",
    locale: "ru_RU",
    type: "website",
  }
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
