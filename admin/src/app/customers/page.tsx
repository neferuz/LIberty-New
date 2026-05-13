"use client";

import { 
  MoreHorizontal, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  ArrowUpRight,
  Download,
  Plus,
  Search,
  Filter,
  ChevronRight,
  XCircle,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

const customers = [
  { id: "CUS-1024", name: "Александр Соколов", email: "sokolov@mail.ru", spent: "145,000,000 сум", orders: 12, lastVisit: "Сегодня, 10:20", status: "Active", phone: "+998 90 123 45 67", location: "Ташкент, Узбекистан" },
  { id: "CUS-1023", name: "Анна Кузнецова", email: "anna.k@gmail.com", spent: "82,400,000 сум", orders: 8, lastVisit: "Вчера, 18:45", status: "Active", phone: "+998 91 222 33 44", location: "Самарканд, Узбекистан" },
  { id: "CUS-1022", name: "Дмитрий Волков", email: "volkov.d@yandex.ru", spent: "210,000,000 сум", orders: 24, lastVisit: "2 дня назад", status: "VIP", phone: "+998 93 555 66 77", location: "Ташкент, Узбекистан" },
  { id: "CUS-1021", name: "Елена Петрова", email: "elena_p@mail.ru", spent: "12,900,000 сум", orders: 2, lastVisit: "05 мая, 14:00", status: "New", phone: "+998 90 777 88 99", location: "Бухара, Узбекистан" },
  { id: "CUS-1020", name: "Иван Иванов", email: "ivanov@company.uz", spent: "0 сум", orders: 0, lastVisit: "04 мая, 09:30", status: "Inactive", phone: "+998 94 111 00 22", location: "Андижан, Узбекистан" },
  { id: "CUS-1019", name: "Мария Сидорова", email: "m.sidorova@outlook.com", spent: "54,200,000 сум", orders: 5, lastVisit: "03 мая, 12:15", status: "Active", phone: "+998 90 999 11 22", location: "Ташкент, Узбекистан" },
  { id: "CUS-1018", name: "Алексей Козлов", email: "kozlov.a@work.ru", spent: "98,000,000 сум", orders: 15, lastVisit: "01 мая, 16:40", status: "Active", phone: "+998 91 333 44 55", location: "Фергана, Узбекистан" },
];

const statusConfig = {
  Active: { label: "Активен", color: "text-[#10b981]", bg: "bg-[#10b981]/10" },
  VIP: { label: "VIP Клиент", color: "text-[#2c3b6e]", bg: "bg-[#2c3b6e]/10" },
  New: { label: "Новый", color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10" },
  Inactive: { label: "Неактивен", color: "text-[#4f566b]", bg: "bg-[#4f566b]/10" },
};

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight mb-1">Клиенты</h1>
          <p className="text-[14px] text-[#4f566b]">Управление клиентской базой и анализ активности покупателей.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-[#4f566b] bg-white border border-[#e3e8ee] rounded-md hover:bg-[#f7f8f9] transition-all">
            <Download className="w-3.5 h-3.5" />
            Экспорт
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-white bg-[#2c3b6e] border border-[#2c3b6e] rounded-md hover:bg-[#232f58] transition-all">
            <Plus className="w-3.5 h-3.5" />
            Добавить клиента
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 border-b border-[#e3e8ee] pb-4">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4f566b] group-focus-within:text-[#2c3b6e] transition-colors" />
          <input 
            type="text" 
            placeholder="Поиск по имени или email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-lg text-[13px] outline-none transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-[#4f566b] border border-[#e3e8ee] rounded-lg hover:bg-[#f7f8f9] transition-all">
          <Filter className="w-3.5 h-3.5" />
          Фильтры
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7f8f9] border-b border-[#e3e8ee]">
                <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Клиент</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider text-right">Потрачено</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider text-right">Заказы</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider text-right">Последний визит</th>
                <th className="px-6 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e8ee]">
              {filteredCustomers.map((customer, idx) => {
                const status = statusConfig[customer.status as keyof typeof statusConfig];
                return (
                  <motion.tr 
                    key={customer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group cursor-pointer hover:bg-[#2c3b6e]/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link href={`/customers/${customer.id}`} className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-tr from-[#2c3b6e] to-[#4a5e9e] rounded-full flex items-center justify-center text-white font-bold text-[12px] shadow-sm">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-[#1a1f36] group-hover:text-[#2c3b6e] transition-colors">{customer.name}</span>
                          <span className="text-[11px] text-[#4f566b] font-medium">{customer.email}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/customers/${customer.id}`} className="block">
                        <div className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                          status.bg, status.color
                        )}>
                          {status.label}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/customers/${customer.id}`} className="block text-[13px] font-bold text-[#1a1f36]">
                        {customer.spent}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/customers/${customer.id}`} className="block text-[13px] font-semibold text-[#4f566b]">
                        {customer.orders}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/customers/${customer.id}`} className="block text-[12px] font-medium text-[#4f566b]">
                        {customer.lastVisit}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Link href={`/customers/${customer.id}`} className="block">
                          <ChevronRight className="w-4 h-4 text-[#e3e8ee] group-hover:text-[#2c3b6e] transition-colors ml-auto" />
                       </Link>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
