"use client";

import React, { useState, useEffect } from "react";
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
  const [navCategories, setNavCategories] = useState<{ label: string; href: string }[]>(CATEGORY_NAV);

  useEffect(() => {
    fetch("/api/content/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          const activeNavCats = data.categories
            .filter((c: any) => c.active !== false && c.showInNavbar !== false)
            .map((c: any) => ({
              label: c.name,
              href: `/products?category=${encodeURIComponent(c.slug || c.name)}`,
            }));

          setNavCategories([
            { label: "Home", href: "/" },
            { label: "New Arrivals", href: "/products?filter=new" },
            { label: "Best Sellers", href: "/products?filter=best" },
            ...activeNavCats,
            { label: "Offers", href: "/products?filter=offers" },
            { label: "Order Tracking", href: "/order-tracking" },
          ]);
        }
      })
      .catch((err) => console.warn("Failed to fetch dynamic categories for navbar:", err));
  }, []);

  const { totalItems, openCart } = useCart();
  const { totalWishlistItems } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const { openSearch } = useSearch();

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

          {/* Right: Wishlist + Cart with tap micro-animations */}
          <div className="flex items-center gap-3">
            <Link
              href="/wishlist"
              className="relative p-1.5 text-gray-900 anim-tap-bounce active:text-[#FF3B30] transition-all cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[2.2] active:fill-[#FF3B30]/30 active:scale-90 transition-all duration-150" />
              {totalWishlistItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#E02B2B] text-white text-[10px] font-extrabold flex items-center justify-center leading-none shadow-sm">
                  {totalWishlistItems}
                </span>
              )}
            </Link>

            <button
              onClick={openCart}
              className="relative p-1.5 text-gray-900 anim-tap-bounce active:text-[#FA521C] transition-all cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2.2] active:rotate-12 active:scale-90 transition-all duration-150" />
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
          {/* Logo: Increased size without 'Zupestore' text */}
          <Link href="/" className="flex items-center flex-shrink-0 group" aria-label="Zupe Store">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-[68px] lg:h-[68px] flex items-center justify-center">
              <Image
                src="/zupe-logo.png"
                alt="Zupe Store"
                width={68}
                height={68}
                className="object-contain w-full h-full transition-transform group-hover:scale-105"
                priority
              />
            </div>
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
            {/* Account (Redirects directly to /account like mobile view) */}
            <button
              onClick={handleAccountClick}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#FA521C] transition-colors py-1 group/account cursor-pointer"
              aria-label="Account"
            >
              <div className="relative p-1 rounded-full group-hover/account:bg-orange-50 transition-colors">
                <User className="w-5 h-5 text-gray-700 group-hover/account:text-[#FA521C] anim-user-hover transition-colors" />
              </div>
              <span className="hidden md:inline">
                {isAuthenticated ? (user?.name?.split(" ")[0] || "Account") : "Account"}
              </span>
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#FA521C] transition-colors relative py-1 group/wishlist"
            >
              <div className="relative p-1 rounded-full group-hover/wishlist:bg-rose-50 transition-colors">
                <Heart className="w-5 h-5 text-gray-700 group-hover/wishlist:text-[#FF3B30] group-hover/wishlist:fill-[#FF3B30]/20 anim-heart-hover transition-colors" />
              </div>
              <span className="hidden md:inline">Wishlist</span>
              {totalWishlistItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#E02B2B] text-white text-[10px] font-extrabold flex items-center justify-center transition-transform group-hover/wishlist:scale-110 shadow-xs">
                  {totalWishlistItems}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#FA521C] transition-colors relative py-1 group/cart cursor-pointer"
              aria-label="View Cart"
            >
              <div className="relative p-1 rounded-full group-hover/cart:bg-orange-50 transition-colors">
                <ShoppingBag className="w-5 h-5 text-gray-700 group-hover/cart:text-[#FA521C] anim-cart-hover transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 rounded-full bg-[#E02B2B] text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white transition-transform group-hover/cart:scale-110 shadow-xs">
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
              {navCategories.map((item) => {
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
                {navCategories.map((item) => {
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
