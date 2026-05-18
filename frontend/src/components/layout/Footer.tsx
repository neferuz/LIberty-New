"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Globe, Share2, Send } from "lucide-react";

export const Footer = () => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/v1/pages/settings?t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) setSettings(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const company = settings?.company || {
    name: "ООО «Халса» (Halsa)",
    inn: "7728483490",
    ogrn: "1197746509113",
    address: "117 418, Черёмушки, ул. Зюзинская, д. 6, к. 2",
    phone: "+998 90 123 45 67",
    email: "info@libertywear.uz"
  };

  const footer = settings?.footer || {
    brandText: "LIBERTYWEAR",
    sections: [
      {
        title: "Магазин",
        links: [
          { label: "Новинки", href: "/shop" },
          { label: "Бестселлеры", href: "/shop" },
          { label: "Коллекции", href: "/collections" }
        ]
      },
      {
        title: "Компания",
        links: [
          { label: "Наша история", href: "/about" },
          { label: "Устойчивое развитие", href: "/about" },
          { label: "Журнал", href: "/blog" }
        ]
      }
    ],
    disclaimer: "Все рекомендации не носят предписательного характера. Размещённые на сайте продукты не являются лекарственными средствами. Halsa не осуществляет медицинскую деятельность и не оказывает медицинские услуги.",
    copyright: "© 2018 — 2026 ООО «Халса». Содержимое Сайта является интеллектуальной собственностью. Копирование и использование запрещено."
  };

  const legalLinks = settings?.legalLinks || [
    { label: "Политика конфиденциальности", href: "/privacy" },
    { label: "Условия использования", href: "/terms" }
  ];

  return (
    <footer className="bg-brand-blue text-white pt-4 pb-12 md:py-12 border-t border-white/5">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="text-xl md:text-2xl font-bold tracking-tighter text-white notranslate" translate="no">
              {footer.brandText.includes('LIBERTY') ? (
                <>LIBERTY<span className="text-slate-400">WEAR</span></>
              ) : footer.brandText}
            </Link>
            <div className="space-y-1">
              <p className="text-[9px] md:text-[10px] text-slate-500 tracking-widest uppercase">{company.name}</p>
              <p className="text-[9px] md:text-[10px] text-slate-500 tracking-widest uppercase">ИНН: {company.inn} | ОГРН: {company.ogrn}</p>
            </div>
            <div className="flex gap-3 pt-1">
              <Link href="#" className="w-8 h-8 border border-white/10 flex items-center justify-center hover:bg-white hover:text-brand-blue transition-all">
                <Globe className="w-3.5 h-3.5" />
              </Link>
              <Link href="#" className="w-8 h-8 border border-white/10 flex items-center justify-center hover:bg-white hover:text-brand-blue transition-all">
                <Share2 className="w-3.5 h-3.5" />
              </Link>
              <Link href="#" className="w-8 h-8 border border-white/10 flex items-center justify-center hover:bg-white hover:text-brand-blue transition-all">
                <Send className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          
          {/* Quick Links Container */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4">
            {footer.sections.map((section: any, idx: number) => (
              <div key={idx}>
                <h4 className="font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em] mb-3 md:mb-4 text-white">{section.title}</h4>
                <ul className="space-y-2 text-[9px] md:text-[10px] text-slate-400 uppercase">
                  {section.links.map((link: any, lIdx: number) => (
                    <li key={lIdx}><Link href={link.href} className="hover:text-white transition-colors">{link.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Info */}
          <div className="md:col-span-4 space-y-3 md:space-y-4">
            <h4 className="font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em] mb-3 md:mb-4 text-white">Контакты</h4>
            <ul className="space-y-2 text-[9px] md:text-[10px] text-slate-400 uppercase">
              <li className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-slate-500" strokeWidth={1.5} />
                <a href={`tel:${company.phone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">{company.phone}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-slate-500" strokeWidth={1.5} />
                <a href={`mailto:${company.email}`} className="hover:text-white transition-colors">{company.email}</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3 h-3 text-slate-500 mt-0.5" strokeWidth={1.5} />
                <span className="leading-tight lowercase">{company.address}</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Legal Disclaimers */}
        <div className="mt-8 pt-6 border-t border-white/5 text-[8px] text-slate-500 leading-tight">
          <p className="mb-2 max-w-3xl">
            {footer.disclaimer}
          </p>
          <p className="opacity-60">
            {footer.copyright}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[8px] md:text-[9px] text-slate-500 uppercase tracking-widest">
          <div className="flex gap-6">
            {legalLinks.map((link: any, idx: number) => (
              <Link key={idx} href={link.href} className="hover:text-white transition-colors">{link.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
