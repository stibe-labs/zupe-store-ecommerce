"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  Camera,
  ThumbsUp,
  X,
  MessageSquare,
  Sparkles,
  ChevronDown,
  Upload,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { ProductReview } from "@/lib/reviewStore";
import { useAuth } from "@/context/AuthContext";

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
  productImage?: string;
  fallbackRating?: number;
  fallbackReviewCount?: number;
}

export function ProductReviewsSection({
  productId,
  productName,
  productImage,
  fallbackRating = 4.8,
  fallbackReviewCount = 1250,
}: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: fallbackRating,
    totalReviews: 0,
    ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>,
    ratingPercentages: { 5: 85, 4: 11, 3: 3, 2: 1, 1: 0 } as Record<number, number>,
    customerPhotos: [] as string[],
  });

  const [activeFilter, setActiveFilter] = useState<"all" | "photos" | "5" | "4" | "3">("all");
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "helpful">("newest");
  const [lightboxData, setLightboxData] = useState<{ image: string; review?: ProductReview } | null>(null);

  // Write Review Modal state (for direct submissions on product page)
  const { user } = useAuth();
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [gateModalOpen, setGateModalOpen] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [verifiedOrder, setVerifiedOrder] = useState<{
    orderId: string;
    customerName?: string;
    customerEmail?: string;
  } | null>(null);
  const [manualVerifyInput, setManualVerifyInput] = useState("");
  const [verifyingManual, setVerifyingManual] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [formTitle, setFormTitle] = useState("");
  const [formComment, setFormComment] = useState("");
  const [formName, setFormName] = useState("");
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [votedHelpful, setVotedHelpful] = useState<Set<string>>(new Set());

  // Freeze background scrolling when review modal is open
  useEffect(() => {
    if (writeModalOpen) {
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
  }, [writeModalOpen]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}&_t=${Date.now()}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch product reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  // Lock background scroll when review modal or lightbox is open
  useEffect(() => {
    if (writeModalOpen || Boolean(lightboxData)) {
      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
      const prevBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.classList.remove("modal-open");
        document.documentElement.classList.remove("modal-open");
        document.body.style.overflow = prevBodyOverflow;
      };
    }
  }, [writeModalOpen, lightboxData]);

  // Handle local photo uploads (converts files to base64 Data URLs)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setFormPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx: number) => {
    setFormPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleOpenWriteReview = async () => {
    setVerifyError(null);

    // 1. If already verified in this session, open form directly
    if (verifiedOrder) {
      setWriteModalOpen(true);
      return;
    }

    // 2. If logged in, automatically check buyer verification against orders
    if (user?.email) {
      setCheckingEligibility(true);
      try {
        const res = await fetch(
          `/api/reviews/verify-buyer?productId=${encodeURIComponent(productId)}&email=${encodeURIComponent(
            user.email
          )}`
        );
        const data = await res.json();
        if (data.success && data.isVerified) {
          setVerifiedOrder({
            orderId: data.orderId,
            customerName: data.customerName || user.name || "",
            customerEmail: data.customerEmail || user.email || "",
          });
          if (data.customerName || user.name) {
            setFormName(data.customerName || user.name || "");
          }
          setWriteModalOpen(true);
          setCheckingEligibility(false);
          return;
        }
      } catch (err) {
        console.warn("Failed to check buyer verification:", err);
      } finally {
        setCheckingEligibility(false);
      }
    }

    // 3. Unordered or Not logged in -> Show gate modal
    setGateModalOpen(true);
  };

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = manualVerifyInput.trim();
    if (!cleanInput) {
      setVerifyError("Please enter your Order ID or registered mobile number");
      return;
    }

    setVerifyingManual(true);
    setVerifyError(null);

    try {
      const res = await fetch(
        `/api/reviews/verify-buyer?productId=${encodeURIComponent(productId)}&orderId=${encodeURIComponent(
          cleanInput
        )}&phone=${encodeURIComponent(cleanInput)}`
      );
      const data = await res.json();

      if (data.success && data.isVerified) {
        setVerifiedOrder({
          orderId: data.orderId,
          customerName: data.customerName || "",
          customerEmail: data.customerEmail || "",
        });
        if (data.customerName) {
          setFormName(data.customerName);
        }
        setGateModalOpen(false);
        setWriteModalOpen(true);
      } else {
        setVerifyError(
          data.message ||
            "No completed order for this product was found matching this Order ID or phone number."
        );
      }
    } catch (err: any) {
      setVerifyError("Failed to verify order. Please try again or contact support.");
    } finally {
      setVerifyingManual(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          orderId: verifiedOrder?.orderId,
          userName: formName.trim() || verifiedOrder?.customerName || user?.name || "Verified Buyer",
          userEmail: verifiedOrder?.customerEmail || user?.email,
          rating: formRating,
          title: formTitle.trim(),
          comment: formComment.trim(),
          images: formPhotos,
          verifiedPurchase: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        // Refresh reviews list
        await fetchReviews();
        setTimeout(() => {
          setWriteModalOpen(false);
          setSubmitSuccess(false);
          setFormTitle("");
          setFormComment("");
          setFormPhotos([]);
          setFormRating(5);
        }, 1800);
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpfulClick = async (reviewId: string) => {
    if (votedHelpful.has(reviewId)) return;
    setVotedHelpful((prev) => new Set(prev).add(reviewId));

    // Optimistically update review helpful count in state
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r))
    );

    try {
      await fetch("/api/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, action: "helpful" }),
      });
    } catch {}
  };

  // Filter & Sort reviews
  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === "photos") return r.images && r.images.length > 0;
    if (activeFilter === "5") return Math.round(r.rating) === 5;
    if (activeFilter === "4") return Math.round(r.rating) === 4;
    if (activeFilter === "3") return Math.round(r.rating) <= 3;
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "highest") return b.rating - a.rating;
    if (sortBy === "helpful") return (b.helpfulCount || 0) - (a.helpfulCount || 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const displayAverage = stats.totalReviews > 0 ? stats.averageRating : fallbackRating;
  const displayTotal = stats.totalReviews > 0 ? stats.totalReviews : fallbackReviewCount;

  return (
    <section id="reviews" className="w-full pt-12 pb-16 border-t border-gray-200 mt-14 bg-white/60">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200/80">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Verified Buyer Feedback</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#111111] tracking-tight">
              Customer Reviews & Ratings
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Real reviews and authentic pictures shared by verified Zupe Store buyers.
            </p>
          </div>

          <button
            onClick={handleOpenWriteReview}
            disabled={checkingEligibility}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#111111] text-white text-xs font-bold hover:bg-[#FA521C] transition-all shadow-sm shrink-0 cursor-pointer disabled:opacity-60"
          >
            {checkingEligibility ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <Star className="w-4 h-4 fill-current text-amber-400" />
            )}
            <span>Write a Customer Review</span>
          </button>
        </div>

        {/* Rating Breakdown Summary Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-10">
          {/* Big Score Column */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left justify-center md:border-r md:border-gray-100 md:pr-8">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-display font-black text-gray-900 tracking-tight">
                {displayAverage.toFixed(1)}
              </span>
              <span className="text-lg font-bold text-gray-400">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1 my-2 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 fill-current ${
                    star <= Math.round(displayAverage) ? "text-amber-400" : "text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-gray-600">
              Based on {displayTotal.toLocaleString()} verified customer reviews
            </span>
            <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>98% of customers recommend this product</span>
            </div>
          </div>

          {/* Progress Bars Column */}
          <div className="md:col-span-8 space-y-2.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const pct = stats.ratingPercentages[star] || 0;
              const count = stats.ratingCounts[star] || 0;
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-12 text-gray-700 font-bold justify-end">
                    <span>{star}</span>
                    <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                  </div>
                  <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden relative">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-[#FA521C] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-16 text-right font-mono font-bold text-gray-500 text-[11px]">
                    {pct}% <span className="text-gray-400 font-normal">({count})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Uploaded Photos Gallery (if any exist) */}
        {stats.customerPhotos.length > 0 && (
          <div className="mb-10 p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#FA521C]" />
                <h3 className="text-base font-bold text-gray-900">
                  Customer Photos & Unboxing ({stats.customerPhotos.length})
                </h3>
              </div>
              <span className="text-xs text-gray-500 font-medium">Click any photo to zoom & read review</span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {stats.customerPhotos.map((photoUrl, idx) => {
                const matchingReview = reviews.find((r) => r.images?.includes(photoUrl));
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setLightboxData({ image: photoUrl, review: matchingReview })}
                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-gray-200 group hover:ring-2 hover:ring-[#FA521C] transition-all shadow-xs cursor-pointer"
                  >
                    <Image
                      src={photoUrl}
                      alt={`Customer photo ${idx + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                      Zoom
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter and Sort Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200 mb-6">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeFilter === "all"
                  ? "bg-[#111111] text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Reviews ({reviews.length})
            </button>
            {stats.customerPhotos.length > 0 && (
              <button
                onClick={() => setActiveFilter("photos")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeFilter === "photos"
                    ? "bg-[#FA521C] text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>With Photos ({reviews.filter((r) => r.images && r.images.length > 0).length})</span>
              </button>
            )}
            <button
              onClick={() => setActiveFilter("5")}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeFilter === "5"
                  ? "bg-[#111111] text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              5 Stars ({stats.ratingCounts[5] || 0})
            </button>
            <button
              onClick={() => setActiveFilter("4")}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeFilter === "4"
                  ? "bg-[#111111] text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              4 Stars ({stats.ratingCounts[4] || 0})
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 self-end sm:self-auto">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort customer reviews"
              className="bg-white border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#FA521C] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        {sortedReviews.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-gray-100">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h4 className="text-base font-bold text-gray-800">No reviews found for this filter</h4>
            <p className="text-xs text-gray-500 mt-1 mb-4">Be the first to share your thoughts on this product!</p>
            <button
              onClick={() => {
                setActiveFilter("all");
                handleOpenWriteReview();
              }}
              disabled={checkingEligibility}
              className="px-5 py-2 rounded-full bg-[#FA521C] text-white text-xs font-bold hover:bg-[#E04515] disabled:opacity-60 cursor-pointer"
            >
              Write First Review
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs hover:shadow-md transition-shadow"
              >
                {/* Header: User Info + Rating + Verified Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    {/* User Avatar Circle with Initials */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-100 to-amber-200 text-amber-800 font-extrabold flex items-center justify-center text-sm shadow-xs shrink-0">
                      {rev.userName ? rev.userName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{rev.userName}</span>
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 fill-current ${
                          star <= rev.rating ? "text-amber-400" : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Title & Comment */}
                {rev.title && (
                  <h4 className="font-extrabold text-sm text-gray-900 mb-1.5">{rev.title}</h4>
                )}
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{rev.comment}</p>

                {/* Uploaded Photos Thumbnails */}
                {rev.images && rev.images.length > 0 && (
                  <div className="mt-3.5 flex flex-wrap gap-2.5">
                    {rev.images.map((imgUrl, imgIdx) => (
                      <button
                        key={imgIdx}
                        type="button"
                        onClick={() => setLightboxData({ image: imgUrl, review: rev })}
                        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gray-200 hover:ring-2 hover:ring-[#FA521C] transition-all cursor-pointer shadow-xs"
                      >
                        <Image
                          src={imgUrl}
                          alt="Customer product photo"
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Helpful voting footer */}
                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                  <button
                    type="button"
                    onClick={() => handleHelpfulClick(rev.id)}
                    disabled={votedHelpful.has(rev.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                      votedHelpful.has(rev.id)
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Helpful ({rev.helpfulCount || 0})</span>
                  </button>

                  <span className="text-[11px] text-gray-400">Verified purchase on Zupe Store</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL: BUYER VERIFICATION GATE (ONLY VERIFIED BUYERS CAN REVIEW)
         ======================================================== */}
      {gateModalOpen && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setGateModalOpen(false);
          }}
        >
          <div
            data-lenis-prevent
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setGateModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-[#FA521C] flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 leading-snug">
              Verified Buyers Only
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              To guarantee 100% genuine reviews, only customers who have ordered{" "}
              <strong className="text-gray-800">{productName}</strong> can submit a rating and review.
            </p>

            {/* If user is logged in but has no order */}
            {user ? (
              <div className="mt-4 p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-600">
                <span>Signed in as: </span>
                <span className="font-bold text-gray-900">{user.email}</span>
                <p className="mt-1 text-gray-500">
                  We could not find an order for this product under your account. If you purchased under a different email, phone number, or as a guest, please verify below:
                </p>
              </div>
            ) : (
              <div className="mt-4">
                <Link
                  href={`/signin?redirect=${encodeURIComponent(
                    typeof window !== "undefined" ? window.location.pathname + "#reviews" : "/products"
                  )}&notice=${encodeURIComponent("Please sign in to verify your purchase and review")}`}
                  className="w-full py-3 px-4 rounded-xl bg-[#111111] hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign In with Your Account</span>
                </Link>

                <div className="flex items-center gap-2 my-4">
                  <div className="h-px bg-gray-200 flex-1" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Or Verify As Guest
                  </span>
                  <div className="h-px bg-gray-200 flex-1" />
                </div>
              </div>
            )}

            {/* Manual Order Verification Form */}
            <form onSubmit={handleManualVerify} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Enter Order ID or Mobile Number
                </label>
                <input
                  type="text"
                  value={manualVerifyInput}
                  onChange={(e) => {
                    setManualVerifyInput(e.target.value);
                    if (verifyError) setVerifyError(null);
                  }}
                  placeholder="e.g. ord_zupe_1001 or 9876543210"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-[#FA521C] focus:ring-1 focus:ring-[#FA521C]"
                />
              </div>

              {verifyError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium leading-relaxed">
                  {verifyError}
                </div>
              )}

              <button
                type="submit"
                disabled={verifyingManual || !manualVerifyInput.trim()}
                className="w-full py-3 px-4 rounded-xl bg-[#FA521C] hover:bg-[#E04414] active:scale-[0.98] text-white font-bold text-xs tracking-wide transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {verifyingManual ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Purchase...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify Purchase & Write Review</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: WRITE A CUSTOMER REVIEW
         ======================================================== */}
      {writeModalOpen && (
        <div 
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setWriteModalOpen(false);
          }}
        >
          <div 
            data-lenis-prevent
            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col min-h-0 overflow-hidden shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
              <div>
                <h3 className="text-base font-bold text-gray-900">Write a Product Review</h3>
                <p className="text-xs text-gray-500">Share your experience with verified Zupe Store shoppers</p>
              </div>
              <button
                onClick={() => setWriteModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form 
              onSubmit={handleSubmitReview} 
              data-lenis-prevent
              className="p-6 overflow-y-auto min-h-0 overscroll-contain space-y-4 flex-1"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {submitSuccess ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">Thank You for Your Feedback!</h4>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    Your review and photos are now published live on this product's page.
                  </p>
                </div>
              ) : (
                <>
                  {/* Product Mini Header */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    {productImage && (
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-200 shrink-0">
                        <Image src={productImage} alt={productName} fill className="object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 truncate">{productName}</p>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                      </span>
                    </div>
                  </div>

                  {/* Rating Selector */}
                  <div className="text-center py-2 bg-amber-50/50 rounded-2xl border border-amber-100/80">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Your Overall Rating *
                    </label>
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const activeStar = (hoverRating || formRating) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setFormRating(star)}
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
                    <span className="text-[11px] font-bold text-amber-700 mt-1 block">
                      {formRating === 5
                        ? "5 - Excellent / Loved it! ⭐⭐⭐⭐⭐"
                        : formRating === 4
                        ? "4 - Very Good / High Quality ⭐⭐⭐⭐"
                        : formRating === 3
                        ? "3 - Average ⭐⭐⭐"
                        : formRating === 2
                        ? "2 - Below Average ⭐⭐"
                        : "1 - Poor ⭐"}
                    </span>
                  </div>

                  {/* Review Title */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Review Headline / Title
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Stunning design and fast delivery!"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FA521C]"
                    />
                  </div>

                  {/* Detailed Comment */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Detailed Review *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formComment}
                      onChange={(e) => setFormComment(e.target.value)}
                      placeholder="What did you love about the product? Mention quality, packaging, finish, or functionality..."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#FA521C]"
                    />
                  </div>

                  {/* Customer Photo Upload */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Upload Photos & Images (Optional)
                    </label>
                    <label className="cursor-pointer border-2 border-dashed border-gray-200 hover:border-[#FA521C] bg-gray-50 hover:bg-orange-50/50 rounded-2xl p-4 flex flex-col items-center justify-center transition-all">
                      <Camera className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs font-bold text-gray-700">Click to upload product pictures</span>
                      <span className="text-[10px] text-gray-400">Supports PNG, JPG, WebP</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </label>

                    {/* Image previews */}
                    {formPhotos.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        {formPhotos.map((photo, i) => (
                          <div
                            key={i}
                            className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 group"
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

                  {/* Reviewer Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Rahul M."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FA521C]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setWriteModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !formComment.trim()}
                      className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#FA521C] hover:bg-[#E04515] disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                    >
                      {submitting ? "Publishing Review..." : "Submit Review"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CUSTOMER PHOTO LIGHTBOX
         ======================================================== */}
      {lightboxData && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div data-lenis-prevent className="relative max-w-2xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <button
              onClick={() => setLightboxData(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo */}
            <div className="relative w-full h-80 sm:h-96 bg-black flex items-center justify-center">
              <img
                src={lightboxData.image}
                alt="Enlarged customer photo"
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Review Details below photo */}
            {lightboxData.review && (
              <div className="p-5 bg-slate-900 text-white border-t border-slate-800 overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{lightboxData.review.userName}</span>
                    <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                      ✓ Verified Buyer
                    </span>
                  </div>
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 fill-current ${
                          star <= lightboxData.review!.rating ? "text-amber-400" : "text-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {lightboxData.review.title && (
                  <h4 className="font-bold text-xs text-orange-200 mb-1">{lightboxData.review.title}</h4>
                )}
                <p className="text-xs text-slate-300 leading-relaxed">{lightboxData.review.comment}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
