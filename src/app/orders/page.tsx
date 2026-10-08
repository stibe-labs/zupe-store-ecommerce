"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShoppingBag,
  Star,
  Camera,
  X,
  Upload,
  ExternalLink,
  Sparkles,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { OrderRecord, OrderItem } from "@/lib/orderStore";

export default function OrdersPage() {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    // Load local reviewed items cache
    try {
      const saved = localStorage.getItem("zupe_reviewed_items");
      if (saved) {
        setReviewedItems(JSON.parse(saved));
      }
    } catch {}

    async function fetchOrders() {
      try {
        const query = user?.email ? `?email=${encodeURIComponent(user.email)}` : "";
        const res = await fetch(`/api/orders${query}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.warn("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

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

  const getStatusBadge = (status: OrderRecord["order_status"]) => {
    switch (status) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
            <Truck className="w-3.5 h-3.5" /> In Transit
          </span>
        );
      case "processing":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-[#FA521C]">
            <Clock className="w-3.5 h-3.5" /> Processing
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111]">
      <Navbar />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-16">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-gray-900">
              My Orders
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Track packages, check shipping updates, rate & review delivered purchases
            </p>
          </div>

          {!isAuthenticated && (
            <Link
              href="/signin?redirect=/orders&notice=Please sign in to view and track your orders"
              className="text-xs font-semibold text-[#FA521C] hover:underline"
            >
              Sign In for full account sync
            </Link>
          )}
        </div>

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
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#FA521C] text-white text-xs font-semibold"
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

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8"
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
                      <span className="text-sm font-bold text-[#FA521C]">
                        ₹{ord.total_amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {getStatusBadge(isDelivered ? "delivered" : ord.order_status)}
                      <Link
                        href={`/order-tracking?query=${encodeURIComponent(ord.id)}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-orange-50 text-[#FA521C] hover:bg-[#FA521C] hover:text-white border border-[#FA521C]/20 transition-all cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Track Package</span>
                      </Link>
                      {isDelivered && (
                        <button
                          type="button"
                          onClick={() => handleOpenReviewModal(ord, rawItems[0])}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-xs transition-all cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>Rate & Review</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-4">
                    {rawItems.map((it: any, idx: number) => {
                      const itemKey = `${ord.id}_${it.product_id || it.name}`;
                      const hasReviewed = reviewedItems[itemKey];
                      const productTargetLink = `/products/${encodeURIComponent(it.product_id || it.name)}`;

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
                                className="text-sm font-bold text-gray-900 hover:text-[#FA521C] transition-colors truncate block"
                              >
                                {it.name}
                              </Link>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Qty: {it.quantity || 1} × ₹{(it.price || ord.total_amount).toLocaleString()}
                              </p>

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
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-[#FA521C] transition-colors"
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
                              ₹{((it.price || ord.total_amount) * (it.quantity || 1)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Shipping address footer */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between text-xs text-gray-500 gap-2">
                    <span>
                      Ship to: {ord.shipping_address}
                      {ord.city ? `, ${ord.city}` : ""}
                    </span>
                    <span>Payment: {ord.payment_method}</span>
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
                  <div className="w-8 h-0.5 bg-[#FA521C] rounded-full mt-2" />
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
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#111111] text-white text-xs font-bold hover:bg-[#FA521C] transition-colors"
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
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FA521C]"
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
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#FA521C]"
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

                        <label className="cursor-pointer border-2 border-dashed border-gray-200 hover:border-[#FA521C] bg-gray-50 hover:bg-orange-50/50 rounded-2xl p-4 flex flex-col items-center justify-center transition-all">
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
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FA521C]"
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
                          className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#FA521C] hover:bg-[#E04515] disabled:opacity-50 transition-all cursor-pointer shadow-sm"
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

      <Footer />
    </div>
  );
}
