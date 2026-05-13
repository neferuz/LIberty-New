"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Package, MapPin, User, LogOut, ChevronRight, Clock, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const orders = [
  {
    id: "#8842",
    date: "12 Апреля, 2026",
    status: "Доставлено",
    total: "77 000 сум",
    items: ["Классическое пальто", "Шерстяная водолазка"]
  },
  {
    id: "#8721",
    date: "28 Марта, 2026",
    status: "В пути",
    total: "32 000 сум",
    items: ["Минималистичный блейзер"]
  }
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("orders");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  // Addresses State
  const [addresses, setAddresses] = useState([
    { id: 1, type: "Основной адрес", street: "г. Ташкент, ул. Ойбек, д. 14", flat: "кв. 22", zip: "100015" }
  ]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);

  useEffect(() => {
    if (selectedOrder || isAddressModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedOrder, isAddressModalOpen]);

  const handleDeleteAddress = (id: number) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newAddr = {
      id: editingAddress?.id || Date.now(),
      type: formData.get("type") as string,
      street: formData.get("street") as string,
      flat: formData.get("flat") as string,
      zip: formData.get("zip") as string,
    };

    if (editingAddress) {
      setAddresses(addresses.map(a => a.id === editingAddress.id ? newAddr : a));
    } else {
      setAddresses([...addresses, newAddr]);
    }
    setIsAddressModalOpen(false);
    setEditingAddress(null);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Address Modal */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAddressModalOpen(false); setEditingAddress(null); }}
              className="absolute inset-0 bg-brand-blue/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white p-12 shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold tracking-tight text-brand-blue uppercase">
                    {editingAddress ? "Изменить адрес" : "Новый адрес"}
                  </h2>
                  <button onClick={() => { setIsAddressModalOpen(false); setEditingAddress(null); }}>
                    <X className="w-6 h-6 text-brand-blue hover:rotate-90 transition-transform" />
                  </button>
                </div>

                <form onSubmit={handleSaveAddress} className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">Название (Дом / Работа)</p>
                    <input name="type" required defaultValue={editingAddress?.type} className="w-full bg-transparent border-b border-slate-100 py-3 text-xs uppercase tracking-widest text-brand-blue focus:border-brand-blue outline-none" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">Улица, дом</p>
                    <input name="street" required defaultValue={editingAddress?.street} className="w-full bg-transparent border-b border-slate-100 py-3 text-xs uppercase tracking-widest text-brand-blue focus:border-brand-blue outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">Кв. / Офис</p>
                      <input name="flat" required defaultValue={editingAddress?.flat} className="w-full bg-transparent border-b border-slate-100 py-3 text-xs uppercase tracking-widest text-brand-blue focus:border-brand-blue outline-none" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">Индекс</p>
                      <input name="zip" required defaultValue={editingAddress?.zip} className="w-full bg-transparent border-b border-slate-100 py-3 text-xs uppercase tracking-widest text-brand-blue focus:border-brand-blue outline-none" />
                    </div>
                  </div>
                  <button type="submit" className="w-full h-14 bg-brand-blue text-white uppercase text-[10px] tracking-[0.3em] font-bold mt-8">
                    Сохранить адрес
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
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
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[120] shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                <div className="flex items-center gap-4">
                  <Package className="w-5 h-5 text-brand-blue" />
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">Детали заказа {selectedOrder.id}</h2>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 transition-colors">
                  <X className="w-5 h-5 text-brand-blue" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-12">
                <div className="space-y-6">
                   <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Товары</h3>
                   {selectedOrder.items.map((item: string, idx: number) => (
                     <div key={idx} className="flex gap-4 items-center border-b border-slate-50 pb-4 last:border-0">
                        <div className="w-16 h-20 bg-slate-50 relative overflow-hidden">
                           <Image src="/images/prod1.jpg" alt={item} fill className="object-cover grayscale" />
                        </div>
                        <div className="flex-1">
                           <p className="text-xs font-bold text-brand-blue uppercase">{item}</p>
                           <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">1 шт. • M</p>
                        </div>
                        <p className="text-xs font-bold text-brand-blue">38 500 сум</p>
                     </div>
                   ))}
                </div>

                <div className="space-y-6">
                   <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Информация о доставке</h3>
                   <div className="bg-slate-50 p-6 space-y-4">
                      <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                         <span className="text-slate-400">Статус</span>
                         <span className="text-brand-blue font-bold">{selectedOrder.status}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                         <span className="text-slate-400">Способ</span>
                         <span className="text-brand-blue font-bold">Курьерская доставка</span>
                      </div>
                      <div className="flex justify-between items-start text-[10px] uppercase tracking-widest">
                         <span className="text-slate-400">Адрес</span>
                         <span className="text-brand-blue font-bold text-right max-w-[200px]">г. Ташкент, ул. Ойбек, д. 14, кв. 22</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 bg-white space-y-4">
                 <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Итого к оплате</span>
                    <span className="text-2xl font-bold text-brand-blue uppercase tracking-tighter">{selectedOrder.total}</span>
                 </div>
                 <button className="w-full h-14 bg-brand-blue text-white uppercase text-[10px] tracking-widest font-bold hover:bg-slate-800 transition-colors">Повторить заказ</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <main className="pt-48 pb-24 relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Sidebar / User Info */}
            <div className="lg:w-80 space-y-12">
              <motion.div {...fadeInUp} className="space-y-6">
                <div className="w-24 h-24 bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <User className="w-10 h-10 text-brand-blue" strokeWidth={1} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tighter text-brand-blue uppercase leading-none">Александр Ковалев</h1>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">alexander@example.com</p>
                </div>
              </motion.div>

              <nav className="space-y-2">
                {[
                  { icon: Package, label: "Мои заказы", id: "orders" },
                  { icon: MapPin, label: "Адреса доставки", id: "addresses" },
                  { icon: User, label: "Личные данные", id: "profile" },
                ].map((item, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between p-4 border transition-all ${activeTab === item.id ? 'bg-brand-blue border-brand-blue text-white' : 'border-slate-100 text-slate-400 hover:border-brand-blue hover:text-brand-blue'}`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                    </div>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                ))}
                <button className="w-full flex items-center gap-4 p-4 text-red-400 hover:text-red-600 transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Выйти из аккаунта</span>
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-12">
              <AnimatePresence mode="wait">
                {activeTab === "orders" && (
                  <motion.div 
                    key="orders"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-8"
                  >
                    <div className="flex justify-between items-end border-b border-slate-100 pb-6">
                      <h2 className="text-xl font-bold tracking-tight text-brand-blue uppercase">История заказов</h2>
                      <span className="text-[9px] text-slate-400 uppercase tracking-[0.3em]">Всего: 2</span>
                    </div>

                    <div className="space-y-6">
                      {orders.map((order, i) => (
                        <div key={i} className="group border border-slate-200 bg-white hover:border-brand-blue transition-all relative overflow-hidden">
                          {/* Pattern Overlay for Card */}
                          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
                          
                          {/* Architectural Decor */}
                          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-blue/30" />
                          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-blue/30" />

                          <div className="p-8 relative z-10">
                            <div className="flex justify-between items-start mb-10">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-slate-50 flex items-center justify-center border border-slate-100">
                                     <Package className="w-4 h-4 text-brand-blue" />
                                  </div>
                                  <div>
                                     <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Заказ</p>
                                     <p className="text-sm font-bold text-brand-blue">{order.id}</p>
                                  </div>
                               </div>
                               <span className={`text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 border ${
                                 order.status === 'Доставлено' 
                                 ? 'bg-green-50 border-green-100 text-green-600' 
                                 : 'bg-brand-blue/5 border-brand-blue/10 text-brand-blue'
                               }`}>
                                 {order.status}
                               </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-12">
                              <div className="space-y-2">
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">Дата оформления</p>
                                <p className="text-xs text-brand-blue font-medium">{order.date}</p>
                              </div>
                              <div className="space-y-2 lg:col-span-2">
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">Состав заказа</p>
                                <p className="text-xs text-slate-500 uppercase tracking-widest leading-relaxed line-clamp-1">
                                  {order.items.join(" • ")}
                                </p>
                              </div>
                              <div className="space-y-2 lg:text-right">
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">Итоговая сумма</p>
                                <p className="text-sm font-bold text-brand-blue uppercase">{order.total}</p>
                              </div>
                            </div>

                            <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
                              <button 
                                onClick={() => setSelectedOrder(order)}
                                className="text-[9px] font-bold uppercase tracking-[0.3em] text-brand-blue flex items-center gap-3 group/btn"
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
                    </div>
                  </motion.div>
                )}

                {activeTab === "addresses" && (
                  <motion.div 
                    key="addresses"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-8"
                  >
                    <div className="flex justify-between items-end border-b border-slate-100 pb-6">
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
                         <div key={addr.id} className="border border-slate-200 p-8 space-y-4 hover:border-brand-blue transition-colors relative">
                            <div className="flex justify-between items-start">
                               <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">{addr.type}</h3>
                               <MapPin className="w-4 h-4 text-brand-blue" />
                            </div>
                            <p className="text-xs text-slate-500 uppercase tracking-widest leading-relaxed">
                               {addr.street}, {addr.flat}. <br /> Индекс: {addr.zip}
                            </p>
                            <div className="flex gap-4 pt-4">
                               <button 
                                onClick={() => { setEditingAddress(addr); setIsAddressModalOpen(true); }}
                                className="text-[9px] font-bold uppercase tracking-widest text-brand-blue hover:text-slate-400 transition-colors"
                               >
                                Изменить
                               </button>
                               <button 
                                onClick={() => handleDeleteAddress(addr.id)}
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
                    className="space-y-12"
                  >
                    <div className="border-b border-slate-100 pb-6">
                      <h2 className="text-xl font-bold tracking-tight text-brand-blue uppercase">Личные данные</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <div className="space-y-8">
                          <div className="space-y-2">
                             <p className="text-[10px] text-slate-300 uppercase tracking-widest">Имя и Фамилия</p>
                             <input type="text" defaultValue="Александр Ковалев" className="w-full bg-transparent border-b border-slate-100 py-3 text-xs uppercase tracking-widest text-brand-blue focus:border-brand-blue outline-none" />
                          </div>
                          <div className="space-y-2">
                             <p className="text-[10px] text-slate-300 uppercase tracking-widest">Телефон</p>
                             <input type="text" defaultValue="+998 90 123 45 67" className="w-full bg-transparent border-b border-slate-100 py-3 text-xs uppercase tracking-widest text-brand-blue focus:border-brand-blue outline-none" />
                          </div>
                          <button className="h-14 px-12 bg-brand-blue text-white uppercase text-[10px] tracking-widest font-bold">Сохранить изменения</button>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recommendations */}
              {activeTab === "orders" && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-slate-50 p-12 space-y-6"
                >
                  <h3 className="text-sm font-bold text-brand-blue uppercase tracking-widest">Специально для вас</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                    Мы подготовили подборку на основе ваших предыдущих покупок.
                  </p>
                  <Link href="/women" className="inline-block text-[10px] font-bold uppercase tracking-widest text-brand-blue border-b border-brand-blue pb-1 hover:text-slate-400 hover:border-slate-400 transition-all">
                    Смотреть подборку
                  </Link>
                </motion.div>
              )}
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
