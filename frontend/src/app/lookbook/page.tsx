import { Metadata } from "next";
import LookbookContent from "./LookbookContent";

export const metadata: Metadata = {
  title: "Лукбук коллекций | Визуальная поэзия Liberty Wear",
  description: "Лукбуки и визуальные истории лимитированных коллекций Liberty Wear. Вдохновение природными текстурами, чистотой линий и гармонией премиальных тканей.",
  openGraph: {
    title: "Лукбук коллекций | Визуальная поэзия Liberty Wear",
    description: "Лукбуки и визуальные истории лимитированных коллекций Liberty Wear. Вдохновение природными текстурами, чистотой линий и гармонией премиальных тканей.",
    url: "https://libertywear.uz/lookbook",
    siteName: "Liberty Wear",
    locale: "ru_RU",
    type: "website",
  }
};

export default function LookbookPage() {
  return <LookbookContent />;
}
