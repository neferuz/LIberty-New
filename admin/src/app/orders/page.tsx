"use client";

import { 
  MoreHorizontal, 
  ExternalLink,
  Plus,
  Filter,
  Download,
  Search,
  ChevronRight,
  ChevronDown,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

interface OrderItem {
  name: string;
  quantity: number;
  price: string;
  image?: string;
  color?: string;
  size?: string;
}

interface Order {
  id: string;
  customer: string;
  phone?: string;
  address?: string;
  date: string;
  total: string;
  status: string;
  items: number;
  items_list?: OrderItem[];
  method: string;
}

const statusConfig = {
  Pending: { label: "Ожидает оплаты", icon: Clock, emoji: "🕒", color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10" },
  Created: { label: "Заказ создан", icon: CheckCircle2, emoji: "✨", color: "text-blue-600", bg: "bg-blue-50" },
  Paid: { label: "Оплачен", icon: CheckCircle2, emoji: "✅", color: "text-[#10b981]", bg: "bg-[#10b981]/10" },
  Shipped: { label: "Доставляется", icon: Truck, emoji: "🚚", color: "text-[#2c3b6e]", bg: "bg-[#2c3b6e]/10" },
  Delivered: { label: "Доставлен", icon: CheckCircle2, emoji: "📦", color: "text-emerald-700", bg: "bg-emerald-50" },
  Cancelled: { label: "Отменен", icon: XCircle, emoji: "❌", color: "text-[#cd5c5c]", bg: "bg-[#cd5c5c]/10" },
};

const formatCustomerName = (name: string): string => {
  if (!name) return "";
  if (name.includes("@")) {
    const [username, domain] = name.split("@");
    if (username.length <= 4) {
      return `${username}...@${domain}`;
    }
    return `${username.substring(0, 4)}...@${domain}`;
  }
  return name;
};

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("Все");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dynamicOrders, setDynamicOrders] = useState<Order[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const itemsPerPage = 10;

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/v1/users/", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setUsersList(data);
        }
      }
    } catch (e) {
      console.error("Failed to fetch users list for orders linking:", e);
    }
  };

  const findCustomerId = (order: any) => {
    if (!usersList || usersList.length === 0) return null;
    
    // 1. Phone match
    if (order.phone && order.phone !== "Не указан" && order.phone !== "Из CRM / Bitrix") {
      const cleanOrderPhone = order.phone.replace(/\D/g, "");
      const matched = usersList.find(u => {
        if (!u.phone) return false;
        const cleanUPhone = u.phone.replace(/\D/g, "");
        return cleanOrderPhone && cleanUPhone && (cleanOrderPhone.includes(cleanUPhone) || cleanUPhone.includes(cleanOrderPhone));
      });
      if (matched) return matched.id;
    }
    
    // 2. Email match
    if (order.customer && order.customer.includes("@")) {
      const matched = usersList.find(u => u.email && u.email.toLowerCase().trim() === order.customer.toLowerCase().trim());
      if (matched) return matched.id;
    }
    
    // 3. Name match
    if (order.customer) {
      const cleanCustomer = order.customer.toLowerCase().trim();
      const matched = usersList.find(u => {
        if (!u.full_name) return false;
        const cleanName = u.full_name.toLowerCase().trim();
        return cleanName === cleanCustomer || cleanCustomer.includes(cleanName) || cleanName.includes(cleanCustomer);
      });
      if (matched) return matched.id;
    }
    
    return null;
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/v1/orders/all");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setDynamicOrders(data);
        } else {
          setDynamicOrders([]);
        }
      } else {
        setDynamicOrders([]);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setDynamicOrders([]);
    } finally {
      setFetching(false);
    }
  };

  const [detailedOrder, setDetailedOrder] = useState<Order | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder) return;
    
    // Optimistic UI update for premium fast interaction across all states
    setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    setDetailedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    setDynamicOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: newStatus } : o));
    
    try {
      const res = await fetch(`/api/v1/orders/${selectedOrder.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        alert("Не удалось сохранить новый статус на сервере.");
        fetchOrders();
      }
    } catch (err) {
      console.error("Failed to save order status:", err);
      alert("Ошибка сети при сохранении статуса заказа.");
      fetchOrders();
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/orders/${orderToDelete.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setDynamicOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
        setSelectedOrder(null);
        setDetailedOrder(null);
        setOrderToDelete(null);
      } else {
        const data = await res.json();
        alert(data.detail || "Не удалось удалить заказ.");
      }
    } catch (err) {
      console.error("Failed to delete order:", err);
      alert("Ошибка сети при удалении заказа.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (selectedOrder) {
      setLoadingDetail(true);
      setDetailedOrder(selectedOrder); // Render basic details immediately
      
      const fetchOrderDetail = async () => {
        try {
          const res = await fetch(`/api/v1/orders/${selectedOrder.id}`);
          if (res.ok) {
            const data = await res.json();
            setDetailedOrder(data);
          }
        } catch (err) {
          console.error("Error fetching detailed order data:", err);
        } finally {
          setLoadingDetail(false);
        }
      };
      fetchOrderDetail();
    } else {
      setDetailedOrder(null);
    }
  }, [selectedOrder]);

  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && dynamicOrders.length > 0) {
      const searchParam = new URLSearchParams(window.location.search).get("search");
      if (searchParam) {
        setSearchQuery(searchParam);
        const matched = dynamicOrders.find(o => 
          o.id.toLowerCase() === searchParam.toLowerCase() || 
          o.customer.toLowerCase().includes(searchParam.toLowerCase())
        );
        if (matched) {
          setSelectedOrder(matched);
        }
      }
    }
  }, [dynamicOrders]);

  const tabs = ["Все", "Ожидает оплаты", "Заказ создан", "Оплаченные", "Доставляется", "Доставлен", "Отмененные"];

  const filteredOrders = dynamicOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "Все") return matchesSearch;
    if (activeTab === "Ожидает оплаты") return matchesSearch && order.status === "Pending";
    if (activeTab === "Заказ создан") return matchesSearch && order.status === "Created";
    if (activeTab === "Оплаченные") return matchesSearch && order.status === "Paid";
    if (activeTab === "Доставляется") return matchesSearch && order.status === "Shipped";
    if (activeTab === "Доставлен") return matchesSearch && order.status === "Delivered";
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
                          <status.icon className="w-3.5 h-3.5" />
                          {status.label}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const custId = findCustomerId(order) || (usersList && usersList.length > 0 ? usersList[0].id : 4);
                          return (
                            <Link 
                              href={`/customers/${custId}`}
                              className="text-[13px] font-semibold text-[#2c3b6e] hover:text-[#1a1f36] hover:underline transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {formatCustomerName(order.customer)}
                            </Link>
                          );
                        })()}
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
        {selectedOrder && (() => {
          const orderToShow = detailedOrder || selectedOrder;
          return (
            <>
              {/* Backdrop */}
              <motion.div 
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedOrder(null)}
                className="fixed inset-0 w-screen h-screen bg-slate-900/30 backdrop-blur-sm z-[9999]"
              />
              
              {/* Drawer Content */}
              <motion.div 
                key="drawer"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-slate-100 z-[10000] shadow-2xl flex flex-col"
              >
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                  <div>
                     <h2 className="text-[15px] font-black text-slate-900 uppercase tracking-wider">Детали заказа</h2>
                     <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">#{orderToShow.id.replace('ORD-', '')}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                  {/* Status Selector Card */}
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-1">
                     <div className="flex items-center gap-3">
                       <div className={cn(
                         "w-9 h-9 rounded-xl flex items-center justify-center shadow-sm bg-slate-50 border border-slate-100",
                         statusConfig[orderToShow.status as keyof typeof statusConfig]?.color || "text-[#f59e0b]"
                       )}>
                         {(() => {
                           const ActiveIcon = statusConfig[orderToShow.status as keyof typeof statusConfig]?.icon || Clock;
                           return <ActiveIcon className="w-4 h-4" />;
                         })()}
                       </div>
                       <div>
                         <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Статус заказа</p>
                         <p className={cn("text-[12px] font-black uppercase tracking-wider mt-0.5", statusConfig[orderToShow.status as keyof typeof statusConfig]?.color || "text-slate-600")}>
                           {statusConfig[orderToShow.status as keyof typeof statusConfig]?.label}
                         </p>
                       </div>
                     </div>
                     
                     {/* Custom Interactive Dropdown Status Selector */}
                     <div className="relative z-50">
                       <button
                         onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                         className={cn(
                           "px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-400 rounded-lg text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 outline-none cursor-pointer transition-all shadow-sm",
                           statusConfig[orderToShow.status as keyof typeof statusConfig]?.color || "text-slate-500"
                         )}
                       >
                         <span>Изменить</span>
                         <ChevronDown className="w-3 h-3 text-slate-400" />
                       </button>
                       
                       {statusDropdownOpen && (
                         <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-[99999] overflow-hidden divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
                           {Object.entries(statusConfig).map(([key, cfg]) => (
                             <button
                               key={key}
                               onClick={() => {
                                 handleStatusChange(key);
                                 setStatusDropdownOpen(false);
                               }}
                               className={cn(
                                 "w-full px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-2 hover:bg-slate-50 transition-colors text-left cursor-pointer",
                                 cfg.color
                                )}
                             >
                               <cfg.icon className="w-3.5 h-3.5" />
                               <span>{cfg.label}</span>
                             </button>
                           ))}
                         </div>
                       )}
                     </div>
                  </div>

                  {/* Customer Details with Phone */}
                  <div className="space-y-2.5">
                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] px-1">Клиент</h3>
                    <div className="p-4 border border-slate-100 rounded-2xl flex items-center gap-3 bg-white shadow-sm">
                       <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-[13px] shadow-sm shrink-0">
                          {(orderToShow.customer.includes("@") ? orderToShow.customer[0] : orderToShow.customer.split(' ').map(n => n[0]).join('') || "Г").toUpperCase()}
                       </div>
                       <div className="flex-grow min-w-0">
                          {(() => {
                            const custId = findCustomerId(orderToShow) || (usersList && usersList.length > 0 ? usersList[0].id : 4);
                            return (
                              <Link 
                                href={`/customers/${custId}`}
                                className="text-[13px] font-black text-slate-900 hover:text-slate-700 hover:underline truncate block"
                              >
                                {formatCustomerName(orderToShow.customer)}
                              </Link>
                            );
                          })()}
                          {loadingDetail ? (
                            <div className="h-4 w-28 bg-slate-100 animate-pulse rounded mt-1" />
                          ) : (
                            <p className="text-[11px] text-slate-500 font-bold tracking-wider mt-0.5">{orderToShow.phone || "Телефон не указан"}</p>
                          )}
                       </div>
                    </div>
                  </div>

                  {/* Customer Address Details */}
                  <div className="space-y-2.5">
                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] px-1">Адрес доставки</h3>
                    <div className="p-4 border border-slate-100 rounded-2xl bg-white shadow-sm">
                      {loadingDetail ? (
                        <div className="space-y-2">
                          <div className="h-4 w-full bg-slate-100 animate-pulse rounded" />
                          <div className="h-4 w-2/3 bg-slate-100 animate-pulse rounded" />
                        </div>
                      ) : (
                        <p className="text-[12.5px] text-slate-800 leading-relaxed font-semibold">
                          {orderToShow.address || "Самовывоз / Адрес не указан"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ordered Items List */}
                  <div className="space-y-2.5">
                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] px-1">Товары в заказе</h3>
                    <div className="space-y-2">
                      {loadingDetail ? (
                        <div className="space-y-2">
                          <div className="h-12 w-full bg-slate-100 animate-pulse rounded-xl" />
                          <div className="h-12 w-full bg-slate-100 animate-pulse rounded-xl" />
                        </div>
                      ) : orderToShow.items_list && orderToShow.items_list.length > 0 ? (
                        orderToShow.items_list.map((item, idx) => (
                          <div key={idx} className="p-3 border border-slate-100 rounded-2xl flex items-center gap-3 bg-white shadow-sm hover:border-slate-200 transition-all duration-200">
                            {/* Product Thumbnail Photo */}
                            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex-shrink-0 relative">
                               <img 
                                 src={item.image || "/images/products/placeholder.jpg"} 
                                 alt={item.name} 
                                 className="w-full h-full object-cover"
                                 onError={(e) => {
                                   (e.target as HTMLImageElement).src = "/images/products/placeholder.jpg";
                                 }}
                               />
                            </div>
                            
                            {/* Product Specifications */}
                            <div className="flex-grow min-w-0">
                              <p className="text-[12.5px] font-extrabold text-slate-900 truncate leading-tight">{item.name}</p>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5">
                                {item.color && (
                                  <span className="inline-flex items-center text-[9px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded uppercase tracking-wider border border-slate-200/30">
                                    {item.color}
                                  </span>
                                )}
                                {item.size && (
                                  <span className="inline-flex items-center text-[9px] font-black px-1.5 py-0.5 bg-slate-900 text-white rounded uppercase tracking-wider">
                                    {item.size}
                                  </span>
                                )}
                                <span className="text-[11px] text-slate-500 font-semibold ml-1">
                                  {item.quantity} шт.
                                </span>
                              </div>
                            </div>
                            
                            {/* Price Tag */}
                            <span className="text-[12.5px] font-black text-slate-900 flex-shrink-0">{item.price}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 border border-dashed border-slate-200 rounded-2xl text-center text-[12px] text-slate-400 bg-white shadow-sm">
                          Товары отсутствуют
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Breakdown (Clean & No Taxes) */}
                  <div className="space-y-2.5">
                     <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] px-1">Оплата</h3>
                     <div className="p-4 bg-white border border-slate-100 rounded-2xl space-y-3 shadow-sm">
                        <div className="flex justify-between items-center text-[12.5px]">
                           <span className="text-slate-500 font-semibold">Способ оплаты</span>
                           <span className="text-slate-900 font-black uppercase tracking-wider text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{orderToShow.method}</span>
                        </div>
                        <div className="flex justify-between items-center text-[12.5px]">
                           <span className="text-slate-500 font-semibold">Количество товаров</span>
                           <span className="text-slate-900 font-black">{orderToShow.items} шт.</span>
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                           <span className="text-[12.5px] font-black text-slate-900">Итого к оплате</span>
                           <span className="text-[15px] font-black text-slate-900">{orderToShow.total}</span>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Sticky Footer Actions */}
                <div className="px-6 py-5 border-t border-slate-100 bg-[#fafafb] grid grid-cols-2 gap-3 sticky bottom-0 z-40">
                   <button 
                     onClick={() => {
                       const printWindow = window.open("", "_blank");
                       if (printWindow) {
                         printWindow.document.write(`
                           <html>
                             <head>
                               <title>Чек - ${orderToShow.id}</title>
                               <link rel="preconnect" href="https://fonts.googleapis.com">
                               <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                               <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
                               <style>
                                 @page { size: auto; margin: 10mm; }
                                 body { 
                                   font-family: 'Montserrat', -apple-system, sans-serif; 
                                   padding: 10px; 
                                   color: #000; 
                                   background: #fff; 
                                   font-size: 11px; 
                                   max-width: 580px; 
                                   margin: 0 auto; 
                                   -webkit-print-color-adjust: exact; 
                                   print-color-adjust: exact; 
                                 }
                                 .logo { 
                                   font-size: 18px; 
                                   font-weight: 900; 
                                   letter-spacing: 0.4em; 
                                   text-align: center; 
                                   margin-bottom: 2px; 
                                   text-transform: uppercase; 
                                   color: #000; 
                                 }
                                 .subtitle { 
                                   text-align: center; 
                                   font-size: 8px; 
                                   text-transform: uppercase; 
                                   letter-spacing: 0.2em; 
                                   color: #666; 
                                   margin-bottom: 15px; 
                                   font-weight: 600; 
                                 }
                                 .divider { 
                                   border-top: 1px solid #000; 
                                   margin: 12px 0; 
                                 }
                                 .info-grid { 
                                   display: grid; 
                                   grid-template-cols: 1fr 1fr; 
                                   gap: 20px; 
                                   margin-bottom: 15px; 
                                 }
                                 .info-block h3 { 
                                   font-size: 9px; 
                                   font-weight: 900; 
                                   text-transform: uppercase; 
                                   letter-spacing: 0.1em; 
                                   margin: 0 0 6px 0; 
                                   border-bottom: 1px solid #000; 
                                   padding-bottom: 3px; 
                                   color: #000; 
                                 }
                                 .info-block p { 
                                   margin: 3px 0; 
                                   font-weight: 500; 
                                   color: #333; 
                                   line-height: 1.3;
                                 }
                                 .info-block p strong { 
                                   font-weight: 700; 
                                   color: #000; 
                                 }
                                 .items-table { 
                                   width: 100%; 
                                   border-collapse: collapse; 
                                   margin: 15px 0; 
                                 }
                                 .items-table th { 
                                   font-size: 9px; 
                                   font-weight: 900; 
                                   text-transform: uppercase; 
                                   letter-spacing: 0.1em; 
                                   border-bottom: 1px solid #000; 
                                   padding: 8px 4px; 
                                   text-align: left; 
                                   color: #000; 
                                 }
                                 .items-table td { 
                                   padding: 8px 4px; 
                                   border-bottom: 1px solid #eee; 
                                   font-size: 11px; 
                                   vertical-align: top; 
                                   color: #333; 
                                 }
                                 .item-name { 
                                   font-weight: 700; 
                                   font-size: 11px; 
                                   color: #000; 
                                 }
                                 .item-spec { 
                                   font-size: 8px; 
                                   font-weight: 700; 
                                   text-transform: uppercase; 
                                   letter-spacing: 0.05em; 
                                   background: #f8f9fa; 
                                   padding: 1px 4px; 
                                   border-radius: 3px; 
                                   display: inline-block; 
                                   margin-top: 3px; 
                                   margin-right: 4px; 
                                   border: 1px solid #eee; 
                                   color: #333; 
                                 }
                                 .totals-section { 
                                   display: flex; 
                                   flex-direction: column; 
                                   align-items: flex-end; 
                                   gap: 6px; 
                                   margin-top: 10px; 
                                 }
                                 .total-row { 
                                   display: flex; 
                                   justify-content: space-between; 
                                   width: 220px; 
                                   padding: 2px 0; 
                                   font-weight: 500; 
                                   color: #333; 
                                 }
                                 .total-grand { 
                                   font-size: 13px; 
                                   font-weight: 900; 
                                   border-top: 1px solid #000; 
                                   border-bottom: 1px solid #000; 
                                   padding: 6px 0; 
                                   margin-top: 4px; 
                                   color: #000; 
                                 }
                                 .receipt-footer { 
                                   text-align: center; 
                                   margin-top: 30px; 
                                   font-size: 9px; 
                                   letter-spacing: 0.1em; 
                                   color: #666; 
                                   border-top: 1px dashed #ccc; 
                                   padding-top: 15px; 
                                   text-transform: uppercase;
                                   font-weight: 600;
                                 }
                               </style>
                             </head>
                             <body>
                               <div class="logo">LIBERTY WEAR</div>
                               <div class="subtitle">Official Receipt / Товарный Чек</div>
                               
                               <div class="divider"></div>
                               
                               <div class="info-grid">
                                 <div class="info-block">
                                   <h3>Поставщик / Seller</h3>
                                   <p><strong>LIBERTY WEAR LLC</strong></p>
                                   <p>Адрес: г. Ташкент, Яккасарайский р-н</p>
                                   <p>Телефон: +998 (71) 200-30-40</p>
                                 </div>
                                 <div class="info-block" style="text-align: right;">
                                   <h3>Заказ / Order Details</h3>
                                   <p>Заказ: <strong>${orderToShow.id}</strong></p>
                                   <p>Дата: <strong>${orderToShow.date}</strong></p>
                                   <p>Оплата: <strong>${orderToShow.method}</strong></p>
                                 </div>
                               </div>

                               <div class="info-grid" style="margin-top: -10px;">
                                 <div class="info-block">
                                   <h3>Покупатель / Customer</h3>
                                   <p><strong>${formatCustomerName(orderToShow.customer)}</strong></p>
                                   <p>Телефон: ${orderToShow.phone || "Не указан"}</p>
                                 </div>
                                 <div class="info-block" style="text-align: right;">
                                   <h3>Доставка / Shipping</h3>
                                   <p>${orderToShow.address || "Самовывоз / Адрес не указан"}</p>
                                 </div>
                               </div>
                               
                               <table class="items-table">
                                 <thead>
                                   <tr>
                                     <th style="width: 60%;">Описание Товара / Description</th>
                                     <th style="width: 20%; text-align: center;">Кол-во / Qty</th>
                                     <th style="width: 20%; text-align: right;">Цена / Price</th>
                                   </tr>
                                 </thead>
                                 <tbody>
                                   ${(orderToShow.items_list || []).map(item => `
                                     <tr>
                                       <td>
                                         <div class="item-name">${item.name}</div>
                                         ${item.color ? `<span class="item-spec">Цвет: ${item.color}</span>` : ""}
                                         ${item.size ? `<span class="item-spec">Размер: ${item.size}</span>` : ""}
                                       </td>
                                       <td style="text-align: center; font-weight: 600;">${item.quantity} шт.</td>
                                       <td style="text-align: right; font-weight: 800; color: #000;">${item.price}</td>
                                     </tr>
                                   `).join("")}
                                 </tbody>
                               </table>
                               
                               <div class="totals-section">
                                 <div class="total-row">
                                   <span>Количество товаров / Items</span>
                                   <strong>${orderToShow.items} шт.</strong>
                                 </div>
                                 <div class="total-row total-grand">
                                   <span>Итого к оплате / Grand Total</span>
                                   <strong>${orderToShow.total}</strong>
                                 </div>
                                </div>
                                
                                <div class="receipt-footer">
                                  СПАСИБО ЗА ПОКУПКУ / THANK YOU FOR SHOPPING
                                </div>

                                <script>
                                  window.onload = function() {
                                    window.print();
                                  }
                                </script>
                             </body>
                           </html>
                         `);
                         printWindow.document.close();
                       }
                     }}
                     className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[13px] font-black transition-all cursor-pointer active:scale-[0.98] outline-none border-none animate-in fade-in"
                   >
                     <ExternalLink className="w-4 h-4" />
                     Печать чека
                   </button>
                   <button 
                     onClick={() => setOrderToDelete(orderToShow)}
                     className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[13px] font-black transition-all cursor-pointer active:scale-[0.98] outline-none border border-rose-200/50"
                   >
                     Удалить заказ
                   </button>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* Confirmation Modal for Order Deletion */}
      <AnimatePresence>
        {orderToDelete && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOrderToDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white border border-[#e3e8ee] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative z-50 p-6 space-y-6"
            >
              <div className="space-y-2 text-center">
                <h3 className="text-[16px] font-extrabold text-[#1a1f36] leading-tight">Удалить заказ из системы?</h3>
                <p className="text-[13px] text-[#4f566b] leading-relaxed">
                  Вы действительно хотите удалить заказ <span className="font-bold text-[#1a1f36]">{orderToDelete.id}</span>? Это действие безвозвратно удалит заказ из базы данных.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={deleting}
                  onClick={() => setOrderToDelete(null)}
                  className="px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-[13px] font-black text-slate-600 hover:bg-slate-50 transition-all outline-none cursor-pointer disabled:opacity-50"
                >
                  Отмена
                </button>
                <button
                  disabled={deleting}
                  onClick={handleDeleteOrder}
                  className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[13px] font-black hover:bg-slate-800 transition-all outline-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {deleting ? "Удаление..." : "Удалить"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
