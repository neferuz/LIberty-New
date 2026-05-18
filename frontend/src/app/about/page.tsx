"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import Image from "next/image";

interface AboutData {
  hero: { title: string; subtitle: string };
  philosophy: { 
    overline: string; 
    title: string; 
    description: string; 
    stats: { value: string; label: string }[] 
  };
  craftsmanship: { 
    overline: string; 
    title: string; 
    cards: { title: string; desc: string }[] 
  };
  visualStory: { title: string };
  cta: { title: string };
}

export default function AboutPage() {
  const [data, setData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/pages/about?t=${Date.now()}`)
      .then(res => res.json())
      .then(json => {
        setData(json.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch About data:", err);
        setLoading(false);
      });
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "easeOut" } as const
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-32 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
          <div className="container mx-auto px-6 max-w-7xl relative z-10 animate-pulse">
            {/* Hero Section Skeleton */}
            <section className="mb-24 mt-12 text-center space-y-6">
              <div className="h-16 md:h-24 w-3/4 md:w-2/3 bg-slate-100 rounded mx-auto" />
              <div className="h-4 w-1/2 md:w-1/3 bg-slate-100 rounded mx-auto" />
            </section>

            {/* Philosophy Section Skeleton */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 items-center">
              <div className="space-y-6">
                <div className="h-3 w-24 bg-slate-100 rounded" />
                <div className="h-8 md:h-12 w-3/4 bg-slate-100 rounded" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-100 rounded" />
                  <div className="h-4 w-5/6 bg-slate-100 rounded" />
                </div>
                <div className="pt-6 border-t border-slate-100 flex gap-10">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-6 w-12 bg-slate-100 rounded" />
                      <div className="h-3 w-16 bg-slate-100 rounded" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden rounded-sm flex items-center justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-brand-blue/30 animate-spin" />
              </div>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Fallback data in case API fails
  const content = data || {
    hero: { title: "Liberty Wear.", subtitle: "Архитектурный подход к моде. Эстетика чистоты и функциональности с 2018 года." },
    philosophy: {
      overline: "Наша философия",
      title: "Меньше значит больше.",
      description: "Мы верим, что одежда должна быть продолжением архитектуры пространства. Liberty Wear создает вещи, которые не кричат, а подчеркивают индивидуальность через идеальный крой и безупречные материалы.",
      stats: [
        { value: "100%", label: "Натурально" },
        { value: "2018", label: "Основано" },
        { value: "UZB", label: "Производство" }
      ]
    },
    craftsmanship: {
      overline: "Мастерство",
      title: "Внимание к деталям.",
      cards: [
        { title: "Материалы", desc: "Мы используем только сертифицированный хлопок, шерсть мериноса и кашемир высшего качества." },
        { title: "Конструкция", desc: "Каждое лекало разрабатывается архитекторами кроя для обеспечения идеальной посадки." },
        { title: "Этика", desc: "Справедливое производство и экологическая ответственность на каждом этапе создания коллекции." }
      ]
    },
    visualStory: { title: "Создано для жизни. Спроектировано для вечности." },
    cta: { title: "Начните свою историю с нами." }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-32 pb-16 relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          {/* Hero Section */}
          <section className="mb-24 mt-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="text-center space-y-6"
            >
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-brand-blue uppercase leading-none">
                {content.hero.title.split(' ')[0]} <span className="text-slate-200">{content.hero.title.split(' ')[1]}</span>
              </h1>
              <p className="text-sm md:text-base text-slate-400 uppercase tracking-[0.1em] max-w-xl mx-auto leading-relaxed">
                {content.hero.subtitle}
              </p>
            </motion.div>
          </section>

          {/* Philosophy Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 items-center">
            <motion.div {...fadeInUp} className="space-y-6">
              <span className="text-[10px] font-bold text-brand-blue uppercase tracking-[0.2em]">{content.philosophy.overline}</span>
              <h2 className="text-3xl md:text-4xl font-bold text-brand-blue uppercase tracking-tight leading-tight">
                {content.philosophy.title}
              </h2>
              <p className="text-slate-500 text-[13px] leading-relaxed max-w-md">
                {content.philosophy.description}
              </p>
              <div className="pt-6 border-t border-slate-100 flex gap-10">
                {content.philosophy.stats.map((stat, i) => (
                  <div key={i}>
                    <p className="text-xl font-bold text-brand-blue">{stat.value}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative aspect-[4/3] bg-slate-50 overflow-hidden rounded-sm"
            >
              <Image 
                src="/images/hero1.jpg" 
                alt="Philosophy" 
                fill 
                className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-brand-blue/5" />
            </motion.div>
          </section>

          {/* Craftsmanship Section */}
          <section className="mb-24">
            <div className="text-center mb-16 space-y-3">
              <span className="text-[10px] font-bold text-brand-blue uppercase tracking-[0.2em]">{content.craftsmanship.overline}</span>
              <h2 className="text-3xl font-bold text-brand-blue uppercase tracking-tighter">{content.craftsmanship.title}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.craftsmanship.cards.map((item, i) => (
                <motion.div 
                  key={i}
                  {...fadeInUp}
                  transition={{ delay: i * 0.2 }}
                  className="p-8 border border-slate-100 hover:border-brand-blue transition-colors group"
                >
                  <h3 className="text-xs font-bold text-brand-blue uppercase tracking-widest mb-4 group-hover:translate-x-1 transition-transform">{item.title}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed uppercase tracking-wider">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Visual Storytelling */}
          <section className="relative h-[50vh] mb-24 overflow-hidden rounded-sm">
            <motion.div 
              initial={{ scale: 1.1, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              <Image 
                src="/images/hero3.jpg" 
                alt="Visual Story" 
                fill 
                className="object-cover grayscale"
              />
              <div className="absolute inset-0 bg-brand-blue/20 backdrop-blur-[2px]" />
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div className="max-w-2xl px-6 space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-tighter leading-none">
                  {content.visualStory.title}
                </h2>
              </div>
            </div>
          </section>

          {/* Timeline / Call to Action */}
          <section className="text-center py-16 border-y border-slate-100 mb-12">
            <motion.div {...fadeInUp} className="space-y-10">
              <h2 className="text-2xl font-bold text-brand-blue uppercase tracking-tighter">{content.cta.title}</h2>
              <div className="flex justify-center gap-10">
                <a href="/shop" className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-blue hover:text-slate-400 transition-colors border-b border-brand-blue pb-2">Магазин</a>
                <a href="/lookbook" className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-blue hover:text-slate-400 transition-colors border-b border-brand-blue pb-2">Лукбук</a>
              </div>
            </motion.div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
