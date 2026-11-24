"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ExternalLink, Lock, ShieldCheck, X, AlertCircle, Loader2 } from "lucide-react";

export interface PaymentPopupOrder {
  orderId: string;
  pydartOrderId?: string;
  payUrl: string;
  amount: number;
  isCod: boolean;
  balanceDue: number;
}

interface PaymentPopupModalProps {
  paymentOrder: PaymentPopupOrder | null;
  onPaymentConfirmed: (orderId: string) => void;
  onDismissUnpaid: (orderId: string, reason?: string) => void;
  onSwitchToCod?: (orderId: string) => void;
}

const MODAL_EASE = [0.32, 0.72, 0, 1] as const;

export function PaymentPopupModal({
  paymentOrder,
  onPaymentConfirmed,
  onDismissUnpaid,
  onSwitchToCod,
}: PaymentPopupModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [checkingOnClose, setCheckingOnClose] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const confirmedRef = useRef(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const { embedUrl, expectedOrigin } = useMemo(() => {
    if (!paymentOrder?.payUrl) return { embedUrl: "", expectedOrigin: "" };
    try {
      const parsed = new URL(paymentOrder.payUrl);
      parsed.searchParams.set("embed", "1");
      if (typeof window !== "undefined") {
        parsed.searchParams.set("parentOrigin", window.location.origin);
      }
      return {
        embedUrl: parsed.toString(),
        expectedOrigin: parsed.origin,
      };
    } catch {
      return { embedUrl: paymentOrder.payUrl, expectedOrigin: "" };
    }
  }, [paymentOrder?.payUrl]);

  // Reset modal state when a new payment order opens
  useEffect(() => {
    if (!paymentOrder) return;
    confirmedRef.current = false;
    setIframeLoaded(false);
    setCheckingOnClose(false);
    setInlineError(null);
  }, [paymentOrder?.orderId]);

  // Lock background scroll while popup is open
  useEffect(() => {
    if (!paymentOrder || typeof document === "undefined") return;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const timer = setTimeout(() => closeButtonRef.current?.focus(), 60);
    return () => {
      clearTimeout(timer);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [paymentOrder]);

  const triggerConfirmedOnce = useCallback(
    (orderId: string) => {
      if (confirmedRef.current) return;
      confirmedRef.current = true;
      onPaymentConfirmed(orderId);
    },
    [onPaymentConfirmed]
  );

  // Authoritative server status probe (used by polling, focus, and safe close)
  const checkServerPaymentStatus = useCallback(async (orderId: string): Promise<boolean> => {
    try {
      const res = await fetch(
        `/api/cashfree/verify-payment?orderId=${encodeURIComponent(orderId)}`,
        { cache: "no-store" }
      );
      if (!res.ok) return false;
      const data = await res.json();
      return Boolean(
        data?.success &&
          (data?.paid || data?.status === "PAID" || data?.status === "SUCCESS")
      );
    } catch {
      return false;
    }
  }, []);

  const handleRequestClose = useCallback(async () => {
    if (!paymentOrder || checkingOnClose || confirmedRef.current) return;
    setCheckingOnClose(true);
    const alreadyPaid = await checkServerPaymentStatus(paymentOrder.orderId);
    setCheckingOnClose(false);
    if (alreadyPaid) {
      triggerConfirmedOnce(paymentOrder.orderId);
      return;
    }
    onDismissUnpaid(paymentOrder.orderId, "Customer closed payment popup");
  }, [
    paymentOrder,
    checkingOnClose,
    checkServerPaymentStatus,
    triggerConfirmedOnce,
    onDismissUnpaid,
  ]);

  // Keyboard Escape dismissal
  useEffect(() => {
    if (!paymentOrder) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleRequestClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paymentOrder, handleRequestClose]);

  // Strict origin-pinned postMessage bridge from PyDart Pay embed
  useEffect(() => {
    if (!paymentOrder || !expectedOrigin) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== expectedOrigin) return;
      const msg = event.data;
      if (!msg || typeof msg !== "object") return;

      if (msg.type === "PYDART_PAYMENT_SUCCESS") {
        setInlineError(null);
        triggerConfirmedOnce(paymentOrder.orderId);
      } else if (msg.type === "PYDART_PAYMENT_FAILED") {
        const reason =
          typeof msg.payload?.reason === "string" && msg.payload.reason.trim()
            ? msg.payload.reason.trim()
            : "Payment was declined. You can try another UPI app or card above.";
        setInlineError(reason);
      } else if (msg.type === "PYDART_CHECKOUT_DISMISS") {
        handleRequestClose();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [paymentOrder, expectedOrigin, triggerConfirmedOnce, handleRequestClose]);

  // Background polling + visibility/focus reconciliation (critical for mobile UPI app switching)
  useEffect(() => {
    if (!paymentOrder) return;
    const targetId = paymentOrder.orderId;
    let active = true;

    const pollOnce = async () => {
      if (!active || confirmedRef.current) return;
      const paid = await checkServerPaymentStatus(targetId);
      if (active && paid) {
        triggerConfirmedOnce(targetId);
      }
    };

    const intervalId = window.setInterval(pollOnce, 2500);
    const onFocusOrVisible = () => {
      if (document.visibilityState === "visible") {
        pollOnce();
      }
    };

    window.addEventListener("focus", onFocusOrVisible);
    document.addEventListener("visibilitychange", onFocusOrVisible);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocusOrVisible);
      document.removeEventListener("visibilitychange", onFocusOrVisible);
    };
  }, [paymentOrder, checkServerPaymentStatus, triggerConfirmedOnce]);

  return (
    <AnimatePresence>
      {paymentOrder && (
        <motion.div
          key="pydart-payment-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Turkiye Jam Secure Payment"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: MODAL_EASE }}
          onClick={handleRequestClose}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#120E0C]/65 backdrop-blur-[4px] p-0 sm:p-4"
        >
          <motion.div
            key="pydart-payment-sheet"
            initial={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 0, scale: 0.96, y: 18 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.97, y: 12 }
            }
            transition={{
              duration: prefersReducedMotion ? 0 : 0.24,
              ease: MODAL_EASE,
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col w-full sm:max-w-[460px] h-[92dvh] sm:h-[min(760px,90dvh)] bg-white rounded-t-3xl sm:rounded-2xl shadow-[0_24px_70px_-20px_rgba(18,14,12,0.45)] border border-black/10 overflow-hidden"
          >
            {/* Compact Payment Popup Header Chrome */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-stone-200/80 bg-[#FBF8F3] shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src="/apple-touch-icon.png"
                  alt="Turkiye Jam"
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-lg object-cover border border-stone-200/90 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1B1714]">
                    <Lock className="w-3.5 h-3.5 text-[#116A4B] shrink-0" />
                    <span className="truncate">
                      {paymentOrder.isCod ? "COD Advance Payment" : "Secure Payment"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#655B53] tabular-nums">
                    Paying <strong className="font-semibold text-[#1B1714]">₹{paymentOrder.amount.toLocaleString("en-IN")}</strong>
                    {paymentOrder.isCod && paymentOrder.balanceDue > 0
                      ? ` · ₹${paymentOrder.balanceDue.toLocaleString("en-IN")} due on delivery`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={paymentOrder.payUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open payment screen in a new tab"
                  className="inline-flex items-center gap-1 px-2.5 min-h-[36px] rounded-lg text-[11px] font-medium text-[#655B53] hover:text-[#1B1714] hover:bg-stone-200/60 transition-colors"
                >
                  <span className="hidden xs:inline sm:inline">Full page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={handleRequestClose}
                  disabled={checkingOnClose}
                  aria-label="Close payment popup"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#655B53] hover:text-[#1B1714] hover:bg-stone-200/70 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {checkingOnClose ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Inline Payment Failure Notice (non-blocking — lets user retry another rail) */}
            {inlineError && (
              <div className="px-4 py-2.5 bg-rose-50 border-b border-rose-200 flex items-center justify-between gap-2 text-xs text-rose-900 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="truncate">{inlineError}</span>
                </div>
                {!paymentOrder.isCod && onSwitchToCod && (
                  <button
                    type="button"
                    onClick={() => onSwitchToCod(paymentOrder.orderId)}
                    className="text-xs font-semibold text-[#6E1625] hover:underline shrink-0 cursor-pointer"
                  >
                    Switch to COD
                  </button>
                )}
              </div>
            )}

            {/* Embedded PyDart Pay Checkout Terminal */}
            <div className="relative flex-1 bg-[#F7F8FA] overflow-hidden">
              {!iframeLoaded && (
                <div className="absolute inset-0 z-10 bg-white p-5 space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-stone-100 animate-pulse" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-28 rounded bg-stone-100 animate-pulse" />
                        <div className="h-2.5 w-40 rounded bg-stone-100 animate-pulse" />
                      </div>
                    </div>
                    <div className="h-6 w-20 rounded bg-stone-100 animate-pulse" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-10 rounded-xl bg-stone-100 animate-pulse" />
                    <div className="h-10 rounded-xl bg-stone-100 animate-pulse" />
                    <div className="h-10 rounded-xl bg-stone-100 animate-pulse" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-12 rounded-xl bg-stone-100 animate-pulse" />
                    <div className="h-12 rounded-xl bg-stone-100 animate-pulse" />
                    <div className="h-12 rounded-xl bg-stone-100 animate-pulse" />
                    <div className="h-12 rounded-xl bg-stone-100 animate-pulse" />
                  </div>
                  <div className="mx-auto w-44 h-44 rounded-2xl bg-stone-100 animate-pulse" />
                  <p className="text-center text-xs text-[#655B53]">
                    Loading UPI apps, QR code, and card options…
                  </p>
                </div>
              )}

              <iframe
                src={embedUrl}
                title="PyDart Pay Secure Checkout"
                allow="payment *"
                onLoad={() => setIframeLoaded(true)}
                className="w-full h-full border-0 block"
              />
            </div>

            {/* Subtle Safe-Area Footer */}
            <div className="px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] bg-white border-t border-stone-100 flex items-center justify-between text-[11px] text-[#655B53] shrink-0">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#116A4B]" />
                <span>Verified by PyDart Pay</span>
              </span>
              <button
                type="button"
                onClick={handleRequestClose}
                disabled={checkingOnClose}
                className="font-medium text-[#655B53] hover:text-[#1B1714] cursor-pointer"
              >
                {checkingOnClose ? "Checking status…" : "Cancel"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
