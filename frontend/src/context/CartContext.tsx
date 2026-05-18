"use client";

import React, { createContext, useContext, useState } from "react";

interface CartItem {
  id: number;
  name: string;
  price: string;
  image: string;
  category: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  items: CartItem[];
  addItem: (product: any) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: any) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsOpen(true);
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setItems((prev) => 
      prev.map((item) => 
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const total = items.reduce((acc, item) => {
    const priceNum = parseInt(item.price.replace(/[^\d]/g, ""));
    return acc + priceNum * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ isOpen, setIsOpen, items, addItem, removeItem, updateQuantity, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
