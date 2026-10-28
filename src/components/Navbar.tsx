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
  { label: "Products", href: "/#offers" },
  { label: "Story", href: "/#story" },
  { label: "Benefits", href: "/#benefits" },
  { label: "How to Use", href: "/#usage" },
  { label: "Reviews", href: "/#reviews" },
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
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-40 shadow-xs">
      {/* Main Header Container */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-6 min-h-[52px]">
          {/* Mobile Menu Toggle & Brand */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-1.5 text-stone-800 hover:text-[#3F6650] md:hidden transition-colors rounded-lg hover:bg-stone-100"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6 stroke-[2]" />
            </button>

            {/* Brand Logo & Signature Wordmark */}
            <Link href="/" className="flex items-center gap-3 group" aria-label="Turkiye Jam Homepage">
              <div className="relative h-10 w-13 sm:h-11 sm:w-15 shrink-0 overflow-hidden rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Image
                  src="/turkiye-jam-logo.png"
                  alt="Turkiye Jam Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A2E22] group-hover:text-[#3F6650] transition-colors leading-none font-sans">
                  turkiye jam
                </span>
                <span className="text-[10px] text-[#3F6650] font-semibold tracking-widest uppercase mt-0.5">
                  Themra Herbal Macun
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links (Clean, Centered, Matches Reference) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-700">
            {TURKIYE_NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-[#3F6650] transition-colors py-1 hover:border-b-2 hover:border-[#3F6650]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Action Icons: WhatsApp Order, Account, Cart */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* WhatsApp Quick Order button */}
            <a
              href="https://wa.me/919744122853?text=Hi%2C%20I%20want%20to%20order%20Turkiye%20Jam"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3F6650] hover:bg-[#325240] text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp Care</span>
            </a>

            {/* Account */}
            <button
              onClick={handleAccountClick}
              className="p-2.5 text-stone-700 hover:text-[#3F6650] hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              aria-label="User Account"
            >
              <User className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2.5 text-stone-800 hover:text-[#3F6650] hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#3F6650] text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-6 z-10">
            <div>
              <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md flex items-center justify-center">
                    <Image
                      src="/turkiye-jam-logo.png"
                      alt="Turkiye Jam Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-base font-bold text-[#1A2E22] font-sans">turkiye jam</span>
                    <span className="text-[10px] text-[#3F6650] font-semibold tracking-wider">Original Turkish Paste</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-stone-500 hover:text-black rounded-lg"
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
                    className="block px-3.5 py-3 rounded-xl text-sm font-semibold text-stone-800 hover:bg-[#EBF2EC] hover:text-[#3F6650] transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="pt-5 border-t border-stone-200 space-y-3">
              <a
                href="https://wa.me/919744122853?text=Hi%2C%20I%20want%20to%20order%20Turkiye%20Jam"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Order via WhatsApp</span>
              </a>

              <p className="text-center text-xs text-stone-500">
                100% Authentic Turkish Import • Express Delivery
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
