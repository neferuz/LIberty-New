import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Чаты и Сообщения",
};

export default function ChatsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
