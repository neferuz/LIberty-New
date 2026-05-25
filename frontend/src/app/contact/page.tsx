import { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Контакты | Liberty Wear — шоурум премиальной одежды",
  description: "Контакты бренда премиальной дизайнерской одежды Liberty Wear. Адрес шоурума в Ташкенте, телефоны, график работы и форма обратной связи. Напишите нам!",
  openGraph: {
    title: "Контакты | Liberty Wear — шоурум премиальной одежды",
    description: "Контакты бренда премиальной дизайнерской одежды Liberty Wear. Адрес шоурума в Ташкенте, телефоны, график работы и форма обратной связи.",
    url: "https://libertywear.uz/contact",
    siteName: "Liberty Wear",
    locale: "ru_RU",
    type: "website",
  }
};

export default function ContactPage() {
  return <ContactContent />;
}
