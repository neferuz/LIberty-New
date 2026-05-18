"use client";

import { useState, useEffect } from "react";
import { 
  Save, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Clock,
  Layout,
  Type
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

export default function ContactAdminPage() {
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [initialData, setInitialData] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const hasUnsavedChanges = JSON.stringify(contactData) !== JSON.stringify(initialData);

  useEffect(() => {
    fetchContact();
  }, []);

  const fetchContact = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/pages/contact?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setContactData(data.data);
        setInitialData(JSON.parse(JSON.stringify(data.data)));
      }
    } catch (err) {
      console.error("Failed to fetch contact content:", err);
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
      const res = await fetch("http://localhost:8000/api/v1/pages/contact", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ data: contactData })
      });

      if (res.ok) {
        setInitialData(JSON.parse(JSON.stringify(contactData)));
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
    const newData = JSON.parse(JSON.stringify(contactData));
    const parts = path.split('.');
    let current = newData;
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    setContactData(newData);
  };

  const updatePhone = (index: number, value: string) => {
    const newData = JSON.parse(JSON.stringify(contactData));
    newData.info.phones[index] = value;
    setContactData(newData);
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-[#e3e8ee] rounded-lg p-6 space-y-6">
            <div className="h-4 w-1/3 bg-slate-150 rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
              <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
            </div>
            <div className="h-16 bg-slate-50 border border-[#e3e8ee] rounded" />
            <div className="space-y-3">
              <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
              <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white border border-[#e3e8ee] rounded-lg p-6 space-y-4">
              <div className="h-4 w-1/3 bg-slate-150 rounded" />
              <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
              <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
            </div>
            <div className="bg-white border border-[#e3e8ee] rounded-lg p-6 space-y-4">
              <div className="h-4 w-1/3 bg-slate-150 rounded" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
                <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contactData) return null;

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

      <div className="space-y-6 animate-in fade-in duration-700 pb-32 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight mb-0.5">Контакты</h1>
            <p className="text-[13px] text-[#4f566b]">Управление контактной информацией и текстами на странице.</p>
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Info */}
          <section className="bg-white border border-[#e3e8ee] rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2 text-[#2c3b6e] mb-2">
              <Layout className="w-4 h-4" />
              <h2 className="text-[15px] font-bold uppercase tracking-wider">Основная информация</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Надзаголовок</label>
                <input 
                  type="text" 
                  value={contactData.info.overline}
                  onChange={(e) => updateField('info.overline', e.target.value)}
                  className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3 py-2 rounded-lg outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Заголовок</label>
                <input 
                  type="text" 
                  value={contactData.info.title}
                  onChange={(e) => updateField('info.title', e.target.value)}
                  className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3 py-2 rounded-lg outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Адрес
              </label>
              <textarea 
                value={contactData.info.address}
                onChange={(e) => updateField('info.address', e.target.value)}
                rows={2}
                className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3 py-2 rounded-lg outline-none transition-all resize-none"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest flex items-center gap-2">
                <Phone className="w-3 h-3" /> Телефоны
              </label>
              {contactData.info.phones.map((phone, idx) => (
                <input 
                  key={idx}
                  type="text" 
                  value={phone}
                  onChange={(e) => updatePhone(idx, e.target.value)}
                  className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3 py-2 rounded-lg outline-none transition-all"
                />
              ))}
            </div>
          </section>

          <div className="space-y-6">
            {/* Work Hours */}
            <section className="bg-white border border-[#e3e8ee] rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#2c3b6e] mb-2">
                <Clock className="w-4 h-4" />
                <h2 className="text-[15px] font-bold uppercase tracking-wider">Режим работы</h2>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Будни и Суббота</label>
                  <input 
                    type="text" 
                    value={contactData.info.workHours.weekdays}
                    onChange={(e) => updateField('info.workHours.weekdays', e.target.value)}
                    className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Воскресенье</label>
                  <input 
                    type="text" 
                    value={contactData.info.workHours.sunday}
                    onChange={(e) => updateField('info.workHours.sunday', e.target.value)}
                    className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Form Settings */}
            <section className="bg-white border border-[#e3e8ee] rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#2c3b6e] mb-2">
                <Type className="w-4 h-4" />
                <h2 className="text-[15px] font-bold uppercase tracking-wider">Форма обратной связи</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Заголовок формы</label>
                  <input 
                    type="text" 
                    value={contactData.form.title}
                    onChange={(e) => updateField('form.title', e.target.value)}
                    className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Текст на кнопке</label>
                  <input 
                    type="text" 
                    value={contactData.form.button}
                    onChange={(e) => updateField('form.button', e.target.value)}
                    className="w-full text-[13px] font-medium text-[#1a1f36] bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>
              </div>
            </section>
          </div>
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
                className="bg-[#2c3b6e] text-white px-6 py-3 rounded-full border border-[#2c3b6e] hover:bg-[#232f58] shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5 font-bold text-[13px]"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Сохранить контакты
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
