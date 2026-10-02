"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function CartDrawer() {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[#6C5CE7]" />
                <h2 className="font-display font-bold text-lg text-[#2D3436]">
                  Your Cart
                </h2>
                <span className="text-xs font-mono bg-[#6C5CE7]/10 text-[#6C5CE7] px-2 py-0.5 rounded-full">
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
              <div className="px-5 py-3 bg-gradient-to-r from-[#6C5CE7]/5 to-[#A29BFE]/5 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <Truck className="w-4 h-4 text-[#6C5CE7]" />
                  <span className="text-xs font-medium text-[#636E72]">
                    {freeShippingRemaining > 0
                      ? `Add ₹${freeShippingRemaining.toLocaleString()} more for free shipping`
                      : "🎉 You've unlocked free shipping!"}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${shippingProgress}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-[#6C5CE7]/8 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-[#A29BFE]" />
                  </div>
                  <p className="text-base font-semibold text-[#2D3436] mb-1">Your cart is empty</p>
                  <p className="text-sm text-[#636E72] mb-6">Discover something you'll love</p>
                  <button
                    onClick={closeCart}
                    className="px-6 py-2.5 bg-[#6C5CE7] text-white font-semibold text-sm rounded-xl hover:bg-[#4834D4] transition-colors"
                  >
                    Start Shopping
                  </button>
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
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-white flex-shrink-0">
                        <Image
                          src={item.poster_image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#2D3436] truncate">{item.name}</p>
                        <p className="text-xs text-[#636E72] mt-0.5">{item.category}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm font-bold text-[#6C5CE7]">
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
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-800 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm"
                  >
                    View Shopping Bag
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#FA521C] text-white font-semibold rounded-xl hover:bg-[#E0400B] transition-colors shadow-lg shadow-[#FA521C]/25 text-sm"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </Link>
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
