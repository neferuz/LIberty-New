"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Mail, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils";

interface ContactData {
  info: {
    overline: string;
    title: string;
    address: string;
    phones: string[];
    workHours: {
      weekdays: string;
      sunday: string;
    }
  };
  form: {
    title: string;
    button: string;
  };
}

export default function ContactPage() {
  const [data, setData] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error", text: string } | null>(null);

  useEffect(() => {
    fetch(`/api/v1/pages/contact?t=${Date.now()}`)
      .then(res => res.json())
      .then(json => {
        setData(json.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch Contact data:", err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/v1/inquiries/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setStatus({ type: "success", text: "Ваше сообщение успешно отправлено!" });
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus({ type: "error", text: "Произошла ошибка при отправке. Попробуйте позже." });
      }
    } catch (err) {
      setStatus({ type: "error", text: "Ошибка соединения с сервером." });
    } finally {
      setSubmitting(false);
      setTimeout(() => setStatus(null), 5000);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-32 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
          <div className="container mx-auto px-6 max-w-7xl relative z-10 animate-pulse">
            {/* Header Skeleton */}
            <div className="mb-12 space-y-4">
              <div className="h-3 w-24 bg-slate-100 rounded mx-auto lg:mx-0" />
              <div className="h-12 md:h-16 w-1/2 bg-slate-100 rounded mx-auto lg:mx-0" />
            </div>

            {/* Split Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              {/* Left Column Skeletons */}
              <div className="lg:col-span-5 space-y-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-5 items-start">
                    <div className="w-10 h-10 bg-slate-50 border border-slate-100 flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 w-20 bg-slate-100 rounded" />
                      <div className="h-4 w-4/5 bg-slate-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column (Form) Skeletons */}
              <div className="lg:col-span-7 bg-white border border-slate-100 p-8 md:p-12 space-y-8">
                <div className="h-4 w-1/3 bg-slate-100 rounded" />
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-16 bg-slate-100 rounded" />
                      <div className="h-12 w-full bg-slate-50 border border-slate-100 rounded" />
                    </div>
                  ))}
                  <div className="h-14 w-full bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const content = data || {
    info: {
      overline: "Связь с нами",
      title: "Контакты.",
      address: "г. Ташкент, ул. Амира Темура, Бизнес-центр \"Liberty\", 1 этаж",
      phones: ["+998 71 200 00 00", "+998 90 123 45 67"],
      workHours: {
        weekdays: "ПН — СБ: 10:00 - 21:00",
        sunday: "ВС: 11:00 - 19:00"
      }
    },
    form: {
      title: "Обратная связь",
      button: "Отправить сообщение"
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-32 pb-16 relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          {/* Branded Notification */}
          <AnimatePresence>
            {status && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-32 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
              >
                <div className={cn(
                  "px-8 py-4 bg-[#1a1f36] text-white rounded-none border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl",
                  "flex items-center gap-6 min-w-[320px]"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    status.type === "success" ? "bg-green-500" : "bg-red-500"
                  )}>
                    {status.type === "success" ? (
                      <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                      {status.type === "success" ? "Успешно" : "Ошибка"}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-white leading-tight">
                      {status.text}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="mb-12">
            <span className="text-[10px] font-bold text-brand-blue uppercase tracking-[0.15em] block mb-4 text-center lg:text-left">{content.info.overline}</span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-brand-blue uppercase leading-none text-center lg:text-left">
              {content.info.title}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Contact Info (Left) */}
            <div className="lg:col-span-5 space-y-10">
              <motion.div {...fadeInUp} className="space-y-6">
                <div className="flex gap-5 items-start">
                  <div className="w-10 h-10 bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100">
                    <MapPin className="w-4 h-4 text-brand-blue" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">Наш адрес</h3>
                    <p className="text-[12px] text-slate-500 leading-relaxed uppercase tracking-wider">
                      {content.info.address}
                    </p>
                  </div>
                </div>

                <div className="flex gap-5 items-start">
                  <div className="w-10 h-10 bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100">
                    <Phone className="w-4 h-4 text-brand-blue" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">Телефоны</h3>
                    {content.info.phones.map((phone, i) => (
                      <p key={i} className="text-[12px] text-slate-500 uppercase tracking-wider">{phone}</p>
                    ))}
                  </div>
                </div>

                <div className="flex gap-5 items-start">
                  <div className="w-10 h-10 bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100">
                    <Clock className="w-4 h-4 text-brand-blue" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">Режим работы</h3>
                    <p className="text-[12px] text-slate-500 uppercase tracking-wider">{content.info.workHours.weekdays}</p>
                    <p className="text-[12px] text-slate-500 uppercase tracking-wider">{content.info.workHours.sunday}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div {...fadeInUp} className="pt-8 border-t border-slate-100 space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">{content.form.title}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      placeholder="ВАШЕ ИМЯ" 
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full bg-transparent border-b border-slate-200 py-3 text-[10px] tracking-widest uppercase focus:outline-none focus:border-brand-blue transition-colors placeholder:text-slate-300"
                    />
                  </div>
                  <div className="relative">
                    <input 
                      type="email" 
                      required
                      placeholder="EMAIL" 
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      className="w-full bg-transparent border-b border-slate-200 py-3 text-[10px] tracking-widest uppercase focus:outline-none focus:border-brand-blue transition-colors placeholder:text-slate-300"
                    />
                  </div>
                  <div className="relative">
                    <textarea 
                      required
                      placeholder="СООБЩЕНИЕ" 
                      rows={3}
                      value={form.message}
                      onChange={e => setForm({...form, message: e.target.value})}
                      className="w-full bg-transparent border-b border-slate-200 py-3 text-[10px] tracking-widest uppercase focus:outline-none focus:border-brand-blue transition-colors placeholder:text-slate-300 resize-none"
                    ></textarea>
                  </div>
                  <Button 
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 rounded-none uppercase text-[10px] tracking-[0.2em] font-bold"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : content.form.button}
                  </Button>
                </form>
              </motion.div>
            </div>

            {/* Map (Right) */}
            <div className="lg:col-span-7 h-[350px] lg:h-[550px] relative">
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="absolute inset-0 bg-slate-50 border border-slate-100 overflow-hidden rounded-sm"
              >
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d47941.018266453!2d69.21447225134277!3d41.311081!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b0cc379e9c3%3A0x4093a471f59a18f!2zVGFzaGtlbnQsIFV6YmVraXN0YW4!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, filter: 'grayscale(1) contrast(1.1) invert(0)' }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                
                <div className="absolute top-6 left-6 p-4 bg-white shadow-2xl border border-slate-100 max-w-[200px] space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-brand-blue">Showroom Liberty</span>
                  </div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-relaxed">
                    Посетите наш шоурум, чтобы оценить качество материалов вживую.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
