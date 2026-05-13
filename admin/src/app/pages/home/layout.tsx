import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Главная страница (Редактор)",
};

export default function HomeEditorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
