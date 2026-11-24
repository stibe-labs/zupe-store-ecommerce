"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ExternalLink, Lock, ShieldCheck, X, AlertCircle, Loader2 } from "lucide-react";
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
  const [inlineError, setInlineError] = useState<string | null>(null);
  const confirmedRef = useRef(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const resolvedPyDartOrderId = useMemo(() => {
    if (!paymentOrder) return "";
    return (
      paymentOrder.pydartOrderId?.trim() ||
      extractPyDartOrderIdFromUrl(paymentOrder.payUrl)
    );
  }, [paymentOrder]);

  const fullPageUrl = useMemo(() => {
    if (resolvedPyDartOrderId) {
      return `/pay/${encodeURIComponent(resolvedPyDartOrderId)}`;
    }
    return paymentOrder?.payUrl || "";
  }, [resolvedPyDartOrderId, paymentOrder?.payUrl]);

  useEffect(() => {
    if (!paymentOrder) return;
    confirmedRef.current = false;
    setCheckingOnClose(false);
    setInlineError(null);
  }, [paymentOrder?.orderId]);

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

  // Authoritative Turkiye Jam server status probe (confirms order + triggers WhatsApp confirmation)
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

  useEffect(() => {
    if (!paymentOrder) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        void handleRequestClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paymentOrder, handleRequestClose]);

  // Background polling + visibility/focus reconciliation
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
  }, [paymentOrder, checkServerPaymentStatus, triggerConfirmedOnce]);

  const handleNativePaid = useCallback(async () => {
    if (!paymentOrder) return;
    setInlineError(null);
    // Trigger server-side order verification immediately so D1 & WhatsApp receipt sync right away
    await checkServerPaymentStatus(paymentOrder.orderId);
    triggerConfirmedOnce(paymentOrder.orderId);
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
          onClick={() => void handleRequestClose()}
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

            {/* Optional Non-Blocking Failure Banner with COD Switch */}
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

            {/* First-Party Native PyDart Pay Checkout (runs directly on turkiyejam.com!) */}
            <div className="flex-1 overflow-y-auto bg-white">
              {resolvedPyDartOrderId ? (
                <PyDartNativeCheckout
                  pydartOrderId={resolvedPyDartOrderId}
                  variant="modal"
                  onPaid={() => void handleNativePaid()}
                  onPaymentError={(reason) => setInlineError(reason)}
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
