"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ExternalLink, Lock, ShieldCheck, X, Loader2 } from "lucide-react";
import { extractPyDartOrderIdFromUrl } from "@/lib/cardUtils";
import { PyDartNativeCheckout } from "@/components/checkout/PyDartNativeCheckout";

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
  const [checkingOnClose, setCheckingOnClose] = useState(false);
  const confirmedRef = useRef(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Ref-stabilize parent callbacks so parent re-renders never cause polling/focus resets or child reloads
  const onPaymentConfirmedRef = useRef(onPaymentConfirmed);
  onPaymentConfirmedRef.current = onPaymentConfirmed;
  const onDismissUnpaidRef = useRef(onDismissUnpaid);
  onDismissUnpaidRef.current = onDismissUnpaid;
  const onSwitchToCodRef = useRef(onSwitchToCod);
  onSwitchToCodRef.current = onSwitchToCod;

  const activeOrderId = paymentOrder?.orderId ?? "";
  const activeIsCod = Boolean(paymentOrder?.isCod);

  const resolvedPyDartOrderId = useMemo(() => {
    if (!paymentOrder) return "";
    return (
      paymentOrder.pydartOrderId?.trim() ||
      extractPyDartOrderIdFromUrl(paymentOrder.payUrl)
    );
  }, [paymentOrder?.pydartOrderId, paymentOrder?.payUrl]);

  const fullPageUrl = useMemo(() => {
    if (resolvedPyDartOrderId) {
      return `/pay/${encodeURIComponent(resolvedPyDartOrderId)}`;
    }
    return paymentOrder?.payUrl || "";
  }, [resolvedPyDartOrderId, paymentOrder?.payUrl]);

  // Reset modal state strictly once per newly opened orderId
  useEffect(() => {
    if (!activeOrderId) return;
    confirmedRef.current = false;
    setCheckingOnClose(false);
  }, [activeOrderId]);

  // Lock background scroll & set initial modal focus once per orderId (never steal focus while typing!)
  useEffect(() => {
    if (!activeOrderId || typeof document === "undefined") return;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const timer = setTimeout(() => closeButtonRef.current?.focus(), 60);
    return () => {
      clearTimeout(timer);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [activeOrderId]);

  const triggerConfirmedOnce = useCallback((orderId: string) => {
    if (confirmedRef.current) return;
    confirmedRef.current = true;
    onPaymentConfirmedRef.current(orderId);
  }, []);

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
    if (!activeOrderId || checkingOnClose || confirmedRef.current) return;
    setCheckingOnClose(true);
    const alreadyPaid = await checkServerPaymentStatus(activeOrderId);
    setCheckingOnClose(false);
    if (alreadyPaid) {
      triggerConfirmedOnce(activeOrderId);
      return;
    }
    onDismissUnpaidRef.current(activeOrderId, "Customer closed payment popup");
  }, [activeOrderId, checkingOnClose, checkServerPaymentStatus, triggerConfirmedOnce]);

  useEffect(() => {
    if (!activeOrderId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        void handleRequestClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeOrderId, handleRequestClose]);

  useEffect(() => {
    if (!activeOrderId) return;
    let active = true;

    const pollOnce = async () => {
      if (!active || confirmedRef.current) return;
      const paid = await checkServerPaymentStatus(activeOrderId);
      if (active && paid) {
        triggerConfirmedOnce(activeOrderId);
      }
    };

    const intervalId = window.setInterval(pollOnce, 2500);
    const onFocusOrVisible = () => {
      if (document.visibilityState === "visible") {
        void pollOnce();
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
  }, [activeOrderId, checkServerPaymentStatus, triggerConfirmedOnce]);

  const handleNativePaid = useCallback(() => {
    if (!activeOrderId) return;
    void (async () => {
      await checkServerPaymentStatus(activeOrderId);
      triggerConfirmedOnce(activeOrderId);
    })();
  }, [activeOrderId, checkServerPaymentStatus, triggerConfirmedOnce]);

  const handleSwitchCod = useCallback(() => {
    if (!activeOrderId || activeIsCod) return;
    onSwitchToCodRef.current?.(activeOrderId);
  }, [activeOrderId, activeIsCod]);

  return (
    <AnimatePresence>
      {paymentOrder && (
        <motion.div
          key="pydart-payment-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Turkiye Jam Secure Payment"
          data-lenis-prevent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: MODAL_EASE }}
          onClick={() => void handleRequestClose()}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#120E0C]/65 backdrop-blur-[4px] p-0 sm:p-4"
        >
          <motion.div
            key="pydart-payment-sheet"
            data-lenis-prevent
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
              duration: prefersReducedMotion ? 0 : 0.22,
              ease: MODAL_EASE,
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col w-full sm:max-w-[460px] max-h-[92dvh] sm:max-h-[min(780px,90dvh)] bg-white rounded-t-3xl sm:rounded-2xl shadow-[0_24px_70px_-20px_rgba(18,14,12,0.45)] border border-black/10 overflow-hidden"
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
                    Paying{" "}
                    <strong className="font-semibold text-[#1B1714]">
                      ₹{paymentOrder.amount.toLocaleString("en-IN")}
                    </strong>
                    {paymentOrder.isCod && paymentOrder.balanceDue > 0
                      ? ` · ₹${paymentOrder.balanceDue.toLocaleString("en-IN")} due on delivery`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {fullPageUrl && (
                  <a
                    href={fullPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open payment screen in a new tab"
                    className="inline-flex items-center gap-1 px-2.5 min-h-[36px] rounded-lg text-[11px] font-medium text-[#655B53] hover:text-[#1B1714] hover:bg-stone-200/60 transition-colors"
                  >
                    <span className="hidden xs:inline sm:inline">Full page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => void handleRequestClose()}
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

            {/* First-Party Native PyDart Pay Checkout (scroll-isolated via data-lenis-prevent) */}
            <div data-lenis-prevent className="flex-1 overflow-y-auto bg-white">
              {resolvedPyDartOrderId ? (
                <PyDartNativeCheckout
                  pydartOrderId={resolvedPyDartOrderId}
                  variant="modal"
                  onPaid={handleNativePaid}
                  onSwitchToCod={!paymentOrder.isCod && onSwitchToCod ? handleSwitchCod : undefined}
                />
              ) : (
                <div className="p-6 text-center text-xs text-[#655B53]">
                  Payment session could not be initialized. Please close and try again.
                </div>
              )}
            </div>

            {/* Subtle Safe-Area Footer */}
            <div className="px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] bg-white border-t border-stone-100 flex items-center justify-between text-[11px] text-[#655B53] shrink-0">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#116A4B]" />
                <span>Powered by PyDart Pay</span>
              </span>
              <button
                type="button"
                onClick={() => void handleRequestClose()}
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
