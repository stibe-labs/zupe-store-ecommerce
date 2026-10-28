"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

const TURKIYE_NAV_ITEMS = [
  { label: "ഓഫർ പാക്കേജുകൾ (Offers)", href: "/#offers" },
  { label: "ഗുണങ്ങൾ (Benefits)", href: "/#benefits" },
  { label: "ഉപയോഗം (How to Use)", href: "/#how-to-use" },
  { label: "റീഫണ്ട് ഗ്യാരണ്ടി", href: "/#guarantee" },
  { label: "കസ്റ്റമർ റിവ്യൂസ്", href: "/#reviews" },
  { label: "ഓർഡർ ട്രാക്കിംഗ്", href: "/order-tracking" },
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
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [mobileMenuOpen]);

  const { totalItems, openCart } = useCart();
  const { totalWishlistItems } = useWishlist();
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
    <header className="w-full bg-white border-b border-rose-100 sticky top-0 z-40 shadow-xs">
      {/* Main Header Container */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2">
        <div className="flex items-center justify-between gap-4 min-h-[50px]">
          {/* Mobile Menu Toggle & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 -ml-1 text-gray-800 hover:text-[#780016] md:hidden transition-colors"
              aria-label="Open Menu"
            >
              <Menu className="w-6 h-6 stroke-[2.2]" />
            </button>

            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2 group" aria-label="Turkiye Jam">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#780016] to-[#4a000e] text-white flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
                🇹🇷
              </div>
              <div className="flex flex-col text-left">
                <span className="text-base sm:text-xl font-black tracking-tight text-[#780016] group-hover:text-[#9e1b32] transition-colors leading-tight">
                  TURKIYE JAM
                </span>
                <span className="text-[10px] sm:text-[11px] text-amber-700 font-bold tracking-wider -mt-0.5">
                  തുർക്കി ജാം • 100% ഒറിജിനൽ
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-700">
            {TURKIYE_NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-[#780016] transition-colors py-1 hover:border-b-2 hover:border-[#780016]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Action Icons: WhatsApp Order, Account, Cart */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            {/* WhatsApp Quick Order button */}
            <a
              href="https://wa.me/919744122853?text=Hi%2C%20I%20want%20to%20order%20Turkiye%20Jam"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp Order</span>
            </a>

            {/* Account */}
            <button
              onClick={handleAccountClick}
              className="p-2 text-gray-700 hover:text-[#780016] hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
              aria-label="Account"
            >
              <User className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2 text-gray-800 hover:text-[#780016] hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
              {totalItems > 0 && (
                <span className="absolute 0 top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#780016] text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white shadow-xs">
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
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-5 z-10">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇹🇷</span>
                  <div className="flex flex-col text-left">
                    <span className="text-base font-extrabold text-[#780016]">TURKIYE JAM</span>
                    <span className="text-[10px] text-amber-700 font-semibold">തുർക്കി ജാം • ഒറിജിനൽ</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-black rounded-lg"
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
                    className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-800 hover:bg-rose-50 hover:text-[#780016] transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-3">
              <a
                href="https://wa.me/919744122853?text=Hi%2C%20I%20want%20to%20order%20Turkiye%20Jam"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-md hover:bg-emerald-700 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp വഴി ഓർഡർ ചെയ്യുക</span>
              </a>

              <p className="text-center text-xs text-gray-400">
                100% Original Turkish Import • Kerala Fast Delivery
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
