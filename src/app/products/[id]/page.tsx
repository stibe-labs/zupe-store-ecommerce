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
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Plus,
  Minus,
  Check,
  ChevronDown,
  Play,
  X,
  SquarePen,
  Settings,
  Package,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UpiLogo } from "@/components/UpiLogo";
import { ProductReviewsSection } from "@/components/ProductReviewsSection";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params?.id as string;
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string>("Standard");
  const [quantity, setQuantity] = useState<number>(1);
  const [showStickyBar, setShowStickyBar] = useState<boolean>(false);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    details: true,
    specs: false,
    box: false,
    shipping: false,
    returns: false,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const { addToCart, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const applyProduct = (found: Product) => {
    setProduct(found);
    const initialColor =
      found.colors && found.colors.length > 0
        ? found.colors[0].name
        : found.color || "Standard";
    setSelectedColor(initialColor);

    const firstColorObj =
      found.colors && found.colors.length > 0
        ? found.colors.find((c) => c.name.toLowerCase() === initialColor.toLowerCase()) || found.colors[0]
        : null;

    const defaultImg =
      firstColorObj?.images?.[0] ||
      firstColorObj?.image ||
      (found.images && Array.isArray(found.images) && found.images.length > 0
        ? found.images[0]
        : found.poster_image || "");

    setSelectedImage(defaultImg);
    setActiveImageIndex(0);
  };

  // Load product by slug or ID with priority on fresh live API data
  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      // 1. Fetch fresh live product by ID from API
      try {
        const res = await fetch(`/api/products?id=${encodeURIComponent(idOrSlug)}&_t=${Date.now()}`);
        const data = await res.json();
        if (isMounted && data.success && data.product) {
          applyProduct(data.product);
          return;
        }
      } catch (e) {
        // continue
      }

      // 2. Fetch fresh live product by Slug from API
      try {
        const res = await fetch(`/api/products?slug=${encodeURIComponent(idOrSlug)}&_t=${Date.now()}`);
        const data = await res.json();
        if (isMounted && data.success && data.product) {
          applyProduct(data.product);
          return;
        }
      } catch (e) {
        // continue
      }

      // 3. Fallback to full catalog API
      try {
        const res = await fetch(`/api/products?_t=${Date.now()}`);
        const data = await res.json();
        if (isMounted && data.products) {
          const apiFound = data.products.find(
            (p: Product) => p.slug === idOrSlug || p.id === idOrSlug
          );
          if (apiFound) {
            applyProduct(apiFound);
            return;
          }
        }
      } catch (e) {
        // continue
      }

      // 4. Fallback to DEFAULT_PRODUCTS
      const staticFound = DEFAULT_PRODUCTS.find(
        (p) => p.slug === idOrSlug || p.id === idOrSlug
      );
      if (isMounted && staticFound) {
        applyProduct(staticFound);
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [idOrSlug]);

  // Handle scroll to only show sticky bottom bar once scrolled past top action buttons
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > 380) {
          setShowStickyBar(true);
        } else {
          setShowStickyBar(false);
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const isOutOfStock = useMemo(() => {
    if (!product) return false;
    return product.in_stock === 0 || (product.stock_count !== undefined && product.stock_count <= 0);
  }, [product]);

  const isRippleLamp = useMemo(() => {
    if (!product) return false;
    return product.id === "ripple-lamp" || product.slug?.includes("ripple");
  }, [product]);

  // Currently active color variant object
  const activeColorVariant = useMemo(() => {
    if (!product?.colors || product.colors.length === 0) return null;
    return (
      product.colors.find((c) => c.name.toLowerCase() === selectedColor.toLowerCase()) ||
      product.colors[0]
    );
  }, [product, selectedColor]);

  // Gallery images derived from active color's different angle photos, or product.images, or poster_image
  const gallery = useMemo(() => {
    if (!product) return [];
    if (activeColorVariant?.images && activeColorVariant.images.length > 0) {
      return activeColorVariant.images;
    }
    if (activeColorVariant?.image) {
      return [activeColorVariant.image];
    }
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    return [product.poster_image || ""];
  }, [product, activeColorVariant]);

  // Available color options for current product
  const availableColors = useMemo(() => {
    if (product?.colors && product.colors.length > 0) {
      return product.colors;
    }
    return [];
  }, [product]);

  // Product-specific feature bullet points
  const productHighlights = useMemo(() => {
    if (!product) return [];
    if (product.features && Array.isArray(product.features) && product.features.length > 0) {
      return product.features.map((feat: any) => {
        if (typeof feat === "string") {
          return { icon: "✨", text: feat };
        }
        return { icon: feat.icon || "✨", text: feat.text || String(feat) };
      });
    }
    if (isRippleLamp) {
      return [
        { icon: "✨", text: "Creates a calming ocean water ripple effect on walls & ceilings" },
        { icon: "🏠", text: "Perfect ambient lighting for bedroom, study, or living room" },
        { icon: "🎨", text: "16 RGB colors + wireless remote control + touch switch" },
        { icon: "🪷", text: "Enhances mood, relaxation, and deep sleep" },
        { icon: "🎁", text: "Ideal luxury gift in premium packaging" },
      ];
    }
    if (product.id === "mini-portable-steam-iron" || product.slug?.includes("iron")) {
      return [
        { icon: "⚡", text: "Rapid 30-second quick heat-up technology" },
        { icon: "👔", text: "Dual wet & dry ironing modes for all delicate and heavy fabrics" },
        { icon: "✈️", text: "Compact 180° foldable handle designed for travel & suitcase storage" },
        { icon: "🛡️", text: "Ceramic titanium non-stick soleplate protects garments from burns" },
        { icon: "💧", text: "Integrated 50ml leak-proof micro water reservoir with steam boost" },
      ];
    }
    if (product.id === "menstrual-heating-pad" || product.slug?.includes("heating-pad")) {
      return [
        { icon: "🔥", text: "3 Intelligent heat settings (45°C - 65°C) warming in 3 seconds" },
        { icon: "💆‍♀️", text: "4 Multi-frequency soothing acoustic vibration massage modes" },
        { icon: "🌸", text: "Ultra-soft skin-friendly plush velvet contact backing" },
        { icon: "🔋", text: "High-capacity wireless rechargeable battery for portable relief" },
        { icon: "🎀", text: "Elastic adjustable waistband fits comfortably on waist and abdomen" },
      ];
    }
    if (product.id === "mesh-nebulizer" || product.slug?.includes("nebulizer")) {
      return [
        { icon: "💨", text: "Ultra-fine <5µm atomized mist for rapid bronchial absorption" },
        { icon: "🤫", text: "Whisper-quiet <25dB silent operation for sleeping babies" },
        { icon: "🔋", text: "Dual power: USB cable or AA batteries for emergency portability" },
        { icon: "👶", text: "Includes child mask, adult mask, and inhalation mouthpiece" },
        { icon: "🎒", text: "Palm-sized ergonomic body weighs only 90 grams" },
      ];
    }
    if (product.id === "mini-washing-machine" || product.slug?.includes("washing-machine")) {
      return [
        { icon: "🌀", text: "Powerful forward and reverse ultrasonic wave motor" },
        { icon: "🧺", text: "Generous 8L capacity for delicates, socks, baby clothes, and towels" },
        { icon: "📦", text: "Collapsible accordion design compresses down to 4 inches" },
        { icon: "💧", text: "Includes dedicated detachable spin-dry drain basket" },
        { icon: "⏱️", text: "3 Smart wash timer settings (3min, 5min, 10min) with 1 touch" },
      ];
    }
    if (product.id === "mini-printer" || product.slug?.includes("printer")) {
      return [
        { icon: "🖨️", text: "Zero ink or toner required — prints cleanly via thermal technology" },
        { icon: "📱", text: "Instant Bluetooth connectivity with iOS & Android companion app" },
        { icon: "📝", text: "Print study flashcards, shopping lists, labels, and retro photos" },
        { icon: "🔋", text: "Built-in 1000mAh rechargeable battery prints up to 10 paper rolls" },
        { icon: "🎒", text: "Pocket-sized body slips easily into backpacks and handbags" },
      ];
    }
    return [
      { icon: "✨", text: product.tagline || product.subtitle || "Premium quality build and materials" },
      { icon: "📦", text: product.volume || "Verified authentic Zupe Store original product" },
      { icon: "🚚", text: "Fast doorstep courier dispatch with Cash on Delivery available" },
      { icon: "🔄", text: "7-day replacement guarantee & hassle-free returns" },
      { icon: "⭐", text: `${product.rating ? product.rating.toFixed(1) : "4.8"} out of 5 stars customer satisfaction` },
    ];
  }, [product, isRippleLamp]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto py-32 px-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center text-[#FA521C]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">The product you are looking for may have been moved or is currently unavailable.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#FA521C] text-white font-semibold text-sm shadow-md"
          >
            Browse All Products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const discountPercent =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 35;

  const handleSelectImage = (img: string, idx: number) => {
    setSelectedImage(img);
    setActiveImageIndex(idx);
    if (idx === 5 && isRippleLamp) {
      setVideoModalOpen(true);
    }
  };

  const handleSelectColorSwatch = (colorName: string, imgSrc: string) => {
    setSelectedColor(colorName);
    const colorObj = product?.colors?.find((c) => c.name.toLowerCase() === colorName.toLowerCase());
    const firstImg = colorObj?.images?.[0] || colorObj?.image || imgSrc;
    setSelectedImage(firstImg);
    setActiveImageIndex(0);
  };

  const toggleAccordion = (section: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      showToast("Sorry, this item is currently out of stock!");
      return;
    }
    if (!user) {
      try {
        localStorage.setItem(
          "zp_pending_cart_action",
          JSON.stringify({
            action: "add_to_cart",
            product: {
              ...product,
              color: selectedColor,
              poster_image: selectedImage || product.poster_image,
            },
            quantity,
            autoOpenCart: true,
          })
        );
      } catch (e) {}
      const currentPath = typeof window !== "undefined" ? window.location.pathname : `/products/${idOrSlug}`;
      router.push(`/signin?redirect=${encodeURIComponent(currentPath)}&notice=${encodeURIComponent("Please sign in to add this item to your cart")}`);
      return;
    }
    const added = addToCart(
      {
        ...product,
        color: selectedColor,
        poster_image: selectedImage || product.poster_image,
      },
      quantity
    );
    if (added) {
      showToast(`Added ${quantity} item(s) to Cart! 🛒`);
      openCart();
    }
  };

  const handleCashOnDelivery = () => {
    if (isOutOfStock) {
      showToast("Sorry, this item is currently out of stock!");
      return;
    }
    if (!user) {
      try {
        localStorage.setItem(
          "zp_pending_cart_action",
          JSON.stringify({
            action: "buy_now",
            product: {
              ...product,
              color: selectedColor,
              poster_image: selectedImage || product.poster_image,
            },
            quantity,
            method: "cod",
          })
        );
      } catch (e) {}
      router.push(`/signin?redirect=${encodeURIComponent("/checkout?method=cod")}&notice=${encodeURIComponent("Please sign in to place an order")}`);
      return;
    }
    addToCart(
      {
        ...product,
        color: selectedColor,
        poster_image: selectedImage || product.poster_image,
      },
      quantity
    );
    router.push("/checkout?method=cod");
  };

  const handleBuyWithUpi = () => {
    if (isOutOfStock) {
      showToast("Sorry, this item is currently out of stock!");
      return;
    }
    if (!user) {
      try {
        localStorage.setItem(
          "zp_pending_cart_action",
          JSON.stringify({
            action: "buy_now",
            product: {
              ...product,
              color: selectedColor,
              poster_image: selectedImage || product.poster_image,
            },
            quantity,
            method: "upi",
          })
        );
      } catch (e) {}
      router.push(`/signin?redirect=${encodeURIComponent("/checkout?method=upi")}&notice=${encodeURIComponent("Please sign in to place an order")}`);
      return;
    }
    addToCart(
      {
        ...product,
        color: selectedColor,
        poster_image: selectedImage || product.poster_image,
      },
      quantity
    );
    router.push("/checkout?method=upi");
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on Zupestore!`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Dismissed by user
      }
    } else {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        showToast("Link copied to clipboard! 📋");
      }
    }
  };

  const handleWishlistClick = () => {
    if (!user) {
      try {
        localStorage.setItem(
          "zp_pending_wishlist_action",
          JSON.stringify({
            action: "wishlist",
            product,
          })
        );
      } catch (e) {}
      const currentPath = typeof window !== "undefined" ? window.location.pathname : `/products/${idOrSlug}`;
      router.push(`/signin?redirect=${encodeURIComponent(currentPath)}&notice=${encodeURIComponent("Please sign in to save items to your wishlist")}`);
      return;
    }
    const success = toggleWishlist(product);
    if (success) {
      showToast(wishlisted ? "Removed from Wishlist" : "Saved to Wishlist! ❤️");
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1E1E1E] antialiased pb-28 lg:pb-16 selection:bg-[#FA521C]/20 selection:text-[#FA521C]">
      {/* Top App Header */}
      <Navbar />

      {/* Main Container */}
      <main className="max-w-[480px] sm:max-w-2xl lg:max-w-5xl mx-auto px-4 sm:px-6 pt-2 sm:pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12 items-start">
          
          {/* ========================================================
              LEFT COLUMN: HERO IMAGE & THUMBNAILS CAROUSEL
             ======================================================== */}
          <div className="w-full">
            {/* Main Showcase Image Container */}
            <div className="relative aspect-square w-full rounded-[24px] sm:rounded-[28px] overflow-hidden bg-[#F3F4F6] shadow-sm select-none">
              <Image
                src={selectedImage || gallery[0]}
                alt={product.name}
                fill
                priority
                className="object-cover transition-opacity duration-300"
              />

              {/* Top-Left Badge: Discount */}
              {discountPercent > 0 && (
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#FF3B30] text-white text-[12px] font-extrabold tracking-tight shadow-md">
                    -{discountPercent}%
                  </span>
                </div>
              )}

              {/* Top-Right Floating Action Buttons: Wishlist & Share */}
              <div className="absolute top-3.5 right-3.5 z-10 flex flex-col gap-2.5">
                <button
                  onClick={handleWishlistClick}
                  className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md shadow-md flex items-center justify-center text-gray-700 hover:text-[#FF3B30] hover:scale-105 active:scale-95 transition-all"
                  aria-label="Wishlist"
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      wishlisted ? "fill-[#FF3B30] text-[#FF3B30]" : "text-gray-800 stroke-[2.2]"
                    }`}
                  />
                </button>

                <button
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md shadow-md flex items-center justify-center text-gray-800 hover:text-black hover:scale-105 active:scale-95 transition-all"
                  aria-label="Share"
                >
                  <Share2 className="w-5 h-5 text-gray-800 stroke-[2.2]" />
                </button>
              </div>

              {/* Bottom-Right Counter Badge */}
              <div className="absolute bottom-3.5 right-3.5 z-10">
                <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold tracking-wide">
                  {activeImageIndex + 1}/{gallery.length}
                </span>
              </div>
            </div>

            {/* Thumbnail Gallery Carousel */}
            {gallery.length > 1 && (
              <div className="mt-3 flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none select-none">
                {gallery.map((img, idx) => {
                  const isActive = activeImageIndex === idx;
                  const isVideo = idx === 5 && isRippleLamp;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectImage(img, idx)}
                      className={`relative w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] rounded-[16px] overflow-hidden flex-shrink-0 transition-all ${
                        isActive
                          ? "border-2 border-black ring-1 ring-black/10 scale-100"
                          : "border border-gray-200 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                      />

                      {isVideo && (
                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow">
                            <Play className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600 ml-0.5" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ========================================================
              RIGHT COLUMN: TITLE, PRICE, CTA BUTTONS, TRUST BADGES,
              COLOR SWATCHES, ACCORDIONS & REVIEWS
             ======================================================== */}
          <div className="w-full mt-4 lg:mt-0">
            {/* Product Title */}
            <h1 className="text-[20px] sm:text-[24px] font-display font-bold text-[#111111] leading-snug tracking-tight">
              {product.name}
            </h1>
            {product.subtitle && (
              <p className="text-[13px] sm:text-[14px] text-gray-500 font-medium mt-0.5">
                {product.subtitle}
              </p>
            )}

            {/* Rating & Sold Stats Row */}
            <a
              href="#reviews"
              className="inline-flex items-center gap-2 mt-1.5 text-xs text-[#6B7280] hover:text-[#FA521C] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-0.5 text-[#F59E0B] group-hover:scale-105 transition-transform">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="font-semibold text-gray-800 group-hover:text-[#FA521C]">
                ({product.rating ? product.rating.toFixed(1) : "4.8"})
              </span>
              <span className="text-gray-300">|</span>
              <span className="underline decoration-dotted underline-offset-2">
                {product.sold_count || "1,250+ verified orders"} • Customer Reviews ↓
              </span>
            </a>

            {/* Price & Discount Row */}
            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="text-[26px] sm:text-[30px] font-extrabold text-[#111111] tracking-tight">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-[15px] sm:text-[16px] text-gray-400 line-through font-normal">
                  ₹{product.mrp.toLocaleString("en-IN")}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-[#FFE8EC] text-[#FF334B] text-[12px] font-extrabold tracking-tight">
                  {discountPercent}% OFF
                </span>
              )}
            </div>
            <p className="text-[12px] text-gray-400 -mt-0.5">Inclusive of all taxes & free shipping</p>

            {/* Inline Action Buttons (Row 1: Dual Outlined Buttons) */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`py-3 px-3 rounded-xl border font-bold text-[13px] sm:text-[14px] flex items-center justify-center gap-2 transition-all shadow-xs ${
                  isOutOfStock
                    ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                    : "border-[#FA521C] text-[#FA521C] bg-white hover:bg-[#FFF4F0] active:scale-[0.98]"
                }`}
              >
                <ShoppingCart className="w-4 h-4 stroke-[2.2]" />
                <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
              </button>

              <button
                onClick={handleCashOnDelivery}
                disabled={isOutOfStock}
                className={`py-3 px-3 rounded-xl border font-bold text-[13px] sm:text-[14px] flex items-center justify-center gap-2 transition-all shadow-xs ${
                  isOutOfStock
                    ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                    : "border-[#FA521C] text-[#FA521C] bg-white hover:bg-[#FFF4F0] active:scale-[0.98]"
                }`}
              >
                <Truck className="w-4 h-4 stroke-[2.2]" />
                <span>{isOutOfStock ? "Unavailable" : "Cash on Delivery"}</span>
              </button>
            </div>

            {/* Inline Action Button (Row 2: BUY NOW WITH UPI) */}
            <div className="mt-2.5">
              <button
                onClick={handleBuyWithUpi}
                disabled={isOutOfStock}
                className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-[14px] sm:text-[15px] flex items-center justify-center gap-2.5 transition-all ${
                  isOutOfStock
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70"
                    : "bg-gradient-to-r from-[#FF4D15] via-[#FF451A] to-[#FA3B00] hover:brightness-105 active:scale-[0.99] text-white shadow-md shadow-[#FA521C]/25"
                }`}
              >
                {isOutOfStock ? (
                  <span>CURRENTLY OUT OF STOCK</span>
                ) : (
                  <>
                    <span className="tracking-wide">BUY NOW WITH</span>
                    <UpiLogo className="h-4.5" />
                  </>
                )}
              </button>
            </div>

            {/* 4 Trust Badges Horizontal Grid */}
            <div className="mt-4 p-3 rounded-2xl bg-white border border-gray-100 shadow-xs grid grid-cols-4 gap-1 text-center select-none">
              <div className="flex flex-col items-center justify-center px-1">
                <Truck className="w-5 h-5 text-gray-800 stroke-[1.8] mb-1" />
                <span className="text-[11px] sm:text-[12px] font-bold text-gray-900 leading-tight">
                  Free Shipping
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-500 leading-tight mt-0.5">
                  on all orders
                </span>
              </div>

              <div className="flex flex-col items-center justify-center px-1">
                <ShieldCheck className="w-5 h-5 text-gray-800 stroke-[1.8] mb-1" />
                <span className="text-[11px] sm:text-[12px] font-bold text-gray-900 leading-tight">
                  Cash on Delivery
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-500 leading-tight mt-0.5">
                  Available
                </span>
              </div>

              <div className="flex flex-col items-center justify-center px-1">
                <RotateCcw className="w-5 h-5 text-gray-800 stroke-[1.8] mb-1" />
                <span className="text-[11px] sm:text-[12px] font-bold text-gray-900 leading-tight">
                  Easy Returns
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-500 leading-tight mt-0.5">
                  7 days free
                </span>
              </div>

              <div className="flex flex-col items-center justify-center px-1">
                <Headphones className="w-5 h-5 text-gray-800 stroke-[1.8] mb-1" />
                <span className="text-[11px] sm:text-[12px] font-bold text-gray-900 leading-tight">
                  24/7
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-500 leading-tight mt-0.5">
                  Support
                </span>
              </div>
            </div>

            {/* Color / Variant Selector - Universal for all products */}
            {availableColors.length > 0 ? (
              <div className="mt-5">
                <h3 className="text-[13px] sm:text-[14px] font-bold text-gray-900 mb-2">
                  Color: <span className="font-semibold text-[#FA521C]">{selectedColor}</span>
                </h3>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {availableColors.map((c, i) => {
                    const isSelected = selectedColor.toLowerCase() === c.name.toLowerCase();
                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectColorSwatch(c.name, c.image)}
                        className={`relative w-12 h-12 rounded-[14px] overflow-hidden flex-shrink-0 transition-all duration-200 ${
                          isSelected
                            ? "ring-2 ring-[#FA521C] ring-offset-2 scale-105 shadow-md"
                            : "border border-gray-200 opacity-80 hover:opacity-100 hover:scale-105"
                        }`}
                        title={c.name}
                        aria-label={c.name}
                        aria-pressed={isSelected}
                      >
                        <Image
                          src={c.image}
                          alt={c.name}
                          fill
                          className="object-cover"
                        />
                        {c.colorHex && (
                          <span
                            className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-white/80 shadow-sm"
                            style={{ backgroundColor: c.colorHex }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
                {activeColorVariant?.images && activeColorVariant.images.length > 1 && (
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    {activeColorVariant.images.length} photos for {selectedColor}
                  </p>
                )}
              </div>
            ) : product.color ? (
              <div className="mt-5">
                <h3 className="text-[13px] sm:text-[14px] font-bold text-gray-900 mb-1">
                  Color: <span className="font-semibold text-[#FA521C]">{product.color}</span>
                </h3>
              </div>
            ) : null}

            {/* Quantity Selector & Real-Time Stock Status */}
            <div className="mt-4">
              <h3 className="text-[13px] font-bold text-gray-900 mb-2">
                Quantity
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-xl bg-white shadow-xs p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={isOutOfStock}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-colors disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock_count || 99, q + 1))}
                    disabled={isOutOfStock}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-colors disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold">
                  {!isOutOfStock ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      <span className="text-emerald-600">In Stock ({product.stock_count} units available)</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                      <span className="text-rose-600 font-extrabold uppercase tracking-wide">Currently Out of Stock</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* "Why You'll Love This ❤️" Card */}
            <div className="mt-5 p-4 sm:p-5 rounded-[20px] bg-[#F8F9FA] border border-gray-100">
              <h3 className="text-[14px] sm:text-[15px] font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                <span>Why You'll Love This</span>
                <span>❤️</span>
              </h3>
              <ul className="space-y-2 text-[13px] text-gray-700 leading-relaxed font-normal">
                {productHighlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-base select-none">{item.icon}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ========================================================
                COLLAPSIBLE ACCORDIONS (DYNAMIC SPECIFICATIONS)
               ======================================================== */}
            <div className="mt-6 space-y-2.5 border-t border-gray-100 pt-5">
              {/* 1. Product Details */}
              <div className="border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleAccordion("details")}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <SquarePen className="w-5 h-5 text-gray-700 stroke-[1.8]" />
                    <span className="font-bold text-[14px] sm:text-[15px] text-gray-900">
                      Product Details & Overview
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      openAccordions.details ? "rotate-180 text-gray-800" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openAccordions.details && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 pt-1 text-[13px] text-gray-600 leading-relaxed space-y-2 border-t border-gray-50"
                    >
                      <p>{product.description}</p>
                      {product.tagline && (
                        <p className="font-semibold text-gray-800 italic">
                          "{product.tagline}"
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 2. Specifications */}
              <div className="border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleAccordion("specs")}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-gray-700 stroke-[1.8]" />
                    <span className="font-bold text-[14px] sm:text-[15px] text-gray-900">
                      Specifications & Details
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      openAccordions.specs ? "rotate-180 text-gray-800" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openAccordions.specs && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 pt-1 text-[13px] text-gray-600 leading-relaxed border-t border-gray-50"
                    >
                      <div className="divide-y divide-gray-100">
                        <div className="py-2 flex justify-between">
                          <span className="font-medium text-gray-500">Category</span>
                          <span className="font-semibold text-gray-900">{product.category}</span>
                        </div>
                        {product.material && (
                          <div className="py-2 flex justify-between">
                            <span className="font-medium text-gray-500">Material</span>
                            <span className="font-semibold text-gray-900">{product.material}</span>
                          </div>
                        )}
                        {product.color && (
                          <div className="py-2 flex justify-between">
                            <span className="font-medium text-gray-500">Color</span>
                            <span className="font-semibold text-gray-900">{product.color}</span>
                          </div>
                        )}
                        {product.volume && (
                          <div className="py-2 flex justify-between">
                            <span className="font-medium text-gray-500">Size / Variant</span>
                            <span className="font-semibold text-gray-900">{product.volume}</span>
                          </div>
                        )}
                        {product.specifications &&
                          typeof product.specifications === "object" &&
                          Object.entries(product.specifications).map(([key, val]) => (
                            <div key={key} className="py-2 flex justify-between">
                              <span className="font-medium text-gray-500">{key}</span>
                              <span className="font-semibold text-gray-900">{String(val)}</span>
                            </div>
                          ))}
                        <div className="py-2 flex justify-between">
                          <span className="font-medium text-gray-500">Stock Availability</span>
                          <span className={`font-semibold ${!isOutOfStock ? "text-emerald-600" : "text-rose-600"}`}>
                            {!isOutOfStock ? `In Stock (${product.stock_count} units)` : "Out of Stock"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. What's in the Box */}
              <div className="border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleAccordion("box")}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-gray-700 stroke-[1.8]" />
                    <span className="font-bold text-[14px] sm:text-[15px] text-gray-900">
                      What's in the Box
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      openAccordions.box ? "rotate-180 text-gray-800" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openAccordions.box && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 pt-1 text-[13px] text-gray-600 leading-relaxed border-t border-gray-50"
                    >
                      {product.whats_in_box && Array.isArray(product.whats_in_box) && product.whats_in_box.length > 0 ? (
                        <ul className="space-y-2">
                          {product.whats_in_box.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-[#FA521C] shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-[#FA521C]" />
                            <span>1 × {product.name}</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-[#FA521C]" />
                            <span>1 × Official User Manual & Operating Guide</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-[#FA521C]" />
                            <span>1 × Zupe Store Quality Verification & Warranty Seal</span>
                          </li>
                        </ul>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 4. Shipping & Delivery */}
              <div className="border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleAccordion("shipping")}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-gray-700 stroke-[1.8]" />
                    <span className="font-bold text-[14px] sm:text-[15px] text-gray-900">
                      Fast Shipping & Tracking
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      openAccordions.shipping ? "rotate-180 text-gray-800" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openAccordions.shipping && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 pt-1 text-[13px] text-gray-600 leading-relaxed space-y-1.5 border-t border-gray-50"
                    >
                      <p>
                        ⚡ <strong>Same-Day Dispatch:</strong> Orders placed before 3:00 PM IST are processed and shipped the same business day.
                      </p>
                      <p>
                        🚚 <strong>Delivery Timeline:</strong> Metro cities receive packages within 2–4 business days. Non-metro locations take 4–6 business days via Bluedart and Delhivery Express.
                      </p>
                      <p>
                        📦 <strong>Real-time Tracking:</strong> AWB live tracking link is sent via WhatsApp and SMS immediately upon courier handoff.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 5. Return & Replacement Policy */}
              <div className="border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleAccordion("returns")}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <RotateCcw className="w-5 h-5 text-gray-700 stroke-[1.8]" />
                    <span className="font-bold text-[14px] sm:text-[15px] text-gray-900">
                      7-Day Replacement Guarantee
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      openAccordions.returns ? "rotate-180 text-gray-800" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openAccordions.returns && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 pt-1 text-[13px] text-gray-600 leading-relaxed space-y-1.5 border-t border-gray-50"
                    >
                      <p>
                        🛡️ <strong>Zero-Hassle Replacement:</strong> If your product arrives damaged or defective, we provide an immediate 1-click replacement within 7 days of delivery.
                      </p>
                      <p>
                        📞 <strong>Direct Support:</strong> Contact our WhatsApp support at +91 98765 43210 or email support@zupestore.in for instant assistance.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================
          CUSTOMER REVIEWS & RATINGS SECTION (LAST OF PRODUCT PAGE)
         ======================================================== */}
      {product && (
        <ProductReviewsSection
          productId={product.slug || product.id}
          productName={product.name}
          productImage={product.poster_image || (product.images && product.images[0])}
          fallbackRating={product.rating || 4.8}
          fallbackReviewCount={product.review_count || 1250}
        />
      )}

      {/* ========================================================
          STICKY BOTTOM BAR (SLIDES IN ON SCROLL DOWN)
         ======================================================== */}
      <aside
        aria-label="Sticky Purchase Actions"
        className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-4 pt-2.5 pb-4 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out lg:hidden ${
          showStickyBar ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-[480px] mx-auto space-y-2">
          {/* Top Row: Dual Outlined Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`py-2.5 px-3 rounded-xl border font-bold text-[13px] flex items-center justify-center gap-2 transition-all shadow-xs ${
                isOutOfStock
                  ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                  : "border-[#FA521C] text-[#FA521C] bg-white active:scale-95"
              }`}
            >
              <ShoppingCart className="w-4 h-4 stroke-[2.2]" />
              <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
            </button>

            <button
              onClick={handleCashOnDelivery}
              disabled={isOutOfStock}
              className={`py-2.5 px-3 rounded-xl border font-bold text-[13px] flex items-center justify-center gap-2 transition-all shadow-xs ${
                isOutOfStock
                  ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                  : "border-[#FA521C] text-[#FA521C] bg-white active:scale-95"
              }`}
            >
              <Truck className="w-4 h-4 stroke-[2.2]" />
              <span>{isOutOfStock ? "Unavailable" : "Cash on Delivery"}</span>
            </button>
          </div>

          {/* Bottom Row: Full Width BUY NOW WITH UPI */}
          <button
            onClick={handleBuyWithUpi}
            disabled={isOutOfStock}
            className={`w-full py-3 px-4 rounded-xl font-extrabold text-[14px] flex items-center justify-center gap-2.5 transition-all ${
              isOutOfStock
                ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70"
                : "bg-gradient-to-r from-[#FF4D15] via-[#FF451A] to-[#FA3B00] active:scale-95 text-white shadow-md shadow-[#FA521C]/25"
            }`}
          >
            {isOutOfStock ? (
              <span>CURRENTLY OUT OF STOCK</span>
            ) : (
              <>
                <span className="tracking-wide">BUY NOW WITH</span>
                <UpiLogo className="h-4.5" />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Footer on desktop */}
      <div className="hidden lg:block mt-20">
        <Footer />
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#1E1E1E] text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2 border border-white/10 select-none"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
