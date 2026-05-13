"use client";

import { 
  Plus, 
  Search, 
  MoreVertical, 
  ShieldCheck, 
  ShieldAlert, 
  Mail, 
  Phone, 
  Calendar, 
  UserPlus,
  Trash2,
  Edit3,
  XCircle,
  CheckCircle2,
  Lock,
  ChevronRight,
  User,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const initialStaff = [
  { id: 1, name: "Супер Админ", email: "admin@liberty.uz", role: "admin", status: "Active", joined: "12.01.2023", lastActive: "Сейчас" },
  { id: 2, name: "Елена Иванова", email: "elena@liberty.uz", role: "staff", status: "Active", joined: "15.03.2024", lastActive: "2 часа назад" },
  { id: 3, name: "Игорь Петров", email: "igor@liberty.uz", role: "staff", status: "Inactive", joined: "01.05.2024", lastActive: "Вчера" },
];

export default function StaffPage() {
  const [staffList, setStaffList] = useState(initialStaff);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (isAddModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isAddModalOpen]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight mb-1">Сотрудники</h1>
          <p className="text-[14px] text-[#4f566b]">Управление доступом и ролями персонала магазина.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-[#2c3b6e] rounded-md hover:bg-[#232f58] transition-all shadow-lg shadow-[#2c3b6e]/20"
        >
          <UserPlus className="w-4 h-4" />
          Добавить сотрудника
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#e3e8ee] pb-4">
        <div className="relative group w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4f566b] group-focus-within:text-[#2c3b6e] transition-colors" />
          <input 
            type="text" 
            placeholder="Поиск по имени или email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-xl text-[13px] outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 px-3 py-2 border border-[#e3e8ee] rounded-xl text-[12px] font-bold text-[#4f566b] hover:bg-[#f7f8f9] transition-all">
              <Filter className="w-4 h-4" />
              Фильтры
           </button>
        </div>
      </div>

      {/* Staff List (Table Style) */}
      <div className="bg-white border border-[#e3e8ee] rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f7f8f9] border-b border-[#e3e8ee]">
              <th className="px-6 py-4 text-[11px] font-black text-[#4f566b] uppercase tracking-widest">Сотрудник</th>
              <th className="px-6 py-4 text-[11px] font-black text-[#4f566b] uppercase tracking-widest">Роль</th>
              <th className="px-6 py-4 text-[11px] font-black text-[#4f566b] uppercase tracking-widest">Статус</th>
              <th className="px-6 py-4 text-[11px] font-black text-[#4f566b] uppercase tracking-widest">Активность</th>
              <th className="px-6 py-4 text-[11px] font-black text-[#4f566b] uppercase tracking-widest">Дата приема</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e3e8ee]">
            {filteredStaff.map((staff, idx) => (
              <motion.tr 
                key={staff.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group hover:bg-[#2c3b6e]/[0.02] transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#f7f8f9] group-hover:bg-white border border-transparent group-hover:border-[#e3e8ee] rounded-full flex items-center justify-center text-[#2c3b6e] font-black text-[12px] transition-all">
                      {staff.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-[14px] font-black text-[#1a1f36] group-hover:text-[#2c3b6e] transition-colors">{staff.name}</p>
                      <p className="text-[11px] text-[#4f566b] font-medium">{staff.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {staff.role === "admin" ? (
                      <ShieldCheck className="w-4 h-4 text-[#2c3b6e]" />
                    ) : (
                      <Lock className="w-4 h-4 text-[#4f566b]" />
                    )}
                    <span className="text-[11px] font-bold text-[#1a1f36] uppercase tracking-wider">
                      {staff.role === "admin" ? "Админ" : "Сотрудник"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                    staff.status === "Active" ? "bg-[#10b981]/10 text-[#10b981]" : "bg-[#ef4444]/10 text-[#ef4444]"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", staff.status === "Active" ? "bg-[#10b981]" : "bg-[#ef4444]")} />
                    {staff.status === "Active" ? "Активен" : "Неактивен"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[12px] font-medium text-[#4f566b]">{staff.lastActive}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[12px] font-medium text-[#4f566b]">{staff.joined}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-white border border-transparent hover:border-[#e3e8ee] rounded-lg transition-all text-[#4f566b] hover:text-[#2c3b6e] opacity-0 group-hover:opacity-100">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-[#e3e8ee] group-hover:text-[#2c3b6e] transition-colors" />
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Staff Drawer */}
      <AnimatePresence>
        {isAddModalOpen && (
          <>
            <motion.div 
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 w-screen h-screen bg-slate-900/40 backdrop-blur-md z-[9999]"
            />
            <motion.div 
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-[#e3e8ee] z-[10000] shadow-2xl flex flex-col"
            >
              <div className="px-6 py-5 border-b border-[#e3e8ee] flex items-center justify-between">
                <div>
                   <h2 className="text-[16px] font-black text-[#1a1f36]">Новый сотрудник</h2>
                   <p className="text-[11px] font-bold text-[#4f566b] uppercase tracking-widest">Создание аккаунта</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-[#f7f8f9] rounded-lg transition-colors">
                  <XCircle className="w-5 h-5 text-[#4f566b]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#4f566b] uppercase tracking-widest ml-1">Полное имя</label>
                    <div className="relative group">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4f566b] group-focus-within:text-[#2c3b6e] transition-colors" />
                       <input 
                         type="text" 
                         placeholder="Александр Иванов"
                         className="w-full pl-12 pr-4 py-3 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-xl text-[14px] outline-none transition-all"
                       />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#4f566b] uppercase tracking-widest ml-1">Email адрес</label>
                    <div className="relative group">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4f566b] group-focus-within:text-[#2c3b6e] transition-colors" />
                       <input 
                         type="email" 
                         placeholder="alex@liberty.uz"
                         className="w-full pl-12 pr-4 py-3 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-xl text-[14px] outline-none transition-all"
                       />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#4f566b] uppercase tracking-widest ml-1">Роль в системе</label>
                    <select className="w-full px-4 py-3 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-xl text-[14px] outline-none transition-all appearance-none">
                       <option value="staff">Сотрудник магазина</option>
                       <option value="admin">Администратор</option>
                    </select>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#4f566b] uppercase tracking-widest ml-1">Временный пароль</label>
                    <div className="relative group">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4f566b] group-focus-within:text-[#2c3b6e] transition-colors" />
                       <input 
                         type="password" 
                         placeholder="••••••••"
                         className="w-full pl-12 pr-4 py-3 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-xl text-[14px] outline-none transition-all"
                       />
                    </div>
                    <p className="text-[10px] text-[#4f566b] ml-1">Сотрудник сможет изменить пароль после первого входа.</p>
                 </div>
              </div>

              <div className="px-6 py-5 border-t border-[#e3e8ee] bg-[#f7f8f9]/50 flex items-center justify-end gap-3 sticky bottom-0">
                 <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2.5 text-[13px] font-bold text-[#4f566b] hover:text-[#1a1f36] transition-all">
                    Отмена
                 </button>
                 <button className="px-6 py-2.5 bg-[#2c3b6e] rounded-xl text-[13px] font-bold text-white hover:bg-[#232f58] transition-all shadow-lg shadow-[#2c3b6e]/20">
                    Зарегистрировать
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
