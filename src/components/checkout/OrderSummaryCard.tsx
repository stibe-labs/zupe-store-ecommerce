"use client";

import React from "react";
import Image from "next/image";
import { Loader2, Minus, Package, Plus, ShieldCheck, Tag, Trash2, X } from "lucide-react";

export interface CheckoutCartItem {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  original_price?: number;
  quantity: number;
  poster_image: string;
  bundle_tier?: number;
  bundle_savings?: number;
  bundle_total?: number;
  offer_label?: string;
}

interface OrderSummaryCardProps {
  cart: CheckoutCartItem[];
  outOfStockItemIds: string[];
  totalItemCount: number;
  subtotal: number;
  regularSubtotal: number;
  bundleSavings: number;
  promoCode: string;
  onPromoCodeChange: (val: string) => void;
  onApplyPromo: () => void;
  onRemovePromo: () => void;
  appliedPromo: string | null;
  promoDiscount: number;
  promoLoading: boolean;
  promoError: string | null;
  promoSuccess: string | null;
  isFreeDelivery: boolean;
  baseShippingFee: number;
  standardShippingFee: number;
  paymentMethod: "online" | "cod";
  codAdvanceAmount: number;
  onlineGrandTotal: number;
  codGrandTotal: number;
  codDoorstepBalance: number;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  desktopActionSlot?: React.ReactNode;
}

export function OrderSummaryCard({
  cart,
  outOfStockItemIds,
  totalItemCount,
  subtotal,
  regularSubtotal,
  bundleSavings,
  promoCode,
  onPromoCodeChange,
  onApplyPromo,
  onRemovePromo,
  appliedPromo,
  promoDiscount,
  promoLoading,
  promoError,
  promoSuccess,
  isFreeDelivery,
  baseShippingFee,
  standardShippingFee,
  paymentMethod,
  codAdvanceAmount,
  onlineGrandTotal,
  codGrandTotal,
  codDoorstepBalance,
  onUpdateQuantity,
  onRemoveItem,
  desktopActionSlot,
}: OrderSummaryCardProps) {
  const isCod = paymentMethod === "cod";

  return (
    <div className="space-y-5">
      {/* Cart Items */}
      <div className="space-y-3.5">
        {cart.map((item) => {
          const isBundle = Boolean(item.bundle_tier && item.bundle_tier > 1);
          const itemTotal =
            isBundle && item.bundle_total ? item.bundle_total : item.price * item.quantity;
          const itemBaseUnit = item.original_price || item.price;
          const itemRegularTotal = itemBaseUnit * item.quantity;
          const isOos = outOfStockItemIds.includes(item.id);

          return (
            <div
              key={item.id}
              className={`flex items-start gap-3 ${
                isOos ? "p-2.5 rounded-xl bg-rose-50/70 border border-rose-200" : ""
              }`}
            >
              <div className="relative w-14 h-14 rounded-xl bg-[#F6F1EA] border border-stone-200/80 shrink-0 overflow-hidden">
                <Image
                  src={item.poster_image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-[#1B1714] leading-snug line-clamp-2">
                    {item.name}
                  </p>
                  <div className="text-right shrink-0 tabular-nums">
                    {isBundle && itemRegularTotal > itemTotal && (
                      <span className="text-[11px] text-[#8C8177] line-through block">
                        ₹{itemRegularTotal.toLocaleString("en-IN")}
                      </span>
                    )}
                    <span className="text-sm font-semibold text-[#1B1714] block">
                      ₹{itemTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {isBundle && item.offer_label && (
                  <p className="text-[11px] font-medium text-[#116A4B] mt-0.5">
                    {item.offer_label}
                  </p>
                )}

                {isOos && (
                  <p className="text-[11px] font-medium text-rose-700 mt-1">
                    Currently out of stock — remove to continue
                  </p>
                )}

                {/* Quantity Controls + Remove */}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="inline-flex items-center rounded-lg border border-stone-200/90 bg-[#FBF8F3]">
                    <button
                      type="button"
                      onClick={() =>
                        item.quantity > 1
                          ? onUpdateQuantity(item.id, item.quantity - 1)
                          : onRemoveItem(item.id)
                      }
                      aria-label={`Decrease quantity of ${item.name}`}
                      className="w-9 h-9 flex items-center justify-center text-[#655B53] hover:text-[#1B1714] transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center text-xs font-semibold text-[#1B1714] tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      aria-label={`Increase quantity of ${item.name}`}
                      className="w-9 h-9 flex items-center justify-center text-[#655B53] hover:text-[#1B1714] transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="min-w-[36px] min-h-[36px] px-2 inline-flex items-center justify-center gap-1 rounded-lg text-xs text-[#8C8177] hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="sr-only sm:not-sr-only">Remove</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Promo Code */}
      <div className="pt-4 border-t border-stone-200/70 space-y-2">
        {appliedPromo ? (
          <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-[#ECF7F2] border border-[#CBE8DA] text-xs text-[#116A4B]">
            <div className="flex items-center gap-2 min-w-0">
              <Tag className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium truncate">
                {appliedPromo} applied (−₹{promoDiscount.toLocaleString("en-IN")})
              </span>
            </div>
            <button
              type="button"
              onClick={onRemovePromo}
              aria-label="Remove promo code"
              className="p-1.5 rounded-md hover:bg-[#116A4B]/10 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Tag className="w-4 h-4 text-[#8C8177] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={promoCode}
                onChange={(e) => onPromoCodeChange(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onApplyPromo();
                  }
                }}
                placeholder="Promo code"
                aria-label="Promo code"
                className="w-full min-h-[44px] pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-base sm:text-sm text-[#1B1714] placeholder:text-[#8C8177] focus:outline-none focus:border-[#1B1714] transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={onApplyPromo}
              disabled={promoLoading || !promoCode.trim()}
              className="min-h-[44px] px-4 rounded-xl bg-[#F3EDE5] hover:bg-[#E8DFD3] text-[#1B1714] text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
            </button>
          </div>
        )}
        {promoError && (
          <p role="alert" className="text-xs text-rose-700 pl-0.5">
            {promoError}
          </p>
        )}
        {promoSuccess && !appliedPromo && (
          <p className="text-xs text-[#116A4B] pl-0.5">{promoSuccess}</p>
        )}
      </div>

      {/* Totals Ledger */}
      <div className="pt-4 border-t border-stone-200/70 space-y-2.5 text-sm tabular-nums">
        <div className="flex items-center justify-between text-[#655B53]">
          <span>
            Items ({totalItemCount})
          </span>
          <span className="font-medium text-[#1B1714]">
            ₹{(bundleSavings > 0 ? regularSubtotal : subtotal).toLocaleString("en-IN")}
          </span>
        </div>

        {bundleSavings > 0 && (
          <div className="flex items-center justify-between text-[#116A4B]">
            <span>Pack savings</span>
            <span className="font-medium">−₹{bundleSavings.toLocaleString("en-IN")}</span>
          </div>
        )}

        {promoDiscount > 0 && (
          <div className="flex items-center justify-between text-[#116A4B]">
            <span>Promo ({appliedPromo})</span>
            <span className="font-medium">−₹{promoDiscount.toLocaleString("en-IN")}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-[#655B53]">
          <span>Express delivery</span>
          {isFreeDelivery ? (
            <span className="font-medium text-[#116A4B]">
              Free{standardShippingFee > 0 ? ` (saved ₹${standardShippingFee})` : ""}
            </span>
          ) : (
            <span className="font-medium text-[#1B1714]">
              ₹{baseShippingFee.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {isCod && (
          <div className="flex items-center justify-between text-[#655B53]">
            <span>COD handling fee</span>
            <span className="font-medium text-[#1B1714]">
              ₹{codAdvanceAmount.toLocaleString("en-IN")}
            </span>
          </div>
        )}

        <div className="pt-3 border-t border-stone-200/80 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-sm font-semibold text-[#1B1714]">
                {isCod ? "Total order value" : "Total payable"}
              </span>
              <span className="block text-[11px] text-[#8C8177]">
                Inclusive of all taxes
              </span>
            </div>
            <span className="text-xl font-semibold text-[#1B1714]">
              ₹{(isCod ? codGrandTotal : onlineGrandTotal).toLocaleString("en-IN")}
            </span>
          </div>

          {isCod && (
            <div className="p-3 rounded-xl bg-[#FBF8F3] border border-stone-200/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#655B53]">Pay online now to confirm</span>
                <span className="font-semibold text-[#6E1625]">
                  ₹{codAdvanceAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#655B53]">Pay at doorstep (Cash or UPI)</span>
                <span className="font-semibold text-[#1B1714]">
                  ₹{codDoorstepBalance.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Pay CTA Slot */}
      {desktopActionSlot && <div className="pt-1">{desktopActionSlot}</div>}

      {/* Single Honest Signature Assurance: Discreet Packaging */}
      <div className="pt-3 border-t border-stone-200/70 flex items-start gap-2.5 text-xs text-[#655B53]">
        <Package className="w-4 h-4 text-[#6E1625] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-medium text-[#1B1714]">Discreet unbranded box.</span>{" "}
          Plain outer parcel with no product name or brand hint on the shipping label.
        </p>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-[#8C8177]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#116A4B] shrink-0" />
        <span>Encrypted payment processed by PyDart Pay</span>
      </div>
    </div>
  );
}
