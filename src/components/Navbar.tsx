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
  Truck,
  Dumbbell,
  Shirt,
  Sparkles,
  ShieldCheck,
  BadgeCheck,
  ArrowRight,
  Flame,
  Award,
  Crown,
  Cookie,
  Apple,
  MessageCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Zap,
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
  const [scrolled, setScrolled] = useState(false);

  const flyoutRef = useRef<HTMLDivElement>(null);

  // Detect scroll for dynamic navbar glass elevation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut (⌘K or / to open search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      } else if (e.key === "/" && (e.target as HTMLElement).tagName !== "INPUT" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
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

  // Curated category mega-flyout items with luxury descriptors
  const categoryFlyout = [
    {
      name: "Gym Supplementaries",
      tagline: "Whey Isolate, Creatine & Pre-workout",
      href: "/products?category=Gym+Supplementaries",
      icon: Dumbbell,
      badge: "Pure Formula",
      badgeColor: "bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30",
    },
    {
      name: "Outfits & Athleisure",
      tagline: "Performance fit, 4-way stretch gym sets",
      href: "/products?category=Outfits",
      icon: Sparkles,
      badge: "Trending",
      badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    {
      name: "Apparels & Tees",
      tagline: "Heavyweight streetwear & oversized fits",
      href: "/products?category=Apparels",
      icon: Shirt,
      badge: "VL Edition",
      badgeColor: "bg-neutral-800 text-neutral-300 border-white/10",
    },
    {
      name: "Royal Dates & Superfoods",
      tagline: "Exotic Ajwa, Medjool & gourmet raw dry fruits",
      href: "/products?category=Dates+%26+Nuts",
      icon: Crown,
      badge: "100% Pure",
      badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
    {
      name: "Candy & Dark Chocolates",
      tagline: "Artisanal 70% dark cocoa & protein bites",
      href: "/products?category=Candy+%26+Chocolates",
      icon: Cookie,
      badge: "Gourmet",
      badgeColor: "bg-[#D4A373]/15 text-[#D4A373] border-[#D4A373]/30",
    },
  ];

  // Quick horizontal category pill tags
  const quickPills = [
    { label: "All Products", href: "/products", icon: null },
    { label: "Whey Isolate", href: "/products/whey-protein-isolate", icon: Zap, highlight: true },
    { label: "Creatine 250g", href: "/products/creatine-monohydrate", icon: Dumbbell },
    { label: "Gym Outfits", href: "/products?category=Outfits", icon: Sparkles },
    { label: "Oversized Tees", href: "/products/oversized-athletic-tshirt", icon: Shirt },
    { label: "Royal Dates", href: "/products/premium-royal-dates", icon: Crown },
    { label: "Dark Chocolates", href: "/products/artisan-dark-chocolates", icon: Cookie },
    { label: "Up to 50% Deals", href: "/products?sort=discount", icon: Flame, badge: "Deals" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full font-mograph select-none">
      {/* =================================================================== */}
      {/* 1. TOP LUXURY MICRO-ANNOUNCEMENT & VIP TICKER BAR                   */}
      {/* =================================================================== */}
      <div className="bg-[#050506] text-neutral-400 text-[10px] sm:text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06] tracking-wide">
        <div className="max-w-[1720px] mx-auto flex items-center justify-between">
          {/* Left Trust Proof Badges */}
          <div className="flex items-center gap-2.5 sm:gap-4 overflow-hidden">
            <span className="flex items-center gap-1.5 text-neutral-300 font-medium">
              <BadgeCheck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="truncate">100% Genuine Certified Formulation</span>
            </span>
            <span className="hidden sm:inline text-neutral-700 font-light">•</span>
            <span className="hidden sm:flex items-center gap-1.5 text-neutral-300 font-medium">
              <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Express Insured Delivery</span>
            </span>
            <span className="hidden lg:inline text-neutral-700 font-light">•</span>
            <span className="hidden lg:flex items-center gap-1.5 text-neutral-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span>Pan-India Doorstep Support</span>
            </span>
          </div>

          {/* Right VIP Concierge & Fast Order Links */}
          <div className="flex items-center gap-3 sm:gap-4 font-medium shrink-0">
            <span className="hidden md:inline text-neutral-400">
              Free Express Delivery Above <span className="text-white font-bold">₹1,999</span>
            </span>
            <span className="hidden md:inline text-neutral-700 font-light">•</span>
            <Link
              href="/order-tracking"
              className="text-neutral-300 hover:text-[#D4AF37] transition-colors flex items-center gap-1"
            >
              <span>Track Order</span>
            </Link>
            <span className="text-neutral-700 font-light">•</span>
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%2C%20I%20need%20VIP%20concierge%20support%20with%20Vittal%20Lifestyle`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold">Concierge</span>
            </a>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. MAIN CREATIVE FLOATING GLASS NAVBAR                              */}
      {/* =================================================================== */}
      <div
        className={`w-full transition-all duration-300 relative border-b ${
          scrolled
            ? "bg-[#0B0B0C]/95 backdrop-blur-2xl border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.7)] py-2 sm:py-2.5"
            : "bg-[#0B0B0C]/90 backdrop-blur-xl border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.4)] py-2.5 sm:py-3"
        }`}
      >
        {/* Subtle gold glow line accent at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/35 to-transparent pointer-events-none" />

        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* =============================================================== */}
          {/* MOBILE VIEW: LEFT HAMBURGER BUTTON                              */}
          {/* =============================================================== */}
          <div className="flex lg:hidden items-center shrink-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all flex items-center justify-center cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5 stroke-[2]" />
            </button>
          </div>

          {/* =============================================================== */}
          {/* BRAND LOGO: LEFT ON DESKTOP, CENTERED ON MOBILE                 */}
          {/* =============================================================== */}
          <div className="flex items-center lg:static absolute left-1/2 -translate-x-1/2 lg:translate-x-0 z-10 shrink-0">
            <Link href="/" className="flex items-center group cursor-pointer">
              <div className="relative h-11 sm:h-12 md:h-14 lg:h-15 w-40 sm:w-48 md:w-56 lg:w-64 transition-transform duration-300 group-hover:scale-[1.02]">
                <Image
                  src="/vl-logo-nobg.png"
                  alt="Vittal Lifestyle"
                  fill
                  className="object-contain object-center lg:object-left"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* =============================================================== */}
          {/* DESKTOP CENTER NAVIGATION WITH CREATIVE MEGA FLYOUT             */}
          {/* =============================================================== */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {/* Home Link */}
            <Link
              href="/"
              className={`px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-semibold tracking-wide transition-all ${
                pathname === "/"
                  ? "text-[#D4AF37] bg-white/[0.06] shadow-inner"
                  : "text-neutral-300 hover:text-white hover:bg-white/[0.04]"
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
                className={`px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-semibold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer ${
                  shopFlyoutOpen || pathname?.startsWith("/products")
                    ? "text-[#D4AF37] bg-white/[0.06]"
                    : "text-neutral-300 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <span>Collections</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 text-neutral-400 ${
                    shopFlyoutOpen ? "rotate-180 text-[#D4AF37]" : ""
                  }`}
                />
              </button>

              {/* Luxury Mega Flyout Menu */}
              {shopFlyoutOpen && (
                <div className="absolute top-full left-0 mt-2 w-[460px] bg-[#101012] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 backdrop-blur-2xl animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/5">
                    <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold">
                      Curated Departments
                    </span>
                    <Link
                      href="/products"
                      onClick={() => setShopFlyoutOpen(false)}
                      className="text-xs text-[#D4AF37] hover:underline font-semibold flex items-center gap-1"
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
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.05] transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-neutral-300 group-hover:text-[#D4AF37] group-hover:border-[#D4AF37]/40 transition-colors shrink-0">
                              <Icon className="w-4.5 h-4.5" />
                            </div>
                            <div className="truncate">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors truncate">
                                  {cat.name}
                                </span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded-full border font-bold uppercase tracking-wider ${cat.badgeColor}`}
                                >
                                  {cat.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-400 truncate">
                                {cat.tagline}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                        </Link>
                      );
                    })}
                  </div>

                  {/* Mega Menu Footer Callout */}
                  <div className="mt-3 pt-3 border-t border-white/5 bg-gradient-to-r from-[#D4AF37]/10 via-transparent to-transparent p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Pure Protein. Maximum Performance.</p>
                      <p className="text-[10px] text-neutral-400">Lab-certified 100% ultra-filtered whey isolate</p>
                    </div>
                    <Link
                      href="/products/whey-protein-isolate"
                      onClick={() => setShopFlyoutOpen(false)}
                      className="px-3 py-1 rounded-lg bg-[#D4AF37] hover:bg-[#c49e2e] text-black font-extrabold text-xs transition-colors shrink-0"
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
              className="px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-semibold tracking-wide text-neutral-300 hover:text-white hover:bg-white/[0.04] transition-all flex items-center gap-1.5"
            >
              <span>Best Sellers</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 font-bold uppercase">
                ★ Hot
              </span>
            </Link>

            {/* About Page */}
            <Link
              href="/about"
              className={`px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-semibold tracking-wide transition-all ${
                pathname === "/about"
                  ? "text-[#D4AF37] bg-white/[0.06]"
                  : "text-neutral-300 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              About
            </Link>

            {/* Contact Page */}
            <Link
              href="/contact"
              className={`px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-semibold tracking-wide transition-all ${
                pathname === "/contact"
                  ? "text-[#D4AF37] bg-white/[0.06]"
                  : "text-neutral-300 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* =============================================================== */}
          {/* DESKTOP CREATIVE INTEGRATED SEARCH PILL                         */}
          {/* =============================================================== */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs xl:max-w-sm ml-2">
            <form
              onSubmit={handleSearchSubmit}
              onClick={() => openSearch()}
              className="w-full relative flex items-center rounded-full bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-[#D4AF37]/40 focus-within:border-[#D4AF37] focus-within:ring-2 focus-within:ring-[#D4AF37]/20 transition-all h-9 px-3.5 group cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#D4AF37] mr-2 shrink-0 group-hover:scale-110 transition-transform" />
              <input
                type="text"
                readOnly
                placeholder="Search Whey, Outfits, Dates..."
                className="w-full bg-transparent text-xs text-white placeholder:text-neutral-500 focus:outline-none cursor-pointer"
              />
              <span className="hidden xl:inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-neutral-400 font-mono shrink-0 ml-1">
                ⌘K
              </span>
            </form>
          </div>

          {/* =============================================================== */}
          {/* RIGHT ACTION DOCK (Wishlist, Account, Shopping Bag)              */}
          {/* =============================================================== */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 z-20 shrink-0">
            {/* Mobile Search Icon */}
            <button
              onClick={openSearch}
              className="lg:hidden p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
              aria-label="Open search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Desktop Wishlist Pill */}
            <Link
              href="/wishlist"
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all group"
              aria-label="Wishlist"
            >
              <div className="relative">
                <Heart
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    totalWishlistItems > 0
                      ? "fill-rose-500 text-rose-500"
                      : "text-neutral-300 group-hover:text-white"
                  }`}
                />
                {totalWishlistItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#D4AF37] text-black text-[9px] font-black rounded-full min-w-[15px] h-[15px] px-0.5 flex items-center justify-center">
                    {totalWishlistItems}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-neutral-300 group-hover:text-white">
                Wishlist
              </span>
            </Link>

            {/* Desktop Account Pill */}
            <button
              onClick={handleAccountClick}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all group cursor-pointer"
              aria-label="Account"
            >
              <div className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-[#D4AF37]/20 flex items-center justify-center text-neutral-300 group-hover:text-[#D4AF37] transition-all">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-neutral-300 group-hover:text-white">
                {isAuthenticated ? "My Profile" : "Sign In"}
              </span>
            </button>

            {/* Luxury Creative Shopping Bag Button (Desktop & Mobile) */}
            <button
              onClick={openCart}
              className="flex items-center gap-2.5 p-1 pl-1.5 pr-3 sm:pr-3.5 rounded-full bg-gradient-to-r from-[#D4AF37]/15 to-[#D4A373]/20 hover:from-[#D4AF37]/25 hover:to-[#D4A373]/30 border border-[#D4AF37]/40 shadow-lg shadow-[#D4AF37]/5 transition-all group cursor-pointer active:scale-95"
              aria-label="View Shopping Cart"
            >
              <div className="relative">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#1A1814] to-[#2B2317] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                </div>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black text-[9px] font-black rounded-full min-w-[16px] h-[16px] px-0.5 flex items-center justify-center shadow-md animate-in zoom-in">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <span className="block text-neutral-400 text-[9px] font-semibold uppercase tracking-wider">
                  Bag
                </span>
                <span className="block text-white font-extrabold text-xs">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 3. CREATIVE CATEGORY QUICK-RAIL (Compact Luxury Pill Bar)           */}
        {/* =================================================================== */}
        <div className="w-full mt-2 pt-2 border-t border-white/[0.05] overflow-x-auto no-scrollbar">
          <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 shrink-0 py-0.5">
            {quickPills.map((pill) => {
              const Icon = pill.icon;
              return (
                <Link
                  key={pill.label}
                  href={pill.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    pill.badge === "Deals"
                      ? "bg-gradient-to-r from-amber-500/20 to-red-500/20 text-amber-300 border border-amber-500/40 hover:border-amber-400 shadow-sm"
                      : pill.highlight
                      ? "bg-white/[0.08] text-[#D4AF37] border border-[#D4AF37]/40 hover:bg-white/[0.12]"
                      : "bg-white/[0.03] text-neutral-300 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white hover:border-white/20"
                  }`}
                >
                  {Icon && <Icon className="w-3 h-3 text-[#D4AF37] shrink-0" />}
                  <span>{pill.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. MOBILE CREATIVE SLIDE-OUT DRAWER                                 */}
      {/* =================================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-[#0B0B0C] border-r border-white/10 text-white shadow-2xl flex flex-col z-50 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#111113]">
              <div className="relative h-10 w-40">
                <Image
                  src="/vl-logo-nobg.png"
                  alt="Vittal Lifestyle"
                  fill
                  className="object-contain object-left"
                />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10"
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
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-neutral-400 text-xs text-left"
              >
                <Search className="w-4 h-4 text-[#D4AF37]" />
                <span>Search all products &amp; flavours...</span>
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
                      ? "text-[#D4AF37] bg-white/[0.06]"
                      : "text-neutral-300 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-neutral-300 hover:text-white hover:bg-white/[0.04]"
                >
                  Shop All Collections
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    pathname === "/about"
                      ? "text-[#D4AF37] bg-white/[0.06]"
                      : "text-neutral-300 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  About Vittal Lifestyle
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    pathname === "/contact"
                      ? "text-[#D4AF37] bg-white/[0.06]"
                      : "text-neutral-300 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  Contact &amp; Support
                </Link>
                <Link
                  href="/order-tracking"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-neutral-300 hover:text-white hover:bg-white/[0.04]"
                >
                  Track Order
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-neutral-300 hover:text-white hover:bg-white/[0.04]"
                >
                  <span>Wishlist</span>
                  {totalWishlistItems > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#D4AF37] text-black">
                      {totalWishlistItems}
                    </span>
                  )}
                </Link>
                <button
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleAccountClick(e);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-neutral-300 hover:text-white hover:bg-white/[0.04]"
                >
                  {isAuthenticated ? "My Profile" : "Sign In / Register"}
                </button>
              </div>

              {/* Category Tiles */}
              <div className="border-t border-white/10 pt-3">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
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
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/[0.05] transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-[#D4AF37]" />
                          <span className="text-xs font-semibold text-neutral-200 group-hover:text-white">
                            {cat.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-500">→</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* WhatsApp Concierge Banner in Drawer */}
              <div className="border-t border-white/10 pt-3">
                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%2C%20I%20need%20assistance%20from%20Vittal%20Lifestyle`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-transparent border border-emerald-500/30 hover:border-emerald-400/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                      Live Concierge
                    </span>
                    <span className="block text-xs font-bold text-white">
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