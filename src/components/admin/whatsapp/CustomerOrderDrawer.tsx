"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Truck,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Tag,
  Copy,
  RotateCcw,
  User,
  BookOpen,
  MessageSquare,
  Sparkles,
  MessageCircle,
  RefreshCw,
  Clock,
  XCircle,
  AlertCircle,
  Check,
  ChevronDown,
  Send,
} from "lucide-react";
import { WhatsAppConversation } from "@/lib/whatsappStore";

interface CustomerOrderDrawerProps {
  conversation: WhatsAppConversation;
  onClose: () => void;
  onUpdateOrderStatus: (orderId: string, status: string) => void;
  onRefreshConversations?: () => void;
  onSendQuickTemplate: (type: string) => void;
}

export default function CustomerOrderDrawer({
  conversation,
  onClose,
  onUpdateOrderStatus,
  onRefreshConversations,
  onSendQuickTemplate,
}: CustomerOrderDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [copiedAWB, setCopiedAWB] = useState(false);

  // Live order state
  const [orderData, setOrderData] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  // Action state
  const [actionLoading, setActionLoading] = useState<"resend" | "confirm" | "awb" | "cancel" | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Cancellation Modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("Customer requested cancellation via WhatsApp");
  const [cancelNotes, setCancelNotes] = useState("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch full live order from ERP
  const fetchOrderDetails = useCallback(async () => {
    const query = conversation.orderId || conversation.customerPhone?.replace(/\D/g, "").slice(-10);
    if (!query) return;

    setLoadingOrder(true);
    try {
      const res = await fetch(`/api/admin/orders?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        // Find matching order
        const matched = conversation.orderId
          ? data.orders.find((o: any) => o.id === conversation.orderId || o.shopify_order_id === conversation.orderId)
          : data.orders[0];
        if (matched) {
          setOrderData(matched);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch order details:", e);
    } finally {
      setLoadingOrder(false);
    }
  }, [conversation.orderId, conversation.customerPhone]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const activeOrderId = orderData?.id || conversation.orderId;

  // 1. Resend WhatsApp Interactive Confirmation & Cancel Buttons
  const handleResendWAButtons = async () => {
    if (!activeOrderId) return;
    setActionLoading("resend");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resend_wa_buttons",
          order_id: activeOrderId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          data.message || `WhatsApp interactive message with Confirm & Cancel buttons dispatched to ${conversation.customerPhone}!`,
          "success"
        );
        await fetchOrderDetails();
        onRefreshConversations?.();
      } else {
        showToast(data.error || "Failed to resend WhatsApp confirmation buttons", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error while resending WhatsApp buttons", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // 2. Manual Confirm Order
  const handleManualConfirmOrder = async () => {
    if (!activeOrderId) return;
    setActionLoading("confirm");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "manual_confirm",
          order_id: activeOrderId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Order #${activeOrderId.substring(0, 8)} confirmed! WhatsApp confirmation message sent.`, "success");
        await fetchOrderDetails();
        onRefreshConversations?.();
      } else {
        showToast(data.error || "Failed to confirm order", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error while confirming order", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // 3. Generate Shiprocket AWB
  const handleGenerateAWB = async () => {
    if (!activeOrderId) return;
    setActionLoading("awb");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_awb",
          order_id: activeOrderId,
        }),
      });
      const data = await res.json();
      if (data.success && data.awb) {
        showToast(`Generated Shiprocket AWB ${data.awb} via ${data.courier || "Courier"}!`, "success");
        await fetchOrderDetails();
        onRefreshConversations?.();
      } else {
        showToast(data.message || data.error || "Failed to generate Shiprocket AWB", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error while generating AWB", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // 4. Cancel Order with Reason
  const handleConfirmCancelOrder = async () => {
    if (!activeOrderId) return;
    setActionLoading("cancel");
    try {
      const combinedReason = cancelNotes.trim()
        ? `${cancelReason} - ${cancelNotes.trim()}`
        : cancelReason;

      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "manual_cancel",
          order_id: activeOrderId,
          reason: combinedReason,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Order #${activeOrderId.substring(0, 8)} cancelled. Customer WhatsApp notification sent.`, "success");
        setShowCancelModal(false);
        await fetchOrderDetails();
        onRefreshConversations?.();
      } else {
        showToast(data.error || "Failed to cancel order", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error while cancelling order", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopyPhone = () => {
    navigator.clipboard?.writeText(conversation.customerPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAWB = (awb: string) => {
    navigator.clipboard?.writeText(awb);
    setCopiedAWB(true);
    setTimeout(() => setCopiedAWB(false), 2000);
  };

  // Computed status & order details
  const currentStatus = orderData?.delivery_status || orderData?.status || conversation.orderStatus || "Processing";
  const waConfirmStatus = orderData?.whatsapp_confirm_status || (currentStatus === "Pending WhatsApp" ? "pending_whatsapp" : "");
  const awbNumber = orderData?.shiprocket_awb || orderData?.tracking_number;
  const courierPartner = orderData?.courier_partner;
  const isCancelled = currentStatus === "Cancelled" || waConfirmStatus === "cancelled";
  const isConfirmed = waConfirmStatus === "confirmed" || (currentStatus !== "Pending WhatsApp" && currentStatus !== "Cancelled");

  // Parse items
  let parsedItems: any[] = [];
  if (orderData?.items) {
    try {
      parsedItems = typeof orderData.items === "string" ? JSON.parse(orderData.items) : orderData.items;
    } catch (e) {
      parsedItems = [];
    }
  }

  return (
    <div className="relative w-80 lg:w-92 flex flex-col h-full bg-white dark:bg-[#111b21] border-l border-slate-200 dark:border-white/10 overflow-y-auto select-none z-20">
      {/* Top Header */}
      <div className="h-16 px-4 bg-[#f0f2f5] dark:bg-[#202c33] flex items-center justify-between border-b border-slate-200 dark:border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold text-xs text-slate-800 dark:text-white">
            Order Intelligence & Confirmation
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-full hover:bg-slate-200 dark:hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Toast Notification Alert */}
      {toast && (
        <div
          className={`mx-3 mt-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border shadow-md animate-in fade-in slide-in-from-top duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200"
              : "bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span className="flex-1 leading-snug">{toast.message}</span>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Customer Profile Header */}
        {(() => {
          const isPhoneTitle =
            conversation.customerName.includes("(") || /^\+?\d+/.test(conversation.customerName);
          const displayTitle = isPhoneTitle
            ? conversation.customerPhone || conversation.customerName
            : conversation.customerName;

          let initials = "TJ";
          if (!isPhoneTitle && conversation.customerName) {
            const cleanWords = conversation.customerName.replace(/[()+\d-]/g, "").trim().split(/\s+/).filter(Boolean);
            if (cleanWords.length >= 2) {
              initials = (cleanWords[0][0] + cleanWords[1][0]).toUpperCase();
            } else if (cleanWords.length === 1 && cleanWords[0].length >= 2) {
              initials = cleanWords[0].substring(0, 2).toUpperCase();
            }
          }

          return (
            <div className="flex flex-col items-center text-center">
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-lg font-bold mb-2 shadow-xs overflow-hidden">
                {conversation.avatarUrl ? (
                  <Image
                    src={conversation.avatarUrl}
                    alt={conversation.customerName}
                    fill
                    className="object-cover"
                  />
                ) : isPhoneTitle ? (
                  <User className="w-7 h-7 text-white/90" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-full">
                {orderData?.customer_name || displayTitle}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span>{conversation.customerPhone}</span>
                <button
                  onClick={handleCopyPhone}
                  title="Copy phone"
                  className="text-emerald-600 hover:text-emerald-700 p-0.5"
                >
                  <Copy className="w-3 h-3" />
                </button>
                {copied && <span className="text-[10px] text-emerald-500 font-semibold">Copied!</span>}
              </div>
              {conversation.customerEmail && (
                <span className="text-[11px] text-slate-400 mt-0.5 truncate max-w-full">{conversation.customerEmail}</span>
              )}
            </div>
          );
        })()}

        {/* Quick Customer Stats */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-[#f0f2f5] dark:bg-[#202c33] rounded-xl text-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Orders</div>
            <div className="font-bold text-xs text-slate-800 dark:text-white">
              {activeOrderId ? "1" : "0"}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Spend</div>
            <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
              ₹{orderData?.total_amount || conversation.orderTotal || 0}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Status</div>
            <div className="font-bold text-[10px] text-emerald-500 flex items-center justify-center gap-0.5 mt-0.5">
              {isCancelled ? (
                <span className="text-rose-500">Cancelled</span>
              ) : isConfirmed ? (
                <span className="text-emerald-500">Verified</span>
              ) : (
                <span className="text-amber-500">Pending WA</span>
              )}
            </div>
          </div>
        </div>

        {/* Active Order Card */}
        {activeOrderId ? (
          <div className="bg-[#f0f2f5] dark:bg-[#202c33] rounded-2xl p-3.5 border border-slate-200 dark:border-white/5 space-y-3 shadow-xs">
            {/* Order Header & Status Tag */}
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <ShoppingBag className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span
                  title={`Order #${activeOrderId}`}
                  className="font-bold text-xs text-slate-900 dark:text-white font-mono truncate"
                >
                  #{activeOrderId.length > 10 ? `${activeOrderId.substring(0, 8)}...` : activeOrderId}
                </span>
              </div>

              {/* Status Badge */}
              {waConfirmStatus === "pending_whatsapp" ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse">
                  <Clock className="w-3 h-3 text-amber-600" /> Awaiting WA
                </span>
              ) : isCancelled ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200">
                  <X className="w-3 h-3" /> Cancelled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3" /> {currentStatus}
                </span>
              )}
            </div>

            {/* Price & Payment Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Total Payable:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  ₹{orderData?.total_amount || conversation.orderTotal || 899}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Payment:</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                    (orderData?.payment_method || conversation.paymentMethod) === "cod" ||
                    (orderData?.payment_method || "").toLowerCase().includes("cash on delivery")
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {orderData?.payment_method || (conversation.paymentMethod === "cod" ? "COD" : "Prepaid Online")}
                </span>
              </div>

              {/* Items Summary */}
              {parsedItems.length > 0 && (
                <div className="pt-1.5 border-t border-black/5 dark:border-white/10 text-[11px]">
                  <span className="text-slate-400 text-[10px] block font-semibold mb-1">Items in Order:</span>
                  <div className="space-y-1">
                    {parsedItems.map((it: any, i: number) => (
                      <div key={i} className="flex justify-between text-slate-700 dark:text-slate-300">
                        <span className="truncate pr-2">• {it.name || it.product_name || "Turkiye Jam"}</span>
                        <span className="font-mono flex-shrink-0">x{it.quantity || 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              {(orderData?.shipping_address || conversation.shippingAddress) && (
                <div className="pt-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
                    <MapPin className="w-3 h-3 text-emerald-600" /> Delivery Address:
                  </div>
                  <p className="line-clamp-2 leading-tight text-slate-700 dark:text-slate-300">
                    {orderData?.shipping_address || conversation.shippingAddress}
                  </p>
                </div>
              )}

              {/* AWB & Tracking Pill */}
              {awbNumber && (
                <div className="mt-2 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-blue-700 dark:text-blue-300 font-semibold">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> {courierPartner || "Express Courier"}
                    </span>
                    <button
                      onClick={() => handleCopyAWB(awbNumber)}
                      className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
                    >
                      {copiedAWB ? "Copied!" : "Copy AWB"}
                    </button>
                  </div>
                  <div className="font-mono text-xs text-slate-800 dark:text-white font-bold">
                    {awbNumber}
                  </div>
                  <a
                    href={`https://turkiyejam.com/track-order?awb=${encodeURIComponent(awbNumber)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold pt-0.5"
                  >
                    Track Package Live <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* WHATSAPP ORDER CONFIRMATION & FULFILLMENT ACTIONS */}
            {/* ======================================================== */}
            <div className="pt-2.5 border-t border-black/5 dark:border-white/10 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Order Confirmation Actions</span>
                {loadingOrder && <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />}
              </div>

              {/* 1. Resend WhatsApp Buttons */}
              <button
                type="button"
                onClick={handleResendWAButtons}
                disabled={actionLoading !== null || isCancelled}
                className="w-full px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-between transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  {actionLoading === "resend" ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <MessageCircle className="w-4 h-4 text-white" />
                  )}
                  <span className="text-left leading-tight">
                    <span className="block font-bold">Resend WA Buttons</span>
                    <span className="block text-[10px] text-emerald-100 font-normal">Interactive [Confirm] & [Cancel]</span>
                  </span>
                </div>
              </button>

              {/* 2. Manual Confirm Order */}
              <button
                type="button"
                onClick={handleManualConfirmOrder}
                disabled={actionLoading !== null || isCancelled}
                className="w-full px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-between transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  {actionLoading === "confirm" ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  )}
                  <span className="text-left leading-tight">
                    <span className="block font-bold">Manual Confirm Order</span>
                    <span className="block text-[10px] text-blue-100 font-normal">Verify & send normal WA confirmation</span>
                  </span>
                </div>
              </button>

              {/* 3. Generate Shiprocket AWB */}
              <button
                type="button"
                onClick={handleGenerateAWB}
                disabled={actionLoading !== null || isCancelled}
                className="w-full px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center justify-between transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  {actionLoading === "awb" ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Truck className="w-4 h-4 text-white" />
                  )}
                  <span className="text-left leading-tight">
                    <span className="block font-bold">Generate Shiprocket AWB</span>
                    <span className="block text-[10px] text-purple-100 font-normal">Book shipment & send tracking</span>
                  </span>
                </div>
              </button>

              {/* 4. Cancel Order Button */}
              {!isCancelled && (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  disabled={actionLoading !== null}
                  className="w-full px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="text-left leading-tight">
                    <span className="block font-bold">Cancel Order</span>
                    <span className="block text-[10px] text-rose-500/80 font-normal">With reason & WhatsApp alert</span>
                  </span>
                </button>
              )}
            </div>

            {/* Link to Orders ERP */}
            <Link
              href={`/admin/orders?search=${encodeURIComponent(activeOrderId)}`}
              className="block text-center pt-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              Open in ERP Orders Manager <ExternalLink className="w-3 h-3 inline ml-0.5" />
            </Link>
          </div>
        ) : (
          <div className="p-3 bg-[#f0f2f5] dark:bg-[#202c33] rounded-2xl text-center space-y-1">
            <ShoppingBag className="w-6 h-6 text-slate-400 mx-auto mb-1 opacity-60" />
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No Active Order Linked
            </div>
            <p className="text-[11px] text-slate-400">
              This contact is chatting for inquiries or product support.
            </p>
          </div>
        )}

        {/* 1-Click Canned Actions */}
        <div className="space-y-2 pt-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Quick WhatsApp Triggers
          </div>

          {/* Primary Malayalam Pricing & Inquiry Trigger */}
          <button
            onClick={() => onSendQuickTemplate("malayalam_pricing_inquiry")}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-bold text-emerald-900 dark:text-emerald-300 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">🌿</span>
              <span>മലയാളം പാക്ക് വിവരങ്ങൾ & വില</span>
            </div>
            <Send className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {activeOrderId ? (
            <>
              <button
                onClick={() => onSendQuickTemplate("order_confirmation_cod")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#202c33] border border-slate-200 dark:border-white/5 hover:border-emerald-500 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <span>Send COD Confirmation Request</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </button>
              <button
                onClick={() => onSendQuickTemplate("order_dispatched_awb")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#202c33] border border-slate-200 dark:border-white/5 hover:border-blue-500 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <span>Send Tracking & AWB Notification</span>
                <Truck className="w-4 h-4 text-blue-500" />
              </button>
              <button
                onClick={() => onSendQuickTemplate("ndr_reattempt_address")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#202c33] border border-slate-200 dark:border-white/5 hover:border-amber-500 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <span>Send NDR Reattempt Request</span>
                <RotateCcw className="w-4 h-4 text-amber-500" />
              </button>
              <button
                onClick={() => onSendQuickTemplate("abandoned_cart_discount")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#202c33] border border-slate-200 dark:border-white/5 hover:border-purple-500 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <span>Send Instant ₹100 Coupon</span>
                <Tag className="w-4 h-4 text-purple-500" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onSendQuickTemplate("catalog_products")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#202c33] border border-slate-200 dark:border-white/5 hover:border-emerald-500 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <span>Send Store Catalog & Products</span>
                <ShoppingBag className="w-4 h-4 text-emerald-500" />
              </button>
              <button
                onClick={() => onSendQuickTemplate("abandoned_cart_discount")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#202c33] border border-slate-200 dark:border-white/5 hover:border-purple-500 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <span>Send Instant ₹100 Coupon (TURKIYE100)</span>
                <Tag className="w-4 h-4 text-purple-500" />
              </button>
              <button
                onClick={() => onSendQuickTemplate("usage_guide")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#202c33] border border-slate-200 dark:border-white/5 hover:border-amber-500 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <span>Send Usage Guide & Instructions</span>
                <BookOpen className="w-4 h-4 text-amber-500" />
              </button>
              <button
                onClick={() => onSendQuickTemplate("care_greeting")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#202c33] border border-slate-200 dark:border-white/5 hover:border-blue-500 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <span>Send Customer Care Greeting</span>
                <MessageSquare className="w-4 h-4 text-blue-500" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* CANCEL ORDER MODAL */}
      {/* ======================================================== */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#233138] rounded-2xl shadow-2xl max-w-sm w-full p-4 border border-slate-200 dark:border-white/10 space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" /> Cancel Order #{activeOrderId?.substring(0, 8)}
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to cancel this order? This will update the ERP order status, restore stock, and dispatch an automated cancellation WhatsApp notification.
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-200 block">
                Cancellation Reason:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2 bg-[#f0f2f5] dark:bg-[#111b21] rounded-xl border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-white focus:outline-hidden"
              >
                <option value="Customer requested cancellation via WhatsApp">Customer requested cancellation via WhatsApp</option>
                <option value="Customer rejected order on confirmation call">Customer rejected order on confirmation call</option>
                <option value="Duplicate order placed by customer">Duplicate order placed by customer</option>
                <option value="Fake / test order">Fake / test order</option>
                <option value="Product out of stock / delivery unserviceable">Product out of stock / unserviceable pin</option>
                <option value="Other reason">Other reason</option>
              </select>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-200 block">
                Additional Notes (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Customer changed mind or wrong address"
                value={cancelNotes}
                onChange={(e) => setCancelNotes(e.target.value)}
                className="w-full p-2 bg-[#f0f2f5] dark:bg-[#111b21] rounded-xl border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-white focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-black/5 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelOrder}
                disabled={actionLoading === "cancel"}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center justify-center gap-1.5"
              >
                {actionLoading === "cancel" ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
