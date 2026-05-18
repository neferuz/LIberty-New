"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, ArrowRight } from "lucide-react";

export default function BlogPage() {
  const articles = [
    {
      id: 1,
      category: "Стиль",
      title: "Искусство минимализма в современном гардеробе",
      excerpt: "Как научиться выбирать качественные базовые силуэты, которые сохраняют актуальность годами и легко сочетаются друг с другом.",
      date: "12 мая 2026",
      readTime: "4 мин",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 2,
      category: "Текстиль",
      title: "Премиальный хлопок: почему качество ткани имеет значение",
      excerpt: "Вся правда о длинноволокнистом хлопке, его долговечности, воздухопроницаемости и тактильном превосходстве.",
      date: "05 мая 2026",
      readTime: "6 мин",
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 3,
      category: "Цвет",
      title: "Земляные оттенки: создание гармоничной палитры",
      excerpt: "Глубокий графит, мягкий песочный и чистый молочный — как природные оттенки создают ощущение благородного спокойствия.",
      date: "28 апреля 2026",
      readTime: "3 мин",
      image: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=800&auto=format&fit=crop"
    }
  ];

  return (
    <div className="bg-white min-h-screen text-[#1a1f36] py-16 md:py-24 selection:bg-[#f3f4f6]">
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
            <BookOpen className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Журнал Liberty Wear</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">Эстетика и осознанность</h1>
          <p className="text-[13px] text-slate-500 font-light max-w-lg leading-relaxed">
            Пространство, посвященное философии минималистичного гардероба, качественным материалам и осознанному подходу к выбору одежды.
          </p>
        </div>

        {/* Grid Articles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {articles.map((article) => (
            <article key={article.id} className="group flex flex-col justify-between">
              <div>
                {/* Visual Placeholder/Image */}
                <div className="aspect-[4/5] bg-slate-100 mb-6 overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                  />
                  <div className="absolute top-4 left-4 bg-white px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-[#1a1f36] border border-[#e3e8ee]">
                    {article.category}
                  </div>
                </div>

                {/* Date & Read Time */}
                <div className="flex items-center gap-4 text-[9px] text-slate-400 uppercase tracking-widest mb-3">
                  <span>{article.date}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-light tracking-tight leading-snug group-hover:text-slate-400 transition-colors mb-3">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-[12px] text-slate-500 font-light leading-relaxed mb-6">
                  {article.excerpt}
                </p>
              </div>

              {/* Read Link */}
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1a1f36] group-hover:gap-3 transition-all cursor-pointer">
                Читать статью
                <ArrowRight className="w-3 h-3" />
              </span>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
