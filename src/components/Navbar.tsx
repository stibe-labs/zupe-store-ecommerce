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
  Sparkles,
  Flame,
  Truck,
  Headphones,
  Laptop,
  Smartphone,
  Watch,
  Tablet,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";
import { siteConfig } from "@/config/siteConfig";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { totalItems, openCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { openSearch } = useSearch();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCategoriesDropdownOpen(false);
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
      router.push("/signin?redirect=/account");
    }
  };

  const navCategories = [
    { label: "Laptops", href: "/products?category=Laptops", icon: Laptop },
    { label: "Tablets", href: "/products?category=Tablets", icon: Tablet },
    { label: "Smartwatches", href: "/products?category=Smartwatches", icon: Watch },
    { label: "Audio Gadgets", href: "/products?category=Headphones+%26+Earbuds", icon: Headphones },
    { label: "Smartphones", href: "/products?category=Smartphones", icon: Smartphone },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white transition-all duration-200">
      {/* 1. Top Announcement Bar */}
      <div className="bg-[#002b4d] text-white text-xs sm:text-[13px] py-1.5 px-3 sm:px-8 border-b border-blue-950/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium tracking-tight">
              Electronics from Dubai. Delivered across India.
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-blue-200/90 font-medium hover:text-white transition-colors cursor-pointer">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Deliver to India</span>
          </div>
        </div>
      </div>

      {/* 2. Main Header Row */}
      <div
        className={`border-b border-slate-200/80 transition-shadow ${
          isScrolled ? "shadow-sm bg-white/95 backdrop-blur-md" : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-4">
          {/* Brand Logo & Mobile Drawer Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative h-9 sm:h-11 w-32 sm:w-40">
                <Image
                  src={siteConfig.logoUrl}
                  alt={siteConfig.name}
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-4">
            <button
              type="button"
              onClick={openSearch}
              className="w-full flex items-center justify-between px-4 py-2 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-lg text-slate-500 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#003055]"
            >
              <span className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-slate-400" />
                <span>Search electronics...</span>
              </span>
              <kbd className="text-[10px] bg-white border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* User Utility Actions: Account, Wishlist, Cart */}
          <div className="flex items-center gap-1 sm:gap-4 shrink-0">
            {/* Account */}
            <button
              onClick={handleAccountClick}
              className="hidden sm:flex items-center gap-1.5 p-2 text-slate-700 hover:text-[#003055] hover:bg-slate-50 rounded-lg transition-colors text-xs sm:text-sm font-semibold"
              aria-label="User Account"
            >
              <User className="w-4 h-4 text-slate-600" />
              <span>Account</span>
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="hidden sm:flex items-center gap-1.5 p-2 text-slate-700 hover:text-[#003055] hover:bg-slate-50 rounded-lg transition-colors text-xs sm:text-sm font-semibold"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4 text-slate-600" />
              <span>Wishlist</span>
            </Link>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#003055] hover:bg-[#00223f] text-white rounded-lg font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95"
              aria-label="View Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[17px] h-[17px] px-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="font-semibold">Cart</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row (Inside Header) */}
        <div className="lg:hidden px-4 pb-2.5">
          <button
            type="button"
            onClick={openSearch}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-sm"
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-left flex-1 truncate">Search electronics...</span>
          </button>
        </div>
      </div>

      {/* 3. Secondary Category & Quick Links Bar (Desktop) */}
      <div className="hidden lg:block bg-slate-50 border-b border-slate-200 text-sm">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* All Categories Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setCategoriesDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3.5 py-2.5 font-bold text-slate-900 hover:text-[#003055] bg-slate-200/70 hover:bg-slate-200 transition-colors rounded-t-sm"
              >
                <Menu className="w-4 h-4" />
                <span>All Categories</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    categoriesDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {categoriesDropdownOpen && (
                <div className="absolute top-full left-0 w-64 bg-white border border-slate-200 shadow-xl rounded-b-xl py-2 z-50">
                  {navCategories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Link
                        key={cat.label}
                        href={cat.href}
                        onClick={() => setCategoriesDropdownOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-[#003055] transition-colors"
                      >
                        <span className="flex items-center gap-3 text-sm font-medium">
                          <Icon className="w-4 h-4 text-slate-500" />
                          {cat.label}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                    );
                  })}
                  <div className="border-t border-slate-100 mt-2 pt-2">
                    <Link
                      href="/products"
                      onClick={() => setCategoriesDropdownOpen(false)}
                      className="block px-4 py-2 text-xs font-bold text-[#003055] hover:underline"
                    >
                      View All Products →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Category Links */}
            <nav className="flex items-center gap-6 text-slate-700 font-medium">
              <Link
                href="/products?category=Laptops"
                className="hover:text-[#003055] transition-colors py-2.5"
              >
                Laptops
              </Link>
              <Link
                href="/products?category=Tablets"
                className="hover:text-[#003055] transition-colors py-2.5"
              >
                Tablets
              </Link>
              <Link
                href="/products?category=Smartwatches"
                className="hover:text-[#003055] transition-colors py-2.5"
              >
                Smartwatches
              </Link>
              <Link
                href="/products?category=Headphones+%26+Earbuds"
                className="hover:text-[#003055] transition-colors py-2.5"
              >
                Audio Gadgets
              </Link>
              <Link
                href="/#deals"
                className="flex items-center gap-1.5 text-red-600 font-bold hover:text-red-700 transition-colors py-2.5"
              >
                <Flame className="w-4 h-4 text-red-500 fill-red-500" />
                <span>Offers</span>
                <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded-full font-extrabold uppercase">
                  Hot
                </span>
              </Link>
            </nav>
          </div>

          {/* Quick Utility Links (Track Order, Support) */}
          <div className="flex items-center gap-5 text-slate-600 text-xs font-semibold">
            <Link
              href="/order-tracking"
              className="flex items-center gap-1.5 hover:text-[#003055] transition-colors"
            >
              <Truck className="w-3.5 h-3.5 text-slate-500" />
              <span>Track Order</span>
            </Link>
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%2C%20I%20have%20an%20inquiry%20regarding%20Vittal%20Digital`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#003055] transition-colors"
            >
              <Headphones className="w-3.5 h-3.5 text-slate-500" />
              <span>Support</span>
            </a>
          </div>
        </div>
      </div>

      {/* 4. Mobile Quick Category Horizontal Pills (From Mobile Mockup) */}
      <div className="lg:hidden overflow-x-auto no-scrollbar bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-2">
        <Link
          href="/products"
          className="shrink-0 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-100"
        >
          All Categories
        </Link>
        <Link
          href="/order-tracking"
          className="shrink-0 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 flex items-center gap-1"
        >
          <Truck className="w-3 h-3 text-slate-500" />
          <span>Track Order</span>
        </Link>
        <Link
          href="/#deals"
          className="shrink-0 px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-full text-xs font-bold shadow-2xs flex items-center gap-1"
        >
          <Flame className="w-3 h-3 text-red-500 fill-red-500" />
          <span>Offers</span>
        </Link>
        <a
          href={`https://wa.me/${siteConfig.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-2xs flex items-center gap-1"
        >
          <Headphones className="w-3 h-3 text-slate-500" />
          <span>Support</span>
        </a>
      </div>

      {/* 5. Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="relative h-8 w-28">
                <Image
                  src={siteConfig.logoUrl}
                  alt={siteConfig.name}
                  fill
                  className="object-contain object-left"
                />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-200"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Electronics Categories
                </p>
                <div className="space-y-1">
                  {navCategories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Link
                        key={cat.label}
                        href={cat.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-lg text-slate-800 hover:bg-slate-100 font-medium text-sm"
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-slate-500" />
                          {cat.label}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Customer Assistance
                </p>
                <div className="space-y-1">
                  <Link
                    href="/order-tracking"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-lg text-slate-700 hover:bg-slate-100 text-sm font-medium"
                  >
                    <Truck className="w-4 h-4 text-slate-500" />
                    <span>Track Your Order</span>
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-lg text-slate-700 hover:bg-slate-100 text-sm font-medium"
                  >
                    <Heart className="w-4 h-4 text-slate-500" />
                    <span>My Wishlist</span>
                  </Link>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-lg text-slate-700 hover:bg-slate-100 text-sm font-medium"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>My Account</span>
                  </Link>
                  <a
                    href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%2C%20I%20have%20an%20inquiry%20regarding%20Vittal%20Digital`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg text-emerald-700 hover:bg-emerald-50 text-sm font-semibold"
                  >
                    <Headphones className="w-4 h-4" />
                    <span>WhatsApp Concierge</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
              <p className="font-semibold text-slate-700">Vittal Digital Official Store</p>
              <p>Imported from Dubai • Delivered across India</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
