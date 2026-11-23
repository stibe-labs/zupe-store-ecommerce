"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  RotateCcw,
  Sparkles,
  Tag,
  CheckCircle2,
  Lock,
  Loader2,
  X,
  Percent,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    totalItems,
  } = useCart();
  const { user, openAuthModal } = useAuth();

  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableOffers, setAvailableOffers] = useState<any[]>([]);

  const freeShippingThreshold = 1999;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const grandTotal = Math.max(0, subtotal - discount + shippingFee);

  const fetchOffers = useCallback(async (currentSubtotal: number) => {
    try {
      const res = await fetch(`/api/promo-codes?subtotal=${currentSubtotal}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.offers)) {
        setAvailableOffers(data.offers);
      }
    } catch (e) {
      console.warn("Could not fetch available offers:", e);
    }
  }, []);

  const validateAndApplyPromo = async (codeToApply: string, notifyOnError = true) => {
    const cleanCode = codeToApply.trim().toUpperCase();
    if (!cleanCode) {
      if (notifyOnError) setCouponError("Please enter a valid promo code");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const res = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: cleanCode,
          subtotal,
          items: cart.map((c) => ({
            id: c.id,
            name: c.name,
            price: (c.bundle_tier && c.bundle_tier > 1 && c.bundle_total)
              ? Math.round(c.bundle_total / c.quantity)
              : c.price,
            quantity: c.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (data.valid && data.discount > 0) {
        setDiscount(data.discount);
        setCouponApplied(true);
        setAppliedPromoCode(data.code || cleanCode);
        setCouponCode(data.code || cleanCode);
        setCouponSuccess(data.message || `🎉 Code ${data.code || cleanCode} applied! ₹${data.discount} discount.`);
        setCouponError("");
        if (typeof window !== "undefined") {
          localStorage.setItem("vittal_applied_promo", data.code || cleanCode);
        }
      } else {
        setDiscount(0);
        setCouponApplied(false);
        setAppliedPromoCode(null);
        if (notifyOnError) {
          setCouponError(data.error || `Promo code "${cleanCode}" is invalid.`);
        }
        setCouponSuccess("");
        if (typeof window !== "undefined") {
          localStorage.removeItem("vittal_applied_promo");
        }
      }
    } catch {
      // Local fallback
      if (cleanCode === "VITTAL10" || cleanCode === "WELCOME10") {
        const disc = Math.min(250, Math.round(subtotal * 0.1));
        setDiscount(disc);
        setCouponApplied(true);
        setAppliedPromoCode(cleanCode);
        setCouponCode(cleanCode);
        setCouponSuccess(`🎉 Code ${cleanCode} applied! ₹${disc} discount.`);
        if (typeof window !== "undefined") {
          localStorage.setItem("vittal_applied_promo", cleanCode);
        }
      } else {
        if (notifyOnError) {
          setCouponError("Unable to validate promo code. Please check your connection.");
        }
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    validateAndApplyPromo(couponCode, true);
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setCouponApplied(false);
    setAppliedPromoCode(null);
    setCouponCode("");
    setCouponSuccess("");
    setCouponError("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("vittal_applied_promo");
    }
  };

  useEffect(() => {
    if (subtotal > 0) {
      fetchOffers(subtotal);
    }
  }, [subtotal, fetchOffers]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCode = localStorage.getItem("vittal_applied_promo");
      if (savedCode && !couponApplied && subtotal > 0) {
        validateAndApplyPromo(savedCode, false);
      }
    }
  }, [subtotal]);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 flex flex-col justify-between selection:bg-[#E5F2D0] selection:text-[#1E300E] font-mograph">
        <Navbar />
        <div className="max-w-md mx-auto pt-32 pb-24 px-4 text-center">
          <div className="bg-[#F7F8FA] rounded-3xl p-8 border border-neutral-200/80 shadow-xs">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#E5F2D0] border border-[#95CF42]/30 flex items-center justify-center text-[#3B581C] shadow-xs">
              <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950 mb-2 tracking-tight">
              Your Cart is Empty
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 mb-8 leading-relaxed font-normal">
              Looks like you haven&apos;t added any items to your bag yet. Explore our lab-tested gym supplements, activewear, dates &amp; artisan chocolates.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#111111] hover:bg-black text-white font-bold text-sm shadow-md transition-all font-movault uppercase tracking-wider"
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
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col justify-between selection:bg-[#E5F2D0] selection:text-[#1E300E] font-mograph">
      <Navbar />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-16 flex-1 w-full">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight">
              Shopping Bag
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5 font-medium">
              {totalItems} item{totalItems > 1 ? "s" : ""} in your bag
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-bold text-neutral-500 hover:text-rose-600 transition-colors cursor-pointer font-movault uppercase tracking-wider"
          >
            Clear All
          </button>
        </div>

        {/* Free Shipping Alert Bar */}
        <div className="mb-8 p-4 rounded-2xl bg-[#F7F8FA] border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="flex items-center gap-1.5 text-neutral-700">
              <Truck className="w-4 h-4 text-[#6B9E3A]" />
              {freeShippingRemaining === 0 ? (
                <span className="text-[#3B581C] font-bold font-movault uppercase tracking-wide">
                  🎉 You unlocked FREE Express Delivery!
                </span>
              ) : (
                <span>
                  Add <strong className="text-neutral-950">₹{freeShippingRemaining.toLocaleString("en-IN")}</strong> more for Free Delivery
                </span>
              )}
            </span>
            <span className="text-[#3B581C] font-mono font-bold">
              {Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-neutral-200/80 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#9CD33B] to-[#6B9E3A] transition-all duration-500 rounded-full"
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
                className="p-4 sm:p-5 rounded-3xl bg-white border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] flex flex-col sm:flex-row items-center gap-4 sm:gap-6 transition-all"
              >
                {/* Product Poster */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-b from-[#F2F8EB] via-[#F8FAF4] to-[#FFFFFF] overflow-hidden flex-shrink-0">
                  <Image
                    src={item.poster_image || "/vittal/product-whey-protein-jar.png"}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 w-full sm:w-auto text-center sm:text-left">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                    {item.category || "Lifestyle"}
                  </span>
                  <h3 className="font-bold text-base text-neutral-950 line-clamp-1">
                    {item.name}
                  </h3>
                  {item.subtitle && (
                    <p className="text-xs text-neutral-500">{item.subtitle}</p>
                  )}
                  {item.offer_label && (
                    <div className="mt-1 flex justify-center sm:justify-start">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E5F2D0] text-[#3B581C] border border-[#95CF42]/30">
                        ✨ {item.offer_label}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
                    <span className="font-extrabold text-base text-neutral-950 font-mograph">
                      ₹{item.price.toLocaleString("en-IN")}
                    </span>
                    {item.mrp && item.mrp > item.price ? (
                      <span className="text-xs text-neutral-400 line-through">
                        ₹{item.mrp.toLocaleString("en-IN")}
                      </span>
                    ) : null}
                    {item.quantity > 1 && (
                      <span className="text-xs text-neutral-500 font-medium">
                        (₹{(item.bundle_total ?? (item.price * item.quantity)).toLocaleString("en-IN")} total)
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-[#F7F8FA] border border-neutral-200 rounded-xl shadow-xs">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 rounded-l-xl hover:bg-neutral-200/60 text-neutral-600 transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-neutral-950 font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 rounded-r-xl hover:bg-neutral-200/60 text-neutral-600 transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
            <div className="p-6 sm:p-7 rounded-3xl bg-[#F7F8FA] border border-neutral-200/80 shadow-xs space-y-6 sticky top-28">
              <h2 className="font-bold text-xl text-neutral-950 tracking-tight">
                Order Summary
              </h2>

              {/* Coupon Form & Available Offers */}
              <div className="space-y-3">
                {couponApplied ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-emerald-950 font-movault tracking-wide">
                            {appliedPromoCode}
                          </span>
                          <span className="text-[10px] bg-emerald-200 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                            -₹{discount}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700 font-medium">
                          {couponSuccess || "Promo code applied successfully"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1.5 rounded-lg hover:bg-emerald-200/60 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
                      title="Remove promo code"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          placeholder="Promo Code (e.g. VITTAL10)"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-950 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-[#6B9E3A] placeholder:text-neutral-400 placeholder:normal-case placeholder:font-normal"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-4 py-2.5 rounded-xl bg-[#111111] hover:bg-black disabled:bg-neutral-300 text-white text-xs font-bold transition-colors cursor-pointer uppercase font-movault tracking-wider flex items-center gap-1.5 disabled:cursor-not-allowed"
                      >
                        {couponLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span>Apply</span>
                        )}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-rose-600 font-medium pl-1">{couponError}</p>
                    )}
                  </form>
                )}

                {/* Available Offers List */}
                {availableOffers.length > 0 && !couponApplied && (
                  <div className="pt-2">
                    <div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Available Offers & Coupons</span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {availableOffers.map((offer) => (
                        <div
                          key={offer.id || offer.code}
                          className={`p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between gap-2 ${
                            offer.eligible
                              ? "bg-white border-neutral-200 hover:border-[#95CF42]"
                              : "bg-neutral-50 border-neutral-200/60 opacity-80"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-neutral-950 uppercase font-mono tracking-wider text-[11px] bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                                {offer.code}
                              </span>
                              <span className="text-[10px] font-bold text-[#6B9E3A]">
                                {offer.discount_type === "PERCENTAGE"
                                  ? `${offer.discount_value}% OFF`
                                  : `₹${offer.discount_value} OFF`}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-600 line-clamp-1 mt-0.5">
                              {offer.description || (offer.min_order_amount > 0 ? `On orders above ₹${offer.min_order_amount}` : "On all orders")}
                            </p>
                            {!offer.eligible && offer.amountNeeded > 0 && (
                              <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
                                Add ₹{offer.amountNeeded} more to unlock
                              </p>
                            )}
                          </div>
                          {offer.eligible ? (
                            <button
                              type="button"
                              onClick={() => validateAndApplyPromo(offer.code, true)}
                              disabled={couponLoading}
                              className="px-2.5 py-1 rounded-lg bg-[#E5F2D0] hover:bg-[#d8edbc] text-[#2C4814] font-bold text-[11px] transition-colors cursor-pointer shrink-0 uppercase tracking-tight"
                            >
                              Apply
                            </button>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-neutral-200/60 text-neutral-500 font-semibold text-[10px] shrink-0">
                              Locked
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-neutral-200" />

              {/* Cost Breakdown */}
              <div className="space-y-3 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-neutral-950">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-[#6B9E3A] font-bold">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Standard Shipping</span>
                  {shippingFee === 0 ? (
                    <span className="text-[#6B9E3A] font-bold uppercase text-[10px] font-movault tracking-wider">FREE</span>
                  ) : (
                    <span className="font-bold text-neutral-950">₹{shippingFee}</span>
                  )}
                </div>

                <hr className="border-neutral-200 pt-2" />

                <div className="flex justify-between items-baseline text-base font-bold text-neutral-950">
                  <span className="font-bold uppercase tracking-tight">Total Amount</span>
                  <span className="text-2xl font-extrabold text-[#6B9E3A] font-mono">
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
                className="w-full py-3.5 px-6 rounded-2xl bg-[#95CF42] hover:bg-[#85BE33] text-neutral-950 font-black text-sm shadow-md shadow-[#95CF42]/20 transition-all flex items-center justify-center gap-2 cursor-pointer font-movault uppercase tracking-wider"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500 font-semibold">
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
