"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { QuickBuyAuthDrawer } from "@/components/QuickBuyAuthDrawer";

export function GlobalQuickBuyDrawer() {
  const { isQuickBuyOpen, quickBuyOptions, closeQuickBuy, clearCart } = useCart();

  if (!isQuickBuyOpen || !quickBuyOptions) return null;

  return (
    <QuickBuyAuthDrawer
      isOpen={isQuickBuyOpen}
      onClose={closeQuickBuy}
      product={quickBuyOptions.product}
      bundle={quickBuyOptions.bundle}
      quantity={quickBuyOptions.quantity || 1}
      items={quickBuyOptions.items}
      initialMethod={quickBuyOptions.initialMethod || "upi"}
      onSuccess={(_phone, _orderId) => {
        if (quickBuyOptions.items && quickBuyOptions.items.length > 0) {
          clearCart();
        }
      }}
    />
  );
}
