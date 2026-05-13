"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, RefreshCw, ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
}

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, pageRes] = await Promise.all([
          fetch("http://localhost:8000/api/v1/products/?limit=8"),
          fetch("http://localhost:8000/api/v1/pages/home")
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
      <div className="py-24 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  const data = content || {
    title: "Новинки.",
    description: "Откройте для себя последние пополнения нашей коллекции, где современный дизайн встречается с непревзойденным качеством."
  };

  return (
    <section className="pt-4 pb-16 md:py-24 bg-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col mb-8 md:mb-12">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-brand-blue uppercase">{data.title}</h2>
            <Link href="/shop" className="text-[10px] md:text-sm font-bold tracking-widest uppercase text-brand-blue border-b border-brand-blue pb-0.5 hover:text-slate-400 hover:border-slate-400 transition-colors">
              Смотреть все
            </Link>
          </div>
          <p className="text-xs md:text-base text-slate-500 max-w-lg leading-relaxed">
            {data.description}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 md:gap-x-6 gap-y-8 md:gap-y-12">
          {products.map((product) => (
            <div key={product.id} className="group relative">
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
                  <div className="absolute top-2 left-2 md:top-4 md:left-4">
                     <span className="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 md:px-2 md:py-1 text-[8px] md:text-[10px] font-bold tracking-widest uppercase text-brand-blue">New</span>
                  </div>
                </div>
              </Link>
              
              <div className="mt-4 md:mt-6 flex justify-between items-start">
                <div className="min-w-0 flex-1 pr-2">
                  <Link href={`/product/${product.id}`}>
                    <p className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-widest mb-0.5 truncate">{product.category}</p>
                    <h3 className="text-[11px] md:text-sm font-bold text-brand-blue uppercase tracking-tight group-hover:text-slate-500 transition-colors truncate">{product.name}</h3>
                  </Link>
                  <p className="mt-0.5 md:mt-1 text-xs md:text-sm text-slate-500 font-medium">
                    {product.price.toLocaleString('ru-RU')} сум
                  </p>
                </div>
                <button className="w-8 h-8 md:w-10 md:h-10 border border-slate-100 flex items-center justify-center text-brand-blue hover:bg-brand-blue hover:text-white transition-all flex-shrink-0">
                  <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
