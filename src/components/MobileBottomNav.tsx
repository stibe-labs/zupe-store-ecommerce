"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  ShoppingBag,
  Heart,
  User,
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
  const isWishlist = pathname === "/wishlist";
  const isAccount =
    pathname === "/account" ||
    pathname === "/signin" ||
    pathname === "/login";

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-5 left-5 right-5 max-w-[340px] mx-auto z-40 bg-white/95 backdrop-blur-xl border border-neutral-100 rounded-full py-1.5 px-2 shadow-[0_10px_30px_rgba(0,0,0,0.12)] select-none font-mograph"
    >
      <div className="flex items-center justify-between w-full">
        {/* 1. Home */}
        {isHome ? (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 bg-[#EAF3DE] rounded-full py-1.5 pl-1.5 pr-3.5 transition-all duration-300 shadow-2xs"
            aria-label="Home (Active)"
          >
            <div className="w-8 h-8 rounded-full bg-[#8EBF47] flex items-center justify-center text-[#15230D] shrink-0 shadow-2xs">
              <Home className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="font-bold text-xs sm:text-sm text-[#15230D] tracking-tight">
              Home
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:text-black transition-colors cursor-pointer"
            aria-label="Home"
          >
            <Home className="w-5 h-5 stroke-[1.8]" />
          </button>
        )}

        {/* 2. Shopping Bag / Cart */}
        <button
          type="button"
          onClick={openCart}
          className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:text-black transition-colors cursor-pointer relative"
          aria-label="Shopping Cart"
        >
          <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
          {totalItems > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#8EBF47]" />
          )}
        </button>

        {/* 3. Wishlist */}
        {isWishlist ? (
          <button
            type="button"
            className="flex items-center gap-2 bg-[#EAF3DE] rounded-full py-1.5 pl-1.5 pr-3.5 transition-all duration-300 shadow-2xs"
            aria-label="Wishlist (Active)"
          >
            <div className="w-8 h-8 rounded-full bg-[#8EBF47] flex items-center justify-center text-[#15230D] shrink-0 shadow-2xs">
              <Heart className="w-4 h-4 stroke-[2.2] fill-[#15230D]" />
            </div>
            <span className="font-bold text-xs sm:text-sm text-[#15230D] tracking-tight">
              Wishlist
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => router.push("/wishlist")}
            className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:text-black transition-colors cursor-pointer relative"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5 stroke-[1.8]" />
            {totalWishlistItems > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#8EBF47]" />
            )}
          </button>
        )}

        {/* 4. Account */}
        {isAccount ? (
          <button
            type="button"
            className="flex items-center gap-2 bg-[#EAF3DE] rounded-full py-1.5 pl-1.5 pr-3.5 transition-all duration-300 shadow-2xs"
            aria-label="Account (Active)"
          >
            <div className="w-8 h-8 rounded-full bg-[#8EBF47] flex items-center justify-center text-[#15230D] shrink-0 shadow-2xs">
              <User className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="font-bold text-xs sm:text-sm text-[#15230D] tracking-tight">
              Account
            </span>
          </button>
        ) : (
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
            className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:text-black transition-colors cursor-pointer"
            aria-label="Account"
          >
            <User className="w-5 h-5 stroke-[1.8]" />
          </button>
        )}
      </div>
    </nav>
  );
}
