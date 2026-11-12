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
      className="md:hidden fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 bg-white/95 backdrop-blur-xl border border-neutral-200/80 rounded-full py-2 px-3 shadow-[0_10px_35px_rgba(0,0,0,0.08)] select-none font-mograph"
    >
      <div className="grid grid-cols-5 items-center justify-items-center w-full">
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
            isHome ? "text-[#6B9E3A]" : "text-neutral-400 hover:text-neutral-700"
          }`}
          aria-label="Home"
        >
          <Home
            className={`w-5 h-5 transition-transform duration-200 ${
              isHome ? "stroke-[2.2] fill-[#6B9E3A] scale-105" : "stroke-[1.8]"
            }`}
          />
          <span
            className={`text-[10px] tracking-tight ${
              isHome ? "font-bold text-[#6B9E3A]" : "font-medium"
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
            isCategories ? "text-[#6B9E3A]" : "text-neutral-400 hover:text-neutral-700"
          }`}
          aria-label="Categories"
        >
          <LayoutGrid
            className={`w-5 h-5 transition-transform duration-200 ${
              isCategories ? "stroke-[2.2] scale-105" : "stroke-[1.8]"
            }`}
          />
          <span
            className={`text-[10px] tracking-tight ${
              isCategories ? "font-bold text-[#6B9E3A]" : "font-medium"
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
            isWishlist ? "text-[#6B9E3A]" : "text-neutral-400 hover:text-neutral-700"
          }`}
          aria-label="Wishlist"
        >
          <div className="relative">
            <Heart
              className={`w-5 h-5 transition-transform duration-200 ${
                isWishlist
                  ? "stroke-[2.2] fill-[#6B9E3A]/20 scale-105"
                  : "stroke-[1.8]"
              }`}
            />
            {totalWishlistItems > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#6B9E3A] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                {totalWishlistItems > 9 ? "9+" : totalWishlistItems}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] tracking-tight ${
              isWishlist ? "font-bold text-[#6B9E3A]" : "font-medium"
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
            isAccount ? "text-[#6B9E3A]" : "text-neutral-400 hover:text-neutral-700"
          }`}
          aria-label="Account"
        >
          <User
            className={`w-5 h-5 transition-transform duration-200 ${
              isAccount ? "stroke-[2.2] scale-105" : "stroke-[1.8]"
            }`}
          />
          <span
            className={`text-[10px] tracking-tight ${
              isAccount ? "font-bold text-[#6B9E3A]" : "font-medium"
            }`}
          >
            Account
          </span>
        </button>

        {/* 5. More (opens Cart Drawer & Quick Bag) */}
        <button
          type="button"
          onClick={openCart}
          className="relative flex flex-col items-center justify-center gap-1 transition-all duration-200 py-1 px-2 touch-manipulation focus:outline-none text-neutral-400 hover:text-neutral-700"
          aria-label="Cart & More"
        >
          <div className="relative">
            <MoreHorizontal className="w-5 h-5 stroke-[2]" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#6B9E3A] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
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
