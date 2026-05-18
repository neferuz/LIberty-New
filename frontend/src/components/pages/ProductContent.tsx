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
import { cn, formatSkuForUrl } from "@/lib/utils";

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
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showSizeError, setShowSizeError] = useState(false);
  
  // Set initial image and URL based on variants
  useEffect(() => {
    if (product) {
      if (product.variants && product.variants.length > 0) {
        const firstColor = product.variants[0].color;
        setSelectedColor(firstColor);
        const firstColorImages = product.variants[0].images;
        if (firstColorImages && firstColorImages.length > 0) {
          setSelectedImage(firstColorImages[0]);
        } else {
          setSelectedImage(product.image_url);
        }
      } else {
        setSelectedColor("");
        setSelectedImage(product.image_url);
      }
    }
    if (typeof window !== 'undefined') setCurrentUrl(window.location.href);
  }, [product]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setSelectedSize(null); // Reset size selection for safety
    setShowSizeError(false);
    const variant = product.variants?.find((v: any) => v.color === color);
    if (variant && variant.images && variant.images.length > 0) {
      setSelectedImage(variant.images[0]);
    } else {
      setSelectedImage(product.image_url);
    }
  };

  const copyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeVariant = product.variants?.find((v: any) => v.color === selectedColor) || null;

  const allImages = activeVariant?.images && activeVariant.images.length > 0
    ? activeVariant.images
    : (product.images 
        ? product.images.split(",").filter((img: string) => img.trim() !== "") 
        : [product.image_url].filter(Boolean));

  const sizes = activeVariant?.sizes && activeVariant.sizes.length > 0
    ? activeVariant.sizes
    : (product.sizes ? product.sizes.split(",").map((s: string) => s.trim()) : []);

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
                  {currentUrl}
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

      <main className="pt-12 md:pt-20 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          {/* Breadcrumbs */}
          <nav className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-3 md:mb-6">
            <Link href="/" className="hover:text-brand-blue transition-colors">Главная</Link>
            <ChevronRight className="w-3 h-3 opacity-50" />
            <Link href="/shop" className="hover:text-brand-blue transition-colors">Магазин</Link>
            <ChevronRight className="w-3 h-3 opacity-50" />
            <span className="text-brand-blue font-bold truncate max-w-[150px]">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
            {/* Product Images */}
            <div className="lg:col-span-7 space-y-3 md:space-y-5 relative">
              <motion.div 
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative aspect-[4/5] bg-slate-50 overflow-hidden cursor-zoom-in"
                onClick={() => setIsLightboxOpen(true)}
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
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#f7f8f9] text-slate-300 gap-2">
                    <ImageIcon className="w-12 h-12 opacity-20" />
                    <span className="text-xs font-bold uppercase tracking-widest">Нет фото</span>
                  </div>
                )}
              </motion.div>
              
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2 md:gap-4">
                  {allImages.map((img: string, i: number) => (
                    <button 
                      key={i} 
                      onClick={() => setSelectedImage(img)}
                      className={cn(
                        "aspect-[4/5] relative overflow-hidden border transition-all",
                        selectedImage === img ? "border-brand-blue opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                        <Image src={img} alt={product.name} fill className="object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 h-fit">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 md:space-y-5"
              >
                <div>
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-slate-400 block mb-1.5 md:mb-2">{product.category}</span>
                  <h1 className="text-xl md:text-4xl font-bold tracking-tighter text-brand-blue uppercase leading-[0.95] mb-3 md:mb-4">
                    {product.name}
                  </h1>
                  <p className="text-lg md:text-xl font-medium text-slate-600 tracking-tight">
                    {product.price.toLocaleString('ru-RU')} сум
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1.5">Арт: <span className="notranslate" translate="no">{product.sku}</span></p>
                </div>

                {product.description && (
                  <div className="pt-4 md:pt-5 border-t border-slate-100">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-brand-blue">Описание</h4>
                    <div className="text-slate-500 leading-relaxed text-xs md:text-sm max-w-md">
                      <p>{product.description}</p>
                    </div>
                  </div>
                )}
                
                {product.characteristics && Object.keys(product.characteristics).length > 0 && (
                  <div className="pt-4 md:pt-5 border-t border-slate-100/60">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2.5 text-brand-blue">Характеристики</h4>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs md:text-sm text-slate-600">
                      {Object.entries(product.characteristics).map(([key, val]: [string, any]) => (
                        <div key={key} className="contents">
                          <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider text-slate-400 py-1.5 border-b border-slate-50">{key}</span>
                          <span className="text-slate-600 py-1.5 border-b border-slate-50 truncate">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selector */}
                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-2 pt-4 md:pt-5 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-blue block">Цвет</span>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {product.variants.map((v: any) => {
                        const isSelected = selectedColor === v.color;
                        
                        let dotColorClass = "bg-slate-300";
                        const lowerColor = v.color.toLowerCase();
                        if (lowerColor.includes("navy") || lowerColor.includes("синий")) dotColorClass = "bg-[#1B2A47]";
                        else if (lowerColor.includes("black") || lowerColor.includes("черный")) dotColorClass = "bg-[#1A1A1A]";
                        else if (lowerColor.includes("white") || lowerColor.includes("белый")) dotColorClass = "bg-[#FFFFFF] border border-slate-200";
                        else if (lowerColor.includes("grey") || lowerColor.includes("серый")) dotColorClass = "bg-[#9E9E9E]";
                        else if (lowerColor.includes("red") || lowerColor.includes("красный")) dotColorClass = "bg-[#C62828]";
                        else if (lowerColor.includes("beige") || lowerColor.includes("бежевый")) dotColorClass = "bg-[#D7CCC8]";
                        else if (lowerColor.includes("green") || lowerColor.includes("зеленый")) dotColorClass = "bg-[#2E7D32]";
                        
                        return (
                          <button
                            key={v.color}
                            onClick={() => handleColorChange(v.color)}
                            className={cn(
                              "flex items-center gap-2 px-3 md:px-4 py-2 border transition-all text-[9px] md:text-[10px] uppercase font-bold tracking-widest rounded-none",
                              isSelected 
                                ? "border-brand-blue bg-slate-50 text-brand-blue" 
                                : "border-slate-100 text-slate-500 hover:border-slate-200 hover:text-slate-700"
                            )}
                          >
                            <span className={cn("w-2.5 h-2.5 rounded-full block", dotColorClass)} />
                            {v.color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                {sizes.length > 0 && (
                  <div className="space-y-2 pt-4 md:pt-5 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">Размер</span>
                      <button className="text-[8px] md:text-[9px] uppercase tracking-widest text-slate-400 underline underline-offset-4">Таблица</button>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {sizes.map((size: string) => (
                        <button 
                          key={size} 
                          onClick={() => {
                            setSelectedSize(size);
                            setShowSizeError(false);
                          }}
                          className={cn(
                            "min-w-[40px] md:min-w-[48px] h-10 md:h-12 border flex items-center justify-center text-[10px] md:text-xs font-bold transition-all px-3",
                            selectedSize === size 
                              ? "border-brand-blue bg-brand-blue text-white" 
                              : cn("border-slate-100 text-slate-500 hover:border-slate-300", showSizeError && "border-red-400 text-red-500 bg-red-50/10")
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    {showSizeError && (
                      <motion.p 
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[9px] md:text-[10px] text-red-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-1"
                      >
                        <span>⚠️ Пожалуйста, выберите размер перед добавлением в корзину</span>
                      </motion.p>
                    )}
                  </div>
                )}

                <div className="flex flex-row gap-3 pt-1">
                  <Button 
                    size="lg" 
                    className="flex-1 rounded-none h-12 md:h-14 uppercase tracking-widest font-bold text-[10px] md:text-xs"
                    onClick={() => {
                      if (sizes.length > 0 && !selectedSize) {
                        setShowSizeError(true);
                        return;
                      }
                      setShowSizeError(false);
                      addItem({
                        id: product.id,
                        name: selectedColor && product.name.includes(selectedColor)
                          ? product.name
                          : product.name + (selectedColor ? ` (${selectedColor})` : ""),
                        price: product.price.toLocaleString('ru-RU') + " сум",
                        image: selectedImage || product.image_url || "/images/placeholder.jpg",
                        category: product.category,
                        size: selectedSize,
                        color: selectedColor
                      });
                    }}
                  >
                    В корзину
                    <ShoppingBag className="ml-2 w-3.5 h-3.5 md:w-4 md:h-4" />
                  </Button>
                </div>

                <div className="pt-4 md:pt-5 border-t border-slate-100 flex items-center gap-6 md:gap-8">
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
                  <Link href={`/product/${item.sku ? `${formatSkuForUrl(item.sku)}-` : ''}${item.id}`} key={item.id} className="group">
                    <div className="relative aspect-[3/4] overflow-hidden bg-slate-50 mb-3 md:mb-6">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-contain transition-transform duration-700 group-hover:scale-105"
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

      {/* Lightbox / Zoom-in Modal Overlay */}
      <AnimatePresence>
        {isLightboxOpen && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-8 cursor-zoom-out"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Minimalist Top Bar decoration */}
            <div className="absolute top-6 left-6 text-white/40 font-semibold text-[10px] uppercase tracking-[0.3em] select-none pointer-events-none hidden md:block">
              <span className="notranslate" translate="no">{product.name} / Арт: {product.sku}</span>
            </div>
            
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-white/70 hover:text-white transition-all border border-white/10 hover:border-white/30 rounded-none bg-black/40 backdrop-blur-md z-[110]"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="relative w-full h-full max-w-4xl max-h-[65vh] md:max-h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                className="object-contain select-none"
                sizes="100vw"
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
