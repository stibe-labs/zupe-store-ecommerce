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
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, openCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Hide bottom bar on admin dashboard and during checkout flow
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/checkout") ||
    pathname?.match(/^\/products\/[^?]+/) // Hide on single product page so sticky 'Buy Now' bar is unobstructed
  ) {
    return null;
  }

  // Active status helper
  const isShopActive = pathname?.startsWith("/products") && !searchModalOpen;
  const isHomeActive = pathname === "/" && !searchModalOpen;
  const isAccountActive =
    (pathname === "/account" || pathname === "/signin" || pathname === "/login") &&
    !searchModalOpen;

  const handleSearchClick = () => {
    setSearchModalOpen(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchModalOpen(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchModalOpen(false);
    router.push(`/products?search=${encodeURIComponent(tag)}`);
    setSearchQuery("");
  };

  const liveResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return DEFAULT_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q)
    ).slice(0, 4);
  }, [searchQuery]);

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
      {/* Search Overlay Sheet (when search clicked) */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 sm:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div
            className="flex-1"
            onClick={() => setSearchModalOpen(false)}
          />

          <div className="bg-white rounded-t-3xl p-5 shadow-2xl max-h-[80vh] flex flex-col animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#FA521C]" />
                <span className="text-sm font-bold text-gray-900 font-display">
                  Search Zupe Store
                </span>
              </div>
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSearchSubmit} className="mt-3 relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, lamps, gadgets..."
                className="w-full pl-4 pr-12 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-[#FA521C] focus:bg-white"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-[#FA521C] text-white"
                aria-label="Submit search"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Live Matches or Trending Tags */}
            <div className="mt-4 overflow-y-auto flex-1">
              {liveResults.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                    Quick Results
                  </span>
                  {liveResults.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.id}`}
                      onClick={() => setSearchModalOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        <Image
                          src={p.poster_image || p.images[0]}
                          alt={p.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {p.name}
                        </p>
                        <p className="text-[11px] font-bold text-[#FA521C]">
                          ₹{p.price.toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                    Popular Searches
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Water Ripple Lamp",
                      "Mini Steam Iron",
                      "Heating Pad",
                      "Nebulizer",
                      "Gadgets",
                      "Offers",
                    ].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagClick(tag)}
                        className="px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-700 hover:bg-orange-50 hover:text-[#FA521C] transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
              isShopActive ? "text-[#FA521C]" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Store className={`w-5 h-5 ${isShopActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
            <span
              className={`text-[10px] mt-1 ${
                isShopActive ? "font-bold text-[#FA521C]" : "font-medium text-gray-500"
              }`}
            >
              Shop
            </span>
          </Link>

          {/* 2. Search */}
          <button
            type="button"
            onClick={handleSearchClick}
            className={`flex flex-col items-center justify-center w-full h-full py-1 transition-colors ${
              searchModalOpen ? "text-[#FA521C]" : "text-gray-400 hover:text-gray-600"
            }`}
            aria-label="Search products"
          >
            <Search className={`w-5 h-5 ${searchModalOpen ? "stroke-[2.5]" : "stroke-[2]"}`} />
            <span
              className={`text-[10px] mt-1 ${
                searchModalOpen ? "font-bold text-[#FA521C]" : "font-medium text-gray-500"
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
                  ? "bg-[#111827] shadow-black/25 ring-2 ring-[#FA521C]/40"
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
            className="flex flex-col items-center justify-center w-full h-full py-1 transition-colors relative text-gray-400 hover:text-[#FA521C] cursor-pointer"
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
              isAccountActive ? "text-[#FA521C]" : "text-gray-400 hover:text-gray-600"
            }`}
            aria-label="Account details"
          >
            <User
              className={`w-5 h-5 ${isAccountActive ? "stroke-[2.5]" : "stroke-[2]"}`}
            />
            <span
              className={`text-[10px] mt-1 ${
                isAccountActive ? "font-bold text-[#FA521C]" : "font-medium text-gray-500"
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
