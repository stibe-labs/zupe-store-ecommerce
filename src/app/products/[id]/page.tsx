"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Share2,
  Star,
  Flame,
  ShoppingCart,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  CreditCard,
  Check,
  Plus,
  Minus,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Tag,
  Volume2,
  Headphones,
  BatteryCharging,
  Droplets,
  Radio,
  Play,
  X,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  ChevronDown,
  Info,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductReviewsSection } from "@/components/ProductReviewsSection";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

// ---------------------------------------------------------------------------
// High-res Related Products ("You May Also Like" - 6 products matching design)
// ---------------------------------------------------------------------------
const RELATED_AUDIO_PRODUCTS = [
  {
    id: "airpods-3rd-gen",
    name: "Apple AirPods (3rd Gen)",
    price: 14990,
    mrp: 19990,
    discount: 25,
    rating: 4.5,
    reviews: "1,324",
    image: "/vittal/products/airpods-3rd-gen.jpg",
    link: "/products/airpods-3rd-gen",
  },
  {
    id: "airpods-max-pink",
    name: "Apple AirPods Max",
    price: 59990,
    mrp: 69990,
    discount: 28,
    rating: 4.7,
    reviews: "1,029",
    image: "/vittal/products/airpods-max-spotlight.jpg",
    link: "/products/airpods-max",
  },
  {
    id: "galaxy-buds2-pro",
    name: "Samsung Galaxy Buds2 Pro",
    price: 17999,
    mrp: 22999,
    discount: 20,
    rating: 4.6,
    reviews: "2,417",
    image: "/vittal/products/galaxy-buds2-pro.png",
    link: "/products/galaxy-buds2-pro",
  },
  {
    id: "sony-wf1000xm5",
    name: "Sony WF-1000XM5",
    price: 19990,
    mrp: 28990,
    discount: 30,
    rating: 4.6,
    reviews: "934",
    image: "/vittal/products/sony-wf1000xm5.png",
    link: "/products/sony-wf1000xm5",
  },
  {
    id: "boat-airdopes-280",
    name: "boAt Airdopes 280 ANC",
    price: 2799,
    mrp: 3399,
    discount: 18,
    rating: 4.4,
    reviews: "3,521",
    image: "/vittal/products/boat-airdopes-280.png",
    link: "/products/boat-airdopes-280",
  },
  {
    id: "jbl-tune-230nc",
    name: "JBL Tune 230NC",
    price: 4749,
    mrp: 6999,
    discount: 32,
    rating: 4.5,
    reviews: "1,876",
    image: "/vittal/products/jbl-tune-230nc.png",
    link: "/products/jbl-tune-230nc",
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params?.id as string;
  const { user } = useAuth();
  const { addToCart, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState<boolean>(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string>("White");
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "reviews" | "qa">("overview");
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [pincode, setPincode] = useState<string>("680001");
  const [deliveryLocation, setDeliveryLocation] = useState<string>("Thrissur, Kerala - 680001");
  const [editingPincode, setEditingPincode] = useState<boolean>(false);
  const [tempPincode, setTempPincode] = useState<string>("680001");
  const [showToast, setShowToast] = useState<string | null>(null);
  const [showStickyBar, setShowStickyBar] = useState<boolean>(false);

  // Load product data (matches airpods-pro-2, slugs, or fallback)
  useEffect(() => {
    let isMounted = true;
    const rawId = decodeURIComponent(idOrSlug || "").trim().toLowerCase();

    // Match static product instantly
    const foundStatic =
      DEFAULT_PRODUCTS.find(
        (p) =>
          p.id.toLowerCase() === rawId ||
          p.slug.toLowerCase() === rawId ||
          (rawId.includes("airpod") && p.id === "airpods-pro-2")
      ) || DEFAULT_PRODUCTS[0];

    if (foundStatic && isMounted) {
      setProduct(foundStatic);
      setSelectedImageIndex(0);
      if (foundStatic.colors && foundStatic.colors.length > 0) {
        setSelectedColor(foundStatic.colors[0].name);
      }
      setLoadingProduct(false);
    }

    // Attempt live API fetch
    fetch(`/api/products?id=${encodeURIComponent(rawId)}&_t=${Date.now()}`)
      .then((r) => r.json())
      .then((data) => {
        if (isMounted && data.success && data.product) {
          setProduct(data.product);
          if (data.product.colors && data.product.colors.length > 0) {
            setSelectedColor(data.product.colors[0].name);
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [idOrSlug]);

  // Handle sticky bar on mobile scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toast auto-clear
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const activeProduct = product || DEFAULT_PRODUCTS[0];

  // Gallery images with high-res defaults
  const galleryImages = useMemo(() => {
    if (!activeProduct) return [];
    const isAirPods =
      activeProduct.id === "airpods-pro-2" ||
      activeProduct.id.includes("airpod") ||
      activeProduct.name.toLowerCase().includes("airpod");

    if (isAirPods) {
      return [
        "/vittal/products/airpods-pro-gallery-1.jpg",
        "/vittal/products/airpods-pro-gallery-2.jpg",
        "/vittal/products/airpods-pro-gallery-3.jpg",
        "/vittal/products/airpods-pro-gallery-5.jpg",
        "/vittal/products/airpods-pro.jpg",
      ];
    }

    if (activeProduct.images && activeProduct.images.length > 0) {
      return activeProduct.images;
    }
    return [activeProduct.poster_image || "/vittal/products/airpods-pro-gallery-1.jpg"];
  }, [activeProduct]);

  const currentDisplayImage = galleryImages[selectedImageIndex] || galleryImages[0];

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    if (!activeProduct) return;
    addToCart(
      {
        id: activeProduct.id,
        name: activeProduct.name,
        subtitle: activeProduct.subtitle,
        category: activeProduct.category,
        price: activeProduct.offer_price || activeProduct.price,
        mrp: activeProduct.mrp,
        poster_image: currentDisplayImage,
        color: selectedColor,
      },
      quantity
    );
    setShowToast("Added to Cart successfully!");
    openCart();
  };

  const handleBuyNow = () => {
    if (!activeProduct) return;
    addToCart(
      {
        id: activeProduct.id,
        name: activeProduct.name,
        subtitle: activeProduct.subtitle,
        category: activeProduct.category,
        price: activeProduct.offer_price || activeProduct.price,
        mrp: activeProduct.mrp,
        poster_image: currentDisplayImage,
        color: selectedColor,
      },
      quantity
    );
    router.push("/checkout");
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      if (navigator.share) {
        navigator.share({
          title: activeProduct.name,
          url: window.location.href,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        setShowToast("Link copied to clipboard!");
      }
    }
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempPincode.trim().length === 6) {
      setPincode(tempPincode);
      setDeliveryLocation(`Pincode: ${tempPincode} (Verified)`);
      setEditingPincode(false);
      setShowToast("Delivery location updated!");
    }
  };

  const isFavorited = activeProduct ? isInWishlist(activeProduct.id) : false;

  const discountPercent =
    activeProduct.mrp && activeProduct.price
      ? Math.round(((activeProduct.mrp - activeProduct.price) / activeProduct.mrp) * 100)
      : 30;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-[#002D62] selection:text-white">
      {/* 1. Global Navbar */}
      <Navbar />

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-[#002D62] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-semibold border border-blue-400/30"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
        {/* ================================================================= */}
        {/* BREADCRUMB & TOP ACTIONS ROW                                      */}
        {/* ================================================================= */}
        <div className="flex items-center justify-between py-2 border-b border-slate-200/70 mb-4 sm:mb-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 overflow-x-auto scrollbar-hide">
            <Link href="/" className="hover:text-[#002D62] transition-colors shrink-0 flex items-center gap-1">
              <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span className="hidden sm:inline">Home</span>
            </Link>
            <span className="text-slate-300">›</span>
            <Link href="/products?category=Audio+%26+Headphones" className="hover:text-[#002D62] transition-colors shrink-0">
              {activeProduct.category || "Audio & Headphones"}
            </Link>
            <span className="text-slate-300">›</span>
            <span className="hover:text-[#002D62] transition-colors shrink-0">
              {activeProduct.subcategory || "Wireless Earbuds"}
            </span>
            <span className="text-slate-300">›</span>
            <span className="text-slate-900 font-medium truncate max-w-[160px] sm:max-w-xs md:max-w-md">
              {activeProduct.name}
            </span>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShare}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors shadow-xs"
              title="Share Product"
              aria-label="Share product"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => activeProduct && toggleWishlist(activeProduct)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center transition-all shadow-xs ${
                isFavorited
                  ? "bg-rose-50 border-rose-200 text-rose-500"
                  : "bg-white hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-rose-500"
              }`}
              title="Wishlist Product"
              aria-label="Add to wishlist"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? "fill-rose-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* MAIN PRODUCT SHOWCASE (3-COLUMN DESKTOP / STACKED MOBILE)         */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* --------------------------------------------------------------- */}
          {/* COLUMN 1: PRODUCT GALLERY (5 COLUMNS ON DESKTOP)                */}
          {/* --------------------------------------------------------------- */}
          <div className="lg:col-span-5 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
            {/* Vertical Thumbnails (Desktop / Tablet) */}
            <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[460px] scrollbar-hide py-1 shrink-0">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-15 h-15 sm:w-18 sm:h-18 rounded-xl sm:rounded-2xl p-1 bg-white border-2 transition-all flex items-center justify-center overflow-hidden shrink-0 group ${
                    selectedImageIndex === idx
                      ? "border-[#002D62] ring-2 ring-blue-500/20 shadow-xs"
                      : "border-slate-200/90 hover:border-slate-400"
                  }`}
                  aria-label={`View product image ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`${activeProduct.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                  {/* Video badge on last thumbnail */}
                  {idx === galleryImages.length - 1 && (
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-xs">
                        <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Main Stage Image Box */}
            <div className="relative flex-1 bg-[#EAF2FD] rounded-2xl sm:rounded-3xl border border-blue-100/70 p-6 sm:p-10 flex items-center justify-center min-h-[340px] sm:min-h-[440px] md:min-h-[460px] overflow-hidden select-none group">
              {/* Bestseller Badge */}
              <div className="absolute top-4 left-4 z-10 bg-[#FFBE00] text-slate-900 px-3 py-1 rounded-md text-xs font-black tracking-wide flex items-center gap-1.5 shadow-xs">
                <span>👑</span>
                <span>Bestseller</span>
              </div>

              {/* Fullscreen Zoom Button */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-sm flex items-center justify-center transition-all hover:scale-105"
                title="Expand fullscreen"
                aria-label="Expand image fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Left & Right Chevrons */}
              <button
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Product Main Image */}
              <div className="relative w-full h-[280px] sm:h-[340px] flex items-center justify-center">
                <img
                  src={currentDisplayImage}
                  alt={activeProduct.name}
                  className="max-h-full max-w-full object-contain filter drop-shadow-md transition-all duration-300 hover:scale-105"
                />
              </div>

              {/* Dots Carousel Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                {galleryImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`transition-all rounded-full ${
                      selectedImageIndex === i
                        ? "bg-[#002D62] w-5 h-2"
                        : "bg-blue-300/60 hover:bg-blue-400 w-2 h-2"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------- */}
          {/* COLUMN 2: TITLE, PRICING, VARIANTS, ACTIONS (4 COLUMNS)         */}
          {/* --------------------------------------------------------------- */}
          <div className="lg:col-span-4 flex flex-col">
            {/* Brand Header */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 tracking-wide uppercase mb-1">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.71-11.71-14.02-6.53-10.12-11.59-21.73-15.18-34.82-3.59-13.1-5.38-25.26-5.38-36.49 0-14.92 3.65-27.42 10.96-37.5 7.31-10.08 16.7-15.22 28.16-15.42 5.06 0 10.68 1.34 16.85 4.02 6.17 2.68 10.15 4.09 11.94 4.23 2.12-.27 6.46-1.8 13.01-4.59 6.55-2.79 12.3-4.04 17.26-3.76 13.09.73 23.49 5.86 31.2 15.4-11.45 6.94-17.06 16.48-16.83 28.62.24 9.49 3.86 17.47 10.86 23.94 7 6.48 15.34 10.15 25.02 11.02-2.12 6.53-4.7 13.09-7.75 19.68zM119.22 31.84c0-7.39 2.67-14.37 8.01-20.93 5.34-6.56 12.01-10.51 20.01-11.85.13 1.07.2 2.05.2 2.94 0 7.32-2.82 14.32-8.47 21-5.65 6.68-12.42 10.6-20.31 11.77-.27-.98-.44-1.96-.44-2.93z" />
              </svg>
              <span>Apple</span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
              {activeProduct.name}
            </h1>

            {/* Subtitle / Key Spec Badges */}
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 leading-relaxed">
              {activeProduct.subtitle ||
                "Active Noise Cancellation | Adaptive Transparency | Personalized Spatial Audio | USB-C Charging"}
            </p>

            {/* Ratings & Sold Count */}
            <div className="flex items-center gap-3 text-xs sm:text-sm mt-3 pb-3 border-b border-slate-200/70">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{activeProduct.rating || "4.6"}</span>
                <span className="text-slate-500 font-normal">
                  ({activeProduct.review_count?.toLocaleString() || "2,417"} Reviews)
                </span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1 font-semibold text-slate-900">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span>{activeProduct.sold_count || "8,200+ Sold"}</span>
              </div>
            </div>

            {/* Price Block */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                ₹{(activeProduct.offer_price || activeProduct.price).toLocaleString("en-IN")}
              </span>
              {activeProduct.mrp && activeProduct.mrp > (activeProduct.offer_price || activeProduct.price) && (
                <>
                  <span className="text-base sm:text-lg text-slate-400 line-through font-normal">
                    ₹{activeProduct.mrp.toLocaleString("en-IN")}
                  </span>
                  <span className="bg-red-500 text-white font-black text-xs px-2.5 py-1 rounded-md tracking-wide">
                    -{discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* UPI 5% Off Discount Callout Card */}
            <div className="bg-[#F0F5FF] border border-blue-200/80 rounded-xl p-3 sm:p-3.5 flex items-center gap-3 mt-3.5 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-[#002D62] text-white flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900 leading-tight">
                  Get extra 5% off on UPI Payments
                </p>
                <p className="text-slate-600 mt-0.5">
                  Use code <span className="font-black text-[#002D62]">VITTAL5</span> at checkout
                </p>
              </div>
            </div>

            {/* Color Swatches */}
            <div className="mt-4">
              <div className="text-xs font-semibold text-slate-700 mb-2">
                Color: <span className="text-slate-900 font-bold">{selectedColor}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedColor("White")}
                  className={`w-7 h-7 rounded-full bg-white border-2 transition-all flex items-center justify-center ${
                    selectedColor === "White"
                      ? "border-[#002D62] ring-2 ring-blue-500/30 scale-105"
                      : "border-slate-300 hover:border-slate-500"
                  }`}
                  aria-label="Color White"
                >
                  <span className="w-5 h-5 rounded-full bg-white border border-slate-200" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedColor("Black")}
                  className={`w-7 h-7 rounded-full bg-slate-950 border-2 transition-all flex items-center justify-center ${
                    selectedColor === "Black"
                      ? "border-[#002D62] ring-2 ring-blue-500/30 scale-105"
                      : "border-transparent hover:scale-105"
                  }`}
                  aria-label="Color Black"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800" />
                </button>
              </div>
            </div>

            {/* Quantity Stepper & Stock status */}
            <div className="flex items-center justify-between gap-4 mt-5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-300/80 rounded-xl bg-white shadow-xs px-2 py-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-30 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-black text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* In Stock Badge (Compact, visible on tablet/mobile) */}
              <div className="lg:hidden flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="block leading-none">In Stock</span>
                  <span className="text-[10px] font-normal text-slate-500">Only 24 units left!</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons: Add to Cart & Buy Now */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-5">
              <button
                onClick={handleAddToCart}
                className="bg-[#FFBE00] hover:bg-[#F0B200] active:scale-[0.98] text-slate-950 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all text-sm sm:text-base cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="bg-[#002D62] hover:bg-blue-900 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all text-sm sm:text-base cursor-pointer"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                <span>Buy Now</span>
              </button>
            </div>

            {/* 4-Item Trust Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 py-4 mt-5 border-t border-slate-200/70 text-center">
              <div className="flex flex-col items-center">
                <Truck className="w-5 h-5 text-[#002D62] mb-1" />
                <span className="text-[11px] font-bold text-slate-900 leading-tight">Express Delivery</span>
                <span className="text-[10px] text-slate-500">2–4 Days</span>
              </div>
              <div className="flex flex-col items-center">
                <ShieldCheck className="w-5 h-5 text-[#002D62] mb-1" />
                <span className="text-[11px] font-bold text-slate-900 leading-tight">1 Year Warranty</span>
                <span className="text-[10px] text-slate-500">Apple Official</span>
              </div>
              <div className="flex flex-col items-center">
                <RotateCcw className="w-5 h-5 text-[#002D62] mb-1" />
                <span className="text-[11px] font-bold text-slate-900 leading-tight">7 Days Return</span>
                <span className="text-[10px] text-slate-500">Hassle Free</span>
              </div>
              <div className="flex flex-col items-center">
                <CreditCard className="w-5 h-5 text-[#002D62] mb-1" />
                <span className="text-[11px] font-bold text-slate-900 leading-tight">Secure Payment</span>
                <span className="text-[10px] text-slate-500">UPI, Cards & More</span>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------- */}
          {/* COLUMN 3: DESKTOP SIDEBAR (IN-STOCK, DELIVERY, HIGHLIGHTS)      */}
          {/* --------------------------------------------------------------- */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4">
            {/* In Stock Card */}
            <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="block text-sm font-black text-emerald-800 leading-tight">
                  In Stock
                </span>
                <span className="text-xs text-emerald-700">Only 24 units left!</span>
              </div>
            </div>

            {/* Deliver to Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <MapPin className="w-4 h-4 text-[#002D62]" />
                  <span>Deliver to</span>
                </div>
                {editingPincode ? (
                  <button
                    onClick={() => setEditingPincode(false)}
                    className="text-slate-500 hover:text-slate-800 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingPincode(true)}
                    className="text-[#002D62] hover:underline font-bold text-xs"
                  >
                    Change
                  </button>
                )}
              </div>

              {editingPincode ? (
                <form onSubmit={handlePincodeSubmit} className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={tempPincode}
                    maxLength={6}
                    onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-[#002D62]"
                    placeholder="Enter 6-digit Pincode"
                  />
                  <button
                    type="submit"
                    className="bg-[#002D62] text-white px-3 py-1.5 text-xs font-bold rounded-lg hover:bg-blue-900 shrink-0"
                  >
                    Apply
                  </button>
                </form>
              ) : (
                <div className="text-sm font-black text-slate-900">{deliveryLocation}</div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Truck className="w-4 h-4 text-slate-400" />
                  <span>Delivery by <strong className="text-slate-900">Tue, 28 Oct – Wed, 29 Oct</strong></span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                  Free
                </span>
              </div>
            </div>

            {/* Key Highlights Card */}
            <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3.5">
                Key Highlights
              </h3>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-center gap-2.5">
                  <Volume2 className="w-4 h-4 text-[#002D62] shrink-0" />
                  <span className="font-semibold text-slate-800">Active Noise Cancellation</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 text-[#002D62] shrink-0" />
                  <span className="font-semibold text-slate-800">Personalized Spatial Audio</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <BatteryCharging className="w-4 h-4 text-[#002D62] shrink-0" />
                  <span className="font-semibold text-slate-800">
                    Up to 6 hrs Listening Time (30 hrs with case)
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-[#002D62] shrink-0" />
                  <span className="font-semibold text-slate-800">USB-C Charging</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Droplets className="w-4 h-4 text-[#002D62] shrink-0" />
                  <span className="font-semibold text-slate-800">IP54 Water & Sweat Resistant</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* TABS NAVIGATION (OVERVIEW, SPECS, REVIEWS, Q&A)                    */}
        {/* ================================================================= */}
        <section className="mt-10 sm:mt-12">
          <div className="flex items-center gap-2 sm:gap-3 border-b border-slate-200/80 pb-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "overview"
                  ? "bg-[#002D62] text-white shadow-sm"
                  : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "specs"
                  ? "bg-[#002D62] text-white shadow-sm"
                  : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80"
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "reviews"
                  ? "bg-[#002D62] text-white shadow-sm"
                  : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80"
              }`}
            >
              Reviews (2,417)
            </button>
            <button
              onClick={() => setActiveTab("qa")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "qa"
                  ? "bg-[#002D62] text-white shadow-sm"
                  : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80"
              }`}
            >
              Questions & Answers (36)
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="mt-6 sm:mt-8 space-y-6">
              {/* Feature Spotlight Card ("Experience Next-Level Sound") */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm overflow-hidden">
                <div className="flex-1 max-w-xl">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    Experience <span className="text-[#0052CC]">Next-Level Sound</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed mt-2.5">
                    AirPods Pro (2nd generation) deliver up to 2× more Active Noise Cancellation, with Adaptive Transparency, personalized Spatial Audio and all-day comfort.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                    <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 text-center flex flex-col items-center">
                      <Volume2 className="w-5 h-5 text-[#002D62] mb-1.5" />
                      <span className="text-[11px] font-bold text-slate-900 leading-tight">
                        2× Active Noise Cancellation
                      </span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 text-center flex flex-col items-center">
                      <Radio className="w-5 h-5 text-[#002D62] mb-1.5" />
                      <span className="text-[11px] font-bold text-slate-900 leading-tight">
                        Personalized Spatial Audio
                      </span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 text-center flex flex-col items-center">
                      <BatteryCharging className="w-5 h-5 text-[#002D62] mb-1.5" />
                      <span className="text-[11px] font-bold text-slate-900 leading-tight">
                        Up to 30 Hours with Case
                      </span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 text-center flex flex-col items-center">
                      <Droplets className="w-5 h-5 text-[#002D62] mb-1.5" />
                      <span className="text-[11px] font-bold text-slate-900 leading-tight">
                        IP54 Water Resistant
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Visual: Glowing Soundwave Banner with AirPods Earbuds */}
                <div className="w-full md:w-auto shrink-0 flex items-center justify-center">
                  <div className="relative w-full md:w-[380px] h-[190px] sm:h-[210px] rounded-2xl bg-gradient-to-r from-[#001433] via-[#002D62] to-[#0A4DB0] p-6 overflow-hidden flex items-center justify-center shadow-md">
                    {/* Glowing Soundwave Waveform SVG */}
                    <svg
                      className="absolute inset-0 w-full h-full opacity-60"
                      viewBox="0 0 400 200"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 100 Q 50 60, 100 100 T 200 100 T 300 100 T 400 100"
                        stroke="#38BDF8"
                        strokeWidth="2.5"
                        strokeDasharray="4 4"
                      />
                      <path
                        d="M0 100 Q 70 30, 140 100 T 280 100 T 400 100"
                        stroke="#00D2FF"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="animate-pulse"
                      />
                      <path
                        d="M0 100 Q 90 140, 180 100 T 360 100 T 400 100"
                        stroke="#818CF8"
                        strokeWidth="2"
                        opacity="0.5"
                      />
                    </svg>

                    {/* Floating Earbuds Isolated Cutout */}
                    <div className="relative z-10 w-48 h-36 flex items-center justify-center">
                      <img
                        src="/vittal/products/airpods-pro-earbuds.png"
                        alt="Apple AirPods Pro Earbuds Floating"
                        className="max-w-full max-h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPECIFICATIONS */}
          {activeTab === "specs" && (
            <div className="mt-6 sm:mt-8 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-6">Technical Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(activeProduct.specifications || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs sm:text-sm">
                    <span className="font-semibold text-slate-600">{key}</span>
                    <span className="font-bold text-slate-900 text-right max-w-xs">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: REVIEWS */}
          {activeTab === "reviews" && (
            <div className="mt-6 sm:mt-8 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <ProductReviewsSection
                productId={activeProduct.id}
                productName={activeProduct.name}
                fallbackRating={activeProduct.rating || 4.6}
                fallbackReviewCount={activeProduct.review_count || 2417}
              />
            </div>
          )}

          {/* TAB 4: QUESTIONS & ANSWERS */}
          {activeTab === "qa" && (
            <div className="mt-6 sm:mt-8 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-slate-900 mb-4">Frequently Asked Questions</h3>
              <div className="space-y-3">
                <details className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs sm:text-sm group cursor-pointer" open>
                  <summary className="font-bold text-slate-900 list-none flex items-center justify-between">
                    <span>Is this 100% genuine Apple retail stock?</span>
                    <ChevronDown className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-2 text-slate-600 leading-relaxed font-normal">
                    Yes, absolutely. All our units are sourced directly from authorized Apple distributors in Dubai and come sealed in factory packaging with an active Apple serial number verifiable on checkcoverage.apple.com.
                  </p>
                </details>

                <details className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs sm:text-sm group cursor-pointer">
                  <summary className="font-bold text-slate-900 list-none flex items-center justify-between">
                    <span>How does warranty service work across India?</span>
                    <ChevronDown className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-2 text-slate-600 leading-relaxed font-normal">
                    You receive 1-year international manufacturer coverage honored at authorized Apple service providers across India. Additionally, Vittal Digital provides direct customer concierge support via WhatsApp for any assistance.
                  </p>
                </details>

                <details className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs sm:text-sm group cursor-pointer">
                  <summary className="font-bold text-slate-900 list-none flex items-center justify-between">
                    <span>Does it come with USB-C or Lightning charging?</span>
                    <ChevronDown className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-2 text-slate-600 leading-relaxed font-normal">
                    This is the updated 2nd Generation edition featuring the MagSafe Charging Case with USB-C, built-in speaker, lanyard loop, and IP54 dust/water resistance.
                  </p>
                </details>
              </div>
            </div>
          )}
        </section>

        {/* ================================================================= */}
        {/* YOU MAY ALSO LIKE (6-PRODUCT GRID MATCHING DESIGN)                */}
        {/* ================================================================= */}
        <section className="mt-12 sm:mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              You May Also Like
            </h2>
            <Link
              href="/products?category=Audio+%26+Headphones"
              className="text-xs sm:text-sm font-bold text-[#002D62] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {RELATED_AUDIO_PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 flex flex-col justify-between hover:shadow-lg transition-all group"
              >
                {/* Top Badges */}
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded">
                    -{prod.discount}%
                  </span>
                  <button
                    onClick={() => toggleWishlist({ id: prod.id, name: prod.name, price: prod.price } as any)}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                    aria-label="Wishlist item"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </div>

                {/* Product Photo */}
                <Link href={prod.link} className="relative w-full h-32 sm:h-36 flex items-center justify-center p-2">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </Link>

                {/* Information */}
                <div className="mt-2">
                  <Link href={prod.link} className="block">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 hover:text-[#002D62] line-clamp-1">
                      {prod.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-slate-800">{prod.rating}</span>
                    <span>({prod.reviews})</span>
                  </div>

                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-sm sm:text-base font-black text-slate-900">
                      ₹{prod.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] text-slate-400 line-through">
                      ₹{prod.mrp.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Yellow Add to Cart Button */}
                <button
                  onClick={() => {
                    addToCart(
                      {
                        id: prod.id,
                        name: prod.name,
                        price: prod.price,
                        mrp: prod.mrp,
                        poster_image: prod.image,
                      },
                      1
                    );
                    setShowToast(`Added ${prod.name} to Cart!`);
                    openCart();
                  }}
                  className="mt-3 w-full bg-[#FFBE00] hover:bg-yellow-400 text-slate-950 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/* BOTTOM PROMOTIONAL BANNER                                         */}
        {/* ================================================================= */}
        <section className="mt-12 sm:mt-16 mb-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-[#001D40] via-[#002D62] to-[#0A4DB0] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between text-white overflow-hidden shadow-lg">
            <div className="z-10 max-w-md text-center md:text-left mb-6 md:mb-0">
              <span className="text-xs uppercase font-extrabold tracking-widest text-blue-200">
                Explore More
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#FFBE00] leading-tight mt-1">
                Audio & Headphones
              </h3>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-2">
                Discover world-class studio sound with active noise cancellation, lossless spatial acoustic drivers, and genuine Dubai import warranty.
              </p>
              <Link
                href="/products?category=Headphones+%26+Earbuds"
                className="inline-flex items-center gap-2 mt-5 bg-[#FFBE00] hover:bg-yellow-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all hover:scale-105"
              >
                <span>Shop the Collection</span>
                <span>→</span>
              </Link>
            </div>

            {/* Collage of Premium Devices */}
            <div className="relative z-10 w-full md:w-1/2 flex items-center justify-center">
              <img
                src="/vittal/products/bottom-banner-devices.jpg"
                alt="Audio & Headphones devices collection"
                className="max-h-56 sm:max-h-64 object-contain filter drop-shadow-2xl"
                loading="lazy"
              />
            </div>
          </div>
        </section>
      </main>

      {/* =================================================================== */}
      {/* MOBILE STICKY ACTION BAR (VISIBLE WHEN SCROLLED PAST HERO)          */}
      {/* =================================================================== */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 sm:hidden shadow-2xl flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={currentDisplayImage}
                alt={activeProduct.name}
                className="w-11 h-11 rounded-lg object-contain bg-slate-50 border border-slate-200 shrink-0"
              />
              <div className="truncate">
                <span className="text-xs font-black text-slate-900 block truncate">
                  {activeProduct.name}
                </span>
                <span className="text-sm font-black text-[#002D62]">
                  ₹{(activeProduct.offer_price || activeProduct.price).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleAddToCart}
                className="bg-[#FFBE00] text-slate-950 px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Cart</span>
              </button>
              <button
                onClick={handleBuyNow}
                className="bg-[#002D62] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-md"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Buy</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* IMAGE LIGHTBOX MODAL                                                */}
      {/* =================================================================== */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={currentDisplayImage}
            alt={activeProduct.name}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
