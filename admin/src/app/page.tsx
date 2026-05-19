"use client";

import { 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreHorizontal, 
  ExternalLink,
  Plus,
  Filter,
  Download,
  Calendar,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, animate } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Counter = ({ value, prefix = "", suffix = "" }: { value: string, prefix?: string, suffix?: string }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  
  const numericValue = parseInt(value.replace(/[^0-9]/g, ""));
  
  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(0, numericValue, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(value) {
        const formatted = new Intl.NumberFormat('ru-RU').format(Math.round(value));
        node.textContent = `${prefix}${formatted}${suffix}`;
      }
    });

    return () => controls.stop();
  }, [numericValue, prefix, suffix]);

  return <span ref={nodeRef} className="tabular-nums">0</span>;
};

export default function DashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Последние 30 дней");
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch("/api/v1/orders/all");
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard orders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const periods = [
    { id: "today", label: "Сегодня" },
    { id: "yesterday", label: "Вчера" },
    { id: "week", label: "Последние 7 дней" },
    { id: "month", label: "Последние 30 дней" },
    { id: "quarter", label: "Последние 90 дней" },
  ];

  // Calculate dynamic stats from real orders database
  let totalGross = 0;
  let totalNet = 0;
  let newClientsSet = new Set<string>();
  let successfulPayments = 0;
  let totalPaymentsCount = orders.length;

  orders.forEach((order) => {
    const amount = parseInt(order.total.replace(/[^0-9]/g, "")) || 0;
    totalGross += amount;
    
    // Check if status is successful (Paid, Shipped, or Delivered)
    const isSuccessful = ["Paid", "Shipped", "Delivered"].includes(order.status);
    if (isSuccessful) {
      totalNet += amount;
      successfulPayments += 1;
    }
    
    if (order.customer) {
      newClientsSet.add(order.customer);
    }
  });

  const successPercent = totalPaymentsCount > 0 
    ? Math.round((successfulPayments / totalPaymentsCount) * 100) 
    : 100;

  const stats = [
    { 
      label: "Валовый объем", 
      value: `${totalGross} сум`, 
      change: "+100%", 
      trend: "up", 
      secondary: "100% реальные данные",
    },
    { 
      label: "Чистый объем продаж", 
      value: `${totalNet} сум`, 
      change: "+100%", 
      trend: "up", 
      secondary: totalPaymentsCount > 0 
        ? `В среднем ${(totalGross / totalPaymentsCount).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} сум / заказ`
        : "Нет заказов",
    },
    { 
      label: "Всего клиентов", 
      value: `${newClientsSet.size}`, 
      change: "+100%", 
      trend: "up", 
      secondary: "Уникальные покупатели",
    },
    { 
      label: "Успешные платежи", 
      value: `${successPercent}%`, 
      change: "+0.0%", 
      trend: "up", 
      secondary: `${successfulPayments} из ${totalPaymentsCount} успешно`,
    },
  ];

  const recentTransactions = orders.slice(0, 5).map((order) => {
    let method = order.method || "При получении";
    let status = order.status === "Paid" ? "Succeeded" : (order.status === "Cancelled" ? "Refunded" : "Pending");
    
    return {
      id: order.id,
      customer: order.customer,
      amount: order.total,
      status: status,
      date: order.date,
      method: method
    };
  });

  // Calculate dynamic today and yesterday gross
  let todayGross = 0;
  let yesterdayGross = 0;
  
  const todayDateObj = new Date();
  const monthsRu = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  const todayStr = `${todayDateObj.getDate()} ${monthsRu[todayDateObj.getMonth()]}`;
  
  const yesterdayDateObj = new Date(todayDateObj.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = `${yesterdayDateObj.getDate()} ${monthsRu[yesterdayDateObj.getMonth()]}`;

  // Calculate real payment methods distribution
  let clickCount = 0;
  let paymeCount = 0;
  let codCount = 0;

  orders.forEach((order) => {
    const amount = parseInt(order.total.replace(/[^0-9]/g, "")) || 0;
    const orderDate = order.date || "";
    if (orderDate.includes(todayStr)) {
      todayGross += amount;
    } else if (orderDate.includes(yesterdayStr)) {
      yesterdayGross += amount;
    }

    const method = order.method || "При получении";
    if (method.includes("CLICK")) {
      clickCount++;
    } else if (method.includes("Payme")) {
      paymeCount++;
    } else {
      codCount++;
    }
  });

  const totalPaymentMethodsCount = clickCount + paymeCount + codCount;
  
  const clickPercent = totalPaymentMethodsCount > 0 ? Math.round((clickCount / totalPaymentMethodsCount) * 100) : 0;
  const paymePercent = totalPaymentMethodsCount > 0 ? Math.round((paymeCount / totalPaymentMethodsCount) * 100) : 0;
  const codPercent = totalPaymentMethodsCount > 0 ? (100 - clickPercent - paymePercent) : 100; // make sure it sums to 100

  // Fallback defaults if no orders are present yet
  const clickFinalPercent = totalPaymentMethodsCount > 0 ? clickPercent : 35;
  const paymeFinalPercent = totalPaymentMethodsCount > 0 ? paymePercent : 25;
  const codFinalPercent = totalPaymentMethodsCount > 0 ? codPercent : 40;

  const todayGrossFormatted = todayGross > 0 
    ? `${(todayGross / 1000).toFixed(0)}K сум`
    : "0 сум";
  const yesterdayGrossFormatted = yesterdayGross > 0 
    ? `${(yesterdayGross / 1000).toFixed(0)}K сум`
    : "0 сум";

  const dynamicPaymentMethods = [
    { label: "CLICK Онлайн", val: `${clickFinalPercent}%`, color: "bg-[#2c3b6e]", strokeColor: "url(#visaGrad)", growth: "+0.0%", detail: `${clickCount} транз.`, share: clickFinalPercent },
    { label: "Payme Онлайн", val: `${paymeFinalPercent}%`, color: "bg-[#10b981]", strokeColor: "url(#appleGrad)", growth: "+0.0%", detail: `${paymeCount} транз.`, share: paymeFinalPercent },
    { label: "При получении", val: `${codFinalPercent}%`, color: "bg-[#f59e0b]", strokeColor: "url(#googleGrad)", growth: "+0.0%", detail: `${codCount} транз.`, share: codFinalPercent },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c3b6e]/20 border-t-[#2c3b6e] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight mb-1">Платежи</h1>
          <p className="text-[14px] text-[#4f566b]">Обзор активности за {selectedPeriod.toLowerCase()}.</p>
        </div>
        <div className="flex items-center gap-2 relative">
          <button className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-[#4f566b] bg-white border border-[#e3e8ee] rounded-md hover:bg-[#f7f8f9] transition-all">
            <Filter className="w-3.5 h-3.5" />
            Фильтр
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsPeriodMenuOpen(!isPeriodMenuOpen)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold transition-all border rounded-md",
                isPeriodMenuOpen ? "bg-[#f7f8f9] border-[#635bff] text-[#635bff]" : "bg-white border-[#e3e8ee] text-[#4f566b] hover:bg-[#f7f8f9]"
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              {selectedPeriod}
            </button>
            
            <AnimatePresence>
              {isPeriodMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#e3e8ee] rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-1.5">
                    {periods.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedPeriod(p.label);
                          setIsPeriodMenuOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-[13px] font-medium rounded-lg transition-colors",
                          selectedPeriod === p.label ? "bg-[#635bff]/5 text-[#635bff]" : "text-[#4f566b] hover:bg-[#f7f8f9] hover:text-[#1a1f36]"
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-white bg-[#2c3b6e] border border-[#2c3b6e] rounded-md hover:bg-[#232f58] transition-all">
            <Plus className="w-3.5 h-3.5" />
            Создать платеж
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-5 bg-white border border-[#e3e8ee] rounded-xl hover:border-[#2c3b6e]/30 transition-all group flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <p className="text-[12px] font-semibold text-[#4f566b] uppercase tracking-wider">{stat.label}</p>
              <div className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-bold",
                stat.trend === "up" ? "text-[#228b22] bg-[#228b22]/10" : "text-[#cd5c5c] bg-[#cd5c5c]/10"
              )}>
                {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <div className="text-xl font-bold text-[#1a1f36] tracking-tight mb-1 h-7">
               <Counter 
                 key={`${orders.length}-${selectedPeriod}-${idx}`}
                 value={stat.value} 
                 suffix={stat.value.includes("сум") ? " сум" : ""}
               />
            </div>
            <p className="text-[11px] text-[#4f566b] font-medium">{stat.secondary}</p>
          </motion.div>
        ))}
      </div>

      {/* Performance Diagrams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-[#e3e8ee] rounded-xl p-5 relative group overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-0.5">
              <h2 className="text-[14px] font-bold text-[#1a1f36]">Общий объем</h2>
              <p className="text-[11px] text-[#4f566b]">Сравнение за {selectedPeriod.toLowerCase()}</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#2c3b6e]" />
                 <span className="text-[11px] text-[#4f566b] font-medium">Текущий</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#e3e8ee]" />
                 <span className="text-[11px] text-[#4f566b] font-medium">Предыдущий</span>
               </div>
            </div>
          </div>
          
          <div 
            className="relative h-48 w-full group/chart mt-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <AnimatePresence>
              {isHovered && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-2/3 top-0 -translate-x-1/2 z-20 pointer-events-none"
                >
                   <div className="bg-white border border-[#e3e8ee] rounded-lg p-3 min-w-[170px]">
                      <div className="flex justify-between items-center mb-2.5 border-b border-[#f7f8f9] pb-2">
                        <span className="text-[11px] font-bold text-[#1a1f36]">Валовый объем</span>
                        <span className="text-[10px] text-[#2c3b6e] font-bold bg-[#2c3b6e]/10 px-1.5 py-0.5 rounded">+100%</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#2c3b6e]" />
                            <span className="text-[10px] text-[#4f566b] font-medium">Сегодня</span>
                          </div>
                          <span className="text-[10px] font-bold text-[#1a1f36]">{todayGrossFormatted}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#e3e8ee]" />
                            <span className="text-[10px] text-[#4f566b] font-medium">Вчера</span>
                          </div>
                          <span className="text-[10px] font-bold text-[#1a1f36]">{yesterdayGrossFormatted}</span>
                        </div>
                      </div>
                   </div>
                   <div className="w-px h-44 bg-[#2c3b6e]/30 absolute left-1/2 top-full -translate-x-1/2 border-l border-dashed border-[#2c3b6e]/50 mt-1" />
                </motion.div>
              )}
            </AnimatePresence>

            <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none" className="overflow-visible">
               <defs>
                 <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0%" stopColor="#2c3b6e" stopOpacity="0.1" />
                   <stop offset="100%" stopColor="#2c3b6e" stopOpacity="0" />
                 </linearGradient>
               </defs>
               {[0, 50, 100, 150, 200].map(y => (
                 <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="#f7f8f9" strokeWidth="1" />
               ))}
               <motion.path
                 initial={{ pathLength: 0, opacity: 0 }}
                 animate={{ pathLength: 1, opacity: 1 }}
                 transition={{ duration: 1.5, ease: "easeInOut" }}
                 d="M 0,160 C 100,160 150,140 200,150 S 350,110 400,120 S 550,130 600,130 S 750,80 800,90 S 950,100 1000,100"
                 fill="none"
                 stroke="#e3e8ee"
                 strokeWidth="2"
                 strokeLinecap="round"
                 strokeDasharray="6 6"
               />
               <motion.path
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ duration: 2, delay: 0.5 }}
                 d="M 0,180 C 100,180 150,160 200,170 S 350,120 400,130 S 550,140 600,140 S 750,50 800,60 S 950,80 1000,80 V 200 H 0 Z"
                 fill="url(#chartGradient)"
               />
               <motion.path
                 initial={{ pathLength: 0 }}
                 animate={{ pathLength: 1 }}
                 transition={{ duration: 2, ease: "easeInOut" }}
                 d="M 0,180 C 100,180 150,160 200,170 S 350,120 400,130 S 550,140 600,140 S 750,50 800,60 S 950,80 1000,80"
                 fill="none"
                 stroke="#2c3b6e"
                 strokeWidth="3"
                 strokeLinecap="round"
               />
               <motion.circle 
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 transition={{ delay: 2, type: "spring" }}
                 cx="666" cy="115" r="4" fill="white" stroke="#2c3b6e" strokeWidth="2" 
               />
            </svg>
            <div className="flex justify-between mt-6 border-t border-[#f7f8f9] pt-2">
              <span className="text-[9px] text-[#4f566b] font-bold uppercase tracking-widest">12:00 AM</span>
              <span className="text-[9px] text-[#4f566b] font-bold uppercase tracking-widest">08:48 PM</span>
              <span className="text-[9px] text-[#4f566b] font-bold uppercase tracking-widest">12:00 AM</span>
            </div>
          </div>
        </div>

        {/* Payment Methods Chart */}
        <div className="bg-white border border-[#e3e8ee] rounded-xl p-5 flex flex-col relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-bold text-[#1a1f36]">Методы оплаты</h2>
            <div className="p-1 bg-[#f7f8f9] rounded-md">
               <MoreHorizontal className="w-3 h-3 text-[#4f566b]" />
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 mb-6 group/donut">
              <div className="absolute inset-0 bg-[#2c3b6e]/5 rounded-full blur-3xl opacity-0 group-hover/donut:opacity-100 transition-opacity duration-1000" />
              <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
                <defs>
                   <linearGradient id="visaGrad" x1="0" y1="0" x2="1" y2="1">
                     <stop offset="0%" stopColor="#2c3b6e" />
                     <stop offset="100%" stopColor="#4a5e9e" />
                   </linearGradient>
                   <linearGradient id="appleGrad" x1="0" y1="0" x2="1" y2="1">
                     <stop offset="0%" stopColor="#10b981" />
                     <stop offset="100%" stopColor="#34d399" />
                   </linearGradient>
                   <linearGradient id="googleGrad" x1="0" y1="0" x2="1" y2="1">
                     <stop offset="0%" stopColor="#f59e0b" />
                     <stop offset="100%" stopColor="#fbbf24" />
                   </linearGradient>
                </defs>
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f7f8f9" strokeWidth="3" />
                <motion.circle 
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${clickFinalPercent}, 100` }}
                  whileHover={{ strokeWidth: 5 }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  cx="18" cy="18" r="15.5" fill="none" stroke="url(#visaGrad)" strokeWidth="4" strokeLinecap="round" 
                />
                <motion.circle 
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${paymeFinalPercent}, 100` }}
                  whileHover={{ strokeWidth: 5 }}
                  transition={{ duration: 1.5, delay: 0.2, ease: "circOut" }}
                  cx="18" cy="18" r="15.5" fill="none" stroke="url(#appleGrad)" strokeWidth="4" strokeDashoffset={`-${clickFinalPercent}`} strokeLinecap="round" 
                />
                <motion.circle 
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${codFinalPercent}, 100` }}
                  whileHover={{ strokeWidth: 5 }}
                  transition={{ duration: 1.5, delay: 0.4, ease: "circOut" }}
                  cx="18" cy="18" r="15.5" fill="none" stroke="url(#googleGrad)" strokeWidth="4" strokeDashoffset={`-${clickFinalPercent + paymeFinalPercent}`} strokeLinecap="round" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[20px] font-bold text-[#1a1f36]">{orders.length}</span>
                <span className="text-[8px] font-bold text-[#4f566b] uppercase tracking-tighter">Платежей</span>
              </div>
            </div>
            <div className="w-full space-y-1.5">
               {dynamicPaymentMethods.map((item) => (
                 <div key={item.label} className="flex items-center justify-between p-2 rounded-lg border border-[#e3e8ee]/60 bg-[#f7f8f9]/30 hover:bg-white hover:border-[#2c3b6e]/30 transition-all cursor-default group/item">
                    <div className="flex items-center gap-2.5">
                       <div className={cn("w-1 h-6 rounded-full", item.color)} />
                       <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-[#1a1f36] leading-none mb-0.5">{item.label}</span>
                          <span className="text-[9px] text-[#4f566b] font-medium">{item.detail}</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="flex flex-col items-end">
                          <span className="text-[12px] font-bold text-[#1a1f36] leading-none mb-0.5">{item.val}</span>
                          <span className={cn("text-[9px] font-bold", item.growth.startsWith("+") ? "text-[#10b981]" : "text-[#cd5c5c]")}>
                            {item.growth}
                          </span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e3e8ee] flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-[#1a1f36]">Последние транзакции</h2>
            <Link href="/orders" className="text-[13px] font-semibold text-[#2c3b6e] hover:underline flex items-center gap-1">
              Смотреть все
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f7f8f9] border-b border-[#e3e8ee]">
                  <th className="px-6 py-2.5 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Транзакция</th>
                  <th className="px-6 py-2.5 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Статус</th>
                  <th className="px-6 py-2.5 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Клиент</th>
                  <th className="px-6 py-2.5 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider text-right">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3e8ee]">
                {recentTransactions.map((tr) => (
                  <tr 
                    key={tr.id} 
                    onClick={() => router.push(`/orders?search=${tr.id}`)}
                    className="group cursor-pointer hover:bg-[#2c3b6e]/[0.02] transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-[#1a1f36] group-hover:text-[#2c3b6e] transition-colors">{tr.amount}</span>
                        <span className="text-[10px] text-[#4f566b] font-medium mt-0.5">{tr.method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                        tr.status === "Succeeded" ? "bg-[#10b981]/10 text-[#10b981]" : 
                        tr.status === "Pending" ? "bg-[#f59e0b]/10 text-[#f59e0b]" : 
                        "bg-[#cd5c5c]/10 text-[#cd5c5c]"
                      )}>
                        <div className={cn("w-1 h-1 rounded-full mr-1.5", 
                          tr.status === "Succeeded" ? "bg-[#10b981]" : 
                          tr.status === "Pending" ? "bg-[#f59e0b]" : 
                          "bg-[#cd5c5c]"
                        )} />
                        {tr.status === "Succeeded" ? "Успешно" : tr.status === "Pending" ? "В процессе" : "Возврат"}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-[13px] font-semibold text-[#4f566b] group-hover:text-[#1a1f36] transition-colors">{tr.customer}</span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-[12px] font-medium text-[#4f566b]">{tr.date}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/orders?search=${tr.id}`);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-[#2c3b6e] uppercase mt-1"
                        >
                          Детали
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Reports */}
        <div className="space-y-6">
          <div className="bg-white border border-[#e3e8ee] rounded-xl p-6">
             <h3 className="text-[15px] font-bold text-[#1a1f36] mb-4">Быстрые отчеты</h3>
             <div className="space-y-2">
                {["Отчет по продажам за месяц", "Аналитика клиентов Q2", "История выплат", "Налоговые документы 2024"].map((report) => (
                  <button key={report} className="w-full flex items-center justify-between p-3 rounded-lg border border-[#e3e8ee] hover:border-[#2c3b6e] hover:bg-[#f7f8f9] transition-all group text-left">
                    <span className="text-[13px] font-semibold text-[#4f566b] group-hover:text-[#1a1f36]">{report}</span>
                    <Download className="w-3.5 h-3.5 text-[#4f566b]" />
                  </button>
                ))}
             </div>
          </div>
          <div className="bg-[#f7f8f9] border border-[#e3e8ee] rounded-xl p-6">
            <h3 className="text-[13px] font-bold text-[#1a1f36] mb-2 uppercase tracking-widest">Информация</h3>
            <p className="text-[12px] text-[#4f566b] leading-relaxed">
              Все данные обновляются в режиме реального времени. Последнее обновление: только что.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
