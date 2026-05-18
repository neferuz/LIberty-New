"use client";

import { useState, useEffect } from "react";
import { useSearch } from "@/context/SearchContext";
import { X, Search, ArrowRight, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { formatSkuForUrl } from "@/lib/utils";

export const SearchOverlay = () => {
  const { isOpen, setIsOpen } = useSearch();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = async (searchQuery: string) => {
    setLoading(true);
    try {
      // Fetch up to 100 products to perform a high-quality client-side search filtering
      const url = "/api/v1/products?limit=100";
      
      const res = await fetch(url);
      if (res.ok) {
        let data = await res.json();
        const trimmedQuery = searchQuery.trim();
        
        if (trimmedQuery) {
          const qLower = trimmedQuery.toLowerCase();
          
          // Filter results dynamically using smart word boundary matching to prevent bad matches (e.g. "шорты" matching "свитшот")
          data = data.filter((product: any) => {
            const name = product.name.toLowerCase();
            const sku = product.sku ? product.sku.toLowerCase() : "";
            const category = product.category ? product.category.toLowerCase() : "";
            
            // Check SKU first
            if (sku.includes(qLower)) return true;
            
            // Split name and query into words to do accurate matching
            const queryWords: string[] = qLower.split(/\s+/).filter(Boolean);
            const nameWords: string[] = name.split(/[^a-zA-Zа-яА-ЯёЁ0-9]+/).filter(Boolean);
            const categoryWords: string[] = category.split(/[^a-zA-Zа-яА-ЯёЁ0-9]+/).filter(Boolean);
            
            // Every word in the search query must match some word in product name or category
            return queryWords.every((qw: string) => {
              // Word matches if a name word or category word starts with or matches the query word in a smart way
              return nameWords.some((nw: string) => nw.startsWith(qw) || (qw.length >= 3 && nw.includes(qw))) ||
                     categoryWords.some((cw: string) => cw.startsWith(qw) || (qw.length >= 3 && cw.includes(qw)));
            });
          });
        } else {
          // Shuffle up to 40 products and take the first 4 to randomize recommendations
          data = [...data].sort(() => 0.5 - Math.random()).slice(0, 4);
        }
        setResults(data);
      }
    } catch (err) {
      console.error("Search fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePopularQuery = (term: string) => {
    setQuery(term);
    fetchResults(term);
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
            <div className="flex justify-between items-center mb-6 md:mb-12">
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] text-brand-blue">Поиск по каталогу</span>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <X className="w-5 h-5 md:w-6 md:h-6 text-brand-blue" />
              </button>
            </div>
 
            {/* Search Input */}
            <div className="max-w-4xl mx-auto mb-6 md:mb-12">
              <div className="relative group">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-slate-200 group-focus-within:text-brand-blue transition-colors" />
                <input 
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ЧТО ВЫ ИЩЕТЕ?"
                  className="w-full bg-transparent border-b border-slate-100 py-3 md:py-5 pl-8 md:pl-12 text-lg md:text-3xl font-bold tracking-tighter uppercase focus:outline-none focus:border-brand-blue transition-all placeholder:text-slate-100"
                />
              </div>
            </div>
 
            {/* Results Grid */}
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-end mb-6 md:mb-8">
                <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-4">
                  {query ? `Результаты поиска (${results.length})` : "Рекомендуемые товары"}
                  {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
                </h3>
              </div>

              {results.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                  {results.map((product) => (
                    <Link 
                      href={`/product/${product.sku ? `${formatSkuForUrl(product.sku)}-` : ''}${product.id}`} 
                      key={product.id} 
                      className="group"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="relative aspect-[3/4] bg-slate-50 overflow-hidden mb-3 md:mb-6">
                        {(() => {
                          const productImages = product.images ? product.images.split(',') : [];
                          const primaryImage = product.image_url || (productImages.length > 0 ? productImages[0] : null);

                          if (!primaryImage) {
                            return (
                              <div className="w-full h-full flex items-center justify-center bg-[#f7f8f9] text-slate-300">
                                <span className="text-[8px] font-bold uppercase tracking-widest">Нет фото</span>
                              </div>
                            );
                          }

                          return (
                            <Image
                              src={primaryImage}
                              alt={product.name}
                              fill
                              className="object-contain transition-transform duration-700 group-hover:scale-105"
                            />
                          );
                        })()}
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
                <div className="py-16 md:py-24 flex flex-col items-center justify-center text-center font-sans">
                  <div className="w-12 h-12 bg-brand-blue/5 flex items-center justify-center text-brand-blue mb-4">
                    <Search className="w-4 h-4 opacity-60" />
                  </div>
                  <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-brand-blue mb-1">
                    {loading ? "Поиск..." : "Ничего не найдено"}
                  </h3>
                  {!loading && (
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest max-w-[280px] leading-relaxed">
                      Попробуйте изменить запрос или проверить написание артикула.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
