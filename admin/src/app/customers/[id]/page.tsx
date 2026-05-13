"use client";

import { 
  ArrowLeft,
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  ArrowUpRight,
  MessageSquare,
  Edit3,
  MoreVertical,
  ChevronRight,
  Star,
  ShieldCheck,
  CreditCard,
  TrendingUp,
  Package,
  Clock,
  Wallet,
  Settings,
  History,
  User,
  Zap,
  Target,
  Search,
  XCircle,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

// Enhanced Mock Data
const customerData = {
  id: "CUS-1024",
  name: "Александр Соколов",
  email: "sokolov@mail.ru",
  phone: "+998 90 123 45 67",
  location: "Ташкент, Узбекистан, ул. Амира Темура, 42",
  registered: "12 января, 2023",
  status: "VIP",
  totalSpent: "145,000,000 сум",
  orderCount: 24,
  averageOrder: "12,083,333 сум",
  returns: 0,
  loyaltyPoints: 4500,
  lastOrder: "Сегодня, 15:30"
};

const allOrders = Array.from({ length: 24 }, (_, i) => ({
  id: `ORD-${7281 - i}`,
  date: i === 0 ? "Сегодня, 15:30" : `${i + 1} мая, 2024`,
  total: `${(Math.random() * 20 + 5).toFixed(1)},000,000 сум`,
  status: "Paid",
  itemsCount: Math.floor(Math.random() * 3) + 1,
  method: "Visa •••• 4242",
  items: [
    { name: "Кашемировое пальто", price: "12,500,000 сум", size: "XL", color: "Темно-синий", image: "https://images.unsplash.com/photo-1539533397308-a61e4e3025d1?q=80&w=200&h=200&auto=format&fit=crop" },
    { name: "Кожаные ботинки", price: "5,200,000 сум", size: "43", color: "Черный", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=200&h=200&auto=format&fit=crop" }
  ]
}));

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function CustomerDetailPage() {
  const params = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<typeof allOrders[0] | null>(null);
  const itemsPerPage = 10;

  const filteredOrders = allOrders.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (selectedOrder) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedOrder]);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-4 pb-20 max-w-6xl mx-auto relative"
    >
      {/* 1. Profile Header */}
      <motion.div variants={itemVariants} className="bg-white border border-[#e3e8ee] rounded-xl p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <Link href="/customers" className="p-2 border border-[#e3e8ee] rounded-lg hover:bg-[#2c3b6e] hover:text-white transition-all group">
                <ArrowLeft className="w-3.5 h-3.5" />
             </Link>
             <div className="w-10 h-10 bg-[#2c3b6e] rounded-full flex items-center justify-center text-white font-bold text-[14px]">
                {customerData.name.split(' ').map(n => n[0]).join('')}
             </div>
             <div>
                <div className="flex items-center gap-2">
                   <h1 className="text-[15px] font-black text-[#1a1f36]">{customerData.name}</h1>
                   <span className="px-1.5 py-0.5 bg-[#2c3b6e]/10 text-[#2c3b6e] text-[8px] font-black rounded uppercase tracking-widest border border-[#2c3b6e]/20">VIP</span>
                </div>
                <p className="text-[10px] text-[#4f566b] font-medium">{customerData.email}</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-[#4f566b] bg-[#f7f8f9] rounded-lg hover:bg-[#e3e8ee] transition-all border border-transparent hover:border-[#e3e8ee]">
                <MessageSquare className="w-3.5 h-3.5" />
                Написать
             </button>
             <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-[#2c3b6e] rounded-lg hover:bg-[#232f58] transition-all">
                <Edit3 className="w-3 h-3" />
                Изменить
             </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#f7f8f9]">
           <div>
              <p className="text-[8px] font-bold text-[#4f566b] uppercase tracking-widest mb-0.5">Телефон</p>
              <p className="text-[11px] font-bold text-[#1a1f36]">{customerData.phone}</p>
           </div>
           <div>
              <p className="text-[8px] font-bold text-[#4f566b] uppercase tracking-widest mb-0.5">Адрес</p>
              <p className="text-[11px] font-bold text-[#1a1f36] truncate">{customerData.location}</p>
           </div>
           <div>
              <p className="text-[8px] font-bold text-[#4f566b] uppercase tracking-widest mb-0.5">Бонусы</p>
              <p className="text-[11px] font-bold text-[#2c3b6e]">{customerData.loyaltyPoints} L-Points</p>
           </div>
           <div>
              <p className="text-[8px] font-bold text-[#4f566b] uppercase tracking-widest mb-0.5">Регистрация</p>
              <p className="text-[11px] font-bold text-[#1a1f36]">{customerData.registered}</p>
           </div>
        </div>
      </motion.div>

      {/* 2. KPI Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e3e8ee] rounded-xl p-4 flex items-center gap-4">
           <div className="w-10 h-10 bg-[#f7f8f9] rounded-lg flex items-center justify-center text-[#2c3b6e]">
              <CreditCard className="w-5 h-5" />
           </div>
           <div>
              <p className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest mb-0.5">Потрачено</p>
              <p className="text-[15px] font-black text-[#1a1f36] truncate">{customerData.totalSpent}</p>
           </div>
        </div>
        <div className="bg-white border border-[#e3e8ee] rounded-xl p-4 flex items-center gap-4">
           <div className="w-10 h-10 bg-[#f7f8f9] rounded-lg flex items-center justify-center text-[#2c3b6e]">
              <ShoppingBag className="w-5 h-5" />
           </div>
           <div>
              <p className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest mb-0.5">Заказы</p>
              <p className="text-[15px] font-black text-[#1a1f36]">{customerData.orderCount} шт</p>
           </div>
        </div>
        <div className="bg-white border border-[#e3e8ee] rounded-xl p-4 flex items-center gap-4">
           <div className="w-10 h-10 bg-[#f7f8f9] rounded-lg flex items-center justify-center text-[#2c3b6e]">
              <Target className="w-5 h-5" />
           </div>
           <div>
              <p className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest mb-0.5">Средний чек</p>
              <p className="text-[15px] font-black text-[#1a1f36] truncate">{customerData.averageOrder}</p>
           </div>
        </div>
        <div className="bg-white border border-[#e3e8ee] rounded-xl p-4 flex items-center gap-4">
           <div className="w-10 h-10 bg-[#f7f8f9] rounded-lg flex items-center justify-center text-[#2c3b6e]">
              <Zap className="w-5 h-5" />
           </div>
           <div>
              <p className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest mb-0.5">Последний</p>
              <p className="text-[15px] font-black text-[#1a1f36] truncate">{customerData.lastOrder}</p>
           </div>
        </div>
      </motion.div>

      {/* 3. History Table with Search & Pagination */}
      <motion.div variants={itemVariants} className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden shadow-sm shadow-black/[0.02]">
        <div className="px-5 py-3 border-b border-[#e3e8ee] flex flex-col md:flex-row items-center justify-between gap-4 bg-[#f7f8f9]/50">
           <div className="flex items-center gap-4 flex-1">
              <h3 className="text-[12px] font-black text-[#1a1f36] uppercase tracking-wider whitespace-nowrap">История заказов</h3>
              <div className="relative group flex-1 max-w-sm">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4f566b] group-focus-within:text-[#2c3b6e] transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Поиск по ID заказа..." 
                   value={searchQuery}
                   onChange={(e) => {
                     setSearchQuery(e.target.value);
                     setCurrentPage(1);
                   }}
                   className="w-full pl-9 pr-4 py-1.5 bg-white border border-[#e3e8ee] rounded-lg text-[12px] outline-none transition-all focus:border-[#2c3b6e]/30"
                 />
              </div>
           </div>
           <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 border border-[#e3e8ee] rounded bg-white text-[10px] font-bold text-[#4f566b] hover:bg-[#f7f8f9] disabled:opacity-30"
              >
                Назад
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-7 h-7 flex items-center justify-center border rounded text-[10px] font-bold transition-all",
                    currentPage === page 
                      ? "bg-[#2c3b6e] border-[#2c3b6e] text-white" 
                      : "bg-white border-[#e3e8ee] text-[#4f566b] hover:bg-[#f7f8f9]"
                  )}
                >
                  {page}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 border border-[#e3e8ee] rounded bg-white text-[10px] font-bold text-[#4f566b] hover:bg-[#f7f8f9] disabled:opacity-30"
              >
                Вперед
              </button>
           </div>
        </div>
        <table className="w-full text-left">
           <tbody className="divide-y divide-[#e3e8ee]">
              {paginatedOrders.length > 0 ? paginatedOrders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className="hover:bg-[#f7f8f9] transition-all cursor-pointer group"
                >
                   <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-[#f7f8f9] group-hover:bg-white border border-transparent group-hover:border-[#e3e8ee] rounded-xl flex items-center justify-center text-[11px] font-bold text-[#4f566b] transition-all">
                            {order.id.split('-')[1]}
                         </div>
                         <div>
                            <p className="text-[13px] font-bold text-[#1a1f36] group-hover:text-[#2c3b6e] transition-colors">{order.id}</p>
                            <p className="text-[10px] text-[#4f566b]">{order.date} • {order.itemsCount} тов.</p>
                         </div>
                      </div>
                   </td>
                   <td className="px-5 py-4 text-right">
                      <p className="text-[13px] font-black text-[#1a1f36]">{order.total}</p>
                      <p className="text-[10px] font-bold text-[#10b981] uppercase tracking-wider">Оплачен</p>
                   </td>
                   <td className="px-5 py-4 w-10">
                      <ChevronRight className="w-4 h-4 text-[#e3e8ee] group-hover:text-[#2c3b6e] transition-all" />
                   </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-[12px] text-[#4f566b]">Ничего не найдено</td>
                </tr>
              )}
           </tbody>
        </table>
      </motion.div>

      {/* 4. Order Details Drawer (Slide-over) */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
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
                   <h2 className="text-[15px] font-black text-[#1a1f36]">Детали заказа</h2>
                   <p className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">{selectedOrder.id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-[#f7f8f9] rounded-lg transition-colors">
                  <XCircle className="w-5 h-5 text-[#4f566b]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                 {/* Order Info Summary */}
                 <div className="bg-[#f7f8f9] rounded-2xl p-5 border border-[#e3e8ee] flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-[#10b981]/10 rounded-full flex items-center justify-center mb-3">
                       <ShieldCheck className="w-6 h-6 text-[#10b981]" />
                    </div>
                    <span className="text-[12px] font-black text-[#10b981] uppercase tracking-widest">Заказ Оплачен</span>
                    <p className="text-[11px] text-[#4f566b] mt-1">{selectedOrder.date} • {selectedOrder.method}</p>
                 </div>

                 {/* Items List with Sizes */}
                 <div className="space-y-4">
                    <h3 className="text-[11px] font-black text-[#1a1f36] uppercase tracking-widest">Товары в заказе</h3>
                    <div className="space-y-3">
                       {selectedOrder.items.map((item, idx) => (
                         <div key={idx} className="flex items-center gap-4 p-3 border border-[#e3e8ee] rounded-xl group hover:bg-[#f7f8f9] transition-all">
                            <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#e3e8ee] bg-white">
                               <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="flex-1">
                               <h4 className="text-[13px] font-bold text-[#1a1f36]">{item.name}</h4>
                               <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[10px] font-bold text-[#4f566b]">Размер: <span className="text-[#1a1f36]">{item.size}</span></span>
                                  <span className="text-[10px] font-bold text-[#4f566b]">Цвет: <span className="text-[#1a1f36]">{item.color}</span></span>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-[13px] font-black text-[#1a1f36]">{item.price}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Order Total Summary */}
                 <div className="pt-6 border-t border-[#f7f8f9] space-y-3">
                    <div className="flex justify-between items-center text-[13px]">
                       <span className="text-[#4f566b] font-medium">Подытог</span>
                       <span className="text-[#1a1f36] font-bold">{selectedOrder.total}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                       <span className="text-[#4f566b] font-medium">Налог (0%)</span>
                       <span className="text-[#1a1f36] font-bold">0 сум</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-[#e3e8ee]">
                       <span className="text-[14px] font-black text-[#1a1f36]">Итого к оплате</span>
                       <span className="text-[16px] font-black text-[#2c3b6e]">{selectedOrder.total}</span>
                    </div>
                 </div>
              </div>

              {/* Sticky Footer Action */}
              <div className="px-6 py-5 border-t border-[#e3e8ee] bg-[#f7f8f9]/50 grid grid-cols-2 gap-3 sticky bottom-0">
                 <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#e3e8ee] bg-white rounded-xl text-[12px] font-bold text-[#4f566b] hover:bg-[#f7f8f9] transition-all">
                    <ExternalLink className="w-4 h-4" />
                    Чек
                 </button>
                 <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2c3b6e] rounded-xl text-[12px] font-bold text-white hover:bg-[#232f58] transition-all">
                    Повторить
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
