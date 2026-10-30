"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Star,
  Camera,
  X,
  Upload,
  ExternalLink,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  RotateCcw,
  RefreshCw,
  Check,
  MessageCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { OrderRecord, OrderItem } from "@/lib/orderStore";

function OrdersPageContent() {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const searchParams = useSearchParams();
  const confirmedOrderId = searchParams.get("confirmed");
  const cancelledOrderId = searchParams.get("cancelled");
  const noticeCode = searchParams.get("notice");
  const rawCancelPrompt = searchParams.get("cancelPrompt") || searchParams.get("cancel") || "";
  const cancelPromptParam = rawCancelPrompt.startsWith("cancelPrompt=")
    ? rawCancelPrompt.replace(/^cancelPrompt=/, "")
    : rawCancelPrompt;
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelPromptId, setCancelPromptId] = useState<string | null>(null);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);
  const [cancellationModalData, setCancellationModalData] = useState<{
    orderId: string;
    displayOrderId: string;
    whatsappUrl: string;
    amount: number;
    paymentSummary?: string;
    upiId?: string | null;
    isCodPartial?: boolean;
  } | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoConfirmedOrderId, setAutoConfirmedOrderId] = useState<string | null>(null);
  const [isSilentSyncing, setIsSilentSyncing] = useState<boolean>(false);
  const prevOrdersRef = useRef<OrderRecord[]>([]);

  // Track dismissed confirmation banners in local state + sessionStorage so they never reappear
  const [dismissedConfirmBannerIds, setDismissedConfirmBannerIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = sessionStorage.getItem("zupe_dismissed_wa_confirmations");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const dismissedConfirmBannerIdsRef = useRef<Set<string>>(dismissedConfirmBannerIds);
  useEffect(() => {
    dismissedConfirmBannerIdsRef.current = dismissedConfirmBannerIds;
  }, [dismissedConfirmBannerIds]);

  // Click-to-expand states for alert banners
  const [isConfirmBannerExpanded, setIsConfirmBannerExpanded] = useState<boolean>(false);
  const [expandedWarningCards, setExpandedWarningCards] = useState<Record<string, boolean>>({});

  const handleDismissConfirmBanner = useCallback((ordId: string) => {
    setDismissedConfirmBannerIds((prev) => {
      const next = new Set(prev);
      next.add(ordId);
      try {
        sessionStorage.setItem("zupe_dismissed_wa_confirmations", JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
    setAutoConfirmedOrderId(null);
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("confirmed")) {
        url.searchParams.delete("confirmed");
        window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
      }
    } catch {}
  }, []);

  const activeConfirmBannerId = useMemo(() => {
    if (confirmedOrderId && !dismissedConfirmBannerIds.has(confirmedOrderId)) {
      return confirmedOrderId;
    }
    if (autoConfirmedOrderId && !dismissedConfirmBannerIds.has(autoConfirmedOrderId)) {
      return autoConfirmedOrderId;
    }
    return null;
  }, [confirmedOrderId, autoConfirmedOrderId, dismissedConfirmBannerIds]);

  const cancelPromptHandledRef = useRef<string | null>(null);

  useEffect(() => {
    if (!cancelPromptParam) return;
    if (cancelPromptHandledRef.current === cancelPromptParam) return;

    if (orders.length > 0) {
      const cleanParam = cancelPromptParam.replace(/^#/, "");
      const targetOrd = orders.find(
        (o) =>
          o.id === cancelPromptParam ||
          (o as any).shopify_order_id === cancelPromptParam ||
          (o as any).shopify_order_id === `#${cleanParam}` ||
          o.id.replace(/^ord_/, "") === cleanParam
      );
      if (targetOrd) {
        cancelPromptHandledRef.current = cancelPromptParam;
        if (targetOrd.order_status === "cancelled" || targetOrd.whatsapp_confirm_status === "cancelled") {
          // If the target order is already cancelled, clear the parameter from URL so it doesn't linger
          try {
            const url = new URL(window.location.href);
            url.searchParams.delete("cancelPrompt");
            url.searchParams.delete("cancel");
            window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
          } catch {}
        } else {
          setCancelPromptId(targetOrd.id);
        }
      }
    }
  }, [cancelPromptParam, orders]);

  // Review & Rating Modal State
  const [reviewModalItem, setReviewModalItem] = useState<{
    orderId: string;
    product_id: string;
    product_name: string;
    product_image?: string;
    customer_name: string;
  } | null>(null);

  const [reviewRating, setReviewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewTitle, setReviewTitle] = useState<string>("");
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [reviewerName, setReviewerName] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);
  const [reviewedItems, setReviewedItems] = useState<Record<string, { rating: number; title?: string }>>({});

  // Lock background body and HTML scroll when review modal is open
  useEffect(() => {
    if (reviewModalItem) {
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
  }, [reviewModalItem]);

  // Reusable order fetching with silent background sync option
  const fetchOrders = useCallback(
    async (isSilent = false) => {
      if (!isSilent) {
        setLoading(true);
      } else {
        setIsSilentSyncing(true);
      }
      try {
        const params = new URLSearchParams();
        if (user?.email) params.set("email", user.email);
        if (user?.phone) params.set("phone", user.phone);

        // Also check if user recently placed an order as guest / phone
        try {
          const lastPhone =
            localStorage.getItem("zupe_last_cod_phone") ||
            localStorage.getItem("zupe_checkout_phone");
          if (lastPhone && !params.has("phone")) {
            params.set("phone", lastPhone);
          }
        } catch {}

        const queryString = params.toString() ? `?${params.toString()}` : "";
        const res = await fetch(`/api/orders${queryString}`, { cache: "no-store" });
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          // Detect if an order was awaiting WhatsApp confirmation and just transitioned to confirmed
          if (prevOrdersRef.current.length > 0) {
            for (const newOrd of data.orders) {
              const oldOrd = prevOrdersRef.current.find((o) => o.id === newOrd.id);
              if (
                oldOrd &&
                oldOrd.whatsapp_confirm_status === "pending_whatsapp" &&
                (newOrd.whatsapp_confirm_status === "confirmed" ||
                  newOrd.order_status === "processing" ||
                  (newOrd as any).status === "Processing") &&
                !dismissedConfirmBannerIdsRef.current.has(newOrd.id)
              ) {
                setAutoConfirmedOrderId(newOrd.id);
              }
            }
          }

          // Smart Diffing: Only trigger React state updates if orders or statuses actually changed!
          const hasOrdersChanged = () => {
            if (prevOrdersRef.current.length !== data.orders.length) return true;
            for (let i = 0; i < data.orders.length; i++) {
              const prev = prevOrdersRef.current[i];
              const curr = data.orders[i];
              if (!prev || !curr) return true;
              if (
                prev.id !== curr.id ||
                prev.whatsapp_confirm_status !== curr.whatsapp_confirm_status ||
                prev.order_status !== curr.order_status ||
                prev.payment_status !== curr.payment_status ||
                (prev as any).status !== (curr as any).status ||
                (prev as any).delivery_status !== (curr as any).delivery_status ||
                (prev as any).shiprocket_awb !== (curr as any).shiprocket_awb
              ) {
                return true;
              }
            }
            return false;
          };

          if (hasOrdersChanged() || prevOrdersRef.current.length === 0) {
            prevOrdersRef.current = data.orders;
            setOrders(data.orders);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch orders:", err);
      } finally {
        if (!isSilent) setLoading(false);
        setIsSilentSyncing(false);
      }
    },
    [user]
  );

  // Check if any active order is awaiting WhatsApp confirmation
  const hasPendingWhatsApp = useMemo(() => {
    return orders.some(
      (o) =>
        o.whatsapp_confirm_status === "pending_whatsapp" &&
        o.order_status !== "cancelled" &&
        (o as any).status !== "Cancelled"
    );
  }, [orders]);

  // Initial load
  useEffect(() => {
    // Load local reviewed items cache
    try {
      const saved = localStorage.getItem("zupe_reviewed_items");
      if (saved) {
        setReviewedItems(JSON.parse(saved));
      }
    } catch {}

    fetchOrders(false);
  }, [fetchOrders]);

  // Fast auto-polling: Polls every 2.5s while any order is awaiting WhatsApp confirmation!
  // The moment customer taps 'Confirm Order' on WhatsApp, this page updates automatically
  // in front of their eyes without requiring a browser refresh.
  useEffect(() => {
    const pollInterval = hasPendingWhatsApp ? 2500 : 30000;
    const intervalId = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchOrders(true);
      }
    }, pollInterval);

    return () => clearInterval(intervalId);
  }, [hasPendingWhatsApp, fetchOrders]);

  // Tab switch & focus auto-refresh:
  // When the user switches back from WhatsApp to this browser tab, refresh immediately.
  useEffect(() => {
    const handleFocusOrVisible = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchOrders(true);
      }
    };

    window.addEventListener("focus", handleFocusOrVisible);
    document.addEventListener("visibilitychange", handleFocusOrVisible);

    return () => {
      window.removeEventListener("focus", handleFocusOrVisible);
      document.removeEventListener("visibilitychange", handleFocusOrVisible);
    };
  }, [fetchOrders]);

  const handleOpenReviewModal = (ord: OrderRecord, item: OrderItem) => {
    const itemKey = `${ord.id}_${item.product_id || item.name}`;
    const existing = reviewedItems[itemKey];

    setReviewModalItem({
      orderId: ord.id,
      product_id: item.product_id || item.name,
      product_name: item.name,
      product_image: item.image,
      customer_name: ord.customer_name || user?.name || "Customer",
    });

    setReviewRating(existing ? existing.rating : 5);
    setHoverRating(0);
    setReviewTitle(existing?.title || "");
    setReviewComment("");
    setReviewPhotos([]);
    setReviewerName(ord.customer_name || user?.name || "");
    setReviewSuccess(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setReviewPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx: number) => {
    setReviewPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalItem || !reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: reviewModalItem.product_id,
          orderId: reviewModalItem.orderId,
          userName: reviewerName.trim() || reviewModalItem.customer_name,
          userEmail: user?.email || undefined,
          rating: reviewRating,
          title: reviewTitle.trim(),
          comment: reviewComment.trim(),
          images: reviewPhotos,
          verifiedPurchase: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReviewSuccess(true);
        const itemKey = `${reviewModalItem.orderId}_${reviewModalItem.product_id}`;
        const updated = {
          ...reviewedItems,
          [itemKey]: { rating: reviewRating, title: reviewTitle.trim() },
        };
        setReviewedItems(updated);
        try {
          localStorage.setItem("zupe_reviewed_items", JSON.stringify(updated));
        } catch {}
      }
    } catch (err) {
      console.error("Failed to submit review from orders page:", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrderId(orderId);
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  order_status: "cancelled",
                  whatsapp_confirm_status: "cancelled",
                  payment_status: (data.isRefundEligible || data.isPrepaid || data.amountToRefund > 0) ? ("refund_pending" as any) : o.payment_status,
                }
              : o
          )
        );
        setCancelSuccessMsg(
          data.message || `Order #${orderId} was successfully cancelled.`
        );
        setCancelPromptId(null);
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete("cancelPrompt");
          url.searchParams.delete("cancel");
          window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
        } catch {}

        if (data.whatsapp_redirect_url) {
          setCancellationModalData({
            orderId,
            displayOrderId: data.displayOrderId || orderId,
            whatsappUrl: data.whatsapp_redirect_url,
            amount: data.amountToRefund || 0,
            paymentSummary: data.payment_details?.paymentSummary,
            upiId: data.upi_id || data.payment_details?.vpa,
            isCodPartial: data.isCodPartial,
          });

          // Automatically open WhatsApp with customer's refund and payment details
          try {
            const w = window.open(data.whatsapp_redirect_url, "_blank");
            if (!w || w.closed || typeof w.closed === "undefined") {
              window.location.href = data.whatsapp_redirect_url;
            }
          } catch {
            window.location.href = data.whatsapp_redirect_url;
          }
        }
      } else {
        alert(data.error || "Failed to cancel order.");
      }
    } catch (e: any) {
      alert(e.message || "Network error while cancelling order.");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const getStatusBadge = (status: OrderRecord["order_status"], waStatus?: string) => {
    if (waStatus === "cancelled" || status === "cancelled") {
      return (
        <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 min-h-[42px] sm:min-h-[44px] rounded-xl text-[10px] sm:text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 whitespace-nowrap w-full sm:w-auto tracking-tight select-none">
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Cancelled</span>
        </span>
      );
    }

    if (waStatus === "pending_whatsapp") {
      return (
        <span
          className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 min-h-[42px] sm:min-h-[44px] rounded-xl text-[9.5px] sm:text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300/80 w-full sm:w-auto tracking-tight transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-xs hover:border-amber-400 select-none cursor-default leading-tight text-center"
          title="Awaiting customer confirmation on WhatsApp"
        >
          {/* Pulsing live amber ping dot */}
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="leading-tight text-center">Awaiting WhatsApp Confirmation</span>
        </span>
      );
    }

    switch (status) {
      case "delivered":
        return (
          <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 min-h-[42px] sm:min-h-[44px] rounded-xl text-[10px] sm:text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap w-full sm:w-auto tracking-tight select-none">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Delivered</span>
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 min-h-[42px] sm:min-h-[44px] rounded-xl text-[10px] sm:text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 whitespace-nowrap w-full sm:w-auto tracking-tight select-none">
            <Truck className="w-3.5 h-3.5 shrink-0" />
            <span>In Transit</span>
          </span>
        );
      case "processing":
      default:
        return (
          <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 min-h-[42px] sm:min-h-[44px] rounded-xl text-[10px] sm:text-[11px] font-bold bg-orange-50 text-[#FF7A00] border border-orange-200/80 whitespace-nowrap w-full sm:w-auto tracking-tight select-none">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Processing</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111111]">
      <Navbar />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-5 sm:pt-8 pb-12 sm:pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-gray-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-gray-900 tracking-tight whitespace-nowrap">
              My Orders
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Track packages, check shipping updates, rate & review delivered purchases
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchOrders(false)}
              disabled={loading || isSilentSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-xs disabled:opacity-60"
              title="Refresh order statuses"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  loading || isSilentSyncing ? "animate-spin text-[#FF7A00]" : "text-gray-500"
                }`}
              />
              <span>{isSilentSyncing ? "Syncing..." : "Refresh"}</span>
            </button>

            {!isAuthenticated && (
              <Link
                href="/signin?redirect=/orders&notice=Please sign in to view and track your orders"
                className="text-xs font-semibold text-[#FF7A00] hover:underline ml-1"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Banner: Order Confirmed via WhatsApp Link or Real-time Sync (Reduced Height, Tap to Expand/Collapse, One-time Dismissal) */}
        {activeConfirmBannerId && (
          <div
            onClick={() => setIsConfirmBannerExpanded((prev) => !prev)}
            className="mb-4 py-2.5 px-3 sm:px-4 rounded-xl bg-emerald-50 border border-emerald-200/90 text-emerald-950 flex items-start justify-between gap-2.5 shadow-xs animate-in fade-in slide-in-from-top-1 duration-200 cursor-pointer hover:bg-emerald-100/40 transition-colors"
            role="button"
            tabIndex={0}
            title="Click to expand/collapse message"
          >
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-xs text-emerald-950">🎉 Order Confirmed via WhatsApp!</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded break-all">
                    #{activeConfirmBannerId}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200/70 px-1.5 py-0.5 rounded ml-auto sm:ml-0 transition-colors">
                    {isConfirmBannerExpanded ? (
                      <>Less <ChevronUp className="w-3 h-3" /></>
                    ) : (
                      <>Details <ChevronDown className="w-3 h-3" /></>
                    )}
                  </span>
                </div>
                <p className={`text-[11px] text-emerald-800 mt-1 leading-relaxed ${isConfirmBannerExpanded ? "line-clamp-none" : "line-clamp-1 sm:line-clamp-none"}`}>
                  {isConfirmBannerExpanded
                    ? `Thank you! Your order #${activeConfirmBannerId} has been confirmed via WhatsApp. We have dispatched our full confirmation message with tracking and discount details to your WhatsApp, and your package is being prepared for dispatch.`
                    : "Thank you! Tracking details dispatched to your WhatsApp. Package is being prepared for dispatch."
                  }
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismissConfirmBanner(activeConfirmBannerId);
              }}
              className="text-emerald-700 hover:text-emerald-950 p-1 rounded-lg hover:bg-emerald-100/80 transition shrink-0 cursor-pointer ml-1"
              aria-label="Dismiss banner"
              title="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Banner: Order Cancelled via WhatsApp Link */}
        {cancelledOrderId && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 shadow-xs">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-sm">Order Cancelled as Requested</p>
              <p className="text-xs text-rose-700 mt-0.5">
                Order <strong>#{cancelledOrderId}</strong> has been cancelled. All reserved items have been restocked, and no further charges or dispatch will occur.
              </p>
            </div>
          </div>
        )}

        {/* Banner: Notice / Link Already Processed */}
        {noticeCode === "already_processed" && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-sm">Notice: Verification Link Already Used</p>
              <p className="text-xs text-amber-700 mt-0.5">
                This WhatsApp action link was already processed. The status of your order below reflects the recorded decision.
              </p>
            </div>
          </div>
        )}

        {/* Banner: Direct cancellation success message */}
        {cancelSuccessMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Order Cancelled</p>
                <p className="text-xs text-rose-700 mt-0.5">{cancelSuccessMsg}</p>
              </div>
            </div>
            <button
              onClick={() => setCancelSuccessMsg(null)}
              className="text-rose-400 hover:text-rose-700 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-sm text-gray-500">
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="max-w-md mx-auto py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-gray-100 flex items-center justify-center text-gray-400">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-display text-gray-900 mb-2">
              No orders placed yet
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              When you place an order, its details, tracking, and product reviews will appear here.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#FF7A00] text-white text-xs font-semibold"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((ord) => {
              const isDelivered =
                (ord.order_status || "").toLowerCase() === "delivered" ||
                ((ord as any).delivery_status || "").toLowerCase() === "delivered";

              const isShipped =
                ["shipped", "in transit", "out for delivery"].includes((ord.order_status || "").toLowerCase()) ||
                ["shipped", "in transit", "out for delivery"].includes(((ord as any).delivery_status || "").toLowerCase());

              // Safely extract items whether array or string
              let rawItems: any[] = [];
              if (Array.isArray(ord.items)) {
                rawItems = ord.items;
              } else if (typeof ord.items === "string" && (ord.items as string).trim()) {
                try {
                  rawItems = JSON.parse(ord.items);
                } catch {
                  rawItems = [];
                }
              }

              // Fallback if no items array exists so card is never blank
              if (!rawItems || rawItems.length === 0) {
                rawItems = [
                  {
                    product_id: "ripple-lamp",
                    name: "Dynamic Water Ripple Night Light",
                    price: ord.total_amount || 749,
                    quantity: 1,
                    image: "/products/ripple-lamp.jpg",
                  },
                ];
              }

              const paymentStatusStr = ((ord as any).payment_status || "").toLowerCase();
              const isRefundCompleted = paymentStatusStr === "refunded";
              const isRefundRejected = paymentStatusStr.includes("reject");
              const isRefundProcessing =
                !isRefundCompleted &&
                !isRefundRejected &&
                (paymentStatusStr === "refund_pending" ||
                 paymentStatusStr === "refund pending" ||
                 (ord.order_status === "cancelled" &&
                  (paymentStatusStr.includes("pending") || (ord as any).payment_status === "Refund Pending")));

              const isRefunded = isRefundCompleted || isRefundProcessing || isRefundRejected;

              const isPaid =
                !isRefunded &&
                (ord.payment_status === "paid" ||
                 Boolean(ord.payment_method && ord.payment_method.toLowerCase().includes("prepaid")));

              const isCod =
                !isPaid &&
                !isRefunded &&
                (Boolean(ord.payment_method?.toLowerCase().includes("cash on delivery")) ||
                 Boolean(ord.payment_method?.toUpperCase() === "COD"));

              const productSubtotal = rawItems.reduce(
                (sum: number, it: any) => sum + (Number(it.price || it.unit_price) || 0) * (Number(it.quantity) || 1),
                0
              );

              // Authoritative total amount
              let displayedTotal = Number(ord.total_amount) || 0;
              if (isCod) {
                if (productSubtotal > 0 && displayedTotal <= productSubtotal) {
                  displayedTotal = productSubtotal + 49;
                } else if (displayedTotal <= 0 && productSubtotal > 0) {
                  displayedTotal = productSubtotal + 49;
                }
              } else if ((isPaid || isRefunded) && displayedTotal <= 0 && productSubtotal > 0) {
                displayedTotal = productSubtotal;
              }

              const isCodOrder =
                Boolean(ord.payment_method?.toLowerCase().includes("cash on delivery")) ||
                Boolean(ord.payment_method?.toUpperCase() === "COD") ||
                Boolean(ord.payment_method?.toLowerCase().includes("partial"));

              const codAdvancePaid = Number((ord as any).advance_paid) || 10;
              const refundAmountLabel = isCodOrder
                ? `₹${codAdvancePaid} (COD Advance Fee)`
                : `₹${displayedTotal.toLocaleString()}`;

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-8"
                >
                  {/* Header row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-6">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Order Reference</span>
                      <span className="font-mono text-sm font-bold text-gray-900">{ord.id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Date Placed</span>
                      <span className="text-xs text-gray-700">
                        {new Date(ord.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Total Amount</span>
                      <span className="text-sm font-bold text-[#FF7A00]">
                        ₹{displayedTotal.toLocaleString()}
                      </span>
                      {isRefundCompleted ? (
                        <span className="text-[10px] text-emerald-600 font-semibold block">
                          Refunded to Source
                        </span>
                      ) : isRefundProcessing ? (
                        <span className="text-[10px] text-amber-600 font-semibold block">
                          Refund Processing
                        </span>
                      ) : isRefundRejected ? (
                        <span className="text-[10px] text-rose-600 font-semibold block">
                          Refund Ineligible
                        </span>
                      ) : isCod ? (
                        <span className="text-[10px] text-gray-500 font-medium block">
                          (₹{productSubtotal.toLocaleString()} + ₹49 COD)
                        </span>
                      ) : isPaid ? (
                        <span className="text-[10px] text-emerald-600 font-semibold block">
                          Prepaid Online
                        </span>
                      ) : null}
                    </div>
                    {/* Status Badges & Action Buttons */}
                    <div className="flex flex-col gap-2.5 w-full sm:w-auto">
                      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                        {/* Status Badge */}
                        {getStatusBadge(isDelivered ? "delivered" : ord.order_status, ord.whatsapp_confirm_status)}

                        {/* Top Right Position */}
                        {isCod && ord.order_status !== "cancelled" ? (
                          <Link
                            href={`/checkout?method=prepaid&switch=cod&orderId=${encodeURIComponent(ord.id)}`}
                            className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 min-h-[42px] sm:min-h-[44px] rounded-xl text-[10px] sm:text-xs font-black tracking-tight bg-[#FF7A00] hover:bg-[#E66E00] text-white shadow-xs hover:shadow-md hover:shadow-orange-500/25 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] w-full sm:w-auto text-center animate-pulse whitespace-nowrap"
                          >
                            <Sparkles className="w-3.5 h-3.5 shrink-0" />
                            <span>Pay Now (Save ₹30)</span>
                          </Link>
                        ) : isRefundCompleted ? (
                          <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 min-h-[42px] sm:min-h-[44px] rounded-xl text-[10px] sm:text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap w-full sm:w-auto tracking-tight select-none">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Refunded</span>
                          </span>
                        ) : isRefundProcessing ? (
                          <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 min-h-[42px] sm:min-h-[44px] rounded-xl text-[10px] sm:text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 whitespace-nowrap w-full sm:w-auto tracking-tight select-none">
                            <RotateCcw className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Refund Processing</span>
                          </span>
                        ) : isRefundRejected ? (
                          <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 min-h-[42px] sm:min-h-[44px] rounded-xl text-[10px] sm:text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 whitespace-nowrap w-full sm:w-auto tracking-tight select-none">
                            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>Refund Ineligible</span>
                          </span>
                        ) : isPaid ? (
                          <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 min-h-[42px] sm:min-h-[44px] rounded-xl text-[10px] sm:text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap w-full sm:w-auto tracking-tight select-none">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Prepaid (Paid)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 min-h-[42px] sm:min-h-[44px] rounded-xl text-[10px] sm:text-[11px] font-bold bg-slate-100/90 text-slate-700 border border-slate-200 whitespace-nowrap w-full sm:w-auto tracking-tight select-none">
                            <ShoppingBag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>Cash on Delivery</span>
                          </span>
                        )}
                      </div>

                      {/* Row 2: Cash on Delivery Badge & Track Package Button */}
                      {ord.order_status !== "cancelled" && (
                        <div className={`grid ${isCod ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-none"} sm:flex sm:items-center gap-2 w-full sm:w-auto`}>
                          {isCod && (
                            <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 min-h-[42px] sm:min-h-[44px] rounded-xl text-[10px] sm:text-[11px] font-bold bg-slate-100/90 text-slate-700 border border-slate-200 whitespace-nowrap w-full sm:w-auto tracking-tight select-none">
                              <ShoppingBag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>Cash on Delivery</span>
                            </span>
                          )}

                          <Link
                            href={`/order-tracking?query=${encodeURIComponent(ord.id)}`}
                            className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 min-h-[42px] sm:min-h-[44px] rounded-xl text-[10.5px] sm:text-xs font-bold tracking-tight bg-white hover:bg-orange-50/90 text-[#FF7A00] border border-[#FF7A00]/40 hover:border-[#FF7A00] shadow-2xs hover:shadow-xs transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] w-full sm:w-auto text-center whitespace-nowrap"
                          >
                            <Truck className="w-3.5 h-3.5 shrink-0" />
                            <span>Track Package</span>
                          </Link>

                          {isDelivered && (
                            <button
                              type="button"
                              onClick={() => handleOpenReviewModal(ord, rawItems[0])}
                              className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 min-h-[42px] sm:min-h-[44px] rounded-xl text-[10.5px] sm:text-xs font-bold tracking-tight bg-amber-500 hover:bg-amber-600 text-white shadow-xs hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] w-full sm:w-auto text-center cursor-pointer whitespace-nowrap"
                            >
                              <Star className="w-3.5 h-3.5 fill-current shrink-0" />
                              <span>Rate & Review</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Refund Processing Alert Banner */}
                  {isRefundProcessing && (
                    <div className="mb-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                          <RotateCcw className="w-4 h-4 animate-spin-slow" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-extrabold text-amber-900">
                              Refund Processing ({refundAmountLabel})
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                              Billing Desk Verification
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-800 mt-0.5">
                            Order cancelled before dispatch. Refund of <strong>{refundAmountLabel}</strong> is being coordinated directly to your original payment account.
                          </p>
                        </div>
                      </div>
                      <a
                        href={`https://wa.me/919744122853?text=${encodeURIComponent(
                          `👋 Hello Zupe Store Support Team!\n\n` +
                          `ℹ️ REFUND STATUS INQUIRY\n\n` +
                          `I am following up on the refund for my cancelled order.\n\n` +
                          `📦 ORDER DETAILS\n` +
                          `━━━━━━━━━━━━━━━\n` +
                          `🆔 Order ID: ${(ord as any).shopify_order_id || (ord.id.startsWith("#") ? ord.id : `#${ord.id}`)}\n` +
                          `👤 Customer Name: ${ord.customer_name || 'Valued Customer'}\n` +
                          `💰 Refund Amount: ${refundAmountLabel}\n` +
                          `━━━━━━━━━━━━━━━\n\n` +
                          `Please check and process the refund to my payment account. Thank you!\n\n` +
                          `🧡 Team Zupe Store\n✨ Smart Finds. Better Living.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs shrink-0 self-end sm:self-center"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Billing Desk</span>
                      </a>
                    </div>
                  )}

                  {/* Refund Completed Alert Banner */}
                  {isRefundCompleted && (
                    <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-extrabold text-emerald-900">
                              Refund Completed ({refundAmountLabel})
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                              Verified &amp; Credited
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-800 mt-0.5">
                            Your refund of <strong>{refundAmountLabel}</strong> has been successfully transferred back to your original payment account. Thank you!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Refund Rejected Alert Banner */}
                  {isRefundRejected && (
                    <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                          <XCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-extrabold text-rose-900">
                              Refund Ineligible
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">
                              Desk Closed
                            </span>
                          </div>
                          <p className="text-[11px] text-rose-800 mt-0.5">
                            This cancellation is not eligible for refund. Please contact our support desk on WhatsApp (+91 97441 22853) if you have any questions.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp Verification Alert Banner on Card (Slim, Tap to Expand/Collapse) */}
                  {ord.whatsapp_confirm_status === "pending_whatsapp" && (() => {
                    const isExpanded = Boolean(expandedWarningCards[ord.id]);
                    return (
                      <div
                        onClick={() => {
                          setExpandedWarningCards((prev) => ({
                            ...prev,
                            [ord.id]: !prev[ord.id],
                          }));
                        }}
                        className="mb-4 py-2 px-3 sm:px-3.5 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs cursor-pointer hover:bg-amber-100/50 transition-colors"
                        role="button"
                        tabIndex={0}
                        title="Click to view full instructions"
                      >
                        <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-extrabold text-amber-950">
                                Please confirm your order in WhatsApp
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900">
                                Action Required
                              </span>
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-800 bg-amber-200/50 hover:bg-amber-300/50 px-1.5 py-0.5 rounded ml-auto sm:ml-0 transition-colors">
                                {isExpanded ? (
                                  <>Less <ChevronUp className="w-3 h-3" /></>
                                ) : (
                                  <>Read full <ChevronDown className="w-3 h-3" /></>
                                )}
                              </span>
                            </div>
                            <p className={`text-[11px] text-amber-800 leading-snug mt-1 ${isExpanded ? "leading-relaxed" : "line-clamp-1 sm:line-clamp-none"}`}>
                              {isExpanded ? (
                                <>
                                  We sent a verification message to <strong>{ord.customer_phone || "your WhatsApp"}</strong> with interactive <strong>[Confirm Order]</strong> and <strong>[Cancel]</strong> buttons. Please tap <strong>Confirm Order</strong> in WhatsApp so our logistics team can generate your courier tracking and dispatch your package immediately.
                                </>
                              ) : (
                                <>
                                  Tap <strong>Confirm Order</strong> sent to <strong>{ord.customer_phone || "your WhatsApp"}</strong> to dispatch.
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-2 shrink-0 self-end sm:self-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {cancelPromptId === ord.id ? (
                            <div className="flex flex-col items-end gap-1.5 bg-rose-50/95 p-2 sm:p-2.5 rounded-xl border border-rose-200 shadow-xs">
                              <div className="text-[11px] text-rose-900 text-right leading-tight max-w-[240px] sm:max-w-xs">
                                <span className="font-bold text-rose-950">Cancel Order? </span>
                                {isCod ? (
                                  <span className="text-amber-800 font-medium">
                                    Doorstep balance cancelled. The ₹10 advance confirmation fee is 100% refundable to your original payment account.
                                  </span>
                                ) : (
                                  <span className="text-emerald-800 font-medium">
                                    Full ₹{displayedTotal} refund will be coordinated directly to your original payment account via WhatsApp (+91 97441 22853).
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleCancelOrder(ord.id)}
                                  disabled={cancellingOrderId === ord.id}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 transition cursor-pointer shadow-xs"
                                >
                                  {cancellingOrderId === ord.id ? "Cancelling..." : "Confirm"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCancelPromptId(null);
                                    try {
                                      const url = new URL(window.location.href);
                                      url.searchParams.delete("cancelPrompt");
                                      url.searchParams.delete("cancel");
                                      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
                                    } catch {}
                                  }}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 transition cursor-pointer"
                                >
                                  Keep
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setCancelPromptId(ord.id)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 transition-all cursor-pointer"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Direct customer cancellation banner for processing orders that are not pending WhatsApp */}
                  {ord.whatsapp_confirm_status !== "pending_whatsapp" &&
                    ord.whatsapp_confirm_status !== "cancelled" &&
                    ord.order_status !== "cancelled" &&
                    !isDelivered &&
                    !isShipped && (
                      <div className="mb-4 flex items-center justify-end">
                        {cancelPromptId === ord.id ? (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-rose-50/95 p-3 rounded-xl border border-rose-200 w-full shadow-xs">
                            <div className="text-xs text-rose-900 leading-relaxed">
                              <span className="font-bold text-rose-950">Are you sure you want to cancel this order? </span>
                              {isCod ? (
                                <span className="block text-emerald-900 font-medium text-[11px] mt-0.5">
                                  ✓ Doorstep parcel delivery will be cancelled. The <strong>₹10 advance confirmation fee</strong> paid during checkout is <strong>100% refundable</strong> and will be processed back to your original payment account.
                                </span>
                              ) : (
                                <span className="block text-emerald-900 font-medium text-[11px] mt-0.5">
                                  ✓ Full refund of <strong>₹{displayedTotal}</strong> will be coordinated directly to your original payment account. You will be connected to our billing desk on WhatsApp (+91 97441 22853) with your payment details for priority credit.
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => handleCancelOrder(ord.id)}
                                disabled={cancellingOrderId === ord.id}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer shadow-xs"
                              >
                                {cancellingOrderId === ord.id ? "Cancelling..." : "Confirm Cancel"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCancelPromptId(null);
                                  try {
                                    const url = new URL(window.location.href);
                                    url.searchParams.delete("cancelPrompt");
                                    url.searchParams.delete("cancel");
                                    window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
                                  } catch {}
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
                              >
                                Keep Order
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCancelPromptId(ord.id)}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                          >
                            Need to cancel? Click here
                          </button>
                        )}
                      </div>
                    )}

                  {/* Items list */}
                  <div className="space-y-4">
                    {rawItems.map((it: any, idx: number) => {
                      const itemKey = `${ord.id}_${it.product_id || it.name}`;
                      const hasReviewed = reviewedItems[itemKey];
                      const productTargetLink = `/products/${encodeURIComponent(it.product_id || it.name)}`;
                      const itemUnitPrice = Number(it.price || it.unit_price) || (productSubtotal > 0 ? 0 : Math.max(0, displayedTotal - (isCod ? 49 : 0)));
                      const itemQty = Number(it.quantity || 1);
                      const itemTotal = itemUnitPrice * itemQty;

                      return (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-2xl bg-gray-50/70 border border-gray-100/80"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {it.image ? (
                              <Link
                                href={productTargetLink}
                                className="relative w-16 h-16 rounded-xl bg-white border border-gray-200 overflow-hidden shrink-0 group"
                              >
                                <Image
                                  src={it.image}
                                  alt={it.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform"
                                />
                              </Link>
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center shrink-0">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <Link
                                href={productTargetLink}
                                className="text-sm font-bold text-gray-900 hover:text-[#FF7A00] transition-colors truncate block"
                              >
                                {it.name}
                              </Link>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Qty: {itemQty} × ₹{itemUnitPrice.toLocaleString()}
                              </p>
                              {((it as any).bundle_tier > 1 || (it as any).offer_label) && (
                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-orange-50 text-[#FF5722] border border-orange-200">
                                  <span>✨</span>
                                  <span>{(it as any).offer_label || `Buy ${itemQty} Save More`}</span>
                                </span>
                              )}

                              {/* Review & Rating Trigger on Delivered Product */}
                              {isDelivered ? (
                                <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenReviewModal(ord, it)}
                                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${
                                      hasReviewed
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                                        : "bg-amber-500 text-white hover:bg-amber-600 hover:scale-105"
                                    }`}
                                  >
                                    <Star className={`w-3.5 h-3.5 fill-current ${hasReviewed ? "text-emerald-600" : "text-white"}`} />
                                    <span>
                                      {hasReviewed
                                        ? `✓ Reviewed (${hasReviewed.rating}★)`
                                        : "⭐ Rate & Review Product"}
                                    </span>
                                  </button>

                                  <Link
                                    href={`${productTargetLink}#reviews`}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-[#FF7A00] transition-colors"
                                  >
                                    <span>View on Product Page</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </Link>
                                </div>
                              ) : (
                                <span className="text-[11px] text-gray-400 italic block mt-1.5">
                                  Review & rating option unlocks upon delivery
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="sm:text-right shrink-0">
                            <span className="font-extrabold text-sm text-gray-900 block">
                              ₹{itemTotal.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Summary Breakdown matching Checkout */}
                  <div className="mt-4 pt-3 border-t border-dashed border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-600 gap-2 bg-gray-50/70 px-4 py-3 rounded-2xl">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-gray-500">
                      <span>Items Subtotal: <strong className="text-gray-900">₹{productSubtotal.toLocaleString()}</strong></span>
                      <span>•</span>
                      {isCod ? (
                        <span className="text-amber-700 font-semibold">
                          COD Delivery Fee: <strong>+₹49</strong>
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">
                          Delivery: <strong>FREE (Saved ₹49)</strong>
                        </span>
                      )}
                      {ord.discount_amount && ord.discount_amount > 0 ? (
                        <>
                          <span>•</span>
                          <span className="text-emerald-600 font-semibold">
                            Prepaid Discount: <strong>-₹{ord.discount_amount}</strong>
                          </span>
                        </>
                      ) : null}
                    </div>
                    <div className="text-left sm:text-right font-bold text-gray-900">
                      {isCod ? "Payable on Delivery:" : "Total Paid:"}{" "}
                      <span className={`text-sm font-extrabold ${isPaid ? "text-emerald-700" : "text-[#FF7A00]"}`}>
                        ₹{displayedTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Shipping address footer */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row justify-between text-xs text-gray-500 gap-2">
                    <span>
                      Ship to: {ord.shipping_address}
                      {ord.city ? `, ${ord.city}` : ""}
                    </span>
                    <span>Payment: {isPaid ? "Prepaid (Paid Online)" : (ord.payment_method || "Cash on Delivery")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL: RATE & REVIEW DELIVERED PRODUCT
         ======================================================== */}
      {reviewModalItem && (
        <div 
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setReviewModalItem(null);
          }}
        >
          <div 
            data-lenis-prevent
            className="bg-white rounded-3xl max-w-lg md:max-w-4xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col min-h-0 overflow-hidden shadow-2xl animate-scaleIn border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Ratings & Reviews</h3>
                <p className="text-xs text-gray-500">Order #{reviewModalItem.orderId} • Verified Delivery</p>
              </div>
              <button
                onClick={() => setReviewModalItem(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Split into Left Guidelines (Desktop Only) and Right Form */}
            <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
              {/* Left Column: Flipkart-style "What makes a good review" (DESKTOP ONLY) */}
              <aside 
                data-lenis-prevent
                className="hidden md:flex flex-col w-72 lg:w-80 shrink-0 border-r border-gray-100 bg-[#FAFBFD] p-6 overflow-y-auto min-h-0 overscroll-contain space-y-6 text-left select-none"
              >
                <div>
                  <h4 className="text-sm font-bold text-gray-900 tracking-tight">
                    What makes a good review
                  </h4>
                  <div className="w-8 h-0.5 bg-[#FF7A00] rounded-full mt-2" />
                </div>

                <div className="space-y-6 text-xs">
                  {/* Section 1 */}
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-gray-900 text-xs">
                      Have you used this product?
                    </h5>
                    <p className="text-gray-500 leading-relaxed text-[11px]">
                      Your review should be about your experience with the product.
                    </p>
                  </div>

                  <div className="border-t border-gray-100" />

                  {/* Section 2 */}
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-gray-900 text-xs">
                      Why review a product?
                    </h5>
                    <p className="text-gray-500 leading-relaxed text-[11px]">
                      Your valuable feedback will help fellow shoppers decide!
                    </p>
                  </div>

                  <div className="border-t border-gray-100" />

                  {/* Section 3 */}
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-gray-900 text-xs">
                      How to review a product?
                    </h5>
                    <p className="text-gray-500 leading-relaxed text-[11px]">
                      Your review should include facts. An honest opinion is always appreciated. If you have an issue with the product or service please contact us from the help centre.
                    </p>
                  </div>
                </div>

                {/* Verified Buyer Note */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <div className="p-3 bg-white rounded-xl border border-gray-200/80 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Buyer Badge
                    </span>
                    <p className="text-[10px] text-gray-500 leading-normal">
                      Your review will appear with a Verified Buyer badge on this product's page.
                    </p>
                  </div>
                </div>
              </aside>

              {/* Right Column: Review Submission Form */}
              <div 
                data-lenis-prevent
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-white"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                <form onSubmit={handleSubmitReview} className="p-6 space-y-4">
                  {reviewSuccess ? (
                    <div className="py-10 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Thank You! Review Published</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                          Your rating and photos are now live on this product's individual page.
                        </p>
                      </div>

                      <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2">
                        <Link
                          href={`/products/${encodeURIComponent(reviewModalItem.product_id)}#reviews`}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#111111] text-white text-xs font-bold hover:bg-[#FF7A00] transition-colors"
                        >
                          <span>View on Product Page</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setReviewModalItem(null)}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Product Overview Card */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                        {reviewModalItem.product_image && (
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white border border-gray-200 shrink-0">
                            <Image
                              src={reviewModalItem.product_image}
                              alt={reviewModalItem.product_name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {reviewModalItem.product_name}
                          </p>
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Verified Purchase Delivered
                          </span>
                        </div>
                      </div>

                      {/* 5-Star Rating Selector */}
                      <div className="text-center py-3 bg-amber-50/60 rounded-2xl border border-amber-200/80">
                        <label className="block text-xs font-bold text-gray-800 mb-1.5">
                          How was your experience? *
                        </label>
                        <div className="flex items-center justify-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const activeStar = (hoverRating || reviewRating) >= star;
                            return (
                              <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setReviewRating(star)}
                                className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                              >
                                <Star
                                  className={`w-8 h-8 ${
                                    activeStar ? "text-amber-400 fill-current" : "text-gray-300"
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                        <span className="text-[11px] font-bold text-amber-800 mt-1 block">
                          {reviewRating === 5
                            ? "5 - Excellent / Loved it! ⭐⭐⭐⭐⭐"
                            : reviewRating === 4
                            ? "4 - Very Good / High Quality ⭐⭐⭐⭐"
                            : reviewRating === 3
                            ? "3 - Average ⭐⭐⭐"
                            : reviewRating === 2
                            ? "2 - Below Average ⭐⭐"
                            : "1 - Poor ⭐"}
                        </span>
                      </div>

                      {/* Review Title */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Headline / Title
                        </label>
                        <input
                          type="text"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="e.g. Excellent build quality, exactly as described!"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF7A00]"
                        />
                      </div>

                      {/* Detailed Comment */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Your Honest Review *
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Tell future buyers what you liked about this item (quality, packaging, delivery speed, usefulness)..."
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#FF7A00]"
                        />
                      </div>

                      {/* Upload Customer Photos */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-gray-700">
                            Upload Photos & Images (Optional)
                          </label>
                          <span className="text-[10px] text-gray-400">Multiple files allowed</span>
                        </div>

                        <label className="cursor-pointer border-2 border-dashed border-gray-200 hover:border-[#FF7A00] bg-gray-50 hover:bg-orange-50/50 rounded-2xl p-4 flex flex-col items-center justify-center transition-all">
                          <Camera className="w-6 h-6 text-gray-400 mb-1" />
                          <span className="text-xs font-bold text-gray-700">Click to upload product pictures</span>
                          <span className="text-[10px] text-gray-400">PNG, JPG, WebP formats</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoUpload}
                          />
                        </label>

                        {/* Previews with remove X button */}
                        {reviewPhotos.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2.5">
                            {reviewPhotos.map((photo, i) => (
                              <div
                                key={i}
                                className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 group shadow-xs"
                              >
                                <img src={photo} alt="Upload preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removePhoto(i)}
                                  className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Reviewer Display Name */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Display Name on Review
                        </label>
                        <input
                          type="text"
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          placeholder="e.g. Rahul M."
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF7A00]"
                        />
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setReviewModalItem(null)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submittingReview || !reviewComment.trim()}
                          className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#FF7A00] hover:bg-[#E66E00] disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                        >
                          {submittingReview ? "Submitting Review..." : "Submit Verified Review"}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post-Cancellation WhatsApp Redirection Modal */}
      {cancellationModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Order Canceled</h3>
                  <p className="text-xs text-gray-500">Order {cancellationModalData.displayOrderId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCancellationModalData(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-2 text-emerald-950">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800">
                  {cancellationModalData.isCodPartial ? "Refund Amount (COD Advance Fee):" : "Refund Amount:"}
                </span>
                <span className="text-sm font-extrabold text-emerald-950">₹{cancellationModalData.amount}</span>
              </div>
              {cancellationModalData.upiId && (
                <div className="flex items-center justify-between text-xs text-emerald-800">
                  <span className="font-semibold">Customer UPI ID:</span>
                  <span className="font-mono font-bold text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded">
                    {cancellationModalData.upiId}
                  </span>
                </div>
              )}
              {cancellationModalData.paymentSummary && (
                <div className="flex items-center justify-between text-xs text-emerald-800">
                  <span className="font-semibold">Payment Details:</span>
                  <span className="font-medium text-emerald-900">{cancellationModalData.paymentSummary}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              We have prepared your cancellation details. Tap the button below to send your refund request with your payment details to our accounts desk on WhatsApp (<strong>+91 97441 22853</strong>) for instant processing.
            </p>

            <div className="space-y-2 pt-2">
              <a
                href={cancellationModalData.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setCancellationModalData(null)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-sm transition-all shadow-md hover:shadow-lg hover:scale-[1.01]"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Open WhatsApp to Send Refund Details</span>
              </a>

              <button
                type="button"
                onClick={() => setCancellationModalData(null)}
                className="w-full py-2.5 text-center text-xs font-bold text-gray-500 hover:text-gray-800 transition cursor-pointer"
              >
                Close &amp; View Orders
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F3F4F6] text-[#111111]">
          <Navbar />
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-24 pb-16 text-center text-sm text-gray-500">
            Loading your orders...
          </div>
          <Footer />
        </div>
      }
    >
      <OrdersPageContent />
    </Suspense>
  );
}
