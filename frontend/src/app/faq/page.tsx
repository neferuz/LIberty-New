"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, ChevronRight, Loader2 } from "lucide-react";

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-8 flex justify-between items-center text-left group"
      >
        <span className={`text-sm md:text-lg font-bold uppercase tracking-tight transition-colors ${isOpen ? 'text-brand-blue' : 'text-slate-600 group-hover:text-brand-blue'}`}>
          {question}
        </span>
        <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${isOpen ? 'bg-brand-blue border-brand-blue text-white' : 'border-slate-100 text-slate-400'}`}>
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-8 text-sm text-slate-400 leading-relaxed max-w-2xl uppercase tracking-widest">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaq = async () => {
      try {
        const res = await fetch(`/api/v1/pages/faq?t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          const items = json.data;
          
          // Compatibility with old/new structure
          if (Array.isArray(items)) {
            setData({
              categories: items,
              cta: {
                title: "Не нашли ответ?",
                subtitle: "Наша служба поддержки готова помочь вам в любое время.",
                telegram: "https://t.me/liberty_wear",
                phone: "+998 71 200 00 00"
              }
            });
          } else {
            setData(items);
          }
        }
      } catch (err) {
        console.error("Failed to fetch FAQ:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaq();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-32 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
          <div className="container mx-auto px-6 max-w-4xl relative z-10 animate-pulse">
            {/* Header Skeleton */}
            <div className="text-center mb-16 space-y-4">
              <div className="h-3 w-16 bg-slate-100 rounded mx-auto" />
              <div className="h-12 md:h-16 w-1/2 bg-slate-100 rounded mx-auto" />
            </div>

            {/* FAQ Skeletons */}
            <div className="space-y-12">
              {[1, 2, 3].map((section) => (
                <div key={section} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-4 w-32 bg-slate-100 rounded" />
                    <div className="flex-1 h-[1px] bg-slate-100" />
                  </div>
                  <div className="space-y-4">
                    {[1, 2].map((item) => (
                      <div key={item} className="py-6 border-b border-slate-100 flex justify-between items-center">
                        <div className="h-4 w-2/3 bg-slate-100 rounded" />
                        <div className="w-8 h-8 rounded-full bg-slate-100" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const content = data || { categories: [], cta: { title: "Не нашли ответ?", subtitle: "", telegram: "#", phone: "#" } };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-32 pb-16 relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <span className="text-[10px] font-bold text-brand-blue uppercase tracking-[0.2em]">Помощь</span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-brand-blue uppercase leading-none">
              Вопросы и <br /> ответы.
            </h1>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-12">
            {content.categories.map((section: any, idx: number) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-4">
                  <h2 className="text-[10px] font-bold text-brand-blue uppercase tracking-[0.2em]">{section.category}</h2>
                  <div className="flex-1 h-[1px] bg-slate-100" />
                </div>
                
                <div className="bg-white">
                  {section.questions.map((item: any, i: number) => (
                    <FAQItem key={i} question={item.q} answer={item.a} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Support CTA */}
          <div className="mt-24 p-8 md:p-12 bg-slate-50 border border-slate-100 text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-brand-blue uppercase tracking-tight">{content.cta.title}</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-relaxed">{content.cta.subtitle}</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href={content.cta.telegram} 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white bg-[#2c3b6e] px-8 py-4 hover:bg-[#1a2544] transition-all"
              >
                Написать в Telegram
              </a>
              <a 
                href={`tel:${content.cta.phone.replace(/\s/g, '')}`} 
                className="inline-flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#2c3b6e] border border-[#2c3b6e] px-8 py-4 hover:bg-[#2c3b6e] hover:text-white transition-all"
              >
                Позвонить нам
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
