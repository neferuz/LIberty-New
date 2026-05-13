import type { Metadata } from "next";
import { evolventa } from "@/lib/fonts";
import AdminShell from "@/components/layout/AdminShell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Liberty Wear Admin",
    default: "Панель управления | Liberty Wear Admin",
  },
  description: "Система управления магазином Liberty Wear",
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={evolventa.variable}>
      <body className="antialiased font-evolventa bg-white text-[#1a1f36]">
        <AdminShell>
          {children}
        </AdminShell>
      </body>
    </html>
  );
}
