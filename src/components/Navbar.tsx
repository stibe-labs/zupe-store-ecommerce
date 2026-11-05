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
    { name: "Computers & Laptops", href: "/products?category=Laptops", icon: Laptop },
    { name: "Cameras & Video", href: "/products?category=Cameras", icon: Camera },
    { name: "Tablets", href: "/products?category=Tablets", icon: Tablet },
    { name: "Smartphones", href: "/products?category=Smartphones", icon: Smartphone },
    { name: "Smartwatches", href: "/products?category=Smartwatches", icon: Watch },
    { name: "Gaming", href: "/products?category=Gaming+%26+Accessories", icon: Gamepad2 },
    { name: "Audio & Headphones", href: "/products?category=Headphones+%26+Earbuds", icon: Headphones },
    { name: "Accessories", href: "/products?category=Smart+Gadgets", icon: Plug },
  ];

  const categoriesList = [
    "All Categories",
    "Smartphones",
    "Laptops",
    "Headphones & Earbuds",
    "Smartwatches",
    "Tablets",
    "Gaming & Accessories",
    "Speakers",
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white font-sans">
      {/* =================================================================== */}
      {/* TIER 1: TOP ANNOUNCEMENT & TRUST BAR (White/Off-white)              */}
      {/* =================================================================== */}
      <div className="bg-[#FFFFFF] text-slate-600 text-[10px] sm:text-[11px] py-1 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-[1680px] mx-auto flex items-center justify-between">
          {/* Left Trust Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <MapPin className="w-3 h-3 text-[#002D62]" />
              <span>Dubai Sourced Electronics</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <BadgeCheck className="w-3 h-3 text-emerald-600" />
              <span>Genuine Products</span>
            </span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="hidden md:flex items-center gap-1.5 font-medium text-slate-700">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span>Warranty Across India</span>
            </span>
          </div>

          {/* Right Links */}
          <div className="flex items-center gap-2 sm:gap-4 font-medium text-slate-600">
            <span className="hidden sm:inline text-slate-700">
              Free Express Delivery on Orders Above ₹2,999
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <Link
              href="/order-tracking"
              className="hover:text-[#002D62] transition-colors flex items-center gap-1"
            >
              <span>Track Order</span>
            </Link>
            <span className="text-slate-300">|</span>
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%2C%20I%20need%20help%20with%20Vittal%20Digital`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#002D62] transition-colors flex items-center gap-1"
            >
              <span>Help</span>
            </a>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* TIER 2: MAIN BRAND HEADER (Logo, Primary Nav, Contact, User Items)  */}
      {/* =================================================================== */}
      <div className="bg-white border-b border-slate-200/70 py-1.5 sm:py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1680px] mx-auto flex items-center justify-between gap-4">
          {/* Mobile menu button + Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative h-8 sm:h-9 w-36 sm:w-44">
                <Image
                  src="/vittal-digital-logo.png"
                  alt="Vittal Digital"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-800">
            <Link
              href="/"
              className={`transition-colors ${
                pathname === "/" ? "text-[#002D62] font-bold" : "hover:text-[#002D62]"
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              className="hover:text-[#002D62] transition-colors flex items-center gap-1"
            >
              <span>Shop</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </Link>
            <Link
              href="/about"
              className={`transition-colors ${
                pathname === "/about" ? "text-[#002D62] font-bold" : "hover:text-[#002D62]"
              }`}
            >
              About
            </Link>
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%2C%20I%20have%20an%20inquiry`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#002D62] transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* User & Support Actions */}
          <div className="flex items-center gap-2.5 sm:gap-5 shrink-0">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="hidden sm:flex items-center gap-1.5 text-slate-700 hover:text-[#002D62] transition-colors group"
              aria-label="Wishlist"
            >
              <div className="relative">
                <Heart className="w-4.5 h-4.5 text-slate-700 group-hover:text-[#002D62] transition-colors" />
                {totalWishlistItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#FFBE00] text-slate-950 text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                    {totalWishlistItems}
                  </span>
                )}
              </div>
              <div className="text-left text-xs font-semibold leading-tight">
                <span className="block text-slate-400 text-[9px]">Wishlist</span>
                <span className="block text-slate-800 font-bold">({totalWishlistItems})</span>
              </div>
            </Link>

            {/* Account */}
            <button
              onClick={handleAccountClick}
              className="hidden sm:flex items-center gap-1.5 text-slate-700 hover:text-[#002D62] transition-colors group"
              aria-label="Account"
            >
              <div className="w-7.5 h-7.5 rounded-full bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center text-slate-700 group-hover:text-[#002D62] transition-colors">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left text-xs font-semibold leading-tight">
                <span className="block text-slate-400 text-[9px]">Account</span>
                <span className="block text-slate-800 font-bold">
                  {isAuthenticated ? "My Profile" : "Sign In"}
                </span>
              </div>
            </button>

            {/* Cart Button with Yellow Badge & Total */}
            <button
              onClick={openCart}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
                  <ShoppingBag className="w-4.5 h-4.5 text-slate-900" />
                </div>
                <span className="absolute -top-1 -right-1 bg-[#FFBE00] text-slate-950 text-[9px] font-black rounded-full min-w-[17px] h-[17px] px-1 flex items-center justify-center border-2 border-white shadow-xs">
                  {totalItems}
                </span>
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <span className="block text-slate-400 text-[9px] font-medium">Cart</span>
                <span className="block text-slate-900 font-black">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* TIER 3: UTILITY BAR (Deep Navy #002D62 with Curved Edge Card Style) */}
      {/* =================================================================== */}
      <div className="bg-white py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1680px] mx-auto bg-[#002D62] text-white rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 shadow-md flex items-center justify-between gap-3 sm:gap-4">
          {/* Shop by Department Dropdown */}
          <div className="relative shrink-0" ref={departmentRef}>
            <button
              onClick={() => setDepartmentOpen((prev) => !prev)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-white/10 hover:bg-white/15 active:bg-white/20 text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-colors border border-white/15 shrink-0"
            >
              <Menu className="w-3.5 h-3.5 text-[#FFBE00]" />
              <span className="tracking-wide md:hidden">Categories</span>
              <span className="tracking-wide hidden md:inline">Shop by Department</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform text-white/80 ${
                  departmentOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Department Dropdown Menu */}
            {departmentOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  All Departments
                </div>
                {departments.map((dep) => {
                  const Icon = dep.icon;
                  return (
                    <Link
                      key={dep.name}
                      href={dep.href}
                      onClick={() => setDepartmentOpen(false)}
                      className="flex items-center justify-between px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-[#002D62] text-xs font-semibold transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#002D62]" />
                        <span>{dep.name}</span>
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </Link>
                  );
                })}
                <div className="border-t border-slate-100 mt-2 pt-2 px-4 pb-1">
                  <Link
                    href="/products"
                    onClick={() => setDepartmentOpen(false)}
                    className="text-xs font-bold text-[#002D62] hover:underline flex items-center gap-1"
                  >
                    View All Products →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Integrated Search Bar with Rounded Card Edges & Yellow Action Button */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-3xl flex items-center bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-inner border border-white/20 h-8 sm:h-auto"
          >
            {/* Category Dropdown Pill */}
            <div className="relative shrink-0 hidden md:block" ref={categorySelectRef}>
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border-r border-slate-200 transition-colors h-full"
              >
                <span className="max-w-[110px] truncate">{searchCategory}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {categoryDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  {categoriesList.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSearchCategory(cat);
                        setCategoryDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-blue-50 hover:text-[#002D62] transition-colors ${
                        searchCategory === cat ? "font-bold text-[#002D62] bg-blue-50/60" : ""
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input field */}
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search for electronics, gadgets, accessories..."
              className="flex-1 px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none min-w-0"
            />

            {/* Vibrant Golden Yellow Search Button */}
            <button
              type="submit"
              className="bg-[#FFBE00] hover:bg-[#E5AA00] active:bg-[#CC9600] text-slate-950 px-2.5 sm:px-3.5 py-1.5 sm:py-2 transition-colors flex items-center justify-center shrink-0"
              aria-label="Search"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Right Utility: Recently Viewed & Order Status */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-white/90">
            {/* Recently Viewed Dropdown */}
            <div className="relative" ref={recentlyViewedRef}>
              <button
                onClick={() => setRecentlyViewedOpen((prev) => !prev)}
                className="flex items-center gap-1.5 hover:text-[#FFBE00] transition-colors cursor-pointer"
                aria-label="Toggle Recently Viewed Products"
              >
                <span>Recently Viewed</span>
                {recentlyViewedItems.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFBE00] inline-block" />
                )}
                <ChevronDown className="w-3 h-3 text-white/70" />
              </button>

              {recentlyViewedOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 p-3.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* Dropdown Header */}
                  <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#002D62]" />
                      <span className="text-[11px] font-bold text-slate-900 tracking-wide uppercase">
                        Recently Viewed {recentlyViewedItems.length > 0 && `(${recentlyViewedItems.length})`}
                      </span>
                    </div>
                    {recentlyViewedItems.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearRecentlyViewedItems();
                        }}
                        className="text-[10px] font-medium text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Dropdown Body */}
                  {recentlyViewedItems.length > 0 ? (
                    <div className="max-h-[340px] overflow-y-auto space-y-1.5 pr-0.5 divide-y divide-slate-100/70">
                      {recentlyViewedItems.map((item) => (
                        <Link
                          key={item.id}
                          href={`/products/${item.id || item.slug}`}
                          onClick={() => setRecentlyViewedOpen(false)}
                          className="pt-1.5 first:pt-0 block group"
                        >
                          <div className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                            <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200/80 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                              <img
                                src={item.poster_image || "/vittal-digital-logo.png"}
                                alt={item.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = "/vittal-digital-logo.png";
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-semibold text-slate-900 group-hover:text-[#002D62] transition-colors truncate">
                                {item.name}
                              </h5>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                {item.category || "Flagship Electronics"}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-xs font-bold text-[#002D62]">
                                  ₹{item.price.toLocaleString("en-IN")}
                                </span>
                                {item.mrp && item.mrp > item.price && (
                                  <span className="text-[10px] text-slate-400 line-through">
                                    ₹{item.mrp.toLocaleString("en-IN")}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#002D62] group-hover:translate-x-0.5 transition-all shrink-0" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="py-3 text-center">
                      <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-2 text-[#002D62]">
                        <Clock className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-800">
                        No recently viewed items yet.
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Items you browse will show up here for quick access.
                      </p>

                      {/* Popular Right Now Recommendations */}
                      <div className="mt-3 pt-3 border-t border-slate-100 text-left">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Popular Right Now
                        </span>
                        <div className="space-y-1.5">
                          {DEFAULT_PRODUCTS.slice(0, 2).map((pop) => (
                            <Link
                              key={pop.id}
                              href={`/products/${pop.id}`}
                              onClick={() => {
                                addRecentlyViewed(pop);
                                setRecentlyViewedOpen(false);
                              }}
                              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 transition-colors group"
                            >
                              <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-200/80 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                                <img
                                  src={pop.poster_image}
                                  alt={pop.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="block text-[11px] font-semibold text-slate-900 group-hover:text-[#002D62] truncate">
                                  {pop.name}
                                </span>
                                <span className="text-[10px] font-bold text-[#002D62]">
                                  ₹{pop.price.toLocaleString("en-IN")}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dropdown Footer */}
                  <div className="pt-2.5 mt-2 border-t border-slate-100">
                    <Link
                      href="/products"
                      onClick={() => setRecentlyViewedOpen(false)}
                      className="flex items-center justify-center gap-1.5 text-center text-xs font-bold text-[#002D62] hover:text-[#001D40] py-1 transition-colors"
                    >
                      <span>Explore All Products</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <span className="text-blue-300/40">|</span>

            {/* Order Status */}
            <Link
              href="/order-tracking"
              className="flex items-center gap-1.5 hover:text-[#FFBE00] transition-colors"
            >
              <span>Order Status</span>
              <ChevronDown className="w-3 h-3 text-white/70" />
            </Link>
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
          <div className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col z-50 overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="relative h-9 w-36">
                <Image
                  src="/vittal-digital-logo.png"
                  alt="Vittal Digital"
                  fill
                  className="object-contain object-left"
                />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200"
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
                  className="block px-3 py-2 rounded-lg text-sm font-bold text-[#002D62] bg-blue-50"
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Shop All Products
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    pathname === "/about"
                      ? "text-[#002D62] bg-blue-50 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  About Vittal Digital
                </Link>
                <Link
                  href="/order-tracking"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Track Order / Status
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  My Wishlist ({totalWishlistItems})
                </Link>
                <button
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleAccountClick(e);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {isAuthenticated ? "My Account" : "Sign In / Register"}
                </button>
              </div>

              {/* Departments */}
              <div className="border-t border-slate-200 pt-3">
                <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Shop By Department
                </p>
                <div className="space-y-1">
                  {departments.map((dep) => {
                    const Icon = dep.icon;
                    return (
                      <Link
                        key={dep.name}
                        href={dep.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#002D62]"
                      >
                        <Icon className="w-4 h-4 text-[#002D62]" />
                        <span>{dep.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Customer Support */}
              <div className="border-t border-slate-200 pt-3">
                <a
                  href="tel:+919600048000"
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <Headphones className="w-5 h-5 text-[#002D62]" />
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">
                      Customer Support
                    </span>
                    <span className="block text-sm font-bold text-slate-900">
                      +91 96000 48000
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
