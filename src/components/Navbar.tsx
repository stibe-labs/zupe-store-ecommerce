"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  ShieldCheck,
  Truck,
  RotateCcw,
  PackageSearch,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";
import { useWishlist } from "@/context/WishlistContext";
import { siteConfig } from "@/config/siteConfig";
import {
  BRAND_80_THEMES,
  Logo80AnimatedMark,
} from "@/components/Logo80AnimatedMark";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { openSearch } = useSearch();
  const { totalWishlistItems } = useWishlist();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopFlyoutOpen, setShopFlyoutOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [bagBounceKey, setBagBounceKey] = useState(0);
  const [wishlistWiggleKey, setWishlistWiggleKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when mobile navigation drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const origBodyOverflow = document.body.style.overflow;
      const origHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
      return () => {
        document.body.style.overflow = origBodyOverflow;
        document.documentElement.style.overflow = origHtmlOverflow;
        document.body.classList.remove("modal-open");
        document.documentElement.classList.remove("modal-open");
      };
    }
  }, [mobileMenuOpen]);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const flyoutRef = useRef<HTMLDivElement>(null);
  const prevCartCountRef = useRef<number | null>(null);
  const prevWishlistCountRef = useRef<number | null>(null);

  // Trigger Logo #80 Add-to-Bag bounce whenever cart quantity increases
  useEffect(() => {
    if (prevCartCountRef.current !== null && totalItems > prevCartCountRef.current) {
      setBagBounceKey((k) => k + 1);
    }
    prevCartCountRef.current = totalItems;
  }, [totalItems]);

  // Trigger tactile notification wiggle whenever an item is wishlisted
  useEffect(() => {
    if (
      prevWishlistCountRef.current !== null &&
      totalWishlistItems > prevWishlistCountRef.current
    ) {
      setWishlistWiggleKey((k) => k + 1);
    }
    prevWishlistCountRef.current = totalWishlistItems;
  }, [totalWishlistItems]);

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
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md font-mograph select-none border-b border-neutral-200/80 shadow-[0_1px_12px_rgba(7,20,16,0.03)]">
      {/* =================================================================== */}
      {/* OBSIDIAN PINE TOP TRUST MICRO-BAR (Authenticity · Shipping · Track) */}
      {/* =================================================================== */}
      <div className="w-full bg-[#071410] text-white/90 border-b border-white/10">
        <div className="max-w-[1720px] mx-auto px-3.5 sm:px-6 lg:px-8 h-8 flex items-center justify-center md:justify-between text-[11px] font-medium tracking-wide">
          {/* Mobile concise trust line */}
          <div className="flex md:hidden items-center gap-2 text-[10.5px] text-white/95 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D8B458] shrink-0" />
            <span className="truncate">
              100% Original Brands · Free Express Shipping Above ₹1,499
            </span>
          </div>

          {/* Desktop 3-pillar trust row */}
          <div className="hidden md:flex items-center gap-5 text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-white/95">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D8B458] shrink-0" />
              <span>100% Original Authorized Brands</span>
            </span>
            <span className="text-white/25" aria-hidden="true">•</span>
            <span className="inline-flex items-center gap-1.5 text-white/90">
              <Truck className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
              <span>Free Express Shipping Above ₹1,499</span>
            </span>
            <span className="hidden xl:inline text-white/25" aria-hidden="true">•</span>
            <span className="hidden xl:inline-flex items-center gap-1.5 text-white/85">
              <RotateCcw className="w-3.5 h-3.5 text-[#D8B458] shrink-0" />
              <span>7-Day Easy Returns</span>
            </span>
          </div>

          {/* Desktop quick utility links */}
          <div className="hidden md:flex items-center gap-4 text-[11px]">
            <Link
              href="/order-tracking"
              className="inline-flex items-center gap-1.5 text-white/85 hover:text-[#D8B458] transition-colors"
            >
              <PackageSearch className="w-3.5 h-3.5 text-[#D8B458]" />
              <span>Track Order</span>
            </Link>
            <span className="text-white/25" aria-hidden="true">|</span>
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%2C%20I%20need%20help%20with%20Vittal%20Lifestyle`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-white/85 hover:text-[#34D399] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#34D399]" />
              <span>WhatsApp Help</span>
            </a>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SEAMLESS LUXURY GALLERY NAVBAR                                      */}
      {/* =================================================================== */}
      <div className="w-full py-2.5 sm:py-3">
        <div className="max-w-[1720px] mx-auto px-3.5 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-6 relative">
          
          {/* =============================================================== */}
          {/* LEFT: FLOATING CIRCULAR HAMBURGER BUTTON / DESKTOP NAV LINKS    */}
          {/* =============================================================== */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Circular White Floating Hamburger Button (mobile/tablet only) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-neutral-200/80 flex items-center justify-center text-[#0C1412] hover:border-[#0B5D44]/40 active:scale-95 transition-all cursor-pointer"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 ml-0" aria-label="Main navigation">
              {/* Home Link */}
              <Link
                href="/"
                className={`px-2.5 xl:px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold tracking-wide transition-all ${
                  pathname === "/"
                    ? "text-[#0B5D44] bg-[#E6F4EF]/60 font-bold"
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
                  className={`px-2.5 xl:px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold tracking-wide transition-all flex items-center gap-1 cursor-pointer ${
                    shopFlyoutOpen
                      ? "text-[#0B5D44] bg-[#E6F4EF]/60 font-bold"
                      : "text-neutral-700 hover:text-black hover:bg-[#F4F5F7]"
                  }`}
                >
                  <span>Collections</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      shopFlyoutOpen ? "rotate-180 text-[#0B5D44]" : "text-neutral-500"
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
                        className="text-xs text-[#0B5D44] hover:underline font-semibold flex items-center gap-1"
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
                              <div className="w-9 h-9 rounded-xl bg-[#F4F5F7] border border-neutral-200/80 flex items-center justify-center text-neutral-700 group-hover:text-[#0B5D44] group-hover:bg-[#E6F4EF]/50 transition-colors shrink-0">
                                <Icon className="w-4.5 h-4.5" />
                              </div>
                              <div className="truncate">
                                <span className="text-xs font-bold text-neutral-900 group-hover:text-[#0B5D44] transition-colors truncate block">
                                  {cat.name}
                                </span>
                                <p className="text-[11px] text-neutral-500 truncate">
                                  {cat.tagline}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#0B5D44] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                          </Link>
                        );
                      })}
                    </div>

                    {/* Mega Menu Footer Callout */}
                    <div className="mt-3 pt-3 border-t border-neutral-100 bg-[#F3FAF7] p-3 rounded-xl border border-[#B8DFD1]/60 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-neutral-900">100% Original Guaranteed.</p>
                        <p className="text-[10px] text-neutral-600">Authorized global nutrition &amp; athletic brands</p>
                      </div>
                      <Link
                        href="/products/whey-protein-isolate"
                        onClick={() => setShopFlyoutOpen(false)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#0B5D44] hover:bg-[#074230] text-white font-bold text-xs transition-colors shrink-0"
                      >
                        Shop Isolate
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Shop */}
              <Link
                href="/products"
                className={`px-2.5 xl:px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold tracking-wide transition-all ${
                  pathname?.startsWith("/products")
                    ? "text-[#0B5D44] bg-[#E6F4EF]/60 font-bold"
                    : "text-neutral-700 hover:text-black hover:bg-[#F4F5F7]"
                }`}
              >
                Shop
              </Link>

              {/* Track Order */}
              <Link
                href="/order-tracking"
                className={`px-2.5 xl:px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold tracking-wide transition-all whitespace-nowrap ${
                  pathname === "/order-tracking"
                    ? "text-[#0B5D44] bg-[#E6F4EF]/60 font-bold"
                    : "text-neutral-700 hover:text-black hover:bg-[#F4F5F7]"
                }`}
              >
                Track
              </Link>

              {/* About Page */}
              <Link
                href="/about"
                className={`px-2.5 xl:px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold tracking-wide transition-all ${
                  pathname === "/about"
                    ? "text-[#0B5D44] bg-[#E6F4EF]/60 font-bold"
                    : "text-neutral-700 hover:text-black hover:bg-[#F4F5F7]"
                }`}
              >
                About
              </Link>

              {/* Contact Page (shown on xl+ to preserve clean center clearance on 1024px) */}
              <Link
                href="/contact"
                className={`hidden xl:inline-flex px-3 py-1.5 rounded-full text-sm font-semibold tracking-wide transition-all ${
                  pathname === "/contact"
                    ? "text-[#0B5D44] bg-[#E6F4EF]/60 font-bold"
                    : "text-neutral-700 hover:text-black hover:bg-[#F4F5F7]"
                }`}
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* =============================================================== */}
          {/* CENTER: OFFICIAL LOGO #80 v2.0 (INTERACTIVE HOVER-PRESS MARK)   */}
          {/* =============================================================== */}
          <div className="absolute left-1/2 -translate-x-1/2 z-10 shrink-0 pointer-events-auto">
            <Link
              href="/"
              className="vl80-root vl80-hover-trigger inline-flex items-center gap-1.5 sm:gap-2.5 group cursor-pointer py-1"
              aria-label="Vittal Lifestyle — Home"
            >
              <Logo80AnimatedMark
                theme={BRAND_80_THEMES[0]}
                surface="light"
                size={36}
                className="scale-[0.82] sm:scale-100 -mr-0.5 sm:mr-0"
              />
              <span
                className="inline-flex items-center leading-none select-none"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                <span className="text-[17px] sm:text-[23px] font-bold tracking-[-0.03em] text-[#0C1412] whitespace-nowrap">
                  vittal{" "}
                  <span className="font-normal text-[#0B5D44]">lifestyle</span>
                </span>
              </span>
            </Link>
          </div>

          {/* =============================================================== */}
          {/* RIGHT: INLINE SEARCH PILL + WISHLIST + ACCOUNT + DEDICATED /CART*/}
          {/* =============================================================== */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 z-20 shrink-0">
            {/* Desktop Inline Search Pill (xl+) */}
            <button
              type="button"
              onClick={openSearch}
              className="hidden xl:flex items-center justify-between gap-2.5 h-10 w-[235px] 2xl:w-[265px] px-3.5 rounded-full bg-[#F5F8F6] hover:bg-[#EAF4F0] border border-neutral-200/90 hover:border-[#0B5D44]/35 text-xs text-neutral-500 transition-all cursor-pointer group"
              aria-label="Search brands and products (Command K)"
            >
              <span className="flex items-center gap-2 truncate">
                <Search className="w-4 h-4 text-[#0B5D44] shrink-0" />
                <span className="truncate font-medium text-neutral-600 group-hover:text-neutral-900">
                  Search brands &amp; items...
                </span>
              </span>
              <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-neutral-200 text-[10px] font-bold text-neutral-500 shadow-2xs shrink-0">
                ⌘K
              </kbd>
            </button>

            {/* Compact Circular Search Button (< xl) */}
            <button
              type="button"
              onClick={openSearch}
              className="xl:hidden w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] border border-neutral-200/80 flex items-center justify-center text-neutral-900 hover:border-[#0B5D44]/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              aria-label="Open search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
            </button>

            {/* Desktop Wishlist Pill (wiggles on save) */}
            <Link
              href="/wishlist"
              className={`hidden lg:flex w-10 h-10 xl:w-11 xl:h-11 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] border items-center justify-center text-neutral-900 hover:scale-105 active:scale-95 transition-all relative ${
                pathname === "/wishlist"
                  ? "border-[#0B5D44] bg-[#E6F4EF]/40"
                  : "border-neutral-200/80 hover:border-[#0B5D44]/40"
              }`}
              aria-label="Wishlist"
            >
              <span
                key={wishlistWiggleKey}
                className={
                  wishlistWiggleKey > 0
                    ? "vl80-root vl80-notification inline-flex items-center justify-center"
                    : "inline-flex items-center justify-center"
                }
              >
                <Heart
                  className={`vl80-bag-group w-5 h-5 transition-transform ${
                    totalWishlistItems > 0 || pathname === "/wishlist"
                      ? "fill-[#0B5D44] text-[#0B5D44]"
                      : "text-neutral-900 stroke-[2]"
                  }`}
                />
              </span>
              {totalWishlistItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#0B5D44] text-white text-[9px] font-black tabular-nums rounded-full min-w-[17px] h-[17px] px-0.5 flex items-center justify-center ring-2 ring-white">
                  {totalWishlistItems}
                </span>
              )}
            </Link>

            {/* Desktop Account Icon */}
            <button
              type="button"
              onClick={handleAccountClick}
              className={`hidden lg:flex w-10 h-10 xl:w-11 xl:h-11 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] border items-center justify-center text-neutral-900 hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                pathname === "/account"
                  ? "border-[#0B5D44] bg-[#E6F4EF]/40 text-[#0B5D44]"
                  : "border-neutral-200/80 hover:border-[#0B5D44]/40"
              }`}
              aria-label={isAuthenticated ? "My Account" : "Sign In"}
            >
              <User className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Dedicated /cart Shopping Bag Link (Compact circle on mobile, pill on md+) */}
            <Link
              href="/cart"
              className={`relative w-9 h-9 sm:w-11 sm:h-11 md:w-auto md:px-3.5 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] border flex items-center justify-center md:gap-2 text-neutral-900 hover:scale-[1.03] active:scale-95 transition-all ${
                pathname === "/cart"
                  ? "border-[#0B5D44] bg-[#E6F4EF]/50 ring-2 ring-[#0B5D44]/15"
                  : "border-neutral-200/80 hover:border-[#0B5D44]/40"
              }`}
              aria-label={totalItems > 0 ? `Open Shopping Bag (${totalItems} items)` : "Open Shopping Bag"}
            >
              <Logo80AnimatedMark
                theme={BRAND_80_THEMES[0]}
                surface="light"
                mode={bagBounceKey > 0 ? "add-to-bag" : "hover-press"}
                replayKey={bagBounceKey}
                size={23}
              />
              <span className="hidden md:inline text-xs font-bold text-[#0C1412] tracking-tight">
                Bag
              </span>
              {totalItems > 0 && (
                <span
                  key={totalItems}
                  className="absolute -top-1 -right-1 md:static bg-[#0B5D44] text-white text-[10px] font-extrabold tabular-nums rounded-full min-w-[18px] h-[18px] md:min-w-[20px] md:h-[20px] px-1 md:px-1.5 flex items-center justify-center shadow-xs ring-2 ring-white md:ring-0 animate-[vl80-badge-pop_260ms_cubic-bezier(0.34,1.56,0.64,1)]"
                >
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MOBILE SLIDE-OUT DRAWER (PORTALED TO BODY FOR 100% RELIABILITY)     */}
      {/* =================================================================== */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {mobileMenuOpen && (
              <div className="fixed inset-0 z-[99999] lg:hidden font-mograph">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                  onClick={() => setMobileMenuOpen(false)}
                />

                {/* Drawer Panel */}
                <motion.div
                  data-lenis-prevent
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 280 }}
                  className="fixed inset-y-0 left-0 w-[85%] max-w-[340px] sm:max-w-sm h-full h-[100dvh] bg-white border-r border-neutral-200 text-neutral-900 shadow-2xl flex flex-col z-[100000] overflow-hidden"
                >
                  {/* Drawer Header */}
                  <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-white shrink-0">
                    <Link
                      href="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex items-center gap-2"
                      aria-label="Vittal Lifestyle — Home"
                    >
                      <Logo80AnimatedMark
                        theme={BRAND_80_THEMES[0]}
                        surface="light"
                        size={34}
                        withWordmark
                      />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-[#F4F5F7] hover:bg-neutral-200 text-neutral-600 hover:text-black flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Close menu"
                    >
                      <X className="w-5 h-5 stroke-[2.2]" />
                    </button>
                  </div>

                  {/* Scrollable Drawer Body with Touch & Lenis Safety */}
                  <div
                    data-lenis-prevent
                    className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 min-h-0 pb-12"
                    style={{ WebkitOverflowScrolling: "touch" }}
                  >
                    {/* Quick Search Button in Drawer */}
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          openSearch();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-[#F3FAF7] border border-[#B8DFD1] text-neutral-600 text-xs text-left cursor-pointer hover:bg-[#EAF5F0] transition-colors"
                      >
                        <Search className="w-4 h-4 text-[#0B5D44]" />
                        <span>Search 100% original brands, outfits...</span>
                      </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="space-y-1">
                      <Link
                        href="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                          pathname === "/"
                            ? "text-[#0B5D44] bg-[#E6F4EF]/60 font-bold"
                            : "text-neutral-800 hover:text-black hover:bg-[#F4F5F7]"
                        }`}
                      >
                        Home
                      </Link>
                      <Link
                        href="/products"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                          pathname?.startsWith("/products")
                            ? "text-[#0B5D44] bg-[#E6F4EF]/60 font-bold"
                            : "text-neutral-800 hover:text-black hover:bg-[#F4F5F7]"
                        }`}
                      >
                        Shop All Collections
                      </Link>
                      <Link
                        href="/about"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                          pathname === "/about"
                            ? "text-[#0B5D44] bg-[#E6F4EF]/60 font-bold"
                            : "text-neutral-800 hover:text-black hover:bg-[#F4F5F7]"
                        }`}
                      >
                        About Vittal Lifestyle
                      </Link>
                      <Link
                        href="/contact"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                          pathname === "/contact"
                            ? "text-[#0B5D44] bg-[#E6F4EF]/60 font-bold"
                            : "text-neutral-800 hover:text-black hover:bg-[#F4F5F7]"
                        }`}
                      >
                        Contact &amp; Support
                      </Link>
                      <Link
                        href="/order-tracking"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                          pathname === "/order-tracking"
                            ? "text-[#0B5D44] bg-[#E6F4EF]/60 font-bold"
                            : "text-neutral-800 hover:text-black hover:bg-[#F4F5F7]"
                        }`}
                      >
                        Track Order
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-neutral-800 hover:text-black hover:bg-[#F4F5F7] transition-colors"
                      >
                        <span>Wishlist</span>
                        {totalWishlistItems > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#E6F4EF] text-[#074230]">
                            {totalWishlistItems}
                          </span>
                        )}
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => {
                          setMobileMenuOpen(false);
                          handleAccountClick(e);
                        }}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-neutral-800 hover:text-black hover:bg-[#F4F5F7] transition-colors cursor-pointer"
                      >
                        {isAuthenticated ? "My Profile" : "Sign In / Register"}
                      </button>
                    </div>

                    {/* Category Tiles */}
                    <div className="border-t border-neutral-100 pt-3">
                      <p className="px-3.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
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
                              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-[#F4F5F7] transition-colors group"
                            >
                              <div className="flex items-center gap-2.5">
                                <Icon className="w-4 h-4 text-[#0B5D44]" />
                                <span className="text-xs font-semibold text-neutral-800 group-hover:text-black">
                                  {cat.name}
                                </span>
                              </div>
                              <span className="text-[10px] text-neutral-400 group-hover:translate-x-0.5 transition-transform">→</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* WhatsApp Concierge Banner in Drawer */}
                    <div className="border-t border-neutral-100 pt-3">
                      <a
                        href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%2C%20I%20need%20assistance%20from%20Vittal%20Lifestyle`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-2xl bg-[#E6F4EF]/40 border border-[#B8DFD1] hover:bg-[#E6F4EF]/70 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#0B5D44] text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="block text-[10px] text-[#074230] font-bold uppercase tracking-wider">
                            Live Concierge
                          </span>
                          <span className="block text-xs font-bold text-neutral-900">
                            Chat on WhatsApp
                          </span>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Drawer Footer Tag */}
                  <div className="p-4 border-t border-neutral-100 bg-neutral-50/70 shrink-0 text-center">
                    <p className="text-[11px] font-semibold text-neutral-500">
                      VITTAL LIFESTYLE • Luxury Everyday
                    </p>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </header>
  );
}
