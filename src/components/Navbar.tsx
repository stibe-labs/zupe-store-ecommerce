"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const router = useRouter();
  const { totalItems, openCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAccountClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push("/account");
    } else {
      router.push("/signin?redirect=/account");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300 pointer-events-none -mb-18 sm:-mb-22">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between">
        
        {/* Left Side: Brand Logo ONLY */}
        <Link
          href="/"
          className="pointer-events-auto inline-flex items-center group py-1"
          aria-label="Turkiye Jam Homepage"
        >
          <div className="relative h-11 sm:h-13 w-28 sm:w-34 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform drop-shadow-md">
            <Image
              src="/turkiye-jam-logo.png"
              alt="Turkiye Jam"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Right Side: Profile & Cart Buttons ONLY */}
        <div className="flex items-center gap-2.5 sm:gap-3 pointer-events-auto shrink-0">
          {/* User Account / Profile Button */}
          <button
            onClick={handleAccountClick}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-white border border-white/20 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
            aria-label="User Account"
          >
            <User className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Cart Button */}
          <button
            onClick={openCart}
            className="px-4 sm:px-4.5 py-2 sm:py-2.5 rounded-full bg-[#cb0805] hover:bg-[#a80604] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#cb0805]/40 border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-white text-[#cb0805] text-[10px] font-black flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
