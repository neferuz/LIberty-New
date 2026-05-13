import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "О компании",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
