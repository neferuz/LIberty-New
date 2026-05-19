"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Package, MapPin, User, LogOut, ChevronRight, X, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function ProfilePage() {
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState("orders");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [repeatingId, setRepeatingId] = useState<string | null>(null);

  // Payment Drawer States
  const [activePaymentOrder, setActivePaymentOrder] = useState<any | null>(null);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const handleSelectNewPaymentMethod = async (method: "click" | "payme" | "cod") => {
    if (!activePaymentOrder) return;
    
    const orderId = activePaymentOrder.id;
    const rawId = orderId.replace(/[^\d]/g, "");
    const amount = parseInt(activePaymentOrder.total.replace(/[^\d]/g, "")) || 0;
    
    if (method === "cod") {
      setUpdatingPayment(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/v1/orders/${encodeURIComponent(orderId)}/payment-method`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ method: "cod", status: "Created" })
        });
        
        if (res.ok) {
          // Update local orders list state dynamically
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, method: "При получении", status: "Created" } : o));
          setActivePaymentOrder(null);
        } else {
          alert("Не удалось изменить способ оплаты. Попробуйте еще раз.");
        }
      } catch (err) {
        console.error("Failed to update payment method:", err);
      } finally {
        setUpdatingPayment(false);
      }
    } else if (method === "click") {
      // Redirect to CLICK
      const returnUrl = encodeURIComponent(window.location.origin + "/profile");
      const clickUrl = `https://my.click.uz/services/pay?service_id=101626&merchant_id=45275&amount=${amount}&transaction_param=ORD-${rawId}&merchant_user_id=83104&return_url=${returnUrl}`;
      
      // Update method in backend first, then redirect
      try {
        const token = localStorage.getItem("token");
        await fetch(`/api/v1/orders/${encodeURIComponent(orderId)}/payment-method`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ method: "click" })
        });
      } catch (e) {
        console.error(e);
      }
      
      window.location.href = clickUrl;
    } else if (method === "payme") {
      // Redirect to Payme
      const token = localStorage.getItem("token");
      try {
        await fetch(`/api/v1/orders/${encodeURIComponent(orderId)}/payment-method`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ method: "payme" })
        });
      } catch (e) {
        console.error(e);
      }
      
      // Payme link format (Base64 params)
      const paymeMerchantId = "69454dd1656e7b8e815da033"; 
      const amountInTiyin = amount * 100;
      const base64Params = window.btoa(`m=${paymeMerchantId};ac.order_id=ORD-${rawId};a=${amountInTiyin}`);
      const paymeUrl = `https://checkout.paycom.uz/${base64Params}`;
      
      window.location.href = paymeUrl;
    }
  };

  const handleRepeatOrder = async (order: any) => {
    setRepeatingId(order.id);
    
    // Add all items from this order to the cart context
    if (order.items_list && order.items_list.length > 0) {
      order.items_list.forEach((item: any) => {
        const cartProduct = {
          id: item.id || 9999,
          name: item.name,
          price: item.price,
          image: item.image_url || "/images/placeholder.jpg",
          category: item.category || "Одежда",
          size: item.size || "M",
          color: item.color || "Темно-синий"
        };
        // Add item as many times as its quantity
        const quantityToAdd = item.quantity || 1;
        for (let i = 0; i < quantityToAdd; i++) {
          addItem(cartProduct);
        }
      });
    }

    setTimeout(() => {
      setRepeatingId(null);
      window.location.href = "/checkout";
    }, 1200);
  };
  
  // Backend User Profile & Orders State
  const [user, setUser] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [fullNameInput, setFullNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Addresses State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserProfileAndOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/auth";
        return;
      }

      try {
        // 1. Fetch profile
        const res = await fetch("/api/v1/users/me", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setFullNameInput(data.full_name || "");
          setPhoneInput(data.phone || "");
          if (data.addresses_json) {
            try {
              setAddresses(JSON.parse(data.addresses_json));
            } catch (e) {
              console.error("Error parsing addresses:", e);
            }
          }
        } else {
          // Token invalid or expired
          localStorage.removeItem("token");
          localStorage.removeItem("user_email");
          window.location.href = "/auth";
          return;
        }

        // 2. Fetch orders
        const ordersRes = await fetch("/api/v1/orders/my-orders", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          // Sort orders: latest orders first (by ID descending)
          const sortedOrders = Array.isArray(ordersData) 
            ? ordersData.sort((a: any, b: any) => {
                const idA = parseInt(a.id.replace(/[^\d]/g, "")) || 0;
                const idB = parseInt(b.id.replace(/[^\d]/g, "")) || 0;
                return idB - idA;
              })
            : [];
          setOrders(sortedOrders);
        }
      } catch (err) {
        console.error("Failed to fetch profile and orders:", err);
      } finally {
        setLoading(false);
        setOrdersLoading(false);
      }
    };

    fetchUserProfileAndOrders();
  }, []);

  useEffect(() => {
    if (selectedOrder || isAddressModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedOrder, isAddressModalOpen]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveSuccess(false);
    setSaveError("");

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/v1/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullNameInput,
          phone: phoneInput,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setUser(updated);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const errData = await res.json();
        setSaveError(errData.detail || "Не удалось сохранить изменения");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      setSaveError("Ошибка связи с сервером. Попробуйте позже.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_email");
    window.location.href = "/auth";
  };

  const saveAddressesToBackend = async (updatedAddresses: any[]) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await fetch("/api/v1/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          addresses_json: JSON.stringify(updatedAddresses)
        }),
      });
    } catch (err) {
      console.error("Save addresses error:", err);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    await saveAddressesToBackend(updated);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newAddr = {
      id: editingAddress?.id || Date.now(),
      type: formData.get("type") as string,
      region: formData.get("region") as string,
      street: formData.get("street") as string,
      flat: formData.get("flat") as string,
      zip: formData.get("zip") as string,
    };

    let updated = [];
    if (editingAddress) {
      updated = addresses.map(a => a.id === editingAddress.id ? newAddr : a);
    } else {
      updated = [...addresses, newAddr];
    }
    setAddresses(updated);
    setIsAddressModalOpen(false);
    setEditingAddress(null);
    await saveAddressesToBackend(updated);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-48 pb-24">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-brand-blue/10 border-t-brand-blue rounded-full animate-spin mx-auto" />
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Загрузка профиля...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Phone Formatter for Uzbekistan (+998)
  const formatPhoneForDisplay = (phone: string) => {
    let raw = phone.replace("+998", "").replace(/\D/g, "");
    if (raw.length <= 2) return raw;
    if (raw.length <= 5) return `${raw.slice(0, 2)} ${raw.slice(2)}`;
    if (raw.length <= 7) return `${raw.slice(0, 2)} ${raw.slice(2, 5)}-${raw.slice(5)}`;
    return `${raw.slice(0, 2)} ${raw.slice(2, 5)}-${raw.slice(5, 7)}-${raw.slice(7, 9)}`;
  };

  // Formatting email string for presentation
  const userPresentationEmail = user?.email && user.email.includes("@liberty-wear.uz") 
    ? "Вход выполнен по телефону" 
    : user?.email;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Address Modal */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAddressModalOpen(false); setEditingAddress(null); }}
              className="absolute inset-0 bg-brand-blue/60 backdrop-blur-md hidden sm:block"
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="relative w-full h-full sm:h-auto sm:max-w-md bg-white p-6 sm:p-8 shadow-2xl overflow-y-auto sm:overflow-hidden flex flex-col justify-between sm:justify-start rounded-none"
            >
              <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
              <div className="relative z-10 space-y-6 flex-1 flex flex-col justify-between sm:block">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold tracking-tight text-brand-blue uppercase">
                    {editingAddress ? "Изменить адрес" : "Новый адрес"}
                  </h2>
                  <button onClick={() => { setIsAddressModalOpen(false); setEditingAddress(null); }}>
                    <X className="w-5 h-5 text-brand-blue hover:rotate-90 transition-transform" strokeWidth={2} />
                  </button>
                </div>

                <form onSubmit={handleSaveAddress} className="space-y-6 sm:space-y-4 flex-1 flex flex-col justify-between sm:block">
                  <div className="space-y-4 sm:space-y-4 flex-1 flex flex-col justify-center sm:block">
                    <div className="space-y-1.5">
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Название (Дом / Работа)</p>
                      <input name="type" required defaultValue={editingAddress?.type} className="w-full bg-transparent border-b border-slate-100 py-2.5 text-xs text-brand-blue focus:border-brand-blue outline-none" />
                    </div>
                    <div className="space-y-1.5 relative">
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Регион Узбекистана</p>
                      <div className="relative">
                        <select 
                          name="region" 
                          required 
                          defaultValue={editingAddress?.region || "Ташкент"}
                          className="w-full bg-transparent border-b border-slate-100 py-2.5 pr-8 text-xs text-brand-blue focus:border-brand-blue outline-none cursor-pointer appearance-none"
                        >
                          <option value="Ташкент">Ташкент</option>
                          <option value="Ташкентская область">Ташкентская область</option>
                          <option value="Самарканд">Самарканд</option>
                          <option value="Бухара">Бухара</option>
                          <option value="Андижан">Андижан</option>
                          <option value="Фергана">Фергана</option>
                          <option value="Наманган">Наманган</option>
                          <option value="Навои">Навои</option>
                          <option value="Хорезм">Хорезм</option>
                          <option value="Кашкадарья">Кашкадарья</option>
                          <option value="Сурхандарья">Сурхандарья</option>
                          <option value="Джизак">Джизак</option>
                          <option value="Сырдарья">Сырдарья</option>
                          <option value="Республика Каракалпакстан">Республика Каракалпакстан</option>
                        </select>
                        <div className="absolute right-0 bottom-2.5 pointer-events-none text-[8px] text-slate-400 select-none">
                          ▼
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Улица, дом</p>
                      <input name="street" required defaultValue={editingAddress?.street} className="w-full bg-transparent border-b border-slate-100 py-2.5 text-xs text-brand-blue focus:border-brand-blue outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Кв. / Офис</p>
                        <input name="flat" required defaultValue={editingAddress?.flat} className="w-full bg-transparent border-b border-slate-100 py-2.5 text-xs text-brand-blue focus:border-brand-blue outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Индекс</p>
                        <input name="zip" required defaultValue={editingAddress?.zip} className="w-full bg-transparent border-b border-slate-100 py-2.5 text-xs text-brand-blue focus:border-brand-blue outline-none" />
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full h-12 bg-brand-blue text-white uppercase text-[10px] tracking-[0.3em] font-bold mt-4 sm:mt-4 hover:bg-brand-blue/90 transition-all shrink-0 rounded-none">
                    Сохранить адрес
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {isLogoutConfirmOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogoutConfirmOpen(false)}
              className="absolute inset-0 bg-brand-blue/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white p-8 shadow-2xl border border-slate-100 overflow-hidden text-center z-10"
            >
              <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
              <div className="relative z-10 space-y-6">
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold">Подтверждение</p>
                <h3 className="text-xs font-semibold text-brand-blue leading-relaxed">
                  Вы уверены, что хотите выйти из аккаунта?
                </h3>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <button 
                    onClick={() => { setIsLogoutConfirmOpen(false); handleLogout(); }}
                    className="h-11 bg-brand-blue text-white text-xs font-medium hover:bg-brand-blue/90 transition-all"
                  >
                    Да, выйти
                  </button>
                  <button 
                    onClick={() => setIsLogoutConfirmOpen(false)}
                    className="h-11 border border-slate-200 text-brand-blue text-xs font-medium hover:bg-slate-50 transition-all"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Address Delete Confirmation Modal */}
      <AnimatePresence>
        {addressToDelete !== null && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddressToDelete(null)}
              className="absolute inset-0 bg-brand-blue/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white p-8 shadow-2xl border border-slate-100 overflow-hidden text-center z-10 rounded-none"
            >
              <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
              <div className="relative z-10 space-y-6">
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold">Удаление адреса</p>
                <h3 className="text-xs font-semibold text-brand-blue leading-relaxed">
                  Вы уверены, что хотите удалить этот адрес?
                </h3>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <button 
                    onClick={async () => {
                      if (addressToDelete !== null) {
                        await handleDeleteAddress(addressToDelete);
                        setAddressToDelete(null);
                      }
                    }}
                    className="h-11 bg-red-500 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-600 transition-all rounded-none"
                  >
                    Удалить
                  </button>
                  <button 
                    onClick={() => setAddressToDelete(null)}
                    className="h-11 border border-slate-200 text-brand-blue text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all rounded-none"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Right Drawer: Payment Selector */}
      <AnimatePresence>
        {activePaymentOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePaymentOrder(null)}
              className="fixed inset-0 bg-brand-blue/40 backdrop-blur-sm z-[130] cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-full sm:max-w-sm bg-white z-[140] shadow-2xl flex flex-col border-l border-slate-100 rounded-none font-sans"
            >
              <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full animate-pulse" />
                    <h2 className="text-[11px] font-black uppercase tracking-wider text-brand-blue">Оплата заказа {activePaymentOrder.id}</h2>
                  </div>
                  <button onClick={() => setActivePaymentOrder(null)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer border border-transparent rounded-none">
                    <X className="w-4 h-4 text-brand-blue" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-5 space-y-6">
                  
                  {/* Order summary info */}
                  <div className="bg-slate-50 border border-slate-100 p-4 space-y-2 rounded-none">
                    <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Сумма к оплате</p>
                    <p className="text-xl font-black text-brand-blue">{activePaymentOrder.total}</p>
                    <p className="text-[9px] text-slate-400">Текущий способ: <span className="font-bold text-brand-blue">{activePaymentOrder.method || "Не указан"}</span></p>
                  </div>

                  {/* Payment Methods Section */}
                  <div className="space-y-3">
                    <p className="text-[9px] uppercase tracking-widest text-slate-400 font-black">Выберите способ оплаты</p>
                    
                    <div className="space-y-2">
                      
                      {/* Method 1: CLICK */}
                      <button
                        onClick={() => handleSelectNewPaymentMethod("click")}
                        className="w-full text-left p-4 border border-slate-200 hover:border-brand-blue active:scale-[0.98] transition-all bg-white flex items-center justify-between rounded-none group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center shrink-0 border border-slate-100 bg-white p-1">
                            <img 
                              src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Click_uz_logo.png" 
                              alt="CLICK" 
                              className="w-full h-full object-contain" 
                            />
                          </div>
                          <div>
                            <p className="text-[11px] font-extrabold text-brand-blue uppercase tracking-wider group-hover:text-brand-blue transition-colors">CLICK Онлайн</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">Оплата картами Uzcard/Humo/Visa</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-blue transition-all" />
                      </button>

                      {/* Method 2: Payme */}
                      <button
                        onClick={() => handleSelectNewPaymentMethod("payme")}
                        className="w-full text-left p-4 border border-slate-200 hover:border-brand-blue active:scale-[0.98] transition-all bg-white flex items-center justify-between rounded-none group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center shrink-0 border border-slate-100 bg-white p-1">
                            <img 
                              src="https://cdn.payme.uz/logo/payme_color.svg" 
                              alt="Payme" 
                              className="w-full h-full object-contain" 
                            />
                          </div>
                          <div>
                            <p className="text-[11px] font-extrabold text-brand-blue uppercase tracking-wider group-hover:text-brand-blue transition-colors">Payme Онлайн</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">Быстрая оплата через приложение</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-blue transition-all" />
                      </button>

                      {/* Method 3: COD / Cash */}
                      <button
                        onClick={() => handleSelectNewPaymentMethod("cod")}
                        className="w-full text-left p-4 border border-slate-200 hover:border-brand-blue active:scale-[0.98] transition-all bg-white flex items-center justify-between rounded-none group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center shrink-0 border border-slate-100 bg-[#f8fafc] font-black text-brand-blue text-[9px] uppercase tracking-tighter">
                            <span>UZS</span>
                          </div>
                          <div>
                            <p className="text-[11px] font-extrabold text-brand-blue uppercase tracking-wider group-hover:text-brand-blue transition-colors">При получении (Наличные)</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">Оплата курьеру при доставке заказа</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-blue transition-all" />
                      </button>

                    </div>
                  </div>
                  
                </div>

                {/* Footer with support */}
                <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                  <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black">Служба поддержки</span>
                  <a href="tel:+998991234567" className="text-[9px] text-brand-blue font-extrabold uppercase tracking-wider hover:underline">+998 (99) 123-45-67</a>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Order Details Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-brand-blue/40 backdrop-blur-sm z-[110] cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[120] shadow-2xl flex flex-col border-l border-slate-100"
            >
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-brand-blue" />
                  <h2 className="text-[12px] font-black uppercase tracking-wider text-brand-blue">Детали заказа {selectedOrder.id}</h2>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <X className="w-4 h-4 text-brand-blue" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
                <div className="space-y-3">
                   <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Товары</h3>
                   <div className="space-y-2">
                     {(selectedOrder.items_list || []).map((item: any, idx: number) => (
                       <div key={idx} className="flex gap-3 items-center border border-slate-100 rounded-xl p-3 bg-white hover:border-brand-blue/30 transition-all">
                          <div className="w-10 h-13 bg-slate-50 shrink-0 relative overflow-hidden flex items-center justify-center rounded-lg border border-slate-100/50">
                             {item.image_url ? (
                               <Image 
                                 src={item.image_url} 
                                 alt={item.name} 
                                 fill 
                                 className="object-cover"
                                 unoptimized
                               />
                             ) : (
                               <div className="text-[8px] font-black tracking-widest text-brand-blue/30 select-none">LW</div>
                             )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-0.5">
                             <p className="text-[11px] font-extrabold text-brand-blue truncate">{item.name}</p>
                             <p className="text-[9px] text-slate-400 font-medium">
                               {item.quantity} шт. • {item.size || "M"} • {item.color || "Темно-синий"}
                             </p>
                          </div>
                          <p className="text-[11px] font-black text-brand-blue shrink-0">{item.price}</p>
                       </div>
                     ))}
                   </div>
                </div>

                <div className="space-y-3">
                   <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Информация о доставке</h3>
                   <div className="bg-[#f8fafc] border border-[#e3e8ee] rounded-xl p-4 space-y-2.5">
                       <div className="flex justify-between items-center text-[10px] uppercase tracking-wider">
                          <span className="text-slate-400 font-bold">Статус</span>
                          <span className={`font-black px-2 py-0.5 border text-[9px] rounded-none ${
                            selectedOrder.status === 'Оплачен' || selectedOrder.status === 'Доставлено'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : selectedOrder.status === 'Отправлен'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : selectedOrder.status === 'Отменен'
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : 'bg-amber-50 border-amber-200 text-amber-700' // 'В ожидании'
                          }`}>{selectedOrder.status}</span>
                       </div>
                      <div className="flex justify-between items-center text-[10px] uppercase tracking-wider">
                         <span className="text-slate-400 font-medium">Способ</span>
                         <span className="text-brand-blue font-extrabold">{selectedOrder.method || "Курьерская доставка"}</span>
                      </div>
                      <div className="flex justify-between items-start text-[10px] uppercase tracking-wider gap-4">
                         <span className="text-slate-400 font-medium shrink-0">Адрес</span>
                         <span className="text-brand-blue font-bold text-right normal-case line-clamp-2">{selectedOrder.address || "Адрес не указан"}</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-slate-100 bg-white space-y-3">
                 <div className="flex justify-between items-end">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Итого к оплате</span>
                    <span className="text-lg font-black text-brand-blue uppercase tracking-tighter">{selectedOrder.total}</span>
                 </div>
                 <button 
                   disabled={repeatingId === selectedOrder.id}
                   onClick={() => handleRepeatOrder(selectedOrder)}
                   className="w-full h-11 bg-brand-blue text-white uppercase text-[9px] tracking-widest font-black rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-brand-blue/10 flex items-center justify-center gap-2"
                 >
                   {repeatingId === selectedOrder.id ? "Добавление..." : "Повторить заказ"}
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <main className="pt-28 pb-12 relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="space-y-6">
            {/* Header Area: Profile Info */}
            <motion.div 
              {...fadeInUp}
              className="flex flex-row items-center justify-between gap-6 pb-4 border-b border-slate-100 max-w-4xl mx-auto w-full"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <User className="w-8 h-8 sm:w-10 sm:h-10 text-brand-blue" strokeWidth={1} />
                </div>
                <div className="space-y-1.5">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tighter text-brand-blue uppercase leading-none">
                    {user?.full_name || "Пользователь"}
                  </h1>
                  <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest font-medium">
                    {userPresentationEmail}
                  </p>
                </div>
              </div>

              {/* Logout button placed on the right of the user name */}
              <button 
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="p-3 sm:px-5 sm:py-2.5 border border-red-100 hover:border-red-600 text-red-400 hover:text-red-600 transition-all shrink-0 flex items-center justify-center gap-2"
                title="Выйти из аккаунта"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={2} />
                <span className="hidden sm:inline text-[9px] font-bold uppercase tracking-[0.2em]">Выйти</span>
              </button>
            </motion.div>

            {/* Navigation Horizontal Tabs */}
            <div className="border-b border-slate-100 max-w-4xl mx-auto w-full overflow-x-auto no-scrollbar">
              <div className="flex gap-4 sm:gap-8 md:gap-12 pb-0 min-w-max">
                {[
                  { icon: Package, label: "Мои заказы", id: "orders" },
                  { icon: MapPin, label: "Адреса доставки", id: "addresses" },
                  { icon: User, label: "Личные данные", id: "profile" },
                ].map((item, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveTab(item.id)}
                    className={`pb-2.5 sm:pb-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 sm:gap-2.5 transition-all relative ${
                      activeTab === item.id 
                      ? 'text-brand-blue border-b-2 border-brand-blue' 
                      : 'text-slate-400 hover:text-brand-blue border-b-2 border-transparent'
                    }`}
                  >
                    <item.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Warning Alert Banner for incomplete profile */}
            {(!user?.phone || addresses.length === 0) && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto w-full border border-slate-200 bg-slate-50 py-3 px-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                  <p className="text-[9px] uppercase tracking-[0.2em] text-brand-blue leading-relaxed font-bold">
                    Требуется заполнить: {!user?.phone && "номер телефона"}{!user?.phone && addresses.length === 0 && " и "}{addresses.length === 0 && "адрес доставки"}
                  </p>
                </div>
                <div className="flex gap-6">
                  {!user?.phone && (
                    <button 
                      onClick={() => setActiveTab("profile")} 
                      className="text-[8px] font-bold uppercase tracking-[0.2em] text-brand-blue border-b border-brand-blue pb-0.5 hover:text-slate-400 transition-colors"
                    >
                      Заполнить телефон
                    </button>
                  )}
                  {addresses.length === 0 && (
                    <button 
                      onClick={() => setActiveTab("addresses")} 
                      className="text-[8px] font-bold uppercase tracking-[0.2em] text-brand-blue border-b border-brand-blue pb-0.5 hover:text-slate-400 transition-colors"
                    >
                      Добавить адрес
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Main Content */}
            <div className="max-w-4xl mx-auto w-full">
              <AnimatePresence mode="wait">
                {activeTab === "orders" && (
                  <motion.div 
                    key="orders"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                      <h2 className="text-xl font-bold tracking-tight text-brand-blue uppercase">История заказов</h2>
                      <span className="text-[9px] text-slate-400 uppercase tracking-[0.3em]">Всего: {orders.length}</span>
                    </div>

                    <div className="space-y-6">
                      {orders.map((order, i) => (
                        <div key={i} className="group border border-slate-200 bg-white hover:border-brand-blue transition-all relative overflow-hidden">
                          {/* Pattern Overlay for Card */}
                          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
                          
                          {/* Architectural Decor */}
                          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-blue/30" />
                          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-blue/30" />

                          <div className="p-4 sm:p-6 relative z-10">
                            <div className="flex justify-between items-center mb-4 sm:mb-6">
                               <div className="flex items-center gap-2 sm:gap-4">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 flex items-center justify-center border border-slate-100">
                                     <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-blue" />
                                  </div>
                                  <div>
                                     <p className="text-[8px] sm:text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">Заказ</p>
                                     <p className="text-xs sm:text-sm font-bold text-brand-blue">{order.id}</p>
                                  </div>
                               </div>
                               <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2 py-1 sm:px-4 sm:py-1.5 border rounded-none ${
                                 order.status === 'Оплачен' || order.status === 'Доставлено' || order.status === 'Paid' || order.status === 'Доставлен' || order.status === 'Delivered'
                                 ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                 : order.status === 'Отправлен' || order.status === 'Shipped' || order.status === 'Доставляется' || order.status === 'Created' || order.status === 'Заказ создан'
                                 ? 'bg-blue-50 border-blue-200 text-blue-700'
                                 : order.status === 'Отменен' || order.status === 'Cancelled'
                                 ? 'bg-rose-50 border-rose-200 text-rose-700'
                                 : 'bg-amber-50 border-amber-200 text-amber-700' // 'В ожидании'
                               }`}>
                                 {order.status === 'Pending' || order.status === 'В ожидании' || order.status === 'Ожидает оплаты' || order.status === 'Ожидает оплату' ? 'Ожидает оплаты' : (order.status === 'Created' || order.status === 'Заказ создан' ? 'Заказ создан' : (order.status === 'Shipped' || order.status === 'Доставляется' ? 'Доставляется' : (order.status === 'Delivered' || order.status === 'Доставлен' ? 'Доставлен' : (order.status === 'Paid' || order.status === 'Оплачен' ? 'Оплачен' : (order.status === 'Cancelled' || order.status === 'Отменен' ? 'Отменен' : order.status)))))}
                               </span>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-x-12">
                              <div className="space-y-1 sm:space-y-2 col-span-1">
                                <p className="text-[8px] sm:text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">Дата</p>
                                <p className="text-[11px] sm:text-xs text-brand-blue font-medium">{order.date}</p>
                              </div>
                              <div className="space-y-1 sm:space-y-2 col-span-1 text-right sm:text-left lg:text-right">
                                <p className="text-[8px] sm:text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">Итого</p>
                                <p className="text-[11px] sm:text-xs sm:text-sm font-bold text-brand-blue uppercase">{order.total}</p>
                              </div>
                              <div className="space-y-1 sm:space-y-2 col-span-2 lg:col-span-2">
                                <p className="text-[8px] sm:text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">Состав заказа</p>
                                <p className="text-[11px] sm:text-xs text-slate-600 font-semibold leading-relaxed line-clamp-1">
                                  {order.items.join(" • ")}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 flex justify-between items-center">
                              {/* Amber Pay Button if unpaid */}
                              {(order.status === 'Pending' || order.status === 'В ожидании' || order.status === 'Ожидает оплаты' || order.status === 'Ожидает оплату') ? (
                                <button
                                  onClick={() => setActivePaymentOrder(order)}
                                  className="px-5 py-2 bg-[#f59e0b] hover:bg-[#d97706] active:scale-[0.98] text-white text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer rounded-none border-none flex items-center gap-2"
                                >
                                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                  <span>Оплатить</span>
                                </button>
                              ) : (
                                <div />
                              )}
                              
                              <button 
                                onClick={() => setSelectedOrder(order)}
                                className="text-[9px] font-bold uppercase tracking-[0.05em] text-brand-blue flex items-center gap-3 group/btn"
                              >
                                <span>Смотреть детали</span>
                                <div className="w-6 h-6 border border-brand-blue/20 flex items-center justify-center group-hover/btn:bg-brand-blue group-hover/btn:text-white transition-all">
                                  <ArrowRight className="w-3 h-3" />
                                </div>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 && (
                        <div className="py-16 text-center border border-dashed border-slate-200 bg-white">
                          <Package className="w-8 h-8 text-brand-blue/30 mx-auto mb-4" strokeWidth={1} />
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Список заказов пуст</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "addresses" && (
                  <motion.div 
                    key="addresses"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                      <h2 className="text-xl font-bold tracking-tight text-brand-blue uppercase">Адреса доставки</h2>
                      <button 
                        onClick={() => { setEditingAddress(null); setIsAddressModalOpen(true); }}
                        className="text-[10px] font-bold uppercase tracking-widest text-brand-blue border-b border-brand-blue pb-1"
                      >
                        + Добавить
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {addresses.map((addr) => (
                         <div key={addr.id} className="border border-slate-200 p-6 space-y-4 hover:border-brand-blue transition-colors relative">
                            <div className="flex justify-between items-start">
                               <h3 className="text-[10px] font-bold uppercase tracking-wide text-brand-blue">{addr.type}</h3>
                               <MapPin className="w-4 h-4 text-brand-blue" />
                            </div>
                             <div className="space-y-2 pt-1 text-xs">
                                {addr.region && (
                                  <div className="flex gap-2">
                                    <span className="text-[9px] text-slate-400 uppercase tracking-wide font-bold w-20 shrink-0">Регион:</span>
                                    <span className="text-brand-blue font-medium">{addr.region}</span>
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <span className="text-[9px] text-slate-400 uppercase tracking-wide font-bold w-20 shrink-0">Улица, дом:</span>
                                  <span className="text-brand-blue font-medium">{addr.street}</span>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-[9px] text-slate-400 uppercase tracking-wide font-bold w-20 shrink-0">Кв. / Офис:</span>
                                  <span className="text-brand-blue font-medium">{addr.flat}</span>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-[9px] text-slate-400 uppercase tracking-wide font-bold w-20 shrink-0">Индекс:</span>
                                  <span className="text-brand-blue font-medium">{addr.zip}</span>
                                </div>
                             </div>
                            <div className="flex gap-4 pt-4">
                               <button 
                                onClick={() => { setEditingAddress(addr); setIsAddressModalOpen(true); }}
                                className="text-[9px] font-bold uppercase tracking-widest text-brand-blue hover:text-slate-400 transition-colors"
                               >
                                Изменить
                               </button>
                               <button 
                                onClick={() => setAddressToDelete(addr.id)}
                                className="text-[9px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                               >
                                Удалить
                               </button>
                            </div>
                         </div>
                       ))}
                       {addresses.length === 0 && (
                         <div className="col-span-full py-12 text-center border border-dashed border-slate-200">
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Список адресов пуст</p>
                         </div>
                       )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "profile" && (
                  <motion.div 
                    key="profile"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div className="border-b border-slate-100 pb-4">
                      <h2 className="text-xl font-bold tracking-tight text-brand-blue uppercase">Личные данные</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <form onSubmit={handleSaveChanges} className="space-y-6 w-full">
                          <div className="space-y-2">
                             <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Имя и Фамилия</p>
                             <input 
                               type="text" 
                               value={fullNameInput} 
                               onChange={(e) => setFullNameInput(e.target.value)}
                               className="w-full bg-transparent border-b border-slate-100 py-3 text-xs text-brand-blue focus:border-brand-blue outline-none font-medium" 
                             />
                          </div>
                          <div className="space-y-2">
                             <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Телефон</p>
                              <div className="flex items-center gap-2 border-b border-slate-100 py-2.5">
                                 <span className="text-xs text-brand-blue font-bold select-none pb-0.5">
                                    +998
                                 </span>
                                 <input 
                                   type="text" 
                                   placeholder="90 123-45-67"
                                   value={formatPhoneForDisplay(phoneInput)} 
                                   onChange={(e) => {
                                     const digits = e.target.value.replace(/\D/g, ""); // Keep only digits
                                     if (digits.length <= 9) {
                                       setPhoneInput("+998" + digits);
                                     }
                                   }}
                                   className="w-full bg-transparent text-xs text-brand-blue outline-none font-medium" 
                                 />
                              </div>
                          </div>

                          {saveError && (
                            <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{saveError}</p>
                          )}
                          
                          {saveSuccess && (
                            <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Изменения успешно сохранены</p>
                          )}

                          <button 
                            type="submit" 
                            disabled={saveLoading}
                            className="h-14 px-12 bg-brand-blue text-white uppercase text-[10px] tracking-widest font-bold disabled:opacity-50 hover:bg-brand-blue/90 transition-all"
                          >
                            {saveLoading ? "Сохранение..." : "Сохранить изменения"}
                          </button>
                       </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Helper icons
function ArrowRight(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
