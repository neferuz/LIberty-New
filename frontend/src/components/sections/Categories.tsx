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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as any, // easeOutExpo
    },
  },
};

export const Categories = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, pageRes] = await Promise.all([
          fetch(`/api/v1/products/categories?t=${Date.now()}`),
          fetch(`/api/v1/pages/home?t=${Date.now()}`)
        ]);
        
        if (catRes.ok) {
          const allCats = await catRes.json();
          const rootCats = allCats.filter((c: any) => !c.parent_id);
          setCategories(rootCats);
        }
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
      <section className="pt-10 pb-8 md:py-10 bg-white overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
        <div className="container mx-auto px-6 max-w-7xl relative z-10 animate-pulse">
          {/* Header Skeleton */}
          <div className="max-w-2xl space-y-4 mb-10">
            <div className="h-8 md:h-10 w-1/3 bg-slate-100 rounded" />
            <div className="h-4 w-2/3 bg-slate-100 rounded" />
          </div>
          
          {/* Cards Horizontal Grid */}
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[60%] md:min-w-[23%] space-y-4">
                <div className="aspect-[4/5] bg-slate-50 rounded flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full border border-slate-200 border-t-brand-blue/30 animate-spin" />
                </div>
                <div className="h-4 w-1/2 bg-slate-100 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const data = content || {
    title: "Наши Коллекции.",
    description: "Мы верим в качество, а не в количество. Каждое изделие тщательно разработано, чтобы обеспечить идеальный баланс комфорта и изысканности."
  };

  return (
    <section className="pt-10 pb-8 md:py-10 bg-white overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        {/* Mobile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex md:hidden flex-col mb-8"
        >
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
        </motion.div>

        {/* Desktop Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="hidden md:flex flex-row justify-between items-end mb-10 gap-8"
        >
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
        </motion.div>

        <motion.div 
          ref={scrollRef}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((cat) => (
            <motion.div 
              variants={itemVariants}
              key={cat.id} 
              className="min-w-[60%] md:min-w-[22%] snap-start"
            >
              <Link 
                href={`/shop?category=${cat.id}`}
                className="group cursor-pointer block"
              >
                <div className="relative aspect-[4/5] mb-3 md:mb-4 overflow-hidden bg-slate-50">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-contain transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#f7f8f9] text-slate-300 gap-2">
                       <ImageIcon className="w-6 h-6 opacity-40" />
                       <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Нет фото</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-brand-blue/0 group-hover:bg-brand-blue/5 transition-colors duration-500" />
                  {/* Elegant internal luxury frame overlay */}
                  <div className="absolute inset-2 border border-white/0 group-hover:border-white/20 transition-all duration-700 pointer-events-none z-10 scale-95 group-hover:scale-100" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-brand-blue mb-0.5 uppercase tracking-tight group-hover:text-slate-400 transition-colors">{cat.name}</h3>
                    <p className="text-slate-400 text-[9px] md:text-[10px] font-medium tracking-widest uppercase">{cat.count} товаров</p>
                  </div>
                  <div className="w-5 h-5 md:w-6 md:h-6 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-brand-blue group-hover:border-brand-blue transition-all">
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
