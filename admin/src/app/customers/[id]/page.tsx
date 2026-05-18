"use client";

import { 
  ArrowLeft,
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  Edit3,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Target,
  Zap,
  Search,
  XCircle,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

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
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<any | null>(null);
  const [realOrders, setRealOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchCustomerDetail = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/api/v1/users/${customerId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setCustomer(data);
          
          // Dynamically fetch all real system/CRM orders
          try {
            const ordersRes = await fetch("/api/v1/orders/all", {
              headers: {
                "Authorization": `Bearer ${token}`
              }
            });
            if (ordersRes.ok) {
              const ordersData = await ordersRes.json();
              if (Array.isArray(ordersData)) {
                setRealOrders(ordersData);
              }
            }
          } catch (ordersErr) {
            console.error("Error fetching system orders for dynamic client mapping:", ordersErr);
          }
        } else {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/login";
          } else {
            setError("Пользователь не найден в системе.");
          }
        }
      } catch (err) {
        console.error("Error fetching customer:", err);
        setError("Ошибка соединения с сервером бэкенда.");
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCustomerDetail();
    }
  }, [customerId]);

  useEffect(() => {
    if (selectedOrder) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedOrder]);

  if (loading) {
    return (
      <div className="py-32 text-center">
        <div className="w-8 h-8 border-2 border-[#2c3b6e]/10 border-t-[#2c3b6e] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#4f566b] uppercase tracking-wider font-bold">Загрузка карточки клиента...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="py-24 text-center max-w-md mx-auto space-y-6">
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-xs text-red-600 font-bold uppercase tracking-wider">{error || "Клиент не найден"}</p>
        </div>
        <Link href="/customers" className="inline-flex items-center gap-2 text-xs font-bold text-[#2c3b6e] hover:underline">
          <ArrowLeft className="w-4 h-4" /> Вернуться к списку
        </Link>
      </div>
    );
  }

  // Map dynamic user details
  const displayEmail = customer.email.includes("@liberty-wear.uz") ? "Вход по телефону" : customer.email;
  const registerDate = customer.created_at 
    ? new Date(customer.created_at).toLocaleString("ru-RU", { 
        timeZone: "Asia/Tashkent",
        day: "2-digit", 
        month: "long", 
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "—";

  // Parse dynamic address details from addresses_json
  let displayAddress = "";
  if (customer.addresses_json) {
    try {
      const parsed = JSON.parse(customer.addresses_json);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const addr = parsed[0];
        displayAddress = `${addr.region ? addr.region + ", " : ""}${addr.street}${addr.flat ? ", кв. " + addr.flat : ""}`;
      }
    } catch (e) {
      console.error("Error parsing customer addresses_json:", e);
    }
  }

  const isVip = customer.role === "admin";
  const loyaltyPoints = customer.id * 150;
  
  // Real orders matching logic for the current customer details
  const matchedOrders = realOrders.filter((o: any) => {
    if (!customer) return false;
    
    // 1. Phone match
    if (o.phone && customer.phone) {
      const cleanOrderPhone = o.phone.replace(/\D/g, "");
      const cleanCustomerPhone = customer.phone.replace(/\D/g, "");
      if (cleanOrderPhone && cleanCustomerPhone && (cleanOrderPhone.includes(cleanCustomerPhone) || cleanCustomerPhone.includes(cleanOrderPhone))) {
        return true;
      }
    }
    
    // 2. Email match
    if (customer.email) {
      const cleanEmail = customer.email.toLowerCase().trim();
      if (o.customer && o.customer.toLowerCase().trim() === cleanEmail) return true;
      if (o.email && o.email.toLowerCase().trim() === cleanEmail) return true;
    }
    
    // 3. Name match
    if (customer.full_name && o.customer) {
      const cleanName = customer.full_name.toLowerCase().trim();
      const cleanOrderCust = o.customer.toLowerCase().trim();
      if (cleanName && cleanOrderCust && (cleanName === cleanOrderCust || cleanOrderCust.includes(cleanName) || cleanName.includes(cleanOrderCust))) {
        return true;
      }
    }
    
    return false;
  });

  // Calculate actual dynamic stats from matched orders
  const orderCount = matchedOrders.length;
  const spentSum = matchedOrders.reduce((sum: number, o: any) => {
    const numericStr = (o.total || "").replace(/\D/g, "");
    const numericVal = parseInt(numericStr, 10) || 0;
    return sum + numericVal;
  }, 0);
  
  const totalSpent = spentSum > 0 ? `${spentSum.toLocaleString("ru-RU").replace(/,/g, " ")} сум` : "0 сум";
  const avgVal = orderCount > 0 ? Math.round(spentSum / orderCount) : 0;
  const averageOrder = avgVal > 0 ? `${avgVal.toLocaleString("ru-RU").replace(/,/g, " ")} сум` : "0 сум";
  const lastOrder = orderCount > 0 ? matchedOrders[0].date : "Нет заказов";

  // Map backend orders dynamically to the structure needed by page rendering
  const customerOrdersList = matchedOrders.map((o: any) => {
    const mappedItems = Array.isArray(o.items_list) ? o.items_list.map((item: any) => ({
      name: item.name || "Товар Liberty Wear",
      price: item.price || o.total,
      size: item.size || "S",
      color: item.color || "Черный",
      image: item.image || "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=200&h=200&auto=format&fit=crop"
    })) : [
      {
        name: "Заказ с сайта / CRM",
        price: o.total,
        size: "S",
        color: "Черный",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=200&h=200&auto=format&fit=crop"
      }
    ];

    return {
      id: o.id || `ORD-${Date.now()}`,
      date: o.date || "Недавно",
      total: o.total || "0 сум",
      status: o.status || "Pending",
      itemsCount: o.items || 1,
      method: o.method || "При получении",
      items: mappedItems
    };
  });

  const filteredOrders = customerOrdersList.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const initials = customer.full_name 
    ? customer.full_name.trim().split(/\s+/).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : "К";

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
                {initials}
             </div>
             <div>
                <div className="flex items-center gap-2">
                   <h1 className="text-[15px] font-black text-[#1a1f36]">{customer.full_name || "Без имени"}</h1>
                   {isVip && (
                     <span className="px-1.5 py-0.5 bg-[#2c3b6e]/10 text-[#2c3b6e] text-[8px] font-black rounded uppercase tracking-widest border border-[#2c3b6e]/20">VIP</span>
                   )}
                </div>
                <p className="text-[10px] text-[#4f566b] font-medium">{displayEmail}</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-[#4f566b] bg-[#f7f8f9] rounded-lg hover:bg-[#e3e8ee] transition-all border border-transparent hover:border-[#e3e8ee]">
                Написать
             </button>
             <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-[#2c3b6e] rounded-lg hover:bg-[#232f58] transition-all">
                <Edit3 className="w-3 h-3" />
                Изменить
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#f7f8f9]">
           <div>
              <p className="text-[8px] font-bold text-[#4f566b] uppercase tracking-widest mb-0.5">Телефон</p>
              <p className="text-[11px] font-bold text-[#1a1f36]">{customer.phone || "—"}</p>
           </div>
           <div>
              <p className="text-[8px] font-bold text-[#4f566b] uppercase tracking-widest mb-0.5">Адрес</p>
              <p className="text-[11px] font-bold text-[#1a1f36] truncate" title={displayAddress || undefined}>
                {displayAddress || "—"}
              </p>
           </div>
           <div>
              <p className="text-[8px] font-bold text-[#4f566b] uppercase tracking-widest mb-0.5">Регистрация</p>
              <p className="text-[11px] font-bold text-[#1a1f36]">{registerDate}</p>
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
              <p className="text-[15px] font-black text-[#1a1f36] truncate">{totalSpent}</p>
           </div>
        </div>
        <div className="bg-white border border-[#e3e8ee] rounded-xl p-4 flex items-center gap-4">
           <div className="w-10 h-10 bg-[#f7f8f9] rounded-lg flex items-center justify-center text-[#2c3b6e]">
              <ShoppingBag className="w-5 h-5" />
           </div>
           <div>
              <p className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest mb-0.5">Заказы</p>
              <p className="text-[15px] font-black text-[#1a1f36]">{orderCount} шт</p>
           </div>
        </div>
        <div className="bg-white border border-[#e3e8ee] rounded-xl p-4 flex items-center gap-4">
           <div className="w-10 h-10 bg-[#f7f8f9] rounded-lg flex items-center justify-center text-[#2c3b6e]">
              <Target className="w-5 h-5" />
           </div>
           <div>
              <p className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest mb-0.5">Средний чек</p>
              <p className="text-[15px] font-black text-[#1a1f36] truncate">{averageOrder}</p>
           </div>
        </div>
        <div className="bg-white border border-[#e3e8ee] rounded-xl p-4 flex items-center gap-4">
           <div className="w-10 h-10 bg-[#f7f8f9] rounded-lg flex items-center justify-center text-[#2c3b6e]">
              <Zap className="w-5 h-5" />
           </div>
           <div>
              <p className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest mb-0.5">Последний</p>
              <p className="text-[15px] font-black text-[#1a1f36] truncate">{lastOrder}</p>
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
                      <p className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        order.status === "Paid" ? "text-[#10b981]" : 
                        order.status === "Shipped" ? "text-[#2c3b6e]" :
                        order.status === "Cancelled" ? "text-[#cd5c5c]" : "text-[#f59e0b]"
                      )}>
                        {order.status === "Paid" ? "Оплачен" :
                         order.status === "Shipped" ? "Отправлен" :
                         order.status === "Cancelled" ? "Отменен" : "В ожидании"}
                      </p>
                   </td>
                   <td className="px-5 py-4 w-10">
                      <ChevronRight className="w-4 h-4 text-[#e3e8ee] group-hover:text-[#2c3b6e] transition-all" />
                   </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-[12px] text-[#4f566b]">Нет оформленных заказов</td>
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
                    <div className={cn(
                       "w-12 h-12 rounded-full flex items-center justify-center mb-3",
                       selectedOrder.status === "Paid" ? "bg-[#10b981]/10 text-[#10b981]" : 
                       selectedOrder.status === "Shipped" ? "bg-[#2c3b6e]/10 text-[#2c3b6e]" :
                       selectedOrder.status === "Cancelled" ? "bg-[#cd5c5c]/10 text-[#cd5c5c]" : "bg-[#f59e0b]/10 text-[#f59e0b]"
                     )}>
                        <ShieldCheck className="w-6 h-6" />
                     </div>
                     <span className={cn(
                       "text-[12px] font-black uppercase tracking-widest",
                       selectedOrder.status === "Paid" ? "text-[#10b981]" : 
                       selectedOrder.status === "Shipped" ? "text-[#2c3b6e]" :
                       selectedOrder.status === "Cancelled" ? "text-[#cd5c5c]" : "text-[#f59e0b]"
                     )}>
                       {selectedOrder.status === "Paid" ? "Заказ Оплачен" :
                        selectedOrder.status === "Shipped" ? "Заказ Отправлен" :
                        selectedOrder.status === "Cancelled" ? "Заказ Отменен" : "В ожидании оплаты"}
                     </span>
                    <p className="text-[11px] text-[#4f566b] mt-1">{selectedOrder.date} • {selectedOrder.method}</p>
                 </div>

                 {/* Items List with Sizes */}
                 <div className="space-y-4">
                    <h3 className="text-[11px] font-black text-[#1a1f36] uppercase tracking-widest">Товары в заказе</h3>
                    <div className="space-y-3">
                       {selectedOrder.items.map((item: any, idx: number) => (
                         <div key={idx} className="flex items-center gap-4 p-3 border border-[#e3e8ee] rounded-xl group hover:bg-[#f7f8f9] transition-all">
                            <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#e3e8ee] bg-white relative">
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
