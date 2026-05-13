"use client";

import Image from "next/image";
import { Button } from "@/components/common/Button";
import { ArrowRight, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export const Editorial = () => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/pages/home");
        if (res.ok) {
          const data = await res.json();
          setContent(data.data.editorial);
        }
      } catch (err) {
        console.error("Failed to fetch editorial content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading && !content) {
    return (
      <div className="py-24 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  // Fallback if data is missing
  const data = content || {
    overline: "Наше Наследие",
    title1: "Переосмысление",
    title2: "Современной Униформы",
    description: "Liberty Wear родился из желания создать гардероб, который был бы одновременно функциональным и выразительным.",
    button1: "Наша история",
    button2: "Лукбук",
    imageUrl: "/images/editorial_new.jpg"
  };

  return (
    <section className="pt-4 pb-16 md:py-24 bg-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="relative aspect-square sm:aspect-[4/5] lg:aspect-auto lg:h-[700px] overflow-hidden">
            <Image
              src={data.imageUrl || "/images/editorial_new.jpg"}
              alt="Liberty Wear Editorial"
              fill
              className="object-cover object-center"
            />
          </div>
          
          <div className="space-y-4 md:space-y-8 lg:pl-12">
            <span className="text-[9px] md:text-[10px] font-bold tracking-[0.4em] uppercase text-slate-400">{data.overline}</span>
            <h2 className="text-3xl md:text-6xl font-bold tracking-tighter text-brand-blue uppercase leading-[0.95]">
              {data.title1} <br className="hidden md:block" /> {data.title2}.
            </h2>
            <div className="space-y-4">
              <p className="text-slate-500 text-sm md:text-lg leading-relaxed max-w-md">
                {data.description}
              </p>
            </div>
            <div className="pt-2 md:pt-4 flex flex-wrap gap-4">
              <Link href="/shop" className="flex-1 md:flex-none">
                <Button variant="primary" className="w-full md:w-auto rounded-none px-10 md:px-12 h-10 md:h-12 text-[14px] md:text-base font-medium">
                  {data.button1}
                </Button>
              </Link>
              {data.button2 && (
                <Link href="/lookbook" className="flex-1 md:flex-none">
                  <Button variant="primary" className="w-full md:w-auto rounded-none px-10 md:px-12 h-10 md:h-12 text-[14px] md:text-base font-medium bg-white text-brand-blue hover:bg-brand-blue hover:text-white border border-brand-blue shadow-none">
                    {data.button2}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
