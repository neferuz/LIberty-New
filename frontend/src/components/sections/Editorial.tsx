"use client";

import Image from "next/image";
import { Button } from "@/components/common/Button";
import { ArrowRight, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const imageVariants = {
  hidden: { opacity: 0, x: -40, scale: 1.03 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1] as any, // easeOutExpo
    },
  },
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const textItemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as any,
    },
  },
};

export const Editorial = () => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/v1/pages/home?t=${Date.now()}`);
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
      <section className="pt-2 pb-8 md:py-10 bg-white overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Image Column Skeleton */}
            <div className="relative aspect-square sm:aspect-[4/5] lg:h-[600px] bg-slate-50 animate-pulse rounded flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-brand-blue/30 animate-spin" />
            </div>
            
            {/* Content Column Skeleton */}
            <div className="space-y-6 md:space-y-8 lg:pl-12 animate-pulse">
              <div className="h-3 w-24 bg-slate-100 rounded" />
              <div className="space-y-3">
                <div className="h-8 md:h-12 w-5/6 bg-slate-100 rounded" />
                <div className="h-8 md:h-12 w-2/3 bg-slate-100 rounded" />
              </div>
              <div className="space-y-2 max-w-md">
                <div className="h-4 w-full bg-slate-100 rounded" />
                <div className="h-4 w-4/5 bg-slate-100 rounded" />
              </div>
              <div className="flex gap-4 pt-4">
                <div className="h-12 w-32 bg-slate-100 rounded" />
                <div className="h-12 w-32 bg-slate-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      </section>
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
    <section className="pt-2 pb-8 md:py-10 bg-white overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Animated Image Column */}
          <motion.div 
            variants={imageVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="relative aspect-square sm:aspect-[4/5] lg:aspect-auto lg:h-[700px] overflow-hidden bg-slate-50"
          >
            <Image
              src={data.imageUrl || "/images/editorial_new.jpg"}
              alt="Liberty Wear Editorial"
              fill
              className="object-cover object-center transition-transform duration-[2000ms] hover:scale-105"
            />
            {/* Soft vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 to-transparent pointer-events-none" />
          </motion.div>
          
          {/* Animated Content Column */}
          <motion.div 
            variants={contentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4 md:space-y-8 lg:pl-12"
          >
            <motion.span 
              variants={textItemVariants}
              className="block text-[9px] md:text-[10px] font-bold tracking-[0.4em] uppercase text-slate-400"
            >
              {data.overline}
            </motion.span>
            
            <motion.h2 
              variants={textItemVariants}
              className="text-3xl md:text-6xl font-bold tracking-tighter text-brand-blue uppercase leading-[0.95]"
            >
              {data.title1} <br className="hidden md:block" /> {data.title2}.
            </motion.h2>
            
            <motion.div variants={textItemVariants} className="space-y-4">
              <p className="text-slate-500 text-sm md:text-lg leading-relaxed max-w-md">
                {data.description}
              </p>
            </motion.div>
            
            <motion.div variants={textItemVariants} className="pt-2 md:pt-4 flex flex-wrap gap-4">
              <Link href={data.button1Href || "/shop"} className="flex-1 md:flex-none">
                <Button variant="primary" className="w-full md:w-auto rounded-none px-4 md:px-12 h-10 md:h-12 text-[14px] md:text-base font-medium">
                  {data.button1}
                </Button>
              </Link>
              {data.button2 && (
                <Link href={data.button2Href || "/lookbook"} className="flex-1 md:flex-none">
                  <Button variant="primary" className="w-full md:w-auto rounded-none px-4 md:px-12 h-10 md:h-12 text-[14px] md:text-base font-medium bg-white text-brand-blue hover:bg-brand-blue hover:text-white border border-brand-blue shadow-none duration-300">
                    {data.button2}
                  </Button>
                </Link>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
