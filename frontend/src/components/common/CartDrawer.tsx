"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { X, ShoppingBag, ChevronRight, Plus, Minus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";
import Image from "next/image";
import Link from "next/link";

export const CartDrawer = () => {
  const { isOpen, setIsOpen, items, removeItem, updateQuantity, total } = useCart();
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const confirmDelete = () => {
    if (itemToDelete) {
      removeItem(itemToDelete);
      setItemToDelete(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-brand-blue/40 backdrop-blur-sm z-[110] cursor-pointer"
          />

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {itemToDelete !== null && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-brand-blue/20 backdrop-blur-sm z-[130]"
                  onClick={() => setItemToDelete(null)}
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-[280px] bg-white p-5 md:p-6 z-[140] shadow-2xl border border-slate-100 text-center font-sans"
                >
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-3">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-brand-blue mb-1">Удалить товар?</h3>
                  <p className="text-[11px] text-slate-500 mb-5 leading-relaxed">
                    Вы уверены, что хотите убрать эту вещь из своей коллекции?
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={confirmDelete}
                      className="flex-1 h-9 bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold transition-colors"
                    >
                      Удалить
                    </button>
                    <button 
                      onClick={() => setItemToDelete(null)}
                      className="flex-1 h-9 border border-slate-200 text-slate-500 hover:bg-slate-50 text-[11px] font-semibold transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[120] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-3 md:p-4 border-b border-slate-100 flex justify-between items-center bg-white relative z-10">
              <div className="flex items-center gap-2 md:gap-2.5">
                <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-blue" />
                <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-brand-blue">Корзина</h2>
                <span className="bg-slate-100 text-slate-500 text-[8px] md:text-[9px] px-1.5 py-0.5 font-bold">{items.length}</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <X className="w-4 h-4 text-brand-blue" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 relative">
              <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
              
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-14 h-14 bg-slate-50 flex items-center justify-center border border-slate-100">
                    <ShoppingBag className="w-5 h-5 text-slate-300" strokeWidth={1} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-brand-blue">Ваша корзина пуста</h3>
                    <p className="text-[9px] md:text-[10px] text-slate-400 max-w-[160px] mx-auto leading-relaxed">Кажется, вы еще ничего не добавили в свою коллекцию.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="rounded-none px-5 h-9 uppercase text-[8px] md:text-[9px] tracking-widest"
                    onClick={() => setIsOpen(false)}
                  >
                    Вернуться к покупкам
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-5 relative z-10">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 md:gap-4 border-b border-slate-50 pb-4 md:pb-5 last:border-b-0 last:pb-0">
                      <div className="relative w-14 md:w-16 aspect-[3/4] bg-slate-50 overflow-hidden flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-0.5">
                            <h3 className="text-[10px] md:text-[11px] font-medium text-brand-blue leading-snug">{item.name}</h3>
                            <button 
                              onClick={() => setItemToDelete(item.id)} 
                              className="text-slate-300 hover:text-red-500 transition-colors p-0.5"
                            >
                              <Trash2 className="w-3 md:w-3.5 h-3 md:h-3.5" />
                            </button>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                            <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-slate-400">{item.category}</span>
                            {item.size && (
                              <span className="text-[8px] text-slate-400 font-medium">/ РАЗМЕР: {item.size}</span>
                            )}
                            {item.color && (
                              <span className="text-[8px] text-brand-blue font-medium">/ ЦВЕТ: {item.color}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-1.5">
                          <div className="flex items-center border border-slate-100">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center hover:bg-slate-50 text-brand-blue"
                            >
                              <Minus className="w-2 h-2 md:w-2.5 h-2.5" />
                            </button>
                            <span className="w-6 md:w-7 text-center text-[10px] md:text-[11px] font-bold text-brand-blue">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center hover:bg-slate-50 text-brand-blue"
                            >
                              <Plus className="w-2 h-2 md:w-2.5 h-2.5" />
                            </button>
                          </div>
                          <p className="text-[10px] md:text-[11px] font-bold text-brand-blue">{item.price}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Area */}
            {items.length > 0 && (
              <div className="p-4 md:p-5 border-t border-slate-100 bg-white space-y-3.5 md:space-y-4 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-slate-400">Итого</span>
                  <span className="text-sm md:text-base font-bold text-brand-blue uppercase tracking-tighter">
                    {total.toLocaleString()} сум
                  </span>
                </div>
                <Link href="/checkout" className="block w-full" onClick={() => setIsOpen(false)}>
                  <Button className="w-full h-10 md:h-11 rounded-none bg-brand-blue text-white group uppercase tracking-[0.2em] font-bold text-[9px] md:text-[10px]">
                    Оформить заказ
                    <ChevronRight className="ml-1.5 w-3 h-3 md:w-3.5 md:h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
