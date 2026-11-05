"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { WhatsAppConversation } from "@/lib/whatsappStore";

interface CustomerOrderDrawerProps {
  conversation: WhatsAppConversation;
  onClose: () => void;
  onUpdateOrderStatus: (orderId: string, status: string) => void;
  onSendQuickTemplate: (type: string) => void;
}

export default function CustomerOrderDrawer({
  conversation,
  onClose,
  onUpdateOrderStatus,
  onSendQuickTemplate,
}: CustomerOrderDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(conversation.orderStatus || "Processing");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCopyPhone = () => {
    navigator.clipboard?.writeText(conversation.customerPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!conversation.orderId) return;
    setIsUpdating(true);
    try {
      await onUpdateOrderStatus(conversation.orderId, newStatus);
      setCurrentStatus(newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-80 lg:w-88 flex flex-col h-full bg-white dark:bg-[#111b21] border-l border-slate-200 dark:border-white/10 overflow-y-auto select-none z-20">
      {/* Top Header */}
      <div className="h-16 px-4 bg-[#f0f2f5] dark:bg-[#202c33] flex items-center justify-between border-b border-slate-200 dark:border-white/10 flex-shrink-0">
        <span className="font-semibold text-xs text-slate-800 dark:text-white">
          Customer & Order Intelligence
        </span>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-full hover:bg-slate-200 dark:hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-5">
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
              <div className="relative w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xl font-bold mb-2 shadow-md overflow-hidden">
                {conversation.avatarUrl ? (
                  <Image
                    src={conversation.avatarUrl}
                    alt={conversation.customerName}
                    fill
                    className="object-cover"
                  />
                ) : isPhoneTitle ? (
                  <User className="w-8 h-8 text-white/90" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {displayTitle}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
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
                <span className="text-xs text-slate-400 mt-0.5">{conversation.customerEmail}</span>
              )}
            </div>
          );
        })()}

        {/* Quick Customer Stats */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-[#f0f2f5] dark:bg-[#202c33] rounded-xl text-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Orders</div>
            <div className="font-bold text-sm text-slate-800 dark:text-white">
              {conversation.orderId ? "1" : "0"}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Spend</div>
            <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
              ₹{conversation.orderId ? (conversation.orderTotal || 899) : 0}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">RTO Risk</div>
            <div className="font-bold text-xs text-emerald-500 flex items-center justify-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> {conversation.orderId ? "Safe" : "New Contact"}
            </div>
          </div>
        </div>

        {/* Active Order Card */}
        {conversation.orderId && (
          <div className="bg-[#f0f2f5] dark:bg-[#202c33] rounded-2xl p-4 border border-slate-200 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <ShoppingBag className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span
                  title={`Order #${conversation.orderId}`}
                  className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[140px]"
                >
                  Order #{conversation.orderId.length > 10 ? `${conversation.orderId.substring(0, 8)}...` : conversation.orderId}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex-shrink-0">
                {currentStatus}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Due:</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  ₹{conversation.orderTotal || 1099}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment:</span>
                <span className="font-medium uppercase text-[11px] text-emerald-600 dark:text-emerald-400">
                  {conversation.paymentMethod === "cod" ? "Cash on Delivery" : "Prepaid Online"}
                </span>
              </div>
              {conversation.shippingAddress && (
                <div className="pt-1 text-slate-600 dark:text-slate-300">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
                    <MapPin className="w-3 h-3" /> Delivery Address:
                  </div>
                  <p className="text-[11px] leading-relaxed line-clamp-3">
                    {conversation.shippingAddress}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Status Update Selector */}
            <div className="pt-2 border-t border-black/5 dark:border-white/10">
              <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Update Order Status:
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  disabled={isUpdating}
                  onClick={() => handleStatusChange("Confirmed")}
                  className="py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-center transition-colors"
                >
                  Mark Confirmed
                </button>
                <button
                  disabled={isUpdating}
                  onClick={() => handleStatusChange("In Transit")}
                  className="py-1 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-center transition-colors"
                >
                  Mark In Transit
                </button>
                <button
                  disabled={isUpdating}
                  onClick={() => handleStatusChange("Delivered")}
                  className="py-1 px-2 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white font-medium text-center transition-colors"
                >
                  Mark Delivered
                </button>
                <button
                  disabled={isUpdating}
                  onClick={() => handleStatusChange("Cancelled")}
                  className="py-1 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/30 font-medium text-center transition-colors"
                >
                  Cancel Order
                </button>
              </div>
            </div>

            {/* Link to Orders ERP */}
            <Link
              href={`/admin/orders?search=${encodeURIComponent(conversation.orderId)}`}
              className="block text-center py-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              Open in ERP Orders Manager <ExternalLink className="w-3 h-3 inline ml-0.5" />
            </Link>
          </div>
        )}

        {/* 1-Click Canned Actions */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Quick WhatsApp Triggers
          </div>

          {conversation.orderId ? (
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
    </div>
  );
}

