"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { products } from "@/constants/products";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { formatSkuForUrl } from "@/lib/utils";

interface CategoryContentProps {
  slug: string;
  categoryTitle: string;
}

export function CategoryContent({ slug, categoryTitle }: CategoryContentProps) {
  const { addItem } = useCart();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.category.toLowerCase() === categoryTitle.toLowerCase() || 
      p.subcategory?.toLowerCase() === categoryTitle.toLowerCase() ||
      p.category.toLowerCase() === slug.toLowerCase()
    );
  }, [categoryTitle, slug]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-20 md:pt-32 pb-24 relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
          {/* Header */}
          <div className="mb-8 md:mb-16">
            <div className="flex flex-row items-end justify-between gap-4 border-b border-slate-100 pb-6 md:pb-12">
              <div>
                <span className="text-[8px] md:text-[10px] font-bold text-brand-blue uppercase tracking-[0.5em] block mb-2 md:mb-4">Категория</span>
                <h1 className="text-3xl md:text-8xl font-bold tracking-tighter text-brand-blue uppercase leading-none">
                  {categoryTitle}.
                </h1>
              </div>
              <div className="text-right pb-1">
                <span className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-widest block mb-0.5 md:mb-2">Всего</span>
                <span className="text-lg md:text-2xl font-bold text-brand-blue">{filteredProducts.length}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
            {/* Desktop Sidebar / Filters */}
            <div className="hidden lg:block lg:w-64 flex-shrink-0">
               <div className="sticky top-32 space-y-12">
                  <div className="space-y-4">
                     <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-blue flex items-center gap-2">
                        <Filter className="w-3 h-3" /> Фильтры
                     </h3>
                     <div className="h-[1px] bg-slate-100 w-full" />
                  </div>
                  
                  <div className="space-y-8">
                     <div className="space-y-4">
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Гендер</p>
                        <div className="space-y-2">
                           {["Женщины", "Мужчины"].map(g => (
                             <label key={g} className="flex items-center gap-3 cursor-pointer group">
                                <div className="w-4 h-4 border border-slate-200 group-hover:border-brand-blue transition-colors flex items-center justify-center">
                                   <div className="w-1.5 h-1.5 bg-brand-blue opacity-0 group-hover:opacity-20 transition-opacity" />
                                </div>
                                <span className="text-[10px] uppercase tracking-widest text-slate-500 group-hover:text-brand-blue transition-colors">{g}</span>
                             </label>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-4">
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Материал</p>
                        <div className="space-y-2">
                           {["Шерсть", "Хлопок", "Кашемир"].map(m => (
                             <label key={m} className="flex items-center gap-3 cursor-pointer group">
                                <div className="w-4 h-4 border border-slate-200 group-hover:border-brand-blue transition-colors flex items-center justify-center">
                                   <div className="w-1.5 h-1.5 bg-brand-blue opacity-0 group-hover:opacity-20 transition-opacity" />
                                </div>
                                <span className="text-[10px] uppercase tracking-widest text-slate-500 group-hover:text-brand-blue transition-colors">{m}</span>
                             </label>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-16">
                {filteredProducts.map((product) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    key={product.id} 
                    className="group relative"
                  >
                    <Link href={`/product/${(product as any).sku ? `${formatSkuForUrl((product as any).sku)}-` : ''}${product.id}`}>
                      <div className="relative aspect-[3/4] overflow-hidden bg-slate-50">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-brand-blue/0 group-hover:bg-brand-blue/5 transition-colors duration-500" />
                      </div>
                    </Link>
                    
                    <div className="mt-4 md:mt-8 flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <Link href={`/product/${(product as any).sku ? `${formatSkuForUrl((product as any).sku)}-` : ''}${product.id}`}>
                          <p className="text-[7px] md:text-[9px] text-slate-400 uppercase tracking-widest mb-0.5 truncate">
                            {product.gender === 'women' ? 'Для женщин' : 'Для мужчин'}
                          </p>
                          <h3 className="text-[10px] md:text-xs font-bold text-brand-blue uppercase tracking-tight group-hover:text-slate-500 transition-colors truncate">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="mt-1 md:mt-2 text-xs md:text-sm text-slate-900 font-bold tracking-tighter">{product.price}</p>
                      </div>
                      <button 
                        onClick={() => addItem(product)}
                        className="w-8 h-8 md:w-11 md:h-11 border border-slate-100 flex items-center justify-center text-brand-blue hover:bg-brand-blue hover:text-white transition-all flex-shrink-0"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="py-16 md:py-24 text-center border border-dashed border-slate-100">
                   <p className="text-[9px] md:text-[10px] text-slate-400 uppercase tracking-widest">В этой категории пока нет товаров</p>
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
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Гендер</p>
                  <div className="grid grid-cols-2 gap-3">
                    {["Женщины", "Мужчины"].map(g => (
                      <button 
                        key={g}
                        className="h-12 border border-slate-100 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:border-brand-blue hover:text-brand-blue transition-all"
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Материал</p>
                  <div className="grid grid-cols-2 gap-3">
                    {["Шерсть", "Хлопок", "Кашемир", "Шелк", "Лен"].map(m => (
                      <button 
                        key={m}
                        className="h-12 border border-slate-100 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:border-brand-blue hover:text-brand-blue transition-all"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100">
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full h-14 bg-brand-blue text-white text-[10px] font-bold uppercase tracking-[0.2em]"
                >
                  Применить
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
