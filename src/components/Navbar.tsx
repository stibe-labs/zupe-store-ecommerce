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
  MapPin,
  ChevronDown,
  Truck,
  Dumbbell,
  Shirt,
  Apple,
  Cookie,
  Sparkles,
  Layers,
  Headphones,
  Laptop,
  Smartphone,
  Watch,
  Tablet,
  Camera,
  Gamepad2,
  Plug,
  ShieldCheck,
  BadgeCheck,
  ArrowRight,
  Clock,
  Mail,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";
import { useWishlist } from "@/context/WishlistContext";
import { siteConfig } from "@/config/siteConfig";
import { useRecentlyViewed, addRecentlyViewed } from "@/lib/recentlyViewed";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems, subtotal, openCart } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { openSearch } = useSearch();
  const { totalWishlistItems } = useWishlist();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState("All Categories");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [recentlyViewedOpen, setRecentlyViewedOpen] = useState(false);
  const { items: recentlyViewedItems, clear: clearRecentlyViewedItems } = useRecentlyViewed();

  const departmentRef = useRef<HTMLDivElement>(null);
  const categorySelectRef = useRef<HTMLDivElement>(null);
  const recentlyViewedRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (departmentRef.current && !departmentRef.current.contains(target)) {
        setDepartmentOpen(false);
      }
      if (categorySelectRef.current && !categorySelectRef.current.contains(target)) {
        setCategoryDropdownOpen(false);
      }
      if (recentlyViewedRef.current && !recentlyViewedRef.current.contains(target)) {
        setRecentlyViewedOpen(false);
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
      const catParam =
        searchCategory !== "All Categories"
          ? `&category=${encodeURIComponent(searchCategory)}`
          : "";
      router.push(`/products?search=${encodeURIComponent(searchInput.trim())}${catParam}`);
    } else {
      openSearch();
    }
  };

  const departments = [
    { name: "Gym Supplementaries", href: "/products?category=Gym+Supplementaries", icon: Dumbbell },
    { name: "Outfits", href: "/products?category=Outfits", icon: Sparkles },
    { name: "Apparels", href: "/products?category=Apparels", icon: Shirt },
    { name: "Dates & Nuts", href: "/products?category=Dates+%26+Nuts", icon: Apple },
    { name: "Candy & Chocolates", href: "/products?category=Candy+%26+Chocolates", icon: Cookie },
  ];

  const categoriesList = [
    "All Categories",
    "Gym Supplementaries",
    "Outfits",
    "Apparels",
    "Dates & Nuts",
    "Candy & Chocolates",
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B0B0C] border-b border-white/10 font-sans text-white">
      {/* =================================================================== */}
      {/* TIER 1: TOP ANNOUNCEMENT & TRUST BAR (Dark Minimalist Desktop)      */}
      {/* =================================================================== */}
      <div className="hidden md:block bg-[#070708] text-neutral-400 text-[10px] sm:text-[11px] py-1 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-[1680px] mx-auto flex items-center justify-between">
          {/* Left Trust Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1.5 font-medium text-neutral-300">
              <BadgeCheck className="w-3 h-3 text-[#D4AF37]" />
              <span>100% Genuine Certified</span>
            </span>
            <span className="text-neutral-700">|</span>
            <span className="flex items-center gap-1.5 font-medium text-neutral-300">
              <Truck className="w-3 h-3 text-emerald-500" />
              <span>Express Insured Delivery</span>
            </span>
            <span className="hidden md:inline text-neutral-700">|</span>
            <span className="hidden md:flex items-center gap-1.5 font-medium text-neutral-300">
              <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
              <span>Pan-India Doorstep Support</span>
            </span>
          </div>

          {/* Right Links */}
          <div className="flex items-center gap-2 sm:gap-4 font-medium text-neutral-400">
            <span className="hidden sm:inline text-neutral-400">
              Free Express Delivery on Orders Above ₹1,999
            </span>
            <span className="hidden sm:inline text-neutral-700">|</span>
            <Link
              href="/order-tracking"
              className="hover:text-[#D4AF37] transition-colors flex items-center gap-1"
            >
              <span>Track Order</span>
            </Link>
            <span className="text-neutral-700">|</span>
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%2C%20I%20need%20help%20with%20Vittal%20Lifestyle`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#D4AF37] transition-colors flex items-center gap-1"
            >
              <span>Help</span>
            </a>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* TIER 2: MAIN BRAND HEADER (Matches Mockup on Mobile & Desktop)       */}
      {/* =================================================================== */}
      <div className="bg-[#0B0B0C] py-2 sm:py-2.5 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-[1680px] mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative h-8 sm:h-9 w-36 sm:w-48">
                <Image
                  src="/vl-logo-nobg.png"
                  alt="Vittal Lifestyle"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs sm:text-sm font-semibold text-neutral-300">
            <Link
              href="/"
              className={`transition-colors ${
                pathname === "/" ? "text-[#D4AF37] font-bold" : "hover:text-[#D4AF37]"
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              className="hover:text-[#D4AF37] transition-colors flex items-center gap-1"
            >
              <span>Shop All</span>
              <ChevronDown className="w-3 h-3 text-neutral-500" />
            </Link>
            <Link
              href="/about"
              className={`transition-colors ${
                pathname === "/about" ? "text-[#D4AF37] font-bold" : "hover:text-[#D4AF37]"
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`transition-colors ${
                pathname === "/contact" ? "text-[#D4AF37] font-bold" : "hover:text-[#D4AF37]"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Mobile Right Icons (Search, Bag with Gold Badge, Menu) - Matches Mockup */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
            <button
              onClick={openSearch}
              className="p-1.5 text-neutral-200 hover:text-[#D4AF37] transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={openCart}
              className="relative p-1.5 text-neutral-200 hover:text-[#D4AF37] transition-colors"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#D4AF37] text-black text-[9px] font-black rounded-full min-w-[16px] h-[16px] px-0.5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 text-neutral-200 hover:text-[#D4AF37] transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop User & Support Actions */}
          <div className="hidden lg:flex items-center gap-4 sm:gap-6 shrink-0">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="flex items-center gap-1.5 text-neutral-300 hover:text-[#D4AF37] transition-colors group"
              aria-label="Wishlist"
            >
              <div className="relative">
                <Heart className="w-4.5 h-4.5 text-neutral-300 group-hover:text-[#D4AF37] transition-colors" />
                {totalWishlistItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#D4AF37] text-black text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                    {totalWishlistItems}
                  </span>
                )}
              </div>
              <div className="text-left text-xs font-semibold leading-tight">
                <span className="block text-neutral-400 text-[9px]">Wishlist</span>
                <span className="block text-white font-bold">({totalWishlistItems})</span>
              </div>
            </Link>

            {/* Account */}
            <button
              onClick={handleAccountClick}
              className="flex items-center gap-1.5 text-neutral-300 hover:text-[#D4AF37] transition-colors group cursor-pointer"
              aria-label="Account"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-[#D4AF37]/20 flex items-center justify-center text-white group-hover:text-[#D4AF37] transition-colors">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left text-xs font-semibold leading-tight">
                <span className="block text-neutral-400 text-[9px]">Account</span>
                <span className="block text-white font-bold">
                  {isAuthenticated ? "My Profile" : "Sign In"}
                </span>
              </div>
            </button>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="flex items-center gap-2 p-1 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-[#2B2317] flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-[9px] font-black rounded-full min-w-[16px] h-[16px] px-0.5 flex items-center justify-center">
                  {totalItems}
                </span>
              </div>
              <div className="text-left text-xs leading-tight">
                <span className="block text-neutral-400 text-[9px] font-medium">Bag</span>
                <span className="block text-white font-bold">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* TIER 3: UTILITY BAR (Desktop Dark Glassmorphism)                     */}
      {/* =================================================================== */}
      <div className="hidden md:block bg-[#0B0B0C] py-2 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-[1680px] mx-auto flex items-center justify-between gap-4">
          {/* Shop by Department Dropdown */}
          <div className="relative shrink-0" ref={departmentRef}>
            <button
              onClick={() => setDepartmentOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#141416] hover:bg-[#1A1A1E] text-white rounded-xl font-bold text-xs transition-colors border border-white/10 shrink-0"
            >
              <Menu className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="tracking-wide">Categories &amp; Departments</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform text-neutral-400 ${
                  departmentOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Department Dropdown Menu */}
            {departmentOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#141416] text-white rounded-2xl shadow-2xl border border-white/10 py-2 z-50">
                <div className="px-4 py-2 border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Categories
                </div>
                {departments.map((dep) => {
                  const Icon = dep.icon;
                  return (
                    <Link
                      key={dep.name}
                      href={dep.href}
                      onClick={() => setDepartmentOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-neutral-300 hover:bg-[#1E1E22] hover:text-[#D4AF37] text-xs font-semibold transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#D4AF37]" />
                        <span>{dep.name}</span>
                      </span>
                      <ArrowRight className="w-3 h-3 text-neutral-500" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-2xl flex items-center bg-[#141416] rounded-xl overflow-hidden border border-white/10 h-9"
          >
            <div className="pl-3 text-neutral-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search Gym Supplements, Outfits, Dates, Chocolates..."
              className="flex-1 bg-transparent px-3 text-xs text-white placeholder-neutral-500 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#D4AF37] hover:bg-[#C8A261] text-black font-bold text-xs px-4 h-full transition-colors"
            >
              Search
            </button>
          </form>

          {/* Quick Category Badges */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-neutral-400">
            <span className="text-[11px] text-neutral-500">Popular:</span>
            <Link href="/products?category=Gym+Supplementaries" className="hover:text-[#D4AF37] transition-colors">Whey Protein</Link>
            <span>•</span>
            <Link href="/products?category=Outfits" className="hover:text-[#D4AF37] transition-colors">Gym Sets</Link>
            <span>•</span>
            <Link href="/products?category=Dates+%26+Nuts" className="hover:text-[#D4AF37] transition-colors">Ajwa Dates</Link>
          </div>
        </div>
      </div>


      {/* =================================================================== */}
      {/* MOBILE DRAWER / SLIDE-OUT MENU                                      */}
      {/* =================================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-[#121214] border-r border-white/10 text-white shadow-2xl flex flex-col z-50 overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#18181B]">
              <div className="relative h-9 w-36">
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
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation links */}
            <div className="p-4 space-y-4 flex-1">
              {/* Primary links */}
              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-bold text-[#D4AF37] bg-white/5"
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-neutral-300 hover:bg-white/5 hover:text-white"
                >
                  Shop All Products
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    pathname === "/about"
                      ? "text-[#D4AF37] bg-white/5 font-bold"
                      : "text-neutral-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  About Vittal Lifestyle
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    pathname === "/contact"
                      ? "text-[#D4AF37] bg-white/5 font-bold"
                      : "text-neutral-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  Contact &amp; Support
                </Link>
                <Link
                  href="/order-tracking"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-neutral-300 hover:bg-white/5 hover:text-white"
                >
                  Track Order
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-neutral-300 hover:bg-white/5 hover:text-white"
                >
                  Wishlist ({totalWishlistItems})
                </Link>
                <button
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleAccountClick(e);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-neutral-300 hover:bg-white/5 hover:text-white"
                >
                  {isAuthenticated ? "My Account" : "Sign In / Register"}
                </button>
              </div>

              {/* Departments */}
              <div className="border-t border-white/10 pt-3">
                <p className="px-3 text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 font-movault">
                  Shop By Category
                </p>
                <div className="space-y-1">
                  {departments.map((dep) => {
                    const Icon = dep.icon;
                    return (
                      <Link
                        key={dep.name}
                        href={dep.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-neutral-300 hover:bg-white/5 hover:text-[#D4AF37]"
                      >
                        <Icon className="w-4 h-4 text-[#D4AF37]" />
                        <span>{dep.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Customer Support */}
              <div className="border-t border-white/10 pt-3 space-y-2">
                <a
                  href={`mailto:${siteConfig.supportEmail}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#141416] border border-white/10 hover:border-[#D4AF37]/40 transition-colors"
                >
                  <Mail className="w-5 h-5 text-[#D4AF37] shrink-0" />
                  <div className="truncate">
                    <span className="block text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-movault">
                      Email Support
                    </span>
                    <span className="block text-xs font-bold text-neutral-200 truncate font-mograph">
                      {siteConfig.supportEmail}
                    </span>
                  </div>
                </a>

                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#141416] border border-white/10 hover:border-[#25D366]/40 transition-colors"
                >
                  <Headphones className="w-5 h-5 text-[#25D366] shrink-0" />
                  <div>
                    <span className="block text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-movault">
                      WhatsApp Support
                    </span>
                    <span className="block text-xs font-bold text-white font-mograph">
                      +91 91623 81659
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
