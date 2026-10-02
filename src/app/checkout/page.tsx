"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronRight,
  Loader2,
  PackageCheck,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart, freeShippingThreshold } = useCart();
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "cod">("card");

  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");

  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const grandTotal = subtotal + shippingFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !address || !city || !postalCode) {
      setErrorMessage("Please complete all shipping address fields.");
      return;
    }
    setErrorMessage("");
    setLoading(true);

    try {
      const orderPayload = {
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        shipping_address: address,
        city: `${city}, ${state}`,
        postal_code: postalCode,
        total_amount: grandTotal,
        payment_method:
          paymentMethod === "card"
            ? "Credit / Debit Card"
            : paymentMethod === "upi"
            ? "UPI Instant Payment"
            : "Cash on Delivery",
        user_id: user?.id,
        items: cart.map((c) => ({
          product_id: c.id,
          name: c.name,
          price: c.price,
          quantity: c.quantity,
          image: c.poster_image,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success && data.order) {
        setConfirmedOrderId(data.order.id);
        setOrderComplete(true);
        clearCart();
      } else {
        setErrorMessage(data.error || "Failed to process order. Please try again.");
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage("Network error occurred while submitting your order.");
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-lg mx-auto py-32 px-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Thank you for shopping with Zupe Store. Your order ID is{" "}
            <strong className="text-gray-900 font-mono">{confirmedOrderId}</strong>. A confirmation email has been dispatched to {email}.
          </p>

          <div className="p-4 rounded-2xl bg-white border border-gray-100 mb-8 text-left space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Estimated Delivery:</span>
              <span className="font-semibold text-gray-900">3 - 5 Business Days</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Address:</span>
              <span className="font-semibold text-gray-900">{address}, {city}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Paid:</span>
              <span className="font-bold text-[#6C5CE7] text-sm">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/orders"
              className="flex-1 py-3 px-6 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-black transition-colors"
            >
              View Order History
            </Link>
            <Link
              href="/"
              className="flex-1 py-3 px-6 rounded-xl bg-[#6C5CE7] text-white font-semibold text-sm hover:bg-[#5848d2] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto py-32 px-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center text-[#6C5CE7]">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">No Items in Cart</h2>
          <p className="text-sm text-gray-500 mb-6">Your shopping cart is empty. Add products to continue to checkout.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#6C5CE7] text-white font-semibold text-sm shadow-md"
          >
            Browse Catalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#2D3436]">
      <Navbar />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-28 pb-16">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Link href="/cart" className="hover:text-[#6C5CE7]">Bag</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-900">Checkout</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Secure Checkout
          </h1>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Shipping and Payment Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Shipping Address */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7] flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="font-display font-bold text-lg text-gray-900">
                  Shipping Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Postal Code / PIN *
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="560001"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Flat / House No., Building, Street Area"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bengaluru"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Karnataka"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30"
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Method */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7] flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h2 className="font-display font-bold text-lg text-gray-900">
                  Payment Method
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === "card"
                      ? "border-[#6C5CE7] bg-[#6C5CE7]/5 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <CreditCard className={`w-5 h-5 mb-3 ${paymentMethod === "card" ? "text-[#6C5CE7]" : "text-gray-400"}`} />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Credit/Debit Card</span>
                    <span className="text-[10px] text-gray-500">Visa, Mastercard, RuPay</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === "upi"
                      ? "border-[#6C5CE7] bg-[#6C5CE7]/5 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <QrCode className={`w-5 h-5 mb-3 ${paymentMethod === "upi" ? "text-[#6C5CE7]" : "text-gray-400"}`} />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">UPI Instant</span>
                    <span className="text-[10px] text-gray-500">GPay, PhonePe, Paytm</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === "cod"
                      ? "border-[#6C5CE7] bg-[#6C5CE7]/5 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Truck className={`w-5 h-5 mb-3 ${paymentMethod === "cod" ? "text-[#6C5CE7]" : "text-gray-400"}`} />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Cash on Delivery</span>
                    <span className="text-[10px] text-gray-500">Pay when delivered</span>
                  </div>
                </button>
              </div>

              {paymentMethod === "card" && (
                <div className="p-4 rounded-2xl bg-gray-50 space-y-3">
                  <input
                    type="text"
                    placeholder="Card Number (4242 •••• •••• 4242)"
                    defaultValue="4242 4242 4242 4242"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="MM / YY"
                      defaultValue="12/28"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm"
                    />
                    <input
                      type="password"
                      placeholder="CVC"
                      defaultValue="123"
                      maxLength={4}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Summary Card */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6 sticky top-28">
              <h3 className="font-display font-bold text-lg text-gray-900">
                Order Review
              </h3>

              {/* Items preview */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      <Image src={item.poster_image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-gray-100" />

              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString()}</span>
                </div>
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
                  <span>Grand Total</span>
                  <span className="text-2xl font-display text-[#6C5CE7]">
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-[#6C5CE7] hover:bg-[#5848d2] text-white font-semibold text-sm shadow-xl shadow-[#6C5CE7]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{grandTotal.toLocaleString()}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>SSL 256-bit Bank Grade Security</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
