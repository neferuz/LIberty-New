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
import { formatSkuForUrl } from "@/lib/utils";

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  image_url: string | null;
  category: string;
  category_id: number;
  images?: string | null;
}

interface Category {
  id: string;
  name: string;
  count: number;
  parent_id?: string | number | null;
}

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(initialCategory || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<number>(1000000);
  const [activeSort, setActiveSort] = useState("default");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { addItem } = useCart();

  const selectCategory = (id: string) => {
    setActiveCategoryId(id);
    setIsFilterOpen(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const catId = searchParams.get("category");
    setActiveCategoryId(catId || "all");
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/v1/products?limit=500"),
        fetch("/api/v1/products/categories")
      ]);
      
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
        if (prodData.length > 0) {
          const max = Math.max(100000, ...prodData.map((p: Product) => p.price));
          setPriceRange(max);
        }
      }
      if (catRes.ok) setCategories(await catRes.json());
      
    } catch (err) {
      console.error("Failed to fetch shop data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Dynamically calculate the maximum price of available products
  const maxPrice = useMemo(() => {
    if (products.length === 0) return 1000000;
    return Math.max(100000, ...products.map(p => p.price));
  }, [products]);

  // Find category path to highlight active branches (cyclic-safe)
  const categoryPath = useMemo(() => {
    if (activeCategoryId === "all") return [];
    
    const path: any[] = [];
    const visited = new Set<string>();
    let current: Category | undefined = categories.find(c => String(c.id) === String(activeCategoryId));
    while (current) {
      if (visited.has(String(current.id))) {
        console.warn("Circular category reference detected in categoryPath for:", current.id);
        break;
      }
      visited.add(String(current.id));
      path.unshift(current);
      const pid = current.parent_id;
      current = pid ? categories.find(c => String(c.id) === String(pid)) : undefined;
    }
    return path;
  }, [activeCategoryId, categories]);

  // Tier 1: Root Categories (No parent ID)
  const rootCategories = useMemo(() => {
    return categories.filter(c => !c.parent_id);
  }, [categories]);

  // Tier 2: Sub-categories of active root
  const subCategories = useMemo(() => {
    const activeRoot = categoryPath[0];
    if (!activeRoot) return [];
    return categories.filter(c => String(c.parent_id) === String(activeRoot.id));
  }, [categories, categoryPath]);

  // Tier 3: Sub-sub-categories of active sub-category
  const subSubCategories = useMemo(() => {
    const activeSub = categoryPath[1];
    if (!activeSub) return [];
    return categories.filter(c => String(c.parent_id) === String(activeSub.id));
  }, [categories, categoryPath]);

  // A helper function to recursively find all sub-category IDs for a selected category (cyclic-safe)
  const getCategoryDescendants = useMemo(() => {
    const getDescendants = (catId: string, visited = new Set<string>()): string[] => {
      if (visited.has(String(catId))) {
        return [];
      }
      visited.add(String(catId));
      const descendants: string[] = [catId];
      const children = categories.filter(c => String(c.parent_id) === String(catId));
      for (const child of children) {
        descendants.push(...getDescendants(child.id, visited));
      }
      return descendants;
    };
    return (catId: string) => getDescendants(catId, new Set<string>());
  }, [categories]);

  const filteredProducts = useMemo(() => {
    // Find all matching category IDs recursively
    const activeIds = activeCategoryId === "all"
      ? []
      : getCategoryDescendants(activeCategoryId).map(id => parseInt(id));

    let list = products.filter(p => {
      const matchesCategory = activeCategoryId === "all" || activeIds.includes(p.category_id);
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
  }, [products, activeCategoryId, searchQuery, priceRange, activeSort, getCategoryDescendants]);

  const resetFilters = () => {
    setActiveCategoryId("all");
    setSearchQuery("");
    setPriceRange(maxPrice);
    setIsFilterOpen(false);
  };

  // Helper to render the collapsible vertical category tree
  const renderCategoryTree = () => {
    return (
      <div className="space-y-3 font-sans text-left">
        <div>
          <button
            onClick={() => selectCategory("all")}
            className={`w-full text-left text-[10px] font-semibold uppercase tracking-wide py-1 border-b border-brand-blue/5 transition-all ${
              activeCategoryId === "all" ? "text-brand-blue font-bold" : "text-brand-blue/40 hover:text-brand-blue"
            }`}
          >
            Все коллекции
          </button>
        </div>
        
        {rootCategories.map((root) => {
          const isRootActive = categoryPath.some(p => String(p.id) === String(root.id));
          const rootChildren = categories.filter(c => String(c.parent_id) === String(root.id));
          
          return (
            <div key={root.id} className="space-y-1">
              <button
                onClick={() => selectCategory(root.id)}
                className={`w-full text-left text-[10px] font-semibold uppercase tracking-wide py-1 flex items-center justify-between transition-all ${
                  isRootActive ? "text-brand-blue font-bold" : "text-brand-blue/50 hover:text-brand-blue"
                }`}
              >
                <span>{root.name}</span>
              </button>
              
              {rootChildren.length > 0 && (
                <div className="pl-3 border-l border-brand-blue/10 ml-1 py-0.5 space-y-1">
                  <button
                    onClick={() => selectCategory(root.id)}
                    className={`w-full text-left text-[9px] font-medium uppercase tracking-wide py-0.5 block transition-all ${
                      String(activeCategoryId) === String(root.id) ? "text-brand-blue font-bold" : "text-brand-blue/40 hover:text-brand-blue"
                    }`}
                  >
                    Все в {root.name}
                  </button>

                  {rootChildren.map((sub) => {
                    const isSubActive = categoryPath.some(p => String(p.id) === String(sub.id));
                    const subChildren = categories.filter(c => String(c.parent_id) === String(sub.id));
                    
                    return (
                      <div key={sub.id} className="space-y-0.5">
                        <button
                          onClick={() => selectCategory(sub.id)}
                          className={`w-full text-left text-[9px] font-medium uppercase tracking-wide py-0.5 flex items-center justify-between transition-all ${
                            isSubActive ? "text-brand-blue font-bold" : "text-brand-blue/40 hover:text-brand-blue"
                          }`}
                        >
                          <span>{sub.name}</span>
                        </button>
                        
                        {subChildren.length > 0 && (
                          <div className="pl-3 border-l border-brand-blue/10 ml-0.5 py-0.5 space-y-0.5">
                            <button
                              onClick={() => selectCategory(sub.id)}
                              className={`w-full text-left text-[8px] font-medium uppercase tracking-wide py-0.5 block transition-all ${
                                String(activeCategoryId) === String(sub.id) ? "text-brand-blue font-bold" : "text-brand-blue/40 hover:text-brand-blue"
                              }`}
                            >
                              Все в {sub.name}
                            </button>

                            {subChildren.map((subsub) => (
                              <button
                                key={subsub.id}
                                onClick={() => selectCategory(subsub.id)}
                                className={`w-full text-left text-[8px] font-medium uppercase tracking-wide py-0.5 block transition-all ${
                                  String(activeCategoryId) === String(subsub.id) ? "text-brand-blue font-bold" : "text-brand-blue/40 hover:text-brand-blue"
                                }`}
                              >
                                {subsub.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-20 md:pt-32 pb-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
          <div className="container mx-auto px-6 max-w-7xl relative z-10 animate-pulse">
            
            {/* Breadcrumbs and Title Skeleton */}
            <div className="mb-6 md:mb-8 space-y-3">
              <div className="h-3 w-32 bg-slate-100 rounded" />
              <div className="h-8 md:h-10 w-48 bg-slate-100 rounded pb-3 border-b border-slate-100" />
            </div>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Desktop Left Sidebar Skeleton */}
              <aside className="hidden lg:block lg:w-48 flex-shrink-0 space-y-8 sticky top-28 h-fit">
                <div className="space-y-4">
                  <div className="h-3 w-24 bg-slate-100 rounded border-b border-brand-blue/10 pb-2" />
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 w-5/6 bg-slate-100 rounded" />
                  ))}
                </div>
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <div className="h-3 w-16 bg-slate-100 rounded" />
                  <div className="h-2 w-full bg-slate-100 rounded" />
                </div>
              </aside>

              {/* Right Main Content Skeleton */}
              <div className="flex-1 space-y-8">
                {/* Controls Skeleton */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-slate-100">
                  <div className="h-8 w-full sm:max-w-xs bg-slate-50 rounded" />
                  <div className="h-8 w-32 bg-slate-50 rounded" />
                </div>

                {/* Products Grid Skeleton */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-3 md:gap-x-6 gap-y-8 md:gap-y-12">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
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
            </div>

          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      
      <main className="pt-20 md:pt-32 pb-24 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="mb-6 md:mb-8">
            <nav className="flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] text-slate-400 mb-3">
              <Link href="/" className="hover:text-brand-blue transition-colors">Главная</Link>
              <span className="opacity-50">/</span>
              <span className="text-brand-blue font-bold">Каталог</span>
            </nav>
            
            <div className="flex flex-col gap-2 pb-3 border-b border-slate-100">
              <h1 className="text-lg md:text-2xl font-bold tracking-wider text-brand-blue uppercase leading-none">
                {categoryPath.length > 0 ? categoryPath[categoryPath.length - 1].name : "Каталог"}
              </h1>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Desktop Left Sidebar */}
            <aside className="hidden lg:block lg:w-48 flex-shrink-0 space-y-8 sticky top-28 h-fit">
              <div className="space-y-3">
                <h4 className="text-[9px] font-bold uppercase tracking-[0.25em] text-brand-blue border-b border-brand-blue/10 pb-2">
                  Коллекции
                </h4>
                {renderCategoryTree()}
              </div>

              <div className="space-y-3 pt-4 border-t border-brand-blue/10">
                <div className="flex justify-between items-center">
                  <h4 className="text-[9px] font-bold uppercase tracking-[0.25em] text-brand-blue">Цена</h4>
                  <span className="text-[9px] font-medium text-brand-blue/60 tracking-tight">до {priceRange.toLocaleString('ru-RU')} сум</span>
                </div>
                <div className="relative pt-1">
                  <input 
                    type="range" 
                    min="0" 
                    max={maxPrice} 
                    step="5000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(parseInt(e.target.value))}
                    className="w-full h-0.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-brand-blue/10">
                <button 
                  onClick={resetFilters}
                  className="text-[9px] font-bold uppercase tracking-widest text-brand-blue/30 hover:text-brand-blue transition-colors"
                >
                  Сбросить всё
                </button>
              </div>
            </aside>

            {/* Right Main Content Area */}
            <div className="flex-1">
              {/* Controls bar: Search & Sorting */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-3 border-b border-slate-100">
                {/* Slim Underline Search */}
                <div className="relative h-[32px] w-full sm:max-w-xs border-b border-slate-200 focus-within:border-slate-800 transition-colors">
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="ПОИСК..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-full bg-transparent pl-5 pr-2 text-[9px] uppercase tracking-widest text-slate-800 focus:outline-none"
                  />
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Slim Underline Sorting */}
                  <div className="relative h-[32px] min-w-[120px] border-b border-slate-200 focus-within:border-slate-800 transition-colors">
                    <select 
                      value={activeSort}
                      onChange={(e) => setActiveSort(e.target.value)}
                      className="w-full h-full bg-transparent text-[9px] font-bold uppercase tracking-widest text-slate-800 outline-none cursor-pointer"
                    >
                      <option value="default">Сортировка</option>
                      <option value="price-asc">Цена: По возрастанию</option>
                      <option value="price-desc">Цена: По убыванию</option>
                    </select>
                  </div>
                  
                  {/* Floating Filter Button (Mobile Trigger) */}
                  <button 
                    onClick={() => setIsFilterOpen(true)}
                    className="lg:hidden flex items-center justify-center bg-brand-blue text-white px-4 h-[32px] active:scale-95 transition-all gap-2 text-[9px] font-bold uppercase tracking-widest"
                  >
                    <Filter className="w-3 h-3" />
                    <span>Фильтры</span>
                  </button>
                </div>
              </div>

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
                          
                          <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4">
                             <div className="bg-white/90 backdrop-blur-sm px-2 md:px-3 py-1 md:py-1.5 text-[8px] md:text-[10px] font-bold tracking-tight text-brand-blue">
                                {product.price.toLocaleString('ru-RU')} сум
                             </div>
                          </div>
                        </div>
                      </Link>
                      
                      <div className="mt-4 md:mt-6 flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <Link href={`/product/${product.sku ? `${formatSkuForUrl(product.sku)}-` : ''}${product.id}`}>
                            <p className="text-[8px] md:text-[10px] text-brand-blue/40 uppercase tracking-widest mb-0.5 truncate">{product.category || "General"}</p>
                            <h3 className="text-[10px] md:text-sm font-bold text-brand-blue uppercase tracking-tight group-hover:text-brand-blue/70 transition-colors truncate">{product.name}</h3>
                          </Link>
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
                <div className="py-16 md:py-24 flex flex-col items-center justify-center text-center font-sans">
                  <div className="w-12 h-12 rounded-full bg-brand-blue/5 flex items-center justify-center text-brand-blue mb-4">
                    <Search className="w-5 h-5 opacity-60" />
                  </div>
                  <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-brand-blue mb-1">
                    Ничего не найдено
                  </h3>
                  <p className="text-[10px] text-brand-blue/60 tracking-wide max-w-[240px] mb-4">
                    Попробуйте изменить параметры поиска или изменить ценовой диапазон.
                  </p>
                  <button 
                    onClick={resetFilters}
                    className="h-8 px-4 bg-brand-blue text-white text-[9px] font-bold uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Сбросить фильтры
                  </button>
                </div>
              )}
            </div>
          </div>
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

              <div className="flex-1 overflow-y-auto p-6 space-y-10">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-blue border-b border-brand-blue/10 pb-2">
                    Коллекции
                  </h4>
                  {renderCategoryTree()}
                </div>

                <div className="space-y-6 pt-4 border-t border-brand-blue/10">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">Цена</h4>
                    <span className="text-[10px] font-medium text-brand-blue/60">до {priceRange.toLocaleString('ru-RU')} сум</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max={maxPrice} 
                    step="5000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-brand-blue/10 flex gap-3">
                <button 
                  onClick={resetFilters}
                  className="flex-1 h-11 border border-brand-blue/10 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/60"
                >
                  Сбросить
                </button>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-[2] h-11 bg-brand-blue text-white text-[10px] font-bold uppercase tracking-[0.2em]"
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-slate-100 border-t-brand-blue animate-spin" />
            <span className="text-[10px] font-bold tracking-widest text-brand-blue uppercase select-none">L</span>
          </div>
          <span className="text-[8px] font-bold tracking-[0.4em] text-brand-blue/40 uppercase animate-pulse select-none">Liberty</span>
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
