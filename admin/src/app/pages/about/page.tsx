"use client";

import { useState, useEffect, useRef } from "react";
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
  Award,
  Plus
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
    imageUrl?: string;
  };
  craftsmanship: {
    overline: string;
    title: string;
    cards: { title: string; desc: string }[];
  };
  visualStory: {
    title: string;
    imageUrl?: string;
  };
  cta: {
    title: string;
    button1Text?: string;
    button1Href?: string;
    button2Text?: string;
    button2Href?: string;
  };
}

export default function AboutAdminPage() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [initialAboutData, setInitialAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<"philosophy" | "visualStory" | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadTarget) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (uploadTarget === "philosophy") {
          updateField("philosophy.imageUrl", reader.result as string);
        } else if (uploadTarget === "visualStory") {
          updateField("visualStory.imageUrl", reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = (target: "philosophy" | "visualStory") => {
    setUploadTarget(target);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const hasUnsavedChanges = JSON.stringify(aboutData) !== JSON.stringify(initialAboutData);

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      const res = await fetch(`/api/v1/pages/about?t=${Date.now()}`);
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
      const res = await fetch("/api/v1/pages/about", {
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

      <div className="space-y-4 animate-in fade-in duration-700 pb-16 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight mb-0.5 font-black">О бренде (About)</h1>
            <p className="text-[13px] text-[#4f566b]">Управление контентом страницы "О нас" в реальном времени.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSave}
              disabled={saving || !hasUnsavedChanges}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold rounded-md transition-all border cursor-pointer",
                hasUnsavedChanges 
                  ? "text-white bg-slate-900 border-slate-900 hover:bg-slate-800" 
                  : "text-[#a3acb9] bg-[#f7f8f9] border-[#e3e8ee] cursor-not-allowed"
              )}
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Сохранить
            </button>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          {/* Hero Section */}
          <section className="bg-white border border-[#e3e8ee] rounded-lg p-4 md:p-5 space-y-4">
            <div className="flex items-center gap-2 text-[#2c3b6e] border-b border-[#f7f8f9] pb-3">
              <Layout className="w-4 h-4 text-slate-900" strokeWidth={2.5} />
              <h3 className="font-bold text-[14px] text-slate-900">Главный экран</h3>
            </div>
            <div className="grid gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#4f566b] uppercase tracking-wider">Заголовок (Title)</label>
                <input 
                  type="text" 
                  value={aboutData.hero.title}
                  onChange={(e) => updateField('hero.title', e.target.value)}
                  className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-2.5 py-1.5 rounded-md outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#4f566b] uppercase tracking-wider">Подзаголовок (Subtitle)</label>
                <textarea 
                  value={aboutData.hero.subtitle}
                  onChange={(e) => updateField('hero.subtitle', e.target.value)}
                  rows={2}
                  className="w-full text-[13px] font-medium text-[#4f566b] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-2.5 py-1.5 rounded-md outline-none transition-all resize-none"
                />
              </div>
            </div>
          </section>

          {/* Philosophy Section */}
          <section className="bg-white border border-[#e3e8ee] rounded-lg p-4 md:p-5 space-y-4">
            <div className="flex items-center gap-2 text-[#2c3b6e] border-b border-[#f7f8f9] pb-3">
              <Info className="w-4 h-4 text-slate-900" strokeWidth={2.5} />
              <h3 className="font-bold text-[14px] text-slate-900">Наша философия</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Column: Texts and Stats */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-[#4f566b] uppercase tracking-wider">Надзаголовок</label>
                    <input 
                      type="text" 
                      value={aboutData.philosophy.overline}
                      onChange={(e) => updateField('philosophy.overline', e.target.value)}
                      className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-2.5 py-1.5 rounded-md outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-[#4f566b] uppercase tracking-wider">Заголовок</label>
                    <input 
                      type="text" 
                      value={aboutData.philosophy.title}
                      onChange={(e) => updateField('philosophy.title', e.target.value)}
                      className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-2.5 py-1.5 rounded-md outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-[#4f566b] uppercase tracking-wider">Описание</label>
                  <textarea 
                    value={aboutData.philosophy.description}
                    onChange={(e) => updateField('philosophy.description', e.target.value)}
                    rows={3}
                    className="w-full text-[13px] font-medium text-[#4f566b] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-2.5 py-1.5 rounded-md outline-none transition-all resize-none"
                  />
                </div>
                
                {/* Stats */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-[#4f566b] mb-2">
                    <BarChart3 className="w-3.5 h-3.5 text-slate-900" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#4f566b]">Показатели (Stats)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {aboutData.philosophy.stats.map((stat, idx) => (
                      <div key={idx} className="space-y-1 p-1.5 bg-[#f7f8f9] rounded-lg border border-[#e3e8ee]/45">
                        <input 
                          type="text" 
                          value={stat.value}
                          onChange={(e) => updateStat(idx, 'value', e.target.value)}
                          className="w-full text-[13px] font-black text-[#2c3b6e] bg-transparent outline-none text-center"
                          placeholder="Значение"
                        />
                        <input 
                          type="text" 
                          value={stat.label}
                          onChange={(e) => updateStat(idx, 'label', e.target.value)}
                          className="w-full text-[9px] font-bold text-[#4f566b] bg-transparent outline-none text-center uppercase tracking-wider"
                          placeholder="Ярлык"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Image */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-[#4f566b] uppercase tracking-wider">Изображение философии</label>
                  <div 
                    onClick={() => triggerUpload("philosophy")}
                    className="relative h-32 w-full bg-[#f7f8f9] border border-dashed border-[#e3e8ee] rounded-md overflow-hidden cursor-pointer flex items-center justify-center hover:border-slate-400 transition-all group"
                  >
                    {aboutData.philosophy.imageUrl ? (
                      <img src={aboutData.philosophy.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Plus className="w-5 h-5 text-slate-300" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <span className="px-3 py-1 bg-white rounded text-[10px] font-bold text-[#1a1f36] shadow">Выбрать фото</span>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Или вставьте прямую ссылку на фото" 
                    value={aboutData.philosophy.imageUrl || ""}
                    onChange={(e) => updateField('philosophy.imageUrl', e.target.value)}
                    className="w-full text-[11px] font-medium text-[#4f566b] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-2.5 py-1 rounded-md outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Craftsmanship Section */}
          <section className="bg-white border border-[#e3e8ee] rounded-lg p-4 md:p-5 space-y-4">
            <div className="flex items-center gap-2 text-[#2c3b6e] border-b border-[#f7f8f9] pb-3">
              <Award className="w-4 h-4 text-slate-900" strokeWidth={2.5} />
              <h3 className="font-bold text-[14px] text-slate-900">Мастерство (Craftsmanship)</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-[#4f566b] uppercase tracking-wider">Надзаголовок</label>
                  <input 
                    type="text" 
                    value={aboutData.craftsmanship.overline}
                    onChange={(e) => updateField('craftsmanship.overline', e.target.value)}
                    className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-2.5 py-1.5 rounded-md outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-[#4f566b] uppercase tracking-wider">Заголовок</label>
                  <input 
                    type="text" 
                    value={aboutData.craftsmanship.title}
                    onChange={(e) => updateField('craftsmanship.title', e.target.value)}
                    className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-2.5 py-1.5 rounded-md outline-none transition-all"
                  />
                </div>
              </div>
              
              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {aboutData.craftsmanship.cards.map((card, idx) => (
                  <div key={idx} className="p-3 bg-[#f7f8f9] rounded-lg space-y-2 border border-[#e3e8ee]/50">
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-black text-[#a3acb9] uppercase tracking-widest px-0.5">Карточка {idx + 1}</label>
                      <input 
                        type="text" 
                        value={card.title}
                        onChange={(e) => updateCard(idx, 'title', e.target.value)}
                        className="w-full text-[12px] font-bold text-[#1a1f36] bg-white border border-[#e3e8ee] px-2 py-1 rounded outline-none focus:border-[#2c3b6e]/30 transition-all text-xs font-semibold"
                        placeholder="Заголовок карточки"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <textarea 
                        value={card.desc}
                        onChange={(e) => updateCard(idx, 'desc', e.target.value)}
                        rows={3}
                        className="w-full text-[11px] font-medium text-[#4f566b] bg-white border border-[#e3e8ee] px-2 py-1 rounded outline-none focus:border-[#2c3b6e]/30 transition-all resize-none text-[11px]"
                        placeholder="Описание карточки"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Visual Story */}
          <section className="bg-white border border-[#e3e8ee] rounded-lg p-4 md:p-5 space-y-4">
            <div className="flex items-center gap-2 text-[#2c3b6e] border-b border-[#f7f8f9] pb-3">
              <AlignLeft className="w-4 h-4 text-slate-900" strokeWidth={2.5} />
              <h3 className="font-bold text-[14px] text-slate-900">Visual Story</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#4f566b] uppercase tracking-wider">Текст на фото</label>
                <textarea 
                  value={aboutData.visualStory.title}
                  onChange={(e) => updateField('visualStory.title', e.target.value)}
                  rows={4}
                  className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-2.5 py-1.5 rounded-md outline-none transition-all resize-none"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#4f566b] uppercase tracking-wider">Фоновое изображение</label>
                <div 
                  onClick={() => triggerUpload("visualStory")}
                  className="relative h-32 w-full bg-[#f7f8f9] border border-dashed border-[#e3e8ee] rounded-md overflow-hidden cursor-pointer flex items-center justify-center hover:border-slate-400 transition-all group"
                >
                  {aboutData.visualStory.imageUrl ? (
                    <img src={aboutData.visualStory.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Plus className="w-5 h-5 text-slate-300" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <span className="px-3 py-1 bg-white rounded text-[10px] font-bold text-[#1a1f36] shadow">Выбрать фото</span>
                  </div>
                </div>
                <input 
                  type="text" 
                  placeholder="Или вставьте прямую ссылку на фото" 
                  value={aboutData.visualStory.imageUrl || ""}
                  onChange={(e) => updateField('visualStory.imageUrl', e.target.value)}
                  className="w-full text-[11px] font-medium text-[#4f566b] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-2.5 py-1 rounded-md outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-white border border-[#e3e8ee] rounded-lg p-4 md:p-5 space-y-4">
            <div className="flex items-center gap-2 text-[#2c3b6e] border-b border-[#f7f8f9] pb-3">
              <Type className="w-4 h-4 text-slate-900" strokeWidth={2.5} />
              <h3 className="font-bold text-[14px] text-slate-900">Призыв к действию (CTA)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#4f566b] uppercase tracking-wider">Заголовок призыва</label>
                <textarea 
                  value={aboutData.cta.title}
                  onChange={(e) => updateField('cta.title', e.target.value)}
                  rows={2}
                  className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-2.5 py-1.5 rounded-md outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2 p-2 bg-[#f7f8f9] rounded-lg border border-[#e3e8ee]/40 flex flex-col justify-center">
                  <span className="text-[9px] font-black text-[#a3acb9] uppercase tracking-wider px-0.5">Кнопка 1</span>
                  <div className="space-y-1.5">
                    <input 
                      placeholder="Текст (Магазин)" 
                      value={aboutData.cta.button1Text || ""} 
                      onChange={(e) => updateField('cta.button1Text', e.target.value)} 
                      className="w-full px-2 py-1 bg-white border border-[#e3e8ee] rounded text-[12px] outline-none focus:border-[#2c3b6e]/30" 
                    />
                    <input 
                      placeholder="Ссылка (/shop)" 
                      value={aboutData.cta.button1Href || ""} 
                      onChange={(e) => updateField('cta.button1Href', e.target.value)} 
                      className="w-full px-2 py-1 bg-white border border-[#e3e8ee] rounded text-[12px] outline-none focus:border-[#2c3b6e]/30" 
                    />
                  </div>
                </div>

                <div className="space-y-2 p-2 bg-[#f7f8f9] rounded-lg border border-[#e3e8ee]/40 flex flex-col justify-center">
                  <span className="text-[9px] font-black text-[#a3acb9] uppercase tracking-wider px-0.5">Кнопка 2</span>
                  <div className="space-y-1.5">
                    <input 
                      placeholder="Текст (Лукбук)" 
                      value={aboutData.cta.button2Text || ""} 
                      onChange={(e) => updateField('cta.button2Text', e.target.value)} 
                      className="w-full px-2 py-1 bg-white border border-[#e3e8ee] rounded text-[12px] outline-none focus:border-[#2c3b6e]/30" 
                    />
                    <input 
                      placeholder="Ссылка (/lookbook)" 
                      value={aboutData.cta.button2Href || ""} 
                      onChange={(e) => updateField('cta.button2Href', e.target.value)} 
                      className="w-full px-2 py-1 bg-white border border-[#e3e8ee] rounded text-[12px] outline-none focus:border-[#2c3b6e]/30" 
                    />
                  </div>
                </div>
              </div>
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
                className="bg-[#2c3b6e] text-white px-6 py-3 rounded-full border border-[#2c3b6e] hover:bg-[#232f58] shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5 font-bold text-[13px] group cursor-pointer"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                Сохранить изменения
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      </div>
    </>
  );
}
