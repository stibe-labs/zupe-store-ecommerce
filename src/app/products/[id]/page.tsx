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
  Tv,
  Gamepad2,
  HardDrive,
  Cpu,
  Camera,
  Watch,
  Smartphone,
  Laptop,
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
// Helper: Resolve product synchronously for instant SSR & 0ms client hydration
// ---------------------------------------------------------------------------
function resolveProduct(idOrSlug: string): Product {
  const rawId = decodeURIComponent(idOrSlug || "").trim().toLowerCase();
  const cleanId = rawId.replace(/[-_ ]+/g, "");

  // 1. Exact ID or exact Slug match
  const exact = DEFAULT_PRODUCTS.find(
    (p) => p.id.toLowerCase() === rawId || (p.slug && p.slug.toLowerCase() === rawId)
  );
  if (exact) return exact;

  // 2. Normalized alphanumeric match
  const norm = DEFAULT_PRODUCTS.find(
    (p) =>
      p.id.toLowerCase().replace(/[-_ ]+/g, "") === cleanId ||
      (p.slug && p.slug.toLowerCase().replace(/[-_ ]+/g, "") === cleanId)
  );
  if (norm) return norm;

  // 3. Keyword / partial matching
  if (rawId.includes("victus") || rawId.includes("hp")) {
    return DEFAULT_PRODUCTS.find((p) => p.id === "hp-victus-15") || DEFAULT_PRODUCTS[0];
  }
  if (rawId.includes("dualsense") || rawId.includes("ps5") || rawId.includes("controller")) {
    return DEFAULT_PRODUCTS.find((p) => p.id === "dualsense-ps5") || DEFAULT_PRODUCTS[0];
  }
  if (rawId.includes("s24") || rawId.includes("galaxy-s24")) {
    return DEFAULT_PRODUCTS.find((p) => p.id === "galaxy-s24-256") || DEFAULT_PRODUCTS[0];
  }
  if (rawId.includes("watch6") || rawId.includes("galaxy-watch")) {
    return DEFAULT_PRODUCTS.find((p) => p.id === "galaxy-watch6") || DEFAULT_PRODUCTS[0];
  }
  if (rawId.includes("iphone") || rawId.includes("iphone-15")) {
    return DEFAULT_PRODUCTS.find((p) => p.id === "iphone-15-128") || DEFAULT_PRODUCTS[0];
  }
  if (rawId.includes("jbl") || rawId.includes("charge")) {
    return DEFAULT_PRODUCTS.find((p) => p.id === "jbl-charge-5") || DEFAULT_PRODUCTS[0];
  }
  if (rawId.includes("ideapad") || rawId.includes("lenovo")) {
    return DEFAULT_PRODUCTS.find((p) => p.id === "lenovo-ideapad-slim5") || DEFAULT_PRODUCTS[0];
  }
  if (rawId.includes("tab") || rawId.includes("s9")) {
    return DEFAULT_PRODUCTS.find((p) => p.id === "galaxy-tab-s9-124") || DEFAULT_PRODUCTS[0];
  }
  if (rawId.includes("ultragear") || rawId.includes("monitor")) {
    return DEFAULT_PRODUCTS.find((p) => p.id === "lg-ultragear-27") || DEFAULT_PRODUCTS[0];
  }
  if (rawId.includes("oneplus") || rawId.includes("12r")) {
    return DEFAULT_PRODUCTS.find((p) => p.id === "oneplus-12r-16gb") || DEFAULT_PRODUCTS[0];
  }
  if (rawId.includes("max") && rawId.includes("airpod")) {
    return DEFAULT_PRODUCTS.find((p) => p.id === "airpods-max-pink") || DEFAULT_PRODUCTS[0];
  }
  if (rawId.includes("airpod")) {
    return DEFAULT_PRODUCTS.find((p) => p.id === "airpods-pro-2") || DEFAULT_PRODUCTS[0];
  }
  if (rawId.includes("speaker")) {
    return DEFAULT_PRODUCTS.find((p) => p.id === "portable-bluetooth-speaker") || DEFAULT_PRODUCTS[0];
  }
  if (rawId.includes("power") || rawId.includes("bank")) {
    return DEFAULT_PRODUCTS.find((p) => p.id === "compact-power-bank") || DEFAULT_PRODUCTS[0];
  }
  if (rawId.includes("watch")) {
    return DEFAULT_PRODUCTS.find((p) => p.id === "smart-watch-pro") || DEFAULT_PRODUCTS[0];
  }
  if (rawId.includes("laptop")) {
    return DEFAULT_PRODUCTS.find((p) => p.id === "ultraslim-laptop-14") || DEFAULT_PRODUCTS[0];
  }

  return DEFAULT_PRODUCTS[0];
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params?.id as string;
  const { user } = useAuth();
  const { addToCart, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Initialize synchronously with exact matching product (zero delay / zero default to AirPods)
  const [product, setProduct] = useState<Product>(() => resolveProduct(idOrSlug));
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string>(() => {
    const p = resolveProduct(idOrSlug);
    return p.colors && p.colors.length > 0 ? p.colors[0].name : p.color || "Standard";
  });
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "reviews" | "qa">("overview");
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [pincode, setPincode] = useState<string>("680001");
  const [deliveryLocation, setDeliveryLocation] = useState<string>("Thrissur, Kerala - 680001");
  const [editingPincode, setEditingPincode] = useState<boolean>(false);
  const [tempPincode, setTempPincode] = useState<string>("680001");
  const [showToast, setShowToast] = useState<string | null>(null);
  const [showStickyBar, setShowStickyBar] = useState<boolean>(false);

  // -------------------------------------------------------------------------
  // Dynamic Product Resolution (Sync & Live Fetch)
  // -------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;
    const targetProduct = resolveProduct(idOrSlug);
    if (isMounted) {
      setProduct(targetProduct);
      setSelectedImageIndex(0);
      if (targetProduct.colors && targetProduct.colors.length > 0) {
        setSelectedColor(targetProduct.colors[0].name);
      } else if (targetProduct.color) {
        setSelectedColor(targetProduct.color);
      }
    }

    // Try fetching fresh live product from API
    const rawId = decodeURIComponent(idOrSlug || "").trim();
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

  // -------------------------------------------------------------------------
  // Product Gallery (Dynamic per product)
  // -------------------------------------------------------------------------
  const galleryImages = useMemo(() => {
    if (!activeProduct) return [];
    if (activeProduct.id === "airpods-pro-2") {
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

  // -------------------------------------------------------------------------
  // Dynamic Category Highlights based on actual product
  // -------------------------------------------------------------------------
  const categoryHighlights = useMemo(() => {
    const cat = (activeProduct.category || "").toLowerCase();
    const name = activeProduct.name.toLowerCase();

    if (cat.includes("laptop")) {
      return [
        { icon: Cpu, label: "High-Performance Multi-Core Processor" },
        { icon: Zap, label: "Dedicated Ultra-Fast Graphics" },
        { icon: HardDrive, label: "PCIe Gen4 NVMe High-Speed SSD" },
        { icon: Tv, label: "144Hz IPS / OLED Vivid Display" },
        { icon: BatteryCharging, label: "Rapid Charge Long-Life Battery" },
      ];
    }
    if (cat.includes("smartwatch") || name.includes("watch")) {
      return [
        { icon: Watch, label: "Super AMOLED Always-On Display" },
        { icon: Heart, label: "Advanced ECG & Heart Rate Sensor" },
        { icon: BatteryCharging, label: "Multi-Day Fast Wireless Charging" },
        { icon: Droplets, label: "5ATM + IP68 Water Resistance" },
        { icon: Radio, label: "Bluetooth Calling & Dual-Band GPS" },
      ];
    }
    if (cat.includes("smartphones") || name.includes("phone")) {
      return [
        { icon: Camera, label: "Pro-Grade High-Resolution Camera" },
        { icon: Zap, label: "Next-Gen Flagship Processor" },
        { icon: Tv, label: "120Hz ProXDR / Dynamic AMOLED" },
        { icon: Radio, label: "5G Cellular with Dual SIM" },
        { icon: BatteryCharging, label: "All-Day Battery with Fast Charge" },
      ];
    }
    if (cat.includes("gaming") || name.includes("dualsense") || name.includes("controller")) {
      return [
        { icon: Gamepad2, label: "Immersive Haptic Feedback" },
        { icon: Zap, label: "Dynamic Adaptive Force Triggers" },
        { icon: Radio, label: "Ultra-Low Latency Wireless Connectivity" },
        { icon: Check, label: "Ergonomic Textured Pro Grip" },
        { icon: BatteryCharging, label: "Rechargeable USB-C Fast Battery" },
      ];
    }
    if (cat.includes("speaker")) {
      return [
        { icon: Volume2, label: "High-Output Punchy 360° Stereo Bass" },
        { icon: BatteryCharging, label: "Up to 20h Playback with Powerbank" },
        { icon: Droplets, label: "IP67 Waterproof & Dustproof" },
        { icon: Radio, label: "Wireless Multi-Speaker Pairing" },
        { icon: CreditCard, label: "USB-C Fast Charging Interface" },
      ];
    }
    // Default: Audio / Earbuds
    return [
      { icon: Volume2, label: "Active Noise Cancellation" },
      { icon: Radio, label: "Personalized Spatial Audio" },
      { icon: BatteryCharging, label: "Up to 6 hrs Listening Time (30 hrs with case)" },
      { icon: CreditCard, label: "USB-C Fast Charging" },
      { icon: Droplets, label: "IP54 Water & Sweat Resistant" },
    ];
  }, [activeProduct]);

  // -------------------------------------------------------------------------
  // Dynamic Spotlight Banner
  // -------------------------------------------------------------------------
  const spotlightBanner = useMemo(() => {
    const cat = (activeProduct.category || "").toLowerCase();
    const name = activeProduct.name.toLowerCase();

    if (cat.includes("laptop")) {
      return {
        title: "Experience",
        highlight: "Next-Level Performance",
        desc: `${activeProduct.name} delivers breakthrough processing speed, thermal precision, and smooth visuals for intense multitasking, creation, and gaming.`,
        pills: [
          { icon: Cpu, label: "Next-Gen Processor" },
          { icon: Zap, label: "Dedicated GPU Speed" },
          { icon: BatteryCharging, label: "Rapid Fast Charge" },
          { icon: Tv, label: "High-Refresh Screen" },
        ],
      };
    }
    if (cat.includes("smartwatch") || name.includes("watch")) {
      return {
        title: "Beauty & Power",
        highlight: "On Your Wrist",
        desc: `${activeProduct.name} pairs aerospace-grade materials with 24/7 health tracking, sleep coaching, and seamless smartphone notifications.`,
        pills: [
          { icon: Watch, label: "AMOLED Always-On" },
          { icon: Heart, label: "ECG & Heart Rate" },
          { icon: BatteryCharging, label: "Multi-Day Battery" },
          { icon: Droplets, label: "Water & Dust Resistant" },
        ],
      };
    }
    if (cat.includes("smartphones") || name.includes("phone")) {
      return {
        title: "Experience",
        highlight: "Flagship Innovation",
        desc: `${activeProduct.name} sets the standard with pro-level optics, all-day power efficiency, and fluid 120Hz display clarity.`,
        pills: [
          { icon: Camera, label: "High-Res Optics" },
          { icon: Zap, label: "Blazing Processor" },
          { icon: BatteryCharging, label: "All-Day Power" },
          { icon: Radio, label: "5G High Speed" },
        ],
      };
    }
    if (cat.includes("gaming") || name.includes("controller")) {
      return {
        title: "Bring Gaming",
        highlight: "Worlds To Life",
        desc: `${activeProduct.name} heightens your gaming senses with adaptive trigger resistance, haptic vibrations, and seamless wireless response.`,
        pills: [
          { icon: Gamepad2, label: "Haptic Feedback" },
          { icon: Zap, label: "Adaptive Triggers" },
          { icon: BatteryCharging, label: "Rechargeable Battery" },
          { icon: Radio, label: "Ultra-Low Latency" },
        ],
      };
    }
    return {
      title: "Experience",
      highlight: "Next-Level Sound",
      desc: "Delivers deep acoustic clarity, active noise cancellation, adaptive transparency, personalized spatial audio, and all-day comfort.",
      pills: [
        { icon: Volume2, label: "Active Noise Cancellation" },
        { icon: Radio, label: "Personalized Spatial Audio" },
        { icon: BatteryCharging, label: "Up to 30h with Case" },
        { icon: Droplets, label: "IP54 Water Resistant" },
      ],
    };
  }, [activeProduct]);

  // -------------------------------------------------------------------------
  // Dynamic Related Products ("You May Also Like")
  // -------------------------------------------------------------------------
  const relatedProducts = useMemo(() => {
    const list = DEFAULT_PRODUCTS.filter((p) => p.id !== activeProduct.id);
    // Prioritize products in the same category
    const sameCat = list.filter((p) => p.category === activeProduct.category);
    const otherCat = list.filter((p) => p.category !== activeProduct.category);
    return [...sameCat, ...otherCat].slice(0, 6);
  }, [activeProduct]);

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
            <Link href={`/products?category=${encodeURIComponent(activeProduct.category || "All")}`} className="hover:text-[#002D62] transition-colors shrink-0">
              {activeProduct.category || "Electronics"}
            </Link>
            {activeProduct.subcategory && (
              <>
                <span className="text-slate-300">›</span>
                <span className="hover:text-[#002D62] transition-colors shrink-0">
                  {activeProduct.subcategory}
                </span>
              </>
            )}
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
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 rounded-lg"
                    loading="lazy"
                  />
                  {idx === galleryImages.length - 1 && galleryImages.length > 3 && (
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-xs">
                        <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* MAIN STAGE IMAGE BOX - 100% FILLED IN THAT SQUARE             */}
            {/* ------------------------------------------------------------- */}
            <div className="relative flex-1 aspect-square rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white overflow-hidden select-none group shadow-sm">
              {/* Bestseller Badge */}
              <div className="absolute top-4 left-4 z-10 bg-[#FFBE00] text-slate-900 px-3 py-1 rounded-md text-xs font-black tracking-wide flex items-center gap-1.5 shadow-sm">
                <span>👑</span>
                <span>{activeProduct.badge || "Bestseller"}</span>
              </div>

              {/* Fullscreen Zoom Button */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md flex items-center justify-center transition-all hover:scale-105"
                title="Expand fullscreen"
                aria-label="Expand image fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Left & Right Chevrons */}
              <button
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Product Main Image - 100% FILLED TO CORNERS */}
              <div className="w-full h-full flex items-center justify-center overflow-hidden bg-slate-50">
                <img
                  src={currentDisplayImage}
                  alt={activeProduct.name}
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Dots Carousel Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full shadow-xs">
                {galleryImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`transition-all rounded-full ${
                      selectedImageIndex === i
                        ? "bg-[#002D62] w-5 h-2"
                        : "bg-slate-300 hover:bg-slate-400 w-2 h-2"
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
              <span>{activeProduct.specifications?.Brand || activeProduct.category || "Vittal Digital"}</span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
              {activeProduct.name}
            </h1>

            {/* Subtitle / Key Spec Badges */}
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 leading-relaxed">
              {activeProduct.subtitle || activeProduct.tagline}
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
                <span>{activeProduct.sold_count || "4,800+ Sold"}</span>
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
            {activeProduct.colors && activeProduct.colors.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-slate-700 mb-2">
                  Color: <span className="text-slate-900 font-bold">{selectedColor}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {activeProduct.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                        selectedColor === c.name
                          ? "border-[#002D62] ring-2 ring-blue-500/30 scale-105"
                          : "border-slate-300 hover:border-slate-500"
                      }`}
                      style={{ backgroundColor: c.colorHex || "#000" }}
                      aria-label={`Color ${c.name}`}
                    >
                      <span className="sr-only">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Stock status */}
            <div className="flex items-center justify-between gap-4 mt-5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-300/80 rounded-xl bg-white shadow-xs px-2 py-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-30 transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-black text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
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
                  <span className="text-[10px] font-normal text-slate-500">Only {activeProduct.stock_count || 24} units left!</span>
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
                <span className="text-[10px] text-slate-500">Official Support</span>
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
                <span className="text-xs text-emerald-700">Only {activeProduct.stock_count || 24} units left!</span>
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
                    className="text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingPincode(true)}
                    className="text-[#002D62] hover:underline font-bold text-xs cursor-pointer"
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
                    className="bg-[#002D62] text-white px-3 py-1.5 text-xs font-bold rounded-lg hover:bg-blue-900 shrink-0 cursor-pointer"
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

            {/* Key Highlights Card (Dynamic based on Category) */}
            <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3.5">
                Key Highlights
              </h3>
              <ul className="space-y-3 text-xs text-slate-700">
                {categoryHighlights.map((hl, idx) => {
                  const Icon = hl.icon;
                  return (
                    <li key={idx} className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[#002D62] shrink-0" />
                      <span className="font-semibold text-slate-800">{hl.label}</span>
                    </li>
                  );
                })}
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
              Reviews ({activeProduct.review_count?.toLocaleString() || "2,417"})
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
              {/* Feature Spotlight Card (Dynamic based on product category) */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm overflow-hidden">
                <div className="flex-1 max-w-xl">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    {spotlightBanner.title} <span className="text-[#0052CC]">{spotlightBanner.highlight}</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed mt-2.5">
                    {spotlightBanner.desc}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                    {spotlightBanner.pills.map((pill, i) => {
                      const Icon = pill.icon;
                      return (
                        <div key={i} className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 text-center flex flex-col items-center">
                          <Icon className="w-5 h-5 text-[#002D62] mb-1.5" />
                          <span className="text-[11px] font-bold text-slate-900 leading-tight">
                            {pill.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Visual: Beautiful Glowing Stage with Product Cutout */}
                <div className="w-full md:w-auto shrink-0 flex items-center justify-center">
                  <div className="relative w-full md:w-[380px] h-[190px] sm:h-[210px] rounded-2xl bg-gradient-to-r from-[#001433] via-[#002D62] to-[#0A4DB0] p-6 overflow-hidden flex items-center justify-center shadow-md">
                    {/* Glowing Audio/Electric Waveform SVG */}
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

                    {/* Floating Product Image Cutout */}
                    <div className="relative z-10 w-48 h-36 flex items-center justify-center">
                      <img
                        src={currentDisplayImage}
                        alt={activeProduct.name}
                        className="max-w-full max-h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Feature Highlights List */}
              {activeProduct.features && activeProduct.features.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900 mb-4">Key Features & Benefits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {activeProduct.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span className="font-medium leading-relaxed">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                    <span>Is this 100% genuine sealed retail stock?</span>
                    <ChevronDown className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-2 text-slate-600 leading-relaxed font-normal">
                    Yes, absolutely. All our items are imported directly from authorized distribution hubs in Dubai and come brand new, sealed in original manufacturer packaging with valid serial numbers.
                  </p>
                </details>

                <details className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs sm:text-sm group cursor-pointer">
                  <summary className="font-bold text-slate-900 list-none flex items-center justify-between">
                    <span>How does warranty service work across India?</span>
                    <ChevronDown className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-2 text-slate-600 leading-relaxed font-normal">
                    You receive 1-year comprehensive international coverage honored across India. Additionally, Vittal Digital provides direct customer concierge support via WhatsApp for any technical or service assistance.
                  </p>
                </details>

                <details className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs sm:text-sm group cursor-pointer">
                  <summary className="font-bold text-slate-900 list-none flex items-center justify-between">
                    <span>What is the delivery timeline to my address?</span>
                    <ChevronDown className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-2 text-slate-600 leading-relaxed font-normal">
                    Orders are dispatched within 24 hours via express insured air courier. Most major cities across India receive doorstep delivery within 2 to 4 business days with real-time tracking updates.
                  </p>
                </details>
              </div>
            </div>
          )}
        </section>

        {/* ================================================================= */}
        {/* YOU MAY ALSO LIKE (DYNAMIC RELATED PRODUCTS GRID)                 */}
        {/* ================================================================= */}
        <section className="mt-12 sm:mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              You May Also Like
            </h2>
            <Link
              href={`/products?category=${encodeURIComponent(activeProduct.category || "All")}`}
              className="text-xs sm:text-sm font-bold text-[#002D62] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {relatedProducts.map((prod) => {
              const relDiscount = prod.mrp && prod.price ? Math.round(((prod.mrp - prod.price) / prod.mrp) * 100) : 25;
              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 flex flex-col justify-between hover:shadow-lg transition-all group"
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded">
                      -{relDiscount}%
                    </span>
                    <button
                      onClick={() => toggleWishlist(prod)}
                      className="text-slate-400 hover:text-rose-500 transition-colors"
                      aria-label="Wishlist item"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Product Photo - Filled Square */}
                  <Link href={`/products/${prod.slug || prod.id}`} className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center">
                    <img
                      src={prod.poster_image || prod.images?.[0] || "/vittal/products/airpods-pro.jpg"}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  </Link>

                  {/* Information */}
                  <div className="mt-2.5">
                    <Link href={`/products/${prod.slug || prod.id}`} className="block">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 hover:text-[#002D62] line-clamp-1">
                        {prod.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-slate-800">{prod.rating || 4.6}</span>
                      <span>({prod.review_count || 1200})</span>
                    </div>

                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-sm sm:text-base font-black text-slate-900">
                        ₹{(prod.offer_price || prod.price).toLocaleString("en-IN")}
                      </span>
                      {prod.mrp && (
                        <span className="text-[11px] text-slate-400 line-through">
                          ₹{prod.mrp.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Yellow Add to Cart Button */}
                  <button
                    onClick={() => {
                      addToCart(
                        {
                          id: prod.id,
                          name: prod.name,
                          price: prod.offer_price || prod.price,
                          mrp: prod.mrp,
                          poster_image: prod.poster_image,
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
              );
            })}
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
                {activeProduct.category || "Audio & Electronics"}
              </h3>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-2">
                Discover world-class consumer electronics, genuine Dubai import warranty, insured express delivery, and transparent pricing.
              </p>
              <Link
                href={`/products?category=${encodeURIComponent(activeProduct.category || "All")}`}
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
                alt="Electronics devices collection"
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
                className="w-11 h-11 rounded-lg object-cover bg-slate-50 border border-slate-200 shrink-0"
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
