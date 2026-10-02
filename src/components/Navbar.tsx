"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  ChevronDown,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

const CATEGORY_NAV = [
  { label: "Home", href: "/", active: true },
  { label: "New Arrivals", href: "/products?filter=new" },
  { label: "Best Sellers", href: "/products?filter=best" },
  { label: "Gadgets", href: "/products?category=Gadgets" },
  { label: "Home & Living", href: "/products?category=Home+%26+Living" },
  { label: "Health & Wellness", href: "/products?category=Health+%26+Wellness" },
  { label: "Personal Care", href: "/products?category=Personal+Care" },
  { label: "Car Accessories", href: "/products?category=Car+Accessories" },
  { label: "Offers", href: "/products?filter=offers" },
];

export function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { totalItems, openCart } = useCart();
  const { totalWishlistItems } = useWishlist();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      {/* Main Header Row */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center">
              <Image
                src="/zupe-logo.png"
                alt="Zupe Store"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <span className="font-display font-black text-2xl tracking-tight text-[#111111]">
              Zupe<span className="text-[#FA521C]">store</span>
            </span>
          </Link>

          {/* Search Bar (Center, Wide) */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-2xl relative hidden sm:flex items-center"
          >
            <div className="w-full relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for amazing products..."
                className="w-full pl-11 pr-14 py-2.5 rounded-full border border-gray-200 bg-[#FAFAFA] text-sm text-[#111111] placeholder:text-gray-400 focus:outline-none focus:border-[#FA521C] focus:bg-white transition-all shadow-inner"
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="absolute right-1 top-1 bottom-1 px-4 rounded-full bg-[#FA521C] hover:bg-[#E0400B] text-white flex items-center justify-center transition-colors shadow-sm"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right Action Icons: Account, Wishlist, Cart */}
          <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
            {/* Account */}
            <div className="relative">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setUserDropdownOpen(!userDropdownOpen);
                  } else {
                    openAuthModal("login");
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
                  <Link
                    href="/admin"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    Admin Portal
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
                <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-[#FA521C] text-white text-[10px] font-bold flex items-center justify-center">
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
                <span className="absolute -top-2 -right-2.5 w-4.5 h-4.5 rounded-full bg-[#FA521C] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                  {totalItems || 2}
                </span>
              </div>
              <span className="hidden md:inline font-bold">Cart</span>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-1.5 text-gray-700"
              aria-label="Toggle Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Search Row */}
        <form onSubmit={handleSearchSubmit} className="mt-3 sm:hidden relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for amazing products..."
            className="w-full pl-10 pr-12 py-2 rounded-full border border-gray-200 bg-[#FAFAFA] text-xs focus:outline-none focus:border-[#FA521C]"
          />
          <button
            type="submit"
            aria-label="Submit search"
            className="absolute right-1 top-1 bottom-1 px-3 rounded-full bg-[#FA521C] text-white text-xs flex items-center justify-center"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Secondary Category Sub-Nav Row */}
      <div className="border-t border-gray-100 hidden sm:block bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between text-xs font-semibold">
            {/* All Categories Dropdown button */}
            <Link
              href="/products"
              className="flex items-center gap-2 py-3 px-3 text-gray-900 font-bold hover:text-[#FA521C] transition-colors border-r border-gray-100 mr-4"
            >
              <Menu className="w-4 h-4 text-[#111111]" />
              <span>All Categories</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-6 overflow-x-auto scrollbar-none py-1">
              {CATEGORY_NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`py-3 whitespace-nowrap transition-colors relative ${
                    item.active
                      ? "text-[#FA521C] font-bold"
                      : "text-gray-700 hover:text-[#FA521C] font-medium"
                  }`}
                >
                  {item.label}
                  {item.active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FA521C] rounded-full" />
                  )}
                </Link>
              ))}
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
                <span className="font-display font-black text-xl text-gray-900">
                  Zupe<span className="text-[#FA521C]">store</span>
                </span>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-1">
                {CATEGORY_NAV.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-[#FA521C]/10 hover:text-[#FA521C]"
                  >
                    {item.label}
                  </Link>
                ))}
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
