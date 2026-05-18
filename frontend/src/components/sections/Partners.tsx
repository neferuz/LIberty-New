"use client";

import { useState, useEffect } from "react";

export const Partners = () => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/v1/pages/home?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setContent(data.data.press);
        }
      } catch (err) {
        console.error("Failed to fetch press content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const data = content || {
    title: "О нас пишут.",
    description: "Наш бренд представлен в ведущих мировых модных изданиях и журналах о роскошном образе жизни.",
    brands: ["VOGUE", "HARPER'S BAZAAR", "ELLE", "TATLER", "GQ", "L'OFFICIEL"]
  };

  if (loading && !content) {
    return (
      <section className="pt-2 pb-8 md:py-10 bg-slate-50 border-y border-slate-100 overflow-hidden relative shadow-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
        <div className="container mx-auto px-6 max-w-7xl relative z-10 animate-pulse flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-md space-y-3">
            <div className="h-6 w-32 bg-slate-200/60 rounded" />
            <div className="h-4 w-64 bg-slate-200/60 rounded" />
          </div>
          <div className="flex flex-wrap items-center gap-x-12 gap-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-5 w-20 bg-slate-200/60 rounded" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-2 pb-8 md:py-10 bg-slate-50 border-y border-slate-100 overflow-hidden relative shadow-none">
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none" />
      
      <div className="container mx-auto px-6 max-w-7xl mb-4 md:mb-6 text-center">
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-brand-blue uppercase mb-3">{data.title}</h2>
        <p className="text-xs md:text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
          {data.description}
        </p>
      </div>
      
      <div className="relative flex">
        {/* Infinite Marquee */}
        <div className="flex animate-marquee whitespace-nowrap gap-12 md:gap-24 items-center">
          {[...data.brands, ...data.brands, ...data.brands].map((partner, i) => (
            <span 
              key={i} 
              className="text-xl md:text-4xl font-bold tracking-tighter text-brand-blue/20 hover:text-brand-blue/50 transition-colors cursor-default"
            >
              {partner}
            </span>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </section>
  );
};
