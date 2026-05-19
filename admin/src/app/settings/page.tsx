"use client";

import { useState, useEffect } from "react";
import { 
  Save, 
  RefreshCw, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Info,
  Link as LinkIcon,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FooterSection {
  title: string;
  links: { label: string; href: string }[];
}

interface SettingsData {
  company: {
    name: string;
    inn: string;
    ogrn: string;
    address: string;
    phone: string;
    email: string;
  };
  footer: {
    brandText: string;
    brandSubtitle: string;
    sections: FooterSection[];
    disclaimer: string;
    copyright: string;
  };
  legalLinks: { label: string; href: string }[];
}

const defaultData: SettingsData = {
  company: {
    name: "ООО «Халса» (Halsa)",
    inn: "7728483490",
    ogrn: "1197746509113",
    address: "117 418, Черёмушки, ул. Зюзинская, д. 6, к. 2",
    phone: "+998 90 123 45 67",
    email: "info@libertywear.uz"
  },
  footer: {
    brandText: "LIBERTYWEAR",
    brandSubtitle: "ОДЕЖДА ВАШЕЙ СВОБОДЫ",
    sections: [
      {
        title: "Магазин",
        links: [
          { label: "Новинки", href: "/shop?new=true" },
          { label: "Бестселлеры", href: "/shop?bestsellers=true" },
          { label: "Коллекции", href: "/collections" }
        ]
      },
      {
        title: "Компания",
        links: [
          { label: "Наша история", href: "/about" },
          { label: "Устойчивое развитие", href: "/sustainability" },
          { label: "Журнал", href: "/blog" }
        ]
      }
    ],
    disclaimer: "Все рекомендации не носят предписательного характера. Размещённые на сайте продукты не являются лекарственными средствами. Halsa не осуществляет медицинскую деятельность и не оказывает медицинские услуги.",
    copyright: "© 2018 — 2026 ООО «Халса». Содержимое Сайта является интеллектуальной собственностью. Копирование и использование запрещено."
  },
  legalLinks: [
    { label: "Политика конфиденциальности", href: "/privacy" },
    { label: "Условия использования", href: "/terms" }
  ]
};

const AVAILABLE_ROUTES = [
  { label: "Главная", value: "/" },
  { label: "Магазин (Все)", value: "/shop" },
  { label: "Новинки", value: "/shop?new=true" },
  { label: "Бестселлеры", value: "/shop?bestsellers=true" },
  { label: "Коллекции", value: "/collections" },
  { label: "Наша история", value: "/about" },
  { label: "Устойчивое развитие", value: "/sustainability" },
  { label: "Журнал", value: "/blog" },
  { label: "Контакты", value: "/contact" },
  { label: "FAQ", value: "/faq" },
  { label: "Политика конфиденциальности", value: "/privacy" },
  { label: "Условия использования", value: "/terms" }
];

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData>(defaultData);
  const [initialData, setInitialData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{sIdx: number, lIdx: number} | null>(null);

  const hasUnsavedChanges = JSON.stringify(data) !== JSON.stringify(initialData);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`/api/v1/pages/settings?t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        const settings = json.data || defaultData;
        const merged = {
          ...defaultData,
          ...settings,
          company: { ...defaultData.company, ...(settings.company || {}) },
          footer: { 
            ...defaultData.footer, 
            ...(settings.footer || {}),
            sections: settings.footer?.sections || defaultData.footer.sections
          }
        };
        setData(merged);
        setInitialData(JSON.parse(JSON.stringify(merged)));
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
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
      const res = await fetch("/api/v1/pages/settings", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ data: data })
      });
      if (res.ok) {
        setInitialData(JSON.parse(JSON.stringify(data)));
        setMessage({ type: "success", text: "Настройки успешно сохранены" });
      } else {
        setMessage({ type: "error", text: "Не удалось сохранить настройки" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Ошибка соединения с сервером" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const updateLink = (sectionIdx: number, linkIdx: number, field: 'label' | 'href', value: string) => {
    const newData = { ...data };
    newData.footer.sections[sectionIdx].links[linkIdx][field] = value;
    setData(newData);
  };

  const addLink = (sectionIdx: number) => {
    const newData = { ...data };
    newData.footer.sections[sectionIdx].links.push({ label: "Новая ссылка", href: "#" });
    setData(newData);
  };

  const removeLink = (sectionIdx: number, linkIdx: number) => {
    const newData = { ...data };
    newData.footer.sections[sectionIdx].links.splice(linkIdx, 1);
    setData(newData);
    setDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-150 rounded" />
            <div className="h-3.5 w-64 bg-slate-100 rounded" />
          </div>
          <div className="h-8 w-24 bg-slate-100 rounded" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#e3e8ee] rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-[#f7f8f9] border-b border-[#e3e8ee] h-10 flex items-center">
                <div className="h-4 w-32 bg-slate-200 rounded" />
              </div>
              <div className="p-5 space-y-4">
                <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
                  <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
                </div>
                <div className="h-16 bg-slate-50 border border-[#e3e8ee] rounded" />
              </div>
            </div>
            <div className="bg-white border border-[#e3e8ee] rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-[#f7f8f9] border-b border-[#e3e8ee] h-10 flex items-center">
                <div className="h-4 w-32 bg-slate-200 rounded" />
              </div>
              <div className="p-5 space-y-4">
                <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
                <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
              </div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-[#e3e8ee] rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-[#f7f8f9] border-b border-[#e3e8ee] h-10 flex items-center justify-between">
                <div className="h-4 w-40 bg-slate-200 rounded" />
                <div className="h-6 w-16 bg-slate-100 rounded" />
              </div>
              <div className="p-5 space-y-6">
                {[1, 2].map((sec) => (
                  <div key={sec} className="space-y-3">
                    <div className="h-4 w-1/4 bg-slate-150 rounded" />
                    <div className="space-y-2">
                      {[1, 2, 3].map((link) => (
                        <div key={link} className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Dynamic Toast Notification */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[999999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-[12px] font-black bg-white"
            style={{
              borderColor: message.type === "success" ? "#e3e8ee" : "#fcd5d5",
              color: message.type === "success" ? "#0f172a" : "#991b1b"
            }}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            )}
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-2 text-slate-400 hover:text-slate-900 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)} className="fixed inset-0 bg-black/40 backdrop-blur-sm cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden z-[111] mx-4 border border-[#e3e8ee]">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-[16px] font-black text-slate-900 mb-1">Удалить ссылку?</h3>
                <p className="text-[13px] text-[#4f566b] mb-6 px-2 leading-relaxed">Это действие удалит ссылку <span className="font-bold">"{data.footer.sections[deleteConfirm.sIdx].links[deleteConfirm.lIdx].label}"</span>.</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setDeleteConfirm(null)} className="px-3 py-2 text-[12px] font-black text-[#4f566b] bg-[#f7f8f9] border border-[#e3e8ee] rounded-lg hover:bg-slate-50 transition-all cursor-pointer">Отмена</button>
                  <button onClick={() => removeLink(deleteConfirm.sIdx, deleteConfirm.lIdx)} className="px-3 py-2 text-[12px] font-black text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all cursor-pointer">Удалить</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-6 animate-in fade-in duration-700 pb-32">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight mb-0.5">Глобальные настройки</h1>
            <p className="text-[13px] text-[#4f566b]">Управление данными компании, контактами и структурой сайта.</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Company Block */}
            <div className="bg-white border border-[#e3e8ee] rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="bg-[#f7f8f9] px-4 py-3 border-b border-[#e3e8ee] flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-slate-800" />
                <h2 className="text-[11px] font-black text-[#4f566b] uppercase tracking-wider">Данные компании</h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#a3acb9] uppercase tracking-widest px-0.5">Название организации</label>
                  <input 
                    type="text" 
                    value={data.company.name} 
                    onChange={(e) => setData({...data, company: {...data.company, name: e.target.value}})} 
                    className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] focus:border-slate-400 focus:bg-white text-[13px] font-medium rounded-lg outline-none transition-all duration-200" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#a3acb9] uppercase tracking-widest px-0.5">ИНН</label>
                    <input 
                      type="text" 
                      value={data.company.inn} 
                      onChange={(e) => setData({...data, company: {...data.company, inn: e.target.value}})} 
                      className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] focus:border-slate-400 focus:bg-white text-[13px] font-medium rounded-lg outline-none transition-all duration-200" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#a3acb9] uppercase tracking-widest px-0.5">ОГРН</label>
                    <input 
                      type="text" 
                      value={data.company.ogrn} 
                      onChange={(e) => setData({...data, company: {...data.company, ogrn: e.target.value}})} 
                      className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] focus:border-slate-400 focus:bg-white text-[13px] font-medium rounded-lg outline-none transition-all duration-200" 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#a3acb9] uppercase tracking-widest px-0.5">Юридический адрес</label>
                  <textarea 
                    value={data.company.address} 
                    onChange={(e) => setData({...data, company: {...data.company, address: e.target.value}})} 
                    className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] focus:border-slate-400 focus:bg-white text-[13px] font-medium rounded-lg outline-none transition-all h-20 resize-none leading-relaxed duration-200" 
                  />
                </div>
              </div>
            </div>

            {/* Contacts Block */}
            <div className="bg-white border border-[#e3e8ee] rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="bg-[#f7f8f9] px-4 py-3 border-b border-[#e3e8ee] flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-800" />
                <h2 className="text-[11px] font-black text-[#4f566b] uppercase tracking-wider">Контакты поддержки</h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#a3acb9] uppercase tracking-widest px-0.5">Телефон для связи</label>
                  <input 
                    type="text" 
                    value={data.company.phone} 
                    onChange={(e) => setData({...data, company: {...data.company, phone: e.target.value}})} 
                    className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] focus:border-slate-400 focus:bg-white text-[13px] font-medium rounded-lg outline-none transition-all duration-200" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#a3acb9] uppercase tracking-widest px-0.5">Email адрес</label>
                  <input 
                    type="text" 
                    value={data.company.email} 
                    onChange={(e) => setData({...data, company: {...data.company, email: e.target.value}})} 
                    className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] focus:border-slate-400 focus:bg-white text-[13px] font-medium rounded-lg outline-none transition-all duration-200" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Footer Structure Block */}
            <div className="bg-white border border-[#e3e8ee] rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="bg-[#f7f8f9] px-4 py-3 border-b border-[#e3e8ee] flex items-center gap-2.5">
                <LinkIcon className="w-4 h-4 text-slate-800" />
                <h2 className="text-[11px] font-black text-[#4f566b] uppercase tracking-wider">Структура подвала (Footer)</h2>
              </div>
              <div className="p-5 space-y-6">
                {data.footer.sections.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">{sIdx + 1}</span>
                        <input 
                          type="text" 
                          value={section.title} 
                          onChange={(e) => { const newData = { ...data }; newData.footer.sections[sIdx].title = e.target.value; setData(newData); }} 
                          className="bg-transparent border-b border-transparent focus:border-slate-900 text-[12px] font-black text-slate-900 uppercase tracking-widest outline-none px-1 py-0.5" 
                        />
                      </div>
                      <button 
                        onClick={() => addLink(sIdx)} 
                        className="text-[10px] font-black text-slate-900 uppercase tracking-widest hover:bg-[#f7f8f9] px-2 py-1 rounded transition-all cursor-pointer border border-transparent hover:border-[#e3e8ee]"
                      >
                        + Добавить
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {section.links.map((link, lIdx) => (
                        <div key={lIdx} className="flex items-center gap-2.5 p-2 bg-[#fcfcfd] border border-[#e3e8ee] hover:border-slate-350 hover:bg-white hover:shadow-sm rounded-lg group transition-all duration-200">
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 pr-2 border-r border-[#e3e8ee]">
                              <input 
                                type="text" 
                                value={link.label} 
                                onChange={(e) => updateLink(sIdx, lIdx, 'label', e.target.value)} 
                                placeholder="Название ссылки" 
                                className="bg-transparent text-[12px] font-bold text-slate-900 outline-none w-full placeholder-slate-400" 
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <select 
                                value={link.href} 
                                onChange={(e) => updateLink(sIdx, lIdx, 'href', e.target.value)}
                                className="bg-transparent text-[12px] text-[#4f566b] outline-none cursor-pointer appearance-none hover:text-[#0f172a] font-medium transition-colors w-full"
                              >
                                <option value="" disabled>Выберите страницу</option>
                                {AVAILABLE_ROUTES.map((route) => (
                                  <option key={route.value} value={route.value}>{route.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <button 
                            onClick={() => setDeleteConfirm({sIdx, lIdx})} 
                            className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-md transition-all cursor-pointer shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Block */}
            <div className="bg-white border border-[#e3e8ee] rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="bg-[#f7f8f9] px-4 py-3 border-b border-[#e3e8ee] flex items-center gap-2.5">
                <Info className="w-4 h-4 text-slate-800" />
                <h2 className="text-[11px] font-black text-[#4f566b] uppercase tracking-wider">Юридическая информация</h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#a3acb9] uppercase tracking-widest px-0.5">Дисклеймер (Текст внизу)</label>
                  <textarea 
                    value={data.footer.disclaimer} 
                    onChange={(e) => setData({...data, footer: {...data.footer, disclaimer: e.target.value}})} 
                    className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] focus:border-slate-400 focus:bg-white text-[12px] font-medium rounded-lg outline-none transition-all h-20 resize-none leading-relaxed duration-200" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#a3acb9] uppercase tracking-widest px-0.5">Копирайт</label>
                  <input 
                    type="text" 
                    value={data.footer.copyright} 
                    onChange={(e) => setData({...data, footer: {...data.footer, copyright: e.target.value}})} 
                    className="w-full px-3 py-2 bg-[#f7f8f9] border border-[#e3e8ee] focus:border-slate-400 focus:bg-white text-[12px] font-medium rounded-lg outline-none transition-all duration-200" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating bottom save changes capsule */}
        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div 
              initial={{ y: 100, x: "-50%" }} 
              animate={{ y: 0, x: "-50%" }} 
              exit={{ y: 100, x: "-50%" }} 
              className="fixed bottom-8 left-1/2 z-[999] pointer-events-auto"
            >
              <button 
                onClick={handleSave} 
                disabled={saving} 
                className="bg-slate-900 text-white px-6 py-3 rounded-full border border-slate-900 hover:bg-slate-800 shadow-2xl transition-all flex items-center gap-2.5 font-black text-[13px] cursor-pointer"
              >
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
