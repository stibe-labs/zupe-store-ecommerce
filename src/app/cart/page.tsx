"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Tag,
  Lock,
  Loader2,
  X,
  Heart,
  Check,
  AlertTriangle,
  Undo2,
  CreditCard,
  PackageCheck,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart, type CartItem } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { CardAddToCartControl } from "@/components/CardAddToCartControl";
import {
  BRAND_80_THEMES,
  Logo80AnimatedMark,
} from "@/components/Logo80AnimatedMark";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

interface UndoEntry {
  item: CartItem;
  reason: "removed" | "saved";
}

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    addItem,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    savings: contextSavings,
    totalItems,
    freeShippingThreshold,
    freeShippingRemaining,
    outOfStockItemIds,
    hasOutOfStockItems,
    checkCartStock,
  } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableOffers, setAvailableOffers] = useState<any[]>([]);
  const [undoEntry, setUndoEntry] = useState<UndoEntry | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const grandTotal = Math.max(0, subtotal - discount + shippingFee);
  const bagMrp = subtotal + contextSavings;
  const totalSavings = contextSavings + discount + (shippingFee === 0 && subtotal > 0 ? 99 : 0);
  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  // Check inventory once when visiting /cart
  useEffect(() => {
    if (cart.length > 0) {
      checkCartStock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.length]);

  // Cleanup Undo timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const triggerUndoToast = useCallback((entry: UndoEntry) => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoEntry(entry);
    undoTimerRef.current = setTimeout(() => {
      setUndoEntry(null);
    }, 6000);
  }, []);

  const handleRemoveWithUndo = useCallback(
    (item: CartItem) => {
      removeFromCart(item.id);
      triggerUndoToast({ item, reason: "removed" });
    },
    [removeFromCart, triggerUndoToast]
  );

  const handleSaveForLater = useCallback(
    (item: CartItem) => {
      if (!isInWishlist(item.id)) {
        toggleWishlist({
          id: item.id,
          name: item.name,
          subtitle: item.subtitle,
          category: item.category,
          price: item.price,
          mrp: item.mrp || Math.round(item.price * 1.25),
          poster_image: item.poster_image,
        });
      }
      removeFromCart(item.id);
      triggerUndoToast({ item, reason: "saved" });
    },
    [isInWishlist, toggleWishlist, removeFromCart, triggerUndoToast]
  );

  const handleUndoRestore = useCallback(() => {
    if (!undoEntry) return;
    addItem(undoEntry.item, undoEntry.item.quantity, { overrideQuantity: true });
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoEntry(null);
  }, [undoEntry, addItem]);

  const fetchOffers = useCallback(async (currentSubtotal: number) => {
    try {
      const res = await fetch(`/api/promo-codes?subtotal=${currentSubtotal}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.offers)) {
        setAvailableOffers(data.offers);
      }
    } catch {
      // Non-blocking
    }
  }, []);

  const validateAndApplyPromo = useCallback(
    async (codeToApply: string, notifyOnError = true) => {
      const cleanCode = codeToApply.trim().toUpperCase();
      if (!cleanCode) {
        if (notifyOnError) setCouponError("Please enter a valid promo code");
        return;
      }

      setCouponLoading(true);
      setCouponError("");
      setCouponSuccess("");

      try {
        const res = await fetch("/api/promo-codes/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: cleanCode,
            subtotal,
            items: cart.map((c) => ({
              id: c.id,
              name: c.name,
              price:
                c.bundle_tier && c.bundle_tier > 1 && c.bundle_total
                  ? Math.round(c.bundle_total / c.quantity)
                  : c.price,
              quantity: c.quantity,
            })),
          }),
        });

        const data = await res.json();
        if (data.valid && data.discount > 0) {
          setDiscount(data.discount);
          setCouponApplied(true);
          setAppliedPromoCode(data.code || cleanCode);
          setCouponCode(data.code || cleanCode);
          setCouponSuccess(
            data.message ||
              `Code ${data.code || cleanCode} applied — you save ₹${data.discount.toLocaleString("en-IN")}`
          );
          setCouponError("");
          if (typeof window !== "undefined") {
            localStorage.setItem("vittal_applied_promo", data.code || cleanCode);
          }
        } else {
          setDiscount(0);
          setCouponApplied(false);
          setAppliedPromoCode(null);
          if (notifyOnError) {
            setCouponError(data.error || `Promo code "${cleanCode}" is not eligible for this bag.`);
          }
          setCouponSuccess("");
          if (typeof window !== "undefined") {
            localStorage.removeItem("vittal_applied_promo");
          }
        }
      } catch {
        if (cleanCode === "VITTAL10" || cleanCode === "WELCOME10") {
          const disc = Math.min(250, Math.round(subtotal * 0.1));
          setDiscount(disc);
          setCouponApplied(true);
          setAppliedPromoCode(cleanCode);
          setCouponCode(cleanCode);
          setCouponSuccess(`Code ${cleanCode} applied — you save ₹${disc.toLocaleString("en-IN")}`);
          if (typeof window !== "undefined") {
            localStorage.setItem("vittal_applied_promo", cleanCode);
          }
        } else if (notifyOnError) {
          setCouponError("Unable to validate promo code right now. Please try again.");
        }
      } finally {
        setCouponLoading(false);
      }
    },
    [cart, subtotal]
  );

  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    validateAndApplyPromo(couponCode, true);
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setCouponApplied(false);
    setAppliedPromoCode(null);
    setCouponCode("");
    setCouponSuccess("");
    setCouponError("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("vittal_applied_promo");
    }
  };

  useEffect(() => {
    if (subtotal > 0) {
      fetchOffers(subtotal);
    }
  }, [subtotal, fetchOffers]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCode = localStorage.getItem("vittal_applied_promo");
      if (savedCode && !couponApplied && subtotal > 0) {
        validateAndApplyPromo(savedCode, false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  // Curated cross-sell / recovery bestsellers (excludes products already in cart)
  const suggestedProducts = useMemo(() => {
    const inCartIds = new Set(cart.map((c) => c.id));
    return DEFAULT_PRODUCTS.filter(
      (p) => !inCartIds.has(p.id) && p.in_stock !== 0
    ).slice(0, 4);
  }, [cart]);

  const handleProceedToCheckout = () => {
    if (hasOutOfStockItems) return;
    router.push("/checkout");
  };

  // =========================================================================
  // EMPTY BAG SCREEN (Studio Presentation + Instant Recovery Bestsellers)
  // =========================================================================
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFBF9] text-[#0C1412] flex flex-col justify-between selection:bg-[#E6F4EF] selection:text-[#0C1412] font-mograph">
        <Navbar />

        <main className="flex-1 max-w-[1380px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          {/* Empty State Studio Card */}
          <div className="max-w-xl mx-auto bg-white rounded-[28px] p-8 sm:p-11 border border-neutral-200/80 shadow-[0_8px_30px_rgba(7,20,16,0.04)] text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#F3FAF7] border border-[#B8DFD1] flex items-center justify-center shadow-xs">
              <Logo80AnimatedMark
                theme={BRAND_80_THEMES[0]}
                surface="light"
                mode="ambient"
                size={50}
              />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3FAF7] border border-[#B8DFD1]/80 text-[11px] font-bold text-[#0B5D44] uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Original Marketplace
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#0C1412] tracking-tight">
              Your Shopping Bag is Empty
            </h1>
            <p className="mt-2.5 text-sm text-neutral-600 leading-relaxed max-w-md mx-auto">
              Discover 100% original global nutrition, athletic apparel, royal dates, and gourmet chocolates — with free insured express delivery on orders above ₹1,499.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#0B5D44] hover:bg-[#074230] text-white font-bold text-sm shadow-md shadow-[#0B5D44]/20 transition-all"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4 stroke-[2.25]" />
              </Link>
              <Link
                href="/order-tracking"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#F5F8F6] text-[#0C1412] border border-neutral-300 font-semibold text-sm transition-all"
              >
                <span>Track an Existing Order</span>
              </Link>
            </div>
          </div>

          {/* Instant Recovery: Popular Bestsellers Grid */}
          {suggestedProducts.length > 0 && (
            <section className="mt-14 sm:mt-16" aria-labelledby="empty-cart-bestsellers">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0B5D44]">
                    Quick Add Essentials
                  </span>
                  <h2
                    id="empty-cart-bestsellers"
                    className="text-xl sm:text-2xl font-bold text-[#0C1412] tracking-tight mt-0.5"
                  >
                    Popular Bestsellers
                  </h2>
                </div>
                <Link
                  href="/products"
                  className="text-xs sm:text-sm font-bold text-[#0B5D44] hover:text-[#074230] inline-flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
                {suggestedProducts.map((product) => {
                  const mrp = product.mrp || Math.round(product.price * 1.25);
                  const pct = mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100) : 0;
                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-3xl border border-neutral-200/80 hover:border-[#0B5D44]/40 hover:shadow-[0_12px_30px_rgba(7,20,16,0.06)] transition-all p-3 sm:p-4 flex flex-col justify-between"
                    >
                      <Link href={`/products/${product.id}`} className="block">
                        <div className="relative aspect-square rounded-2xl bg-[#F5F8F6] overflow-hidden mb-3">
                          <Image
                            src={product.poster_image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-contain p-3.5 group-hover:scale-105 transition-transform duration-500"
                          />
                          {pct > 0 && (
                            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-white/95 border border-neutral-200 text-[10px] font-bold text-[#0B5D44] tabular-nums">
                              {pct}% OFF
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#0B5D44]">
                          {product.category}
                        </p>
                        <h3 className="text-xs sm:text-sm font-bold text-[#0C1412] line-clamp-2 mt-0.5 leading-snug group-hover:text-[#0B5D44] transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-sm sm:text-base font-extrabold text-[#0C1412] tabular-nums">
                            ₹{product.price.toLocaleString("en-IN")}
                          </span>
                          {mrp > product.price && (
                            <span className="ml-1.5 text-[11px] text-neutral-400 line-through tabular-nums">
                              ₹{mrp.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                        <CardAddToCartControl
                          product={{
                            id: product.id,
                            name: product.name,
                            category: product.category,
                            price: product.price,
                            mrp,
                            poster_image: product.poster_image,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </main>

        {/* Undo Toast (even when cart just became empty!) */}
        {undoEntry && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md bg-[#071410] text-white rounded-2xl px-4 py-3 shadow-2xl border border-white/15 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">
                {undoEntry.reason === "saved"
                  ? `Saved "${undoEntry.item.name}" to Wishlist`
                  : `Removed "${undoEntry.item.name}"`}
              </p>
            </div>
            <button
              type="button"
              onClick={handleUndoRestore}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B5D44] hover:bg-[#10B981] hover:text-[#071410] text-white text-xs font-bold transition-colors shrink-0 cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          </div>
        )}

        <Footer />
      </div>
    );
  }

  // =========================================================================
  // DEDICATED FLAGSHIP SHOPPING BAG SCREEN
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#FAFBF9] text-[#0C1412] flex flex-col justify-between selection:bg-[#E6F4EF] selection:text-[#0C1412] font-mograph pb-24 lg:pb-0">
      <Navbar />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-9 pb-16">
        {/* ─── Top Checkout Progress Stepper + Continue Shopping ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-neutral-200/80">
          <div className="flex items-center justify-between md:justify-start gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-[#0B5D44] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>

          {/* 3-Step Visual Progress (Fits cleanly on 360px+ without horizontal scrollbars) */}
          <ol
            aria-label="Checkout progress"
            className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-3 text-[11px] sm:text-xs font-semibold [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <li className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#0B5D44] text-white shrink-0 shadow-xs">
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold tabular-nums">
                1
              </span>
              <span className="sm:hidden">Bag</span>
              <span className="hidden sm:inline">Shopping Bag</span>
            </li>
            <span className="flex-1 sm:flex-none sm:w-5 h-px bg-neutral-300" aria-hidden="true" />
            <li className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-full text-neutral-600 shrink-0">
              <span className="w-4 h-4 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-[10px] font-bold tabular-nums">
                2
              </span>
              <span className="sm:hidden">Delivery</span>
              <span className="hidden sm:inline">Delivery &amp; Payment</span>
            </li>
            <span className="flex-1 sm:flex-none sm:w-5 h-px bg-neutral-300" aria-hidden="true" />
            <li className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-full text-neutral-400 shrink-0">
              <span className="w-4 h-4 rounded-full bg-neutral-200/70 text-neutral-500 flex items-center justify-center text-[10px] font-bold tabular-nums">
                3
              </span>
              <span className="sm:hidden">Done</span>
              <span className="hidden sm:inline">Confirmed</span>
            </li>
          </ol>
        </div>

        {/* ─── Page Heading & Clear Action ─── */}
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0C1412] tracking-tight">
              Your Shopping Bag
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 tabular-nums">
              {totalItems} {totalItems === 1 ? "item" : "items"} ready for priority dispatch
            </p>
          </div>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-semibold text-neutral-500 hover:text-rose-600 underline underline-offset-4 transition-colors cursor-pointer"
          >
            Clear bag
          </button>
        </div>

        {/* ─── Unified ₹1,499 Free Insured Express Shipping Progress Bar ─── */}
        <div className="mb-7 p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-[0_2px_12px_rgba(7,20,16,0.03)]">
          <div className="flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold mb-2.5">
            <span className="flex items-center gap-2 text-[#0C1412]">
              <span className="w-7 h-7 rounded-full bg-[#E6F4EF] text-[#0B5D44] flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </span>
              {freeShippingRemaining === 0 ? (
                <span className="text-[#074230] font-bold">
                  You&apos;ve unlocked <span className="text-[#0B5D44]">FREE Insured Express Delivery</span> across India
                </span>
              ) : (
                <span>
                  Add{" "}
                  <strong className="text-[#0B5D44] font-extrabold tabular-nums">
                    ₹{freeShippingRemaining.toLocaleString("en-IN")}
                  </strong>{" "}
                  more to unlock{" "}
                  <span className="font-bold text-[#0C1412]">FREE Express Shipping</span>{" "}
                  <span className="text-neutral-500 font-normal">(saves ₹99)</span>
                </span>
              )}
            </span>
            <span className="text-xs font-extrabold text-[#0B5D44] tabular-nums shrink-0">
              {freeShippingProgress}%
            </span>
          </div>
          <div
            className="w-full h-2 rounded-full bg-[#E6F4EF] overflow-hidden"
            role="progressbar"
            aria-valuenow={freeShippingProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Free express shipping progress"
          >
            <div
              className="h-full bg-gradient-to-r from-[#0B5D44] via-[#10B981] to-[#C59B27] transition-all duration-500 ease-out rounded-full"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* ─── Out-of-Stock Alert Banner (if applicable) ─── */}
        {hasOutOfStockItems && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs sm:text-sm text-rose-800 font-semibold">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>
              One or more items in your bag just went out of stock. Please remove them or save them to your wishlist to continue to checkout.
            </span>
          </div>
        )}

        {/* ─── Main 2-Column Workspace (8 Cols Bag + 4 Cols Sticky Summary) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-start">
          {/* LEFT: Bag Items + Complete Your Order */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => {
              const isOos = outOfStockItemIds.includes(item.id);
              const lineTotal =
                item.bundle_tier && item.bundle_tier > 1 && item.bundle_total
                  ? item.bundle_total
                  : item.price * item.quantity;
              const unitMrp = item.mrp || Math.round((item.original_price || item.price) * 1.25);
              const lineMrp = unitMrp * item.quantity;
              const pctOff =
                lineMrp > lineTotal
                  ? Math.round(((lineMrp - lineTotal) / lineMrp) * 100)
                  : 0;

              return (
                <article
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-3xl bg-white border transition-all shadow-[0_2px_14px_rgba(7,20,16,0.03)] hover:shadow-[0_10px_28px_rgba(7,20,16,0.06)] ${
                    isOos ? "border-rose-300 bg-rose-50/20" : "border-neutral-200/80"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                    {/* Clickable Product Studio Image */}
                    <Link
                      href={`/products/${item.id}`}
                      className="relative w-full h-44 sm:w-32 sm:h-32 rounded-2xl bg-[#F5F8F6] border border-neutral-100 overflow-hidden shrink-0 group"
                    >
                      <Image
                        src={item.poster_image || "/vittal/product-whey-protein-jar.png"}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 128px"
                        className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* Item Details & Controls */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#0B5D44]">
                              {item.category || "Lifestyle"}
                            </span>
                            {isOos && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                                Out of Stock
                              </span>
                            )}
                          </div>

                          <Link
                            href={`/products/${item.id}`}
                            className="block font-bold text-base sm:text-[17px] text-[#0C1412] hover:text-[#0B5D44] transition-colors leading-snug mt-0.5"
                          >
                            {item.name}
                          </Link>

                          {(item.subtitle || item.color || item.volume) && (
                            <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                              {[item.subtitle, item.color, item.volume].filter(Boolean).join(" · ")}
                            </p>
                          )}

                          {item.offer_label && (
                            <span className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E6F4EF] text-[#074230] border border-[#B8DFD1]">
                              <Sparkles className="w-3 h-3 text-[#0B5D44]" />
                              {item.offer_label}
                            </span>
                          )}

                          {/* Per-Item Authenticity & Dispatch Assurance */}
                          <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-600">
                            <PackageCheck className="w-3.5 h-3.5 text-[#0B5D44] shrink-0" />
                            <span>100% Original · Sealed &amp; dispatches in 24–48h</span>
                          </p>
                        </div>

                        {/* Line Price Stack */}
                        <div className="flex sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0.5 shrink-0">
                          <span className="text-lg font-extrabold text-[#0C1412] tabular-nums">
                            ₹{lineTotal.toLocaleString("en-IN")}
                          </span>
                          {lineMrp > lineTotal && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-neutral-400 line-through tabular-nums">
                                ₹{lineMrp.toLocaleString("en-IN")}
                              </span>
                              {pctOff > 0 && (
                                <span className="text-[10.5px] font-bold text-[#0B5D44] bg-[#E6F4EF] px-1.5 py-0.5 rounded-md tabular-nums">
                                  {pctOff}% OFF
                                </span>
                              )}
                            </div>
                          )}
                          {item.quantity > 1 && (
                            <span className="text-[11px] text-neutral-500 tabular-nums">
                              ₹{item.price.toLocaleString("en-IN")} each
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Row: Imperial Emerald Stepper + Save for Later + Remove */}
                      <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
                        {/* Unified Imperial Emerald Quantity Stepper */}
                        <div
                          className="inline-flex items-center rounded-full bg-[#0B5D44] text-white h-10 shadow-xs overflow-hidden"
                          role="group"
                          aria-label={`Quantity for ${item.name}`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity <= 1) {
                                handleRemoveWithUndo(item);
                              } else {
                                updateQuantity(item.id, item.quantity - 1);
                              }
                            }}
                            className="w-10 h-10 flex items-center justify-center hover:bg-[#074230] active:scale-95 transition-colors cursor-pointer"
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                          <span className="min-w-[30px] text-center text-xs font-extrabold tabular-nums select-none">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-[#074230] active:scale-95 transition-colors cursor-pointer"
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>

                        {/* Secondary Actions: Save for Later & Remove */}
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveForLater(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-neutral-600 hover:text-[#0B5D44] hover:bg-[#F3FAF7] transition-colors cursor-pointer"
                          >
                            <Heart className="w-3.5 h-3.5" />
                            <span>Save for Later</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveWithUndo(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-neutral-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            aria-label={`Remove ${item.name} from bag`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {/* ─── Complete Your Order Cross-Sell Rail ─── */}
            {suggestedProducts.length > 0 && (
              <section
                className="pt-8 mt-6 border-t border-neutral-200/80"
                aria-labelledby="complete-your-order-heading"
              >
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#0B5D44]">
                      Curated Pairings
                    </span>
                    <h2
                      id="complete-your-order-heading"
                      className="text-lg sm:text-xl font-bold text-[#0C1412] tracking-tight"
                    >
                      Complete Your Order
                    </h2>
                  </div>
                  <Link
                    href="/products"
                    className="text-xs font-bold text-[#0B5D44] hover:text-[#074230] inline-flex items-center gap-1"
                  >
                    <span>Browse All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {suggestedProducts.map((product) => {
                    const mrp = product.mrp || Math.round(product.price * 1.25);
                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-2xl border border-neutral-200/80 hover:border-[#0B5D44]/35 p-3 flex flex-col justify-between transition-all hover:shadow-sm"
                      >
                        <Link href={`/products/${product.id}`} className="block group">
                          <div className="relative aspect-square rounded-xl bg-[#F5F8F6] overflow-hidden mb-2.5">
                            <Image
                              src={product.poster_image}
                              alt={product.name}
                              fill
                              sizes="(max-width: 640px) 45vw, 200px"
                              className="object-contain p-2.5 group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <h3 className="text-xs font-bold text-[#0C1412] line-clamp-2 leading-snug group-hover:text-[#0B5D44] transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between gap-1.5">
                          <span className="text-xs sm:text-sm font-extrabold text-[#0C1412] tabular-nums">
                            ₹{product.price.toLocaleString("en-IN")}
                          </span>
                          <CardAddToCartControl
                            product={{
                              id: product.id,
                              name: product.name,
                              category: product.category,
                              price: product.price,
                              mrp,
                              poster_image: product.poster_image,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT: Sticky Baymard Order Summary */}
          <aside className="lg:col-span-4 lg:sticky lg:top-32 space-y-4">
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-neutral-200/90 shadow-[0_8px_30px_rgba(7,20,16,0.05)] space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg sm:text-xl text-[#0C1412] tracking-tight">
                  Order Summary
                </h2>
                <span className="text-xs font-semibold text-neutral-500 tabular-nums">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Promo Code Input & Eligible Offers */}
              <div className="space-y-3">
                {couponApplied ? (
                  <div className="p-3.5 rounded-2xl bg-[#F3FAF7] border border-[#B8DFD1] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#0B5D44] text-white flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-[#074230] tracking-wide uppercase">
                            {appliedPromoCode}
                          </span>
                          <span className="text-[10.5px] bg-[#0B5D44] text-white font-bold px-2 py-0.5 rounded-full tabular-nums">
                            -₹{discount.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#074230]/85 font-medium truncate">
                          {couponSuccess || "Promo code applied"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1.5 rounded-lg hover:bg-[#E6F4EF] text-[#074230] transition-colors cursor-pointer shrink-0"
                      aria-label="Remove promo code"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <label htmlFor="cart-promo-input" className="sr-only">
                      Promo code
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          id="cart-promo-input"
                          type="text"
                          placeholder="Promo code (e.g. VITTAL10)"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 bg-[#FAFBF9] text-[#0C1412] text-sm sm:text-xs font-bold uppercase tracking-wider focus:outline-none focus:bg-white focus:border-[#0B5D44] focus:ring-2 focus:ring-[#0B5D44]/15 placeholder:text-neutral-400 placeholder:normal-case placeholder:font-normal"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-4 py-2.5 rounded-xl bg-[#0C1412] hover:bg-black disabled:bg-neutral-300 text-white text-xs font-bold transition-colors cursor-pointer uppercase tracking-wider flex items-center gap-1.5 disabled:cursor-not-allowed shrink-0"
                      >
                        {couponLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span>Apply</span>
                        )}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-rose-600 font-medium pl-1">{couponError}</p>
                    )}
                  </form>
                )}

                {/* Eligible Offers List */}
                {availableOffers.length > 0 && !couponApplied && (
                  <div className="pt-1">
                    <div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
                      <span>Available Offers</span>
                    </div>
                    <div className="space-y-2 max-h-44 overflow-y-auto pr-0.5">
                      {availableOffers.map((offer) => (
                        <div
                          key={offer.id || offer.code}
                          className={`p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between gap-2 ${
                            offer.eligible
                              ? "bg-[#FAFBF9] border-neutral-200 hover:border-[#0B5D44]"
                              : "bg-neutral-50 border-neutral-200/60 opacity-75"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#0C1412] uppercase font-mono tracking-wider text-[11px] bg-white px-1.5 py-0.5 rounded border border-neutral-200">
                                {offer.code}
                              </span>
                              <span className="text-[10.5px] font-bold text-[#0B5D44]">
                                {offer.discount_type === "PERCENTAGE"
                                  ? `${offer.discount_value}% OFF`
                                  : `₹${offer.discount_value} OFF`}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-600 line-clamp-1 mt-0.5">
                              {offer.description ||
                                (offer.min_order_amount > 0
                                  ? `On orders above ₹${offer.min_order_amount}`
                                  : "Valid on all orders")}
                            </p>
                            {!offer.eligible && offer.amountNeeded > 0 && (
                              <p className="text-[10px] text-[#9A7412] font-semibold mt-0.5 tabular-nums">
                                Add ₹{offer.amountNeeded.toLocaleString("en-IN")} more to unlock
                              </p>
                            )}
                          </div>
                          {offer.eligible ? (
                            <button
                              type="button"
                              onClick={() => validateAndApplyPromo(offer.code, true)}
                              disabled={couponLoading}
                              className="px-3 py-1.5 rounded-lg bg-[#E6F4EF] hover:bg-[#0B5D44] text-[#074230] hover:text-white font-bold text-[11px] transition-colors cursor-pointer shrink-0 uppercase tracking-tight"
                            >
                              Apply
                            </button>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-neutral-200/70 text-neutral-500 font-semibold text-[10px] shrink-0">
                              Locked
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-neutral-200/80" />

              {/* Baymard Itemized Price Ledger */}
              <div className="space-y-3 text-sm text-neutral-600">
                <div className="flex justify-between items-center">
                  <span>Bag MRP ({totalItems} {totalItems === 1 ? "item" : "items"})</span>
                  <span className="font-semibold text-neutral-900 tabular-nums">
                    ₹{bagMrp.toLocaleString("en-IN")}
                  </span>
                </div>

                {contextSavings > 0 && (
                  <div className="flex justify-between items-center text-[#0B5D44] font-semibold">
                    <span>Product Savings</span>
                    <span className="tabular-nums">-₹{contextSavings.toLocaleString("en-IN")}</span>
                  </div>
                )}

                {discount > 0 && (
                  <div className="flex justify-between items-center text-[#0B5D44] font-semibold">
                    <span>Coupon ({appliedPromoCode})</span>
                    <span className="tabular-nums">-₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>Insured Express Shipping</span>
                  {shippingFee === 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#E6F4EF] text-[#074230] font-bold text-[11px] uppercase tracking-wider">
                      FREE
                    </span>
                  ) : (
                    <span className="font-semibold text-neutral-900 tabular-nums">₹{shippingFee}</span>
                  )}
                </div>

                <hr className="border-neutral-200/80 my-1" />

                <div className="flex justify-between items-baseline pt-1">
                  <div>
                    <span className="text-base font-bold text-[#0C1412] block">Total Amount</span>
                    <span className="text-[11px] text-neutral-500">Inclusive of all taxes</span>
                  </div>
                  <span className="text-2xl font-extrabold text-[#0C1412] tabular-nums">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {totalSavings > 0 && (
                  <div className="px-3.5 py-2 rounded-xl bg-[#F3FAF7] border border-[#B8DFD1]/80 text-xs font-bold text-[#074230] flex items-center justify-center gap-1.5 tabular-nums">
                    <Sparkles className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                    <span>
                      You save ₹{totalSavings.toLocaleString("en-IN")} on this order
                    </span>
                  </div>
                )}
              </div>

              {/* Primary AAA Imperial Emerald Checkout CTA (Guest-Friendly) */}
              <button
                type="button"
                onClick={handleProceedToCheckout}
                disabled={hasOutOfStockItems}
                className="w-full min-h-[52px] py-3.5 px-6 rounded-full bg-[#0B5D44] hover:bg-[#074230] disabled:bg-neutral-300 disabled:text-neutral-500 text-white font-bold text-sm sm:text-[15px] shadow-lg shadow-[#0B5D44]/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <Lock className="w-4 h-4 shrink-0" />
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] shrink-0" />
              </button>

              {/* Contextual Payment & Authenticity Trust Block */}
              <div className="pt-4 border-t border-neutral-100 space-y-3">
                <div className="grid grid-cols-2 gap-2.5 text-[11px] font-semibold text-neutral-700">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#0B5D44] shrink-0" />
                    <span>100% Original Stock</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-[#0B5D44] shrink-0" />
                    <span>7-Day Easy Returns</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  {["UPI", "RuPay", "Visa", "Mastercard", "Verified COD"].map((method) => (
                    <span
                      key={method}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F5F8F6] border border-neutral-200/80 text-[10px] font-bold text-neutral-700"
                    >
                      {method === "UPI" && <CreditCard className="w-3 h-3 text-[#0B5D44]" />}
                      {method}
                    </span>
                  ))}
                </div>

                <p className="text-center text-[10.5px] text-neutral-500 flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3 text-[#0B5D44]" />
                  <span>256-Bit SSL Encrypted Checkout · Guest Checkout Enabled</span>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* ─── Undo Removal Toast (6s window) ─── */}
      {undoEntry && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md bg-[#071410] text-white rounded-2xl px-4 py-3 shadow-2xl border border-white/15 flex items-center justify-between gap-3"
        >
          <p className="text-xs font-semibold truncate">
            {undoEntry.reason === "saved"
              ? `Saved "${undoEntry.item.name}" to Wishlist`
              : `Removed "${undoEntry.item.name}"`}
          </p>
          <button
            type="button"
            onClick={handleUndoRestore}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B5D44] hover:bg-[#10B981] hover:text-[#071410] text-white text-xs font-bold transition-colors shrink-0 cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {/* ─── Mobile Sticky Bottom Checkout Bar ─── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-neutral-200/90 shadow-[0_-8px_28px_rgba(7,20,16,0.08)] px-4 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <span className="block text-[10.5px] font-semibold text-neutral-500 leading-none">
              Total ({totalItems} {totalItems === 1 ? "item" : "items"})
            </span>
            <span className="text-lg font-extrabold text-[#0C1412] tabular-nums leading-tight block mt-0.5">
              ₹{grandTotal.toLocaleString("en-IN")}
            </span>
            {totalSavings > 0 && (
              <span className="text-[10.5px] font-bold text-[#0B5D44] tabular-nums block leading-none">
                Saving ₹{totalSavings.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleProceedToCheckout}
            disabled={hasOutOfStockItems}
            className="flex-1 max-w-[220px] min-h-[48px] px-5 py-3 rounded-full bg-[#0B5D44] hover:bg-[#074230] disabled:bg-neutral-300 text-white font-bold text-sm shadow-md shadow-[#0B5D44]/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Checkout</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
