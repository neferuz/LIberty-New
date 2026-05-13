"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RefreshCw, ImageIcon } from "lucide-react";

interface Category {
  id: string;
  name: string;
  count: number;
  image?: string | null;
}

export const Categories = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, pageRes] = await Promise.all([
          fetch("http://localhost:8000/api/v1/products/categories"),
          fetch("http://localhost:8000/api/v1/pages/home")
        ]);
        
        if (catRes.ok) setCategories(await catRes.json());
        if (pageRes.ok) {
          const data = await pageRes.json();
          setContent(data.data.categories);
        }
      } catch (err) {
        console.error("Failed to fetch categories data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="py-16 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  const data = content || {
    title: "Наши Коллекции.",
    description: "Мы верим в качество, а не в количество. Каждое изделие тщательно разработано, чтобы обеспечить идеальный баланс комфорта и изысканности."
  };

  return (
    <section className="pt-4 pb-16 md:py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Mobile Header */}
        <div className="flex md:hidden flex-col mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold tracking-tight text-brand-blue uppercase">{data.title}</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => scroll("left")}
                className="w-9 h-9 border border-slate-200 flex items-center justify-center text-slate-400 active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button 
                onClick={() => scroll("right")}
                className="w-9 h-9 border border-slate-200 flex items-center justify-center text-slate-400 active:scale-95"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            {data.description}
          </p>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex flex-row justify-between items-end mb-10 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-brand-blue uppercase">{data.title}</h2>
            <p className="text-slate-500 text-base">{data.description}</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => scroll("left")}
              className="w-10 h-10 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-blue hover:border-brand-blue transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => scroll("right")}
              className="w-10 h-10 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-blue hover:border-brand-blue transition-all active:scale-95"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              href={`/shop?category=${cat.id}`}
              className="min-w-[60%] md:min-w-[22%] group snap-start cursor-pointer"
            >
              <div className="relative aspect-[4/5] mb-3 md:mb-4 overflow-hidden bg-slate-50">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#f7f8f9] text-slate-300 gap-2">
                     <ImageIcon className="w-6 h-6 opacity-40" />
                     <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Нет фото</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-brand-blue/0 group-hover:bg-brand-blue/10 transition-colors duration-500" />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base md:text-lg font-bold text-brand-blue mb-0.5 uppercase tracking-tight">{cat.name}</h3>
                  <p className="text-slate-400 text-[9px] md:text-[10px] font-medium tracking-widest uppercase">{cat.count} товаров</p>
                </div>
                <div className="w-5 h-5 md:w-6 md:h-6 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-brand-blue group-hover:border-brand-blue transition-all">
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
