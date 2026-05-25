"use client";

import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, ArrowRight } from "lucide-react";

export default function LookbookContent() {
  const collections = [
    {
      id: 1,
      title: "Дыхание земли",
      subtitle: "Коллекция Весна-Лето 2026",
      desc: "Исследование естественных форм и глубоких природных текстур. Легкий органический лен и тончайший длинноволокнистый хлопок в мягких песочных и молочных оттенках.",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
      align: "left"
    },
    {
      id: 2,
      title: "Эстетика тени",
      subtitle: "Капсула Вечерний Минимализм",
      desc: "Строгие графичные силуэты в глубоком угольно-черном цвете. Идеальный баланс структуры, оверсайз-элементов и безупречной свободы движений.",
      image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=1200&auto=format&fit=crop",
      align: "right"
    }
  ];

  return (
    <div className="bg-white min-h-screen text-[#1a1f36] py-16 md:py-24 selection:bg-[#f3f4f6] font-sans">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1f36] hover:text-slate-400 transition-colors mb-12"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          На главную
        </Link>

        {/* Title */}
        <div className="border-b border-[#e3e8ee] pb-8 mb-16">
          <div className="flex items-center gap-3 text-slate-400 mb-4">
            <ImageIcon className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Лукбук Liberty Wear</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">Визуальная поэзия</h1>
          <p className="text-[13px] text-slate-500 font-light max-w-lg leading-relaxed">
            Наши коллекции — это история о тактильных ощущениях, чистоте линий и спокойствии, воплощенном в премиальных тканях.
          </p>
        </div>

        {/* Collections list */}
        <div className="space-y-24 md:space-y-36">
          {collections.map((col, idx) => (
            <div 
              key={col.id} 
              className={`flex flex-col md:flex-row gap-8 md:gap-16 items-center ${
                col.align === "right" ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Image box */}
              <div className="w-full md:w-3/5 aspect-[3/2] bg-slate-100 overflow-hidden relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={col.image} 
                  alt={col.title}
                  className="w-full h-full object-cover grayscale opacity-90 group-hover:scale-105 transition-transform duration-[1.5s]" 
                />
              </div>

              {/* Text box */}
              <div className="w-full md:w-2/5 space-y-6">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{col.subtitle}</span>
                  <h2 className="text-2xl md:text-3xl font-light tracking-tight mt-2 text-[#1a1f36]">{col.title}</h2>
                </div>
                <p className="text-[12px] text-slate-500 font-light leading-relaxed">
                  {col.desc}
                </p>
                <div className="pt-2">
                  <Link 
                    href="/shop" 
                    className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1a1f36] border-b border-[#1a1f36] pb-2 hover:text-slate-400 hover:border-slate-400 transition-colors"
                  >
                    Перейти к покупкам
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
