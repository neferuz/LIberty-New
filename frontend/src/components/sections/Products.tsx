"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, RefreshCw, ImageIcon } from "lucide-react";
import { formatSkuForUrl } from "@/lib/utils";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as any, // easeOutExpo
    },
  },
};

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  sku: string;
  images?: string | null;
}

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, pageRes] = await Promise.all([
          fetch(`/api/v1/products?limit=8&t=${Date.now()}`),
          fetch(`/api/v1/pages/home?t=${Date.now()}`)
        ]);
        
        if (prodRes.ok) setProducts(await prodRes.json());
        if (pageRes.ok) {
          const data = await pageRes.json();
          setContent(data.data.newArrivals);
        }
      } catch (err) {
        console.error("Failed to fetch products data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading && products.length === 0) {
    return (
      <section className="pt-2 pb-8 md:py-10 bg-white relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
        <div className="container mx-auto px-6 max-w-7xl relative z-10 animate-pulse">
          {/* Header Skeleton */}
          <div className="max-w-2xl space-y-4 mb-10">
            <div className="h-8 md:h-10 w-1/3 bg-slate-100 rounded" />
            <div className="h-4 w-2/3 bg-slate-100 rounded" />
          </div>
          
          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 md:gap-x-6 gap-y-8 md:gap-y-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[3/4] bg-slate-50 rounded flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full border border-slate-200 border-t-brand-blue/30 animate-spin" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-5/6 bg-slate-100 rounded" />
                  <div className="h-3 w-1/3 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const data = content || {
    title: "Новинки.",
    description: "Откройте для себя последние пополнения нашей коллекции, где современный дизайн встречается с непревзойденным качеством."
  };

  return (
    <section className="pt-2 pb-8 md:py-10 bg-white relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col mb-8 md:mb-12"
        >
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-brand-blue uppercase">{data.title}</h2>
            <Link href="/shop" className="text-[10px] md:text-sm font-bold tracking-widest uppercase text-brand-blue border-b border-brand-blue pb-0.5 hover:text-slate-400 hover:border-slate-400 transition-colors">
              Смотреть все
            </Link>
          </div>
          <p className="text-xs md:text-base text-slate-500 max-w-lg leading-relaxed">
            {data.description}
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 md:gap-x-6 gap-y-8 md:gap-y-12"
        >
          {products.map((product) => (
            <motion.div 
              variants={itemVariants}
              key={product.id} 
              className="group relative"
            >
              <Link href={`/product/${product.sku ? `${formatSkuForUrl(product.sku)}-` : ''}${product.id}`}>
                <div className="relative aspect-[3/4] overflow-hidden bg-slate-50">
                  {(() => {
                    const productImages = product.images ? product.images.split(',') : [];
                    const primaryImage = product.image_url || (productImages.length > 0 ? productImages[0] : null);
                    const secondaryImage = productImages.length > 1 ? productImages[1] : null;

                    if (!primaryImage) {
                      return (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#f7f8f9] text-brand-blue/30 gap-2">
                          <ImageIcon className="w-5 h-5 opacity-40" />
                          <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em]">Нет фото</span>
                        </div>
                      );
                    }

                    return (
                      <>
                        <Image
                          src={primaryImage}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className={`object-contain transition-all duration-1000 ease-out group-hover:scale-105 ${
                            secondaryImage ? "opacity-100 group-hover:opacity-0" : ""
                          }`}
                        />
                        {secondaryImage && (
                          <Image
                            src={secondaryImage}
                            alt={`${product.name} alternate`}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className="object-contain absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-1000 ease-out group-hover:scale-105"
                          />
                        )}
                      </>
                    );
                  })()}
                  <div className="absolute inset-0 bg-brand-blue/0 group-hover:bg-brand-blue/5 transition-colors duration-500" />
                  {/* Elegant internal luxury frame overlay */}
                  <div className="absolute inset-2 border border-white/0 group-hover:border-white/20 transition-all duration-700 pointer-events-none z-10 scale-95 group-hover:scale-100" />
                  <div className="absolute top-2 left-2 md:top-4 md:left-4">
                     <span className="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 md:px-2 md:py-1 text-[8px] md:text-[10px] font-bold tracking-widest uppercase text-brand-blue">New</span>
                  </div>
                </div>
              </Link>
              
              <div className="mt-4 md:mt-6 flex justify-between items-start">
                <div className="min-w-0 flex-1 pr-2">
                  <Link href={`/product/${product.sku ? `${formatSkuForUrl(product.sku)}-` : ''}${product.id}`}>
                    <p className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-widest mb-0.5 truncate">{product.category}</p>
                    <h3 className="text-[11px] md:text-sm font-bold text-brand-blue uppercase tracking-tight group-hover:text-slate-400 transition-colors truncate">{product.name}</h3>
                  </Link>
                  <p className="mt-0.5 md:mt-1 text-xs md:text-sm text-slate-500 font-medium">
                    {product.price.toLocaleString('ru-RU')} сум
                  </p>
                </div>
                <button className="w-8 h-8 md:w-10 md:h-10 border border-slate-100 flex items-center justify-center text-brand-blue hover:bg-brand-blue hover:text-white transition-all flex-shrink-0 rounded-none active:scale-95 duration-300">
                  <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
