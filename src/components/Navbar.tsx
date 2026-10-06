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
} from "lucide-react";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const searchDesktopRef = React.useRef<HTMLDivElement>(null);
  const searchMobileRef = React.useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { totalItems, openCart } = useCart();
  const { totalWishlistItems } = useWishlist();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  const liveResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return DEFAULT_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [searchQuery]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchDesktopRef.current &&
        !searchDesktopRef.current.contains(e.target as Node) &&
        searchMobileRef.current &&
        !searchMobileRef.current.contains(e.target as Node)
      ) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchDropdownOpen(false);
      setMobileSearchOpen(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
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
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                setSearchDropdownOpen(true);
              }}
              className="p-1.5 text-gray-900 hover:text-[#FA521C] transition-colors"
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

        {/* Mobile Search Dropdown/Bar (when toggled) */}
        {mobileSearchOpen && (
          <div ref={searchMobileRef} className="mt-2.5 sm:hidden relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onFocus={() => setSearchDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchDropdownOpen(true);
                }}
                placeholder="Search products..."
                className="w-full pl-10 pr-16 py-2.5 rounded-full border border-gray-200 bg-[#FAFAFA] text-xs text-[#111111] focus:outline-none focus:border-[#FA521C] focus:bg-white shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchDropdownOpen(false);
                  }}
                  className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
                  aria-label="Clear mobile search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                aria-label="Submit search"
                className="absolute right-1 top-1 bottom-1 px-3.5 rounded-full bg-[#FA521C] text-white text-xs flex items-center justify-center cursor-pointer shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Mobile Live Suggestions Dropdown */}
            {searchDropdownOpen && searchQuery.trim().length >= 1 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 p-2">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                  <span>Suggestions</span>
                  <span>{liveResults.length} found</span>
                </div>

                {liveResults.length > 0 ? (
                  <div className="space-y-1 mt-1">
                    {liveResults.map((item) => (
                      <Link
                        key={item.id}
                        href={`/products/${item.slug || item.id}`}
                        onClick={() => {
                          setSearchDropdownOpen(false);
                          setMobileSearchOpen(false);
                        }}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-orange-50/70 transition-colors"
                      >
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                          <Image
                            src={item.poster_image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-xs font-semibold text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-gray-400">{item.category}</p>
                        </div>
                        <span className="text-xs font-bold text-[#FA521C]">
                          ₹{item.offer_price.toLocaleString()}
                        </span>
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={(e) => handleSearchSubmit(e)}
                      className="w-full mt-1.5 pt-2 border-t border-gray-100 text-center text-xs font-bold text-[#FA521C] flex items-center justify-center gap-1 py-1"
                    >
                      <span>View all results ({liveResults.length})</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="p-3 text-center">
                    <p className="text-xs text-gray-600">No products matching "{searchQuery}"</p>
                    <button
                      type="button"
                      onClick={(e) => handleSearchSubmit(e)}
                      className="text-xs font-bold text-[#FA521C] hover:underline mt-1"
                    >
                      Search all catalog →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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

          {/* Search Bar (Center, Wide with Live Results) */}
          <div ref={searchDesktopRef} className="flex-1 max-w-2xl relative">
            <form
              onSubmit={handleSearchSubmit}
              className="w-full relative flex items-center"
            >
              <Search className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchDropdownOpen(true);
                }}
                placeholder="Search for amazing products..."
                className="w-full pl-11 pr-20 py-2.5 rounded-full border border-gray-200 bg-[#FAFAFA] text-sm text-[#111111] placeholder:text-gray-400 focus:outline-none focus:border-[#FA521C] focus:bg-white transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchDropdownOpen(false);
                  }}
                  className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                  aria-label="Clear search text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                aria-label="Submit search"
                className="absolute right-1 top-1 bottom-1 px-4 rounded-full bg-[#FA521C] hover:bg-[#E0400B] text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Desktop Live Search Dropdown */}
            {searchDropdownOpen && searchQuery.trim().length >= 1 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 p-2.5">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                  <span>Suggested Products</span>
                  <span>{liveResults.length} matches</span>
                </div>

                {liveResults.length > 0 ? (
                  <div className="space-y-1 mt-1">
                    {liveResults.map((item) => (
                      <Link
                        key={item.id}
                        href={`/products/${item.slug || item.id}`}
                        onClick={() => setSearchDropdownOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-orange-50/70 transition-colors group"
                      >
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                          <Image
                            src={item.poster_image}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-[#FA521C] transition-colors truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-400">{item.category}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-sm font-bold text-[#FA521C]">
                            ₹{item.offer_price.toLocaleString()}
                          </span>
                        </div>
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={(e) => handleSearchSubmit(e)}
                      className="w-full mt-2 pt-2.5 border-t border-gray-100 text-center text-xs font-bold text-[#FA521C] hover:text-[#E0400B] flex items-center justify-center gap-1.5 py-1.5 transition-colors cursor-pointer"
                    >
                      <span>View all results for "{searchQuery}"</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-xs text-gray-600">No products matching "{searchQuery}"</p>
                    <button
                      type="button"
                      onClick={(e) => handleSearchSubmit(e)}
                      className="text-xs font-bold text-[#FA521C] hover:underline mt-1.5 cursor-pointer"
                    >
                      Search all catalog for "{searchQuery}" →
                    </button>
                  </div>
                )}
              </div>
            )}
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
