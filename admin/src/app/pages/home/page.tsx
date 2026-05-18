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
  const [activeTab, setActiveTab] = useState("Hero Секция");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Data State
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [categoriesSection, setCategoriesSection] = useState({ title: "", description: "" });
  const [newArrivalsSection, setNewArrivalsSection] = useState({ title: "", description: "" });
  const [editorialSection, setEditorialSection] = useState({ overline: "", title1: "", title2: "", description: "", button1: "", button2: "", imageUrl: "" });
  const [newsletterSection, setNewsletterSection] = useState({ title: "", description: "" });
  const [pressSection, setPressSection] = useState({ title: "", description: "", brands: [] as string[] });

  const tabs = ["Hero Секция", "Категории", "Новинки", "О бренде", "Рассылка", "Пресса"];

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
        if (data.editorial) setEditorialSection(data.editorial);
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
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (activeTab === "Hero Секция") {
            updateSlide("imageUrl", reader.result as string);
        } else if (activeTab === "О бренде") {
            setEditorialSection({ ...editorialSection, imageUrl: reader.result as string });
            setHasChanges(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2c3b6e]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight mb-1">Контент Главной</h1>
          <p className="text-[14px] text-[#4f566b]">Управление визуалом и текстами вашего магазина в реальном времени.</p>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={handleSave}
             disabled={loading || !hasChanges}
             className="flex items-center gap-2 px-6 py-2 text-[13px] font-semibold text-white bg-[#2c3b6e] border border-[#2c3b6e] rounded-md hover:bg-[#232f58] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
           >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Сохранить изменения
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 overflow-x-auto w-full scrollbar-hide border-b border-[#e3e8ee]">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-3 text-[14px] font-semibold transition-all relative whitespace-nowrap",
                activeTab === tab ? "text-[#2c3b6e]" : "text-[#4f566b] hover:text-[#1a1f36]"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTabHome"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2c3b6e]"
                />
              )}
            </button>
          ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "Hero Секция" && (
          <div className="space-y-6">
             <div className="flex items-center justify-between px-1">
                <h3 className="text-[11px] font-bold text-[#4f566b] uppercase tracking-widest">Список слайдов</h3>
                <button 
                  onClick={() => {
                    setHeroSlides([...heroSlides, { titleFirst: "", titleSecond: "", titleThird: "", subtitle: "", primaryBtn: "", secondaryBtn: "", imageUrl: "" }]);
                    setActiveSlideIdx(heroSlides.length);
                    setHasChanges(true);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-[#2c3b6e] hover:bg-[#2c3b6e]/5 rounded transition-all"
                >
                   <Plus className="w-3 h-3" /> Добавить
                </button>
             </div>
             <div className="flex items-center gap-3 overflow-x-auto py-3 px-1 scrollbar-hide">
                {heroSlides.map((slide, idx) => (
                  <div key={idx} onClick={() => setActiveSlideIdx(idx)} className={cn("flex-shrink-0 group relative w-16 h-16 rounded-xl border-2 transition-all cursor-pointer overflow-visible", activeSlideIdx === idx ? "border-[#2c3b6e] bg-white scale-110 z-10" : "border-transparent bg-[#f7f8f9] hover:border-[#e3e8ee] hover:scale-105")}>
                     <div className="w-full h-full rounded-lg overflow-hidden">
                        {slide.imageUrl ? <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-4 h-4" /></div>}
                     </div>
                  </div>
                ))}
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-[#e3e8ee] rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Наполнение #{activeSlideIdx + 1}</label>
                    {heroSlides.length > 1 && (
                      <button 
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-[#cd5c5c] hover:bg-[#cd5c5c]/5 px-2 py-1 rounded transition-all"
                      >
                        <Trash2 className="w-3 h-3" /> Удалить слайд
                      </button>
                    )}
                  </div>
                  <input placeholder="Надзаголовок" value={heroSlides[activeSlideIdx]?.titleThird || ""} onChange={(e) => updateSlide("titleThird", e.target.value)} className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none" />
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Строка 1" value={heroSlides[activeSlideIdx]?.titleFirst || ""} onChange={(e) => updateSlide("titleFirst", e.target.value)} className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none" />
                    <input placeholder="Строка 2" value={heroSlides[activeSlideIdx]?.titleSecond || ""} onChange={(e) => updateSlide("titleSecond", e.target.value)} className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none" />
                  </div>
                  <textarea rows={4} placeholder="Описание" value={heroSlides[activeSlideIdx]?.subtitle || ""} onChange={(e) => updateSlide("subtitle", e.target.value)} className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none resize-none" />
                </div>
                <div className="bg-white border border-[#e3e8ee] rounded-xl p-6 space-y-4">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Изображение</label>
                  <div onClick={() => fileInputRef.current?.click()} className="relative aspect-video bg-[#f7f8f9] border-2 border-dashed border-[#e3e8ee] rounded-xl overflow-hidden cursor-pointer flex items-center justify-center">
                    {heroSlides[activeSlideIdx]?.imageUrl ? <img src={heroSlides[activeSlideIdx].imageUrl} alt="" className="w-full h-full object-cover" /> : <Plus className="w-6 h-6 text-slate-300" />}
                  </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === "Категории" && (
          <div className="bg-white border border-[#e3e8ee] rounded-xl p-8 max-w-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-[#f7f8f9] pb-4">
               <Layers className="w-5 h-5 text-[#2c3b6e]" />
               <h3 className="font-bold text-[#1a1f36]">Настройка блока «Наши Коллекции»</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Заголовок</label>
                <input value={categoriesSection.title} onChange={(e) => { setCategoriesSection({ ...categoriesSection, title: e.target.value }); setHasChanges(true); }} className="w-full px-4 py-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl text-[14px] outline-none focus:border-[#2c3b6e] transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Описание</label>
                <textarea rows={4} value={categoriesSection.description} onChange={(e) => { setCategoriesSection({ ...categoriesSection, description: e.target.value }); setHasChanges(true); }} className="w-full px-4 py-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl text-[14px] outline-none focus:border-[#2c3b6e] transition-all resize-none" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Новинки" && (
          <div className="bg-white border border-[#e3e8ee] rounded-xl p-8 max-w-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-[#f7f8f9] pb-4">
               <ShoppingBag className="w-5 h-5 text-[#2c3b6e]" />
               <h3 className="font-bold text-[#1a1f36]">Настройка блока «Новинки»</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Заголовок</label>
                <input value={newArrivalsSection.title} onChange={(e) => { setNewArrivalsSection({ ...newArrivalsSection, title: e.target.value }); setHasChanges(true); }} className="w-full px-4 py-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl text-[14px] outline-none focus:border-[#2c3b6e] transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Описание</label>
                <textarea rows={4} value={newArrivalsSection.description} onChange={(e) => { setNewArrivalsSection({ ...newArrivalsSection, description: e.target.value }); setHasChanges(true); }} className="w-full px-4 py-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl text-[14px] outline-none focus:border-[#2c3b6e] transition-all resize-none" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "О бренде" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-white border border-[#e3e8ee] rounded-xl p-6 space-y-4">
                <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Текстовый контент</label>
                <input placeholder="Надзаголовок" value={editorialSection.overline} onChange={(e) => { setEditorialSection({ ...editorialSection, overline: e.target.value }); setHasChanges(true); }} className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none" />
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Заголовок 1" value={editorialSection.title1} onChange={(e) => { setEditorialSection({ ...editorialSection, title1: e.target.value }); setHasChanges(true); }} className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none" />
                  <input placeholder="Заголовок 2" value={editorialSection.title2} onChange={(e) => { setEditorialSection({ ...editorialSection, title2: e.target.value }); setHasChanges(true); }} className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none" />
                </div>
                <textarea rows={4} placeholder="Описание" value={editorialSection.description} onChange={(e) => { setEditorialSection({ ...editorialSection, description: e.target.value }); setHasChanges(true); }} className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none resize-none" />
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Кнопка 1" value={editorialSection.button1} onChange={(e) => { setEditorialSection({ ...editorialSection, button1: e.target.value }); setHasChanges(true); }} className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none" />
                  <input placeholder="Кнопка 2" value={editorialSection.button2} onChange={(e) => { setEditorialSection({ ...editorialSection, button2: e.target.value }); setHasChanges(true); }} className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none" />
                </div>
             </div>
             <div className="bg-white border border-[#e3e8ee] rounded-xl p-6 space-y-4">
                <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Изображение Эдиториал</label>
                <div onClick={() => fileInputRef.current?.click()} className="relative aspect-[4/5] bg-[#f7f8f9] border-2 border-dashed border-[#e3e8ee] rounded-xl overflow-hidden cursor-pointer flex items-center justify-center group">
                  {editorialSection.imageUrl ? <img src={editorialSection.imageUrl} alt="" className="w-full h-full object-cover" /> : <Plus className="w-6 h-6 text-slate-300" />}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <span className="px-4 py-2 bg-white rounded-lg text-[11px] font-bold text-[#1a1f36]">Изменить</span>
                  </div>
                </div>
                <input placeholder="Прямая ссылка" value={editorialSection.imageUrl} onChange={(e) => { setEditorialSection({ ...editorialSection, imageUrl: e.target.value }); setHasChanges(true); }} className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg text-[13px] outline-none mt-2" />
             </div>
          </div>
        )}

        {activeTab === "Рассылка" && (
          <div className="bg-white border border-[#e3e8ee] rounded-xl p-8 max-w-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-[#f7f8f9] pb-4">
               <Mail className="w-5 h-5 text-[#2c3b6e]" />
               <h3 className="font-bold text-[#1a1f36]">Настройка блока рассылки</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Заголовок</label>
                <input value={newsletterSection.title} onChange={(e) => { setNewsletterSection({ ...newsletterSection, title: e.target.value }); setHasChanges(true); }} className="w-full px-4 py-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl text-[14px] outline-none focus:border-[#2c3b6e] transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Описание</label>
                <textarea rows={4} value={newsletterSection.description} onChange={(e) => { setNewsletterSection({ ...newsletterSection, description: e.target.value }); setHasChanges(true); }} className="w-full px-4 py-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl text-[14px] outline-none focus:border-[#2c3b6e] transition-all resize-none" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Пресса" && (
          <div className="bg-white border border-[#e3e8ee] rounded-xl p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-[#f7f8f9] pb-4">
               <Newspaper className="w-5 h-5 text-[#2c3b6e]" />
               <h3 className="font-bold text-[#1a1f36]">Блок «О нас пишут»</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Заголовок</label>
                    <input value={pressSection.title} onChange={(e) => { setPressSection({ ...pressSection, title: e.target.value }); setHasChanges(true); }} className="w-full px-4 py-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl text-[14px] outline-none focus:border-[#2c3b6e] transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Описание</label>
                    <textarea rows={4} value={pressSection.description} onChange={(e) => { setPressSection({ ...pressSection, description: e.target.value }); setHasChanges(true); }} className="w-full px-4 py-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl text-[14px] outline-none focus:border-[#2c3b6e] transition-all resize-none" />
                  </div>
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Список изданий (через запятую)</label>
                  <textarea 
                    rows={4} 
                    value={pressSection.brands.join(", ")} 
                    onChange={(e) => { setPressSection({ ...pressSection, brands: e.target.value.split(",").map(s => s.trim()).filter(s => s) }); setHasChanges(true); }} 
                    className="w-full px-4 py-3 bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl text-[14px] outline-none focus:border-[#2c3b6e] transition-all resize-none" 
                    placeholder="VOGUE, ELLE, GQ..."
                  />
                  <div className="flex flex-wrap gap-2 pt-2">
                     {pressSection.brands.map((brand, i) => (
                       <span key={i} className="px-3 py-1 bg-[#2c3b6e]/5 text-[#2c3b6e] text-[10px] font-bold uppercase tracking-widest rounded-full">{brand}</span>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      {/* Notifications */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10001]">
             <div className="flex items-center gap-3 px-6 py-3 bg-[#1a1f36] text-white rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"><CheckCircle2 className="w-4 h-4" /></div>
                <span className="text-[13px] font-bold tracking-tight">Изменения успешно сохранены!</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                        className="flex-1 py-4 bg-white text-[#1a1f36] border border-[#e3e8ee] rounded-2xl font-bold text-[14px] hover:bg-[#f7f8f9] transition-all"
                      >
                        Отмена
                      </button>
                      <button 
                        onClick={handleDeleteSlide}
                        className="flex-1 py-4 bg-[#cd5c5c] text-white rounded-2xl font-bold text-[14px] hover:bg-[#b04b4b] transition-all shadow-lg shadow-[#cd5c5c]/10"
                      >
                        Да, удалить
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
