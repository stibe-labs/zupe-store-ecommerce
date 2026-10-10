"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export interface CartItem {
  id: string;
  name: string;
  subtitle?: string;
  category: string;
  price: number;
  mrp?: number;
  quantity: number;
  poster_image: string;
  volume?: string;
  color?: string;
}

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: {
    id: string;
    name: string;
    subtitle?: string;
    category?: string;
    price?: number;
    offer_price?: number;
    mrp?: number;
    poster_image?: string;
    image?: string;
    volume?: string;
    color?: string;
  }, quantity?: number) => boolean;
  addItem: (product: any, quantity?: number) => boolean;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  savings: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const FREE_SHIPPING_THRESHOLD = 1499;
  const GUEST_CART_KEY = "zp_guest_cart";

  useEffect(() => {
    let isMounted = true;
    async function initCart() {
      if (!user) {
        if (isMounted) {
          try {
            const savedGuestCart = localStorage.getItem(GUEST_CART_KEY);
            if (savedGuestCart) {
              const parsed = JSON.parse(savedGuestCart);
              if (Array.isArray(parsed)) {
                setCart(parsed);
              }
            } else {
              setCart([]);
            }
          } catch (e) {
            setCart([]);
          }
          setIsInitialized(true);
        }
        return;
      }

      try {
        const res = await fetch(`/api/cart?userId=${encodeURIComponent(user.id)}`);
        const data = await res.json();
        let remoteItems: CartItem[] = [];
        if (data.success && Array.isArray(data.items)) {
          remoteItems = data.items;
        }

        let merged = [...remoteItems];

        // Process guest cart items and merge them into remote items
        try {
          const savedGuestCart = localStorage.getItem(GUEST_CART_KEY);
          if (savedGuestCart) {
            const guestItems = JSON.parse(savedGuestCart);
            if (Array.isArray(guestItems)) {
              for (const gItem of guestItems) {
                const idx = merged.findIndex((m) => m.id === gItem.id);
                if (idx > -1) {
                  merged[idx].quantity += gItem.quantity;
                } else {
                  merged.push(gItem);
                }
              }
            }
          }
        } catch (e) {}

        // Process pending cart action if any (saved before redirecting to sign in)
        try {
          const pendingActionStr = localStorage.getItem("zp_pending_cart_action");
          if (pendingActionStr) {
            const pending = JSON.parse(pendingActionStr);
            localStorage.removeItem("zp_pending_cart_action");
            if (pending.product) {
              const p = pending.product;
              const pPrice = p.offer_price || p.price || 990;
              const pMrp = p.mrp || Math.round(pPrice * 1.25);
              const pImage = p.poster_image || p.image || "";
              const pQty = pending.quantity || 1;

              const idx = merged.findIndex((m) => m.id === p.id);
              if (idx > -1) {
                merged[idx].quantity += pQty;
              } else {
                merged.push({
                  id: p.id,
                  name: p.name,
                  subtitle: p.subtitle,
                  category: p.category || "Product",
                  price: pPrice,
                  mrp: pMrp,
                  quantity: pQty,
                  poster_image: pImage,
                  volume: p.volume,
                  color: p.color,
                });
              }

              if (pending.autoOpenCart) {
                setTimeout(() => setIsOpen(true), 350);
              }
            }
          }
        } catch (e) {
          console.warn("Could not process pending cart action:", e);
        }

        // Clean up legacy guest cart
        try {
          localStorage.removeItem(GUEST_CART_KEY);
        } catch (e) {}

        if (isMounted) setCart(merged);
      } catch (err) {
        console.warn("Could not sync user cart:", err);
      } finally {
        if (isMounted) setIsInitialized(true);
      }
    }

    initCart();
    return () => { isMounted = false; };
  }, [user]);

  useEffect(() => {
    if (!isInitialized) return;

    if (!user) {
      try {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
      } catch (e) {}
      return;
    }

    const timer = setTimeout(async () => {
      try {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, items: cart }),
        });
      } catch (e) {
        console.warn("Failed to persist cart:", e);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [cart, isInitialized, user]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addToCart = (
    product: {
      id: string;
      name: string;
      subtitle?: string;
      category?: string;
      price?: number;
      offer_price?: number;
      mrp?: number;
      poster_image?: string;
      image?: string;
      volume?: string;
      color?: string;
    },
    quantity: number = 1
  ): boolean => {
    const finalPrice = product.offer_price || product.price || 990;
    const finalMrp = product.mrp || Math.round(finalPrice * 1.25);
    const finalImage = product.poster_image || product.image || "";

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((item) => item.id === product.id);
      if (existingIdx > -1) {
        const updated = [...prevCart];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            subtitle: product.subtitle,
            category: product.category || "Product",
            price: finalPrice,
            mrp: finalMrp,
            quantity: quantity,
            poster_image: finalImage,
            volume: product.volume,
            color: product.color,
          },
        ];
      }
    });

    return true;
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(GUEST_CART_KEY);
    } catch (e) {}
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const mrpTotal = cart.reduce((sum, item) => sum + (item.mrp || item.price) * item.quantity, 0);
  const savings = Math.max(0, mrpTotal - subtotal);
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        addItem: addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        savings,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        freeShippingRemaining,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
