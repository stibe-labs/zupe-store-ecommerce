"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  ChevronDown,
  X,
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";

const CATEGORY_NAV = [
  { label: "Home", href: "/" },
  { label: "New Arrivals", href: "/products?filter=new" },
  { label: "Best Sellers", href: "/products?filter=best" },
  { label: "Gadgets", href: "/products?category=Gadgets" },
  { label: "Home & Living", href: "/products?category=Home+%26+Living" },
  { label: "Health & Wellness", href: "/products?category=Health+%26+Wellness" },
  { label: "Personal Care", href: "/products?category=Personal+Care" },
  { label: "Car Accessories", href: "/products?category=Car+Accessories" },
  { label: "Offers", href: "/products?filter=offers" },
  { label: "Order Tracking", href: "/order-tracking" },
];

function NavbarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { totalItems, openCart } = useCart();
  const { totalWishlistItems } = useWishlist();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const { openSearch } = useSearch();

  const isItemActive = (href: string) => {
    if (href === "/") {
      return (
        pathname === "/" &&
        !searchParams?.get("filter") &&
        !searchParams?.get("category")
      );
    }
    if (href === "/order-tracking" || href === "/track-order") {
      return pathname === "/order-tracking" || pathname === "/track-order";
    }
    if (!pathname.startsWith("/products")) return false;

    const [_, targetQuery] = href.split("?");
    if (!targetQuery) {
      return (
        pathname === "/products" &&
        !searchParams?.get("filter") &&
        !searchParams?.get("category")
      );
    }

    const targetParams = new URLSearchParams(targetQuery);
    const targetFilter = targetParams.get("filter");
    const targetCategory = targetParams.get("category");

    const currentFilter = searchParams?.get("filter");
    const currentCategory = searchParams?.get("category");

    if (targetFilter) {
      if (targetFilter === "offers" || targetFilter === "deals") {
        return currentFilter === "offers" || currentFilter === "deals";
      }
      return currentFilter?.toLowerCase() === targetFilter.toLowerCase();
    }

    if (targetCategory) {
      return currentCategory?.toLowerCase() === targetCategory.toLowerCase();
    }

    return false;
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      {/* Main Header Row */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
        {/* Mobile View Header */}
        <div className="flex sm:hidden items-center justify-between relative min-h-[48px]">
          {/* Left: Hamburger Menu + Search Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 -ml-1 text-gray-900 hover:text-[#FA521C] transition-colors"
              aria-label="Open Menu"
            >
              <Menu className="w-6 h-6 stroke-[2.2]" />
            </button>

            <button
              onClick={openSearch}
              className="p-1.5 text-gray-900 hover:text-[#FA521C] transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>

          {/* Center: Increased size Logo without 'Zupestore' text */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-center">
            <Link href="/" className="flex items-center justify-center" aria-label="Zupe Store">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <Image
                  src="/zupe-logo.png"
                  alt="Zupe Store"
                  width={58}
                  height={58}
                  className="object-contain w-full h-full"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Right: Wishlist + Cart */}
          <div className="flex items-center gap-3">
            <Link
              href="/wishlist"
              className="relative p-1 text-gray-900 hover:text-[#FA521C] transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[2.2]" />
              {totalWishlistItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#E02B2B] text-white text-[10px] font-extrabold flex items-center justify-center leading-none shadow-sm">
                  {totalWishlistItems}
                </span>
              )}
            </Link>

            <button
              onClick={openCart}
              className="relative p-1 text-gray-900 hover:text-[#FA521C] transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#E02B2B] text-white text-[10px] font-extrabold flex items-center justify-center leading-none shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop View Header */}
        <div className="hidden sm:flex items-center justify-between gap-4 lg:gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center">
              <Image
                src="/zupe-logo.png"
                alt="Zupe Store"
                width={48}
                height={48}
                className="object-contain transition-transform group-hover:scale-105"
                priority
              />
            </div>
            <span className="font-display font-black text-2xl sm:text-[27px] tracking-tight text-[#111111]">
              Zupe<span className="text-[#FA521C]">store</span>
            </span>
          </Link>

          {/* Search Bar (Center, Triggers Animated Search Modal with Collections) */}
          <div
            onClick={openSearch}
            className="flex-1 max-w-2xl relative cursor-pointer group"
          >
            <div className="w-full relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-gray-400 group-hover:text-[#FA521C] transition-colors pointer-events-none stroke-[2.2]" />
              <input
                type="text"
                readOnly
                placeholder="Search products, lamps, gadgets, collections..."
                className="w-full pl-11 pr-24 py-2.5 rounded-full border border-gray-200 bg-[#FAFAFA] text-sm text-[#111111] placeholder:text-gray-400 cursor-pointer group-hover:border-[#FA521C]/50 group-hover:bg-white transition-all shadow-inner select-none"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-orange-50 text-[#FA521C] text-xs font-bold border border-[#FA521C]/20 flex items-center gap-1 group-hover:bg-[#FA521C] group-hover:text-white transition-all">
                <span>Search</span>
                <Sparkles className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Right Action Icons: Account, Wishlist, Cart */}
          <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
            {/* Account */}
            <div className="relative">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setUserDropdownOpen(!userDropdownOpen);
                  } else {
                    router.push("/signin");
                  }
                }}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#FA521C] transition-colors py-1"
              >
                <User className="w-5 h-5 text-gray-700" />
                <span className="hidden md:inline">
                  {isAuthenticated ? (user?.name?.split(" ")[0] || "Account") : "Account"}
                </span>
              </button>

              {userDropdownOpen && isAuthenticated && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    href="/orders"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    Wishlist
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 border-t border-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#FA521C] transition-colors relative py-1"
            >
              <Heart className="w-5 h-5 text-gray-700" />
              <span className="hidden md:inline">Wishlist</span>
              {totalWishlistItems > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 rounded-full bg-[#E02B2B] text-white text-[10px] font-extrabold flex items-center justify-center">
                  {totalWishlistItems}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#FA521C] transition-colors relative py-1"
              aria-label="View Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-gray-700" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#E02B2B] text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden md:inline font-bold">Cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Category Sub-Nav Row */}
      <div className="border-t border-gray-100 hidden sm:block bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between text-xs font-semibold">
            {/* All Categories Dropdown button */}
            <Link
              href="/products"
              className={`flex items-center gap-2 py-3 px-3 font-bold transition-colors border-r border-gray-100 mr-4 ${
                pathname === "/products" &&
                !searchParams?.get("filter") &&
                (!searchParams?.get("category") || searchParams?.get("category") === "All")
                  ? "text-[#FA521C]"
                  : "text-gray-900 hover:text-[#FA521C]"
              }`}
            >
              <Menu className="w-4 h-4 text-current" />
              <span>All Categories</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-6 overflow-x-auto scrollbar-none py-1">
              {CATEGORY_NAV.map((item) => {
                const active = isItemActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`py-3 whitespace-nowrap transition-colors relative ${
                      active
                        ? "text-[#FA521C] font-bold"
                        : "text-gray-700 hover:text-[#FA521C] font-medium"
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FA521C] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Slide-in Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full z-10 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <Image
                      src="/zupe-logo.png"
                      alt="Zupe Store"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <span className="font-display font-black text-xl text-gray-900">
                    Zupe<span className="text-[#FA521C]">store</span>
                  </span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-1">
                {CATEGORY_NAV.map((item) => {
                  const active = isItemActive(item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors ${
                        active
                          ? "bg-[#FA521C]/10 text-[#FA521C] font-bold"
                          : "text-gray-700 hover:bg-[#FA521C]/10 hover:text-[#FA521C]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 text-xs text-gray-500">
              <p>Need Help? +91 98765 43210</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function Navbar() {
  return (
    <React.Suspense
      fallback={
        <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm h-16 sm:h-[105px]" />
      }
    >
      <NavbarContent />
    </React.Suspense>
  );
}
