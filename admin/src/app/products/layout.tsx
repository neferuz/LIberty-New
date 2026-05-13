import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Каталог товаров",
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
