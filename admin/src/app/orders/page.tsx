"use client";

import { 
  MoreHorizontal, 
  ExternalLink,
  Plus,
  Filter,
  Download,
  Search,
  ChevronRight,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const orders = [
  { id: "ORD-7281", customer: "Александр Соколов", date: "Сегодня, 15:30", total: "24,500,000 сум", status: "Paid", items: 3, method: "Visa •••• 4242" },
  { id: "ORD-7280", customer: "Анна Кузнецова", date: "Сегодня, 14:15", total: "12,900,000 сум", status: "Shipped", items: 1, method: "Apple Pay" },
  { id: "ORD-7279", customer: "Максим Белов", date: "Вчера, 18:45", total: "45,000,000 сум", status: "Pending", items: 5, method: "Mastercard •••• 5555" },
  { id: "ORD-7278", customer: "Виктория Ли", date: "Вчера, 16:20", total: "8,400,000 сум", status: "Paid", items: 2, method: "Google Pay" },
  { id: "ORD-7277", customer: "Артем Дзюба", date: "Вчера, 12:10", total: "15,600,000 сум", status: "Cancelled", items: 4, method: "Visa •••• 1111" },
  { id: "ORD-7276", customer: "София Ротару", date: "05 мая, 10:00", total: "3,200,000 сум", status: "Paid", items: 1, method: "Visa •••• 9999" },
  { id: "ORD-7275", customer: "Иван Ургант", date: "04 мая, 09:30", total: "5,500,000 сум", status: "Paid", items: 2, method: "Apple Pay" },
  { id: "ORD-7274", customer: "Ксения Собчак", date: "04 мая, 08:45", total: "22,000,000 сум", status: "Shipped", items: 3, method: "Mastercard •••• 2222" },
  { id: "ORD-7273", customer: "Павел Воля", date: "03 мая, 20:15", total: "1,200,000 сум", status: "Cancelled", items: 1, method: "Google Pay" },
  { id: "ORD-7272", customer: "Гарик Харламов", date: "03 мая, 18:00", total: "9,800,000 сум", status: "Paid", items: 2, method: "Visa •••• 3333" },
  { id: "ORD-7271", customer: "Тимур Батрутдинов", date: "02 мая, 15:40", total: "11,500,000 сум", status: "Pending", items: 4, method: "Apple Pay" },
  { id: "ORD-7270", customer: "Дмитрий Нагиев", date: "01 мая, 12:00", total: "34,000,000 сум", status: "Shipped", items: 6, method: "Visa •••• 7777" },
];

const statusConfig = {
  Paid: { label: "Оплачен", icon: CheckCircle2, color: "text-[#10b981]", bg: "bg-[#10b981]/10" },
  Pending: { label: "Ожидание", icon: Clock, color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10" },
  Shipped: { label: "Отправлен", icon: Truck, color: "text-[#2c3b6e]", bg: "bg-[#2c3b6e]/10" },
  Cancelled: { label: "Отменен", icon: XCircle, color: "text-[#cd5c5c]", bg: "bg-[#cd5c5c]/10" },
};

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("Все");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null);
  const itemsPerPage = 10;

  const tabs = ["Все", "Ожидание", "Оплаченные", "Отправленные", "Отмененные"];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "Все") return matchesSearch;
    if (activeTab === "Ожидание") return matchesSearch && order.status === "Pending";
    if (activeTab === "Оплаченные") return matchesSearch && order.status === "Paid";
    if (activeTab === "Отправленные") return matchesSearch && order.status === "Shipped";
    if (activeTab === "Отмененные") return matchesSearch && order.status === "Cancelled";
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (selectedOrder) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedOrder]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 relative">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight mb-1">Заказы</h1>
          <p className="text-[14px] text-[#4f566b]">Управление заказами вашего магазина в реальном времени.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-[#4f566b] bg-white border border-[#e3e8ee] rounded-md hover:bg-[#f7f8f9] transition-all">
            <Download className="w-3.5 h-3.5" />
            Экспорт
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-white bg-[#2c3b6e] border border-[#2c3b6e] rounded-md hover:bg-[#232f58] transition-all">
            <Plus className="w-3.5 h-3.5" />
            Новый заказ
          </button>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#e3e8ee]">
        <div className="flex items-center gap-6 overflow-x-auto w-full md:w-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={cn(
                "pb-3 text-[14px] font-semibold transition-all relative whitespace-nowrap",
                activeTab === tab ? "text-[#2c3b6e]" : "text-[#4f566b] hover:text-[#1a1f36]"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2c3b6e]"
                />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 mb-2">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4f566b] group-focus-within:text-[#2c3b6e] transition-colors" />
              <input 
                type="text" 
                placeholder="Поиск по ID или имени..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-4 py-1.5 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-lg text-[13px] outline-none transition-all w-64"
              />
           </div>
           <button className="p-1.5 border border-[#e3e8ee] rounded-lg hover:bg-[#f7f8f9] transition-all">
              <Filter className="w-4 h-4 text-[#4f566b]" />
           </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
        {paginatedOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f7f8f9] border-b border-[#e3e8ee]">
                  <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Заказ</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Статус</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Клиент</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Товары</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Сумма</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider text-right">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3e8ee]">
                {paginatedOrders.map((order, idx) => {
                  const status = statusConfig[order.status as keyof typeof statusConfig];
                  return (
                    <motion.tr 
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedOrder(order)}
                      className="group cursor-pointer hover:bg-[#2c3b6e]/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-[#f7f8f9] rounded-lg group-hover:bg-white border border-transparent group-hover:border-[#e3e8ee] transition-all">
                              <Package className="w-4 h-4 text-[#2c3b6e]" />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[13px] font-bold text-[#1a1f36] group-hover:text-[#2c3b6e] transition-colors">{order.id}</span>
                              <span className="text-[10px] text-[#4f566b] font-medium">{order.method}</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                          status.bg, status.color
                        )}>
                          <status.icon className="w-3 h-3" />
                          {status.label}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[13px] font-semibold text-[#4f566b] group-hover:text-[#1a1f36] transition-colors">{order.customer}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[12px] font-medium text-[#4f566b]">{order.items} {order.items === 1 ? 'товар' : order.items < 5 ? 'товара' : 'товаров'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14px] font-bold text-[#1a1f36]">{order.total}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-[12px] font-medium text-[#4f566b]">{order.date}</span>
                          <ChevronRight className="w-4 h-4 text-[#e3e8ee] group-hover:text-[#2c3b6e] transition-colors" />
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="w-16 h-16 bg-[#f7f8f9] rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-[#e3e8ee]" />
             </div>
             <h3 className="text-[16px] font-bold text-[#1a1f36] mb-1">Ничего не найдено</h3>
             <p className="text-[13px] text-[#4f566b]">По вашему запросу «{searchQuery}» заказов не найдено.</p>
          </div>
        )}
        
        {filteredOrders.length > 0 && (
          <div className="px-6 py-4 border-t border-[#e3e8ee] bg-[#f7f8f9]/30 flex flex-col md:flex-row items-center justify-between gap-4">
             <p className="text-[12px] text-[#4f566b] font-medium">
               Показано {startIndex + 1}—{Math.min(startIndex + itemsPerPage, filteredOrders.length)} из {filteredOrders.length} заказов
             </p>
             <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-[#e3e8ee] rounded bg-white text-[12px] font-bold text-[#4f566b] hover:bg-[#f7f8f9] transition-all disabled:opacity-50"
                >
                  Назад
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center border rounded text-[12px] font-bold transition-all",
                      currentPage === page 
                        ? "bg-[#2c3b6e] border-[#2c3b6e] text-white shadow-sm" 
                        : "bg-white border-[#e3e8ee] text-[#4f566b] hover:bg-[#f7f8f9]"
                    )}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 border border-[#e3e8ee] rounded bg-white text-[12px] font-bold text-[#4f566b] hover:bg-[#f7f8f9] transition-all disabled:opacity-50"
                >
                  Вперед
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Order Details Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            {/* Backdrop */}
            <motion.div 
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 w-screen h-screen bg-slate-900/40 backdrop-blur-md z-[9999]"
            />
            
            {/* Drawer Content */}
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
                   <h2 className="text-[16px] font-bold text-[#1a1f36]">Детали заказа</h2>
                   <p className="text-[11px] font-bold text-[#4f566b] uppercase tracking-widest">{selectedOrder.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-[#f7f8f9] rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-[#4f566b]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Status Badge Large */}
                <div className="flex flex-col items-center py-4 bg-[#f7f8f9] rounded-2xl border border-[#e3e8ee]">
                   <div className={cn(
                     "w-12 h-12 rounded-full flex items-center justify-center mb-3",
                     statusConfig[selectedOrder.status as keyof typeof statusConfig].bg
                   )}>
                     {(() => {
                       const Icon = statusConfig[selectedOrder.status as keyof typeof statusConfig].icon;
                       return <Icon className={cn("w-6 h-6", statusConfig[selectedOrder.status as keyof typeof statusConfig].color)} />;
                     })()}
                   </div>
                   <span className={cn("text-[13px] font-bold uppercase tracking-widest", statusConfig[selectedOrder.status as keyof typeof statusConfig].color)}>
                     {statusConfig[selectedOrder.status as keyof typeof statusConfig].label}
                   </span>
                   <p className="text-[11px] text-[#4f566b] mt-1">{selectedOrder.date}</p>
                </div>

                {/* Customer Details */}
                <div className="space-y-4">
                  <h3 className="text-[13px] font-bold text-[#1a1f36] uppercase tracking-wider">Клиент</h3>
                  <div className="p-4 border border-[#e3e8ee] rounded-xl flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-[#2c3b6e] rounded-full flex items-center justify-center text-white font-bold text-[13px]">
                          {selectedOrder.customer.split(' ').map(n => n[0]).join('')}
                       </div>
                       <div>
                          <p className="text-[14px] font-bold text-[#1a1f36]">{selectedOrder.customer}</p>
                          <p className="text-[11px] text-[#4f566b]">Премиум клиент</p>
                       </div>
                    </div>
                    <button className="p-2 hover:bg-[#f7f8f9] rounded-lg text-[#2c3b6e] transition-all">
                       <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="space-y-4 pb-8">
                   <h3 className="text-[13px] font-bold text-[#1a1f36] uppercase tracking-wider">Оплата</h3>
                   <div className="space-y-3">
                      <div className="flex justify-between items-center text-[13px]">
                         <span className="text-[#4f566b] font-medium">Метод</span>
                         <span className="text-[#1a1f36] font-bold">{selectedOrder.method}</span>
                      </div>
                      <div className="flex justify-between items-center text-[13px]">
                         <span className="text-[#4f566b] font-medium">Товаров ({selectedOrder.items})</span>
                         <span className="text-[#1a1f36] font-bold">{(parseInt(selectedOrder.total.replace(/[^0-9]/g, "")) * 0.9).toLocaleString('ru-RU')} сум</span>
                      </div>
                      <div className="flex justify-between items-center text-[13px]">
                         <span className="text-[#4f566b] font-medium">Налог (12%)</span>
                         <span className="text-[#1a1f36] font-bold">{(parseInt(selectedOrder.total.replace(/[^0-9]/g, "")) * 0.1).toLocaleString('ru-RU')} сум</span>
                      </div>
                      <div className="pt-3 border-t border-[#e3e8ee] flex justify-between items-center">
                         <span className="text-[14px] font-bold text-[#1a1f36]">Итого</span>
                         <span className="text-[18px] font-black text-[#2c3b6e]">{selectedOrder.total}</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* Sticky Footer Actions */}
              <div className="px-6 py-5 border-t border-[#e3e8ee] bg-[#f7f8f9]/50 grid grid-cols-2 gap-3 sticky bottom-0">
                 <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#e3e8ee] bg-white rounded-xl text-[13px] font-bold text-[#4f566b] hover:bg-[#f7f8f9] transition-all">
                    <ExternalLink className="w-4 h-4" />
                    Чек
                 </button>
                 <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2c3b6e] rounded-xl text-[13px] font-bold text-white hover:bg-[#232f58] transition-all shadow-lg shadow-[#2c3b6e]/20">
                    Отправить
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
