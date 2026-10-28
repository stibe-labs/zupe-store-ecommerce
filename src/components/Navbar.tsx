"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingBag,
  User,
  Menu,
  X,
  Phone,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const TURKIYE_NAV_ITEMS = [
  { label: "HOME", href: "/" },
  { label: "SHOP", href: "/#offers" },
  { label: "STORY", href: "/#story" },
  { label: "REVIEWS", href: "/#reviews" },
  { label: "USAGE", href: "/#usage" },
  { label: "FAQ", href: "/#faq" },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add("modal-open");
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.classList.remove("modal-open");
        document.documentElement.classList.remove("modal-open");
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [mobileMenuOpen]);

  const { totalItems, openCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const handleAccountClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push("/account");
    } else {
      router.push("/signin?redirect=/account");
    }
  };

  return (
    <header className="sticky top-2 sm:top-3 z-40 px-3 sm:px-6 max-w-6xl mx-auto w-full transition-all duration-300">
      {/* Floating Apple-Style Liquid Frosted Glass Capsule */}
      <div className="liquid-glass-elevated rounded-full px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-4">
        
        {/* Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-1 text-white/80 hover:text-white md:hidden transition-colors rounded-full hover:bg-white/10"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 stroke-[2]" />
          </button>

          {/* Standalone Brand Logo Cutout */}
          <Link href="/" className="inline-flex items-center group py-0.5" aria-label="Turkiye Jam Homepage">
            <div className="relative h-10 sm:h-11 w-22 sm:w-26 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Image
                src="/turkiye-jam-logo.png"
                alt="Turkiye Jam"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Desktop Nav Links (Clean Apple-Style Floating Pills) */}
        <nav className="hidden md:flex items-center gap-1 text-xs sm:text-sm font-medium text-stone-300">
          {TURKIYE_NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/10 transition-all"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Action Icons: WhatsApp Care, Account, Cart Pill */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* WhatsApp Quick Order button */}
          <a
            href="https://wa.me/919744122853?text=Hi%2C%20I%20want%20to%20order%20Turkiye%20Jam"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-stone-200 hover:text-white text-xs font-semibold transition-all active:scale-95"
          >
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span className="hidden lg:inline">WhatsApp Care</span>
          </a>

          {/* User Account */}
          <button
            onClick={handleAccountClick}
            className="p-2 text-stone-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="User Account"
          >
            <User className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Liquid Glass Cart Pill */}
          <button
            onClick={openCart}
            className="relative px-3.5 py-1.5 rounded-full bg-[#cb0805] hover:bg-[#a80604] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#cb0805]/30 hover:shadow-[#cb0805]/50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-white text-[#cb0805] text-[10px] font-black flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* iOS-Style Fluid Glass Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-stone-950/95 backdrop-blur-3xl border-r border-white/15 h-full shadow-2xl flex flex-col justify-between p-6 z-10 text-white">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                <div className="relative h-11 w-24 shrink-0 flex items-center justify-center">
                  <Image
                    src="/turkiye-jam-logo.png"
                    alt="Turkiye Jam Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-full hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {TURKIYE_NAV_ITEMS.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-2xl text-sm font-semibold text-stone-200 hover:bg-[#cb0805]/20 hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="pt-5 border-t border-white/10 space-y-3">
              <a
                href="https://wa.me/919744122853?text=Hi%2C%20I%20want%20to%20order%20Turkiye%20Jam"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp Care (+91 97441 22853)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
