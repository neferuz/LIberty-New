"use client";

import { 
  ArrowLeft,
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Target,
  Zap,
  Search,
  XCircle,
  ExternalLink,
  DollarSign,
  Package,
  Info
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

  // Format Customer Name helper
  const formatCustomerName = (custName: any) => {
    if (!custName) return "Без имени";
    if (typeof custName === "string") {
      if (custName.includes("@")) return "Покупатель Liberty Wear";
      return custName;
    }
    if (typeof custName === "object") {
      const fName = custName.first_name || "";
      const lName = custName.last_name || "";
      const emailVal = custName.email || "";
      const formatted = `${fName} ${lName}`.trim();
      if (formatted) return formatted;
      if (emailVal) return emailVal.includes("@") && emailVal.includes("phone") ? "Покупатель Liberty Wear" : emailVal;
    }
    return "Покупатель Liberty Wear";
  };

  // Map dynamic user details
  const displayEmail = customer.email.includes("@liberty-wear.uz") ? "Вход по телефону" : customer.email;
  
  // Registration date formatting
  const registerDate = customer.created_at 
    ? new Date(customer.created_at).toLocaleDateString("ru-RU", { 
        day: "2-digit", 
        month: "long", 
        year: "numeric"
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
      image: item.image || "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=200&h=200&auto=format&fit=crop",
      quantity: item.quantity || 1
    })) : [
      {
        name: "Заказ с сайта / CRM",
        price: o.total,
        size: "S",
        color: "Черный",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=200&h=200&auto=format&fit=crop",
        quantity: 1
      }
    ];

    return {
      id: o.id || `ORD-${Date.now()}`,
      date: o.date || "Недавно",
      total: o.total || "0 сум",
      status: o.status || "Pending",
      itemsCount: o.items || 1,
      method: o.method || "При получении",
      phone: o.phone || customer.phone || "",
      address: o.address || displayAddress || "Самовывоз",
      customer: o.customer || customer.full_name || "",
      items_list: mappedItems,
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

  // Single Page Boutique Print Invoice Action
  const handlePrintReceiptForOrder = (orderToPrint: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
                           <html>
                             <head>
                               <title>Чек - ${orderToPrint.id}</title>
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
                                   <p>Заказ: <strong>\${orderToPrint.id}</strong></p>
                                   <p>Дата: <strong>\${orderToPrint.date}</strong></p>
                                   <p>Оплата: <strong>\${orderToPrint.method}</strong></p>
                                 </div>
                               </div>

                               <div class="info-grid" style="margin-top: -10px;">
                                 <div class="info-block">
                                   <h3>Покупатель / Customer</h3>
                                   <p><strong>\${formatCustomerName(orderToPrint.customer)}</strong></p>
                                   <p>Телефон: \${orderToPrint.phone || "Не указан"}</p>
                                 </div>
                                 <div class="info-block" style="text-align: right;">
                                   <h3>Доставка / Shipping</h3>
                                   <p>\${orderToPrint.address || "Самовывоз / Адрес не указан"}</p>
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
                                   \${(orderToPrint.items_list || []).map(item => \`
                                     <tr>
                                       <td>
                                         <div class="item-name">\${item.name}</div>
                                         \${item.color ? \`<span class="item-spec">Цвет: \${item.color}</span>\` : ""}
                                         \${item.size ? \`<span class="item-spec">Размер: \${item.size}</span>\` : ""}
                                       </td>
                                       <td style="text-align: center; font-weight: 600;">\${item.quantity} шт.</td>
                                       <td style="text-align: right; font-weight: 800; color: #000;">\${item.price}</td>
                                     </tr>
                                   \`).join("")}
                                 </tbody>
                               </table>
                               
                               <div class="totals-section">
                                 <div class="total-row">
                                   <span>Количество товаров / Items</span>
                                   <strong>\${orderToPrint.itemsCount} шт.</strong>
                                 </div>
                                 <div class="total-row total-grand">
                                   <span>Итого к оплате / Grand Total</span>
                                   <strong>\${orderToPrint.total}</strong>
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
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-4 pb-20 max-w-6xl mx-auto relative"
    >
      {/* 1. Profile Header (Buttons removed on the right) */}
      <motion.div variants={itemVariants} className="bg-white border border-[#e3e8ee] rounded-xl p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <Link href="/customers" className="p-2 border border-[#e3e8ee] rounded-lg hover:bg-slate-50 transition-all group">
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-900" />
             </Link>
             <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-[14px]">
                {initials}
             </div>
             <div>
                <div className="flex items-center gap-2">
                   <h1 className="text-[15px] font-black text-[#1a1f36]">{customer.full_name || "Без имени"}</h1>
                   {isVip && (
                     <span className="px-1.5 py-0.5 bg-slate-900 text-white text-[8px] font-black rounded uppercase tracking-widest border border-slate-900">VIP</span>
                   )}
                </div>
                <p className="text-[10px] text-[#4f566b] font-medium">{displayEmail}</p>
             </div>
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
           <div className="w-10 h-10 bg-[#f7f8f9] rounded-lg flex items-center justify-center text-slate-900">
              <CreditCard className="w-5 h-5" />
           </div>
           <div>
              <p className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest mb-0.5">Потрачено</p>
              <p className="text-[15px] font-black text-[#1a1f36] truncate">{totalSpent}</p>
           </div>
        </div>
        <div className="bg-white border border-[#e3e8ee] rounded-xl p-4 flex items-center gap-4">
           <div className="w-10 h-10 bg-[#f7f8f9] rounded-lg flex items-center justify-center text-slate-900">
              <ShoppingBag className="w-5 h-5" />
           </div>
           <div>
              <p className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest mb-0.5">Заказы</p>
              <p className="text-[15px] font-black text-[#1a1f36]">{orderCount} шт</p>
           </div>
        </div>
        <div className="bg-white border border-[#e3e8ee] rounded-xl p-4 flex items-center gap-4">
           <div className="w-10 h-10 bg-[#f7f8f9] rounded-lg flex items-center justify-center text-slate-900">
              <Target className="w-5 h-5" />
           </div>
           <div>
              <p className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest mb-0.5">Средний чек</p>
              <p className="text-[15px] font-black text-[#1a1f36] truncate">{averageOrder}</p>
           </div>
        </div>
        <div className="bg-white border border-[#e3e8ee] rounded-xl p-4 flex items-center gap-4">
           <div className="w-10 h-10 bg-[#f7f8f9] rounded-lg flex items-center justify-center text-slate-900">
              <Zap className="w-5 h-5" />
           </div>
           <div>
              <p className="text-[9px] font-bold text-[#4f566b] uppercase tracking-widest mb-0.5">Последний заказ</p>
              <p className="text-[15px] font-black text-[#1a1f36] truncate">{lastOrder}</p>
           </div>
        </div>
      </motion.div>

      {/* 3. History Table with Search & Pagination (Ultra Compact, Clean Layout) */}
      <motion.div variants={itemVariants} className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden shadow-sm shadow-black/[0.02]">
        <div className="px-5 py-3 border-b border-[#e3e8ee] flex flex-col md:flex-row items-center justify-between gap-4 bg-[#f7f8f9]/50">
           <div className="flex items-center gap-4 flex-1 w-full">
              <h3 className="text-[11px] font-black text-[#1a1f36] uppercase tracking-widest whitespace-nowrap">История заказов</h3>
              <div className="relative group flex-1 max-w-sm w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4f566b] group-focus-within:text-[#2c3b6e] transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Поиск по ID заказа..." 
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-9 pr-4 py-1.5 bg-white border border-[#e3e8ee] rounded-lg text-[12px] outline-none transition-all focus:border-[#2c3b6e]/30 focus:bg-white"
                  />
              </div>
           </div>
           <div className="flex items-center gap-1 shrink-0">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 border border-[#e3e8ee] rounded bg-white text-[10px] font-bold text-[#4f566b] hover:bg-[#f7f8f9] disabled:opacity-30 cursor-pointer"
              >
                Назад
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-7 h-7 flex items-center justify-center border rounded text-[10px] font-bold transition-all cursor-pointer",
                    currentPage === page 
                      ? "bg-[#2c3b6e] border-[#2c3b6e] text-white font-black" 
                      : "bg-white border-[#e3e8ee] text-[#4f566b] hover:bg-[#f7f8f9]"
                  )}
                >
                  {page}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 border border-[#e3e8ee] rounded bg-white text-[10px] font-bold text-[#4f566b] hover:bg-[#f7f8f9] disabled:opacity-30 cursor-pointer"
              >
                Вперед
              </button>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-[#f7f8f9] border-b border-[#e3e8ee]">
                  <th className="px-5 py-3 text-[10px] font-black text-[#4f566b] uppercase tracking-wider">Заказ / Order ID</th>
                  <th className="px-5 py-3 text-[10px] font-black text-[#4f566b] uppercase tracking-wider">Дата / Date</th>
                  <th className="px-5 py-3 text-[10px] font-black text-[#4f566b] uppercase tracking-wider text-center">Товары / Qty</th>
                  <th className="px-5 py-3 text-[10px] font-black text-[#4f566b] uppercase tracking-wider">Метод оплаты</th>
                  <th className="px-5 py-3 text-[10px] font-black text-[#4f566b] uppercase tracking-wider">Статус</th>
                  <th className="px-5 py-3 text-[10px] font-black text-[#4f566b] uppercase tracking-wider text-right">Сумма / Total</th>
                  <th className="px-5 py-3 w-10"></th>
               </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e8ee]">
               {paginatedOrders.length > 0 ? paginatedOrders.map((order) => (
                 <tr 
                   key={order.id} 
                   onClick={() => setSelectedOrder(order)}
                   className="hover:bg-slate-50 transition-all cursor-pointer group"
                 >
                    <td className="px-5 py-3.5">
                       <span className="text-[12px] font-black text-slate-900 group-hover:text-[#2c3b6e] transition-colors">{order.id}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[11px] font-semibold text-[#4f566b]">{order.date}</td>
                    <td className="px-5 py-3.5 text-center text-[12px] font-bold text-[#4f566b]">{order.itemsCount} шт.</td>
                    <td className="px-5 py-3.5 text-[11px] font-semibold text-[#4f566b]">{order.method}</td>
                    <td className="px-5 py-3.5">
                       <div className={cn(
                         "inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                         order.status === "Paid" ? "bg-[#10b981]/10 text-[#10b981]" : 
                         order.status === "Shipped" ? "bg-[#2c3b6e]/10 text-[#2c3b6e]" :
                         order.status === "Cancelled" ? "bg-[#cd5c5c]/10 text-[#cd5c5c]" : "bg-[#f59e0b]/10 text-[#f59e0b]"
                       )}>
                         {order.status === "Paid" ? "Оплачен" :
                          order.status === "Shipped" ? "Отправлен" :
                          order.status === "Cancelled" ? "Отменен" : "В ожидании"}
                       </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                       <span className="text-[12px] font-black text-slate-900">{order.total}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                       <ChevronRight className="w-4 h-4 text-[#e3e8ee] group-hover:text-[#2c3b6e] transition-all ml-auto" />
                    </td>
                 </tr>
               )) : (
                 <tr>
                   <td colSpan={7} className="px-5 py-16 text-center">
                     <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                       <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-sm">
                         <ShoppingBag className="w-5 h-5" />
                       </div>
                       <h3 className="text-[13px] font-black text-slate-900 mb-1">Заказы не найдены</h3>
                       <p className="text-[11px] text-[#4f566b] leading-relaxed max-w-[240px] mx-auto">
                         У данного покупателя пока нет оформленных заказов в системе.
                       </p>
                     </div>
                   </td>
                 </tr>
               )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 4. Order Details Drawer (Slide-over) - Redesigned to Quiet Luxury Theme */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 w-screen h-screen bg-slate-900/30 backdrop-blur-sm z-[9999]"
            />
            <motion.div 
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-slate-200 z-[10000] shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div>
                   <h2 className="text-[14px] font-black text-slate-900 uppercase tracking-widest">Детали Заказа</h2>
                   <p className="text-[11px] font-bold text-slate-400 mt-0.5">#{selectedOrder.id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all cursor-pointer">
                  <XCircle className="w-5 h-5 text-slate-400 hover:text-slate-900" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 {/* Status Selector Card */}
                 <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Статус Заказа</span>
                       <span className={cn(
                          "px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                          selectedOrder.status === "Paid" ? "bg-[#10b981]/10 text-[#10b981]" : 
                          selectedOrder.status === "Shipped" ? "bg-[#2c3b6e]/10 text-[#2c3b6e]" :
                          selectedOrder.status === "Cancelled" ? "bg-[#cd5c5c]/10 text-[#cd5c5c]" : "bg-[#f59e0b]/10 text-[#f59e0b]"
                       )}>
                         {selectedOrder.status === "Paid" ? "Оплачен" :
                          selectedOrder.status === "Shipped" ? "Отправлен" :
                          selectedOrder.status === "Cancelled" ? "Отменен" : "В ожидании"}
                       </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-[12px]">
                       <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Дата покупки</p>
                          <p className="font-bold text-slate-800">{selectedOrder.date}</p>
                       </div>
                       <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Тип оплаты</p>
                          <p className="font-bold text-slate-800">{selectedOrder.method}</p>
                       </div>
                    </div>
                 </div>

                 {/* Delivery Details Card */}
                 <div className="border border-slate-100 rounded-2xl p-4.5 space-y-4">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
                       <MapPin className="w-3.5 h-3.5 text-slate-500" />
                       Параметры доставки
                    </h3>
                    <div className="space-y-3">
                       <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Адрес назначения</p>
                          <p className="text-[12px] font-bold text-slate-900 leading-relaxed">{selectedOrder.address}</p>
                       </div>
                       <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Телефон получателя</p>
                          <p className="text-[12px] font-bold text-slate-900">{selectedOrder.phone || "Не указан"}</p>
                       </div>
                    </div>
                 </div>

                 {/* Items List */}
                 <div className="space-y-3.5">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                       <Package className="w-3.5 h-3.5 text-slate-500" />
                       Выбранные Товары
                    </h3>
                    <div className="space-y-3">
                       {selectedOrder.items.map((item: any, idx: number) => (
                         <div key={idx} className="flex items-center gap-4 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all group">
                            <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 relative shrink-0">
                               <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <h4 className="text-[12px] font-black text-slate-900 truncate">{item.name}</h4>
                               <div className="flex flex-wrap gap-1.5 mt-2">
                                  {item.size && (
                                     <span className="px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black rounded uppercase tracking-wider">{item.size}</span>
                                  )}
                                  {item.color && (
                                     <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[8px] font-black rounded uppercase tracking-wider border border-slate-200">{item.color}</span>
                                  )}
                                  <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[8px] font-black rounded uppercase tracking-wider border border-slate-100">{item.quantity} шт.</span>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                               <p className="text-[12px] font-black text-slate-900">{item.price}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Price Breakdown */}
                 <div className="border border-slate-100 rounded-2xl p-4.5 space-y-3.5 bg-slate-50/50">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
                       <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                       Финансовый расчет
                    </h3>
                    <div className="space-y-2 text-[12px]">
                       <div className="flex justify-between items-center text-slate-500 font-semibold">
                          <span>Стоимость товаров</span>
                          <span className="text-slate-800 font-black">{selectedOrder.total}</span>
                       </div>
                       <div className="flex justify-between items-center text-slate-500 font-semibold">
                          <span>Скидки и налоги</span>
                          <span className="text-slate-800 font-black">0 сум</span>
                       </div>
                       <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-[13px] font-black">
                          <span className="text-slate-900">Итого к оплате</span>
                          <span className="text-slate-900 text-[14px]">{selectedOrder.total}</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Action Footer */}
              <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 grid grid-cols-2 gap-3 shrink-0 sticky bottom-0 z-10">
                 <button 
                   onClick={() => handlePrintReceiptForOrder(selectedOrder)}
                   className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-[12px] font-black text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
                 >
                    <ExternalLink className="w-4 h-4" />
                    Распечатать чек
                 </button>
                 <button 
                   onClick={() => setSelectedOrder(null)}
                   className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[12px] font-black hover:bg-slate-800 transition-all cursor-pointer shadow-lg shadow-slate-900/10"
                 >
                    Закрыть
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
