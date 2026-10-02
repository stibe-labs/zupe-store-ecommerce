"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Shop", href: "/products" },
  { label: "Decor", href: "/products?category=Decor" },
  { label: "Accessories", href: "/products?category=Accessories" },
  { label: "Essentials", href: "/products?category=Essentials" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalItems, openCart } = useCart();
  const { totalWishlistItems } = useWishlist();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass-nav shadow-lg shadow-[#6C5CE7]/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:shadow-[#6C5CE7]/30 transition-all duration-300">
                <span className="text-white font-display font-bold text-lg leading-none">Z</span>
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-[#2D3436]">
                Zupe<span className="text-[#6C5CE7]">.</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-[#636E72] hover:text-[#6C5CE7] transition-colors duration-300 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#6C5CE7] rounded-full group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 rounded-xl hover:bg-[#6C5CE7]/8 transition-colors duration-200"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-[#636E72]" />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="p-2.5 rounded-xl hover:bg-[#FF6B6B]/8 transition-colors duration-200 relative"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 text-[#636E72]" />
                {totalWishlistItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-[#FF6B6B] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalWishlistItems}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="p-2.5 rounded-xl hover:bg-[#6C5CE7]/8 transition-colors duration-200 relative"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5 text-[#636E72]" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-[#6C5CE7] text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </button>

              {/* User */}
              <div className="relative">
                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      setUserMenuOpen(!userMenuOpen);
                    } else {
                      openAuthModal("login");
                    }
                  }}
                  className="p-2.5 rounded-xl hover:bg-[#6C5CE7]/8 transition-colors duration-200 flex items-center gap-1"
                  aria-label="Account"
                >
                  <User className="w-5 h-5 text-[#636E72]" />
                  {isAuthenticated && (
                    <ChevronDown className="w-3 h-3 text-[#636E72] hidden sm:block" />
                  )}
                </button>

                <AnimatePresence>
                  {userMenuOpen && isAuthenticated && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 overflow-hidden z-50"
                    >
                      <div className="p-4 bg-gradient-to-r from-[#6C5CE7]/5 to-[#A29BFE]/5 border-b border-gray-100">
                        <p className="text-sm font-semibold text-[#2D3436] truncate">{user?.name}</p>
                        <p className="text-xs text-[#636E72] truncate">{user?.email}</p>
                      </div>
                      <div className="py-2">
                        <Link href="/profile" className="block px-4 py-2.5 text-sm text-[#2D3436] hover:bg-gray-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          My Profile
                        </Link>
                        <Link href="/orders" className="block px-4 py-2.5 text-sm text-[#2D3436] hover:bg-gray-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          My Orders
                        </Link>
                        <Link href="/wishlist" className="block px-4 py-2.5 text-sm text-[#2D3436] hover:bg-gray-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          Wishlist
                        </Link>
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-[#FF6B6B] hover:bg-red-50 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2.5 rounded-xl hover:bg-[#6C5CE7]/8 transition-colors duration-200"
                aria-label="Menu"
              >
                {mobileOpen ? (
                  <X className="w-5 h-5 text-[#2D3436]" />
                ) : (
                  <Menu className="w-5 h-5 text-[#636E72]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-100 overflow-hidden"
            >
              <div className="max-w-2xl mx-auto px-4 py-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A29BFE]" />
                  <input
                    type="text"
                    placeholder="Search for products, categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery.trim()) {
                        window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
                      }
                    }}
                    className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-[#6C5CE7]/15 text-sm text-[#2D3436] placeholder:text-[#B2BEC3] focus:outline-none focus:border-[#6C5CE7]/40 focus:ring-2 focus:ring-[#6C5CE7]/10 transition-all"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <span className="font-display font-bold text-lg text-[#2D3436]">
                  Menu
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 p-5 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 px-4 text-base font-medium text-[#2D3436] hover:bg-[#6C5CE7]/5 hover:text-[#6C5CE7] rounded-xl transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <hr className="my-4 border-gray-100" />
                {isAuthenticated ? (
                  <>
                    <Link href="/profile" onClick={() => setMobileOpen(false)} className="block py-3 px-4 text-base text-[#636E72] hover:bg-gray-50 rounded-xl transition-colors">
                      My Profile
                    </Link>
                    <Link href="/orders" onClick={() => setMobileOpen(false)} className="block py-3 px-4 text-base text-[#636E72] hover:bg-gray-50 rounded-xl transition-colors">
                      Orders
                    </Link>
                    <button
                      onClick={() => { logout(); setMobileOpen(false); }}
                      className="w-full text-left py-3 px-4 text-base text-[#FF6B6B] hover:bg-red-50 rounded-xl transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { openAuthModal("login"); setMobileOpen(false); }}
                    className="w-full py-3 px-4 bg-[#6C5CE7] text-white font-semibold rounded-xl hover:bg-[#4834D4] transition-colors"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Click-away for user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </>
  );
}
