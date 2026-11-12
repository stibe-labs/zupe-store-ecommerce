"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  LayoutGrid,
  Heart,
  User,
  MoreHorizontal,
} from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalWishlistItems } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { openCart, totalItems } = useCart();

  // Route guard: hide on admin dashboard and checkout flows
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/checkout")) {
    return null;
  }

  const isHome = pathname === "/";
  const isCategories =
    pathname?.startsWith("/products") || pathname?.startsWith("/categories");
  const isWishlist = pathname === "/wishlist";
  const isAccount =
    pathname === "/account" ||
    pathname === "/signin" ||
    pathname === "/login";

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-neutral-200/90 px-2 sm:px-4 pt-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] select-none font-mograph"
    >
      <div className="grid grid-cols-5 items-center justify-items-center max-w-md mx-auto">
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => {
            if (isHome) {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              router.push("/");
            }
          }}
          className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 py-1 px-2 touch-manipulation focus:outline-none ${
            isHome ? "text-[#A67C2E]" : "text-neutral-500 hover:text-black"
          }`}
          aria-label="Home"
        >
          <Home
            className={`w-5 h-5 transition-transform duration-200 ${
              isHome ? "stroke-[2.4] scale-105" : "stroke-[1.8]"
            }`}
          />
          <span
            className={`text-[10px] tracking-tight ${
              isHome ? "font-bold text-[#A67C2E]" : "font-medium"
            }`}
          >
            Home
          </span>
        </button>

        {/* 2. Categories */}
        <button
          type="button"
          onClick={() => router.push("/products")}
          className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 py-1 px-2 touch-manipulation focus:outline-none ${
            isCategories ? "text-[#A67C2E]" : "text-neutral-500 hover:text-black"
          }`}
          aria-label="Categories"
        >
          <LayoutGrid
            className={`w-5 h-5 transition-transform duration-200 ${
              isCategories ? "stroke-[2.4] scale-105" : "stroke-[1.8]"
            }`}
          />
          <span
            className={`text-[10px] tracking-tight ${
              isCategories ? "font-bold text-[#A67C2E]" : "font-medium"
            }`}
          >
            Categories
          </span>
        </button>

        {/* 3. Wishlist */}
        <button
          type="button"
          onClick={() => router.push("/wishlist")}
          className={`relative flex flex-col items-center justify-center gap-1 transition-all duration-200 py-1 px-2 touch-manipulation focus:outline-none ${
            isWishlist ? "text-[#A67C2E]" : "text-neutral-500 hover:text-black"
          }`}
          aria-label="Wishlist"
        >
          <div className="relative">
            <Heart
              className={`w-5 h-5 transition-transform duration-200 ${
                isWishlist
                  ? "stroke-[2.4] fill-[#D4AF37]/20 scale-105"
                  : "stroke-[1.8]"
              }`}
            />
            {totalWishlistItems > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#D4A373] text-black text-[9px] font-black flex items-center justify-center shadow-xs">
                {totalWishlistItems > 9 ? "9+" : totalWishlistItems}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] tracking-tight ${
              isWishlist ? "font-bold text-[#A67C2E]" : "font-medium"
            }`}
          >
            Wishlist
          </span>
        </button>

        {/* 4. Account */}
        <button
          type="button"
          onClick={() => {
            if (isAuthenticated) {
              router.push("/account");
            } else {
              router.push(
                "/signin?redirect=/account&notice=Please sign in to view your profile and orders"
              );
            }
          }}
          className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 py-1 px-2 touch-manipulation focus:outline-none ${
            isAccount ? "text-[#A67C2E]" : "text-neutral-500 hover:text-black"
          }`}
          aria-label="Account"
        >
          <User
            className={`w-5 h-5 transition-transform duration-200 ${
              isAccount ? "stroke-[2.4] scale-105" : "stroke-[1.8]"
            }`}
          />
          <span
            className={`text-[10px] tracking-tight ${
              isAccount ? "font-bold text-[#A67C2E]" : "font-medium"
            }`}
          >
            Account
          </span>
        </button>

        {/* 5. More (opens Cart Drawer & Quick Bag) */}
        <button
          type="button"
          onClick={openCart}
          className="relative flex flex-col items-center justify-center gap-1 transition-all duration-200 py-1 px-2 touch-manipulation focus:outline-none text-neutral-500 hover:text-black"
          aria-label="Cart & More"
        >
          <div className="relative">
            <MoreHorizontal className="w-5 h-5 stroke-[2]" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#D4A373] text-black text-[9px] font-black flex items-center justify-center shadow-xs">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight font-medium">
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
