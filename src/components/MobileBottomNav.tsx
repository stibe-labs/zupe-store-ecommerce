"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Store,
  Search,
  Home,
  ShoppingBag,
  User,
  X,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, openCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isSearchOpen, openSearch } = useSearch();

  // Hide bottom bar on admin dashboard and during checkout flow
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/checkout") ||
    pathname?.match(/^\/products\/[^?]+/) // Hide on single product page so sticky 'Buy Now' bar is unobstructed
  ) {
    return null;
  }

  // Active status helper
  const isShopActive = pathname?.startsWith("/products") && !isSearchOpen;
  const isHomeActive = pathname === "/" && !isSearchOpen;
  const isAccountActive =
    (pathname === "/account" || pathname === "/signin" || pathname === "/login") &&
    !isSearchOpen;

  const handleAccountClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push("/account");
    } else {
      router.push(
        "/signin?redirect=/account&notice=Please sign in to view your profile and orders"
      );
    }
  };

  return (
    <>
      {/* Main Sticky Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-gray-100/90 shadow-[0_-4px_25px_rgba(0,0,0,0.06)]"
      >
        <div className="grid grid-cols-5 items-center justify-items-center h-16 px-1 pb-[max(env(safe-area-inset-bottom),0px)] relative">
          {/* 1. Shop (All Products) */}
          <Link
            href="/products"
            className={`flex flex-col items-center justify-center w-full h-full py-1 transition-colors ${
              isShopActive ? "text-[#FF7A00]" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Store className={`w-5 h-5 ${isShopActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
            <span
              className={`text-[10px] mt-1 ${
                isShopActive ? "font-bold text-[#FF7A00]" : "font-medium text-gray-500"
              }`}
            >
              Shop
            </span>
          </Link>

          {/* 2. Search (Triggers animated Collections search modal!) */}
          <button
            type="button"
            onClick={openSearch}
            className={`flex flex-col items-center justify-center w-full h-full py-1 transition-colors cursor-pointer ${
              isSearchOpen ? "text-[#FF7A00]" : "text-gray-400 hover:text-gray-600"
            }`}
            aria-label="Search products"
          >
            <Search className={`w-5 h-5 ${isSearchOpen ? "stroke-[2.5]" : "stroke-[2]"}`} />
            <span
              className={`text-[10px] mt-1 ${
                isSearchOpen ? "font-bold text-[#FF7A00]" : "font-medium text-gray-500"
              }`}
            >
              Search
            </span>
          </button>

          {/* 3. Home (Raised Center Circle - Exact Match to Reference Image) */}
          <Link
            href="/"
            className="flex flex-col items-center justify-center relative -top-3.5 group"
            aria-label="Go to Home"
          >
            <div
              className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-transform group-active:scale-95 border-4 border-white ${
                isHomeActive
                  ? "bg-[#111827] shadow-black/25 ring-2 ring-[#FF7A00]/40"
                  : "bg-[#111827] shadow-black/15 opacity-90"
              }`}
            >
              <Home className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight ${
                isHomeActive ? "font-bold text-[#111111]" : "font-semibold text-gray-500"
              }`}
            >
              Home
            </span>
          </Link>

          {/* 4. Bag (Slide open CartDrawer!) */}
          <button
            type="button"
            onClick={openCart}
            className="flex flex-col items-center justify-center w-full h-full py-1 transition-colors relative text-gray-400 hover:text-[#FF7A00] anim-tap-bounce active:text-[#FF7A00] cursor-pointer"
            aria-label="Open Shopping Bag"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-[#E02B2B] text-white text-[9px] font-extrabold flex items-center justify-center leading-none border-2 border-white shadow-xs">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium text-gray-500">
              Bag
            </span>
          </button>

          {/* 5. Account (Profile if signed in, else Sign In) */}
          <button
            onClick={handleAccountClick}
            className={`flex flex-col items-center justify-center w-full h-full py-1 transition-colors ${
              isAccountActive ? "text-[#FF7A00]" : "text-gray-400 hover:text-gray-600"
            }`}
            aria-label="Account details"
          >
            <User
              className={`w-5 h-5 ${isAccountActive ? "stroke-[2.5]" : "stroke-[2]"}`}
            />
            <span
              className={`text-[10px] mt-1 ${
                isAccountActive ? "font-bold text-[#FF7A00]" : "font-medium text-gray-500"
              }`}
            >
              Account
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
