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
    router.replace("/products");
  }, [openCart, router]);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const code = couponCode.trim().toUpperCase();

    if (code === "TURKIYE10" || code === "TJ10" || code === "ZUPE10" || code === "WELCOME10") {
      const disc = Math.round(subtotal * 0.1);
      setDiscount(disc);
      setCouponApplied(true);
    } else if (code === "TURKIYE15" || code === "TJ15" || code === "ZUPE15") {
      const disc = Math.round(subtotal * 0.15);
      setDiscount(disc);
      setCouponApplied(true);
    } else {
      setCouponError("Invalid promo code. Try TURKIYE10 for 10% off.");
    }
  };

  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const grandTotal = Math.max(0, subtotal - discount + shippingFee);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen tj-diamonds-cream text-stone-900 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto pt-32 pb-24 px-4 text-center">
          <div className="bg-white rounded-3xl p-8 border-2 border-stone-800 shadow-[0_8px_0_0_#2b2b2b]">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#f8bac5] border-2 border-stone-800 flex items-center justify-center text-[#5b1420] shadow-[0_3px_0_0_#2b2b2b]">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-tj-serif text-stone-900 mb-2">
              Your Cart is Empty
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mb-8 leading-relaxed">
              Looks like you haven&apos;t added anything to your bag yet. Explore our authentic Turkish Epimedium honey herbal paste and boost your daily vitality.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl btn-shimmer bg-[#fed000] hover:bg-[#fab005] text-stone-900 font-black text-sm border-2 border-stone-800 shadow-[0_4px_0_0_#2b2b2b] active:translate-y-0.5 active:shadow-none transition-all"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen tj-diamonds-cream text-stone-900 flex flex-col justify-between">
      <Navbar />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-16 flex-1 w-full">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-300">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black font-tj-serif text-stone-900">
              Shopping Bag
            </h1>
            <p className="text-xs text-stone-600 mt-1">
              {totalItems} item{totalItems > 1 ? "s" : ""} in your bag
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-bold text-stone-500 hover:text-red-600 transition-colors cursor-pointer"
          >
            Clear All
          </button>
        </div>

        {/* Free Shipping Alert Bar */}
        <div className="mb-8 p-4 rounded-2xl bg-white border-2 border-stone-800 shadow-[0_4px_0_0_#2b2b2b]">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="flex items-center gap-1.5 text-stone-800">
              <Truck className="w-4 h-4 text-[#5b1420]" />
              {freeShippingRemaining === 0 ? (
                <span className="text-emerald-700 font-black">
                  You unlocked FREE Standard Delivery!
                </span>
              ) : (
                <span>
                  Add <strong className="text-[#5b1420]">₹{freeShippingRemaining.toLocaleString()}</strong> more to get Free Delivery
                </span>
              )}
            </span>
            <span className="text-stone-500">
              {Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-stone-100 border border-stone-300 overflow-hidden">
            <div
              className="h-full bg-[#fed000] border-r-2 border-stone-800 transition-all duration-500"
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
                className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-stone-800 shadow-[0_6px_0_0_#2b2b2b] flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
              >
                {/* Product Poster */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-stone-50 border border-stone-200 overflow-hidden flex-shrink-0">
                  <Image
                    src={item.poster_image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 w-full sm:w-auto text-center sm:text-left">
                  <span className="text-[10px] font-bold text-[#5b1420] uppercase tracking-wider">
                    {item.category || "Authentic Herbal Paste"}
                  </span>
                  <h3 className="font-tj-serif font-bold text-base text-stone-900 line-clamp-1">
                    {item.name}
                  </h3>
                  {item.subtitle && (
                    <p className="text-xs text-stone-500">{item.subtitle}</p>
                  )}
                  {item.offer_label && (
                    <div className="mt-1 flex justify-center sm:justify-start">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#f8bac5] text-[#5b1420] border border-stone-800">
                        ✨ {item.offer_label}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
                    <span className="font-black text-base text-[#5b1420]">
                      ₹{item.price.toLocaleString()}
                    </span>
                    {item.original_price && item.original_price > item.price ? (
                      <span className="text-xs text-stone-400 line-through">
                        ₹{item.original_price.toLocaleString()}
                      </span>
                    ) : item.mrp && item.mrp > item.price ? (
                      <span className="text-xs text-stone-400 line-through">
                        ₹{item.mrp.toLocaleString()}
                      </span>
                    ) : null}
                    {item.quantity > 1 && (
                      <span className="text-xs text-stone-600 font-medium">
                        (₹{(item.bundle_total ?? (item.price * item.quantity)).toLocaleString()} total)
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-stone-50 border-2 border-stone-800 rounded-xl p-1 shadow-[0_2px_0_0_#2b2b2b]">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-black text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
            <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-stone-800 shadow-[0_8px_0_0_#2b2b2b] space-y-6 sticky top-28">
              <h2 className="font-tj-serif font-black text-xl text-stone-900">
                Order Summary
              </h2>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Promo Code (TURKIYE10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-stone-800 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#fed000]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-stone-900 text-[#fed000] border-2 border-stone-800 text-xs font-black hover:bg-stone-800 transition-colors cursor-pointer"
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

              <hr className="border-stone-200" />

              {/* Cost Breakdown */}
              <div className="space-y-3 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-stone-900">₹{subtotal.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Standard Shipping</span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-black uppercase text-[10px]">FREE</span>
                  ) : (
                    <span className="font-bold text-stone-900">₹{shippingFee}</span>
                  )}
                </div>

                <hr className="border-stone-200 pt-2" />

                <div className="flex justify-between items-baseline text-base font-bold text-stone-900">
                  <span>Total Amount</span>
                  <span className="text-2xl font-black font-tj-serif text-[#5b1420]">
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  if (!user) {
                    openAuthModal("login", "Sign in required: Please log in or create an account to proceed to checkout 🔒");
                    return;
                  }
                  router.push("/checkout");
                }}
                className="w-full py-4 px-6 rounded-2xl btn-shimmer bg-[#fed000] hover:bg-[#fab005] text-stone-900 font-black text-sm border-2 border-stone-800 shadow-[0_4px_0_0_#2b2b2b] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 font-semibold">
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
