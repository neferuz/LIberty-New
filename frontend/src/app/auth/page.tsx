"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/common/Button";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AuthMethod = "email" | "phone";
type AuthStep = "input" | "otp" | "success";

export default function AuthPage() {
  const [method, setMethod] = useState<AuthMethod>("email");
  const [step, setStep] = useState<AuthStep>("input");
  const [inputValue, setInputValue] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const router = useRouter();

  const handleNext = () => {
    if (inputValue) setStep("otp");
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Check if complete and correct
    if (newOtp.every(val => val !== "")) {
      if (newOtp.join("") === "0000") {
        setStep("success");
        setTimeout(() => router.push("/profile"), 2000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-24 md:pt-48 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        <div className="container mx-auto px-6 max-w-lg relative z-10">
          <AnimatePresence mode="wait">
            {step === "input" && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 md:space-y-12"
              >
                <div className="text-center">
                  <h1 className="text-2xl md:text-4xl font-bold tracking-tighter text-brand-blue uppercase mb-3 md:mb-4">Вход в аккаунт</h1>
                  <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest">Выберите удобный способ авторизации</p>
                </div>

                <div className="flex border-b border-slate-100">
                  <button 
                    onClick={() => { setMethod("email"); setInputValue(""); }}
                    className={`flex-1 py-3 md:py-4 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${method === "email" ? "text-brand-blue border-b-2 border-brand-blue" : "text-slate-300 hover:text-slate-500"}`}
                  >
                    Почта
                  </button>
                  <button 
                    onClick={() => { setMethod("phone"); setInputValue("+998 "); }}
                    className={`flex-1 py-3 md:py-4 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${method === "phone" ? "text-brand-blue border-b-2 border-brand-blue" : "text-slate-300 hover:text-slate-500"}`}
                  >
                    Телефон
                  </button>
                </div>

                <div className="space-y-6 md:space-y-8">
                  <div className="relative">
                    {method === "email" ? (
                      <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-300" />
                    ) : (
                      <Phone className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-300" />
                    )}
                    <input 
                      type={method === "email" ? "email" : "text"}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={method === "email" ? "EMAIL@EXAMPLE.COM" : "+998 -- --- -- --"}
                      className="w-full bg-transparent border-b border-slate-200 py-3 md:py-4 pl-8 md:pl-10 text-xs md:text-sm tracking-widest uppercase focus:outline-none focus:border-brand-blue transition-colors placeholder:text-slate-200"
                    />
                  </div>
                  <Button 
                    onClick={handleNext}
                    disabled={!inputValue}
                    className="w-full h-12 md:h-14 rounded-none bg-brand-blue text-white group uppercase tracking-widest font-bold text-[10px] md:text-xs"
                  >
                    Продолжить
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 md:space-y-12"
              >
                <div className="text-center">
                  <h2 className="text-xl md:text-2xl font-bold tracking-tighter text-brand-blue uppercase mb-3 md:mb-4">Код подтверждения</h2>
                  <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest">Мы отправили код на {inputValue}</p>
                </div>

                <div className="flex justify-center gap-3 md:gap-4">
                  {otp.map((digit, i) => (
                    <input 
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      className="w-12 h-14 md:w-14 md:h-16 bg-slate-50 border border-slate-100 text-center text-lg md:text-xl font-bold text-brand-blue focus:outline-none focus:border-brand-blue transition-all"
                    />
                  ))}
                </div>

                <div className="text-center">
                  <button 
                    onClick={() => setStep("input")}
                    className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-brand-blue transition-colors underline underline-offset-4"
                  >
                    Изменить данные
                  </button>
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 md:space-y-8 py-8 md:py-12"
              >
                <div className="flex justify-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-green-500" />
                  </div>
                </div>
                <div className="space-y-1 md:space-y-2">
                  <h2 className="text-xl md:text-2xl font-bold tracking-tighter text-brand-blue uppercase">Успешный вход</h2>
                  <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest">Добро пожаловать в Liberty Wear</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
