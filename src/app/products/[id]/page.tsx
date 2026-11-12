"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  ChevronDown,
  MapPin,
  Tag,
  ShoppingBag,
  Dumbbell,
  Layers,
  Award,
  Sparkles,
  Droplets,
  Ruler,
  CheckCircle2,
  X,
  ArrowLeft,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductReviewsSection } from "@/components/ProductReviewsSection";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { addRecentlyViewed } from "@/lib/recentlyViewed";
import { trackMetaPixelEvent } from "@/components/MetaPixelTracker";
import { launchFastrrCheckout } from "@/lib/fastrrClient";

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
  if (rawId.includes("whey") || rawId.includes("protein")) {
    return DEFAULT_PRODUCTS.find((p) => p.id === "whey-protein-isolate") || DEFAULT_PRODUCTS[0];
  }
  if (rawId.includes("dates") || rawId.includes("ajwa")) {
    return DEFAULT_PRODUCTS.find((p) => p.id === "premium-royal-dates") || DEFAULT_PRODUCTS[0];
  }
  if (rawId.includes("tshirt") || rawId.includes("shirt")) {
    return DEFAULT_PRODUCTS.find((p) => p.id === "oversized-athletic-tshirt") || DEFAULT_PRODUCTS[0];
  }
  if (rawId.includes("creatine")) {
    return DEFAULT_PRODUCTS.find((p) => p.id === "creatine-monohydrate") || DEFAULT_PRODUCTS[0];
  }
  if (rawId.includes("chocolate") || rawId.includes("candy") || rawId.includes("box")) {
    return (
      DEFAULT_PRODUCTS.find((p) => p.id === "premium-black-candy-box") ||
      DEFAULT_PRODUCTS.find((p) => p.id === "artisan-dark-chocolates") ||
      DEFAULT_PRODUCTS[0]
    );
  }
  if (rawId.includes("set") || rawId.includes("gym")) {
    return DEFAULT_PRODUCTS.find((p) => p.id === "athletic-gym-set") || DEFAULT_PRODUCTS[0];
  }

  return DEFAULT_PRODUCTS[0];
}

// ---------------------------------------------------------------------------
// Helper: Category-specific 4 Feature Highlights matching reference mockup
// ---------------------------------------------------------------------------
function getCategoryHighlights(category: string, name: string) {
  const cat = (category || "").toLowerCase();
  const n = (name || "").toLowerCase();

  if (cat.includes("supplement") || n.includes("protein") || n.includes("creatine") || n.includes("gainer")) {
    return [
      { icon: Dumbbell, label: "Build Lean Muscle" },
      { icon: Zap, label: "Boost Energy" },
      { icon: Flame, label: "Faster Recovery" },
      { icon: ShieldCheck, label: "Supports Immunity" },
    ];
  }
  if (cat.includes("outfit") || cat.includes("apparel") || n.includes("t-shirt") || n.includes("shirt") || n.includes("set")) {
    return [
      { icon: Sparkles, label: "Breathable Fit" },
      { icon: Droplets, label: "Sweat-Wicking" },
      { icon: Layers, label: "4-Way Stretch" },
      { icon: ShieldCheck, label: "Anti-Chafe Comfort" },
    ];
  }
  if (cat.includes("date") || cat.includes("nut") || n.includes("date") || n.includes("almond")) {
    return [
      { icon: Heart, label: "100% Pure & Raw" },
      { icon: Zap, label: "Natural Energy" },
      { icon: ShieldCheck, label: "Zero Additives" },
      { icon: Sparkles, label: "Antioxidant Rich" },
    ];
  }
  if (cat.includes("choc") || cat.includes("candy") || n.includes("choc")) {
    return [
      { icon: Award, label: "70% Dark Cocoa" },
      { icon: Zap, label: "Protein-Infused" },
      { icon: Heart, label: "Zero Trans Fats" },
      { icon: Sparkles, label: "Antioxidant Rich" },
    ];
  }

  return [
    { icon: Dumbbell, label: "Peak Performance" },
    { icon: Zap, label: "Daily Vitality" },
    { icon: ShieldCheck, label: "100% Authentic" },
    { icon: Award, label: "Premium Quality" },
  ];
}

// ---------------------------------------------------------------------------
// Helper: Category-specific variant / size selector
// ---------------------------------------------------------------------------
function getProductVariants(product: Product) {
  const cat = (product.category || "").toLowerCase();
  const n = (product.name || "").toLowerCase();

  if (cat.includes("supplement") || n.includes("protein") || n.includes("gainer")) {
    return {
      label: "Select Size",
      guideLabel: "Size Guide",
      options: ["1 kg", "2 kg", "5 kg"],
      defaultIndex: 0,
    };
  }
  if (n.includes("creatine")) {
    return {
      label: "Select Weight",
      guideLabel: "Usage Guide",
      options: ["100g", "250g", "500g"],
      defaultIndex: 1,
    };
  }
  if (cat.includes("outfit") || cat.includes("apparel") || n.includes("t-shirt") || n.includes("set")) {
    return {
      label: "Select Size",
      guideLabel: "Size Guide",
      options: ["S", "M", "L", "XL", "XXL"],
      defaultIndex: 1, // M
    };
  }
  if (cat.includes("date") || cat.includes("nut") || n.includes("date") || n.includes("almond")) {
    return {
      label: "Select Weight",
      guideLabel: "Guide",
      options: ["250g", "500g", "1 kg"],
      defaultIndex: 1,
    };
  }
  if (cat.includes("choc") || cat.includes("candy") || n.includes("candy")) {
    return {
      label: "Select Pack",
      guideLabel: "Guide",
      options: ["16 Pcs (250g)", "32 Pcs (500g)"],
      defaultIndex: 0,
    };
  }
  return {
    label: "Select Option",
    guideLabel: "Guide",
    options: ["Standard", "Pro"],
    defaultIndex: 0,
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = (params?.id as string) || "";

  const { addItem, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product>(() => resolveProduct(idOrSlug));
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [showStickyBar, setShowStickyBar] = useState<boolean>(false);

  // Accordion state
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    details: true,
    nutrition: false,
    reviews: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Delivery estimation
  const [pincode, setPincode] = useState<string>("680001");
  const [deliveryLocation, setDeliveryLocation] = useState<string>("Thrissur, Kerala - 680001");
  const [editingPincode, setEditingPincode] = useState<boolean>(false);
  const [tempPincode, setTempPincode] = useState<string>("680001");

  // Fetch live product from API
  useEffect(() => {
    let isMounted = true;
    const targetProduct = resolveProduct(idOrSlug);
    if (isMounted) {
      setProduct(targetProduct);
      setSelectedImageIndex(0);
      const variants = getProductVariants(targetProduct);
      setSelectedVariantIndex(variants.defaultIndex);
    }

    const rawId = decodeURIComponent(idOrSlug || "").trim();
    fetch(`/api/products?id=${encodeURIComponent(rawId)}&_t=${Date.now()}`)
      .then((r) => r.json())
      .then((data) => {
        if (isMounted && data.success && data.product) {
          setProduct(data.product);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [idOrSlug]);

  // Track Meta Pixel ViewContent & add to recently viewed
  useEffect(() => {
    if (product && (product.id || product.slug)) {
      addRecentlyViewed(product);
      try {
        trackMetaPixelEvent("ViewContent", {
          contentName: product.name,
          contentIds: [product.id],
          contentType: "product",
          value: product.offer_price || product.price,
          currency: "INR",
        });
      } catch {}
    }
  }, [product]);

  // Handle sticky bar scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 450) {
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
  // Product Gallery with vertical rail thumbnails
  // -------------------------------------------------------------------------
  const galleryImages = useMemo(() => {
    if (!activeProduct) return [];
    if (activeProduct.images && activeProduct.images.length > 1) {
      return activeProduct.images;
    }
    const poster = activeProduct.poster_image || "/vittal/product-whey-protein-jar.png";
    // For whey protein, add complementary angles/showcases for a full gallery rail
    if (activeProduct.id.includes("whey") || activeProduct.name.toLowerCase().includes("whey")) {
      return [
        poster,
        "/vittal/banner-showcase-protein.png",
        "/vittal/hero-fitness-gold.png",
        "/vittal/product-glossy-dates.png",
      ];
    }
    if (activeProduct.id.includes("dates") || activeProduct.name.toLowerCase().includes("dates")) {
      return [
        poster,
        "/vittal/banner-showcase-protein.png",
        "/vittal/hero-fitness-gold.png",
      ];
    }
    return [poster];
  }, [activeProduct]);

  const currentDisplayImage = galleryImages[selectedImageIndex] || galleryImages[0];

  const variantsConfig = useMemo(() => getProductVariants(activeProduct), [activeProduct]);
  const categoryHighlights = useMemo(() => getCategoryHighlights(activeProduct.category || "", activeProduct.name || ""), [activeProduct]);

  const isWish = isInWishlist(activeProduct.id);

  const discountPercent =
    activeProduct.mrp && activeProduct.price
      ? Math.round(((activeProduct.mrp - activeProduct.price) / activeProduct.mrp) * 100)
      : 29;

  // Related products (from other items in the catalogue)
  const relatedProducts = useMemo(() => {
    return DEFAULT_PRODUCTS.filter((p) => p.id !== activeProduct.id).slice(0, 5);
  }, [activeProduct]);

  const handleAddToCart = () => {
    if (!activeProduct) return;
    const selectedVariant = variantsConfig.options[selectedVariantIndex] || "";

    addItem(
      {
        id: activeProduct.id,
        slug: activeProduct.slug || activeProduct.id,
        name: `${activeProduct.name}${selectedVariant ? ` (${selectedVariant})` : ""}`,
        price: activeProduct.offer_price || activeProduct.price,
        mrp: activeProduct.mrp,
        offer_price: activeProduct.offer_price || activeProduct.price,
        stock_count: activeProduct.stock_count || 50,
        poster_image: currentDisplayImage,
        in_stock: activeProduct.in_stock ?? 1,
        category: activeProduct.category || "Fitness",
        tagline: activeProduct.tagline || "",
        description: activeProduct.description || "",
      },
      quantity
    );

    setShowToast("Added to Cart successfully!");
    openCart();

    try {
      trackMetaPixelEvent("AddToCart", {
        contentName: activeProduct.name,
        contentIds: [activeProduct.id],
        contentType: "product",
        value: (activeProduct.offer_price || activeProduct.price) * quantity,
        currency: "INR",
        numItems: quantity,
      });
    } catch {}
  };

  const handleBuyNow = () => {
    if (!activeProduct) return;
    const selectedVariant = variantsConfig.options[selectedVariantIndex] || "";
    const id = activeProduct.id;
    const name = `${activeProduct.name}${selectedVariant ? ` (${selectedVariant})` : ""}`;
    const price = activeProduct.offer_price || activeProduct.price;
    const image = currentDisplayImage;

    addItem(
      {
        id,
        slug: activeProduct.slug || id,
        name,
        price,
        mrp: activeProduct.mrp,
        offer_price: price,
        stock_count: activeProduct.stock_count || 50,
        poster_image: image,
        in_stock: activeProduct.in_stock ?? 1,
        category: activeProduct.category || "Fitness",
        tagline: activeProduct.tagline || "",
        description: activeProduct.description || "",
      },
      quantity
    );

    try {
      launchFastrrCheckout([{ id, name, price, quantity, image }]);
    } catch {
      router.push(`/checkout?productId=${id}&qty=${quantity}`);
    }
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

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-mograph selection:bg-[#E5F2D0] selection:text-[#1E300E] pb-24 md:pb-12">
      {/* 1. Global Navigation Bar */}
      <Navbar />

      {/* 2. Top Sub-Navigation Bar matching home page clean borders (< Back, Share, Wishlist) */}
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between border-b border-neutral-200/80">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="w-8 h-8 rounded-full bg-[#F7F8FA] hover:bg-[#EFF1F4] border border-neutral-200 text-neutral-700 hover:text-black flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="Share Product"
            aria-label="Share product"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              toggleWishlist({
                id: activeProduct.id,
                name: activeProduct.name,
                price: activeProduct.price,
                image: currentDisplayImage,
              });
            }}
            className={`w-8 h-8 rounded-full bg-[#F7F8FA] hover:bg-[#EFF1F4] border border-neutral-200 flex items-center justify-center transition-colors cursor-pointer shadow-2xs ${
              isWish ? "text-rose-500 border-rose-200 bg-rose-50" : "text-neutral-700 hover:text-black"
            }`}
            title="Wishlist Product"
            aria-label="Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isWish ? "fill-rose-500 text-rose-500" : "stroke-current"}`} />
          </button>
        </div>
      </div>

      {/* 3. Main Product Showcase */}
      <main className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
          
          {/* =============================================================== */}
          {/* LEFT COLUMN: PRODUCT GALLERY WITH VERTICAL THUMBNAIL RAIL       */}
          {/* =============================================================== */}
          <div className="lg:col-span-6 flex flex-row gap-3 sm:gap-4 items-start">
            {/* Vertical Thumbnail Rail (Matching mockup) */}
            <div className="flex flex-col gap-2.5 shrink-0">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-13 h-13 sm:w-16 sm:h-16 rounded-2xl p-1.5 transition-all flex items-center justify-center overflow-hidden shrink-0 cursor-pointer ${
                    selectedImageIndex === idx
                      ? "bg-[#F2F8EB] border-2 border-[#6B9E3A] shadow-xs"
                      : "bg-[#F7F8FA] hover:bg-[#EFF1F4] border border-neutral-200/80 opacity-80 hover:opacity-100"
                  }`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`${activeProduct.name} thumb ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>

            {/* Main Stage Image (Transparent Cutout floating on soft light backdrop) */}
            <div className="relative flex-1 aspect-square rounded-3xl bg-gradient-to-b from-[#F2F8EB] via-[#F8FAF4] to-[#FFFFFF] border border-neutral-200/80 flex items-center justify-center p-6 sm:p-10 overflow-hidden group select-none shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
              {/* Expand Fullscreen Button */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-neutral-200 text-neutral-700 hover:text-black flex items-center justify-center transition-all cursor-pointer shadow-xs"
                title="Expand fullscreen"
                aria-label="Expand fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Prev / Next navigation for desktop gallery */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white border border-neutral-200 text-neutral-700 hover:text-black flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100 shadow-xs"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white border border-neutral-200 text-neutral-700 hover:text-black flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100 shadow-xs"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Central Floating Product Photo */}
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={currentDisplayImage}
                  alt={activeProduct.name}
                  className="max-w-full max-h-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.12)] group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Soft Radial Backlight Glow */}
              <div className="absolute inset-0 bg-radial from-[#9CD33B]/10 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* =============================================================== */}
          {/* RIGHT COLUMN: PRODUCT INFO & PURCHASE CONTROLS                 */}
          {/* =============================================================== */}
          <div className="lg:col-span-6 flex flex-col justify-start">
            {/* Brand Header Line: VITTAL LIFESTYLE ───── */}
            <div className="flex items-center gap-3 mb-1.5">
              <span className="font-movault text-[11px] font-bold tracking-[0.25em] uppercase text-[#6B9E3A]">
                VITTAL LIFESTYLE
              </span>
              <div className="h-[1px] w-12 bg-[#6B9E3A]/30" />
            </div>

            {/* Product Title */}
            <h1 className="font-mograph text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-950 tracking-tight leading-tight mb-2">
              {activeProduct.name}
            </h1>

            {/* Ratings & Reviews Row */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current stroke-current" />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-neutral-500 font-medium">
                {activeProduct.rating || 4.6} ({activeProduct.review_count ? activeProduct.review_count.toLocaleString() : "12,548"} Reviews)
              </span>
            </div>

            {/* Price & Discount Row */}
            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-mograph text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-950">
                ₹{(activeProduct.offer_price || activeProduct.price).toLocaleString("en-IN")}
              </span>
              {activeProduct.mrp && activeProduct.mrp > (activeProduct.offer_price || activeProduct.price) && (
                <span className="font-mograph text-base sm:text-lg text-neutral-400 line-through">
                  ₹{activeProduct.mrp.toLocaleString("en-IN")}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="font-movault bg-[#E5F2D0] text-[#3B581C] border border-[#BBDC92]/60 text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Tagline / Subtitle */}
            <p className="font-mograph text-xs sm:text-sm text-neutral-500 font-medium mb-4">
              {activeProduct.tagline || activeProduct.subtitle || "Pure Protein. Maximum Performance."}
            </p>

            {/* ============================================================= */}
            {/* 4 FEATURE HIGHLIGHTS GRID (Matching reference mockup)         */}
            {/* ============================================================= */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 py-4 my-2 border-y border-neutral-200/80">
              {categoryHighlights.map((hl, idx) => {
                const IconComponent = hl.icon;
                return (
                  <div key={idx} className="flex flex-col items-center text-center">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#E5F2D0] border border-[#D5EBBF] flex items-center justify-center text-[#3B581C] mb-1.5 shadow-2xs">
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
                    </div>
                    <span className="font-mograph text-[10px] sm:text-xs text-neutral-800 font-bold leading-tight line-clamp-2">
                      {hl.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* ============================================================= */}
            {/* VARIANT / SIZE SELECTOR (Matching reference mockup)           */}
            {/* ============================================================= */}
            <div className="my-3">
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-mograph text-xs sm:text-sm font-bold text-neutral-900">
                  {variantsConfig.label}
                </span>
                <button
                  type="button"
                  onClick={() => toggleAccordion("nutrition")}
                  className="text-xs text-neutral-500 hover:text-[#6B9E3A] flex items-center gap-1 transition-colors cursor-pointer font-medium"
                >
                  <span>{variantsConfig.guideLabel}</span>
                  <Ruler className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {variantsConfig.options.map((opt, idx) => {
                  const isSelected = selectedVariantIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedVariantIndex(idx)}
                      className={`font-mograph text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "border-2 border-[#6B9E3A] bg-[#F2F8EB] text-[#284214] font-bold shadow-xs"
                          : "border border-neutral-200 bg-[#F7F8FA] hover:bg-[#EFF1F4] text-neutral-700 hover:text-neutral-950"
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#6B9E3A] stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper & In-Stock Status */}
            <div className="flex items-center justify-between gap-4 my-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="font-mograph text-xs font-bold text-neutral-600">Qty:</span>
                <div className="flex items-center border border-neutral-200 rounded-xl bg-[#F7F8FA] px-2 py-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-neutral-950 disabled:opacity-30 transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-neutral-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-neutral-950 transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* In Stock Badge */}
              <div className="flex items-center gap-1.5 bg-[#E5F2D0] border border-[#BBDC92]/60 rounded-xl px-3 py-1.5 text-xs font-bold text-[#3B581C]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3B581C] shrink-0" />
                <span>In Stock • Only {activeProduct.stock_count || 50} left</span>
              </div>
            </div>

            {/* ============================================================= */}
            {/* PRIMARY ACTION BUTTONS: Add to Cart & Buy Now                 */}
            {/* ============================================================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 my-4 font-movault tracking-wider uppercase">
              <button
                onClick={handleAddToCart}
                className="bg-[#111111] hover:bg-black active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all text-sm sm:text-base cursor-pointer hover:-translate-y-0.5"
              >
                <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="bg-[#95CF42] hover:bg-[#85BE33] active:scale-[0.98] text-neutral-950 font-black py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-[#95CF42]/20 transition-all text-sm sm:text-base cursor-pointer hover:-translate-y-0.5"
              >
                <Zap className="w-4 h-4 fill-neutral-950 text-neutral-950" />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Delivery Pincode Card */}
            <div className="rounded-2xl bg-[#F7F8FA] border border-neutral-200/80 p-3.5 my-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-1.5 text-neutral-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#6B9E3A]" />
                  <span>Deliver to</span>
                </div>
                {editingPincode ? (
                  <button
                    onClick={() => setEditingPincode(false)}
                    className="text-neutral-500 hover:text-neutral-900 text-xs cursor-pointer font-medium"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingPincode(true)}
                    className="text-[#6B9E3A] hover:underline font-bold text-xs cursor-pointer"
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
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:outline-[#6B9E3A]"
                    placeholder="Enter 6-digit Pincode"
                  />
                  <button
                    type="submit"
                    className="bg-[#111111] text-white px-3 py-1.5 text-xs font-bold rounded-lg hover:bg-black shrink-0 cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              ) : (
                <div className="text-xs sm:text-sm font-semibold text-neutral-900">{deliveryLocation}</div>
              )}

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-200/70 text-xs">
                <div className="flex items-center gap-1.5 text-neutral-600">
                  <Truck className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Express Doorstep Delivery in 2–4 Business Days</span>
                </div>
                <span className="bg-[#E5F2D0] text-[#3B581C] font-bold px-2 py-0.5 rounded text-[10px]">
                  FREE
                </span>
              </div>
            </div>

            {/* ============================================================= */}
            {/* EXPANDABLE ACCORDIONS: Product Details, Nutrition, Reviews    */}
            {/* ============================================================= */}
            <div className="divide-y divide-neutral-200 border-t border-neutral-200 mt-4">
              {/* Accordion 1: Product Details */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion("details")}
                  className="w-full flex items-center justify-between text-left font-mograph text-sm sm:text-base font-bold text-neutral-950 hover:text-[#6B9E3A] transition-colors cursor-pointer py-1"
                >
                  <span>Product Details</span>
                  <span className="text-lg font-light text-neutral-400">
                    {openAccordions.details ? "−" : "+"}
                  </span>
                </button>
                {openAccordions.details && (
                  <div className="pt-2 pb-1 text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal space-y-2.5">
                    <p>{activeProduct.description}</p>
                    {activeProduct.features && activeProduct.features.length > 0 && (
                      <ul className="space-y-1.5 pt-1">
                        {activeProduct.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-[#6B9E3A] shrink-0 mt-0.5 stroke-[2.5]" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 2: Nutrition Facts / Specifications */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion("nutrition")}
                  className="w-full flex items-center justify-between text-left font-mograph text-sm sm:text-base font-bold text-neutral-950 hover:text-[#6B9E3A] transition-colors cursor-pointer py-1"
                >
                  <span>Nutrition Facts &amp; Specifications</span>
                  <span className="text-lg font-light text-neutral-400">
                    {openAccordions.nutrition ? "−" : "+"}
                  </span>
                </button>
                {openAccordions.nutrition && (
                  <div className="pt-2 pb-1 text-xs sm:text-sm text-neutral-600">
                    {activeProduct.specifications && Object.keys(activeProduct.specifications).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(activeProduct.specifications).map(([k, v]) => (
                          <div
                            key={k}
                            className="flex justify-between items-center p-2.5 bg-[#F7F8FA] rounded-xl border border-neutral-200/80"
                          >
                            <span className="text-neutral-500 font-medium">{k}</span>
                            <span className="font-bold text-neutral-900 text-right">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-neutral-500">
                        100% genuine formulation, tested for purity and quality assurance.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 3: Reviews */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion("reviews")}
                  className="w-full flex items-center justify-between text-left font-mograph text-sm sm:text-base font-bold text-neutral-950 hover:text-[#6B9E3A] transition-colors cursor-pointer py-1"
                >
                  <span>
                    Reviews ({activeProduct.review_count ? activeProduct.review_count.toLocaleString() : "12,548"})
                  </span>
                  <span className="text-lg font-light text-neutral-400">
                    {openAccordions.reviews ? "−" : "+"}
                  </span>
                </button>
                {openAccordions.reviews && (
                  <div className="pt-3 pb-1 bg-white text-neutral-900 rounded-2xl p-4 sm:p-6 my-2 border border-neutral-200/80">
                    <ProductReviewsSection
                      productId={activeProduct.id}
                      productName={activeProduct.name}
                      fallbackRating={activeProduct.rating || 4.6}
                      fallbackReviewCount={activeProduct.review_count || 12548}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* YOU MAY ALSO LIKE (Related Products Grid Matching Home Page)       */}
        {/* ================================================================= */}
        <section className="mt-12 sm:mt-16 pt-8 border-t border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-movault text-xl sm:text-3xl font-bold uppercase tracking-wider text-neutral-950">
              You May Also Like
            </h2>
            <Link
              href="/products"
              className="font-mograph text-xs sm:text-sm font-semibold text-[#6B9E3A] hover:text-[#527C2B] flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 w-full">
            {relatedProducts.map((prod) => {
              const isRelWish = isInWishlist(prod.id);
              const relDiscount =
                prod.mrp && prod.mrp > prod.price
                  ? Math.round(((prod.mrp - prod.price) / prod.mrp) * 100)
                  : null;

              return (
                <div
                  key={prod.id}
                  className="group relative rounded-3xl bg-white border border-neutral-200/80 hover:border-[#6B9E3A]/50 p-3 sm:p-4 flex flex-col justify-between transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist({
                        id: prod.id,
                        name: prod.name,
                        price: prod.price,
                        image: prod.poster_image,
                      });
                    }}
                    className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-neutral-400 hover:text-neutral-900 flex items-center justify-center transition-colors shadow-2xs"
                    aria-label="Wishlist"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 transition-colors ${
                        isRelWish ? "fill-rose-500 text-rose-500" : "stroke-current"
                      }`}
                    />
                  </button>

                  <Link
                    href={`/products/${prod.id || prod.slug}`}
                    className="relative aspect-square w-full rounded-2xl bg-gradient-to-b from-[#F2F8EB] via-[#F8FAF4] to-[#FFFFFF] p-3 flex items-center justify-center overflow-hidden mb-2.5"
                  >
                    <img
                      src={prod.poster_image || "/vittal/product-whey-protein-jar.png"}
                      alt={prod.name}
                      className="max-w-full max-h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/products/${prod.id || prod.slug}`} className="block">
                        <h3 className="font-semibold text-xs sm:text-sm text-neutral-900 group-hover:text-[#6B9E3A] transition-colors leading-snug line-clamp-2 min-h-[34px] sm:min-h-[38px] mb-1">
                          {prod.name}
                        </h3>
                      </Link>

                      <p className="font-mograph text-[10px] sm:text-xs text-neutral-400 font-medium mb-1.5 truncate">
                        {prod.category}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1.5 mb-2 flex-wrap">
                        <span className="font-mograph text-sm sm:text-base font-extrabold text-neutral-950">
                          ₹{prod.price.toLocaleString("en-IN")}
                        </span>
                        {prod.mrp && prod.mrp > prod.price && (
                          <span className="font-mograph text-[11px] sm:text-xs text-neutral-400 line-through">
                            ₹{prod.mrp.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      {/* Discount Badge & Add to Cart Button */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-100">
                        {relDiscount ? (
                          <span className="bg-[#E5F2D0] text-[#3B581C] text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center">
                            {relDiscount}% OFF
                          </span>
                        ) : (
                          <span className="font-mograph text-[10px] text-neutral-400 font-medium">In Stock</span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addItem(
                              {
                                id: prod.id,
                                slug: prod.slug || prod.id,
                                name: prod.name,
                                price: prod.price,
                                mrp: prod.mrp,
                                offer_price: prod.price,
                                stock_count: prod.stock_count || 50,
                                poster_image: prod.poster_image || "/vittal/product-whey-protein-jar.png",
                                in_stock: prod.in_stock ?? 1,
                                category: prod.category || "Fitness",
                                tagline: prod.tagline || "",
                                description: prod.description || "",
                              },
                              1
                            );
                            setShowToast(`Added ${prod.name} to Cart!`);
                            openCart();
                          }}
                          className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-2xl bg-[#E5F2D0] hover:bg-[#D5EBBF] text-[#3B581C] hover:text-[#284214] flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                          title="Add to Cart"
                          aria-label="Add to Cart"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* =================================================================== */}
      {/* MOBILE STICKY ACTION BAR                                            */}
      {/* =================================================================== */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 px-4 py-3 sm:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3 font-movault tracking-wider uppercase"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={currentDisplayImage}
                alt={activeProduct.name}
                className="w-10 h-10 rounded-xl object-contain bg-[#F7F8FA] border border-neutral-200 shrink-0 p-1"
              />
              <div className="truncate font-mograph">
                <span className="text-xs font-bold text-neutral-900 block truncate">
                  {activeProduct.name}
                </span>
                <span className="text-sm font-extrabold text-[#6B9E3A]">
                  ₹{(activeProduct.offer_price || activeProduct.price).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleAddToCart}
                className="bg-[#111111] hover:bg-black text-white px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Cart</span>
              </button>
              <button
                onClick={handleBuyNow}
                className="bg-[#95CF42] hover:bg-[#85BE33] text-neutral-950 px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all"
              >
                <Zap className="w-3.5 h-3.5 fill-neutral-950 text-neutral-950" />
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
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10 cursor-pointer"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={currentDisplayImage}
            alt={activeProduct.name}
            className="max-h-[85vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#111111] text-white border border-[#6B9E3A]/40 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#95CF42]" />
            <span>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
