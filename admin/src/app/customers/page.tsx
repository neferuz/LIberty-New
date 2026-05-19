"use client";

import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  Download,
  Plus,
  Search,
  Filter,
  ChevronRight,
  RefreshCw,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCustomers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      // 1. Fetch all users
      const res = await fetch("/api/v1/users/", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        
        // 2. Fetch all real orders to compute exact stats
        let realOrders: any[] = [];
        try {
          const ordersRes = await fetch("/api/v1/orders/all", {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            if (Array.isArray(ordersData)) {
              realOrders = ordersData;
            }
          }
        } catch (ordersErr) {
          console.error("Error fetching system orders for customers mapping:", ordersErr);
        }
        
        // Map backend User schema with exact dynamic orders/spent stats
        const mapped = data.map((u: any) => {
          const displayEmail = u.email.includes("@liberty-wear.uz") ? "Вход по телефону" : u.email;
          
          // Map real orders for this specific customer
          const matchedOrders = realOrders.filter((o: any) => {
            // 1. Phone match
            if (o.phone && u.phone) {
              const cleanOrderPhone = o.phone.replace(/\D/g, "");
              const cleanUPhone = u.phone.replace(/\D/g, "");
              if (cleanOrderPhone && cleanUPhone && (cleanOrderPhone.includes(cleanUPhone) || cleanUPhone.includes(cleanOrderPhone))) {
                return true;
              }
            }
            
            // 2. Email match
            if (u.email) {
              const cleanEmail = u.email.toLowerCase().trim();
              if (o.customer && o.customer.toLowerCase().trim() === cleanEmail) return true;
              if (o.email && o.email.toLowerCase().trim() === cleanEmail) return true;
            }
            
            // 3. Name match
            if (u.full_name && o.customer) {
              const cleanName = u.full_name.toLowerCase().trim();
              const cleanOrderCust = o.customer.toLowerCase().trim();
              if (cleanName && cleanOrderCust && (cleanName === cleanOrderCust || cleanOrderCust.includes(cleanName) || cleanName.includes(cleanOrderCust))) {
                return true;
              }
            }
            
            return false;
          });
          
          // Calculate actual spent sum and order count
          const orderCount = matchedOrders.length;
          const spentSumVal = matchedOrders.reduce((sum: number, o: any) => {
            const numericStr = (o.total || "").replace(/\D/g, "");
            const numericVal = parseInt(numericStr, 10) || 0;
            return sum + numericVal;
          }, 0);
          
          const spentSum = spentSumVal > 0 ? `${spentSumVal.toLocaleString("ru-RU").replace(/,/g, " ")} сум` : "0 сум";

          // Format registrationDate instead of lastVisit
          let registrationDate = "—";
          if (u.created_at) {
            const date = new Date(u.created_at);
            registrationDate = date.toLocaleDateString("ru-RU", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            });
          }

          return {
            id: String(u.id),
            name: u.full_name || "Без имени",
            email: displayEmail,
            phone: u.phone || "—",
            spent: spentSum,
            orders: orderCount,
            registrationDate: registrationDate
          };
        });

        setCustomers(mapped);
      } else {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else {
          setError("Не удалось загрузить список пользователей с сервера.");
        }
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Ошибка соединения с сервером бэкенда.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/v1/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        // Success! Remove user from the list
        setCustomers(prev => prev.filter(c => c.id !== userToDelete.id));
        setUserToDelete(null);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || "Не удалось удалить пользователя. Попробуйте позже.");
      }
    } catch (e) {
      console.error("Error deleting user:", e);
      alert("Произошла ошибка при соединении с сервером.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight mb-1">Клиенты</h1>
          <p className="text-[14px] text-[#4f566b]">Управление клиентской базой и анализ активности покупателей из базы.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchCustomers}
            className="flex items-center justify-center p-2 text-[#4f566b] bg-white border border-[#e3e8ee] rounded-md hover:bg-[#f7f8f9] transition-all"
            title="Обновить"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
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
            placeholder="Поиск по имени, телефону или email..." 
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

      {/* Error & Loading displays */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
          <p className="text-xs text-red-600 font-bold uppercase tracking-wider">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-[#2c3b6e]/10 border-t-[#2c3b6e] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#4f566b] uppercase tracking-wider font-bold">Загрузка базы клиентов...</p>
        </div>
      ) : (
        /* Customers Table */
        <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f7f8f9] border-b border-[#e3e8ee]">
                  <th className="px-6 py-3.5 text-[11px] font-black text-[#4f566b] uppercase tracking-wider">Покупатель / Customer</th>
                  <th className="px-6 py-3.5 text-[11px] font-black text-[#4f566b] uppercase tracking-wider text-right">Сумма покупок / Spent</th>
                  <th className="px-6 py-3.5 text-[11px] font-black text-[#4f566b] uppercase tracking-wider text-right">Заказы / Orders</th>
                  <th className="px-6 py-3.5 text-[11px] font-black text-[#4f566b] uppercase tracking-wider text-right">Дата регистрации</th>
                  <th className="px-6 py-3.5 w-[120px] text-right text-[11px] font-black text-[#4f566b] uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3e8ee]">
                {filteredCustomers.map((customer, idx) => {
                  // Compute safe initials for profile icon
                  const parts = customer.name.trim().split(/\s+/);
                  const initials = parts.map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || "К";

                  return (
                    <motion.tr 
                      key={customer.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.03, 0.5) }}
                      className="group cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                    >
                      <td className="px-6 py-4.5">
                        <Link href={`/customers/${customer.id}`} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-[13px] shadow-sm shrink-0">
                            {initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[13px] font-black text-slate-900 group-hover:text-slate-700 transition-colors">{customer.name}</span>
                            <span className="text-[11px] text-[#4f566b] font-medium mt-0.5">{customer.email}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <Link href={`/customers/${customer.id}`} className="block text-[13px] font-black text-slate-900">
                          {customer.spent}
                        </Link>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <Link href={`/customers/${customer.id}`} className="block text-[13px] font-extrabold text-[#4f566b]">
                          {customer.orders}
                        </Link>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <Link href={`/customers/${customer.id}`} className="block text-[12px] font-bold text-[#4f566b]">
                          {customer.registrationDate}
                        </Link>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setUserToDelete(customer)}
                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all outline-none cursor-pointer"
                            title="Удалить клиента"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <Link href={`/customers/${customer.id}`} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-sm">
                          <Search className="w-5 h-5" />
                        </div>
                        <h3 className="text-[13px] font-black text-slate-900 mb-1">Покупатели не найдены</h3>
                        <p className="text-[11px] text-[#4f566b] leading-relaxed max-w-[240px] mx-auto">
                          По вашему запросу ничего не найдено. Проверьте правильность написания или сбросьте фильтры.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Customer Deletion */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUserToDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white border border-[#e3e8ee] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative z-50 p-6 space-y-6"
            >
              <div className="space-y-2 text-center">
                <h3 className="text-[16px] font-extrabold text-[#1a1f36] leading-tight">Удалить клиента из системы?</h3>
                <p className="text-[13px] text-[#4f566b] leading-relaxed">
                  Вы действительно хотите удалить пользователя <span className="font-bold text-[#1a1f36]">{userToDelete.name}</span>? Это действие безвозвратно сотрет все данные аккаунта.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={deleting}
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-[13px] font-black text-slate-600 hover:bg-slate-50 transition-all outline-none cursor-pointer disabled:opacity-50"
                >
                  Отмена
                </button>
                <button
                  disabled={deleting}
                  onClick={handleDeleteUser}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[13px] font-black transition-all outline-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-rose-600/10"
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
