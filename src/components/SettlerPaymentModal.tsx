"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  QrCode,
  Smartphone,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  X,
  Sparkles,
  ExternalLink,
  Lock,
} from "lucide-react";

interface SettlerPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  cashfreeOrderId: string;
  amount: number;
  qrDataUrl: string;
  upiString: string;
  payUrl: string;
  customerName: string;
  customerPhone: string;
  onPaymentSuccess: (data: { paymentId: string; receiptNumber?: string }) => void;
}

export default function SettlerPaymentModal({
  isOpen,
  onClose,
  invoiceId,
  cashfreeOrderId,
  amount,
  qrDataUrl,
  upiString,
  payUrl,
  customerName,
  customerPhone,
  onPaymentSuccess,
}: SettlerPaymentModalProps) {
  const [activeTab, setActiveTab] = useState<"upi" | "gateway">("upi");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const hasTriggeredSuccess = useRef(false);

  // 1. Polling Verification for UPI QR payments
  useEffect(() => {
    if (!isOpen || !cashfreeOrderId || isSuccess) return;

    const interval = setInterval(async () => {
      if (hasTriggeredSuccess.current) return;
      try {
        setIsVerifying(true);
        const res = await fetch("/api/settler/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cashfreeOrderId,
            invoiceId,
          }),
        });

        const data = await res.json();
        if (data.success && data.paid && !hasTriggeredSuccess.current) {
          hasTriggeredSuccess.current = true;
          setIsSuccess(true);
          setTimeout(() => {
            onPaymentSuccess({
              paymentId: data.paymentId || data.bankReference || "settler_verified",
              receiptNumber: data.receiptNumber,
            });
          }, 1200);
        }
      } catch (err) {
        console.warn("Settler status poll warning:", err);
      } finally {
        setIsVerifying(false);
      }
    }, 2800);

    return () => clearInterval(interval);
  }, [isOpen, cashfreeOrderId, invoiceId, isSuccess, onPaymentSuccess]);

  // 2. PostMessage Listener for Embedded Hosted Gateway
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "SETTLER_PAYMENT_SUCCESS") {
        if (!hasTriggeredSuccess.current) {
          hasTriggeredSuccess.current = true;
          setIsSuccess(true);
          setTimeout(() => {
            onPaymentSuccess({
              paymentId: event.data.bankReference || event.data.receiptNumber || "settler_verified",
              receiptNumber: event.data.receiptNumber,
            });
          }, 1200);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isOpen, onPaymentSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-400">
              {amount === 1 ? "COD Advance Verification (₹1)" : "Instant Bank Settlement"}
            </span>
          </div>

          <div className="flex items-baseline justify-between pr-8">
            <div>
              <p className="text-xs text-stone-300 font-medium">
                {amount === 1 ? "Pay Advance Now" : "Total Payable"}
              </p>
              <p className="text-3xl font-extrabold text-white tracking-tight">
                ₹{Number(amount).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] bg-white/15 px-2.5 py-1 rounded-full text-emerald-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-50/80 p-1.5 gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("upi")}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === "upi"
                ? "bg-white text-stone-900 shadow-sm border border-stone-200"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <QrCode className="w-4 h-4 text-[#6B9E3A]" />
            <span>Dynamic UPI QR (Fast)</span>
          </button>

          <button
            onClick={() => setActiveTab("gateway")}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === "gateway"
                ? "bg-white text-stone-900 shadow-sm border border-stone-200"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <CreditCard className="w-4 h-4 text-stone-600" />
            <span>Cards & NetBanking</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-stone-900">
                Payment Verified!
              </h3>
              <p className="text-sm text-stone-600 max-w-xs">
                {amount === 1
                  ? "Your ₹1 advance verification is confirmed! Finalizing your Cash on Delivery order..."
                  : `Your payment of ₹${Number(amount).toLocaleString("en-IN")} has been confirmed. Finalizing your order...`}
              </p>
            </div>
          ) : activeTab === "upi" ? (
            <div className="space-y-4 text-center">
              {/* Dynamic QR Code Card */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/90 flex flex-col items-center justify-center">
                {qrDataUrl ? (
                  <div className="p-2 bg-white rounded-2xl shadow-md border border-stone-200 inline-block">
                    <img
                      src={qrDataUrl}
                      alt="UPI Payment QR Code"
                      className="w-52 h-52 object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center bg-stone-200 rounded-2xl animate-pulse">
                    <QrCode className="w-10 h-10 text-stone-400" />
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-stone-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Scan with GPay, PhonePe, Paytm, or BHIM</span>
                </div>

                <p className="text-[11px] text-stone-500 mt-1">
                  {amount === 1
                    ? "Pay ₹1 to confirm order • Balance payable in cash/UPI at doorstep"
                    : "Zero surcharge • Instant automated verification"}
                </p>
              </div>

              {/* 1-Tap Mobile App Links */}
              <div className="space-y-2 pt-1 text-left">
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider px-1">
                  Or Tap to Pay via UPI App (Mobile):
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={upiString}
                    className="py-2.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
                    <span>Google Pay</span>
                  </a>
                  <a
                    href={upiString}
                    className="py-2.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#5f259f]" />
                    <span>PhonePe</span>
                  </a>
                  <a
                    href={upiString}
                    className="py-2.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#00b9f5]" />
                    <span>Paytm</span>
                  </a>
                  <a
                    href={upiString}
                    className="py-2.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-stone-600" />
                    <span>Other UPI App</span>
                  </a>
                </div>
              </div>

              {/* Live Bank Verification Status */}
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-emerald-600 ${
                      isVerifying ? "animate-spin" : ""
                    }`}
                  />
                  <span className="font-medium">
                    {isVerifying
                      ? "Verifying payment with bank..."
                      : "Awaiting your payment confirmation..."}
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-200/60 font-bold px-2 py-0.5 rounded-full text-emerald-900">
                  Live
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-stone-200 shadow-inner bg-stone-100">
              <iframe
                src={payUrl}
                title="Settler Hosted Checkout"
                className="w-full h-full border-none"
                allow="payment"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-200 p-3 px-5 flex items-center justify-between text-[11px] text-stone-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-stone-400" />
            <span>Powered by Settler & Cashfree</span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-600 hover:text-stone-900 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
