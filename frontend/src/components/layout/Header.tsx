"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, User, ShoppingBag, Globe, Menu, X, ChevronRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useSearch } from "@/context/SearchContext";

interface CategoryNode {
  ID: string;
  NAME: string;
  SECTION_ID: string | null;
  children: CategoryNode[];
}

const simpleLinks = [
  { name: "О НАС", href: "/about" },
  { name: "FAQ", href: "/faq" },
  { name: "КОНТАКТЫ", href: "/contact" },
];

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [profileLink, setProfileLink] = useState("/auth");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setProfileLink("/profile");
    } else {
      setProfileLink("/auth");
    }
  }, []);

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState("RU");
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // On mount, check if there is a googtrans cookie
  useEffect(() => {
    const getCookie = (name: string) => {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const cookieVal = getCookie("googtrans");
    if (cookieVal) {
      const decoded = decodeURIComponent(cookieVal);
      if (decoded.includes("/uz")) {
        setCurrentLang("UZ");
      } else {
        setCurrentLang("RU");
      }
    } else {
      setCurrentLang("RU");
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = currentLang === "RU" ? "UZ" : "RU";
    
    const deleteCookie = (name: string) => {
      const host = window.location.hostname;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      
      if (host !== "localhost" && host !== "127.0.0.1") {
        const parts = host.split('.');
        if (parts.length > 2) {
          const mainDomain = parts.slice(-2).join('.');
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${mainDomain};`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${mainDomain};`;
        } else {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${host};`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host};`;
        }
      }
    };

    const setCookie = (name: string, value: string) => {
      const host = window.location.hostname;
      
      // Delete any duplicates first to prevent mixed domains
      deleteCookie(name);
      
      document.cookie = `${name}=${value}; path=/;`;
      if (host !== "localhost" && host !== "127.0.0.1") {
        const parts = host.split('.');
        if (parts.length > 2) {
          const mainDomain = parts.slice(-2).join('.');
          document.cookie = `${name}=${value}; path=/; domain=.${mainDomain};`;
          document.cookie = `${name}=${value}; path=/; domain=${mainDomain};`;
        } else {
          document.cookie = `${name}=${value}; path=/; domain=.${host};`;
        }
      }
    };

    if (newLang === "UZ") {
      setCookie("googtrans", "/ru/uz");
    } else {
      // Force Russian explicitly to override
      setCookie("googtrans", "/ru/ru");
    }

    setCurrentLang(newLang);
    window.location.reload();
  };
  
  const { setIsOpen: setIsOpenCart, items } = useCart();
  const { setIsOpen: setIsOpenSearch } = useSearch();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/v1/products/categories/tree");
        if (res.ok) {
          const data: CategoryNode[] = await res.json();
          // Dynamically slice the top-level categories to only include the first 4
          const filtered = data.slice(0, 4);
          setCategories(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch categories tree:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Map category names to display names if needed
  const getDisplayName = (name: string) => {
    const map: Record<string, string> = {
      "Женский": "ЖЕНЩИНЫ",
      "Мужской": "МУЖЧИНЫ",
      "Детский": "ДЕТИ",
      "Яселька": "МАЛЫШИ",
      "Пижама": "ПИЖАМЫ"
    };
    return map[name] || name.toUpperCase();
  };

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled || activeMenu || isMobileMenuOpen 
          ? "bg-white py-3 md:py-4" 
          : "bg-transparent py-4 md:py-6"
      ) }
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="container mx-auto px-4 max-w-7xl relative">
        {/* Desktop Layout */}
        <div className="hidden xl:flex items-center justify-between h-10">
          <div className="flex-1 flex justify-start">
            <Link href="/" className="text-3xl font-bold tracking-tighter text-brand-blue notranslate" translate="no">
              LIBERTY<span className="text-slate-400">WEAR</span>
            </Link>
          </div>
          
          <nav className="flex items-center gap-8 text-[12px] font-bold tracking-widest text-slate-500 h-full">
            {categories.map((category) => (
              <Link 
                key={category.ID}
                href={`/shop?category=${category.ID}`}
                className="h-full flex items-center cursor-pointer hover:text-brand-blue transition-colors relative group"
                onMouseEnter={() => setActiveMenu(category.ID)}
              >
                {getDisplayName(category.NAME)}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-blue transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
            {simpleLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="h-full flex items-center hover:text-brand-blue transition-colors"
                onMouseEnter={() => setActiveMenu(null)}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-4 text-slate-500">
              <div 
                className="relative"
                onMouseEnter={() => setIsLangDropdownOpen(true)}
                onMouseLeave={() => setIsLangDropdownOpen(false)}
              >
                <button 
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="hidden md:flex items-center gap-1.5 hover:text-brand-blue transition-colors text-[13px] font-bold mr-2 h-10 select-none"
                >
                  <Globe strokeWidth={1.25} className="w-5 h-5" />
                  <span>{currentLang}</span>
                </button>
                
                <AnimatePresence>
                  {isLangDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full bg-white shadow-2xl border border-slate-100 py-1 w-32 z-50 flex flex-col rounded-none"
                    >
                      <button
                        onClick={() => {
                          if (currentLang !== "RU") {
                            toggleLanguage();
                          }
                          setIsLangDropdownOpen(false);
                        }}
                        className={cn(
                          "px-4 py-2.5 text-left text-xs font-bold transition-all hover:bg-slate-50",
                          currentLang === "RU" ? "text-brand-blue" : "text-slate-400 hover:text-brand-blue"
                        )}
                      >
                        Русский (RU)
                      </button>
                      <button
                        onClick={() => {
                          if (currentLang !== "UZ") {
                            toggleLanguage();
                          }
                          setIsLangDropdownOpen(false);
                        }}
                        className={cn(
                          "px-4 py-2.5 text-left text-xs font-bold transition-all hover:bg-slate-50 border-t border-slate-50",
                          currentLang === "UZ" ? "text-brand-blue" : "text-slate-400 hover:text-brand-blue"
                        )}
                      >
                        O'zbekcha (UZ)
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button className="hover:text-brand-blue transition-colors p-0.5" onClick={() => setIsOpenSearch(true)}>
                <Search strokeWidth={1.25} className="w-5 h-5" />
              </button>
              <Link href={profileLink} className="hover:text-brand-blue transition-colors p-0.5">
                <User strokeWidth={1.25} className="w-5 h-5" />
              </Link>
              <button className="hover:text-brand-blue transition-colors relative p-0.5" onClick={() => setIsOpenCart(true)}>
                <ShoppingBag strokeWidth={1.25} className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-brand-blue text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="xl:hidden flex items-center justify-between h-12">
          {/* Burger */}
          <div className="flex-1 flex justify-start">
            <button 
              className="w-10 h-10 border border-slate-200 flex items-center justify-center text-brand-blue hover:border-brand-blue transition-all"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X strokeWidth={1.25} size={18} /> : <Menu strokeWidth={1.25} size={18} />}
            </button>
          </div>

          {/* Logo (Centered) */}
          <div className="flex justify-center flex-shrink-0">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-brand-blue whitespace-nowrap notranslate" translate="no">
              LIBERTY<span className="text-slate-400">WEAR</span>
            </Link>
          </div>

          {/* Icons */}
          <div className="flex-1 flex justify-end items-center gap-1">
            <button 
              className="text-slate-500 hover:text-brand-blue transition-colors p-0.5"
              onClick={() => setIsOpenSearch(true)}
            >
              <Search strokeWidth={1.25} size={20} />
            </button>
            <Link 
              href={profileLink} 
              className="text-slate-500 hover:text-brand-blue transition-colors p-0.5"
            >
              <User strokeWidth={1.25} size={20} />
            </Link>
            <button 
              className="text-slate-500 hover:text-brand-blue transition-colors relative p-0.5"
              onClick={() => setIsOpenCart(true)}
            >
              <ShoppingBag strokeWidth={1.25} size={20} />
              <span className="absolute -top-1.5 -right-1.5 bg-brand-blue text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {items.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Mega Menu Dropdown */}
      <AnimatePresence>
        {activeMenu && (
          (() => {
            const activeCategory = categories.find(c => c.ID === activeMenu);
            if (!activeCategory || !activeCategory.children || activeCategory.children.length === 0) return null;
            
            return (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="hidden xl:block absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-slate-100/60 z-[60]"
                onMouseEnter={() => setActiveMenu(activeMenu)}
              >
                <div className="container mx-auto px-12 max-w-7xl py-12">
                  <div className="grid grid-cols-5 gap-8">
                    {/* Columns of subcategories with their sub-subcategories */}
                    {activeCategory.children.slice(0, 4).map((subcat) => (
                      <div key={subcat.ID} className="space-y-4">
                        <Link 
                          href={`/shop?category=${subcat.ID}`} 
                          className="font-bold text-[10px] tracking-[0.2em] text-brand-blue uppercase hover:text-slate-400 transition-colors block pb-2 border-b border-slate-100"
                          onClick={() => setActiveMenu(null)}
                        >
                          {subcat.NAME}
                        </Link>
                        {subcat.children && subcat.children.length > 0 && (
                          <ul className="space-y-2">
                            {subcat.children.map((subsub) => (
                              <li key={subsub.ID}>
                                <Link 
                                  href={`/shop?category=${subsub.ID}`} 
                                  className="text-[11px] font-medium tracking-wide text-slate-500 hover:text-brand-blue transition-colors block"
                                  onClick={() => setActiveMenu(null)}
                                >
                                  {subsub.NAME}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                    
                    {/* Editorial/Feature Column for Luxury look */}
                    <div className="col-span-1 border-l border-slate-100 pl-8 space-y-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[8px] font-bold tracking-[0.3em] text-slate-400 uppercase">Новинки</span>
                        <h5 className="font-bold text-[14px] leading-tight text-brand-blue tracking-tight uppercase">
                          Коллекция {getDisplayName(activeCategory.NAME)}
                        </h5>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-sans font-medium">
                          Откройте для себя последние тренды и новинки, выбранные нашими стилистами.
                        </p>
                      </div>
                      <Link 
                        href={`/shop?category=${activeCategory.ID}`} 
                        className="inline-flex items-center text-[10px] font-bold tracking-[0.2em] text-brand-blue uppercase border-b border-brand-blue pb-0.5 hover:text-slate-400 hover:border-slate-400 transition-all self-start mt-4"
                        onClick={() => setActiveMenu(null)}
                      >
                        СМОТРЕТЬ ВСЁ
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="xl:hidden fixed inset-0 top-[56px] md:top-[64px] bg-white z-40 overflow-y-auto"
          >
            <div className="flex flex-col p-6 gap-6 min-h-full">
              {/* Main Categories with Accordion */}
              <div className="flex flex-col">
                {categories.map((category) => (
                  <div key={category.ID} className="border-b border-slate-50">
                    <button 
                      className="flex items-center justify-between w-full py-4 text-left"
                      onClick={() => setActiveMenu(activeMenu === category.ID ? null : category.ID)}
                    >
                      <span className="text-lg font-bold tracking-tight text-brand-blue">{getDisplayName(category.NAME)}</span>
                      {category.children.length > 0 && (
                        <ChevronRight 
                          size={18} 
                          className={cn(
                            "text-slate-400 transition-transform duration-300",
                            activeMenu === category.ID && "rotate-90"
                          )} 
                        />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {activeMenu === category.ID && category.children.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-slate-50/50 px-4"
                        >
                          <div className="py-4 space-y-6">
                            <div className="space-y-5">
                              {category.children.map((subcat) => (
                                <div key={subcat.ID} className="space-y-2.5">
                                  <Link 
                                    href={`/shop?category=${subcat.ID}`} 
                                    className="text-sm font-bold text-brand-blue tracking-tight block border-b border-slate-200/50 pb-1 uppercase"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    {subcat.NAME}
                                  </Link>
                                  {subcat.children && subcat.children.length > 0 && (
                                    <ul className="pl-3 space-y-2 border-l border-slate-200">
                                      {subcat.children.map((subsub) => (
                                        <li key={subsub.ID}>
                                          <Link 
                                            href={`/shop?category=${subsub.ID}`} 
                                            className="text-xs font-medium text-slate-500 hover:text-brand-blue block py-0.5"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                          >
                                            {subsub.NAME}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                            <Link 
                              href={`/shop?category=${category.ID}`}
                              className="block pt-2 text-xs font-bold text-brand-blue underline underline-offset-4 uppercase tracking-wider"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              Смотреть всё
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Secondary Links */}
              <div className="flex flex-col gap-4 py-2">
                {simpleLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    className="text-xs font-bold tracking-widest text-slate-400 hover:text-brand-blue transition-colors uppercase"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {/* Mobile Actions - Pushed to bottom */}
              <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-5">
                <button 
                  onClick={toggleLanguage}
                  className="flex items-center gap-3 text-brand-blue font-bold text-xs"
                >
                  <Globe size={18} strokeWidth={1.5} className="text-slate-400" />
                  <span>{currentLang === "RU" ? "O'zbekcha (UZ)" : "Русский (RU)"}</span>
                </button>
                <Link 
                  href={profileLink} 
                  className="flex items-center gap-3 text-brand-blue font-bold text-xs"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User size={18} strokeWidth={1.5} className="text-slate-400" />
                  <span>Личный кабинет</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
