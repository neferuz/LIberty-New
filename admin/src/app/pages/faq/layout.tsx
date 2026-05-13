import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вопросы и ответы (FAQ)",
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
