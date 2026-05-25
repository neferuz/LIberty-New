"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/common/Button";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const slides = [
  {
    image: "/images/hero1.jpg",
    title: "Вневременной \nМинимализм",
    subtitle: "Новая Коллекция 2026",
    desc: "Откройте для себя нашу кураторскую коллекцию архитектурных силуэтов и премиальных тканей."
  },
  {
    image: "/images/hero2.jpg",
    title: "Эссенциальные \nСлои",
    subtitle: "Эдиториал Образ",
    desc: "Продуманные вещи, которые плавно переходят из сезона в сезон."
  },
  {
    image: "/images/hero3.jpg",
    title: "Искусство \nПростоты",
    subtitle: "Премиальная Одежда",
    desc: "Исключительное мастерство встречается с современным дизайном для современного человека."
  }
];

export const Hero = () => {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [isUz, setIsUz] = useState(false);

  useEffect(() => {
    const getCookie = (name: string) => {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    const cookieVal = getCookie("googtrans");
    if (cookieVal && cookieVal.includes("/uz")) {
      setIsUz(true);
    }
  }, []);

  const translateText = (text: string | undefined): string => {
    if (!text) return "";
    if (!isUz) return text;
    
    const dict: Record<string, string> = {
      // Slide 1
      "Вневременной": "Mangu",
      "Минимализм": "Minimalizm",
      "Новая Коллекция 2026": "Yangi Kolleksiya 2026",
      "Откройте для себя нашу кураторскую коллекцию архитектурных силуэтов и премиальных тканей.": "Arxitekturaviy siluetlar va premium matolardan iborat maxsus kolleksiyamizni kashf eting.",
      "В магазин": "Do'konga",
      "Лукбук": "Lukbuk",
      
      // Slide 2
      "Эссенциальные": "Asosiy",
      "Слои": "Qatlamlar",
      "Эдиториал Образ": "Editorial Ko'rinish",
      "Продуманные вещи, которые плавно переходят из сезона в сезон.": "Fasldan faslga silliq o'tadigan puxta o'ylangan kiyimlar.",
      
      // Slide 3
      "Искусство": "San'ati",
      "Простоты": "Oddiylik",
      "Премиальная Одежда": "Premium Kiyimlar",
      "Исключительное мастерство встречается с современным дизайном для современного человека.": "Zamonaviy inson uchun ajoyib mahorat zamonaviy dizayn bilan uyg'unlashadi."
    };
    
    return dict[text.trim()] || text;
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/v1/pages/home?t=${Date.now()}`);
        if (response.ok) {
          const result = await response.json();
          if (result.data && result.data.hero && result.data.hero.slides) {
            setSlides(result.data.hero.slides);
          }
        }
      } catch (err) {
        console.error("Failed to fetch home content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [current, slides.length]);

  if (loading || slides.length === 0) {
    return (
      <section className="relative h-auto min-h-[80dvh] md:h-[95vh] flex flex-col lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center pt-16 md:pt-20 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
        <div className="container mx-auto px-6 max-w-7xl flex flex-col lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center h-full w-full">
          {/* Skeleton Image on the right (matches layout) */}
          <div className="relative w-full h-[50vh] sm:h-[55vh] lg:col-span-5 lg:col-start-8 lg:h-[75vh] bg-slate-50 animate-pulse mb-4 lg:mb-0 lg:order-2 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-brand-blue/30 animate-spin" />
          </div>
          
          {/* Skeleton Text on the left (matches layout) */}
          <div className="flex flex-col justify-center lg:col-span-6 lg:order-1 animate-pulse space-y-6 md:space-y-8">
            <div className="h-4 w-32 bg-slate-100 rounded" />
            <div className="space-y-3">
              <div className="h-10 md:h-14 w-5/6 bg-slate-100 rounded" />
              <div className="h-10 md:h-14 w-2/3 bg-slate-100 rounded" />
            </div>
            <div className="space-y-2 max-w-md">
              <div className="h-4 w-full bg-slate-100 rounded" />
              <div className="h-4 w-4/5 bg-slate-100 rounded" />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="h-12 w-full sm:w-36 bg-slate-100 rounded" />
              <div className="h-12 w-full sm:w-36 bg-slate-100 rounded" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const content = slides[current];

  return (
    <section className="relative h-auto min-h-[80dvh] md:h-[95vh] flex flex-col md:flex-row items-stretch pt-16 md:pt-20 overflow-hidden bg-white">
      {/* Decorative Architectural Lines */}
      <div className="hidden sm:block absolute top-0 left-0 w-24 h-24 border-l border-t border-slate-100" />
      <div className="hidden sm:block absolute top-0 right-0 w-24 h-24 border-r border-t border-slate-100" />
      <div className="hidden sm:block absolute bottom-0 left-0 w-24 h-24 border-l border-b border-slate-100" />
      <div className="hidden sm:block absolute bottom-0 right-0 w-24 h-24 border-r border-b border-slate-100" />
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      
      <div className="container mx-auto px-6 max-w-7xl flex flex-col lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center h-full">
        {/* Image Display */}
        <div className="relative w-full h-[50vh] sm:h-[55vh] lg:h-[85%] lg:col-span-5 lg:col-start-8 bg-slate-50 overflow-hidden mb-4 lg:mb-0 lg:order-2">
           <AnimatePresence mode="wait">
             <motion.div
                key={current}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={content.imageUrl && content.imageUrl.trim() !== "" 
                    ? content.imageUrl 
                    : "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
                  }
                  alt="Liberty Wear Collection"
                  fill
                  className="object-cover object-center"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/10 to-transparent" />
              </motion.div>
           </AnimatePresence>
           
           <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
              <span className="text-[9px] font-bold text-white tracking-widest uppercase bg-brand-blue/20 backdrop-blur-md px-2 py-1 border border-white/10">
                 0{current + 1} / 0{slides.length}
              </span>
           </div>
        </div>

        {/* Content Section */}
        <div className="relative flex-1 flex flex-col justify-start lg:justify-center py-0 md:py-6 lg:col-span-6 lg:pr-8 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {content.titleThird && (
                  <span className="inline-block px-3 py-1 rounded-none bg-slate-50 border border-slate-100 text-[9px] font-bold tracking-[0.2em] uppercase mb-3 md:mb-4 text-brand-blue" translate="no">
                    {translateText(content.titleThird)}
                  </span>
                )}
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tighter text-brand-blue leading-[0.95] mb-3 md:mb-6 whitespace-pre-line" translate="no">
                  {translateText(content.titleFirst)} <br />
                  {translateText(content.titleSecond)}
                </h1>
                <p className="hidden sm:block text-sm md:text-base text-slate-500 leading-relaxed max-w-md mb-4 md:mb-6" translate="no">
                  {translateText(content.subtitle)}
                </p>
                <div className="flex flex-row gap-2 md:gap-4 mt-2 md:mt-0 w-full">
                  <Link href={content.primaryBtnHref || "/shop"} className="flex-1">
                    <Button size="lg" className="w-full group px-4 md:px-10 rounded-none text-[12px] md:text-base h-10 md:h-12" translate="no">
                      {translateText(content.primaryBtn)}
                    </Button>
                  </Link>
                  <Link href={content.secondaryBtnHref || "/lookbook"} className="flex-1">
                    <Button variant="outline" size="lg" className="w-full px-4 md:px-10 rounded-none text-[12px] md:text-base h-10 md:h-12" translate="no">
                      {translateText(content.secondaryBtn)}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider Controls */}
            {slides.length > 1 && (
              <div className="mt-6 lg:mt-10 flex items-center gap-6 md:gap-8">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={prev}
                    className="w-9 h-9 md:w-12 md:h-12 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-blue hover:border-brand-blue transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />
                  </button>
                  <button 
                    onClick={next}
                    className="w-9 h-9 md:w-12 md:h-12 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-blue hover:border-brand-blue transition-all"
                  >
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="flex gap-2">
                  {slides.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-0.5 md:h-1 transition-all duration-500 ${i === current ? "w-6 md:w-8 bg-brand-blue" : "w-1.5 md:w-2 bg-slate-200"}`} 
                    />
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </section>
  );
};
