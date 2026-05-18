"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Save, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Phone,
  Layout,
  Type
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FAQQuestion {
  q: string;
  a: string;
}

interface FAQCategory {
  category: string;
  questions: FAQQuestion[];
}

interface FAQData {
  categories: FAQCategory[];
  cta: {
    title: string;
    subtitle: string;
    telegram: string;
    phone: string;
  };
}

export default function FAQAdminPage() {
  const [data, setData] = useState<FAQData | null>(null);
  const [initialData, setInitialData] = useState<FAQData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const hasUnsavedChanges = JSON.stringify(data) !== JSON.stringify(initialData);

  useEffect(() => {
    fetchFaq();
  }, []);

  const fetchFaq = async () => {
    try {
      const res = await fetch(`/api/v1/pages/faq?t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        // Handle both old list-only and new object structures
        const items = json.data;
        let formattedData: FAQData;
        
        if (Array.isArray(items)) {
          formattedData = {
            categories: items,
            cta: {
              title: "Не нашли ответ?",
              subtitle: "Наша служба поддержки готова помочь вам в любое время.",
              telegram: "https://t.me/liberty_wear",
              phone: "+998 71 200 00 00"
            }
          };
        } else {
          formattedData = items;
        }

        setData(formattedData);
        setInitialData(JSON.parse(JSON.stringify(formattedData)));
      }
    } catch (err) {
      console.error("Failed to fetch FAQ:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges || saving) return;
    
    setSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/v1/pages/faq", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ data })
      });

      if (res.ok) {
        setInitialData(JSON.parse(JSON.stringify(data)));
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

  const updateCTAField = (field: keyof FAQData["cta"], value: string) => {
    if (!data) return;
    setData({
      ...data,
      cta: { ...data.cta, [field]: value }
    });
  };

  const addCategory = () => {
    if (!data) return;
    const newCategories = [...data.categories];
    newCategories.push({ category: "Новая категория", questions: [{ q: "", a: "" }] });
    setData({ ...data, categories: newCategories });
  };

  const removeCategory = (index: number) => {
    if (!data) return;
    const newCategories = [...data.categories];
    newCategories.splice(index, 1);
    setData({ ...data, categories: newCategories });
    setDeleteConfirm(null);
  };

  const updateCategoryName = (index: number, name: string) => {
    if (!data) return;
    const newCategories = [...data.categories];
    newCategories[index].category = name;
    setData({ ...data, categories: newCategories });
  };

  const addQuestion = (catIndex: number) => {
    if (!data) return;
    const newCategories = [...data.categories];
    newCategories[catIndex].questions.push({ q: "", a: "" });
    setData({ ...data, categories: newCategories });
  };

  const removeQuestion = (catIndex: number, qIndex: number) => {
    if (!data) return;
    const newCategories = [...data.categories];
    newCategories[catIndex].questions.splice(qIndex, 1);
    setData({ ...data, categories: newCategories });
  };

  const updateQuestion = (catIndex: number, qIndex: number, field: "q" | "a", value: string) => {
    if (!data) return;
    const newCategories = [...data.categories];
    newCategories[catIndex].questions[qIndex][field] = value;
    setData({ ...data, categories: newCategories });
  };

  const moveCategory = (index: number, direction: "up" | "down") => {
    if (!data) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === data.categories.length - 1) return;
    
    const newCategories = [...data.categories];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];
    setData({ ...data, categories: newCategories });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-150 rounded" />
            <div className="h-3.5 w-64 bg-slate-100 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-36 bg-slate-100 rounded" />
            <div className="h-8 w-24 bg-slate-100 rounded" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-[#e3e8ee] rounded-lg p-5 space-y-4">
                <div className="h-4 w-1/3 bg-slate-150 rounded" />
                <div className="h-12 w-full bg-slate-50 border border-[#e3e8ee] rounded" />
                <div className="h-12 w-full bg-slate-50 border border-[#e3e8ee] rounded" />
              </div>
            ))}
          </div>
          <div className="xl:col-span-4 bg-white border border-[#e3e8ee] rounded-lg p-6 space-y-6">
            <div className="h-4 w-1/2 bg-slate-150 rounded" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-full bg-slate-50 border border-[#e3e8ee] rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
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
                <p className="text-[14px] font-bold tracking-tight">{message.type === "success" ? "Успешно" : "Ошибка"}</p>
                <p className="text-[12px] text-white/70 font-medium">{message.text}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {deleteConfirm !== null && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden z-[111] mx-4"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-[#cd5c5c]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-[#cd5c5c]" />
                </div>
                <h3 className="text-[18px] font-bold text-[#1a1f36] mb-2">Удалить категорию?</h3>
                <p className="text-[14px] text-[#4f566b] mb-6 px-4">
                  Это действие удалит категорию <span className="font-bold">"{data.categories[deleteConfirm]?.category}"</span> и все вопросы в ней.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2.5 text-[13px] font-bold text-[#4f566b] bg-[#f7f8f9] rounded-xl hover:bg-[#e3e8ee] transition-all">Отмена</button>
                  <button onClick={() => removeCategory(deleteConfirm)} className="px-4 py-2.5 text-[13px] font-bold text-white bg-[#cd5c5c] rounded-xl hover:bg-[#b34b4b] transition-all shadow-lg shadow-[#cd5c5c]/20">Удалить всё</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-6 animate-in fade-in duration-700 pb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight mb-0.5">Вопросы и Ответы (FAQ)</h1>
            <p className="text-[13px] text-[#4f566b]">Управление разделами помощи и контактными данными поддержки.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={addCategory}
              className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold text-[#4f566b] bg-white border border-[#e3e8ee] rounded-md hover:bg-[#f7f8f9] transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Добавить категорию
            </button>
            <button 
              onClick={handleSave}
              disabled={saving || !hasUnsavedChanges}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold rounded-md transition-all border",
                hasUnsavedChanges ? "text-white bg-[#2c3b6e] border-[#2c3b6e] hover:bg-[#232f58]" : "text-[#a3acb9] bg-[#f7f8f9] border-[#e3e8ee] cursor-not-allowed"
              )}
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Сохранить
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Main Content (Categories) */}
          <div className="xl:col-span-8 space-y-4">
            {data.categories.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-[#e3e8ee] rounded-xl">
                <p className="text-[#4f566b] text-[14px]">Список FAQ пуст. Добавьте первую категорию.</p>
              </div>
            )}
            {data.categories.map((category, catIdx) => (
              <motion.div key={catIdx} layout className="bg-white border border-[#e3e8ee] rounded-lg overflow-hidden group transition-all">
                <div className="bg-[#f7f8f9]/50 px-4 py-2.5 border-b border-[#e3e8ee] flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveCategory(catIdx, "up")} disabled={catIdx === 0} className="text-[#4f566b] hover:text-[#2c3b6e] disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5" /></button>
                      <button onClick={() => moveCategory(catIdx, "down")} disabled={catIdx === data.categories.length - 1} className="text-[#4f566b] hover:text-[#2c3b6e] disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5" /></button>
                    </div>
                    <input 
                      type="text" 
                      value={category.category}
                      onChange={(e) => updateCategoryName(catIdx, e.target.value)}
                      className="bg-transparent text-[14px] font-bold text-[#1a1f36] outline-none border-b border-transparent focus:border-[#2c3b6e]/30 w-full max-w-md"
                      placeholder="Название категории"
                    />
                  </div>
                  <button onClick={() => setDeleteConfirm(catIdx)} className="p-1.5 text-[#4f566b] hover:text-[#cd5c5c] hover:bg-[#cd5c5c]/5 rounded-md transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-3">
                    {category.questions.map((q, qIdx) => (
                      <div key={qIdx} className="p-3 bg-white border border-[#e3e8ee] rounded-lg space-y-3 relative group/q">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Вопрос</label>
                              <input type="text" value={q.q} onChange={(e) => updateQuestion(catIdx, qIdx, "q", e.target.value)} className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-2.5 py-1.5 rounded-md outline-none transition-all" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Ответ</label>
                              <textarea value={q.a} onChange={(e) => updateQuestion(catIdx, qIdx, "a", e.target.value)} rows={2} className="w-full text-[13px] font-medium text-[#4f566b] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-2.5 py-1.5 rounded-md outline-none transition-all resize-none" />
                            </div>
                          </div>
                          <button onClick={() => removeQuestion(catIdx, qIdx)} className="mt-5 p-1.5 text-[#4f566b] hover:text-[#cd5c5c] hover:bg-[#cd5c5c]/5 rounded-md transition-all md:opacity-0 group-hover/q:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => addQuestion(catIdx)} className="w-full py-2 border-2 border-dashed border-[#e3e8ee] hover:border-[#2c3b6e]/30 hover:bg-[#f7f8f9] rounded-lg text-[12px] font-bold text-[#4f566b] hover:text-[#2c3b6e] transition-all flex items-center justify-center gap-2"><Plus className="w-3.5 h-3.5" /> Добавить вопрос</button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sidebar (CTA Settings) */}
          <div className="xl:col-span-4 space-y-6">
            <section className="bg-white border border-[#e3e8ee] rounded-lg p-6 space-y-6">
              <div className="flex items-center gap-2 text-[#2c3b6e] border-b border-[#e3e8ee] pb-4 mb-2">
                <Type className="w-4 h-4" />
                <h2 className="text-[15px] font-bold uppercase tracking-wider">Блок поддержки (CTA)</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Заголовок</label>
                  <input 
                    type="text" 
                    value={data.cta.title}
                    onChange={(e) => updateCTAField('title', e.target.value)}
                    className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Подзаголовок</label>
                  <textarea 
                    value={data.cta.subtitle}
                    onChange={(e) => updateCTAField('subtitle', e.target.value)}
                    rows={2}
                    className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3 py-2 rounded-lg outline-none transition-all resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2">
                    <MessageCircle className="w-3 h-3" /> Ссылка на Telegram
                  </label>
                  <input 
                    type="text" 
                    value={data.cta.telegram}
                    onChange={(e) => updateCTAField('telegram', e.target.value)}
                    className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Телефон
                  </label>
                  <input 
                    type="text" 
                    value={data.cta.phone}
                    onChange={(e) => updateCTAField('phone', e.target.value)}
                    className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Preview Hint */}
            <div className="bg-[#f7f8f9] rounded-lg p-4 border border-[#e3e8ee]">
              <div className="flex items-center gap-2 text-[#4f566b] mb-2">
                <Layout className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-widest">Совет</span>
              </div>
              <p className="text-[11px] text-[#4f566b] leading-relaxed">
                Эти данные отображаются в нижней части страницы FAQ, помогая клиентам связаться с вами напрямую, если они не нашли нужный ответ.
              </p>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div initial={{ y: 100, x: "-50%" }} animate={{ y: 0, x: "-50%" }} exit={{ y: 100, x: "-50%" }} className="fixed bottom-6 left-1/2 z-50">
              <button onClick={handleSave} disabled={saving} className="bg-[#2c3b6e] text-white px-6 py-3 rounded-full border border-[#2c3b6e] hover:bg-[#232f58] shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5 font-bold text-[13px]">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Сохранить изменения
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
