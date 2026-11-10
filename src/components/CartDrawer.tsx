"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Truck, AlertCircle, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { launchFastrrCheckout } from "@/lib/fastrrClient";

export function CartDrawer() {
  const router = useRouter();
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

  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  // Freeze background scroll when Cart Drawer is open
  React.useEffect(() => {
    if (isOpen) {
      const origBody = document.body.style.overflow;
      const origHtml = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
      return () => {
        document.body.style.overflow = origBody;
        document.documentElement.style.overflow = origHtml;
        document.body.classList.remove("modal-open");
        document.documentElement.classList.remove("modal-open");
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 overflow-hidden"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            data-lenis-prevent
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col min-h-0 overflow-hidden font-mograph"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
                  <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h2 className="font-bold text-lg text-slate-900">
                  Your Cart
                </h2>
                <span className="text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            {cart.length > 0 && (
              <div className="px-5 py-3.5 bg-emerald-50/70 border-b border-emerald-100/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                    <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                    {freeShippingRemaining > 0
                      ? `Add ₹${freeShippingRemaining.toLocaleString("en-IN")} more for free express shipping`
                      : "🎉 You've unlocked free express shipping!"}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700">
                    {Math.round(shippingProgress)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-emerald-100/80 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${shippingProgress}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div
              data-lenis-prevent
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                    <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                  </div>
                  <p className="text-base font-bold text-slate-900 mb-1">Your cart is empty</p>
                  <p className="text-xs text-slate-500 max-w-xs mb-5">
                    Browse our top gadgets, headphones, and flagship electronics.
                  </p>
                  <Link
                    href="/#shop"
                    onClick={closeCart}
                    className="inline-flex items-center justify-center px-6 py-2.5 bg-[#FFBE00] hover:bg-[#E5AA00] text-slate-950 font-bold text-sm rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => {
                    const isOutOfStock =
                      outOfStockItemIds.includes(item.id) ||
                      outOfStockItemIds.includes(item.id?.toLowerCase());

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className={`flex gap-3.5 p-3.5 rounded-2xl border transition-all ${
                          isOutOfStock
                            ? "bg-red-50/70 border-red-200 ring-1 ring-red-300"
                            : "bg-slate-50/70 border-slate-200/80 hover:bg-slate-50"
                        }`}
                      >
                        <Link
                          href={`/products/${item.id}`}
                          onClick={closeCart}
                          className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-slate-100 flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity relative"
                        >
                          <Image
                            src={item.poster_image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className={`w-full h-full object-contain p-1.5 ${isOutOfStock ? "grayscale opacity-75" : ""}`}
                          />
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center p-1 text-center">
                              <span className="text-[9px] font-bold tracking-wider uppercase text-white bg-red-600 px-1.5 py-0.5 rounded shadow">
                                Sold Out
                              </span>
                            </div>
                          )}
                        </Link>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <Link
                              href={`/products/${item.id}`}
                              onClick={closeCart}
                              className="hover:text-blue-600 transition-colors block"
                            >
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {item.name}
                              </p>
                            </Link>
                            <p className="text-xs text-slate-500 mt-0.5">{item.category || "Electronics"}</p>
                            {isOutOfStock ? (
                              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200">
                                ⚠️ Out of Stock
                              </span>
                            ) : item.offer_label ? (
                              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                ✨ {item.offer_label}
                              </span>
                            ) : null}
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm font-bold text-slate-900">
                                ₹{item.price.toLocaleString("en-IN")}
                              </span>
                              {item.mrp && item.mrp > item.price ? (
                                <span className="text-[11px] text-slate-400 line-through">
                                  ₹{item.mrp.toLocaleString("en-IN")}
                                </span>
                              ) : null}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Quantity Controls */}
                              <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-xs">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-1 hover:bg-slate-100 rounded-l-lg transition-colors text-slate-600"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-2.5 text-xs font-bold text-slate-900">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 hover:bg-slate-100 rounded-r-lg transition-colors text-slate-600"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-white space-y-3">
                {savings > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">You&apos;re saving</span>
                    <span className="font-bold text-emerald-600">₹{savings.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600">Subtotal</span>
                  <span className="text-xl font-bold text-slate-900">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                {hasOutOfStockItems && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-semibold">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Please remove out-of-stock items before checkout.</span>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <button
                    disabled={hasOutOfStockItems}
                    onClick={async () => {
                      if (hasOutOfStockItems) return;
                      closeCart();
                      const launched = await launchFastrrCheckout(cart);
                      if (!launched) {
                        if (!user) {
                          openAuthModal("login", "Sign in required: Please log in or create an account to proceed to checkout 🔒", "/checkout");
                          return;
                        }
                        router.push("/checkout");
                      }
                    }}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold font-movault text-base tracking-wider uppercase transition-all ${
                      hasOutOfStockItems
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed opacity-80"
                        : "bg-[#D4AF37] hover:bg-[#C8A261] text-black shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer"
                    }`}
                  >
                    {hasOutOfStockItems ? "⚠️ Remove Out of Stock Items" : "Proceed to Checkout"}
                    {!hasOutOfStockItems && <ArrowRight className="w-4 h-4 stroke-[2.5]" />}
                  </button>
                </div>
                <button
                  onClick={closeCart}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-900 font-medium py-1 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
