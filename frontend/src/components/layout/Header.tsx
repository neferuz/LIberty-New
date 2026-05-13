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
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { setIsOpen: setIsOpenCart, items } = useCart();
  const { setIsOpen: setIsOpenSearch } = useSearch();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/products/categories/tree");
        if (res.ok) {
          const data: CategoryNode[] = await res.json();
          // Filter to only show Women, Men, Kids
          const allowedNames = ["Женский", "Мужской", "Детский"];
          const filtered = data.filter(c => allowedNames.includes(c.NAME));
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
            <Link href="/" className="text-3xl font-bold tracking-tighter text-brand-blue">
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
            <div className="flex items-center gap-1 text-slate-500">
              <button className="hidden md:flex items-center gap-1.5 hover:text-brand-blue transition-colors text-[13px] font-bold mr-1">
                <Globe strokeWidth={1.25} className="w-5 h-5" />
                <span>RU</span>
              </button>
              <button className="hover:text-brand-blue transition-colors p-0.5" onClick={() => setIsOpenSearch(true)}>
                <Search strokeWidth={1.25} className="w-5 h-5" />
              </button>
              <Link href="/auth" className="hover:text-brand-blue transition-colors p-0.5">
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
            <Link href="/" className="text-2xl font-bold tracking-tighter text-brand-blue whitespace-nowrap">
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
              href="/auth" 
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
        {activeMenu && categories.find(c => c.ID === activeMenu)?.children.length! > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="hidden xl:block absolute top-full left-0 right-0 bg-white shadow-xl border-t border-slate-50"
            onMouseEnter={() => setActiveMenu(activeMenu)}
          >
            <div className="container mx-auto px-6 max-w-2xl py-12">
               <div className="flex flex-col items-center gap-8">
                  <h4 className="font-bold text-[10px] tracking-[0.3em] text-slate-400 uppercase">Подкатегории</h4>
                  <ul className="grid grid-cols-2 gap-x-12 gap-y-4 w-full">
                    {categories.find(c => c.ID === activeMenu)?.children.map((child) => (
                      <li key={child.ID}>
                        <Link 
                          href={`/shop?category=${child.ID}`} 
                          className="text-base text-brand-blue hover:text-slate-400 transition-colors flex items-center justify-between group/item border-b border-slate-50 pb-2"
                          onClick={() => setActiveMenu(null)}
                        >
                          <span className="font-medium tracking-tight">{child.NAME}</span>
                          <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-slate-300" />
                        </Link>
                      </li>
                    ))}
                    <li>
                        <Link 
                          href={`/shop?category=${activeMenu}`} 
                          className="text-base text-brand-blue font-bold hover:text-slate-400 transition-colors flex items-center justify-between group/item border-b border-slate-50 pb-2"
                          onClick={() => setActiveMenu(null)}
                        >
                          <span className="tracking-tight">СМОТРЕТЬ ВСЁ</span>
                          <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-slate-300" />
                        </Link>
                    </li>
                  </ul>
               </div>
            </div>
          </motion.div>
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
                          <div className="py-4 space-y-4">
                            <ul className="grid grid-cols-1 gap-4">
                              {category.children.map((child) => (
                                <li key={child.ID}>
                                  <Link 
                                    href={`/shop?category=${child.ID}`} 
                                    className="text-sm font-medium text-brand-blue/70 hover:text-brand-blue flex items-center justify-between"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    {child.NAME}
                                    <ChevronRight size={14} className="text-slate-300" />
                                  </Link>
                                </li>
                              ))}
                            </ul>
                            <Link 
                              href={`/shop?category=${category.ID}`}
                              className="block pt-2 text-xs font-bold text-brand-blue underline underline-offset-4"
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
                <button className="flex items-center gap-3 text-brand-blue font-bold text-xs">
                  <Globe size={18} strokeWidth={1.5} className="text-slate-400" />
                  <span>Русский (RU)</span>
                </button>
                <Link 
                  href="/auth" 
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
