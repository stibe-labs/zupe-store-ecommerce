"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Lock,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const DRAWER_EASE = [0.32, 0.72, 0, 1] as const;

export function CartDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [isNavigating, setIsNavigating] = useState(false);
  const [showNavSpinner, setShowNavSpinner] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  const { user, openAuthModal } = useAuth();
  const {
    cart,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    totalItems,
    subtotal,
    savings,
    freeShippingThreshold,
    freeShippingRemaining,
    outOfStockItemIds,
    hasOutOfStockItems,
  } = useCart();

  const shippingProgress =
    freeShippingThreshold > 0
      ? Math.min(100, Math.max(0, (subtotal / freeShippingThreshold) * 100))
      : 100;
  const isFreeShippingUnlocked = freeShippingRemaining <= 0;

  // Prefetch checkout chunk for instant navigation
  useEffect(() => {
    router.prefetch("/checkout");
  }, [router]);

  // 300ms delayed spinner so fast navigations never flash
  useEffect(() => {
    if (!isNavigating) {
      setShowNavSpinner(false);
      return;
    }
    const timer = window.setTimeout(() => setShowNavSpinner(true), 300);
    return () => window.clearTimeout(timer);
  }, [isNavigating]);

  // Reset navigating state when cart closes or path changes
  useEffect(() => {
    if (!isOpen || pathname?.startsWith("/checkout")) {
      setIsNavigating(false);
    }
  }, [isOpen, pathname]);

  // Always close drawer on checkout page
  useEffect(() => {
    if (pathname?.startsWith("/checkout")) {
      closeCart();
      setIsNavigating(false);
    }
  }, [pathname, closeCart]);

  // Lock background scroll, bind Escape key, and focus close button on open
  useEffect(() => {
    if (!isOpen) return;

    const origBody = document.body.style.overflow;
    const origHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");

    const focusTimer = window.setTimeout(() => closeBtnRef.current?.focus(), 60);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeCart();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = origBody;
      document.documentElement.style.overflow = origHtml;
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
    };
  }, [isOpen, closeCart]);

  if (pathname?.startsWith("/checkout")) {
    return null;
  }

  const handleProceedToCheckout = () => {
    if (hasOutOfStockItems || isNavigating) return;
    closeCart();

    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("zupe_confirmed_order");
      } catch {}
    }

    if (!user) {
      const savedPhone =
        typeof window !== "undefined"
          ? localStorage.getItem("zupe_checkout_phone") ||
            localStorage.getItem("zupe_last_phone") ||
            ""
          : "";
      openAuthModal(
        "login",
        "Sign in with WhatsApp to continue to checkout",
        "/checkout",
        () => {
          router.push("/checkout");
        },
        {
          initialPhone: savedPhone || undefined,
          autoSendOtp: Boolean(savedPhone && savedPhone.length === 10),
        }
      );
      return;
    }

    setIsNavigating(true);
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Scrim Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.22,
              ease: DRAWER_EASE,
            }}
            className="fixed inset-0 bg-[#120E0C]/55 backdrop-blur-[3px] z-50"
            onClick={closeCart}
          />

          {/* Slide-Over Bag Drawer */}
          <motion.aside
            key="cart-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            data-lenis-prevent
            initial={prefersReducedMotion ? { opacity: 0 } : { x: "100%" }}
            animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { x: "100%" }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.26,
              ease: DRAWER_EASE,
            }}
            className="fixed right-0 top-0 bottom-0 h-dvh w-full max-w-[420px] bg-[#FBF8F3] text-[#1B1714] z-50 shadow-[-12px_0_40px_-16px_rgba(18,14,12,0.28)] border-l border-stone-200/80 flex flex-col min-h-0 overflow-hidden antialiased"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#FBF8F3] border-b border-stone-200/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <h2 className="font-tj-serif text-xl font-bold text-[#1B1714] tracking-tight">
                  Your Bag
                </h2>
                <span className="text-xs font-medium bg-[#6E1625]/10 text-[#6E1625] px-2.5 py-0.5 rounded-full tabular-nums">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={closeCart}
                aria-label="Close shopping bag"
                className="w-11 h-11 -mr-1.5 rounded-full flex items-center justify-center text-[#655B53] hover:text-[#1B1714] hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Delivery Progress Strip */}
            {cart.length > 0 && (
              <div
                className={`px-5 py-3 border-b shrink-0 ${
                  isFreeShippingUnlocked
                    ? "bg-[#ECF7F2] border-[#CBE8DA]"
                    : "bg-white border-stone-200/70"
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {isFreeShippingUnlocked ? (
                      <span className="w-5 h-5 rounded-full bg-[#116A4B] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    ) : (
                      <Truck className="w-4 h-4 text-[#6E1625] shrink-0" />
                    )}
                    <span
                      className={`font-medium truncate tabular-nums ${
                        isFreeShippingUnlocked ? "text-[#116A4B]" : "text-[#1B1714]"
                      }`}
                    >
                      {isFreeShippingUnlocked
                        ? "Free express delivery unlocked"
                        : `Add ₹${freeShippingRemaining.toLocaleString("en-IN")} more for free express delivery`}
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-black/8 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      isFreeShippingUnlocked ? "bg-[#116A4B]" : "bg-[#6E1625]"
                    }`}
                    initial={false}
                    animate={{ width: `${shippingProgress}%` }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.35,
                      ease: DRAWER_EASE,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Bag Contents */}
            <div
              data-lenis-prevent
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-4"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200/80 flex items-center justify-center text-[#6E1625] mb-4 shadow-2xs">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <h3 className="font-tj-serif text-xl font-bold text-[#1B1714]">
                    Your bag is empty
                  </h3>
                  <p className="text-sm text-[#655B53] mt-1.5 mb-6 max-w-[260px] leading-relaxed">
                    Choose a Turkiye Jam sachet pack or jar to start your order.
                  </p>
                  <Link
                    href="/#shop"
                    onClick={closeCart}
                    className="min-h-[48px] px-6 rounded-xl bg-[#6E1625] hover:bg-[#54101C] text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                  >
                    <span>Choose your pack</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {cart.map((item) => {
                      const isOutOfStock =
                        outOfStockItemIds.includes(item.id) ||
                        outOfStockItemIds.includes(item.id?.toLowerCase());
                      const lineTotal = item.bundle_total ?? item.price * item.quantity;
                      const compareUnit =
                        item.original_price && item.original_price > item.price
                          ? item.original_price
                          : item.mrp && item.mrp > item.price
                          ? item.mrp
                          : null;
                      const lineCompareTotal = compareUnit ? compareUnit * item.quantity : null;

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-2xl border transition-colors ${
                            isOutOfStock
                              ? "bg-rose-50/80 border-rose-200"
                              : "bg-white border-stone-200/80 shadow-[0_1px_2px_rgba(27,23,20,0.03)]"
                          }`}
                        >
                          <div className="flex gap-3.5">
                            <Link
                              href={`/products/${item.id}`}
                              onClick={closeCart}
                              className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#F6F1EA] border border-stone-200/70 shrink-0 hover:opacity-90 transition-opacity"
                            >
                              <Image
                                src={item.poster_image}
                                alt={item.name}
                                width={80}
                                height={80}
                                className={`w-full h-full object-cover ${
                                  isOutOfStock ? "grayscale opacity-65" : ""
                                }`}
                              />
                              {isOutOfStock && (
                                <div className="absolute inset-0 bg-[#1B1714]/55 flex items-center justify-center">
                                  <span className="text-[10px] font-semibold text-white bg-rose-700 px-2 py-0.5 rounded">
                                    Sold out
                                  </span>
                                </div>
                              )}
                            </Link>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <Link
                                  href={`/products/${item.id}`}
                                  onClick={closeCart}
                                  className="text-sm font-semibold text-[#1B1714] hover:text-[#6E1625] transition-colors leading-snug line-clamp-2"
                                >
                                  {item.name}
                                </Link>
                                <div className="text-right shrink-0 tabular-nums">
                                  <span className="text-sm font-semibold text-[#1B1714] block">
                                    ₹{lineTotal.toLocaleString("en-IN")}
                                  </span>
                                  {lineCompareTotal && lineCompareTotal > lineTotal && (
                                    <span className="text-xs text-[#8C8177] line-through block">
                                      ₹{lineCompareTotal.toLocaleString("en-IN")}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <p className="text-xs text-[#655B53] mt-0.5 tabular-nums">
                                ₹{item.price.toLocaleString("en-IN")} each
                              </p>

                              {isOutOfStock ? (
                                <p className="text-xs font-medium text-rose-700 mt-1">
                                  Currently out of stock
                                </p>
                              ) : item.offer_label ? (
                                <p className="text-xs font-medium text-[#116A4B] mt-1">
                                  {item.offer_label}
                                </p>
                              ) : null}

                              {/* Tactile Stepper & Remove Row */}
                              <div className="flex items-center justify-between gap-2 mt-3">
                                <div className="inline-flex items-center rounded-xl border border-stone-200/90 bg-[#FBF8F3]">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    aria-label={`Decrease quantity of ${item.name}`}
                                    className="w-10 h-10 flex items-center justify-center text-[#655B53] hover:text-[#1B1714] transition-colors cursor-pointer"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="w-8 text-center text-sm font-semibold text-[#1B1714] tabular-nums">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    aria-label={`Increase quantity of ${item.name}`}
                                    className="w-10 h-10 flex items-center justify-center text-[#655B53] hover:text-[#1B1714] transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.id)}
                                  aria-label={`Remove ${item.name}`}
                                  className="min-h-[40px] px-2.5 rounded-xl inline-flex items-center gap-1.5 text-xs font-medium text-[#8C8177] hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Remove</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quiet Turkiye Jam Delivery & Packaging Assurance */}
                  <div className="p-4 rounded-2xl bg-white/75 border border-stone-200/70 space-y-2.5 text-xs text-[#655B53]">
                    <div className="flex items-start gap-2.5">
                      <Package className="w-4 h-4 text-[#6E1625] shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        <strong className="font-medium text-[#1B1714]">Discreet unbranded box.</strong>{" "}
                        Plain tamper-evident outer parcel with no product name on the label.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-[#116A4B] shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        Pay securely via UPI, cards, NetBanking, or Cash on Delivery at checkout.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer Actions */}
            {cart.length > 0 && (
              <div className="px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] bg-white border-t border-stone-200/80 space-y-3.5 shrink-0">
                <div className="space-y-1.5 tabular-nums">
                  {savings > 0 && (
                    <div className="flex items-center justify-between text-xs text-[#116A4B]">
                      <span>You save</span>
                      <span className="font-medium">−₹{savings.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-[#655B53]">
                    <span>Express delivery</span>
                    <span className={isFreeShippingUnlocked ? "font-medium text-[#116A4B]" : ""}>
                      {isFreeShippingUnlocked ? "Free" : "Calculated at checkout"}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-stone-100">
                    <div>
                      <span className="text-sm font-semibold text-[#1B1714]">Subtotal</span>
                      <span className="block text-[11px] text-[#8C8177]">
                        Inclusive of all taxes
                      </span>
                    </div>
                    <span className="text-xl font-semibold text-[#1B1714]">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {hasOutOfStockItems && (
                  <div
                    role="alert"
                    className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 font-medium"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Remove out-of-stock items before proceeding to checkout.</span>
                  </div>
                )}

                <div className="space-y-2.5">
                  <button
                    type="button"
                    disabled={hasOutOfStockItems || isNavigating}
                    onClick={handleProceedToCheckout}
                    className="w-full min-h-[50px] px-5 rounded-xl bg-[#6E1625] hover:bg-[#54101C] text-white text-sm font-medium shadow-sm transition-transform duration-150 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
                  >
                    {showNavSpinner ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Opening checkout…</span>
                      </>
                    ) : hasOutOfStockItems ? (
                      <span>Remove out-of-stock items</span>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 opacity-90 shrink-0" />
                        <span>Proceed to checkout</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={closeCart}
                    disabled={isNavigating}
                    className="w-full min-h-[46px] px-5 rounded-xl bg-[#FBF8F3] hover:bg-[#F3EDE5] border border-stone-200/90 text-[#1B1714] text-sm font-medium transition-colors active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#655B53]" />
                    <span>Continue shopping</span>
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
