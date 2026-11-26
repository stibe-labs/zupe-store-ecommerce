"use client";

import React from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface CardAddToCartProduct {
  id: string;
  slug?: string;
  name: string;
  price: number;
  mrp?: number;
  offer_price?: number;
  stock_count?: number;
  poster_image?: string;
  image?: string;
  in_stock?: number | boolean;
  category?: string;
  tagline?: string;
  description?: string;
}

interface CardAddToCartControlProps {
  product: CardAddToCartProduct;
  onAfterAdd?: () => void;
  className?: string;
}

export function CardAddToCartControl({
  product,
  onAfterAdd,
  className = "",
}: CardAddToCartControlProps) {
  const { cart, addItem, updateQuantity } = useCart();

  // Find matching item in cart (supports both exact id and slug fallback)
  const cartItem = cart.find(
    (item) => item.id === product.id || (product.slug && item.id === product.slug)
  );
  const qty = cartItem?.quantity ?? 0;

  const isOutOfStock =
    product.in_stock === 0 ||
    product.in_stock === false ||
    (product.stock_count !== undefined && product.stock_count <= 0);

  const handleFirstAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addItem(
      {
        id: product.id,
        slug: product.slug || product.id,
        name: product.name,
        price: product.price,
        mrp: product.mrp,
        offer_price: product.offer_price ?? product.price,
        stock_count: product.stock_count ?? 50,
        poster_image:
          product.poster_image ||
          product.image ||
          "/vittal/product-whey-protein-jar.png",
        in_stock: product.in_stock ?? 1,
        category: product.category || "Vittal Lifestyle",
        tagline: product.tagline || "",
        description: product.description || "",
      },
      1
    );
    onAfterAdd?.();
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cartItem) return;
    updateQuantity(cartItem.id, qty - 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cartItem) return;
    const maxStock = product.stock_count && product.stock_count > 0 ? product.stock_count : 99;
    if (qty >= maxStock) return;
    updateQuantity(cartItem.id, qty + 1);
  };

  if (qty > 0) {
    return (
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className={`inline-flex items-center justify-between rounded-xl bg-[#0B5D44] text-white shadow-sm min-h-[34px] h-[34px] px-0.5 select-none shrink-0 animate-[vl80-badge-pop_220ms_cubic-bezier(0.34,1.56,0.64,1)] ${className}`}
        role="group"
        aria-label={`Quantity controls for ${product.name}`}
      >
        <button
          type="button"
          onClick={handleDecrement}
          aria-label={`Decrease quantity of ${product.name}`}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-[#074230] active:scale-90 transition-all cursor-pointer"
        >
          <Minus className="w-3.5 h-3.5 stroke-[2.6]" />
        </button>

        <span
          key={qty}
          aria-live="polite"
          className="min-w-[22px] text-center text-xs font-extrabold tabular-nums leading-none px-0.5 animate-[vl80-badge-pop_200ms_cubic-bezier(0.34,1.56,0.64,1)]"
        >
          {qty}
        </span>

        <button
          type="button"
          onClick={handleIncrement}
          aria-label={`Increase quantity of ${product.name}`}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-[#074230] active:scale-90 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.6]" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleFirstAdd}
      disabled={isOutOfStock}
      className={`px-3 py-1.5 min-h-[34px] h-[34px] rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 shrink-0 flex items-center gap-1.5 cursor-pointer ${
        isOutOfStock
          ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
          : "bg-[#0C1412] hover:bg-[#0B5D44] text-white"
      } ${className}`}
      title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
      aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to Cart`}
    >
      <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
      <span>{isOutOfStock ? "Sold Out" : "Add"}</span>
    </button>
  );
}
