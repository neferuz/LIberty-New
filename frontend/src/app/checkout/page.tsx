"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/common/Button";
import { MapPin, User, Phone, Mail, ShoppingBag, CheckCircle2, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const UZBEKISTAN_REGIONS = [
  "Ташкент",
  "Ташкентская область",
  "Самаркандская область",
  "Бухарская область",
  "Андижанская область",
  "Ферганская область",
  "Наманганская область",
  "Кашкадарьинская область",
  "Сурхандарьинская область",
  "Навоийская область",
  "Джизакская область",
  "Сырдарьинская область",
  "Хорезмская область",
  "Республика Каракалпакстан"
];

const formatUzPhone = (value: string): string => {
  if (!value) return "+998";
  const digits = value.replace(/\D/g, "");
  let suffix = digits;
  if (suffix.startsWith("998")) {
    suffix = suffix.substring(3);
  }
  const part1 = suffix.substring(0, 2);
  const part2 = suffix.substring(2, 5);
  const part3 = suffix.substring(5, 7);
  const part4 = suffix.substring(7, 9);
  
  let formatted = "+998";
  if (part1) formatted += " " + part1;
  if (part2) formatted += " " + part2;
  if (part3) formatted += " " + part3;
  if (part4) formatted += " " + part4;
  return formatted;
};

export default function CheckoutPage() {
  const { items, total, removeItem } = useCart();
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isOrderSummaryExpanded, setIsOrderSummaryExpanded] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    if (inputVal.length < 4) {
      setPhone("+998");
      return;
    }
    setPhone(formatUzPhone(inputVal));
  };
  
  // Authentication & User State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+998");
  
  // Custom/New Address Form State
  const [region, setRegion] = useState("");
  const [street, setStreet] = useState("");
  const [flat, setFlat] = useState("");
  const [zip, setZip] = useState("");
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  
  // Success Order State
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdDealId, setCreatedDealId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Fix hydration issues by only rendering client-side content after mount
  useEffect(() => {
    setIsClient(true);
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
      return;
    }
    
    setProfileLoading(true);
    try {
      const res = await fetch("/api/v1/users/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setIsLoggedIn(true);
        setFullName(data.full_name || "");
        setEmail(data.email || "");
        setPhone(formatUzPhone(data.phone || "+998"));
        
        if (data.addresses_json) {
          try {
            const parsed = JSON.parse(data.addresses_json);
            setSavedAddresses(parsed);
            if (parsed.length > 0) {
              setSelectedAddressId(parsed[0].id);
              setUseCustomAddress(false);
            } else {
              setUseCustomAddress(true);
            }
          } catch (e) {
            console.error("Error parsing addresses:", e);
            setUseCustomAddress(true);
          }
        } else {
          setUseCustomAddress(true);
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setIsLoggedIn(false);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    if (!fullName || !email || !phone) {
      setErrorMsg("Пожалуйста, заполните основные контактные данные.");
      return;
    }

    // Prepare address detail
    let shippingAddress = "";
    if (isLoggedIn && !useCustomAddress && selectedAddressId) {
      const activeAddr = savedAddresses.find(a => a.id === selectedAddressId);
      if (activeAddr) {
        shippingAddress = `${activeAddr.type || 'Адрес'}: Узбекистан, ${activeAddr.region || ''}, ${activeAddr.street || ''}, кв. ${activeAddr.flat || ''}, ${activeAddr.zip || ''}`;
      }
    } else {
      if (!region || !street) {
        setErrorMsg("Пожалуйста, укажите город/регион и улицу доставки.");
        return;
      }
      shippingAddress = `Новый адрес: Узбекистан, ${region}, ${street}, кв. ${flat || '—'}, ${zip || '—'}`;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      // Parse items to backend format
      const formattedItems = items.map(item => {
        const priceNum = parseInt(item.price.replace(/[^\d]/g, "")) || 0;
        return {
          product_id: item.id,
          quantity: item.quantity,
          price: priceNum
        };
      });

      const orderPayload = {
        user_id: user ? user.id : null,
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: shippingAddress || "Самовывоз",
        items: formattedItems,
      };

      const res = await fetch("/api/v1/orders/create-deal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedDealId(data.deal_id);
        setOrderSuccess(true);
        // Clear cart
        items.forEach(item => removeItem(item.id));
      } else {
        const errData = await res.json();
        setErrorMsg(errData.detail || "Не удалось оформить заказ. Попробуйте еще раз.");
      }
    } catch (err) {
      console.error("Order creation failed:", err);
      setErrorMsg("Ошибка соединения с сервером. Пожалуйста, проверьте интернет.");
    } finally {
      setLoading(false);
    }
  };

  // Render Loading Placeholder
  if (!isClient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-blue" />
      </div>
    );
  }

  // Render Success Page
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between font-sans">
        <Header />
        <main className="flex-grow pt-32 pb-24 px-6 flex items-center justify-center">
          <div className="max-w-md w-full text-center py-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100/50"
            >
              <CheckCircle2 className="w-8 h-8" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
              className="text-xl md:text-2xl font-black uppercase tracking-normal text-brand-blue mb-4 leading-none"
            >
              Заказ оформлен
            </motion.h1>
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 32 }}
              transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
              className="h-[2px] bg-brand-blue mx-auto mb-6" 
            />
            
            <motion.p 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }}
              className="text-[14px] text-slate-600 mb-2 leading-relaxed"
            >
              Благодарим за выбор <span className="font-bold text-brand-blue">Liberty Wear</span>!
            </motion.p>
            
            <motion.p 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5, ease: "easeOut" }}
              className="text-[14px] text-slate-600 mb-5"
            >
              Номер вашего заказа: <span className="font-extrabold text-brand-blue">#{createdDealId}</span>
            </motion.p>
            
            <motion.p 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5, ease: "easeOut" }}
              className="text-[12px] text-slate-400 leading-relaxed mb-8 max-w-sm mx-auto"
            >
              Наш менеджер свяжется с вами в ближайшее время для подтверждения деталей. 
              Если у вас возникли вопросы, вы можете перейти в раздел{" "}
              <Link href="/contact" className="text-brand-blue underline font-bold hover:text-brand-blue/80 transition-colors">
                Контакты
              </Link>.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.6, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-xs mx-auto"
            >
              <Link href="/shop" className="w-full">
                <button className="w-full h-11 bg-brand-blue text-white font-bold text-[10px] uppercase tracking-widest hover:bg-brand-blue/90 active:scale-95 transition-all rounded-none cursor-pointer">
                  В магазин
                </button>
              </Link>
              <Link href="/contact" className="w-full">
                <button className="w-full h-11 border border-brand-blue/20 text-brand-blue font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all rounded-none cursor-pointer">
                  Контакты
                </button>
              </Link>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between font-sans">
      <Header />
      
      <main className="flex-grow pt-20 md:pt-24 pb-16 relative z-10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          
          {items.length === 0 ? (
            <div className="text-center py-16 max-w-sm mx-auto">
              <div className="w-12 h-12 bg-slate-50 flex items-center justify-center border border-slate-100 mx-auto mb-4">
                <ShoppingBag className="w-5 h-5 text-slate-300" strokeWidth={1} />
              </div>
              <h2 className="text-xs font-bold text-brand-blue mb-1">Ваша корзина пуста</h2>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-6">
                Добавьте хотя бы один товар в корзину, чтобы перейти к оформлению покупки.
              </p>
              <Link href="/shop">
                <button className="px-6 h-10 bg-brand-blue text-white text-[10px] font-bold uppercase tracking-wider active:scale-95 transition-all">
                  Перейти в каталог
                </button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
              
              {/* Left Column: Form & Address Details */}
              <div className="lg:col-span-7 space-y-4 md:space-y-6">
                
                {/* Mobile-only Collapsible Order Summary Card */}
                <div className="lg:hidden bg-slate-50 p-4 border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-brand-blue tracking-normal">Ваш заказ ({items.length})</span>
                    <button 
                      type="button"
                      onClick={() => setIsOrderSummaryExpanded(!isOrderSummaryExpanded)}
                      className="text-[9px] font-bold uppercase tracking-wider text-brand-blue flex items-center gap-1"
                    >
                      {isOrderSummaryExpanded ? "Скрыть товары" : "Показать товары"}
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isOrderSummaryExpanded ? "rotate-90" : ""}`} />
                    </button>
                  </div>
                  
                  {isOrderSummaryExpanded && (
                    <div className="space-y-3 pt-3 border-t border-slate-100 max-h-[240px] overflow-y-auto pr-1">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="relative w-10 aspect-[3/4] bg-slate-100 overflow-hidden flex-shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          
                          <div className="flex-grow flex flex-col justify-between py-0.5 min-w-0">
                            <div>
                              <h4 className="text-[10px] font-medium text-brand-blue leading-snug truncate">{item.name}</h4>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                                <span className="text-[8px] uppercase tracking-widest text-slate-400">{item.category}</span>
                                {item.size && (
                                  <span className="text-[8px] text-slate-400 font-medium">/ {item.size}</span>
                                )}
                                {item.color && (
                                  <span className="text-[8px] text-brand-blue font-medium">/ {item.color}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-[9px] mt-1">
                              <span className="text-slate-400">Кол-во: <span className="font-bold text-brand-blue">{item.quantity}</span></span>
                              <span className="font-bold text-brand-blue">{item.price}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 text-[10px]">
                    <span className="text-slate-400 uppercase tracking-widest font-bold">Итого к оплате:</span>
                    <span className="font-bold text-brand-blue text-sm">{total.toLocaleString()} сум</span>
                  </div>
                </div>

                <div>
                  <h1 className="text-lg md:text-xl font-bold text-brand-blue mb-1 tracking-normal">Оформление заказа</h1>
                  <p className="text-[10px] text-slate-400">Пожалуйста, укажите контактную информацию и адрес доставки</p>
                </div>

                {/* Authentication Status Alert / Callout */}
                {!isLoggedIn ? (
                  <div className="bg-slate-50 border border-slate-100 p-5 text-left flex gap-4 items-start">
                    <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-brand-blue">Оформление как гость</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-1 mb-4">
                        Вы можете продолжить оформление без входа, но авторизованные пользователи могут использовать свои сохраненные адреса и просматривать историю заказов.
                      </p>
                      <Link href={`/auth?redirect=/checkout`}>
                        <button type="button" className="h-8 px-4 bg-brand-blue text-white text-[9px] font-bold uppercase tracking-widest hover:bg-brand-blue/90 active:scale-95 transition-all">
                          Войти в аккаунт
                        </button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="bg-brand-blue/5 p-4 flex justify-between items-center border border-brand-blue/10">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-brand-blue flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Вы вошли как {user?.full_name || user?.email}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user_email");
                        setIsLoggedIn(false);
                        setUser(null);
                        setSavedAddresses([]);
                      }}
                      className="text-[9px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                    >
                      Выйти
                    </button>
                  </div>
                )}

                {/* Contact Information Fields */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-blue border-b border-slate-100 pb-1.5">Контактные данные</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Имя и фамилия *</label>
                      <input 
                        type="text" 
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Иван Иванов"
                        className="w-full h-10 px-3 border border-slate-200 text-xs text-brand-blue font-medium focus:outline-none focus:border-brand-blue transition-all bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Номер телефона *</label>
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="+998 90 123 45 67"
                        className="w-full h-10 px-3 border border-slate-200 text-xs text-brand-blue font-medium focus:outline-none focus:border-brand-blue transition-all bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Email-адрес *</label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@mail.com"
                        className="w-full h-10 px-3 border border-slate-200 text-xs text-brand-blue font-medium focus:outline-none focus:border-brand-blue transition-all bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Addresses Section */}
                <div className="space-y-3 pt-1">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-blue border-b border-slate-100 pb-1.5">Адрес доставки</h3>

                  {/* Saved Addresses (Only if logged in and has addresses) */}
                  {isLoggedIn && savedAddresses.length > 0 && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedAddresses.map((addr) => (
                          <div 
                            key={addr.id}
                            onClick={() => {
                              setSelectedAddressId(addr.id);
                              setUseCustomAddress(false);
                            }}
                            className={`border p-4 space-y-2 cursor-pointer transition-all relative ${
                              selectedAddressId === addr.id && !useCustomAddress
                                ? "border-brand-blue bg-brand-blue/[0.02]"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-brand-blue">{addr.type}</span>
                              <input 
                                type="radio" 
                                checked={selectedAddressId === addr.id && !useCustomAddress}
                                onChange={() => {}} // Click handles it
                                className="accent-brand-blue w-3.5 h-3.5"
                              />
                            </div>
                            
                            <div className="space-y-1 pt-1 text-[11px] text-slate-600">
                              <p><span className="text-[9px] text-slate-400 font-bold uppercase">Регион:</span> {addr.region}</p>
                              <p><span className="text-[9px] text-slate-400 font-bold uppercase">Адрес:</span> {addr.street}</p>
                              {addr.flat && <p><span className="text-[9px] text-slate-400 font-bold uppercase">Кв. / Офис:</span> {addr.flat}</p>}
                              {addr.zip && <p><span className="text-[9px] text-slate-400 font-bold uppercase">Индекс:</span> {addr.zip}</p>}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2">
                        <button 
                          type="button"
                          onClick={() => setUseCustomAddress(true)}
                          className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${
                            useCustomAddress ? "text-brand-blue underline" : "text-slate-400 hover:text-brand-blue"
                          }`}
                        >
                          + Использовать другой адрес
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Manual Address Input Form (If guest or wants customization) */}
                  {(!isLoggedIn || savedAddresses.length === 0 || useCustomAddress) && (
                    <div className="space-y-3 bg-slate-50/50 p-3.5 border border-slate-100">
                      {isLoggedIn && savedAddresses.length > 0 && (
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-100 mb-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Новый адрес доставки</span>
                          <button 
                            type="button" 
                            onClick={() => {
                              setUseCustomAddress(false);
                              if (savedAddresses.length > 0) setSelectedAddressId(savedAddresses[0].id);
                            }}
                            className="text-[9px] font-bold uppercase tracking-wider text-brand-blue"
                          >
                            Вернуться к сохраненным
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Город / Регион *</label>
                          <div className="relative w-full">
                            <select 
                              required={!isLoggedIn || savedAddresses.length === 0 || useCustomAddress}
                              value={region}
                              onChange={(e) => setRegion(e.target.value)}
                              className="w-full h-10 pl-3 pr-10 border border-slate-200 text-xs text-brand-blue font-medium focus:outline-none focus:border-brand-blue transition-all bg-white cursor-pointer appearance-none rounded-none"
                            >
                              <option value="">Выберите регион</option>
                              {UZBEKISTAN_REGIONS.map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-blue/50 flex items-center">
                              <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Почтовый индекс</label>
                          <input 
                            type="text" 
                            value={zip}
                            onChange={(e) => setZip(e.target.value)}
                            placeholder="100000"
                            className="w-full h-10 px-3 border border-slate-200 text-xs text-brand-blue font-medium focus:outline-none focus:border-brand-blue transition-all bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Улица, дом *</label>
                          <input 
                            type="text" 
                            required={!isLoggedIn || savedAddresses.length === 0 || useCustomAddress}
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            placeholder="ул. Амира Темура, д. 45"
                            className="w-full h-10 px-3 border border-slate-200 text-xs text-brand-blue font-medium focus:outline-none focus:border-brand-blue transition-all bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Квартира / Офис</label>
                          <input 
                            type="text" 
                            value={flat}
                            onChange={(e) => setFlat(e.target.value)}
                            placeholder="кв. 12"
                            className="w-full h-10 px-3 border border-slate-200 text-xs text-brand-blue font-medium focus:outline-none focus:border-brand-blue transition-all bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {errorMsg && (
                  <div className="text-red-500 text-[10px] font-bold uppercase tracking-wider bg-red-50 border border-red-100 p-4">
                    {errorMsg}
                  </div>
                )}
              </div>

              {/* Right Column: Checkout Sidebar (Products list & Price Totals) */}
              <div className="lg:col-span-5 bg-slate-50/50 p-5 border border-slate-100 space-y-4">
                <div>
                  <h3 className="hidden lg:block text-xs font-bold text-brand-blue border-b border-slate-100 pb-3 mb-4 tracking-normal">
                    Ваш заказ ({items.length})
                  </h3>
                  
                  {/* Compact Product List */}
                  <div className="hidden lg:block space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-12 aspect-[3/4] bg-slate-100 overflow-hidden flex-shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        
                        <div className="flex-grow flex flex-col justify-between py-0.5 min-w-0">
                          <div>
                            <h4 className="text-[10px] font-medium text-brand-blue leading-snug truncate">{item.name}</h4>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                              <span className="text-[8px] uppercase tracking-widest text-slate-400">{item.category}</span>
                              {item.size && (
                                <span className="text-[8px] text-slate-400 font-medium">/ РАЗМЕР: {item.size}</span>
                              )}
                              {item.color && (
                                <span className="text-[8px] text-brand-blue font-medium">/ ЦВЕТ: {item.color}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-400">Кол-во: <span className="font-bold text-brand-blue">{item.quantity}</span></span>
                            <span className="font-bold text-brand-blue">{item.price}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subtotals & Total Summary */}
                <div className="border-t border-slate-100 pt-3 space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="uppercase tracking-widest text-slate-400">Стоимость товаров</span>
                    <span className="font-bold text-brand-blue">{total.toLocaleString()} сум</span>
                  </div>
                  <div className="flex justify-between text-[10px] items-center">
                    <span className="uppercase tracking-widest text-slate-400">Доставка</span>
                    <Link href="/delivery" target="_blank" className="text-[10px] font-bold text-brand-blue hover:text-brand-blue/80 underline">
                      Условия доставки
                    </Link>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">Итого к оплате</span>
                    <span className="text-base font-bold text-brand-blue uppercase tracking-tighter">
                      {total.toLocaleString()} сум
                    </span>
                  </div>
                </div>

                {/* Delivery Information Note */}
                <div className="bg-slate-50 border border-slate-100/50 p-3 text-[10px] text-slate-500 leading-relaxed space-y-1">
                  <p className="font-bold text-brand-blue flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-brand-blue" />
                    О доставке
                  </p>
                  <p>
                    После оформления заказа наши сотрудники свяжутся с вами для подтверждения адреса и согласования удобного времени доставки.
                  </p>
                  <p className="pt-1 text-[9px] text-slate-400">
                    Возникли вопросы? Вы можете найти номера телефонов и контакты в разделе{" "}
                    <Link href="/contact" target="_blank" className="text-brand-blue underline hover:text-brand-blue/80 font-bold">
                      Контакты
                    </Link>
                  </p>
                </div>

                {/* Checkout Submit CTA Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-brand-blue text-white flex items-center justify-center gap-2 rounded-none font-bold text-xs md:text-sm hover:bg-brand-blue/90 disabled:bg-slate-300 transition-all active:scale-[0.98] tracking-normal"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Оформление...
                    </>
                  ) : (
                    <>
                      Подтвердить заказ
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
