"use client";

import { useState, useEffect } from "react";
import { useSearch } from "@/context/SearchContext";
import { X, Search, ArrowRight, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export const SearchOverlay = () => {
  const { isOpen, setIsOpen } = useSearch();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = async (searchQuery: string) => {
    setLoading(true);
    try {
      const url = searchQuery.trim() 
        ? `http://localhost:8000/api/v1/products/?q=${encodeURIComponent(searchQuery)}`
        : `http://localhost:8000/api/v1/products/?limit=4`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (err) {
      console.error("Search fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const debounceTimer = setTimeout(() => {
        fetchResults(query);
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [query, isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setIsOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white z-[200] overflow-y-auto"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
          
          <div className="container mx-auto px-6 max-w-7xl pt-6 md:pt-12 pb-24 relative z-10">
            {/* Header */}
            <div className="flex justify-between items-center mb-12 md:mb-24">
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-brand-blue">Поиск по каталогу</span>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <X className="w-5 h-5 md:w-6 md:h-6 text-brand-blue" />
              </button>
            </div>

            {/* Search Input */}
            <div className="max-w-4xl mx-auto mb-12 md:mb-24">
              <div className="relative group">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 text-slate-200 group-focus-within:text-brand-blue transition-colors" />
                <input 
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ЧТО ВЫ ИЩЕТЕ?"
                  className="w-full bg-transparent border-b border-slate-100 py-4 md:py-8 pl-10 md:pl-16 text-xl md:text-5xl font-bold tracking-tighter uppercase focus:outline-none focus:border-brand-blue transition-all placeholder:text-slate-100"
                />
              </div>
              <div className="mt-4 md:mt-8 flex flex-wrap gap-x-4 gap-y-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span className="opacity-50">Популярные запросы:</span>
                <button onClick={() => setQuery("Пальто")} className="text-brand-blue hover:underline">Пальто</button>
                <button onClick={() => setQuery("Костюмы")} className="text-brand-blue hover:underline">Костюмы</button>
                <button onClick={() => setQuery("Кашемир")} className="text-brand-blue hover:underline">Кашемир</button>
              </div>
            </div>

            {/* Results Grid */}
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-end mb-8 md:mb-12">
                <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-4">
                  {query ? `Результаты поиска (${results.length})` : "Рекомендуемые товары"}
                  {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
                </h3>
              </div>

              {results.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                  {results.map((product) => (
                    <Link 
                      href={`/product/${product.id}`} 
                      key={product.id} 
                      className="group"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="relative aspect-[3/4] bg-slate-50 overflow-hidden mb-3 md:mb-6">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#f7f8f9] text-slate-300">
                            <span className="text-[8px] font-bold uppercase tracking-widest">Нет фото</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-widest mb-0.5 truncate">{product.category}</p>
                        <h4 className="text-xs md:text-sm font-bold text-brand-blue uppercase tracking-tight group-hover:text-slate-500 transition-colors truncate">{product.name}</h4>
                        <p className="mt-0.5 md:mt-1 text-xs md:text-sm text-slate-500">{product.price.toLocaleString('ru-RU')} сум</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 md:py-24 bg-slate-50 border border-slate-100">
                  <p className="text-xs md:text-sm text-slate-400 uppercase tracking-widest">
                    {loading ? "Поиск..." : "Ничего не найдено по вашему запросу"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
