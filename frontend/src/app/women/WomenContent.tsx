"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { products } from "@/constants/products";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { formatSkuForUrl } from "@/lib/utils";

const subcategories = ["Все", "Верхняя одежда", "Костюмы", "Трикотаж", "Рубашки", "Аксессуары"];

export default function WomenContent() {
  const [activeSub, setActiveSub] = useState("Все");
  const [priceRange, setPriceRange] = useState<number>(100000);
  const [activeSort, setActiveSort] = useState("default");
  const { addItem } = useCart();

  const filteredProducts = useMemo(() => {
    let list = products.filter(p => p.gender === "women" || p.gender === "unisex");
    
    if (activeSub !== "Все") {
      list = list.filter(p => p.category === activeSub);
    }

    list = list.filter(p => {
      const price = parseInt(p.price.replace(/\s/g, "").replace("сум", ""));
      return price <= priceRange;
    });

    if (activeSort === "price-asc") {
      list.sort((a, b) => parseInt(a.price.replace(/\s/g, "")) - parseInt(b.price.replace(/\s/g, "")));
    } else if (activeSort === "price-desc") {
      list.sort((a, b) => parseInt(b.price.replace(/\s/g, "")) - parseInt(a.price.replace(/\s/g, "")));
    }

    return list;
  }, [activeSub, priceRange, activeSort]);

  const resetFilters = () => {
    setActiveSub("Все");
    setPriceRange(100000);
    setActiveSort("default");
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      
      <main className="pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          {/* Breadcrumbs */}
          <div className="mb-16">
            <nav className="flex items-center gap-2 text-[11px] md:text-[13px] tracking-wide text-slate-400 mb-8">
              <Link href="/" className="hover:text-brand-blue transition-colors">Главная</Link>
              <span>/</span>
              <span className="text-brand-blue font-bold">Женщины</span>
            </nav>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-brand-blue uppercase leading-none mb-12">
              Женщины.
            </h1>

            {/* Subcategory Filter (Horizontal) */}
            <div className="flex flex-wrap gap-4 border-b border-slate-100 pb-8">
              {subcategories.map((sub) => (
                <button
                   key={sub}
                   onClick={() => setActiveSub(sub)}
                   className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border ${
                     activeSub === sub 
                     ? "bg-brand-blue text-white border-brand-blue" 
                     : "bg-transparent text-slate-400 border-slate-100 hover:border-slate-300"
                   }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar Filters */}
            <aside className="lg:w-64 flex-shrink-0 space-y-10">
              <div className="flex items-center justify-between lg:border-b lg:border-slate-100 lg:pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-blue flex items-center gap-2">
                  <Filter className="w-3 h-3" /> Фильтры
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest">{filteredProducts.length} Товаров</span>
              </div>

              <div className="hidden lg:block space-y-8">
                {/* Price Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">Цена</h4>
                    <span className="text-[10px] font-medium text-slate-500 tracking-tight">до {priceRange.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} сум</span>
                  </div>
                  <div className="relative pt-2">
                    <input 
                      type="range" 
                      min="0" 
                      max="100000" 
                      step="1000"
                      value={priceRange}
                      onChange={(e) => setPriceRange(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                    />
                    <div className="flex justify-between mt-2 text-[8px] text-slate-300 uppercase tracking-widest">
                       <span>0 сум</span>
                       <span>100к сум</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">Размер</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {["XS", "S", "M", "L", "XL"].map(s => (
                      <button key={s} className="aspect-square border border-slate-100 text-[10px] font-bold hover:border-brand-blue transition-colors">{s}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">Цвет</h4>
                  <div className="flex gap-2">
                    {["bg-black", "bg-slate-200", "bg-stone-400", "bg-navy-900"].map(c => (
                      <button key={c} className={`w-6 h-6 rounded-full ${c} border border-slate-100 hover:scale-110 transition-transform`}></button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                   <button 
                    onClick={resetFilters}
                    className="text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-brand-blue transition-colors"
                   >
                    Сбросить всё
                   </button>
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              <div className="flex justify-end mb-8">
                 <select 
                  value={activeSort}
                  onChange={(e) => setActiveSort(e.target.value)}
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-400 outline-none bg-transparent cursor-pointer"
                 >
                    <option value="default">По умолчанию</option>
                    <option value="price-asc">Сначала дешевле</option>
                    <option value="price-desc">Сначала дороже</option>
                 </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
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
                      <Link href={`/product/${(product as any).sku ? `${formatSkuForUrl((product as any).sku)}-` : ''}${product.id}`}>
                        <div className="relative aspect-[3/4] overflow-hidden bg-slate-50">
                          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-brand-blue/10 z-10" />
                          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-brand-blue/10 z-10" />
                          
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-brand-blue/0 group-hover:bg-brand-blue/5 transition-colors duration-500" />
                          
                          {/* Label as price tag */}
                          <div className="absolute bottom-4 left-4">
                             <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[10px] font-bold tracking-tight text-brand-blue">
                                {product.price}
                             </div>
                          </div>
                        </div>
                      </Link>
                      
                      <div className="mt-6 flex justify-between items-start">
                        <div>
                          <Link href={`/product/${(product as any).sku ? `${formatSkuForUrl((product as any).sku)}-` : ''}${product.id}`}>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">{product.category}</p>
                            <h3 className="text-sm font-bold text-brand-blue tracking-tight group-hover:text-slate-500 transition-colors">{product.name}</h3>
                          </Link>
                          <p className="mt-1 text-sm text-slate-500 font-medium">{product.price}</p>
                        </div>
                        <button 
                          onClick={() => addItem(product)}
                          className="w-10 h-10 border border-slate-100 flex items-center justify-center text-brand-blue hover:bg-brand-blue hover:text-white transition-all"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredProducts.length === 0 && (
                <div className="py-40 text-center">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-slate-300">Товары не найдены</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
