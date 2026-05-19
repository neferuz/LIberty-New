"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  ChevronDown, 
  Home, 
  CreditCard, 
  Repeat, 
  Users, 
  Box, 
  Zap, 
  PieChart, 
  ShieldAlert, 
  FileText, 
  Smartphone, 
  Terminal, 
  Code, 
  ShoppingBag, 
  BarChart3, 
  LayoutDashboard, 
  MessageSquare, 
  Search, 
  Bell, 
  Settings,
  User,
  LogOut,
  UserCircle,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import React, { useState, useRef, useEffect, memo } from "react";
import { useRouter } from "next/navigation";

const mainNav = [
  { icon: Home, label: "Дашборд", href: "/" },
  { icon: ShoppingBag, label: "Заказы", href: "/orders" },
  { icon: Users, label: "Клиенты", href: "/customers" },
  { icon: Box, label: "Товары", href: "/products" },
  { icon: Zap, label: "Интеграции", href: "/integrations" },
  { icon: MessageSquare, label: "Чаты", href: "/chats" },
  { icon: Bell, label: "Заявки", href: "/inquiries" },
  { icon: ShieldAlert, label: "Сотрудники", href: "/staff" },
  { icon: Settings, label: "Настройки", href: "/settings" },
];

const pageSections = [
  { 
    icon: FileText, 
    label: "Страницы", 
    href: "/pages",
    subItems: [
      { label: "Главная", href: "/pages/home" },
      { label: "FAQ", href: "/pages/faq" },
      { label: "О нас", href: "/pages/about" },
      { label: "Контакты", href: "/pages/contact" },
      { label: "Доставка", href: "/pages/delivery" },
      { label: "Политика", href: "/pages/privacy" },
      { label: "Условия", href: "/pages/terms" }
    ]
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/v1/search/?q=${encodeURIComponent(searchQuery)}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && pathname !== "/login") {
      router.push("/login");
    }
  }, [pathname, router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#f7f8f9] border-r border-[#e3e8ee] flex flex-col sticky top-0 h-screen flex-shrink-0 z-[100]">
        <div className="px-3 py-3">
           <button className="w-full flex items-center gap-2 p-1.5 hover:bg-[#e3e8ee] transition-colors rounded-lg group text-left">
              <div className="w-8 h-8 bg-white border border-[#e3e8ee] rounded flex items-center justify-center text-[13px] font-bold text-slate-900 flex-shrink-0 shadow-sm">L</div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold leading-none truncate">Liberty sandbox</p>
                <p className="text-[11px] text-[#4f566b] leading-tight truncate">Liberty</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#4f566b] group-hover:text-slate-900 transition-colors flex-shrink-0" />
           </button>
        </div>

        <nav className="flex-1 px-2.5 py-1 space-y-0.5 overflow-y-auto scrollbar-hide">
          <div className="space-y-0.5 mb-6">
            <p className="px-3 py-3 text-[11px] font-medium text-[#4f566b]">Управление</p>
            {mainNav.map((item) => (
              <Link key={item.label} href={item.href} className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-all",
                pathname === item.href ? "text-[#2c3b6e] bg-white border border-[#e3e8ee]/50 shadow-sm" : "text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#e3e8ee]/50"
              )}>
                <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-[#2c3b6e]" : "text-[#4f566b]")} strokeWidth={1.5} />
                {item.label}
              </Link>
            ))}
          </div>

          <div>
            <p className="px-3 text-[11px] font-medium text-[#4f566b] mb-2">Контент</p>
            {pageSections.map((section) => (
              <div key={section.label}>
                <button className="w-full flex items-center justify-between px-3 py-2 text-[14px] text-[#4f566b] font-medium hover:text-[#1a1f36] hover:bg-[#e3e8ee]/50 rounded-lg transition-all group">
                  <div className="flex items-center gap-3">
                    <section.icon className="w-5 h-5" strokeWidth={1.5} />
                    {section.label}
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="mt-1 ml-9 space-y-1 pb-2">
                  {section.subItems.map(sub => {
                    const isActive = pathname === sub.href;
                    return (
                      <Link key={sub.label} href={sub.href} className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-all group relative",
                        isActive ? "text-[#2c3b6e] bg-[#f7f8f9] border border-[#e3e8ee]" : "text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#f7f8f9]"
                      )}>
                        {isActive && <div className="absolute left-0 w-1 h-4 bg-[#2c3b6e] rounded-full" />}
                        <span className={cn(isActive && "ml-1")}>{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        <div className="px-2.5 py-4 border-t border-[#e3e8ee] space-y-0.5">
           <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-[14px] text-[#4f566b] font-medium hover:text-[#1a1f36] hover:bg-[#e3e8ee]/50 rounded-lg transition-all">
              <Settings className="w-5 h-5" strokeWidth={1.5} /> Настройки
           </Link>
           <button className="w-full flex items-center gap-3 px-3 py-2 text-[14px] text-[#4f566b] font-medium hover:text-[#1a1f36] hover:bg-[#e3e8ee]/50 rounded-lg transition-all">
              <Code className="w-5 h-5" strokeWidth={1.5} /> Разработчикам
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Top Header */}
        <header className="h-16 border-b border-[#e3e8ee] flex items-center justify-between px-8 sticky top-0 z-[60] bg-white/80 backdrop-blur-md transition-all duration-300">
          <div className="flex items-center gap-8 flex-1">
            <div className="relative w-full max-w-sm group" ref={searchRef}>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <Search className="w-4 h-4 text-[#4f566b] group-focus-within:text-[#2c3b6e] transition-colors" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Поиск по заказам, товарам..." 
                className="w-full bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white pl-10 pr-12 py-2 text-[13px] font-medium rounded-lg transition-all outline-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 px-1.5 py-0.5 border border-[#e3e8ee] rounded bg-white text-[10px] font-bold text-[#4f566b] pointer-events-none uppercase tracking-tighter">
                <span className="text-[9px]">⌘</span>K
              </div>

              {/* Search Dropdown */}
              <AnimatePresence>
                {isSearchOpen && (searchQuery.length >= 2) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="absolute left-0 right-0 mt-2 bg-white border border-[#e3e8ee] rounded-xl shadow-2xl z-[100] overflow-hidden"
                  >
                    <div className="p-2 space-y-0.5">
                      {searchLoading ? (
                        <div className="p-8 flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 animate-spin text-[#2c3b6e]" />
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((result: any, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => {
                              router.push(result.href);
                              setIsSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className="w-full flex items-center gap-3 p-3 hover:bg-[#f7f8f9] rounded-lg transition-all text-left"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#2c3b6e]/5 flex items-center justify-center shrink-0">
                              {result.type === 'product' && <Box className="w-4 h-4 text-[#2c3b6e]" />}
                              {result.type === 'customer' && <Users className="w-4 h-4 text-[#2c3b6e]" />}
                              {result.type === 'order' && <ShoppingBag className="w-4 h-4 text-[#2c3b6e]" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-bold text-[#1a1f36] truncate leading-none mb-1">{result.title}</p>
                              <p className="text-[11px] text-[#4f566b] truncate uppercase tracking-widest">{result.subtitle}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-8 text-center text-[#4f566b] text-[12px] uppercase tracking-widest">
                          Ничего не найдено
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center border-r border-[#e3e8ee] pr-4 mr-1 gap-1">
              <button className="p-2 text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#f7f8f9] rounded-lg transition-all relative group">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#cd5c5c] border-2 border-white rounded-full" />
              </button>
              <button className="p-2 text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#f7f8f9] rounded-lg transition-all group">
                <Settings className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={cn(
                  "flex items-center gap-2.5 p-1 rounded-full transition-all group",
                  isProfileOpen ? "bg-[#f7f8f9]" : "hover:bg-[#f7f8f9]"
                )}
              >
                <div className="w-8 h-8 bg-gradient-to-tr from-[#2c3b6e] to-[#4a5e9e] rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-sm ring-2 ring-transparent group-hover:ring-[#2c3b6e]/20 transition-all">
                  AU
                </div>
                <div className="hidden lg:flex flex-col items-start pr-1">
                  <span className="text-[12px] font-bold text-[#1a1f36] leading-none mb-1">Admin User</span>
                  <span className="text-[10px] text-[#4f566b] font-medium leading-none">Версия 2.4.0</span>
                </div>
                <ChevronDown className={cn("w-3.5 h-3.5 text-[#4f566b] transition-transform duration-200", isProfileOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-[#e3e8ee] rounded-xl shadow-2xl z-[100] overflow-hidden py-1.5"
                  >
                    <div className="px-4 py-3 border-b border-[#f7f8f9]">
                      <p className="text-[12px] font-bold text-[#1a1f36]">Admin User</p>
                      <p className="text-[11px] text-[#4f566b]">admin@libertywear.uz</p>
                    </div>
                    
                    <div className="py-1">
                       <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#f7f8f9] transition-all">
                         <UserCircle className="w-4 h-4" /> Мой профиль
                       </Link>
                       <Link href="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-[#4f566b] hover:text-[#1a1f36] hover:bg-[#f7f8f9] transition-all">
                         <Settings className="w-4 h-4" /> Настройки
                       </Link>
                    </div>

                    <div className="border-t border-[#f7f8f9] mt-1 pt-1">
                       <button 
                         onClick={() => {
                           setIsProfileOpen(false);
                           localStorage.removeItem("token");
                           router.push("/login");
                         }}
                         className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium text-[#cd5c5c] hover:bg-[#cd5c5c]/5 transition-all text-left"
                       >
                         <LogOut className="w-4 h-4" /> Выйти
                       </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto scrollbar-hide relative">
          {children}
        </main>

        {/* Admin Footer */}
        <footer className="h-12 border-t border-[#e3e8ee] flex items-center justify-between px-8 bg-white text-[11px] text-[#a3acb9] font-medium shrink-0">
           <div className="flex items-center gap-6">
             <span>© 2026 LIBERTY WEAR MANAGEMENT</span>
             <span className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               Система онлайн
             </span>
           </div>
           <div className="flex items-center gap-4">
             <span className="uppercase tracking-widest text-[9px]">v1.0.4-premium</span>
             <div className="h-3 w-px bg-[#e3e8ee]" />
             <span>Ташкент, Узбекистан</span>
           </div>
        </footer>
      </div>
    </div>
  );
}
