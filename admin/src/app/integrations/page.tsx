"use client";

import { 
  Plus, 
  Settings2, 
  RefreshCw, 
  ExternalLink, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Database,
  Link2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function IntegrationsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bitrixEnabled, setBitrixEnabled] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/v1/pages/bitrix_integration");
      if (response.ok) {
        const result = await response.json();
        setBitrixEnabled(result.data?.enabled ?? true);
      }
    } catch (err) {
      console.error("Failed to fetch integration status:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleToggle = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/v1/pages/bitrix_integration", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          data: { enabled: !bitrixEnabled }
        }),
      });

      if (response.ok) {
        setBitrixEnabled(!bitrixEnabled);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    // Logic for "deleting" would be disabling and clearing config
    setBitrixEnabled(false);
    setShowDeleteModal(false);
    // Add real API call here if needed
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2c3b6e]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight mb-1">Интеграции</h1>
        <p className="text-[14px] text-[#4f566b]">Управляйте внешними сервисами и синхронизацией данных.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bitrix24 Card */}
        <motion.div 
          layoutId="bitrix-card"
          className="bg-white border border-[#e3e8ee] rounded-2xl overflow-hidden transition-all"
        >
          <div className="p-5">
             <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-[#2c3b6e]/5 rounded-xl flex items-center justify-center">
                   <Link2 className="w-5 h-5 text-[#2c3b6e]" />
                </div>
                <div className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                  bitrixEnabled ? "bg-green-50 text-green-600 border border-green-100" : "bg-slate-50 text-slate-400 border border-slate-100"
                )}>
                  {bitrixEnabled ? "On" : "Off"}
                </div>
             </div>
             
             <h3 className="text-[15px] font-bold text-[#1a1f36] mb-1">Bitrix24</h3>
             <p className="text-[11px] text-[#4f566b] leading-tight mb-5">
               Синхронизация каталога.
             </p>

             <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#f7f8f9] rounded-xl">
                   <span className="text-[12px] font-bold text-[#1a1f36]">Синхр.</span>
                   <button 
                     onClick={handleToggle}
                     disabled={loading}
                     className={cn(
                       "relative w-9 h-5 rounded-full transition-all duration-300 outline-none",
                       bitrixEnabled ? "bg-[#2c3b6e]" : "bg-slate-300"
                     )}
                   >
                      <div className={cn(
                        "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                        bitrixEnabled ? "left-4.5" : "left-0.5"
                      )} />
                   </button>
                </div>

                <div className="flex items-center gap-2">
                   <button 
                     className="flex-1 py-2 bg-white border border-[#e3e8ee] text-[#1a1f36] rounded-lg text-[11px] font-bold hover:bg-[#f7f8f9] transition-all"
                   >
                      Настроить
                   </button>
                   <button 
                     onClick={() => setShowDeleteModal(true)}
                     className="w-9 h-9 flex items-center justify-center bg-white border border-[#e3e8ee] text-[#cd5c5c] rounded-lg hover:bg-[#cd5c5c]/5 transition-all"
                   >
                      <Trash2 className="w-3.5 h-3.5" />
                   </button>
                </div>
             </div>
          </div>
        </motion.div>

        {/* Placeholder for new integrations */}
        <div className="border border-dashed border-[#e3e8ee] rounded-2xl flex flex-col items-center justify-center p-5 text-center group cursor-pointer hover:bg-[#f7f8f9] transition-all">
            <div className="w-8 h-8 bg-[#f7f8f9] group-hover:bg-[#2c3b6e]/5 rounded-full flex items-center justify-center mb-2 transition-all">
               <Plus className="w-4 h-4 text-[#4f566b] group-hover:text-[#2c3b6e]" />
            </div>
            <span className="text-[12px] font-bold text-[#4f566b] group-hover:text-[#1a1f36]">Новая</span>
        </div>
      </div>

      {/* Delete Modal */}
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
                   <h3 className="text-xl font-bold text-[#1a1f36] mb-3 tracking-tight">Удалить интеграцию?</h3>
                   <p className="text-[14px] text-[#4f566b] leading-relaxed mb-8">
                     Это действие полностью отключит Bitrix24. Вы уверены, что хотите удалить эту интеграцию?
                   </p>
                   <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setShowDeleteModal(false)}
                        className="flex-1 py-4 bg-white text-[#1a1f36] border border-[#e3e8ee] rounded-2xl font-bold text-[14px] hover:bg-[#f7f8f9] transition-all"
                      >
                        Отмена
                      </button>
                      <button 
                        onClick={handleDelete}
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

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10001]">
             <div className="flex items-center gap-3 px-6 py-3 bg-[#1a1f36] text-white rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"><CheckCircle2 className="w-4 h-4" /></div>
                <span className="text-[13px] font-bold tracking-tight">Настройки успешно обновлены!</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
