"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2, Clock, AlertCircle, ShoppingBag, ChevronLeft, CreditCard, HelpCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");

  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [methodChanging, setMethodChanging] = useState(false);
  const [error, setError] = useState("");

  // Fetch order details from backend
  const fetchOrderDetails = async () => {
    if (!orderId) {
      setError("Номер заказа не указан");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/v1/orders/ORD-${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrderData(data);
        setError("");
      } else {
        setError("Не удалось загрузить данные заказа");
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  // Real-time payment verification background poller
  useEffect(() => {
    if (!orderId || !orderData || orderData.status === "Paid" || orderData.status === "Cancelled") return;
    
    // Only poll for online payment methods
    const isOnline = orderData.method === "CLICK Онлайн" || orderData.method === "Payme Онлайн";
    if (!isOnline) return;

    let intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/orders/ORD-${orderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "Paid") {
            setOrderData(data);
            clearInterval(intervalId);
          } else if (data.status === "Cancelled") {
            setOrderData(data);
            clearInterval(intervalId);
          }
        }
      } catch (err) {
        console.error("Poller error:", err);
      }
    }, 4000);

    return () => clearInterval(intervalId);
  }, [orderId, orderData]);

  // Handle switching payment method dynamically
  const handlePaymentMethodChange = async (newMethodCode: string) => {
    if (!orderId || methodChanging) return;
    setMethodChanging(true);
    try {
      const res = await fetch(`/api/v1/orders/ORD-${orderId}/payment-method`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: newMethodCode,
          status: newMethodCode === "cod" ? "Created" : "Pending"
        })
      });
      if (res.ok) {
        // Refetch updated deal state from backend
        await fetchOrderDetails();
      } else {
        alert("Не удалось изменить способ оплаты. Попробуйте еще раз.");
      }
    } catch (err) {
      console.error("Error switching payment method:", err);
      alert("Ошибка при изменении способа оплаты.");
    } finally {
      setMethodChanging(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Загрузка деталей заказа...</p>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="max-w-md mx-auto my-12 text-center space-y-4 px-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-[14px] font-black uppercase tracking-wider text-slate-800">Заказ не найден</h2>
        <p className="text-[12px] text-slate-500">{error || "Указанный номер заказа отсутствует в базе данных."}</p>
        <Link href="/" className="inline-block mt-4">
          <button className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[9.5px] uppercase tracking-widest transition-all">
            Вернуться на главную
          </button>
        </Link>
      </div>
    );
  }

  const isPaid = orderData.status === "Paid";
  const isCancelled = orderData.status === "Cancelled";
  const currentMethod = orderData.method; // "CLICK Онлайн", "Payme Онлайн", "При получении"
  
  // Format total amount
  const totalAmountStr = orderData.total || "0 сум";
  const rawTotalValue = parseInt(totalAmountStr.replace(/\D/g, ""), 10) || 0;

  return (
    <div className="max-w-md mx-auto my-6 px-4">
      {/* Visual Header Card */}
      <div className="text-center space-y-4 mb-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center"
        >
          {isPaid ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          ) : isCancelled ? (
            <AlertCircle className="w-6 h-6 text-rose-500" />
          ) : (
            <Clock className="w-6 h-6 text-amber-500 animate-pulse" />
          )}
        </motion.div>

        <h1 className="text-[16px] font-black uppercase tracking-widest text-slate-900 mt-2">
          {isPaid ? "Заказ оплачен" : isCancelled ? "Заказ отменен" : "Ожидание оплаты"}
        </h1>
        
        <div className="h-[2px] bg-brand-blue w-8 mx-auto mb-2" />
        
        <p className="text-[12px] text-slate-600 leading-relaxed max-w-sm mx-auto">
          Благодарим за выбор <span className="font-bold text-brand-blue">Liberty Wear</span>!
        </p>
        <p className="text-[12.5px] text-slate-500">
          Номер вашего заказа: <span className="font-extrabold text-brand-blue">#{orderId}</span>
        </p>
      </div>

      {/* Main Payment Status Card */}
      <div className="space-y-4">
        {currentMethod === "CLICK Онлайн" || currentMethod === "Payme Онлайн" ? (
          /* Online payment status handler */
          <div className="space-y-4">
            {isPaid ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50/50 border border-emerald-150 p-4 rounded-none text-center space-y-2"
              >
                <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-4 h-4 animate-bounce" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Оплата подтверждена! 🎉</h3>
                <p className="text-[9.5px] text-emerald-600 leading-relaxed mt-0.5">
                  Ваш заказ успешно оплачен онлайн через {currentMethod === "Payme Онлайн" ? "Payme" : "CLICK"}. Мы уже собираем его для вас!
                </p>
              </motion.div>
            ) : isCancelled ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50/50 border border-rose-150 p-4 rounded-none text-center space-y-2"
              >
                <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-wider text-rose-800">Заказ отменен ❌</h3>
                <p className="text-[9.5px] text-rose-600 leading-relaxed mt-0.5">
                  Сделка была отменена или возвращена. Пожалуйста, выберите другой способ оплаты или обратитесь в службу поддержки.
                </p>
              </motion.div>
            ) : (
              /* Awaiting online payment block */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-50/50 border border-slate-200 p-4 rounded-none text-center space-y-3"
              >
                <div className="flex items-center justify-center gap-1.5 py-0.5 px-2 bg-amber-50 border border-amber-100 rounded-none w-fit mx-auto">
                  <Clock className="w-2.5 h-2.5 text-amber-500 animate-pulse shrink-0" />
                  <span className="text-[8px] text-amber-700 font-bold uppercase tracking-wider">Ожидаем онлайн-оплату</span>
                </div>

                <div className="pb-1.5 border-b border-slate-100">
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-brand-blue">Оплатить заказ онлайн</h3>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    Сумма к оплате: <span className="font-extrabold text-brand-blue">{totalAmountStr}</span>
                  </p>
                </div>

                <div className="pt-0.5">
                  {currentMethod === "Payme Онлайн" ? (
                    <a
                      href={(() => {
                        const merchantId = "69454dd1656e7b8e815da033";
                        const amountTiyin = rawTotalValue * 100;
                        const params = `m=${merchantId};ac.order_id=ORD-${orderId};a=${amountTiyin};c=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin + "/profile" : "")}`;
                        const base64Params = btoa(unescape(encodeURIComponent(params)));
                        return `https://checkout.paycom.uz/${base64Params}`;
                      })()}
                      className="block"
                    >
                      <button
                        type="button"
                        className="w-full py-2 px-4 bg-white hover:bg-slate-50 text-[#00bfa5] border border-[#00bfa5] font-extrabold text-[9.5px] uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-[0.98] rounded-none shadow-sm font-sans"
                      >
                        <img 
                          src="https://cdn.payme.uz/logo/payme_color.svg" 
                          alt="Payme" 
                          className="h-4.5 w-auto shrink-0" 
                        />
                        Оплатить через Payme
                      </button>
                    </a>
                  ) : (
                    /* CLICK payment trigger */
                    <a
                      href={`https://my.click.uz/services/pay?service_id=101626&merchant_id=45275&amount=${rawTotalValue}&transaction_param=ORD-${orderId}&merchant_user_id=83104&return_url=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin + "/profile" : "")}`}
                      className="block"
                    >
                      <button
                        type="button"
                        className="w-full py-2 px-4 bg-[#27a8e0] hover:bg-[#1b93cb] text-white font-extrabold text-[9.5px] uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] rounded-none border-none shadow-sm font-sans"
                      >
                        <img 
                          src="https://click.uz/click/images/click-white.jpg" 
                          alt="CLICK" 
                          className="h-5 w-auto shrink-0 rounded-sm" 
                        />
                        Оплатить через CLICK
                      </button>
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          /* Cash / COD Card */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-50/50 border border-slate-200 p-4 rounded-none text-center space-y-2"
          >
            <h3 className="text-[10px] font-black uppercase tracking-wider text-brand-blue">Способ оплаты</h3>
            <p className="text-[9.5px] text-slate-500 leading-relaxed">
              Выбранный способ: <span className="font-bold text-brand-blue">При получении (Наличные)</span>. 
              Пожалуйста, подготовьте курьеру сумму <span className="font-bold text-brand-blue">{totalAmountStr}</span>. Наш менеджер свяжется с вами для согласования времени доставки.
            </p>
          </motion.div>
        )}

        {/* Dynamic Payment Method Switcher */}
        {!isPaid && (
          <div className="pt-5 border-t border-slate-100 text-center space-y-2.5">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
              {methodChanging ? "Обновление..." : "Изменить способ оплаты"}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={methodChanging || currentMethod === "CLICK Онлайн"}
                onClick={() => handlePaymentMethodChange("click")}
                className={`py-2 px-1 text-[8.5px] font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 transition-all border rounded-none cursor-pointer ${
                  currentMethod === "CLICK Онлайн"
                    ? "bg-[#27a8e0]/5 border-[#27a8e0] text-[#27a8e0]"
                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                <img src="https://click.uz/click/images/click-white.jpg" alt="CLICK" className="h-4 w-auto mx-auto rounded-sm" />
                CLICK
              </button>
              
              <button
                type="button"
                disabled={methodChanging || currentMethod === "Payme Онлайн"}
                onClick={() => handlePaymentMethodChange("payme")}
                className={`py-2 px-1 text-[8.5px] font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 transition-all border rounded-none cursor-pointer ${
                  currentMethod === "Payme Онлайн"
                    ? "bg-[#00bfa5]/5 border-[#00bfa5] text-[#00bfa5]"
                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                <img src="https://cdn.payme.uz/logo/payme_color.svg" alt="Payme" className="h-3.5 w-auto mx-auto" />
                Payme
              </button>

              <button
                type="button"
                disabled={methodChanging || currentMethod === "При получении"}
                onClick={() => handlePaymentMethodChange("cod")}
                className={`py-2 px-1 text-[8.5px] font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 transition-all border rounded-none cursor-pointer ${
                  currentMethod === "При получении"
                    ? "bg-brand-blue/5 border-brand-blue text-brand-blue"
                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                <svg className="w-3.5 h-3.5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Наличные
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Details and Actions */}
        <div className="pt-2 text-center">
          <Link href="/">
            <button className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[9.5px] uppercase tracking-widest transition-all">
              Вернуться в магазин
            </button>
          </Link>
          
          <p className="text-[11px] text-slate-400 mt-4 leading-relaxed max-w-xs mx-auto">
            Наш менеджер свяжется с вами в ближайшее время для подтверждения деталей заказа.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between font-sans">
      <Header />
      
      <main className="flex-grow pt-24 pb-16 relative z-10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        <Suspense fallback={
          <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Загрузка страницы успеха...</p>
          </div>
        }>
          <SuccessPageContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
