"use client";

import { 
  MoreHorizontal, 
  ExternalLink,
  Plus,
  Filter,
  Download,
  Search,
  ChevronRight,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Edit3,
  Trash2,
  Tag,
  Layers,
  ArrowUpRight,
  Image as ImageIcon,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string | null;
  category_id: number | null;
  image_url: string | null;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
  parent_id?: number | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRootId, setActiveRootId] = useState<string>("all");
  const [activeSubId, setActiveSubId] = useState<string>("all");
  const [activeSubSubId, setActiveSubSubId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const t = Date.now();
      const [prodRes, catRes] = await Promise.all([
        fetch(`http://localhost:8000/api/v1/products/?limit=500&t=${t}`),
        fetch(`http://localhost:8000/api/v1/products/categories?t=${t}`)
      ]);
      
      if (prodRes.ok) setProducts(await prodRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTargetCategoryIds = (): number[] => {
    if (activeRootId === "all") return [];
    
    if (activeSubSubId !== "all") {
      return [parseInt(activeSubSubId)];
    }
    
    if (activeSubId !== "all") {
      const subSubs = categories.filter(c => c.parent_id && String(c.parent_id) === String(activeSubId));
      return [parseInt(activeSubId), ...subSubs.map(c => parseInt(c.id))];
    }
    
    const ids: number[] = [parseInt(activeRootId)];
    const subs = categories.filter(c => c.parent_id && String(c.parent_id) === String(activeRootId));
    subs.forEach(sub => {
      ids.push(parseInt(sub.id));
      const subSubs = categories.filter(c => c.parent_id && String(c.parent_id) === String(sub.id));
      subSubs.forEach(subSub => {
        ids.push(parseInt(subSub.id));
      });
    });
    return ids;
  };

  const getActiveFilterName = (): string => {
    if (activeRootId === "all") return "Все";
    if (activeSubSubId !== "all") {
      return categories.find(c => String(c.id) === String(activeSubSubId))?.name || "";
    }
    if (activeSubId !== "all") {
      return categories.find(c => String(c.id) === String(activeSubId))?.name || "";
    }
    return categories.find(c => String(c.id) === String(activeRootId))?.name || "";
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeRootId === "all") return matchesSearch;
    
    const targetIds = getTargetCategoryIds();
    if (targetIds.length > 0) {
      return matchesSearch && product.category_id !== null && targetIds.includes(product.category_id);
    }
    
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedProduct]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-slate-150 rounded" />
            <div className="h-3.5 w-64 bg-slate-100 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-slate-100 rounded" />
            <div className="h-8 w-28 bg-slate-100 rounded" />
          </div>
        </div>

        {/* Dynamic Tabs Skeleton */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#e3e8ee] pb-3">
          <div className="flex gap-6 overflow-x-auto w-full md:w-auto pb-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 w-16 bg-slate-100 rounded" />
            ))}
          </div>
          <div className="h-8 w-64 bg-slate-50 border border-[#e3e8ee] rounded" />
        </div>

        {/* Table Skeleton */}
        <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden shadow-sm">
          {/* Table Header Placeholder */}
          <div className="px-6 py-3.5 bg-[#f7f8f9] border-b border-[#e3e8ee] flex items-center justify-between">
            <div className="h-3.5 w-32 bg-slate-200 rounded" />
            <div className="h-3.5 w-24 bg-slate-150 rounded" />
            <div className="h-3.5 w-24 bg-slate-150 rounded" />
            <div className="h-3 w-8 bg-slate-100 rounded" />
          </div>

          {/* Table Rows Placeholder (5 rows) */}
          <div className="divide-y divide-[#e3e8ee]">
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="px-6 py-4 flex items-center justify-between gap-6">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-[#e3e8ee]" />
                  <div className="h-4 w-48 bg-slate-150 rounded" />
                </div>
                <div className="w-24 h-4 bg-slate-100 rounded" />
                <div className="w-32 h-4 bg-slate-100 rounded" />
                <div className="w-6 h-4 bg-slate-50 border border-[#e3e8ee] rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight mb-1">Товары</h1>
          <p className="text-[14px] text-[#4f566b]">Управление ассортиментом по категориям из Bitrix24.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-[#4f566b] bg-white border border-[#e3e8ee] rounded-md hover:bg-[#f7f8f9] transition-all">
            <Download className="w-3.5 h-3.5" />
            Экспорт
          </button>
          <button onClick={() => { setLoading(true); fetchData(); }} className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold text-white bg-[#2c3b6e] border border-[#2c3b6e] rounded-md hover:bg-[#232f58] transition-all">
            <RefreshCw className="w-3.5 h-3.5" />
            Обновить
          </button>
        </div>
      </div>

      {/* Dynamic Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#e3e8ee]">
        <div className="flex items-center gap-6 overflow-x-auto w-full md:w-auto scrollbar-hide pb-0.5">
          {[{ id: "all", name: "Все" }, ...categories.filter(c => c.parent_id === null || !c.parent_id)].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveRootId(tab.id);
                setActiveSubId("all");
                setActiveSubSubId("all");
                setCurrentPage(1);
              }}
              className={cn(
                "pb-3 text-[14px] font-semibold transition-all relative whitespace-nowrap",
                activeRootId === tab.id ? "text-[#2c3b6e]" : "text-[#4f566b] hover:text-[#1a1f36]"
              )}
            >
              {tab.name}
              {activeRootId === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2c3b6e]"
                />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 mb-2">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4f566b] group-focus-within:text-[#2c3b6e] transition-colors" />
              <input 
                type="text" 
                placeholder="Поиск..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-4 py-1.5 bg-[#f7f8f9] border border-transparent focus:border-[#2c3b6e]/30 focus:bg-white rounded-lg text-[13px] outline-none transition-all w-64"
              />
           </div>
        </div>
      </div>

      {/* Hierarchical Subcategory Filters */}
      {(() => {
        const subCategories = categories.filter(c => c.parent_id && String(c.parent_id) === String(activeRootId));
        const subSubCategories = categories.filter(c => c.parent_id && String(c.parent_id) === String(activeSubId));
        
        return (
          <div className="space-y-3 -mt-4">
            <AnimatePresence>
              {activeRootId !== "all" && subCategories.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap items-center gap-2 py-1.5 overflow-hidden"
                >
                  <span className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mr-2">Подкатегория:</span>
                  <button
                    onClick={() => {
                      setActiveSubId("all");
                      setActiveSubSubId("all");
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "px-3 py-1 text-[11px] font-semibold rounded-lg transition-all border",
                      activeSubId === "all" 
                        ? "bg-[#2c3b6e] border-[#2c3b6e] text-white shadow-sm" 
                        : "bg-white border-[#e3e8ee] text-[#4f566b] hover:border-[#2c3b6e]/30 hover:text-[#2c3b6e]"
                    )}
                  >
                    Все
                  </button>
                  {subCategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setActiveSubId(sub.id);
                        setActiveSubSubId("all");
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "px-3 py-1 text-[11px] font-semibold rounded-lg transition-all border",
                        activeSubId === sub.id 
                          ? "bg-[#2c3b6e] border-[#2c3b6e] text-white shadow-sm" 
                          : "bg-white border-[#e3e8ee] text-[#4f566b] hover:border-[#2c3b6e]/30 hover:text-[#2c3b6e]"
                      )}
                    >
                      {sub.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {activeRootId !== "all" && activeSubId !== "all" && subSubCategories.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap items-center gap-4 py-1.5 overflow-hidden border-t border-[#e3e8ee]/30"
                >
                  <span className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mr-2">Раздел / Сезон:</span>
                  <button
                    onClick={() => {
                      setActiveSubSubId("all");
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "text-[11px] font-bold transition-all relative pb-0.5",
                      activeSubSubId === "all" 
                        ? "text-[#2c3b6e]" 
                        : "text-[#4f566b] hover:text-[#2c3b6e]"
                    )}
                  >
                    Все
                    {activeSubSubId === "all" && (
                      <motion.div layoutId="activeSubSub" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2c3b6e]" />
                    )}
                  </button>
                  {subSubCategories.map((subSub) => (
                    <button
                      key={subSub.id}
                      onClick={() => {
                        setActiveSubSubId(subSub.id);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "text-[11px] font-bold transition-all relative pb-0.5",
                        activeSubSubId === subSub.id 
                          ? "text-[#2c3b6e]" 
                          : "text-[#4f566b] hover:text-[#2c3b6e]"
                      )}
                    >
                      {subSub.name}
                      {activeSubSubId === subSub.id && (
                        <motion.div layoutId="activeSubSub" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2c3b6e]" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })()}

      {/* Table */}
      <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden">
        {paginatedProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f7f8f9] border-b border-[#e3e8ee]">
                  <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Товар</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider">Цена</th>
                  <th className="px-6 py-3 text-[11px] font-bold text-[#4f566b] uppercase tracking-wider text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3e8ee]">
                {paginatedProducts.map((product, idx) => (
                  <motion.tr 
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedProduct(product)}
                    className="group cursor-pointer hover:bg-[#2c3b6e]/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#e3e8ee] bg-white">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                                 <ImageIcon className="w-4 h-4" />
                              </div>
                            )}
                         </div>
                         <span className="text-[13px] font-bold text-[#1a1f36] group-hover:text-[#2c3b6e] transition-colors">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-bold text-[#4f566b] uppercase tracking-widest">{product.sku || "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-bold text-[#1a1f36]">{product.price.toLocaleString('ru-RU')} сум</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="w-4 h-4 text-[#e3e8ee] group-hover:text-[#2c3b6e] transition-colors ml-auto" />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="w-16 h-16 bg-[#f7f8f9] rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-[#e3e8ee]" />
             </div>
             <h3 className="text-[16px] font-bold text-[#1a1f36] mb-1">Товары не найдены</h3>
             <p className="text-[13px] text-[#4f566b]">В категории «{getActiveFilterName()}» пока нет товаров.</p>
          </div>
        )}

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className="px-6 py-4 border-t border-[#e3e8ee] bg-[#f7f8f9]/30 flex flex-col md:flex-row items-center justify-between gap-4">
             <p className="text-[12px] text-[#4f566b] font-medium">
               Показано {startIndex + 1}—{Math.min(startIndex + itemsPerPage, filteredProducts.length)} из {filteredProducts.length} товаров
             </p>
             <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-1.5 border border-[#e3e8ee] rounded bg-white text-[12px] font-bold text-[#4f566b] hover:bg-[#f7f8f9] disabled:opacity-50 transition-all">Назад</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((page) => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={cn("w-8 h-8 flex items-center justify-center border rounded text-[12px] font-bold transition-all", currentPage === page ? "bg-[#2c3b6e] border-[#2c3b6e] text-white" : "bg-white border-[#e3e8ee] text-[#4f566b] hover:bg-[#f7f8f9]")}>{page}</button>
                ))}
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 border border-[#e3e8ee] rounded bg-white text-[12px] font-bold text-[#4f566b] hover:bg-[#f7f8f9] disabled:opacity-50 transition-all">Вперед</button>
             </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="fixed inset-0 w-screen h-screen bg-slate-900/40 backdrop-blur-md z-[9999]" />
            <motion.div key="drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-[#e3e8ee] z-[10000] flex flex-col" >
              <div className="px-6 py-5 border-b border-[#e3e8ee] flex items-center justify-between">
                <div>
                   <h2 className="text-[16px] font-bold text-[#1a1f36]">Детали товара</h2>
                   <p className="text-[11px] font-bold text-[#4f566b] uppercase tracking-widest">ID: {selectedProduct.id}</p>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-[#f7f8f9] rounded-lg transition-colors"><XCircle className="w-5 h-5 text-[#4f566b]" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                 <div className="aspect-square rounded-2xl overflow-hidden border border-[#e3e8ee] bg-[#f7f8f9]">
                    {selectedProduct.image_url ? <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon className="w-12 h-12" /></div>}
                 </div>
                 <div className="space-y-4">
                    <h3 className="text-xl font-black text-[#1a1f36]">{selectedProduct.name}</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-[#f7f8f9] rounded-xl border border-[#e3e8ee]">
                          <p className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1">SKU</p>
                          <p className="text-[13px] font-bold text-[#1a1f36]">{selectedProduct.sku || "—"}</p>
                       </div>
                       <div className="p-4 bg-[#f7f8f9] rounded-xl border border-[#e3e8ee]">
                          <p className="text-[10px] font-bold text-[#4f566b] uppercase tracking-widest mb-1">Цена</p>
                          <p className="text-[13px] font-black text-[#2c3b6e]">{selectedProduct.price.toLocaleString('ru-RU')} сум</p>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="px-6 py-5 border-t border-[#e3e8ee] bg-[#f7f8f9]/50 sticky bottom-0">
                 <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#2c3b6e] rounded-xl text-[13px] font-bold text-white hover:bg-[#232f58] transition-all">Смотреть в Bitrix24</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
