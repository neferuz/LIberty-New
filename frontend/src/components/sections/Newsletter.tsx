"use client";

import { Button } from "@/components/common/Button";
import { useState, useEffect } from "react";

export const Newsletter = () => {
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/pages/home");
        if (res.ok) {
          const data = await res.json();
          setContent(data.data.newsletter);
        }
      } catch (err) {
        console.error("Failed to fetch newsletter content:", err);
      }
    };
    fetchContent();
  }, []);

  const data = content || {
    title: "Будьте в курсе.",
    description: "Подпишитесь, чтобы первыми получать доступ к новым коллекциям, историям бренда и эксклюзивным мероприятиям."
  };

  return (
    <section className="pt-4 pb-16 md:py-24 bg-brand-blue text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-left">
            <h2 className="text-2xl md:text-5xl font-bold tracking-tight uppercase mb-3 md:mb-6">{data.title}</h2>
            <p className="text-slate-400 text-xs md:text-lg max-w-xl leading-relaxed">
              {data.description}
            </p>
          </div>
          
          <div className="w-full">
            <form className="flex flex-row gap-0 max-w-xl lg:ml-auto">
              <input 
                type="email" 
                placeholder="ВВЕДИТЕ ВАШ EMAIL" 
                className="flex-1 min-w-0 bg-transparent border border-white/20 px-3 md:px-6 py-4 text-[10px] md:text-sm tracking-widest uppercase focus:outline-none focus:border-white transition-colors h-12 md:h-14"
              />
              <Button className="rounded-none px-4 md:px-10 h-12 md:h-14 bg-white text-brand-blue hover:bg-slate-200 uppercase tracking-widest font-bold text-[10px] md:text-xs flex-shrink-0">
                Подписаться
              </Button>
            </form>
            <p className="mt-3 text-[8px] md:text-[10px] text-slate-500 uppercase tracking-widest text-left lg:text-right">
              Подписываясь, вы соглашаетесь с нашей Политикой конфиденциальности.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
