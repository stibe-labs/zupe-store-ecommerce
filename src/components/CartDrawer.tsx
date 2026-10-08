"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export function CartDrawer() {
  const router = useRouter();
  const { user } = useAuth();
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
            className="fixed inset-0 bg-black/40 z-50 overflow-hidden"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            data-lenis-prevent
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col min-h-0 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[#FA521C]" />
                <h2 className="font-display font-bold text-lg text-[#2D3436]">
                  Your Cart
                </h2>
                <span className="text-xs font-mono bg-[#FA521C]/10 text-[#FA521C] px-2 py-0.5 rounded-full">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-[#636E72]" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            {cart.length > 0 && (
              <div className="px-5 py-3 bg-gradient-to-r from-[#FA521C]/5 to-[#FF7A45]/5 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <Truck className="w-4 h-4 text-[#FA521C]" />
                  <span className="text-xs font-medium text-[#636E72]">
                    {freeShippingRemaining > 0
                      ? `Add ₹${freeShippingRemaining.toLocaleString()} more for free shipping`
                      : "🎉 You've unlocked free shipping!"}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#FA521C] to-[#FF7A45] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${shippingProgress}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div data-lenis-prevent className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5" style={{ WebkitOverflowScrolling: "touch" }}>
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-[#FA521C]/10 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-[#FA521C]" />
                  </div>
                  <p className="text-base font-semibold text-[#2D3436] mb-1">Your cart is empty</p>
                  <Link
                    href="/products"
                    onClick={closeCart}
                    className="inline-flex items-center justify-center px-6 py-2.5 bg-[#FA521C] text-white font-semibold text-sm rounded-xl hover:bg-[#E0400B] transition-colors shadow-sm shadow-[#FA521C]/20 cursor-pointer"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="flex gap-4 p-3 rounded-2xl bg-gray-50/80 border border-gray-100"
                    >
                      <Link
                        href={`/products/${item.id}`}
                        onClick={closeCart}
                        className="w-20 h-20 rounded-xl overflow-hidden bg-white flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                      >
                        <Image
                          src={item.poster_image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.id}`}
                          onClick={closeCart}
                          className="hover:text-[#FA521C] transition-colors"
                        >
                          <p className="text-sm font-semibold text-[#2D3436] truncate hover:text-[#FA521C]">
                            {item.name}
                          </p>
                        </Link>
                        <p className="text-xs text-[#636E72] mt-0.5">{item.category}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm font-bold text-[#FA521C]">
                            ₹{item.price.toLocaleString()}
                          </span>
                          {item.mrp && item.mrp > item.price && (
                            <span className="text-xs text-[#B2BEC3] line-through">
                              ₹{item.mrp.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 hover:bg-gray-50 rounded-l-lg transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5 text-[#636E72]" />
                            </button>
                            <span className="px-3 text-sm font-semibold text-[#2D3436]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 hover:bg-gray-50 rounded-r-lg transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5 text-[#636E72]" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-[#FF6B6B]" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-gray-100 space-y-3">
                {savings > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#636E72]">You're saving</span>
                    <span className="font-semibold text-green-600">₹{savings.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-[#2D3436]">Subtotal</span>
                  <span className="text-xl font-bold text-[#2D3436]">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      closeCart();
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
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FA521C] text-white font-semibold rounded-xl hover:bg-[#E0400B] transition-colors shadow-lg shadow-[#FA521C]/25 text-sm"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={closeCart}
                  className="w-full text-center text-xs text-[#636E72] hover:text-[#FA521C] transition-colors py-2"
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
