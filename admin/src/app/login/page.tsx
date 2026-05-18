"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch("/api/v1/login/access-token", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        router.push("/");
      } else {
        setError(data.detail || "Неверный email или пароль");
      }
    } catch (err) {
      setError("Ошибка подключения к серверу");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8f9] p-4 font-evolventa">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] bg-white border border-[#e3e8ee] rounded-3xl p-8 md:p-14 shadow-2xl shadow-slate-200/50"
      >
        <div className="flex flex-col items-center text-center mb-12">
          <div className="mb-8">
            <span className="text-3xl font-bold tracking-tighter text-[#2c3b6e]">
              LIBERTY<span className="text-slate-400">WEAR</span>
            </span>
            <div className="mt-1 flex items-center justify-center gap-1.5">
               <div className="h-[1px] w-4 bg-[#e3e8ee]" />
               <span className="text-[10px] font-black text-[#4f566b] uppercase tracking-[0.3em]">Administrative</span>
               <div className="h-[1px] w-4 bg-[#e3e8ee]" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-[#1a1f36] tracking-tight mb-2">Добро пожаловать</h1>
          <p className="text-[14px] text-[#4f566b] font-medium leading-relaxed">Введите учетные данные для доступа к панели управления Liberty Wear.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#4f566b] uppercase tracking-widest ml-1">Рабочий Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4f566b] group-focus-within:text-[#2c3b6e] transition-colors" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@liberty.uz"
                className="w-full pl-12 pr-4 py-3.5 bg-[#f7f8f9] border border-[#e3e8ee]/30 focus:border-[#2c3b6e]/30 focus:bg-white rounded-xl text-[14px] outline-none transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[11px] font-bold text-[#4f566b] uppercase tracking-widest">Пароль</label>
              <button type="button" className="text-[11px] font-bold text-[#2c3b6e] hover:underline">Восстановить</button>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4f566b] group-focus-within:text-[#2c3b6e] transition-colors" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 bg-[#f7f8f9] border border-[#e3e8ee]/30 focus:border-[#2c3b6e]/30 focus:bg-white rounded-xl text-[14px] outline-none transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#cd5c5c]/5 border border-[#cd5c5c]/10 py-2.5 px-4 rounded-xl text-[12px] font-bold text-[#cd5c5c] text-center"
            >
              {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#2c3b6e] text-white py-4 rounded-xl font-bold text-[15px] hover:bg-[#232f58] transition-all flex items-center justify-center gap-3 group disabled:opacity-70 shadow-xl shadow-[#2c3b6e]/10"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Войти в систему
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-[#f7f8f9] flex flex-col items-center gap-4">
           <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10b981]" />
              <span className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest">Безопасное соединение</span>
           </div>
           <p className="text-center text-[10px] text-[#4f566b] font-medium uppercase tracking-[0.2em] opacity-40">
             © 2024 Liberty Wear. Digital Identity protected.
           </p>
        </div>
      </motion.div>
    </div>
  );
}
