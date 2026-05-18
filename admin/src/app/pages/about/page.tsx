"use client";

import { useState, useEffect } from "react";
import { 
  Save, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Layout,
  Type,
  AlignLeft,
  Info,
  BarChart3,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AboutData {
  hero: {
    title: string;
    subtitle: string;
  };
  philosophy: {
    overline: string;
    title: string;
    description: string;
    stats: { value: string; label: string }[];
  };
  craftsmanship: {
    overline: string;
    title: string;
    cards: { title: string; desc: string }[];
  };
  visualStory: {
    title: string;
  };
  cta: {
    title: string;
  };
}

export default function AboutAdminPage() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [initialAboutData, setInitialAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const hasUnsavedChanges = JSON.stringify(aboutData) !== JSON.stringify(initialAboutData);

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/pages/about?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        const items = data.data || {};
        setAboutData(items);
        setInitialAboutData(JSON.parse(JSON.stringify(items)));
      }
    } catch (err) {
      console.error("Failed to fetch About content:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges && !saving) return;
    
    setSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/v1/pages/about", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ data: aboutData })
      });

      if (res.ok) {
        setInitialAboutData(JSON.parse(JSON.stringify(aboutData)));
        setMessage({ type: "success", text: "Изменения успешно сохранены" });
      } else {
        setMessage({ type: "error", text: "Не удалось сохранить изменения" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Ошибка соединения с сервером" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const updateField = (path: string, value: any) => {
    const newData = JSON.parse(JSON.stringify(aboutData));
    const parts = path.split('.');
    let current = newData;
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    setAboutData(newData);
  };

  const updateStat = (index: number, field: 'value' | 'label', value: string) => {
    const newData = JSON.parse(JSON.stringify(aboutData));
    newData.philosophy.stats[index][field] = value;
    setAboutData(newData);
  };

  const updateCard = (index: number, field: 'title' | 'desc', value: string) => {
    const newData = JSON.parse(JSON.stringify(aboutData));
    newData.craftsmanship.cards[index][field] = value;
    setAboutData(newData);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-slate-150 rounded" />
            <div className="h-3.5 w-64 bg-slate-100 rounded" />
          </div>
          <div className="h-8 w-24 bg-slate-100 rounded" />
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white border border-[#e3e8ee] rounded-lg p-6 space-y-4">
              <div className="h-4 w-1/3 bg-slate-150 rounded" />
              <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
              <div className="h-16 bg-slate-50 border border-[#e3e8ee] rounded" />
            </div>
            <div className="bg-white border border-[#e3e8ee] rounded-lg p-6 space-y-4">
              <div className="h-4 w-1/3 bg-slate-150 rounded" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
                <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
              </div>
              <div className="h-16 bg-slate-50 border border-[#e3e8ee] rounded" />
            </div>
          </div>
          <div className="bg-white border border-[#e3e8ee] rounded-lg p-6 space-y-4">
            <div className="h-4 w-1/3 bg-slate-150 rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
              <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
            </div>
            <div className="space-y-3 pt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-50 border border-[#e3e8ee] rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!aboutData) return null;

  return (
    <>
      {/* Notifications */}
      <div className="fixed top-8 right-8 z-[120] pointer-events-none">
        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "min-w-[320px] p-4 rounded-lg shadow-2xl flex items-center gap-4 pointer-events-auto",
                "bg-[#1a1f36] text-white border border-white/10 backdrop-blur-xl"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                message.type === "success" ? "bg-[#10b981]" : "bg-[#cd5c5c]"
              )}>
                {message.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-white" />
                )}
              </div>
              
              <div className="flex-1">
                <p className="text-[14px] font-bold tracking-tight">
                  {message.type === "success" ? "Успешно" : "Ошибка"}
                </p>
                <p className="text-[12px] text-white/70 font-medium">
                  {message.text}
                </p>
              </div>

              <button 
                onClick={() => setMessage(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 rotate-45 opacity-50 hover:opacity-100 transition-opacity" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-6 animate-in fade-in duration-700 pb-32 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight mb-0.5">О бренде (About)</h1>
            <p className="text-[13px] text-[#4f566b]">Управление контентом страницы "О нас".</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSave}
              disabled={saving || !hasUnsavedChanges}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold rounded-md transition-all border",
                hasUnsavedChanges 
                  ? "text-white bg-[#2c3b6e] border-[#2c3b6e] hover:bg-[#232f58]" 
                  : "text-[#a3acb9] bg-[#f7f8f9] border-[#e3e8ee] cursor-not-allowed"
              )}
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Сохранить
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Hero Section */}
            <section className="bg-white border border-[#e3e8ee] rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#2c3b6e] mb-2">
                <Layout className="w-4 h-4" />
                <h2 className="text-[15px] font-bold uppercase tracking-wider">Главный экран</h2>
              </div>
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Заголовок (Title)</label>
                  <input 
                    type="text" 
                    value={aboutData.hero.title}
                    onChange={(e) => updateField('hero.title', e.target.value)}
                    className="w-full text-[14px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Подзаголовок (Subtitle)</label>
                  <textarea 
                    value={aboutData.hero.subtitle}
                    onChange={(e) => updateField('hero.subtitle', e.target.value)}
                    rows={2}
                    className="w-full text-[14px] font-medium text-[#4f566b] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3 py-2 rounded-lg outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Philosophy Section */}
            <section className="bg-white border border-[#e3e8ee] rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#2c3b6e] mb-2">
                <Info className="w-4 h-4" />
                <h2 className="text-[15px] font-bold uppercase tracking-wider">Наша философия</h2>
              </div>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Надзаголовок</label>
                    <input 
                      type="text" 
                      value={aboutData.philosophy.overline}
                      onChange={(e) => updateField('philosophy.overline', e.target.value)}
                      className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3 py-2 rounded-lg outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Заголовок</label>
                    <input 
                      type="text" 
                      value={aboutData.philosophy.title}
                      onChange={(e) => updateField('philosophy.title', e.target.value)}
                      className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3 py-2 rounded-lg outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Описание</label>
                  <textarea 
                    value={aboutData.philosophy.description}
                    onChange={(e) => updateField('philosophy.description', e.target.value)}
                    rows={3}
                    className="w-full text-[13px] font-medium text-[#4f566b] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3 py-2 rounded-lg outline-none transition-all resize-none"
                  />
                </div>
                
                {/* Stats */}
                <div className="pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-[#4f566b] mb-4">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Показатели (Stats)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {aboutData.philosophy.stats.map((stat, idx) => (
                      <div key={idx} className="space-y-2 p-3 bg-[#f7f8f9] rounded-lg">
                        <input 
                          type="text" 
                          value={stat.value}
                          onChange={(e) => updateStat(idx, 'value', e.target.value)}
                          className="w-full text-[16px] font-bold text-[#2c3b6e] bg-transparent outline-none text-center"
                          placeholder="Значение"
                        />
                        <input 
                          type="text" 
                          value={stat.label}
                          onChange={(e) => updateStat(idx, 'label', e.target.value)}
                          className="w-full text-[10px] font-bold text-[#4f566b] bg-transparent outline-none text-center uppercase tracking-widest"
                          placeholder="Ярлык"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            {/* Craftsmanship Section */}
            <section className="bg-white border border-[#e3e8ee] rounded-lg p-6 h-full flex flex-col">
              <div className="flex items-center gap-2 text-[#2c3b6e] mb-4">
                <Award className="w-4 h-4" />
                <h2 className="text-[15px] font-bold uppercase tracking-wider">Мастерство (Craftsmanship)</h2>
              </div>
              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Надзаголовок</label>
                    <input 
                      type="text" 
                      value={aboutData.craftsmanship.overline}
                      onChange={(e) => updateField('craftsmanship.overline', e.target.value)}
                      className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3 py-2 rounded-lg outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Заголовок</label>
                    <input 
                      type="text" 
                      value={aboutData.craftsmanship.title}
                      onChange={(e) => updateField('craftsmanship.title', e.target.value)}
                      className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3 py-2 rounded-lg outline-none transition-all"
                    />
                  </div>
                </div>
                
                {/* Cards */}
                <div className="grid gap-3 pt-2">
                  {aboutData.craftsmanship.cards.map((card, idx) => (
                    <div key={idx} className="p-4 border border-[#e3e8ee] rounded-xl space-y-3">
                      <input 
                        type="text" 
                        value={card.title}
                        onChange={(e) => updateCard(idx, 'title', e.target.value)}
                        className="w-full text-[13px] font-bold text-[#1a1f36] bg-transparent outline-none border-b border-transparent focus:border-[#2c3b6e]/30"
                        placeholder="Заголовок карточки"
                      />
                      <textarea 
                        value={card.desc}
                        onChange={(e) => updateCard(idx, 'desc', e.target.value)}
                        rows={2}
                        className="w-full text-[12px] text-[#4f566b] bg-transparent outline-none resize-none"
                        placeholder="Описание карточки"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Other Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white border border-[#e3e8ee] rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#2c3b6e] mb-2">
              <AlignLeft className="w-4 h-4" />
              <h2 className="text-[13px] font-bold uppercase tracking-wider">Visual Story</h2>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Текст на фото</label>
              <textarea 
                value={aboutData.visualStory.title}
                onChange={(e) => updateField('visualStory.title', e.target.value)}
                rows={2}
                className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3 py-2 rounded-lg outline-none transition-all resize-none"
              />
            </div>
          </section>

          <section className="bg-white border border-[#e3e8ee] rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#2c3b6e] mb-2">
              <Type className="w-4 h-4" />
              <h2 className="text-[13px] font-bold uppercase tracking-wider">CTA Section</h2>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Заголовок призыва</label>
              <textarea 
                value={aboutData.cta.title}
                onChange={(e) => updateField('cta.title', e.target.value)}
                rows={2}
                className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3 py-2 rounded-lg outline-none transition-all resize-none"
              />
            </div>
          </section>
        </div>

        {/* Floating Save Button */}
        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div 
              initial={{ y: 100, x: "-50%" }}
              animate={{ y: 0, x: "-50%" }}
              exit={{ y: 100, x: "-50%" }}
              className="fixed bottom-6 left-1/2 z-50"
            >
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-[#2c3b6e] text-white px-6 py-3 rounded-full border border-[#2c3b6e] hover:bg-[#232f58] shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5 font-bold text-[13px] group"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                Сохранить изменения
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
