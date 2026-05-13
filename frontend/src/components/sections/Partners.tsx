"use client";

import { useState, useEffect } from "react";

export const Partners = () => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/pages/home");
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

  if (loading && !content) return null;

  return (
    <section className="pt-4 pb-12 md:py-24 bg-slate-50 border-y border-slate-100 overflow-hidden relative shadow-none">
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none" />
      
      <div className="container mx-auto px-6 max-w-7xl mb-8 md:mb-16 text-center">
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
