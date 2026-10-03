"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UpiLogo } from "@/components/UpiLogo";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string>("Amber Gold");
  const [quantity, setQuantity] = useState<number>(1);
  const [showStickyBar, setShowStickyBar] = useState<boolean>(false);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    details: false,
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

  // Load product by slug or ID
  useEffect(() => {
    const found = DEFAULT_PRODUCTS.find(
      (p) => p.slug === idOrSlug || p.id === idOrSlug
    );
    if (found) {
      setProduct(found);
      const defaultImg = found.images?.[0] || found.poster_image;
      setSelectedImage(defaultImg);
      setActiveImageIndex(0);
      if (found.colors && found.colors.length > 0) {
        setSelectedColor(found.colors[0].name);
      }
    } else {
      fetch("/api/products")
        .then((res) => res.json())
        .then((data) => {
          if (data.products) {
            const apiFound = data.products.find(
              (p: Product) => p.slug === idOrSlug || p.id === idOrSlug
            );
            if (apiFound) {
              setProduct(apiFound);
              const defaultImg = apiFound.images?.[0] || apiFound.poster_image;
              setSelectedImage(defaultImg);
              setActiveImageIndex(0);
            }
          }
        })
        .catch(console.warn);
    }
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
  const discountPercent = 40; // Exact 40% matching mockup

  // 8 High-resolution images for gallery matching mockup
  const gallery = [
    "/products/ripple/ripple-amber.jpg",
    "/products/ripple/ripple-white.jpg",
    "/products/ripple/ripple-blue.jpg",
    "/products/ripple/ripple-pink.jpg",
    "/products/ripple/ripple-purple.jpg",
    "/products/ripple/ripple-green.jpg",
    "/products/ripple-lamp.jpg",
    "/products/ripple/ripple-amber.jpg",
  ];

  const handleSelectImage = (img: string, idx: number) => {
    setSelectedImage(img);
    setActiveImageIndex(idx);
    if (idx === 5) {
      setVideoModalOpen(true);
    }
  };

  const handleSelectColorSwatch = (colorName: string, imgSrc: string) => {
    setSelectedColor(colorName);
    setSelectedImage(imgSrc);
    const idx = gallery.indexOf(imgSrc);
    if (idx !== -1) {
      setActiveImageIndex(idx);
    }
  };

  const toggleAccordion = (section: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    showToast(`Added ${quantity} item(s) to Cart! 🛒`);
    openCart();
  };

  const handleCashOnDelivery = () => {
    addToCart(product, quantity);
    router.push("/checkout?method=cod");
  };

  const handleBuyWithUpi = () => {
    addToCart(product, quantity);
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
    toggleWishlist(product);
    showToast(wishlisted ? "Removed from Wishlist" : "Saved to Wishlist! ❤️");
  };

  // Color swatches matching mockup
  const colorSwatches = [
    { name: "Amber Gold", image: "/products/ripple/ripple-amber.jpg", hex: "#F59E0B" },
    { name: "Ocean Blue", image: "/products/ripple/ripple-blue.jpg", hex: "#3B82F6" },
    { name: "Rose Pink", image: "/products/ripple/ripple-pink.jpg", hex: "#EC4899" },
    { name: "Electric Purple", image: "/products/ripple/ripple-purple.jpg", hex: "#A855F7" },
    { name: "Emerald Green", image: "/products/ripple/ripple-green.jpg", hex: "#10B981" },
  ];

  // Customer photo gallery strip
  const customerPhotos = [
    { image: "/products/ripple/ripple-amber.jpg", isVideo: false },
    { image: "/products/ripple/ripple-white.jpg", isVideo: false },
    { image: "/products/ripple/ripple-blue.jpg", isVideo: false },
    { image: "/products/ripple/ripple-purple.jpg", isVideo: true },
    { image: "/products/ripple-lamp.jpg", isVideo: false },
  ];

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

              {/* Top-Left Badge: -40% */}
              <div className="absolute top-3.5 left-3.5 z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-[#FF3B30] text-white text-[12px] font-extrabold tracking-tight shadow-md">
                  -{discountPercent}%
                </span>
              </div>

              {/* Top-Right Floating Action Buttons: Wishlist & Share */}
              <div className="absolute top-3.5 right-3.5 z-10 flex flex-col gap-2.5">
                {/* Wishlist Button */}
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

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md shadow-md flex items-center justify-center text-gray-800 hover:text-black hover:scale-105 active:scale-95 transition-all"
                  aria-label="Share"
                >
                  <Share2 className="w-5 h-5 text-gray-800 stroke-[2.2]" />
                </button>
              </div>

              {/* Bottom-Right Counter Badge: 1/8 */}
              <div className="absolute bottom-3.5 right-3.5 z-10">
                <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold tracking-wide">
                  {activeImageIndex + 1}/{gallery.length}
                </span>
              </div>
            </div>

            {/* Thumbnail Gallery Carousel */}
            <div className="mt-3 flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none select-none">
              {gallery.map((img, idx) => {
                const isActive = activeImageIndex === idx;
                const isVideo = idx === 5; // 6th thumbnail has circular play icon overlay

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

                    {/* Circular Video Play Icon Overlay for 6th thumbnail */}
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

            {/* Rating & Sold Stats Row */}
            <div className="flex items-center gap-2 mt-1.5 text-xs text-[#6B7280]">
              <div className="flex items-center gap-0.5 text-[#F59E0B]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="font-semibold text-gray-800">
                ({product.rating ? product.rating.toFixed(1) : "4.8"})
              </span>
              <span className="text-gray-300">|</span>
              <span>{product.sold_count || "1,250+ sold"}</span>
            </div>

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
              <span className="px-2 py-0.5 rounded-md bg-[#FFE8EC] text-[#FF334B] text-[12px] font-extrabold tracking-tight">
                {discountPercent}% OFF
              </span>
            </div>
            <p className="text-[12px] text-gray-400 -mt-0.5">Inclusive of all taxes</p>

            {/* Inline Action Buttons (Row 1: Dual Outlined Buttons) */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={handleAddToCart}
                className="py-3 px-3 rounded-xl border border-[#FA521C] text-[#FA521C] bg-white hover:bg-[#FFF4F0] active:scale-[0.98] font-bold text-[13px] sm:text-[14px] flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <ShoppingCart className="w-4 h-4 text-[#FA521C] stroke-[2.2]" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleCashOnDelivery}
                className="py-3 px-3 rounded-xl border border-[#FA521C] text-[#FA521C] bg-white hover:bg-[#FFF4F0] active:scale-[0.98] font-bold text-[13px] sm:text-[14px] flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Truck className="w-4 h-4 text-[#FA521C] stroke-[2.2]" />
                <span>Cash on Delivery</span>
              </button>
            </div>

            {/* Inline Action Button (Row 2: BUY NOW WITH UPI) */}
            <div className="mt-2.5">
              <button
                onClick={handleBuyWithUpi}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF4D15] via-[#FF451A] to-[#FA3B00] hover:brightness-105 active:scale-[0.99] text-white font-extrabold text-[14px] sm:text-[15px] shadow-md shadow-[#FA521C]/25 flex items-center justify-center gap-2.5 transition-all"
              >
                <span className="tracking-wide">BUY NOW WITH</span>
                <UpiLogo className="h-4.5" />
              </button>
            </div>

            {/* 4 Trust Badges Horizontal Grid */}
            <div className="mt-4 p-3 rounded-2xl bg-white border border-gray-100 shadow-xs grid grid-cols-4 gap-1 text-center select-none">
              {/* Badge 1: Free Shipping */}
              <div className="flex flex-col items-center justify-center px-1">
                <Truck className="w-5 h-5 text-gray-800 stroke-[1.8] mb-1" />
                <span className="text-[11px] sm:text-[12px] font-bold text-gray-900 leading-tight">
                  Free Shipping
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-500 leading-tight mt-0.5">
                  on all orders
                </span>
              </div>

              {/* Badge 2: Cash on Delivery */}
              <div className="flex flex-col items-center justify-center px-1">
                <ShieldCheck className="w-5 h-5 text-gray-800 stroke-[1.8] mb-1" />
                <span className="text-[11px] sm:text-[12px] font-bold text-gray-900 leading-tight">
                  Cash on Delivery
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-500 leading-tight mt-0.5">
                  Available
                </span>
              </div>

              {/* Badge 3: Easy Returns */}
              <div className="flex flex-col items-center justify-center px-1">
                <RotateCcw className="w-5 h-5 text-gray-800 stroke-[1.8] mb-1" />
                <span className="text-[11px] sm:text-[12px] font-bold text-gray-900 leading-tight">
                  Easy Returns
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-500 leading-tight mt-0.5">
                  7 days free
                </span>
              </div>

              {/* Badge 4: 24/7 Support */}
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

            {/* Color / Light Mode Selector */}
            <div className="mt-5">
              <h3 className="text-[13px] sm:text-[14px] font-bold text-gray-900 mb-2">
                Color / Light Mode
              </h3>
              <div className="flex items-center gap-2.5">
                {colorSwatches.map((c, i) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectColorSwatch(c.name, c.image)}
                      className={`relative w-12 h-12 rounded-[14px] overflow-hidden flex-shrink-0 transition-all ${
                        isSelected
                          ? "ring-2 ring-[#FA521C] ring-offset-2 scale-105"
                          : "border border-gray-200 opacity-85 hover:opacity-100"
                      }`}
                      title={c.name}
                    >
                      <Image
                        src={c.image}
                        alt={c.name}
                        fill
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector & In Stock Indicator */}
            <div className="mt-4">
              <h3 className="text-[13px] font-bold text-gray-900 mb-2">
                Quantity
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-xl bg-white shadow-xs p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock_count || 99, q + 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  <span>In Stock</span>
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
                <li className="flex items-start gap-2.5">
                  <span className="text-base select-none">✨</span>
                  <span>Creates a calming water ripple effect</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-base select-none">🏠</span>
                  <span>Perfect for bedroom, study or living room</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-base select-none">🎨</span>
                  <span>Multiple color options</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-base select-none">🪷</span>
                  <span>Enhances mood and relaxation</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-base select-none">🎁</span>
                  <span>Great for gifting</span>
                </li>
              </ul>
            </div>

            {/* ========================================================
                COLLAPSIBLE ACCORDIONS (SCREEN 2 DESIGN)
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
                      Product Details
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
                      <p>
                        The Dynamic Water Ripple Crystal Lamp features high-transparency optical acrylic with an internal rotating ripple cylinder, casting organic, undulating ocean-wave refractions across your ceiling and walls.
                      </p>
                      <p>
                        Equipped with 16 RGB spectrum colors, 4 automated transition modes (Smooth, Fade, Flash, Strobe), and continuous dimming brightness adjustment. Controlled wirelessly via the included 16-key remote control or gentle touch sensor on the natural beechwood base.
                      </p>
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
                      Specifications
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
                          <span className="font-medium text-gray-500">Dimensions</span>
                          <span className="font-semibold text-gray-900">12 cm × 12 cm × 13 cm</span>
                        </div>
                        <div className="py-2 flex justify-between">
                          <span className="font-medium text-gray-500">Weight</span>
                          <span className="font-semibold text-gray-900">380 grams</span>
                        </div>
                        <div className="py-2 flex justify-between">
                          <span className="font-medium text-gray-500">Power Supply</span>
                          <span className="font-semibold text-gray-900">USB 5V (Plug & Play)</span>
                        </div>
                        <div className="py-2 flex justify-between">
                          <span className="font-medium text-gray-500">Material</span>
                          <span className="font-semibold text-gray-900">Acrylic Crystal + Solid Beechwood</span>
                        </div>
                        <div className="py-2 flex justify-between">
                          <span className="font-medium text-gray-500">Light Modes</span>
                          <span className="font-semibold text-gray-900">16 RGB Colors + 4 Transitions</span>
                        </div>
                        <div className="py-2 flex justify-between">
                          <span className="font-medium text-gray-500">Control</span>
                          <span className="font-semibold text-gray-900">Wireless Remote + Touch Switch</span>
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
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#FA521C]" />
                          <span>1 × Dynamic Water Ripple Crystal Lamp</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#FA521C]" />
                          <span>1 × 16-Key Wireless Remote Control (Battery included)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#FA521C]" />
                          <span>1 × 1.2m Braided USB Power Cable (Pre-installed)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#FA521C]" />
                          <span>1 × User Manual & 1-Year Zupe Warranty Card</span>
                        </li>
                      </ul>
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
                      Shipping & Delivery
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
                      className="px-4 pb-4 pt-1 text-[13px] text-gray-600 leading-relaxed space-y-2 border-t border-gray-50"
                    >
                      <p>
                        ⚡ <strong>Fast 24H Dispatch:</strong> Orders placed before 4:00 PM are packed and handed to courier partners the same day.
                      </p>
                      <p>
                        🚚 <strong>Free All-India Delivery:</strong> Enjoy complimentary standard doorstep delivery arriving within 3–5 business days.
                      </p>
                      <p>
                        📍 <strong>Live Tracking:</strong> Instant WhatsApp and SMS notifications with real-time tracking links as your order travels.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 5. Returns & Refunds */}
              <div className="border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleAccordion("returns")}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <RotateCcw className="w-5 h-5 text-gray-700 stroke-[1.8]" />
                    <span className="font-bold text-[14px] sm:text-[15px] text-gray-900">
                      Returns & Refunds
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
                      className="px-4 pb-4 pt-1 text-[13px] text-gray-600 leading-relaxed space-y-2 border-t border-gray-50"
                    >
                      <p>
                        🛡️ <strong>7-Day Free Replacement:</strong> If the product arrives damaged or defective, we provide an immediate no-questions-asked replacement.
                      </p>
                      <p>
                        💳 <strong>Instant Refunds:</strong> Once return pickup is verified by our courier partner, refunds are automatically credited back to your UPI or original payment method within 24 hours.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ========================================================
                CUSTOMER REVIEWS (SCREEN 2 EXACT LAYOUT)
               ======================================================== */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              {/* Header: Customer Reviews (4.8) on left, See All -> on right */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[17px] sm:text-[19px] font-bold text-gray-900">
                  Customer Reviews ({product.rating ? product.rating.toFixed(1) : "4.8"})
                </h2>
                <button
                  onClick={() => showToast("Showing all 1,250 verified reviews")}
                  className="text-[13px] font-bold text-[#FA521C] hover:text-[#E0400B] flex items-center gap-1 transition-colors"
                >
                  <span>See All</span>
                  <span className="text-base font-bold">➔</span>
                </button>
              </div>

              {/* Rating Breakdown Card: Left column big score, right column bars */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAFAFA] border border-gray-100 flex items-center justify-between gap-4">
                {/* Left side: Big 4.8, stars, count */}
                <div className="flex flex-col items-start min-w-[130px]">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[32px] sm:text-[36px] font-extrabold text-gray-900 leading-none">
                      {product.rating ? product.rating.toFixed(1) : "4.8"}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">out of 5</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-[#F59E0B] mt-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1">
                    Based on 1,250+ reviews
                  </span>
                </div>

                {/* Right side: Star percentage bars */}
                <div className="flex-1 space-y-1 max-w-[200px]">
                  {[
                    { star: 5, pct: 82 },
                    { star: 4, pct: 12 },
                    { star: 3, pct: 4 },
                    { star: 2, pct: 1 },
                    { star: 1, pct: 1 },
                  ].map((row) => (
                    <div key={row.star} className="flex items-center gap-2 text-[11px] text-gray-600">
                      <span className="w-4 flex items-center gap-0.5 font-bold text-gray-700">
                        {row.star} <span className="text-[9px] text-[#F59E0B]">★</span>
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className="h-full bg-[#F59E0B] rounded-full"
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                      <span className="w-7 text-right text-gray-400 font-medium">{row.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Photo Uploads Horizontal Strip */}
              <div className="mt-4 flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none select-none">
                {customerPhotos.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (item.isVideo) {
                        setVideoModalOpen(true);
                      } else {
                        setLightboxImage(item.image);
                      }
                    }}
                    className="relative w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-[16px] overflow-hidden flex-shrink-0 cursor-pointer border border-gray-100 shadow-xs hover:opacity-95 transition-opacity"
                  >
                    <Image
                      src={item.image}
                      alt={`Customer photo ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                    {item.isVideo && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow">
                          <Play className="w-3 h-3 fill-[#FA521C] text-[#FA521C] ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Customer Reviews List */}
              <div className="mt-5 space-y-5">
                {/* Review 1: Arjun M. */}
                <div className="border-b border-gray-100 pb-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        <Image
                          src="/avatars/arjun.jpg"
                          alt="Arjun M."
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-[13px] sm:text-[14px] font-bold text-gray-900 leading-tight">
                          Arjun M.
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="flex items-center text-[#F59E0B]">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                            <Check className="w-3 h-3 stroke-[3]" /> Verified Purchase
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                      12 Sep 2026
                    </span>
                  </div>

                  <p className="mt-2 text-[13px] text-gray-700 leading-relaxed">
                    Product quality is amazing! The water ripple effect looks so beautiful at night. Perfect for my room.
                  </p>

                  {/* 3 Review Photo Thumbnails */}
                  <div className="mt-2.5 flex items-center gap-2">
                    {[
                      "/products/ripple/ripple-amber.jpg",
                      "/products/ripple/ripple-white.jpg",
                      "/products/ripple-lamp.jpg",
                    ].map((t, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxImage(t)}
                        className="relative w-14 h-14 rounded-xl overflow-hidden cursor-pointer border border-gray-100 shadow-xs"
                      >
                        <Image src={t} alt="Review thumb" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review 2: Sneha K. */}
                <div className="border-b border-gray-100 pb-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        <Image
                          src="/avatars/sneha.jpg"
                          alt="Sneha K."
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-[13px] sm:text-[14px] font-bold text-gray-900 leading-tight">
                          Sneha K.
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="flex items-center text-[#F59E0B]">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                            <Check className="w-3 h-3 stroke-[3]" /> Verified Purchase
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                      08 Sep 2026
                    </span>
                  </div>

                  <p className="mt-2 text-[13px] text-gray-700 leading-relaxed">
                    Absolutely love it! Gives a very premium feel and the lighting is very soothing.
                  </p>

                  {/* 3 Review Photo Thumbnails */}
                  <div className="mt-2.5 flex items-center gap-2">
                    {[
                      "/products/ripple/ripple-amber.jpg",
                      "/products/ripple/ripple-white.jpg",
                      "/products/ripple/ripple-blue.jpg",
                    ].map((t, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxImage(t)}
                        className="relative w-14 h-14 rounded-xl overflow-hidden cursor-pointer border border-gray-100 shadow-xs"
                      >
                        <Image src={t} alt="Review thumb" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ========================================================
          STICKY BOTTOM BAR (SCREEN 2 - SLIDES IN ON SCROLL DOWN)
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
              className="py-2.5 px-3 rounded-xl border border-[#FA521C] text-[#FA521C] bg-white active:scale-95 font-bold text-[13px] flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <ShoppingCart className="w-4 h-4 text-[#FA521C] stroke-[2.2]" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleCashOnDelivery}
              className="py-2.5 px-3 rounded-xl border border-[#FA521C] text-[#FA521C] bg-white active:scale-95 font-bold text-[13px] flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Truck className="w-4 h-4 text-[#FA521C] stroke-[2.2]" />
              <span>Cash on Delivery</span>
            </button>
          </div>

          {/* Bottom Row: Full Width BUY NOW WITH UPI */}
          <button
            onClick={handleBuyWithUpi}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF4D15] via-[#FF451A] to-[#FA3B00] active:scale-95 text-white font-extrabold text-[14px] shadow-md shadow-[#FA521C]/25 flex items-center justify-center gap-2.5 transition-all"
          >
            <span className="tracking-wide">BUY NOW WITH</span>
            <UpiLogo className="h-4.5" />
          </button>
        </div>
      </aside>

      {/* Footer on desktop */}
      <div className="hidden lg:block mt-20">
        <Footer />
      </div>

      {/* ========================================================
          VIDEO DEMO MODAL
         ======================================================== */}
      <AnimatePresence>
        {videoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setVideoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800"
            >
              <div className="p-4 flex items-center justify-between border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-bold text-sm text-white">Dynamic Ripple In Action</span>
                </div>
                <button
                  onClick={() => setVideoModalOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Simulated Ambient Video Reel Container */}
              <div className="relative aspect-square w-full bg-black overflow-hidden flex items-center justify-center">
                <Image
                  src="/products/ripple/ripple-purple.jpg"
                  alt="Video Demonstration"
                  fill
                  className="object-cover animate-pulse duration-1000 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs font-semibold text-emerald-400">● 16 Color Dynamic Rotation</p>
                  <p className="text-sm font-bold">Watch the hypnotic ocean ripple caustic lighting effect</p>
                </div>
              </div>

              <div className="p-4 bg-gray-950 flex items-center justify-between">
                <span className="text-xs text-gray-400">Included with Remote Control</span>
                <button
                  onClick={() => {
                    setVideoModalOpen(false);
                    handleBuyWithUpi();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#FA521C] text-white text-xs font-bold shadow"
                >
                  Order Now (₹650)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          IMAGE LIGHTBOX MODAL
         ======================================================== */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <div className="relative max-w-xl w-full aspect-square rounded-2xl overflow-hidden">
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center shadow"
              >
                <X className="w-5 h-5" />
              </button>
              <Image
                src={lightboxImage}
                alt="Enlarged view"
                fill
                className="object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          TOAST FEEDBACK
         ======================================================== */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-gray-900/95 backdrop-blur-md text-white font-medium text-xs sm:text-sm shadow-xl flex items-center gap-2 border border-white/10"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
