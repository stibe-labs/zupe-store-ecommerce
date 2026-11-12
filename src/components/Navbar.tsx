"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Dumbbell,
  Shirt,
  Sparkles,
  ArrowRight,
  Crown,
  Cookie,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";
import { useWishlist } from "@/context/WishlistContext";
import { siteConfig } from "@/config/siteConfig";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems, subtotal, openCart } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { openSearch } = useSearch();
  const { totalWishlistItems } = useWishlist();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopFlyoutOpen, setShopFlyoutOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const flyoutRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut (⌘K or / to open search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      } else if (
        e.key === "/" &&
        (e.target as HTMLElement).tagName !== "INPUT" &&
        (e.target as HTMLElement).tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openSearch]);

  // Close flyout when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target as Node)) {
        setShopFlyoutOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAccountClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push("/account");
    } else {
      openAuthModal("login");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchInput.trim())}`);
    } else {
      openSearch();
    }
  };

  // Curated category mega-flyout items
  const categoryFlyout = [
    {
      name: "Gym Supplementaries",
      tagline: "Whey Isolate, Creatine & Pre-workout",
      href: "/products?category=Gym+Supplementaries",
      icon: Dumbbell,
    },
    {
      name: "Outfits & Athleisure",
      tagline: "Performance fit, 4-way stretch gym sets",
      href: "/products?category=Outfits",
      icon: Sparkles,
    },
    {
      name: "Apparels & Tees",
      tagline: "Heavyweight streetwear & oversized fits",
      href: "/products?category=Apparels",
      icon: Shirt,
    },
    {
      name: "Royal Dates & Superfoods",
      tagline: "Exotic Ajwa, Medjool & gourmet raw dry fruits",
      href: "/products?category=Dates+%26+Nuts",
      icon: Crown,
    },
    {
      name: "Candy & Dark Chocolates",
      tagline: "Artisanal 70% dark cocoa & protein bites",
      href: "/products?category=Candy+%26+Chocolates",
      icon: Cookie,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white font-mograph select-none border-none shadow-none">
      {/* =================================================================== */}
      {/* SEAMLESS CLEAN WHITE NAVBAR WITH FLOATING CIRCULAR BUTTONS          */}
      {/* =================================================================== */}
      <div className="w-full bg-white pt-3 pb-1.5 sm:pt-4 sm:pb-2">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-6 relative">
          
          {/* =============================================================== */}
          {/* LEFT: FLOATING CIRCULAR HAMBURGER BUTTON / DESKTOP NAV LINKS    */}
          {/* =============================================================== */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Circular White Floating Hamburger Button (matching reference) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] border border-neutral-100 flex items-center justify-center text-neutral-900 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 ml-2">
              {/* Home Link */}
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold tracking-wide transition-all ${
                  pathname === "/"
                    ? "text-[#6B9E3A] bg-[#E5F2D0]/40 font-bold"
                    : "text-neutral-700 hover:text-black hover:bg-[#F4F5F7]"
                }`}
              >
                Home
              </Link>

              {/* Shop Collections Dropdown Flyout */}
              <div
                className="relative"
                ref={flyoutRef}
                onMouseEnter={() => setShopFlyoutOpen(true)}
                onMouseLeave={() => setShopFlyoutOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setShopFlyoutOpen((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold tracking-wide transition-all flex items-center gap-1 cursor-pointer ${
                    shopFlyoutOpen || pathname?.startsWith("/products")
                      ? "text-[#6B9E3A] bg-[#E5F2D0]/40 font-bold"
                      : "text-neutral-700 hover:text-black hover:bg-[#F4F5F7]"
                  }`}
                >
                  <span>Collections</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      shopFlyoutOpen ? "rotate-180 text-[#6B9E3A]" : "text-neutral-500"
                    }`}
                  />
                </button>

                {/* Clean Mega Flyout Menu */}
                {shopFlyoutOpen && (
                  <div className="absolute top-full left-0 mt-2 w-[460px] bg-white border border-neutral-200 rounded-2xl shadow-xl p-4 z-50 backdrop-blur-2xl animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-3 mb-2 border-b border-neutral-100">
                      <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-bold">
                        Curated Departments
                      </span>
                      <Link
                        href="/products"
                        onClick={() => setShopFlyoutOpen(false)}
                        className="text-xs text-[#6B9E3A] hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>View All</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="space-y-1.5">
                      {categoryFlyout.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <Link
                            key={cat.name}
                            href={cat.href}
                            onClick={() => setShopFlyoutOpen(false)}
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4F5F7] transition-all group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-[#F4F5F7] border border-neutral-200/80 flex items-center justify-center text-neutral-700 group-hover:text-[#6B9E3A] group-hover:bg-[#E5F2D0]/40 transition-colors shrink-0">
                                <Icon className="w-4.5 h-4.5" />
                              </div>
                              <div className="truncate">
                                <span className="text-xs font-bold text-neutral-900 group-hover:text-[#6B9E3A] transition-colors truncate block">
                                  {cat.name}
                                </span>
                                <p className="text-[11px] text-neutral-500 truncate">
                                  {cat.tagline}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#6B9E3A] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                          </Link>
                        );
                      })}
                    </div>

                    {/* Mega Menu Footer Callout */}
                    <div className="mt-3 pt-3 border-t border-neutral-100 bg-[#F4F5F7] p-3 rounded-xl border border-neutral-200/70 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-neutral-900">Pure Protein. Maximum Performance.</p>
                        <p className="text-[10px] text-neutral-500">Lab-certified 100% ultra-filtered whey isolate</p>
                      </div>
                      <Link
                        href="/products/whey-protein-isolate"
                        onClick={() => setShopFlyoutOpen(false)}
                        className="px-3 py-1 rounded-lg bg-[#6B9E3A] hover:bg-[#5C8931] text-white font-extrabold text-xs transition-colors shrink-0"
                      >
                        Shop Isolate
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Best Sellers */}
              <Link
                href="/products?sort=best_selling"
                className="px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold tracking-wide text-neutral-700 hover:text-black hover:bg-[#F4F5F7] transition-all"
              >
                Best Sellers
              </Link>

              {/* About Page */}
              <Link
                href="/about"
                className={`px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold tracking-wide transition-all ${
                  pathname === "/about"
                    ? "text-[#6B9E3A] bg-[#E5F2D0]/40 font-bold"
                    : "text-neutral-700 hover:text-black hover:bg-[#F4F5F7]"
                }`}
              >
                About
              </Link>

              {/* Contact Page */}
              <Link
                href="/contact"
                className={`px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold tracking-wide transition-all ${
                  pathname === "/contact"
                    ? "text-[#6B9E3A] bg-[#E5F2D0]/40 font-bold"
                    : "text-neutral-700 hover:text-black hover:bg-[#F4F5F7]"
                }`}
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* =============================================================== */}
          {/* CENTER: VL LOGO (EXACTLY CENTERED MATCHING REFERENCE)           */}
          {/* =============================================================== */}
          <div className="absolute left-1/2 -translate-x-1/2 z-10 shrink-0">
            <Link href="/" className="flex items-center justify-center group cursor-pointer">
              <div className="relative h-10 sm:h-11 w-28 sm:w-32 transition-transform duration-300 group-hover:scale-[1.02]">
                <Image
                  src="/vl-logo-black.png"
                  alt="Vittal Lifestyle"
                  fill
                  className="object-contain object-center"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* =============================================================== */}
          {/* RIGHT: FLOATING CIRCULAR WHITE BUTTONS (Search & Bag)           */}
          {/* =============================================================== */}
          <div className="flex items-center gap-2 sm:gap-2.5 z-20 shrink-0">
            {/* Circular White Floating Search Button */}
            <button
              onClick={openSearch}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] border border-neutral-100 flex items-center justify-center text-neutral-900 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label="Open search"
            >
              <Search className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Desktop Wishlist Pill */}
            <Link
              href="/wishlist"
              className="hidden lg:flex w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] border border-neutral-100 items-center justify-center text-neutral-900 hover:scale-105 active:scale-95 transition-all relative"
              aria-label="Wishlist"
            >
              <Heart
                className={`w-5 h-5 transition-transform ${
                  totalWishlistItems > 0
                    ? "fill-[#6B9E3A] text-[#6B9E3A]"
                    : "text-neutral-900 stroke-[2]"
                }`}
              />
              {totalWishlistItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#6B9E3A] text-white text-[9px] font-black rounded-full min-w-[16px] h-[16px] px-0.5 flex items-center justify-center">
                  {totalWishlistItems}
                </span>
              )}
            </Link>

            {/* Desktop Account Icon */}
            <button
              onClick={handleAccountClick}
              className="hidden lg:flex w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] border border-neutral-100 items-center justify-center text-neutral-900 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label="Account"
            >
              <User className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Circular White Floating Shopping Bag Button with Green Badge */}
            <button
              onClick={openCart}
              className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] border border-neutral-100 flex items-center justify-center text-neutral-900 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
              <span className="absolute -top-1 -right-1 bg-[#72A63D] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow-xs">
                {totalItems > 0 ? totalItems : 1}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MOBILE SLIDE-OUT DRAWER                                             */}
      {/* =================================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white border-r border-neutral-200 text-neutral-900 shadow-2xl flex flex-col z-50 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-white">
              <div className="relative h-9 w-36">
                <Image
                  src="/vl-logo-black.png"
                  alt="Vittal Lifestyle"
                  fill
                  className="object-contain object-left"
                />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Search Button in Drawer */}
            <div className="p-4 pb-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openSearch();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-[#F4F5F7] border border-neutral-200 text-neutral-600 text-xs text-left"
              >
                <Search className="w-4 h-4 text-[#6B9E3A]" />
                <span>Search for supplements...</span>
              </button>
            </div>

            {/* Navigation Links */}
            <div className="p-4 space-y-4 flex-1">
              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                    pathname === "/"
                      ? "text-[#6B9E3A] bg-[#E5F2D0]/40"
                      : "text-neutral-700 hover:text-neutral-900 hover:bg-[#F4F5F7]"
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-[#F4F5F7]"
                >
                  Shop All Collections
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    pathname === "/about"
                      ? "text-[#6B9E3A] bg-[#E5F2D0]/40"
                      : "text-neutral-700 hover:text-neutral-900 hover:bg-[#F4F5F7]"
                  }`}
                >
                  About Vittal Lifestyle
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    pathname === "/contact"
                      ? "text-[#6B9E3A] bg-[#E5F2D0]/40"
                      : "text-neutral-700 hover:text-neutral-900 hover:bg-[#F4F5F7]"
                  }`}
                >
                  Contact &amp; Support
                </Link>
                <Link
                  href="/order-tracking"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-[#F4F5F7]"
                >
                  Track Order
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-[#F4F5F7]"
                >
                  <span>Wishlist</span>
                  {totalWishlistItems > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#E5F2D0] text-[#3B581C]">
                      {totalWishlistItems}
                    </span>
                  )}
                </Link>
                <button
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleAccountClick(e);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-[#F4F5F7]"
                >
                  {isAuthenticated ? "My Profile" : "Sign In / Register"}
                </button>
              </div>

              {/* Category Tiles */}
              <div className="border-t border-neutral-200 pt-3">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Featured Categories
                </p>
                <div className="space-y-1">
                  {categoryFlyout.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Link
                        key={cat.name}
                        href={cat.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F4F5F7] transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-[#6B9E3A]" />
                          <span className="text-xs font-semibold text-neutral-800 group-hover:text-black">
                            {cat.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-400">→</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* WhatsApp Concierge Banner in Drawer */}
              <div className="border-t border-neutral-200 pt-3">
                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%2C%20I%20need%20assistance%20from%20Vittal%20Lifestyle`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#E5F2D0]/30 border border-[#D5E9BC] hover:bg-[#E5F2D0]/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#6B9E3A] text-white flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#3B581C] font-bold uppercase tracking-wider">
                      Live Concierge
                    </span>
                    <span className="block text-xs font-bold text-neutral-900">
                      Chat on WhatsApp
                    </span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
