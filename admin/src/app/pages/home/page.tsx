"use client";

import { 
  Save, 
  Image as ImageIcon, 
  Type, 
  RefreshCw,
  Plus,
  Trash2,
  AlertCircle,
  X,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShoppingBag,
  Mail,
  Newspaper
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

export default function HomePageEditor() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadTarget, setUploadTarget] = useState<"hero" | "editorial" | null>(null);
  
  // Data State
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [categoriesSection, setCategoriesSection] = useState({ title: "", description: "" });
  const [newArrivalsSection, setNewArrivalsSection] = useState({ title: "", description: "" });
  const [editorialSection, setEditorialSection] = useState({ overline: "", title1: "", title2: "", description: "", button1: "", button2: "", imageUrl: "", button1Href: "", button2Href: "" });
  const [newsletterSection, setNewsletterSection] = useState({ title: "", description: "" });
  const [pressSection, setPressSection] = useState({ title: "", description: "", brands: [] as string[] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/v1/pages/home");
      if (response.ok) {
        const result = await response.json();
        const data = result.data;
        if (data.hero?.slides) setHeroSlides(data.hero.slides);
        if (data.categories) setCategoriesSection(data.categories);
        if (data.newArrivals) setNewArrivalsSection(data.newArrivals);
        if (data.editorial) {
          setEditorialSection({
            overline: data.editorial.overline || "",
            title1: data.editorial.title1 || "",
            title2: data.editorial.title2 || "",
            description: data.editorial.description || "",
            button1: data.editorial.button1 || "",
            button2: data.editorial.button2 || "",
            imageUrl: data.editorial.imageUrl || "",
            button1Href: data.editorial.button1Href || "/shop",
            button2Href: data.editorial.button2Href || "/lookbook"
          });
        }
        if (data.newsletter) setNewsletterSection(data.newsletter);
        if (data.press) setPressSection(data.press);
        setHasChanges(false);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/v1/pages/home", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          data: { 
            hero: { slides: heroSlides },
            categories: categoriesSection,
            newArrivals: newArrivalsSection,
            editorial: editorialSection,
            newsletter: newsletterSection,
            press: pressSection
          }
        }),
      });

      if (response.ok) {
        setShowToast(true);
        setHasChanges(false);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.detail || "Не удалось сохранить");
        setTimeout(() => setErrorMsg(null), 4000);
      }
    } catch (err) {
      setErrorMsg("Ошибка подключения к серверу");
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const updateSlide = (field: string, value: string) => {
    const newSlides = [...heroSlides];
    newSlides[activeSlideIdx] = { ...newSlides[activeSlideIdx], [field]: value };
    setHeroSlides(newSlides);
    setHasChanges(true);
  };

  const handleDeleteSlide = () => {
    const newSlides = heroSlides.filter((_, i) => i !== activeSlideIdx);
    setHeroSlides(newSlides);
    setActiveSlideIdx(Math.max(0, activeSlideIdx - 1));
    setHasChanges(true);
    setShowDeleteModal(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadTarget) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (uploadTarget === "hero") {
          updateSlide("imageUrl", reader.result as string);
        } else if (uploadTarget === "editorial") {
          setEditorialSection({ ...editorialSection, imageUrl: reader.result as string });
          setHasChanges(true);
        }
      };
      reader.readAsDataURL(file);
    }
    if (e.target) {
      e.target.value = "";
    }
  };

  const triggerUpload = (target: "hero" | "editorial") => {
    setUploadTarget(target);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2c3b6e]" />
      </div>
    );
  }

  return (
    <>
      {/* Toast / Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-8 right-8 z-[120] pointer-events-none"
          >
            <div className="min-w-[320px] p-4 rounded-lg shadow-2xl flex items-center gap-4 pointer-events-auto bg-[#1a1f36] text-white border border-white/10 backdrop-blur-xl">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[#10b981]">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold tracking-tight">Успешно</p>
                <p className="text-[12px] text-white/70 font-medium">Изменения успешно сохранены</p>
              </div>
            </div>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-8 right-8 z-[120] pointer-events-none"
          >
            <div className="min-w-[320px] p-4 rounded-lg shadow-2xl flex items-center gap-4 pointer-events-auto bg-[#1a1f36] text-white border border-white/10 backdrop-blur-xl">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[#cd5c5c]">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold tracking-tight">Ошибка</p>
                <p className="text-[12px] text-white/70 font-medium">{errorMsg}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6 animate-in fade-in duration-700 pb-32 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight mb-0.5 font-black">Контент Главной</h1>
            <p className="text-[13px] text-[#4f566b]">Управление визуалом и текстами вашего магазина в реальном времени.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSave}
              disabled={loading || !hasChanges}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold rounded-md transition-all border cursor-pointer",
                hasChanges 
                  ? "text-white bg-slate-900 border-slate-900 hover:bg-slate-800" 
                  : "text-[#a3acb9] bg-[#f7f8f9] border-[#e3e8ee] cursor-not-allowed"
              )}
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Сохранить
            </button>
          </div>
        </div>

        <div className="space-y-8 pt-4">
          {/* Hero Section */}
          <section className="bg-white border border-[#e3e8ee] rounded-xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#f7f8f9] pb-4">
              <div className="flex items-center gap-2 text-[#2c3b6e]">
                <Layers className="w-5 h-5 text-slate-900" />
                <h3 className="font-bold text-slate-900">Hero Секция (Слайдер)</h3>
              </div>
              <button 
                onClick={() => {
                  setHeroSlides([...heroSlides, { titleFirst: "", titleSecond: "", titleThird: "", subtitle: "", primaryBtn: "В магазин", secondaryBtn: "Лукбук", primaryBtnHref: "/shop", secondaryBtnHref: "/lookbook", imageUrl: "" }]);
                  setActiveSlideIdx(heroSlides.length);
                  setHasChanges(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-[#2c3b6e] hover:bg-[#2c3b6e]/5 border border-dashed border-[#2c3b6e]/30 rounded-lg transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Добавить слайд
              </button>
            </div>

            {/* Slides Thumbnails */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Выберите слайд для редактирования</span>
              <div className="flex flex-wrap items-center gap-3 py-2">
                {heroSlides.map((slide, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setActiveSlideIdx(idx)} 
                    className={cn(
                      "flex-shrink-0 group relative w-16 h-16 rounded-xl border-2 transition-all cursor-pointer overflow-hidden", 
                      activeSlideIdx === idx ? "border-[#2c3b6e] scale-105 shadow-md" : "border-transparent bg-[#f7f8f9] hover:border-[#e3e8ee]"
                    )}
                  >
                    {slide.imageUrl ? (
                      <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}
                    <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slide Editor Panel */}
            {heroSlides[activeSlideIdx] && (
              <div className="border border-[#e3e8ee]/60 rounded-xl p-5 bg-[#f7f8f9]/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#2c3b6e] uppercase tracking-widest">Параметры слайда #{activeSlideIdx + 1}</span>
                  {heroSlides.length > 1 && (
                    <button 
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-[#cd5c5c] hover:bg-[#cd5c5c]/5 px-2 py-1 rounded transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Удалить слайд
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest">Надзаголовок (Third Line)</label>
                      <input 
                        type="text"
                        placeholder="Например, Новая Коллекция 2026" 
                        value={heroSlides[activeSlideIdx]?.titleThird || ""} 
                        onChange={(e) => updateSlide("titleThird", e.target.value)} 
                        className="w-full px-3 py-2 bg-white border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:border-[#2c3b6e]/30" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest">Строка 1</label>
                        <input 
                          type="text"
                          placeholder="Вневременной" 
                          value={heroSlides[activeSlideIdx]?.titleFirst || ""} 
                          onChange={(e) => updateSlide("titleFirst", e.target.value)} 
                          className="w-full px-3 py-2 bg-white border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:border-[#2c3b6e]/30" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest">Строка 2</label>
                        <input 
                          type="text"
                          placeholder="Минимализм" 
                          value={heroSlides[activeSlideIdx]?.titleSecond || ""} 
                          onChange={(e) => updateSlide("titleSecond", e.target.value)} 
                          className="w-full px-3 py-2 bg-white border border-[#e3e8ee] rounded-lg text-[13px] outline-none focus:border-[#2c3b6e]/30" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest">Описание</label>
                      <textarea 
                        rows={3} 
                        placeholder="Краткое описание слайда..." 
                        value={heroSlides[activeSlideIdx]?.subtitle || ""} 
                        onChange={(e) => updateSlide("subtitle", e.target.value)} 
                        className="w-full px-3 py-2 bg-white border border-[#e3e8ee] rounded-lg text-[13px] outline-none resize-none focus:border-[#2c3b6e]/30" 
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest">Изображение слайда</label>
                      <div 
                        onClick={() => triggerUpload("hero")} 
                        className="relative aspect-[16/9] bg-white border-2 border-dashed border-[#e3e8ee] rounded-xl overflow-hidden cursor-pointer flex items-center justify-center hover:border-slate-400 transition-all group"
                      >
                        {heroSlides[activeSlideIdx]?.imageUrl ? (
                          <img src={heroSlides[activeSlideIdx].imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Plus className="w-6 h-6 text-slate-300" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                          <span className="px-3 py-1.5 bg-white rounded-lg text-[10px] font-bold text-[#1a1f36] shadow-md">Выбрать фото</span>
                        </div>
                      </div>
                      <input 
                        type="text"
                        placeholder="Или прямая ссылка на фото" 
                        value={heroSlides[activeSlideIdx]?.imageUrl || ""} 
                        onChange={(e) => updateSlide("imageUrl", e.target.value)} 
                        className="w-full px-3 py-2 bg-white border border-[#e3e8ee] rounded-lg text-[11px] text-slate-600 outline-none focus:border-[#2c3b6e]/30" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#e3e8ee]/40">
                  <div className="p-3 bg-white rounded-lg border border-[#e3e8ee]/60 space-y-2">
                    <span className="text-[9px] font-bold text-[#a3acb9] uppercase tracking-widest">Кнопка 1 (Основная)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        placeholder="Текст (В магазин)" 
                        value={heroSlides[activeSlideIdx]?.primaryBtn || ""} 
                        onChange={(e) => updateSlide("primaryBtn", e.target.value)} 
                        className="w-full px-2 py-1.5 bg-[#f7f8f9] border border-[#e3e8ee] rounded text-[12px] outline-none" 
                      />
                      <input 
                        placeholder="Ссылка (/shop)" 
                        value={heroSlides[activeSlideIdx]?.primaryBtnHref || ""} 
                        onChange={(e) => updateSlide("primaryBtnHref", e.target.value)} 
                        className="w-full px-2 py-1.5 bg-[#f7f8f9] border border-[#e3e8ee] rounded text-[12px] outline-none" 
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#e3e8ee]/60 space-y-2">
                    <span className="text-[9px] font-bold text-[#a3acb9] uppercase tracking-widest">Кнопка 2 (Вторичная)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        placeholder="Текст (Лукбук)" 
                        value={heroSlides[activeSlideIdx]?.secondaryBtn || ""} 
                        onChange={(e) => updateSlide("secondaryBtn", e.target.value)} 
                        className="w-full px-2 py-1.5 bg-[#f7f8f9] border border-[#e3e8ee] rounded text-[12px] outline-none" 
                      />
                      <input 
                        placeholder="Ссылка (/lookbook)" 
                        value={heroSlides[activeSlideIdx]?.secondaryBtnHref || ""} 
                        onChange={(e) => updateSlide("secondaryBtnHref", e.target.value)} 
                        className="w-full px-2 py-1.5 bg-[#f7f8f9] border border-[#e3e8ee] rounded text-[12px] outline-none" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Categories / Collections Section */}
          <section className="bg-white border border-[#e3e8ee] rounded-xl p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2 text-[#2c3b6e] border-b border-[#f7f8f9] pb-4">
              <Layers className="w-5 h-5 text-slate-900" />
              <h3 className="font-bold text-slate-900">Блок «Наши Коллекции» (Категории)</h3>
            </div>
            <div className="grid gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Заголовок</label>
                <input 
                  type="text" 
                  value={categoriesSection.title} 
                  onChange={(e) => { setCategoriesSection({ ...categoriesSection, title: e.target.value }); setHasChanges(true); }} 
                  className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3.5 py-2.5 rounded-xl outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Описание</label>
                <textarea 
                  value={categoriesSection.description} 
                  onChange={(e) => { setCategoriesSection({ ...categoriesSection, description: e.target.value }); setHasChanges(true); }} 
                  rows={3}
                  className="w-full text-[13px] font-medium text-[#4f566b] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3.5 py-2.5 rounded-xl outline-none transition-all resize-none"
                />
              </div>
            </div>
          </section>

          {/* New Arrivals Section */}
          <section className="bg-white border border-[#e3e8ee] rounded-xl p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2 text-[#2c3b6e] border-b border-[#f7f8f9] pb-4">
              <ShoppingBag className="w-5 h-5 text-slate-900" />
              <h3 className="font-bold text-slate-900">Блок «Новинки»</h3>
            </div>
            <div className="grid gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Заголовок</label>
                <input 
                  type="text" 
                  value={newArrivalsSection.title} 
                  onChange={(e) => { setNewArrivalsSection({ ...newArrivalsSection, title: e.target.value }); setHasChanges(true); }} 
                  className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3.5 py-2.5 rounded-xl outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Описание</label>
                <textarea 
                  value={newArrivalsSection.description} 
                  onChange={(e) => { setNewArrivalsSection({ ...newArrivalsSection, description: e.target.value }); setHasChanges(true); }} 
                  rows={3}
                  className="w-full text-[13px] font-medium text-[#4f566b] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3.5 py-2.5 rounded-xl outline-none transition-all resize-none"
                />
              </div>
            </div>
          </section>

          {/* Editorial Section */}
          <section className="bg-white border border-[#e3e8ee] rounded-xl p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2 text-[#2c3b6e] border-b border-[#f7f8f9] pb-4">
              <Newspaper className="w-5 h-5 text-slate-900" />
              <h3 className="font-bold text-slate-900">Эдиториал Образ (Editorial)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Надзаголовок</label>
                  <input 
                    type="text" 
                    value={editorialSection.overline} 
                    onChange={(e) => { setEditorialSection({ ...editorialSection, overline: e.target.value }); setHasChanges(true); }} 
                    className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3.5 py-2.5 rounded-xl outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Заголовок 1</label>
                    <input 
                      type="text" 
                      value={editorialSection.title1} 
                      onChange={(e) => { setEditorialSection({ ...editorialSection, title1: e.target.value }); setHasChanges(true); }} 
                      className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3.5 py-2.5 rounded-xl outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Заголовок 2</label>
                    <input 
                      type="text" 
                      value={editorialSection.title2} 
                      onChange={(e) => { setEditorialSection({ ...editorialSection, title2: e.target.value }); setHasChanges(true); }} 
                      className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3.5 py-2.5 rounded-xl outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Описание</label>
                  <textarea 
                    value={editorialSection.description} 
                    onChange={(e) => { setEditorialSection({ ...editorialSection, description: e.target.value }); setHasChanges(true); }} 
                    rows={4}
                    className="w-full text-[13px] font-medium text-[#4f566b] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3.5 py-2.5 rounded-xl outline-none transition-all resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#f7f8f9]">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-[#a3acb9] uppercase tracking-widest px-0.5">Кнопка 1</label>
                    <input 
                      placeholder="Текст (В магазин)" 
                      value={editorialSection.button1} 
                      onChange={(e) => { setEditorialSection({ ...editorialSection, button1: e.target.value }); setHasChanges(true); }} 
                      className="w-full px-2.5 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[12px] outline-none" 
                    />
                    <input 
                      placeholder="Ссылка (/shop)" 
                      value={editorialSection.button1Href} 
                      onChange={(e) => { setEditorialSection({ ...editorialSection, button1Href: e.target.value }); setHasChanges(true); }} 
                      className="w-full px-2.5 py-1.5 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[11px] outline-none" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-[#a3acb9] uppercase tracking-widest px-0.5">Кнопка 2</label>
                    <input 
                      placeholder="Текст (Лукбук)" 
                      value={editorialSection.button2} 
                      onChange={(e) => { setEditorialSection({ ...editorialSection, button2: e.target.value }); setHasChanges(true); }} 
                      className="w-full px-2.5 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[12px] outline-none" 
                    />
                    <input 
                      placeholder="Ссылка (/lookbook)" 
                      value={editorialSection.button2Href} 
                      onChange={(e) => { setEditorialSection({ ...editorialSection, button2Href: e.target.value }); setHasChanges(true); }} 
                      className="w-full px-2.5 py-1.5 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[11px] outline-none" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Изображение Эдиториал</label>
                  <div 
                    onClick={() => triggerUpload("editorial")} 
                    className="relative aspect-[4/5] w-full bg-[#f7f8f9] border-2 border-dashed border-[#e3e8ee] rounded-xl overflow-hidden cursor-pointer flex items-center justify-center hover:border-slate-400 transition-all group"
                  >
                    {editorialSection.imageUrl ? (
                      <img src={editorialSection.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Plus className="w-6 h-6 text-slate-300" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <span className="px-3 py-1.5 bg-white rounded-lg text-[10px] font-bold text-[#1a1f36] shadow-md">Выбрать фото</span>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Или вставьте прямую ссылку на фото" 
                    value={editorialSection.imageUrl} 
                    onChange={(e) => { setEditorialSection({ ...editorialSection, imageUrl: e.target.value }); setHasChanges(true); }} 
                    className="w-full text-[13px] font-medium text-[#4f566b] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3.5 py-2.5 rounded-xl outline-none transition-all"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-black text-[#a3acb9] uppercase tracking-widest">Быстрый выбор (Пресеты)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2040&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1974&auto=format&fit=crop",
                      "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=2070&auto=format&fit=crop"
                    ].map((presetUrl, pIdx) => (
                      <div 
                        key={pIdx} 
                        onClick={() => { setEditorialSection({ ...editorialSection, imageUrl: presetUrl }); setHasChanges(true); }}
                        className={cn(
                          "relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all hover:scale-105",
                          editorialSection.imageUrl === presetUrl ? "border-slate-900 shadow-md scale-105" : "border-transparent opacity-70 hover:opacity-100"
                        )}
                      >
                        <img src={presetUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Newsletter Section */}
          <section className="bg-white border border-[#e3e8ee] rounded-xl p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2 text-[#2c3b6e] border-b border-[#f7f8f9] pb-4">
              <Mail className="w-5 h-5 text-slate-900" />
              <h3 className="font-bold text-slate-900">Блок рассылки (Newsletter)</h3>
            </div>
            <div className="grid gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Заголовок</label>
                <input 
                  type="text" 
                  value={newsletterSection.title} 
                  onChange={(e) => { setNewsletterSection({ ...newsletterSection, title: e.target.value }); setHasChanges(true); }} 
                  className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3.5 py-2.5 rounded-xl outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Описание</label>
                <textarea 
                  value={newsletterSection.description} 
                  onChange={(e) => { setNewsletterSection({ ...newsletterSection, description: e.target.value }); setHasChanges(true); }} 
                  rows={3}
                  className="w-full text-[13px] font-medium text-[#4f566b] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3.5 py-2.5 rounded-xl outline-none transition-all resize-none"
                />
              </div>
            </div>
          </section>

          {/* Press Section */}
          <section className="bg-white border border-[#e3e8ee] rounded-xl p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2 text-[#2c3b6e] border-b border-[#f7f8f9] pb-4">
              <Newspaper className="w-5 h-5 text-slate-900" />
              <h3 className="font-bold text-slate-900">Блок «О нас пишут» (Пресса)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Заголовок</label>
                  <input 
                    type="text" 
                    value={pressSection.title} 
                    onChange={(e) => { setPressSection({ ...pressSection, title: e.target.value }); setHasChanges(true); }} 
                    className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3.5 py-2.5 rounded-xl outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Описание</label>
                  <textarea 
                    value={pressSection.description} 
                    onChange={(e) => { setPressSection({ ...pressSection, description: e.target.value }); setHasChanges(true); }} 
                    rows={3}
                    className="w-full text-[13px] font-medium text-[#4f566b] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3.5 py-2.5 rounded-xl outline-none transition-all resize-none"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Список изданий (через запятую)</label>
                  <textarea 
                    rows={4} 
                    value={pressSection.brands.join(", ")} 
                    onChange={(e) => { setPressSection({ ...pressSection, brands: e.target.value.split(",").map(s => s.trim()).filter(s => s) }); setHasChanges(true); }} 
                    className="w-full text-[13px] font-medium text-[#4f566b] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3.5 py-2.5 rounded-xl outline-none transition-all resize-none" 
                    placeholder="VOGUE, ELLE, GQ..."
                  />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {pressSection.brands.map((brand, i) => (
                    <span key={i} className="px-3 py-1 bg-[#2c3b6e]/5 text-[#2c3b6e] text-[10px] font-bold uppercase tracking-widest rounded-full">
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Floating Save Button */}
        <AnimatePresence>
          {hasChanges && (
            <motion.div 
              initial={{ y: 100, x: "-50%" }}
              animate={{ y: 0, x: "-50%" }}
              exit={{ y: 100, x: "-50%" }}
              className="fixed bottom-6 left-1/2 z-50"
            >
              <button 
                onClick={handleSave}
                disabled={loading}
                className="bg-[#2c3b6e] text-white px-6 py-3 rounded-full border border-[#2c3b6e] hover:bg-[#232f58] shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5 font-bold text-[13px] group cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                Сохранить изменения
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      </div>

      {/* Custom Delete Modal (Quiet Luxury Style) */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowDeleteModal(false)}
               className="absolute inset-0 bg-[#1a1f36]/40 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#e3e8ee]"
             >
                <div className="p-8 text-center">
                   <div className="w-16 h-16 bg-[#cd5c5c]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Trash2 className="w-8 h-8 text-[#cd5c5c]" />
                   </div>
                   <h3 className="text-xl font-bold text-[#1a1f36] mb-3 tracking-tight">Удалить этот слайд?</h3>
                   <p className="text-[14px] text-[#4f566b] leading-relaxed mb-8">
                     Это действие нельзя будет отменить. Слайд будет навсегда удален из вашей Hero-секции.
                   </p>
                   <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setShowDeleteModal(false)}
                        className="flex-1 py-4 bg-white text-[#1a1f36] border border-[#e3e8ee] rounded-2xl font-bold text-[14px] hover:bg-[#f7f8f9] transition-all cursor-pointer"
                      >
                        Отмена
                      </button>
                      <button 
                        onClick={handleDeleteSlide}
                        className="flex-1 py-4 bg-[#cd5c5c] text-white rounded-2xl font-bold text-[14px] hover:bg-[#b04b4b] transition-all shadow-lg shadow-[#cd5c5c]/10 cursor-pointer"
                      >
                        Да, удалить
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
