"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Search, Filter, X, RefreshCw, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  image_url: string | null;
  category: string;
  category_id: number;
}

interface Category {
  id: string;
  name: string;
  count: number;
}

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(initialCategory || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<number>(2000000);
  const [activeSort, setActiveSort] = useState("default");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const catId = searchParams.get("category");
    if (catId) setActiveCategoryId(catId);
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("http://localhost:8000/api/v1/products/?limit=500"),
        fetch("http://localhost:8000/api/v1/products/categories")
      ]);
      
      if (prodRes.ok) setProducts(await prodRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      
    } catch (err) {
      console.error("Failed to fetch shop data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let list = products.filter(p => {
      const matchesCategory = activeCategoryId === "all" || p.category_id === parseInt(activeCategoryId);
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPrice = p.price <= priceRange;
      return matchesCategory && matchesSearch && matchesPrice;
    });

    if (activeSort === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (activeSort === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [products, activeCategoryId, searchQuery, priceRange, activeSort]);

  const resetFilters = () => {
    setActiveCategoryId("all");
    setSearchQuery("");
    setPriceRange(2000000);
    setIsFilterOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      
      <main className="pt-20 md:pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="mb-8 md:mb-12">
            <nav className="flex items-center gap-2 text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-4 md:mb-6">
              <Link href="/" className="hover:text-brand-blue transition-colors">Главная</Link>
              <span className="opacity-50">/</span>
              <span className="text-brand-blue font-bold">Каталог</span>
            </nav>
            
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6 md:mb-8">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-brand-blue uppercase leading-none">
                Каталог.
              </h1>
              
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:pb-0">
                <button
                  onClick={() => setActiveCategoryId("all")}
                  className={`px-4 md:px-6 py-1.5 md:py-2.5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all border whitespace-nowrap ${
                    activeCategoryId === "all" 
                    ? "bg-brand-blue text-white border-brand-blue" 
                    : "bg-white text-slate-400 border-[#e3e8ee] hover:border-slate-300"
                  }`}
                >
                  Все
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`px-4 md:px-6 py-1.5 md:py-2.5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all border whitespace-nowrap ${
                      activeCategoryId === cat.id 
                      ? "bg-brand-blue text-white border-brand-blue" 
                      : "bg-white text-slate-400 border-[#e3e8ee] hover:border-slate-300"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2 md:gap-3">
              <div className="flex-1 relative group h-[46px] md:h-[52px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-brand-blue transition-colors" />
                <input 
                  type="text" 
                  placeholder="ПОИСК ПО КАТАЛОГУ..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-full bg-[#fcfcfd] border border-[#e3e8ee] pl-11 pr-4 text-[9px] md:text-[10px] uppercase tracking-widest text-brand-blue focus:outline-none focus:border-brand-blue focus:bg-white transition-all"
                />
              </div>
              <div className="flex items-center bg-white border border-[#e3e8ee] px-4 h-[46px] md:h-[52px] min-w-[160px] md:min-w-[200px]">
                 <select 
                  value={activeSort}
                  onChange={(e) => setActiveSort(e.target.value)}
                  className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-brand-blue outline-none bg-transparent cursor-pointer w-full h-full"
                 >
                    <option value="default">Сортировка</option>
                    <option value="price-asc">Цена: По возрастанию</option>
                    <option value="price-desc">Цена: По убыванию</option>
                 </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
            <aside className="hidden lg:block lg:w-60 flex-shrink-0 space-y-8">
               <div className="flex items-center justify-between border-b border-[#e3e8ee] pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-blue flex items-center gap-2">
                    <Filter className="w-3 h-3" /> Фильтры
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest">{filteredProducts.length} Тов.</span>
               </div>

               <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">Цена</h4>
                      <span className="text-[10px] font-medium text-slate-500 tracking-tight">до {priceRange.toLocaleString('ru-RU')} сум</span>
                    </div>
                    <div className="relative pt-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="5000000" 
                        step="10000"
                        value={priceRange}
                        onChange={(e) => setPriceRange(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={resetFilters}
                    className="text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-brand-blue transition-colors"
                   >
                    Сбросить всё
                   </button>
               </div>
            </aside>

            <div className="flex-1">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-16">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={product.id} 
                      className="group relative"
                    >
                      <Link href={`/product/${product.id}`}>
                        <div className="relative aspect-[3/4] overflow-hidden bg-slate-50">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-[#f7f8f9] text-slate-300 gap-2">
                               <ImageIcon className="w-5 h-5 opacity-40" />
                               <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em]">Нет фото</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-brand-blue/0 group-hover:bg-brand-blue/5 transition-colors duration-500" />
                          
                          <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4">
                             <div className="bg-white/90 backdrop-blur-sm px-2 md:px-3 py-1 md:py-1.5 text-[8px] md:text-[10px] font-bold tracking-tight text-brand-blue">
                                {product.price.toLocaleString('ru-RU')} сум
                             </div>
                          </div>
                        </div>
                      </Link>
                      
                      <div className="mt-4 md:mt-6 flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <Link href={`/product/${product.id}`}>
                            <p className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-widest mb-0.5 truncate">{product.category || "General"}</p>
                            <h3 className="text-[10px] md:text-sm font-bold text-brand-blue uppercase tracking-tight group-hover:text-slate-500 transition-colors truncate">{product.name}</h3>
                          </Link>
                          <p className="mt-0.5 md:mt-1 text-[10px] md:text-sm text-slate-500 font-medium">{product.sku}</p>
                        </div>
                        <button 
                          onClick={() => addItem({
                            id: product.id,
                            name: product.name,
                            price: product.price.toLocaleString('ru-RU') + " сум",
                            image: product.image_url || "/images/placeholder.jpg",
                            category: product.category || "General"
                          })}
                          className="w-8 h-8 md:w-10 md:h-10 border border-slate-100 flex items-center justify-center text-brand-blue hover:bg-brand-blue hover:text-white transition-all flex-shrink-0"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredProducts.length === 0 && (
                <div className="py-24 md:py-40 text-center">
                  <p className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-slate-300">Ничего не найдено</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Filter Button (Mobile) */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[40] lg:hidden">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="bg-brand-blue text-white px-8 h-12 flex items-center gap-3 active:scale-95 transition-all"
          >
            <Filter size={14} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Фильтры</span>
          </button>
        </div>

        {/* Mobile Filter Overlay */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white z-[200] lg:hidden flex flex-col"
            >
              <div className="flex justify-between items-center px-6 py-6 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-blue">Фильтры</span>
                <button onClick={() => setIsFilterOpen(false)} className="w-10 h-10 flex items-center justify-center">
                  <X size={20} className="text-brand-blue" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-12">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">Цена</h4>
                    <span className="text-[10px] font-medium text-slate-500">до {priceRange.toLocaleString('ru-RU')} сум</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="5000000" 
                    step="10000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 flex gap-4">
                <button 
                  onClick={resetFilters}
                  className="flex-1 h-14 border border-slate-100 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400"
                >
                  Сбросить
                </button>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-[2] h-14 bg-brand-blue text-white text-[10px] font-bold uppercase tracking-[0.2em]"
                >
                  Показать ({filteredProducts.length})
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><RefreshCw className="animate-spin" /></div>}>
      <ShopContent />
    </Suspense>
  );
}
