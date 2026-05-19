"use client";

import { Button } from "@/components/common/Button";
import { useState, useEffect } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Newsletter = () => {
  const [content, setContent] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/v1/pages/home?t=${Date.now()}`);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;

    setLoading(true);
    // Mimic API request delay for high-fidelity interactive feel
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
    }, 850);
  };

  const data = content || {
    title: "Будьте в курсе.",
    description: "Подпишитесь, чтобы первыми получать доступ к новым коллекциям, историям бренда и эксклюзивным мероприятиям."
  };

  return (
    <section className="pt-2 pb-8 md:py-12 bg-brand-blue text-white overflow-hidden relative">
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
            <form onSubmit={handleSubmit} className="flex flex-row gap-0 max-w-xl lg:ml-auto relative">
              <input 
                type="email" 
                placeholder="ВВЕДИТЕ ВАШ EMAIL" 
                required
                value={subscribed ? `${email} — ПОДПИСАН` : email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || subscribed}
                className={cn(
                  "flex-1 min-w-0 bg-transparent border px-3 md:px-6 py-4 text-[10px] md:text-sm tracking-widest uppercase focus:outline-none transition-all duration-300 h-12 md:h-14",
                  subscribed 
                    ? "border-green-500/50 bg-green-500/5 text-green-400" 
                    : "border-white/20 focus:border-white text-white"
                )}
              />
              <Button 
                type="submit"
                disabled={loading || (!subscribed && !email.includes("@"))}
                className={cn(
                  "rounded-none px-4 md:px-10 h-12 md:h-14 uppercase tracking-widest font-bold text-[10px] md:text-xs flex-shrink-0 flex items-center justify-center gap-2 transition-all duration-300",
                  subscribed 
                    ? "bg-green-500 text-white hover:bg-green-600" 
                    : "bg-white text-brand-blue hover:bg-slate-200"
                )}
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : subscribed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Готово</span>
                  </>
                ) : (
                  "Подписаться"
                )}
              </Button>
            </form>
            <p className={cn(
              "mt-3 text-[8px] md:text-[10px] uppercase tracking-widest text-left lg:text-right transition-all duration-300",
              subscribed ? "text-green-400 font-bold" : "text-slate-500"
            )}>
              {subscribed 
                ? "Уведомления о коллекциях и распродажах уже в пути!" 
                : "Подписываясь, вы соглашаетесь с нашей Политикой конфиденциальности."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
