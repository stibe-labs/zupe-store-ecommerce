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
  const { user } = useAuth();
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

    if (code === "ZUPE10" || code === "WELCOME10") {
      const disc = Math.round(subtotal * 0.1);
      setDiscount(disc);
      setCouponApplied(true);
    } else if (code === "ZUPE15") {
      const disc = Math.round(subtotal * 0.15);
      setDiscount(disc);
      setCouponApplied(true);
    } else {
      setCouponError("Invalid promo code. Try ZUPE10 for 10% off.");
    }
  };

  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const grandTotal = Math.max(0, subtotal - discount + shippingFee);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto py-32 px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-orange-100/70 flex items-center justify-center text-[#FA521C]">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">
            Your Cart is Empty
          </h1>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Looks like you haven&apos;t added anything to your bag yet. Explore our curated modern essentials and transform your living space.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#FA521C] hover:bg-[#E0400B] text-white font-semibold text-sm shadow-lg shadow-[#FA521C]/30 transition-all"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111]">
      <Navbar />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-28 pb-16">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#111111]">
              Shopping Bag
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {totalItems} item{totalItems > 1 ? "s" : ""} in your bag
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Free Shipping Alert Bar */}
        <div className="mb-8 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5 text-gray-700">
              <Truck className="w-4 h-4 text-[#FA521C]" />
              {freeShippingRemaining === 0 ? (
                <span className="text-emerald-600 font-bold">
                  You unlocked FREE Standard Delivery!
                </span>
              ) : (
                <span>
                  Add <strong className="text-[#FA521C]">₹{freeShippingRemaining.toLocaleString()}</strong> more to get Free Delivery
                </span>
              )}
            </span>
            <span className="text-gray-400">
              {Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FA521C] to-[#FF8A65] rounded-full transition-all duration-500"
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
                className="p-4 sm:p-5 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
              >
                {/* Product Poster */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
                  <Image
                    src={item.poster_image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 w-full sm:w-auto text-center sm:text-left">
                  <span className="text-[10px] font-bold text-[#FA521C] uppercase">
                    {item.category}
                  </span>
                  <h3 className="font-display font-bold text-base text-gray-900 line-clamp-1">
                    {item.name}
                  </h3>
                  {item.subtitle && (
                    <p className="text-xs text-gray-400">{item.subtitle}</p>
                  )}
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <span className="font-bold text-base text-gray-900">
                      ₹{item.price.toLocaleString()}
                    </span>
                    {item.mrp && item.mrp > item.price && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{item.mrp.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 rounded-lg hover:bg-white text-gray-600 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-gray-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 rounded-lg hover:bg-white text-gray-600 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6 sticky top-28">
              <h2 className="font-display font-bold text-lg text-gray-900">
                Order Summary
              </h2>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Promo Code (e.g. ZUPE10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#FA521C]/30 focus:border-[#FA521C]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Coupon code applied!
                  </p>
                )}
                {couponError && (
                  <p className="text-xs text-red-500">{couponError}</p>
                )}
              </form>

              <hr className="border-gray-100" />

              {/* Cost Breakdown */}
              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Standard Shipping</span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase text-[10px]">FREE</span>
                  ) : (
                    <span className="font-semibold text-gray-900">₹{shippingFee}</span>
                  )}
                </div>

                <hr className="border-gray-100 pt-2" />

                <div className="flex justify-between items-baseline text-base font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-2xl font-display text-[#FA521C]">
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  if (!user) {
                    router.push(
                      `/signin?redirect=/checkout&notice=${encodeURIComponent(
                        "Please sign in to proceed with checkout and complete your order"
                      )}`
                    );
                    return;
                  }
                  router.push("/checkout");
                }}
                className="w-full py-4 px-6 rounded-2xl bg-[#FA521C] hover:bg-[#E0400B] text-white font-semibold text-sm shadow-xl shadow-[#FA521C]/30 transition-all flex items-center justify-center gap-2 transform active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
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
