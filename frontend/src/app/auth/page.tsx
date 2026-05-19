"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/common/Button";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, ArrowRight, CheckCircle2, Lock, Eye, EyeOff, User } from "lucide-react";
import { useRouter } from "next/navigation";

type AuthMethod = "email" | "phone";
type AuthMode = "login" | "register";
type AuthStep = "form" | "info" | "success";

export default function AuthPage() {
  const [method, setMethod] = useState<AuthMethod>("email");
  const [mode, setMode] = useState<AuthMode>("login");
  const [step, setStep] = useState<AuthStep>("form");
  const [inputValue, setInputValue] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("+998 ");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Helper validations
  const isEmailValid = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const isPhoneValid = (phone: string) => {
    const clean = phone.replace(/[^0-9]/g, "");
    return clean.length === 12 && clean.startsWith("998");
  };

  const isStep1Valid = () => {
    const val = inputValue.trim();
    if (!val) return false;
    
    if (method === "email") {
      if (!isEmailValid(val)) return false;
    } else {
      if (!isPhoneValid(val)) return false;
    }

    if (!password || password.length < 8) return false;

    if (mode === "register") {
      if (password !== confirmPassword) return false;
    }

    return true;
  };

  const isStep2Valid = () => {
    if (!firstName.trim()) return false;
    if (!lastName.trim()) return false;
    if (!isPhoneValid(registerPhone)) return false;
    return true;
  };

  // Phone input formatting masks (+998 XX XXX XX XX)
  const handlePhoneInputChange = (val: string) => {
    setValidationError("");
    if (!val.startsWith("+998")) {
      setInputValue("+998 ");
      return;
    }
    const digitsAfterCode = val.slice(5).replace(/[^0-9]/g, "");
    if (digitsAfterCode.length > 9) return;
    
    let formatted = "+998 ";
    if (digitsAfterCode.length > 0) {
      formatted += digitsAfterCode.slice(0, 2);
    }
    if (digitsAfterCode.length > 2) {
      formatted += " " + digitsAfterCode.slice(2, 5);
    }
    if (digitsAfterCode.length > 5) {
      formatted += " " + digitsAfterCode.slice(5, 7);
    }
    if (digitsAfterCode.length > 7) {
      formatted += " " + digitsAfterCode.slice(7, 9);
    }
    setInputValue(formatted);
  };

  const handleRegisterPhoneChange = (val: string) => {
    setValidationError("");
    if (!val.startsWith("+998")) {
      setRegisterPhone("+998 ");
      return;
    }
    const digitsAfterCode = val.slice(5).replace(/[^0-9]/g, "");
    if (digitsAfterCode.length > 9) return;
    
    let formatted = "+998 ";
    if (digitsAfterCode.length > 0) {
      formatted += digitsAfterCode.slice(0, 2);
    }
    if (digitsAfterCode.length > 2) {
      formatted += " " + digitsAfterCode.slice(2, 5);
    }
    if (digitsAfterCode.length > 5) {
      formatted += " " + digitsAfterCode.slice(5, 7);
    }
    if (digitsAfterCode.length > 7) {
      formatted += " " + digitsAfterCode.slice(7, 9);
    }
    setRegisterPhone(formatted);
  };

  const handleInputChange = (val: string) => {
    setValidationError("");
    if (method === "phone") {
      handlePhoneInputChange(val);
    } else {
      setInputValue(val);
    }
  };

  // Redirect to profile immediately if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/profile");
    }
  }, [router]);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!isStep1Valid()) {
      return;
    }

    if (mode === "register") {
      // Go to Step 2: Personal Info
      if (method === "phone") {
        setRegisterPhone(inputValue);
      } else {
        setRegisterPhone("+998 ");
      }
      setStep("info");
    } else {
      // Direct login
      executeLogin();
    }
  };

  const executeLogin = async () => {
    setLoading(true);
    setValidationError("");

    try {
      const cleanInput = inputValue.trim();
      const emailToSend = method === "email" 
        ? cleanInput 
        : cleanInput.replace(/[^0-9+]/g, "") + "@liberty-wear.uz";

      const formData = new URLSearchParams();
      formData.append("username", emailToSend);
      formData.append("password", password);

      const res = await fetch("/api/v1/login/access-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user_email", emailToSend);
        
        setStep("success");
        setTimeout(() => router.push("/profile"), 2000);
      } else {
        const errData = await res.json();
        setValidationError(errData.detail || "Неверный логин или пароль");
      }
    } catch (err) {
      console.error("Login error:", err);
      setValidationError("Не удалось связаться с сервером. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!isStep2Valid()) {
      return;
    }

    setLoading(true);

    try {
      const cleanInput = inputValue.trim();
      const emailToSend = method === "email" 
        ? cleanInput 
        : cleanInput.replace(/[^0-9+]/g, "") + "@liberty-wear.uz";
      
      const phoneToSend = registerPhone.replace(/[^0-9+]/g, "");
      const fullNameToSend = `${firstName.trim()} ${lastName.trim()}`;

      // Register contact on backend
      const res = await fetch("/api/v1/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailToSend,
          password: password,
          phone: phoneToSend,
          full_name: fullNameToSend,
          role: "customer"
        }),
      });

      if (res.ok) {
        // Automatically log in
        const formData = new URLSearchParams();
        formData.append("username", emailToSend);
        formData.append("password", password);

        const loginRes = await fetch("/api/v1/login/access-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });

        if (loginRes.ok) {
          const tokenData = await loginRes.json();
          localStorage.setItem("token", tokenData.access_token);
          localStorage.setItem("user_email", emailToSend);
        }

        setStep("success");
        setTimeout(() => router.push("/profile"), 2000);
      } else {
        const errData = await res.json();
        setValidationError(errData.detail || "Ошибка при создании аккаунта");
      }
    } catch (err) {
      console.error("Register error:", err);
      setValidationError("Не удалось создать аккаунт. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Header />
      
      <main className="pt-24 md:pt-40 pb-24 relative overflow-hidden flex-1 flex items-center justify-center">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        <div className="container mx-auto px-6 max-w-md relative z-10 w-full">
          <AnimatePresence mode="wait">
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-brand-blue uppercase mb-3">
                    {mode === "login" ? "Вход в аккаунт" : "Регистрация"}
                  </h1>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                    {mode === "login" ? "Введите свои данные для входа" : "Шаг 1 из 2: Учетные данные"}
                  </p>
                </div>

                <div className="flex border-b border-slate-100">
                  <button 
                    onClick={() => { setMethod("email"); setInputValue(""); setValidationError(""); }}
                    className={`flex-1 py-3 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${method === "email" ? "text-brand-blue border-b-2 border-brand-blue" : "text-slate-300 hover:text-slate-500"}`}
                  >
                    Почта
                  </button>
                  <button 
                    onClick={() => { setMethod("phone"); setInputValue("+998 "); setValidationError(""); }}
                    className={`flex-1 py-3 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${method === "phone" ? "text-brand-blue border-b-2 border-brand-blue" : "text-slate-300 hover:text-slate-500"}`}
                  >
                    Телефон
                  </button>
                </div>

                <form onSubmit={handleCredentialsSubmit} className="space-y-6">
                  {/* Email / Phone Input */}
                  <div className="relative">
                    {method === "email" ? (
                      <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    ) : (
                      <Phone className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    )}
                    <input 
                      type={method === "email" ? "email" : "text"}
                      value={inputValue}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder={method === "email" ? "EMAIL@EXAMPLE.COM" : "+998 90 123 45 67"}
                      className="w-full bg-transparent border-b border-slate-200 py-3 pl-8 text-xs md:text-sm font-semibold text-brand-blue tracking-normal focus:outline-none focus:border-brand-blue transition-colors placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                    />
                    {inputValue && method === "email" && !isEmailValid(inputValue) && (
                      <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">
                        Введите корректный E-mail (например: user@example.com)
                      </p>
                    )}
                    {inputValue && method === "phone" && !isPhoneValid(inputValue) && (
                      <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">
                        Номер должен быть в формате +998 и содержать 9 цифр после кода (введено: {inputValue.replace(/[^0-9]/g, "").length}/12 цифр)
                      </p>
                    )}
                  </div>

                  {/* Password Input */}
                  <div className="relative">
                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setValidationError(""); }}
                      placeholder={mode === "login" ? "ВВЕДИТЕ ПАРОЛЬ" : "ПРИДУМАЙТЕ ПАРОЛЬ"}
                      className="w-full bg-transparent border-b border-slate-200 py-3 px-8 text-xs md:text-sm font-semibold text-brand-blue tracking-normal focus:outline-none focus:border-brand-blue transition-colors placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:text-brand-blue text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {password && password.length < 8 && (
                      <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">
                        Пароль должен содержать не менее 8 символов (введено: {password.length})
                      </p>
                    )}
                  </div>

                  {/* Confirm Password (Register mode only) */}
                  {mode === "register" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative overflow-hidden"
                    >
                      <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setValidationError(""); }}
                        placeholder="ПОДТВЕРДИТЕ ПАРОЛЬ"
                        className="w-full bg-transparent border-b border-slate-200 py-3 px-8 text-xs md:text-sm font-semibold text-brand-blue tracking-normal focus:outline-none focus:border-brand-blue transition-colors placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:text-brand-blue text-slate-300 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-[9px] text-red-400 mt-1 uppercase tracking-wider">
                          Пароли не совпадают
                        </p>
                      )}
                    </motion.div>
                  )}

                  {validationError && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider text-center">{validationError}</p>
                  )}

                  <Button 
                    type="submit"
                    disabled={loading || !isStep1Valid()}
                    className="w-full h-12 rounded-none bg-brand-blue text-white group uppercase tracking-widest font-bold text-[10px] md:text-xs shadow-sm hover:bg-brand-blue/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? "Загрузка..." : mode === "login" ? "Войти" : "Продолжить"}
                    {!loading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                </form>

                {/* Login / Register Toggle */}
                <div className="text-center pt-2">
                  <button 
                    onClick={() => { setMode(mode === "login" ? "register" : "login"); setValidationError(""); }}
                    className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-brand-blue transition-colors underline underline-offset-4"
                  >
                    {mode === "login" ? "Создать новый аккаунт" : "У меня уже есть аккаунт"}
                  </button>
                </div>
              </motion.div>
            )}

            {step === "info" && (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-brand-blue uppercase mb-3">Личные данные</h1>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Шаг 2 из 2: Как к вам обращаться?</p>
                </div>

                <form onSubmit={handleRegistrationSubmit} className="space-y-6">
                  {/* First Name */}
                  <div className="relative">
                    <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="text"
                      value={firstName}
                      onChange={(e) => { setFirstName(e.target.value); setValidationError(""); }}
                      placeholder="ИМЯ"
                      className="w-full bg-transparent border-b border-slate-200 py-3 pl-8 text-xs md:text-sm font-semibold text-brand-blue tracking-normal focus:outline-none focus:border-brand-blue transition-colors placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="relative">
                    <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="text"
                      value={lastName}
                      onChange={(e) => { setLastName(e.target.value); setValidationError(""); }}
                      placeholder="ФАМИЛИЯ"
                      className="w-full bg-transparent border-b border-slate-200 py-3 pl-8 text-xs md:text-sm font-semibold text-brand-blue tracking-normal focus:outline-none focus:border-brand-blue transition-colors placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="relative">
                    <Phone className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="text"
                      value={registerPhone}
                      onChange={(e) => handleRegisterPhoneChange(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="w-full bg-transparent border-b border-slate-200 py-3 pl-8 text-xs md:text-sm font-semibold text-brand-blue tracking-normal focus:outline-none focus:border-brand-blue transition-colors placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
                    />
                    {registerPhone && registerPhone.trim() !== "+998" && !isPhoneValid(registerPhone) && (
                      <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">
                        Номер должен быть в формате +998 и содержать 9 цифр после кода (введено: {registerPhone.replace(/[^0-9]/g, "").length}/12 цифр)
                      </p>
                    )}
                  </div>

                  {validationError && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider text-center">{validationError}</p>
                  )}

                  <Button 
                    type="submit"
                    disabled={loading || !isStep2Valid()}
                    className="w-full h-12 rounded-none bg-brand-blue text-white group uppercase tracking-widest font-bold text-[10px] md:text-xs shadow-sm hover:bg-brand-blue/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? "Создание аккаунта..." : "Завершить регистрацию"}
                    {!loading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                </form>

                <div className="text-center pt-2">
                  <button 
                    onClick={() => { setStep("form"); setValidationError(""); }}
                    className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-brand-blue transition-colors underline underline-offset-4"
                  >
                    Вернуться к учетным данным
                  </button>
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-8"
              >
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl md:text-2xl font-bold tracking-tighter text-brand-blue uppercase">
                    {mode === "login" ? "Успешный вход" : "Регистрация завершена"}
                  </h2>
                  <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest">
                    Добро пожаловать в Liberty Wear
                  </p>
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
