"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Package,
  Heart,
  Truck,
  ShoppingBag,
  LogOut,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Phone,
  Mail,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { totalWishlistItems } = useWishlist();
  const { totalItems } = useCart();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/signin?redirect=/account&notice=Please sign in to access your account profile");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBFBFC] text-[#111111] flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-[#FA521C]/20 border-t-[#FA521C] rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#FBFBFC] text-[#111111] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FA521C] flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">Sign in to your account</h2>
          <p className="text-sm text-gray-500 mb-6">
            View your orders, manage wishlist items, and track live shipments.
          </p>
          <div className="space-y-3">
            <Link
              href="/signin?redirect=/account"
              className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-[#FA521C] text-white font-bold text-sm shadow-md shadow-[#FA521C]/20 hover:bg-[#E04515] transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/signin?mode=signup&redirect=/account"
              className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-800 font-bold text-sm hover:bg-gray-50 transition-all"
            >
              Create New Account
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-[#111111] flex flex-col justify-between pb-24 sm:pb-0">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Profile Header Banner */}
        <div className="bg-gradient-to-r from-[#111111] via-[#1C1F26] to-[#111111] text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#FA521C]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#FA521C] to-[#FFA07A] text-white flex items-center justify-center font-display font-extrabold text-2xl sm:text-3xl shadow-lg shadow-[#FA521C]/25 flex-shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold font-display text-white truncate">
                    {user.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wide uppercase border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </p>
                {user.phone && (
                  <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                    <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span>{user.phone}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-gray-200 hover:text-white transition-colors cursor-pointer border border-white/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Core Account Navigation Cards (My Orders, Order Tracking, Wishlist, Cart) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* 1. My Orders */}
          <Link
            href="/orders"
            className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-[#FA521C]/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FA521C] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Package className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-[#FA521C] transition-colors flex items-center gap-1">
                  View <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">My Orders</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Review past purchases, download invoice receipts, and check delivery status.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-gray-50 flex items-center text-xs font-semibold text-[#FA521C]">
              <span>Go to Orders</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 2. Order Tracking */}
          <Link
            href="/order-tracking"
            className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-[#FA521C]/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FA521C]/10 text-[#FA521C] text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FA521C] animate-ping" />
                Live Tracker
              </span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FA521C] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Truck className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Order Tracking</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Live courier updates, AWB lookup, and real-time shipment milestone timeline.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-gray-50 flex items-center text-xs font-semibold text-[#FA521C]">
              <span>Track Live Package</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 3. My Wishlist */}
          <Link
            href="/wishlist"
            className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-rose-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Heart className="w-6 h-6" />
                </div>
                {totalWishlistItems > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                    {totalWishlistItems} saved
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">My Wishlist</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Favorite items saved for later. Quick 1-click add to cart with live price updates.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-gray-50 flex items-center text-xs font-semibold text-rose-600">
              <span>View Wishlist</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Secondary Services & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shopping Bag Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FA521C] flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Shopping Bag</h4>
                  <p className="text-xs text-gray-500">{totalItems} item{totalItems === 1 ? "" : "s"} in cart</p>
                </div>
              </div>
              <Link
                href="/cart"
                className="px-3.5 py-1.5 rounded-xl bg-[#FA521C] text-white text-xs font-bold hover:bg-[#E04515] transition-colors"
              >
                Go to Cart
              </Link>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Items in your cart are reserved with express checkout and free shipping offers.
            </p>
          </div>

          {/* Customer Support Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#FA521C] mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  24/7 Dedicated Support
                </span>
              </div>
              <h4 className="text-base font-bold">Need help with an order or address change?</h4>
              <p className="text-xs text-gray-300 mt-1 max-w-md">
                Our support concierge is standing by to resolve courier deliveries, returns, or order modifications.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <a
                href="https://wa.me/919876543210?text=Hi%20Zupe%20Store%2C%20I%20need%20help%20with%20my%20account"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors whitespace-nowrap"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
              <a
                href="tel:+919876543210"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Us</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
