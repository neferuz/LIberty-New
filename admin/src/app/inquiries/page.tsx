"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  User, 
  Calendar,
  CheckCircle2,
  Clock,
  Archive,
  RefreshCw,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Inquiry {
  id: number;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/inquiries/");
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      }
    } catch (err) {
      console.error("Failed to fetch inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/inquiries/${id}/status?status_val=${status}`, {
        method: "PUT"
      });
      if (res.ok) {
        setInquiries(prev => prev.map(item => item.id === id ? { ...item, status } : item));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const filteredInquiries = inquiries.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2c3b6e]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1a1f36] tracking-tight mb-0.5">Заявки</h1>
          <p className="text-[13px] text-[#4f566b]">Управление входящими сообщениями из формы контактов.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold text-[#4f566b] bg-white border border-[#e3e8ee] rounded-md hover:bg-[#f7f8f9] transition-all">
             <Filter className="w-3.5 h-3.5" />
             Фильтры
           </button>
           <button 
             onClick={fetchInquiries}
             className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold text-white bg-[#2c3b6e] rounded-md hover:bg-[#232f58] transition-all border border-[#2c3b6e]"
           >
             <RefreshCw className="w-3.5 h-3.5" />
             Обновить
           </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3acb9]" />
        <input 
          type="text" 
          placeholder="Поиск по имени, email или тексту сообщения..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-[#e3e8ee] pl-10 pr-4 py-2.5 text-[13px] rounded-lg outline-none focus:border-[#2c3b6e]/30 transition-all"
        />
      </div>

      {/* Inquiries List */}
      <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7f8f9] border-b border-[#e3e8ee]">
                <th className="px-6 py-4 text-[11px] font-bold text-[#4f566b] uppercase tracking-widest">Отправитель</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#4f566b] uppercase tracking-widest">Сообщение</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#4f566b] uppercase tracking-widest text-center">Статус</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#4f566b] uppercase tracking-widest">Дата</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#4f566b] uppercase tracking-widest text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e8ee]">
              {filteredInquiries.length > 0 ? filteredInquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-[#f7f8f9]/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#f7f8f9] flex items-center justify-center text-[#2c3b6e] border border-[#e3e8ee]">
                        <User className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#1a1f36] leading-none mb-1">{inquiry.name}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#4f566b]">
                          <Mail className="w-3 h-3" />
                          {inquiry.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 max-w-md">
                    <p className="text-[12px] text-[#4f566b] line-clamp-2 leading-relaxed italic">
                      "{inquiry.message}"
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5",
                        inquiry.status === "new" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                        inquiry.status === "read" ? "bg-green-50 text-green-600 border border-green-100" :
                        "bg-gray-50 text-gray-500 border border-gray-100"
                      )}>
                        {inquiry.status === "new" ? <Clock className="w-3 h-3" /> : 
                         inquiry.status === "read" ? <CheckCircle2 className="w-3 h-3" /> : 
                         <Archive className="w-3 h-3" />}
                        {inquiry.status === "new" ? "Новая" : 
                         inquiry.status === "read" ? "Прочитано" : 
                         "В архиве"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-[12px] text-[#4f566b]">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(inquiry.created_at), "d MMMM, HH:mm", { locale: ru })}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {inquiry.status === "new" && (
                         <button 
                           onClick={() => updateStatus(inquiry.id, "read")}
                           className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                           title="Отметить как прочитанное"
                         >
                           <CheckCircle2 className="w-4 h-4" />
                         </button>
                       )}
                       {inquiry.status !== "archived" ? (
                         <button 
                           onClick={() => updateStatus(inquiry.id, "archived")}
                           className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-lg transition-all"
                           title="В архив"
                         >
                           <Archive className="w-4 h-4" />
                         </button>
                       ) : (
                         <button 
                           className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                           title="Удалить навсегда"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       )}
                       <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all">
                         <MoreVertical className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                       <Mail className="w-12 h-12 text-[#e3e8ee]" />
                       <p className="text-[14px] text-[#a3acb9] font-medium">Заявок пока нет</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
