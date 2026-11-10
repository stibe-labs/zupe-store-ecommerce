"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Tag,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function CartPage() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
    freeShippingThreshold,
    freeShippingRemaining,
    openCart,
  } = useCart();

  React.useEffect(() => {
    openCart();
    router.replace("/#shop");
  }, [openCart, router]);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const code = couponCode.trim().toUpperCase();

    if (code === "VITTAL10" || code === "VD10" || code === "WELCOME10") {
      const disc = Math.round(subtotal * 0.1);
      setDiscount(disc);
      setCouponApplied(true);
    } else if (code === "VITTAL15" || code === "VD15") {
      const disc = Math.round(subtotal * 0.15);
      setDiscount(disc);
      setCouponApplied(true);
    } else {
      setCouponError("Invalid promo code. Try VITTAL10 for 10% off.");
    }
  };

  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const grandTotal = Math.max(0, subtotal - discount + shippingFee);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
        <Navbar />
        <div className="max-w-md mx-auto pt-32 pb-24 px-4 text-center">
          <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
              Your Cart is Empty
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mb-8 leading-relaxed">
              Looks like you haven&apos;t added any electronics to your bag yet. Explore our authentic gadgets, smartphones, and laptops.
            </p>
            <Link
              href="/#shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#FFBE00] hover:bg-[#E5AA00] active:bg-[#CC9600] text-slate-950 font-black text-sm shadow-md transition-all"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
      <Navbar />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-16 flex-1 w-full">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Shopping Bag
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {totalItems} item{totalItems > 1 ? "s" : ""} in your bag
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
          >
            Clear All
          </button>
        </div>

        {/* Free Shipping Alert Bar */}
        <div className="mb-8 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="flex items-center gap-1.5 text-emerald-950">
              <Truck className="w-4 h-4 text-emerald-600" />
              {freeShippingRemaining === 0 ? (
                <span className="text-emerald-700 font-black">
                  🎉 You unlocked FREE Express Delivery!
                </span>
              ) : (
                <span>
                  Add <strong className="text-emerald-800">₹{freeShippingRemaining.toLocaleString("en-IN")}</strong> more for Free Delivery
                </span>
              )}
            </span>
            <span className="text-emerald-700 font-black">
              {Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-emerald-100/80 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
              style={{
                width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
              >
                {/* Product Poster */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                  <Image
                    src={item.poster_image}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 w-full sm:w-auto text-center sm:text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {item.category || "Electronics"}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 line-clamp-1">
                    {item.name}
                  </h3>
                  {item.subtitle && (
                    <p className="text-xs text-slate-500">{item.subtitle}</p>
                  )}
                  {item.offer_label && (
                    <div className="mt-1 flex justify-center sm:justify-start">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        ✨ {item.offer_label}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
                    <span className="font-black text-base text-slate-900">
                      ₹{item.price.toLocaleString("en-IN")}
                    </span>
                    {item.mrp && item.mrp > item.price ? (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{item.mrp.toLocaleString("en-IN")}
                      </span>
                    ) : null}
                    {item.quantity > 1 && (
                      <span className="text-xs text-slate-500 font-medium">
                        (₹{(item.bundle_total ?? (item.price * item.quantity)).toLocaleString("en-IN")} total)
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-xs">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 rounded-l-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 rounded-r-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Card */}
          <div className="lg:col-span-1">
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xl space-y-6 sticky top-28">
              <h2 className="font-black text-xl text-slate-900">
                Order Summary
              </h2>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Promo Code (VITTAL10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Coupon code applied!
                  </p>
                )}
                {couponError && (
                  <p className="text-xs text-red-600 font-bold">{couponError}</p>
                )}
              </form>

              <hr className="border-slate-100" />

              {/* Cost Breakdown */}
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Standard Shipping</span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-black uppercase text-[10px]">FREE</span>
                  ) : (
                    <span className="font-bold text-slate-900">₹{shippingFee}</span>
                  )}
                </div>

                <hr className="border-slate-100 pt-2" />

                <div className="flex justify-between items-baseline text-base font-bold text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-2xl font-black text-slate-900">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  if (!user) {
                    openAuthModal("login", "Sign in required: Please log in or create an account to proceed to checkout 🔒", "/checkout");
                    return;
                  }
                  router.push("/checkout");
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-[#FFBE00] hover:bg-[#E5AA00] active:bg-[#CC9600] text-slate-950 font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Encrypted 256-Bit SSL Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
