"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/common/Button";
import { ShoppingBag, Heart, Share2, ChevronRight, X, ImageIcon, ArrowLeft, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProductContentProps {
  product: any;
  recommended: any[];
}

export function ProductContent({ product, recommended }: ProductContentProps) {
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  
  // Set initial image
  useEffect(() => {
    if (product) setSelectedImage(product.image_url);
  }, [product]);

  const copyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sizes = product.sizes ? product.sizes.split(",").map((s: string) => s.trim()) : [];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="fixed inset-0 bg-brand-blue/40 backdrop-blur-sm z-[200] cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white p-8 z-[210] shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-brand-blue">Поделиться</h3>
                <button onClick={() => setIsShareModalOpen(false)}><X className="w-4 h-4" /></button>
              </div>
              <p className="text-xs text-slate-500 mb-6 uppercase tracking-widest leading-relaxed">
                Поделитесь этой вещью с друзьями или сохраните ссылку для себя.
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 border border-slate-100 px-4 py-3 text-[10px] text-slate-400 truncate uppercase tracking-widest">
                  {typeof window !== 'undefined' ? window.location.href : ''}
                </div>
                <button 
                  onClick={copyLink}
                  className="bg-brand-blue text-white px-6 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors"
                >
                  {copied ? "Готово" : "Копировать"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="pt-20 md:pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          {/* Breadcrumbs */}
          <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-8 md:mb-12">
            <Link href="/" className="hover:text-brand-blue transition-colors">Главная</Link>
            <ChevronRight className="w-3 h-3 opacity-50" />
            <Link href="/shop" className="hover:text-brand-blue transition-colors">Магазин</Link>
            <ChevronRight className="w-3 h-3 opacity-50" />
            <span className="text-brand-blue font-bold truncate max-w-[150px]">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
            {/* Product Images */}
            <div className="lg:col-span-7 space-y-4 md:space-y-8 relative">
              <motion.div 
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative aspect-[4/5] bg-slate-50 overflow-hidden"
              >
                {/* Architectural Decor */}
                <div className="absolute top-0 left-0 w-6 h-6 md:w-8 md:h-8 border-t border-l border-brand-blue/20 z-10" />
                <div className="absolute top-0 right-0 w-6 h-6 md:w-8 md:h-8 border-t border-r border-brand-blue/20 z-10" />
                <div className="absolute bottom-0 left-0 w-6 h-6 md:w-8 md:h-8 border-b border-l border-brand-blue/20 z-10" />
                <div className="absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 border-b border-r border-brand-blue/20 z-10" />
                
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#f7f8f9] text-slate-300 gap-2">
                    <ImageIcon className="w-12 h-12 opacity-20" />
                    <span className="text-xs font-bold uppercase tracking-widest">Нет фото</span>
                  </div>
                )}
              </motion.div>
              
              {product.image_url && (
                <div className="grid grid-cols-4 gap-2 md:gap-4">
                  {[product.image_url].map((img, i) => (
                    <button 
                      key={i} 
                      onClick={() => setSelectedImage(img)}
                      className={cn(
                        "aspect-[4/5] relative overflow-hidden border transition-all",
                        selectedImage === img ? "border-brand-blue opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                        <Image src={img} alt={product.name} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="lg:col-span-5 lg:sticky lg:top-32 h-fit">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 md:space-y-8"
              >
                <div>
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-slate-400 block mb-2 md:mb-4">{product.category}</span>
                  <h1 className="text-2xl md:text-5xl font-bold tracking-tighter text-brand-blue uppercase leading-[0.95] mb-4 md:mb-6">
                    {product.name}
                  </h1>
                  <p className="text-xl md:text-2xl font-medium text-slate-600 tracking-tight">
                    {product.price.toLocaleString('ru-RU')} сум
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">Арт: {product.sku}</p>
                </div>

                <div className="pt-6 md:pt-8 border-t border-slate-100">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-brand-blue">Описание</h4>
                  <div className="text-slate-500 leading-relaxed text-xs md:text-sm max-w-md space-y-4">
                    <p>{product.description || "Минималистичный дизайн, вдохновленный современными архитектурными формами. Каждая деталь продумана для обеспечения идеального баланса комфорта и стиля."}</p>
                    {product.composition && (
                      <div>
                        <span className="font-bold text-brand-blue mr-2">СОСТАВ:</span>
                        <span>{product.composition}</span>
                      </div>
                    )}
                  </div>
                  <ul className="mt-4 md:mt-6 space-y-1.5 text-[9px] md:text-[11px] text-slate-400 uppercase tracking-widest">
                    <li>• Премиальные материалы</li>
                    <li>• Идеальная посадка</li>
                    <li>• Тщательная проработка деталей</li>
                  </ul>
                </div>

                {/* Size Selector */}
                {sizes.length > 0 && (
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">Размер</span>
                      <button className="text-[8px] md:text-[9px] uppercase tracking-widest text-slate-400 underline underline-offset-4">Таблица</button>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {sizes.map((size: string) => (
                        <button 
                          key={size} 
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            "min-w-[40px] md:min-w-[48px] h-10 md:h-12 border flex items-center justify-center text-[10px] md:text-xs font-bold transition-all px-3",
                            selectedSize === size 
                              ? "border-brand-blue bg-brand-blue text-white" 
                              : "border-slate-100 text-slate-500 hover:border-slate-300"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-row gap-3 pt-2">
                  <Button 
                    size="lg" 
                    className="flex-1 rounded-none h-12 md:h-14 uppercase tracking-widest font-bold text-[10px] md:text-xs"
                    onClick={() => addItem({
                      id: product.id,
                      name: product.name,
                      price: product.price.toLocaleString('ru-RU') + " сум",
                      image: product.image_url || "/images/placeholder.jpg",
                      category: product.category,
                      size: selectedSize
                    })}
                  >
                    В корзину
                    <ShoppingBag className="ml-2 w-3.5 h-3.5 md:w-4 md:h-4" />
                  </Button>
                  <button className="w-12 h-12 md:w-14 md:h-14 border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors group">
                    <Heart className="w-4 h-4 md:w-5 md:h-5 text-brand-blue group-hover:fill-brand-blue transition-all" />
                  </button>
                </div>

                <div className="pt-6 md:pt-8 border-t border-slate-100 flex items-center gap-6 md:gap-8">
                   <button 
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center gap-1.5 text-[9px] md:text-[10px] uppercase tracking-widest text-slate-400 hover:text-brand-blue transition-colors"
                   >
                      <Share2 className="w-3 h-3 md:w-3.5 md:h-3.5" /> Поделиться
                   </button>
                   <Link href="/delivery" className="text-[9px] md:text-[10px] uppercase tracking-widest text-slate-400 hover:text-brand-blue transition-colors underline underline-offset-4">
                      Доставка
                   </Link>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Recommended Section */}
          {recommended.length > 0 && (
            <div className="mt-24 md:mt-48 pt-16 md:pt-24 border-t border-slate-100 relative">
              <div className="flex justify-between items-end mb-8 md:mb-16 relative z-10">
                <div className="w-full lg:w-auto text-left">
                  <h2 className="text-xl md:text-3xl font-bold tracking-tight text-brand-blue uppercase mb-2 md:mb-4">Вам может понравиться.</h2>
                  <p className="text-xs md:text-slate-500 max-w-lg">Дополните свой образ нашими кураторскими рекомендациями.</p>
                </div>
                <div className="hidden lg:flex gap-4">
                  <button className="w-12 h-12 border border-slate-100 flex items-center justify-center text-brand-blue hover:bg-slate-50 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button className="w-12 h-12 border border-slate-100 flex items-center justify-center text-brand-blue hover:bg-slate-50 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 relative z-10">
                {recommended.map((item) => (
                  <Link href={`/product/${item.id}`} key={item.id} className="group">
                    <div className="relative aspect-[3/4] overflow-hidden bg-slate-50 mb-3 md:mb-6">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#f7f8f9] text-slate-300 gap-2">
                          <ImageIcon className="w-6 h-6 opacity-20" />
                          <span className="text-[8px] font-bold uppercase tracking-widest">Нет фото</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-brand-blue/0 group-hover:bg-brand-blue/5 transition-colors duration-500" />
                    </div>
                    <div>
                      <h3 className="text-[10px] md:text-sm font-bold text-brand-blue uppercase tracking-tight group-hover:text-slate-500 transition-colors truncate">{item.name}</h3>
                      <p className="mt-0.5 md:mt-1 text-xs text-slate-500">{item.price.toLocaleString('ru-RU')} сум</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
