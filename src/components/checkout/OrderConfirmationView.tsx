"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Copy, Lock, Mail, Package, ShieldCheck, Truck } from "lucide-react";

interface OrderConfirmationViewProps {
  orderId: string;
  customerName: string;
  customerEmail: string;
  address: string;
  city: string;
  postalCode: string;
  isCod: boolean;
  displayTotal: number;
  advancePaid: number;
  balanceDue: number;
  items: any[];
  onContinueShopping: () => void;
}

const EASE_OUT = [0.32, 0.72, 0, 1] as const;

export function OrderConfirmationView({
  orderId,
  customerName,
  customerEmail,
  address,
  city,
  postalCode,
  isCod,
  displayTotal,
  advancePaid,
  balanceDue,
  items,
  onContinueShopping,
}: OrderConfirmationViewProps) {
  const prefersReducedMotion = useReducedMotion();
  const [copiedId, setCopiedId] = useState(false);

  const firstName = customerName?.trim().split(/\s+/)[0] || "";

  const handleCopyOrderId = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(orderId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="min-h-dvh bg-[#FBF8F3] text-[#1B1714] antialiased flex flex-col justify-between">
      {/* Minimal Header */}
      <header className="sticky top-0 z-30 bg-[#FBF8F3]/95 backdrop-blur-sm border-b border-stone-200/70">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/turkiye-jam-logo.svg"
              alt="Turkiye Jam"
              width={132}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#116A4B]">
            <Lock className="w-3.5 h-3.5" />
            <span>Order confirmed</span>
          </span>
        </div>
      </header>

      <main className="max-w-xl w-full mx-auto px-4 py-10 sm:py-14">
        {/* Composed Confirmation Header */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="text-center mb-8"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#116A4B] text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Check className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="font-tj-serif text-3xl sm:text-4xl font-bold text-[#1B1714] tracking-tight">
            {firstName ? `Thank you, ${firstName}` : "Order confirmed"}
          </h1>
          <p className="text-sm text-[#655B53] mt-2 max-w-md mx-auto leading-relaxed">
            {isCod
              ? `Your ₹${advancePaid.toLocaleString("en-IN")} advance is received. Keep ₹${balanceDue.toLocaleString("en-IN")} ready in cash or UPI when your parcel arrives.`
              : "Your payment is verified and your order is queued for priority discreet dispatch."}
          </p>

          {customerEmail.trim() && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#655B53]">
              <Mail className="w-3.5 h-3.5 text-[#6E1625]" />
              <span>Receipt sent to {customerEmail.trim()}</span>
            </p>
          )}
        </motion.div>

        {/* Receipt Card */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_1px_2px_rgba(27,23,20,0.04)] p-5 sm:p-7 space-y-5">
          {/* Order Number */}
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div>
              <span className="text-xs text-[#8C8177] block">Order number</span>
              <span className="font-mono text-sm font-semibold text-[#1B1714]">
                #{orderId}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyOrderId}
              className="min-h-[40px] px-3 rounded-xl bg-[#FBF8F3] hover:bg-[#F3EDE5] border border-stone-200/80 text-xs font-medium text-[#1B1714] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#116A4B]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#655B53]" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>

          {/* Key Order Details */}
          <div className="space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4">
              <span className="text-[#655B53]">Payment</span>
              <span className="font-medium text-[#1B1714] text-right">
                {isCod
                  ? `Cash on Delivery (₹${advancePaid.toLocaleString("en-IN")} advance paid)`
                  : "Paid online via PyDart Pay"}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-[#655B53]">Estimated delivery</span>
              <span className="font-medium text-[#116A4B] inline-flex items-center gap-1.5 text-right">
                <Truck className="w-4 h-4 shrink-0" />
                <span>{isCod ? "3–5 business days" : "2–4 business days"}</span>
              </span>
            </div>
            {(address || city) && (
              <div className="flex items-start justify-between gap-4">
                <span className="text-[#655B53] shrink-0">Delivery address</span>
                <span className="font-medium text-[#1B1714] text-right max-w-[260px] leading-relaxed">
                  {[address, city, postalCode].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
          </div>

          {/* Items */}
          {items.length > 0 && (
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <span className="text-xs font-medium text-[#8C8177] block">Items</span>
              {items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    {item.image || item.poster_image ? (
                      <div className="relative w-10 h-10 rounded-lg bg-[#F6F1EA] border border-stone-200/80 overflow-hidden shrink-0">
                        <Image
                          src={item.image || item.poster_image}
                          alt={item.name || "Turkiye Jam"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#F6F1EA] flex items-center justify-center text-[#8C8177] shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-[#1B1714] truncate">{item.name}</p>
                      <p className="text-xs text-[#8C8177]">Qty {item.quantity || 1}</p>
                    </div>
                  </div>
                  <span className="font-medium text-[#1B1714] tabular-nums shrink-0">
                    ₹{((Number(item.price || item.unit_price) || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Amount Summary */}
          <div className="pt-4 border-t border-stone-100 space-y-2 tabular-nums">
            {isCod ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#655B53]">Advance paid online</span>
                  <span className="font-medium text-[#116A4B]">
                    ₹{advancePaid.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-sm font-semibold text-[#1B1714]">
                    Due on delivery
                  </span>
                  <span className="text-xl font-semibold text-[#6E1625]">
                    ₹{balanceDue.toLocaleString("en-IN")}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-[#1B1714]">Total paid</span>
                <span className="text-xl font-semibold text-[#116A4B]">
                  ₹{displayTotal.toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>

          {/* Discreet Packaging Guarantee */}
          <div className="p-3.5 rounded-xl bg-[#FBF8F3] border border-stone-200/70 flex items-start gap-2.5 text-xs text-[#655B53]">
            <ShieldCheck className="w-4 h-4 text-[#6E1625] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="font-medium text-[#1B1714]">Discreet unbranded packaging:</strong>{" "}
              Shipped in a plain tamper-evident box with zero product description on the label.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            href={`/order-tracking?query=${encodeURIComponent(orderId)}`}
            className="flex-1 min-h-[48px] px-5 rounded-xl bg-[#6E1625] hover:bg-[#54101C] text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
          >
            <span>Track order</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={onContinueShopping}
            className="flex-1 min-h-[48px] px-5 rounded-xl bg-white hover:bg-[#F3EDE5] border border-stone-200 text-[#1B1714] text-sm font-medium inline-flex items-center justify-center transition-colors active:scale-[0.98] cursor-pointer"
          >
            Continue shopping
          </button>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-[#8C8177] border-t border-stone-200/60">
        © 2026 Turkiye Jam
      </footer>
    </div>
  );
}
