"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/types/product";
import { useAuth } from "@/context/AuthContext";

interface WishlistContextType {
  wishlist: Product[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => boolean;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  totalWishlistItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "zp_user_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, openAuthModal } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!user) {
      setWishlist([]);
      setIsInitialized(true);
      return;
    }

    try {
      const userKey = `zp_user_wishlist_${user.id}`;
      const stored = localStorage.getItem(userKey);
      let initialList: Product[] = [];
      if (stored) {
        initialList = JSON.parse(stored);
      }

      // Check for pending wishlist action from pre-login intent
      const pendingWStr = localStorage.getItem("zp_pending_wishlist_action");
      if (pendingWStr) {
        const pendingW = JSON.parse(pendingWStr);
        localStorage.removeItem("zp_pending_wishlist_action");
        if (pendingW.product && !initialList.some((item) => item.id === pendingW.product.id)) {
          initialList.push(pendingW.product);
        }
      }

      // Clean up legacy shared global key so old test data never leaks
      localStorage.removeItem("zp_user_wishlist");

      setWishlist(initialList);
    } catch (e) {
      console.warn("Could not load user wishlist:", e);
      setWishlist([]);
    } finally {
      setIsInitialized(true);
    }
  }, [user]);

  useEffect(() => {
    if (!isInitialized || !user) return;
    try {
      const userKey = `zp_user_wishlist_${user.id}`;
      localStorage.setItem(userKey, JSON.stringify(wishlist));
    } catch (e) {
      console.warn("Could not save wishlist:", e);
    }
  }, [wishlist, isInitialized, user]);

  const isInWishlist = (productId: string): boolean => {
    if (!user) return false;
    return wishlist.some((item) => item.id === productId);
  };

  const toggleWishlist = (product: Product): boolean => {
    if (!user) {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            "zp_pending_wishlist_action",
            JSON.stringify({
              action: "wishlist",
              product,
            })
          );
        } catch (e) {}
        openAuthModal("login", "Sign in required: Please log in to save items to your wishlist ❤️");
      }
      return false;
    }

    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
    return true;
  };

  const removeFromWishlist = (productId: string) => {
    if (!user) return;
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearWishlist = () => {
    if (!user) return;
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        totalWishlistItems: !user ? 0 : wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
