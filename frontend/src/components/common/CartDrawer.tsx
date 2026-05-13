"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { X, ShoppingBag, ArrowRight, Plus, Minus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";
import Image from "next/image";

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
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[320px] bg-white p-8 z-[140] shadow-2xl border border-slate-100 text-center"
                >
                  <Trash2 className="w-8 h-8 text-slate-200 mx-auto mb-6" strokeWidth={1} />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue mb-4">Удалить товар?</h3>
                  <p className="text-xs text-slate-400 mb-8 uppercase tracking-widest leading-relaxed">
                    Вы уверены, что хотите убрать эту вещь из своей коллекции?
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={confirmDelete}
                      className="w-full h-12 bg-red-500 hover:bg-red-600 text-white rounded-none uppercase text-[10px] tracking-widest font-bold"
                    >
                      Удалить
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setItemToDelete(null)}
                      className="w-full h-12 rounded-none border-slate-100 uppercase text-[10px] tracking-widest font-bold"
                    >
                      Отмена
                    </Button>
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
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-white relative z-10">
              <div className="flex items-center gap-2 md:gap-3">
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-brand-blue" />
                <h2 className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">Корзина</h2>
                <span className="bg-slate-100 text-slate-500 text-[9px] md:text-[10px] px-1.5 md:px-2 py-0.5 font-bold">{items.length}</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-brand-blue" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 relative">
              <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
              
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 md:space-y-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 flex items-center justify-center border border-slate-100">
                    <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-slate-300" strokeWidth={1} />
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-brand-blue">Ваша корзина пуста</h3>
                    <p className="text-[10px] md:text-xs text-slate-400 max-w-[180px] mx-auto leading-relaxed">Кажется, вы еще ничего не добавили в свою коллекцию.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="rounded-none px-6 md:px-8 h-10 md:h-12 uppercase text-[9px] md:text-[10px] tracking-widest"
                    onClick={() => setIsOpen(false)}
                  >
                    Вернуться к покупкам
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 md:space-y-8 relative z-10">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 md:gap-4">
                      <div className="relative w-20 md:w-24 aspect-[3/4] bg-slate-50 overflow-hidden flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex justify-between items-start mb-0.5">
                            <h3 className="text-[11px] md:text-xs font-bold uppercase tracking-tight text-brand-blue">{item.name}</h3>
                            <button 
                              onClick={() => setItemToDelete(item.id)} 
                              className="text-slate-300 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="w-3 md:w-3.5 h-3 md:h-3.5" />
                            </button>
                          </div>
                          <p className="text-[9px] uppercase tracking-widest text-slate-400">{item.category}</p>
                        </div>
                        
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center border border-slate-100">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-slate-50 text-brand-blue"
                            >
                              <Minus className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            </button>
                            <span className="w-7 md:w-8 text-center text-[11px] md:text-xs font-bold text-brand-blue">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-slate-50 text-brand-blue"
                            >
                              <Plus className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            </button>
                          </div>
                          <p className="text-xs font-bold text-brand-blue">{item.price}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Area */}
            {items.length > 0 && (
              <div className="p-4 md:p-8 border-t border-slate-100 bg-white space-y-4 md:space-y-6 relative z-10">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">Итого</span>
                  <span className="text-lg md:text-xl font-bold text-brand-blue uppercase tracking-tighter">
                    {total.toLocaleString()} сум
                  </span>
                </div>
                <Button className="w-full h-12 md:h-14 rounded-none bg-brand-blue text-white group uppercase tracking-[0.2em] font-bold text-[10px] md:text-xs">
                  Оформить заказ
                  <ArrowRight className="ml-2 w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
