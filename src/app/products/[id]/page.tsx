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
  ChevronLeft,
  ChevronRight,
  Banknote,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UpiLogo } from "@/components/UpiLogo";
import { ProductReviewsSection } from "@/components/ProductReviewsSection";
import { YouMayAlsoLike } from "@/components/YouMayAlsoLike";
import { ShoppableVideosSection } from "@/components/ShoppableVideosSection";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { DeliveryEstimator } from "@/components/DeliveryEstimator";
import { PaymentTrustBadges } from "@/components/PaymentTrustBadges";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params?.id as string;
  const { user, openAuthModal } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string>("Standard");
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedBundleTier, setSelectedBundleTier] = useState<number>(1);
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
  const [liveReviewStats, setLiveReviewStats] = useState<{ averageRating: number; totalReviews: number } | null>(null);

  // Swipe & Drag Gesture State for Product Gallery (must be unconditional top-level hooks)
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const isSwipingHorizontalRef = useRef<boolean | null>(null);
  const isMouseDownRef = useRef<boolean>(false);
  const mouseStartXRef = useRef<number>(0);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const { addToCart, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Fetch real reviews stats immediately for flawless header synchronization
  useEffect(() => {
    if (idOrSlug) {
      fetch(`/api/reviews?productId=${encodeURIComponent(idOrSlug)}&_t=${Date.now()}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.stats) {
            setLiveReviewStats({
              averageRating: data.stats.averageRating,
              totalReviews: data.stats.totalReviews,
            });
          }
        })
        .catch(() => {});
    }
  }, [idOrSlug]);

  const applyProduct = (found: Product) => {
    setProduct(found);
    const hasColors =
      found.has_colors === true
        ? Boolean(found.colors && found.colors.length > 0)
        : found.has_colors === false
        ? false
        : Boolean(
            found.colors &&
            found.colors.length > 0 &&
            !(found.colors.length === 1 && found.colors[0].name.toLowerCase() === "standard")
          );

    const initialColor = hasColors && found.colors && found.colors.length > 0 ? found.colors[0].name : "";
    setSelectedColor(initialColor);

    const firstColorObj = hasColors
      ? found.colors!.find((c) => c.name.toLowerCase() === initialColor.toLowerCase()) || found.colors![0]
      : null;

    const poster = found.poster_image?.trim();
    const isIron = found.id === "mini-portable-steam-iron" || found.slug?.includes("iron");
    const cleanImages = Array.isArray(found.images)
      ? found.images.filter((img) => {
          if (!isIron && typeof img === "string" && (img.includes("steam-iron") || img.includes("/products/iron/"))) {
            return false;
          }
          return Boolean(img);
        })
      : [];

    const defaultImg =
      (hasColors && (firstColorObj?.images?.[0] || firstColorObj?.image)) ||
      poster ||
      cleanImages[0] ||
      "";

    setSelectedImage(defaultImg);
    setActiveImageIndex(0);
  };

  // Load product by slug or ID with priority on fresh live API data
  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      const rawId = decodeURIComponent(idOrSlug || "").trim();
      const normId = rawId.toLowerCase();
      const normSlug = normId.replace(/[\s_]+/g, "-");
      const normClean = normId.replace(/[-_ ]+/g, " ");

      const matchesProduct = (p: Product) => {
        if (!p) return false;
        const pId = (p.id || "").toLowerCase();
        const pSlug = (p.slug || "").toLowerCase();
        const pClean = pSlug.replace(/[-_ ]+/g, " ") || pId.replace(/[-_ ]+/g, " ");
        return (
          pId === normId ||
          pSlug === normId ||
          pSlug === normSlug ||
          pId === normSlug ||
          pClean === normClean ||
          (normClean && pClean.includes(normClean)) ||
          (normClean && normClean.includes(pClean))
        );
      };

      // 1. Instant fallback to cached / default product for 0ms initial render
      const staticFound = DEFAULT_PRODUCTS.find(matchesProduct);
      if (staticFound && isMounted) {
        applyProduct(staticFound);
        setLoadingProduct(false);
      }

      // 2. Fetch fresh live product from API (matches both ID and slug)
      try {
        const res = await fetch(`/api/products?id=${encodeURIComponent(normSlug || normId)}&slug=${encodeURIComponent(normSlug || normId)}`);
        const data = await res.json();
        if (isMounted && data.success && data.product) {
          applyProduct(data.product);
          setLoadingProduct(false);
          return;
        }
      } catch (e) {
        // continue
      }

      if (isMounted) {
        setLoadingProduct(false);
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [idOrSlug]);

  // Live stock polling & synchronization (reflects admin stock updates immediately without manual reload)
  useEffect(() => {
    if (!product?.id) return;
    let isMounted = true;

    const syncStock = async () => {
      try {
        const queryKey = product.slug ? `${product.id},${product.slug}` : product.id;
        const res = await fetch(
          `/api/inventory/check?ids=${encodeURIComponent(queryKey)}&_t=${Date.now()}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (isMounted && data.success && data.stock) {
          const info = data.stock[product.id] || (product.slug ? data.stock[product.slug] : null);
          if (info) {
            setProduct((prev) => {
              if (!prev) return prev;
              if (prev.in_stock !== info.in_stock || prev.stock_count !== info.stock_count) {
                return {
                  ...prev,
                  in_stock: info.in_stock,
                  stock_count: info.stock_count,
                };
              }
              return prev;
            });
          }
        }
      } catch (e) {}
    };

    const interval = setInterval(syncStock, 4000);
    const onFocus = () => syncStock();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [product?.id, product?.slug]);

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
    if (product?.has_colors === false) return null;
    if (!product?.colors || product.colors.length === 0) return null;
    return (
      product.colors.find((c) => c.name.toLowerCase() === selectedColor.toLowerCase()) ||
      product.colors[0]
    );
  }, [product, selectedColor]);

  // Gallery images derived from active color's different angle photos, or product.images, or poster_image
  const gallery = useMemo(() => {
    if (!product) return [];
    if (product.has_colors !== false && activeColorVariant?.images && activeColorVariant.images.length > 0) {
      return activeColorVariant.images;
    }
    if (product.has_colors !== false && activeColorVariant?.image) {
      return [activeColorVariant.image];
    }

    const poster = product.poster_image?.trim();
    const isIron = product.id === "mini-portable-steam-iron" || product.slug?.includes("iron");
    const baseImages = (Array.isArray(product.images) ? product.images : []).filter((img) => {
      if (!isIron && typeof img === "string" && (img.includes("steam-iron") || img.includes("/products/iron/"))) {
        return false;
      }
      return Boolean(img);
    });

    if (poster) {
      const others = baseImages.filter((img) => img !== poster);
      return [poster, ...others];
    }

    if (baseImages.length > 0) {
      return baseImages;
    }

    return [];
  }, [product, activeColorVariant]);

  const safeActiveIndex = useMemo(() => {
    if (!gallery || gallery.length === 0) return 0;
    return Math.max(0, Math.min(activeImageIndex, gallery.length - 1));
  }, [activeImageIndex, gallery]);

  // Keep thumbnail in view when active image changes
  useEffect(() => {
    if (thumbnailRefs.current[safeActiveIndex]) {
      thumbnailRefs.current[safeActiveIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [safeActiveIndex]);

  // Available color options for current product
  const availableColors = useMemo(() => {
    if (!product) return [];
    if (product.has_colors === false) return [];
    if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
      if (product.has_colors === true) {
        return product.colors;
      }
      if (
        product.colors.length === 1 &&
        product.colors[0].name.toLowerCase() === "standard" &&
        (!product.colors[0].images || product.colors[0].images.length <= 1)
      ) {
        return [];
      }
      return product.colors;
    }
    return [];
  }, [product]);

  // Synchronize selectedColor with availableColors
  useEffect(() => {
    if (availableColors.length > 0) {
      const match = availableColors.find(
        (c) => c.name.toLowerCase() === selectedColor.toLowerCase()
      );
      if (!match) {
        setSelectedColor(availableColors[0].name);
      }
    }
  }, [availableColors, selectedColor]);

  // 4 Key Highlight Points between Reviews & Price (2 in 1 row, total 2 rows on mobile & desktop)
  const productPoints = useMemo<string[]>(() => {
    if (!product) return [];

    // 1. If admin configured features for this product, use them
    if (product.features && Array.isArray(product.features) && product.features.length > 0) {
      const clean = product.features
        .map((f: any) => (typeof f === "string" ? f : f?.text || String(f)))
        .map((s: string) => s.replace(/^[✨🔥💆‍♀️🌸🔋⚡👔✈️🛡️💧🖨️📱📝🌀🧺📦⏱️💨🤫👶🎒✓•-]\s*/u, "").trim())
        .filter(Boolean);
      if (clean.length >= 4) {
        return clean.slice(0, 4);
      }
      if (clean.length > 0) {
        const fallbacks = [
          "Premium Quality Build",
          "Fast Doorstep Delivery",
          "Cash on Delivery Available",
          "7-Day Easy Replacement",
        ];
        return [...clean, ...fallbacks.filter((fb) => !clean.includes(fb))].slice(0, 4);
      }
    }

    // 2. Product-specific curated defaults (clean 4 points)
    const idLower = (product.id || "").toLowerCase();
    const slugLower = (product.slug || "").toLowerCase();

    if (idLower.includes("heating-pad") || slugLower.includes("heating-pad")) {
      return [
        "3 Fast Heat Modes (45-65°C)",
        "4 Vibration Massage Modes",
        "Skin-Friendly Plush Velvet",
        "Wireless USB Rechargeable",
      ];
    }
    if (idLower.includes("ripple") || slugLower.includes("ripple")) {
      return [
        "Dynamic Water Wave Ripple",
        "16 RGB Colors + Remote",
        "Ambient Bedside Lighting",
        "Touch & Wireless Control",
      ];
    }
    if (idLower.includes("iron") || slugLower.includes("iron")) {
      return [
        "30s Rapid Heat-Up",
        "Dual Wet & Dry Ironing",
        "180° Foldable Travel Body",
        "Anti-Burn Ceramic Plate",
      ];
    }
    if (idLower.includes("helicopter") || slugLower.includes("helicopter")) {
      return [
        "Solar Auto-Rotating Propeller",
        "360° All-Around Fragrance",
        "Natural Plant Essential Oils",
        "No Battery or Wire Needed",
      ];
    }
    if (idLower.includes("nebulizer") || slugLower.includes("nebulizer")) {
      return [
        "Ultra-Fine <5µm Cool Mist",
        "Silent <25dB Quiet Operation",
        "Child & Adult Masks Included",
        "Dual Battery / USB Power",
      ];
    }
    if (idLower.includes("washing") || slugLower.includes("washer")) {
      return [
        "Forward/Reverse Sonic Wash",
        "8L Capacity + Drain Basket",
        "Collapsible Foldable Body",
        "3 Smart Timer Programs",
      ];
    }
    if (idLower.includes("printer") || slugLower.includes("printer")) {
      return [
        "Zero Ink Thermal Printing",
        "Instant Bluetooth Mobile App",
        "1000mAh Rechargeable Battery",
        "Prints Labels, Notes & Photos",
      ];
    }

    return [
      product.tagline || "Premium Quality & Build",
      product.volume || "Verified Authentic Design",
      "Doorstep Express Courier",
      "7-Day Easy Replacement",
    ];
  }, [product]);

  // Derived highlights for "Why You'll Love This" card
  const productHighlights = useMemo(() => {
    return productPoints.map((text) => ({ icon: "✨", text }));
  }, [productPoints]);

  const handleSelectImage = (img: string, idx: number) => {
    setSelectedImage(img);
    setActiveImageIndex(idx);
    if (idx === 5 && isRippleLamp) {
      setVideoModalOpen(true);
    }
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (safeActiveIndex > 0) {
      const prevIdx = safeActiveIndex - 1;
      setActiveImageIndex(prevIdx);
      setSelectedImage(gallery[prevIdx]);
    }
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (safeActiveIndex < gallery.length - 1) {
      const nextIdx = safeActiveIndex + 1;
      setActiveImageIndex(nextIdx);
      setSelectedImage(gallery[nextIdx]);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (gallery.length <= 1) return;
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    isSwipingHorizontalRef.current = null;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || gallery.length <= 1) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;

    // Detect horizontal swipe intent vs vertical scroll
    if (isSwipingHorizontalRef.current === null) {
      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        isSwipingHorizontalRef.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    if (isSwipingHorizontalRef.current) {
      let dampedDelta = deltaX;
      if (
        (safeActiveIndex === 0 && deltaX > 0) ||
        (safeActiveIndex === gallery.length - 1 && deltaX < 0)
      ) {
        dampedDelta = deltaX * 0.25;
      }
      setDragOffset(dampedDelta);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 35;
    if (isSwipingHorizontalRef.current) {
      if (dragOffset < -threshold && safeActiveIndex < gallery.length - 1) {
        const nextIdx = safeActiveIndex + 1;
        setActiveImageIndex(nextIdx);
        setSelectedImage(gallery[nextIdx]);
      } else if (dragOffset > threshold && safeActiveIndex > 0) {
        const prevIdx = safeActiveIndex - 1;
        setActiveImageIndex(prevIdx);
        setSelectedImage(gallery[prevIdx]);
      }
    }

    setDragOffset(0);
    isSwipingHorizontalRef.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gallery.length <= 1) return;
    if ((e.target as HTMLElement).closest("button")) return;
    isMouseDownRef.current = true;
    mouseStartXRef.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current || gallery.length <= 1) return;
    const deltaX = e.clientX - mouseStartXRef.current;
    let dampedDelta = deltaX;
    if (
      (safeActiveIndex === 0 && deltaX > 0) ||
      (safeActiveIndex === gallery.length - 1 && deltaX < 0)
    ) {
      dampedDelta = deltaX * 0.25;
    }
    setDragOffset(dampedDelta);
  };

  const handleMouseUp = () => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    setIsDragging(false);

    const threshold = 35;
    if (dragOffset < -threshold && safeActiveIndex < gallery.length - 1) {
      const nextIdx = safeActiveIndex + 1;
      setActiveImageIndex(nextIdx);
      setSelectedImage(gallery[nextIdx]);
    } else if (dragOffset > threshold && safeActiveIndex > 0) {
      const prevIdx = safeActiveIndex - 1;
      setActiveImageIndex(prevIdx);
      setSelectedImage(gallery[prevIdx]);
    }
    setDragOffset(0);
  };

  const handleMouseLeave = () => {
    if (isMouseDownRef.current) {
      handleMouseUp();
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

  // Dynamic Product pricing calculations for Buy More Save More
  const singleUnitPrice = product ? (product.offer_price || product.price || 799) : 799;

  const bundleConfig = product?.bundle_tiers;
  const isBundleEnabled = bundleConfig?.enabled !== false;
  const bundleHeaderTitle = bundleConfig?.headerTitle || "Buy More Save More";

  // Derive dynamic bundle tiers from product configuration or fallback to standard defaults
  const computedBundleTiers = useMemo(() => {
    const rawTiers =
      bundleConfig?.tiers && Array.isArray(bundleConfig.tiers) && bundleConfig.tiers.length > 0
        ? bundleConfig.tiers.filter((t) => t.enabled !== false)
        : [
            { qty: 1, badge: "BEST PRICE", discountPercent: 0, tagText: "", enabled: true },
            { qty: 2, badge: "MOST POPULAR", discountPercent: 15, tagText: "Extra 15% OFF", enabled: true },
            { qty: 3, badge: "BEST DEAL", discountPercent: 25, tagText: "Extra 25% OFF", enabled: true },
          ];

    return rawTiers.map((tier) => {
      const regularTotal = singleUnitPrice * (tier.qty || 1);
      let totalPrice = regularTotal;
      let savings = 0;
      let discountPct = tier.discountPercent || 0;

      if (tier.customPrice && tier.customPrice > 0) {
        totalPrice = tier.customPrice;
        savings = Math.max(0, regularTotal - totalPrice);
        discountPct = regularTotal > 0 ? Math.round((savings / regularTotal) * 100) : 0;
      } else if (discountPct > 0) {
        savings = Math.round(regularTotal * (discountPct / 100));
        totalPrice = Math.max(0, regularTotal - savings);
      }

      const unitPrice = Math.round(totalPrice / Math.max(1, tier.qty || 1));
      const tagText = tier.tagText || (discountPct > 0 ? `Extra ${discountPct}% OFF` : "");
      const badge =
        tier.badge ||
        (tier.qty === 1 ? "BEST PRICE" : tier.qty === 2 ? "MOST POPULAR" : "BEST DEAL");

      return {
        qty: tier.qty || 1,
        badge,
        tagText,
        discountPercent: discountPct,
        regularTotal,
        totalPrice,
        savings,
        unitPrice,
      };
    });
  }, [bundleConfig, singleUnitPrice]);

  const getBundleDetails = (qty: number) => {
    // Look for exact tier or closest matching tier
    const matched =
      computedBundleTiers.find((t) => t.qty === qty) ||
      [...computedBundleTiers].reverse().find((t) => qty >= t.qty) ||
      computedBundleTiers[0];

    if (matched && matched.qty > 1) {
      return {
        tier: matched.qty,
        unitPrice: matched.unitPrice,
        totalPrice: matched.totalPrice,
        savings: matched.savings,
        label: `Buy ${matched.qty} - ${matched.tagText || matched.badge || "Offer Price"}`,
      };
    }
    return {
      tier: 1,
      unitPrice: singleUnitPrice,
      totalPrice: singleUnitPrice,
      savings: 0,
      label: "Buy 1 - Best Price",
    };
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      showToast("Sorry, this item is currently out of stock!");
      return;
    }

    // Instant pre-flight check
    try {
      const qKey = product?.slug ? `${product.id},${product.slug}` : (product?.id || "");
      const chk = await fetch(`/api/inventory/check?ids=${encodeURIComponent(qKey)}&_t=${Date.now()}`, { cache: "no-store" });
      const cData = await chk.json();
      if (cData.success && cData.stock) {
        const info = cData.stock[product!.id] || (product?.slug ? cData.stock[product.slug] : null);
        if (info && !info.is_available) {
          setProduct((p) => p ? { ...p, in_stock: 0, stock_count: 0 } : p);
          showToast("Sorry, this item was just marked out of stock!");
          return;
        }
      }
    } catch (e) {}

    const bundle = getBundleDetails(quantity);
    const added = addToCart(
      {
        ...product!,
        color: availableColors.length > 0 && product!.has_colors !== false ? selectedColor : undefined,
        poster_image: selectedImage || product!.poster_image,
        price: bundle.unitPrice,
        original_price: singleUnitPrice,
        bundle_tier: bundle.tier,
        bundle_savings: bundle.savings,
        offer_label: bundle.label,
      },
      quantity,
      { overrideQuantity: true }
    );
    if (!user) {
      openAuthModal("login", "Sign in required: Please log in to add items to your cart & checkout 🛍️");
      return;
    }
    if (added) {
      showToast(`Added ${quantity} item(s) to Cart! 🛒`);
      openCart();
    } else {
      showToast("Sorry, this item is currently out of stock!");
    }
  };

  const handleCashOnDelivery = async () => {
    if (isOutOfStock) {
      showToast("Sorry, this item is currently out of stock!");
      return;
    }

    try {
      const qKey = product?.slug ? `${product.id},${product.slug}` : (product?.id || "");
      const chk = await fetch(`/api/inventory/check?ids=${encodeURIComponent(qKey)}&_t=${Date.now()}`, { cache: "no-store" });
      const cData = await chk.json();
      if (cData.success && cData.stock) {
        const info = cData.stock[product!.id] || (product?.slug ? cData.stock[product.slug] : null);
        if (info && !info.is_available) {
          setProduct((p) => p ? { ...p, in_stock: 0, stock_count: 0 } : p);
          showToast("Sorry, this item was just marked out of stock!");
          return;
        }
      }
    } catch (e) {}

    const bundle = getBundleDetails(quantity);
    const added = addToCart(
      {
        ...product!,
        color: availableColors.length > 0 && product!.has_colors !== false ? selectedColor : undefined,
        poster_image: selectedImage || product!.poster_image,
        price: bundle.unitPrice,
        original_price: singleUnitPrice,
        bundle_tier: bundle.tier,
        bundle_savings: bundle.savings,
        offer_label: bundle.label,
      },
      quantity,
      { overrideQuantity: true }
    );
    if (!added) {
      showToast("Sorry, this item is currently out of stock!");
      return;
    }
    if (!user) {
      openAuthModal("login", "Sign in required: Please log in to complete your purchase ⚡");
      return;
    }
    router.push("/checkout?method=cod");
  };

  const handleBuyWithUpi = async () => {
    if (isOutOfStock) {
      showToast("Sorry, this item is currently out of stock!");
      return;
    }

    try {
      const qKey = product?.slug ? `${product.id},${product.slug}` : (product?.id || "");
      const chk = await fetch(`/api/inventory/check?ids=${encodeURIComponent(qKey)}&_t=${Date.now()}`, { cache: "no-store" });
      const cData = await chk.json();
      if (cData.success && cData.stock) {
        const info = cData.stock[product!.id] || (product?.slug ? cData.stock[product.slug] : null);
        if (info && !info.is_available) {
          setProduct((p) => p ? { ...p, in_stock: 0, stock_count: 0 } : p);
          showToast("Sorry, this item was just marked out of stock!");
          return;
        }
      }
    } catch (e) {}

    const bundle = getBundleDetails(quantity);
    const added = addToCart(
      {
        ...product!,
        color: availableColors.length > 0 && product!.has_colors !== false ? selectedColor : undefined,
        poster_image: selectedImage || product!.poster_image,
        price: bundle.unitPrice,
        original_price: singleUnitPrice,
        bundle_tier: bundle.tier,
        bundle_savings: bundle.savings,
        offer_label: bundle.label,
      },
      quantity,
      { overrideQuantity: true }
    );
    if (!added) {
      showToast("Sorry, this item is currently out of stock!");
      return;
    }
    if (!user) {
      openAuthModal("login", "Sign in required: Please log in to complete your purchase ⚡");
      return;
    }
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
    if (!product) return;
    const isCurrentlyWishlisted = isInWishlist(product.id);
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
      openAuthModal("login", "Sign in required: Please log in to save items to your wishlist ❤️");
      return;
    }
    const success = toggleWishlist(product);
    if (success) {
      showToast(isCurrentlyWishlisted ? "Removed from Wishlist" : "Saved to Wishlist! ❤️");
    }
  };

  if (loadingProduct && !product) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto py-32 px-4 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-3 border-[#FF7A00] border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-gray-600">Loading product details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto py-32 px-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center text-[#FF7A00]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">The product you are looking for may have been moved or is currently unavailable.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#FF7A00] text-white font-semibold text-sm shadow-md"
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

  return (
    <div className="min-h-screen bg-white text-[#1E1E1E] antialiased pb-28 lg:pb-16 selection:bg-[#FF7A00]/20 selection:text-[#FF7A00]">
      {/* Top App Header */}
      <Navbar />

      {/* Main Container */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-2 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-14 items-stretch">
          
          {/* ========================================================
              LEFT COLUMN: HERO IMAGE & THUMBNAILS CAROUSEL (STICKY ON DESKTOP)
             ======================================================== */}
          <div className="w-full h-full">
            <div className="w-full lg:sticky lg:top-[115px] lg:pb-8">
              {/* Main Showcase Image Container with Touch & Drag Swipe */}
              <div
                className={`group relative aspect-square w-full rounded-[24px] sm:rounded-[28px] overflow-hidden bg-[#F3F4F6] shadow-sm select-none touch-pan-y ${
                gallery.length > 1 ? "cursor-grab active:cursor-grabbing" : ""
              }`}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {/* Sliding Track containing all gallery images */}
              <div
                className="flex w-full h-full will-change-transform"
                style={{
                  transform: `translateX(calc(-${safeActiveIndex * 100}% + ${dragOffset}px))`,
                  transition: isDragging
                    ? "none"
                    : "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                {gallery.map((img, idx) => (
                  <div key={idx} className="relative w-full h-full flex-shrink-0">
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      priority={idx === 0}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover pointer-events-none select-none"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>

              {/* Top-Left Badge: Discount */}
              {discountPercent > 0 && (
                <div className="absolute top-3.5 left-3.5 z-20 pointer-events-none">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#FF3B30] text-white text-[12px] font-extrabold tracking-tight shadow-md">
                    -{discountPercent}%
                  </span>
                </div>
              )}

              {/* Top-Right Floating Action Buttons: Wishlist & Share */}
              <div className="absolute top-3.5 right-3.5 z-20 flex flex-col gap-2.5">
                <button
                  onClick={handleWishlistClick}
                  className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md shadow-md flex items-center justify-center text-gray-700 hover:text-[#FF3B30] hover:scale-105 active:scale-95 transition-all cursor-pointer"
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
                  className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md shadow-md flex items-center justify-center text-gray-800 hover:text-black hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  aria-label="Share"
                >
                  <Share2 className="w-5 h-5 text-gray-800 stroke-[2.2]" />
                </button>
              </div>

              {/* Left & Right Interactive Arrow Buttons */}
              {gallery.length > 1 && (
                <>
                  {safeActiveIndex > 0 && (
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white backdrop-blur-md shadow-md flex items-center justify-center text-gray-800 hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  )}
                  {safeActiveIndex < gallery.length - 1 && (
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white backdrop-blur-md shadow-md flex items-center justify-center text-gray-800 hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  )}
                </>
              )}

              {/* Bottom-Right Counter Badge */}
              {gallery.length > 1 && (
                <div className="absolute bottom-3.5 right-3.5 z-20 pointer-events-none">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold tracking-wide">
                    {safeActiveIndex + 1}/{gallery.length}
                  </span>
                </div>
              )}

              {/* Mobile Swipe Pagination Dots */}
              {gallery.length > 1 && (
                <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:hidden pointer-events-none">
                  {gallery.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === safeActiveIndex
                          ? "w-4 bg-white shadow-sm"
                          : "w-1.5 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery Carousel (Desktop only, hidden on mobile view) */}
            {gallery.length > 1 && (
              <div className="mt-3 hidden sm:flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none select-none">
                {gallery.map((img, idx) => {
                  const isActive = safeActiveIndex === idx;
                  const isVideo = idx === 5 && isRippleLamp;

                  return (
                    <button
                      key={idx}
                      ref={(el) => {
                        thumbnailRefs.current[idx] = el;
                      }}
                      onClick={() => handleSelectImage(img, idx)}
                      className={`relative w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] rounded-[16px] overflow-hidden flex-shrink-0 transition-all cursor-pointer ${
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
            {(() => {
              const reviewCount = liveReviewStats ? liveReviewStats.totalReviews : (product.review_count ? Number(product.review_count) : 0);
              const effectiveRating = reviewCount > 0
                ? (liveReviewStats?.averageRating ?? (product.rating ? Number(product.rating) : 0))
                : 0;

              return (
                <a
                  href="#reviews"
                  className="inline-flex items-center gap-2 mt-1.5 text-xs text-[#6B7280] hover:text-[#FF7A00] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-0.5 text-[#F59E0B] group-hover:scale-105 transition-transform">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          reviewCount > 0 && i < Math.round(effectiveRating) ? "fill-current text-[#F59E0B]" : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-800 group-hover:text-[#FF7A00]">
                    ({reviewCount > 0 ? effectiveRating.toFixed(1) : "0.0"})
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="underline decoration-dotted underline-offset-2">
                    {reviewCount > 0
                      ? `${reviewCount} verified customer ${reviewCount === 1 ? "review" : "reviews"} • Customer Reviews ↓`
                      : "Write First Review • Customer Reviews ↓"}
                  </span>
                </a>
              );
            })()}

            {/* 4 Key Highlight Points: 2 points in 1 row, total 2 rows (normal text with tick mark, no badge outline, full text in mobile & desktop) */}
            {productPoints.length > 0 && (
              <div className="mt-3 mb-2 grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-2">
                {productPoints.slice(0, 4).map((pt, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-1.5 min-w-0"
                  >
                    <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/70 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />
                    </div>
                    <span className="text-[12px] sm:text-[12.5px] font-medium text-gray-800 leading-snug">
                      {pt}
                    </span>
                  </div>
                ))}
              </div>
            )}

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

            {/* Action Buttons: ADD TO CART & BUY NOW (matching reference design) */}
            <div className="mt-4 space-y-2.5">
              {/* Out of Stock Prominent Alert Banner */}
              {isOutOfStock && (
                <div className="p-3.5 rounded-2xl bg-red-50 border-2 border-red-200 text-red-900 text-xs flex items-start gap-2.5 shadow-xs mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black text-red-700 uppercase tracking-wide text-[11px]">Currently Out of Stock</p>
                    <p className="text-red-700 mt-0.5 font-medium leading-relaxed">
                      This product is currently out of stock and cannot be purchased at this time.
                    </p>
                  </div>
                </div>
              )}

              {/* 1. ADD TO CART Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-3.5 sm:py-4 px-4 rounded-xl font-black text-[15px] sm:text-[16px] uppercase tracking-wider flex items-center justify-center transition-all ${
                  isOutOfStock
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                    : "bg-[#282736] hover:bg-[#1E1D2B] active:scale-[0.99] text-white shadow-sm"
                }`}
              >
                <span>{isOutOfStock ? "Out of Stock" : "ADD TO CART"}</span>
              </button>

              {/* 2. BUY NOW Button with Payment Badges & Chevron (Orange Theme) */}
              <button
                onClick={handleBuyWithUpi}
                disabled={isOutOfStock}
                className={`w-full py-3.5 sm:py-4 px-4 rounded-xl font-black text-[15px] sm:text-[16px] uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all ${
                  isOutOfStock
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70"
                    : "bg-gradient-to-r from-[#FF4D15] via-[#FF451A] to-[#FA3B00] hover:brightness-105 active:scale-[0.99] text-white shadow-md shadow-[#FF7A00]/25"
                }`}
              >
                {isOutOfStock ? (
                  <span>CURRENTLY OUT OF STOCK</span>
                ) : (
                  <>
                    <span className="tracking-wider">BUY NOW</span>
                    <div className="flex items-center -space-x-1 ml-0.5">
                      {/* Google Pay */}
                      <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-xs shrink-0 p-0.5 z-30">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                          />
                        </svg>
                      </span>
                      {/* PhonePe */}
                      <span className="w-5 h-5 rounded-full bg-[#5F259F] border border-white/60 flex items-center justify-center shadow-xs shrink-0 z-20">
                        <span className="text-white font-bold text-[9px] leading-none">पे</span>
                      </span>
                      {/* Paytm */}
                      <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-xs shrink-0 overflow-hidden px-0.5 z-10">
                        <span className="text-[7px] font-black leading-none tracking-tighter">
                          <span className="text-[#002E6E]">Pay</span>
                          <span className="text-[#00BAF2]">tm</span>
                        </span>
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white stroke-[2.8]" />
                  </>
                )}
              </button>

              {/* Accepted Payment Trust Badges (VISA, Apple Pay, G Pay, UPI, Mastercard) */}
              <PaymentTrustBadges />
            </div>

            {/* ========================================================
                BUY MORE SAVE MORE - BUNDLE TIERS (DYNAMICALLY CONFIGURED BY ADMIN)
               ======================================================== */}
            {isBundleEnabled && computedBundleTiers.length > 0 && (
              <div className="mt-5 mb-2 select-none">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-gray-300 flex-1" />
                  <h3 className="font-display font-extrabold text-[15px] sm:text-base text-gray-900 tracking-tight flex items-center gap-1.5 select-none">
                    <span>{bundleHeaderTitle}</span>
                    <span className="text-amber-500">✨</span>
                  </h3>
                  <div className="h-px bg-gradient-to-l from-transparent via-gray-300 to-gray-300 flex-1" />
                </div>

                <div className="space-y-3">
                  {computedBundleTiers.map((tier) => {
                    const isSelected = selectedBundleTier === tier.qty;
                    const isBestPrice =
                      tier.badge?.toLowerCase().includes("best price") || tier.qty === 1;
                    const isBestDeal =
                      tier.badge?.toLowerCase().includes("deal") ||
                      tier.badge?.toLowerCase().includes("mega") ||
                      tier.qty >= 3;
                    const badgeBg = isBestPrice
                      ? "bg-[#282736]"
                      : isBestDeal
                      ? "bg-gradient-to-r from-[#E53E3E] to-[#FA3B00]"
                      : "bg-gradient-to-r from-[#FF5722] to-[#FF7A00]";
                    const activeBorder = isBestDeal
                      ? "border-[#E53E3E] ring-[#E53E3E]/30"
                      : "border-[#FF5722] ring-[#FF5722]/30";
                    const radioColor = isBestDeal
                      ? "bg-[#E53E3E] border-[#E53E3E]"
                      : "bg-[#FF5722] border-[#FF5722]";

                    return (
                      <div
                        key={tier.qty}
                        onClick={() => {
                          setSelectedBundleTier(tier.qty);
                          setQuantity(tier.qty);
                        }}
                        className={`relative p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all duration-200 flex items-center justify-between ${
                          isSelected
                            ? `bg-[#FFF8F4] border-2 ${activeBorder} shadow-sm ring-1`
                            : "bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                        }`}
                      >
                        {/* Badge top-right */}
                        {tier.badge && (
                          <div
                            className={`absolute -top-2.5 right-4 ${badgeBg} text-white text-[10px] sm:text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider`}
                          >
                            {tier.badge}
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          {/* Custom Radio Button */}
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${
                              isSelected ? radioColor : "border-gray-300 bg-white"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm sm:text-base text-gray-900">
                                Buy {tier.qty}
                              </span>
                              {tier.tagText && (
                                <span className="border border-[#FF5722] text-[#FF5722] bg-orange-50/80 text-[10px] sm:text-[11px] font-black px-1.5 py-0.5 rounded-md leading-none">
                                  {tier.tagText}
                                </span>
                              )}
                            </div>
                            {tier.savings > 0 && (
                              <p className="text-[11px] sm:text-xs text-gray-500 font-semibold mt-0.5">
                                You save{" "}
                                <span className="text-emerald-600 font-bold">
                                  ₹{tier.savings.toLocaleString("en-IN")}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`font-extrabold text-base sm:text-lg ${
                              tier.savings > 0 ? "text-[#E53E3E]" : "text-gray-900"
                            } block`}
                          >
                            ₹{tier.totalPrice.toLocaleString("en-IN")}
                          </span>
                          {tier.savings > 0 && (
                            <span className="line-through text-xs text-gray-400 block -mt-0.5">
                              ₹{tier.regularTotal.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trust Badges: 100% Secure, Free Shipping, Easy Returns, Cash on Delivery */}
            <div className="mt-4 sm:mt-5 grid grid-cols-4 gap-2 sm:gap-2.5">
              {[
                {
                  icon: ShieldCheck,
                  title: "100% Secure",
                  subtitle: "SSL Protected",
                },
                {
                  icon: Truck,
                  title: "Free Shipping",
                  subtitle: "On All Orders",
                },
                {
                  icon: RotateCcw,
                  title: "Easy Returns",
                  subtitle: "7 Days Window",
                },
                {
                  icon: Banknote,
                  title: "Cash on Delivery",
                  subtitle: "COD Available",
                },
              ].map((badge, idx) => {
                const IconComponent = badge.icon;
                return (
                  <div
                    key={idx}
                    className={`trust-flow-card trust-flow-card-${idx} relative flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-2xl border border-gray-200/80 bg-white text-center select-none cursor-default shadow-2xs`}
                  >
                    <div
                      className={`trust-flow-icon trust-flow-icon-${idx} w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center mb-1.5 bg-gray-100 text-gray-700`}
                    >
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
                    </div>
                    <span className="text-[10px] sm:text-[11.5px] font-bold text-gray-900 leading-tight">
                      {badge.title}
                    </span>
                    <span className="text-[8px] sm:text-[9.5px] text-gray-500 font-medium leading-tight mt-0.5">
                      {badge.subtitle}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Color / Variant Selector - Universal for all products */}
            {availableColors.length > 0 && product.has_colors !== false ? (
              <div className="mt-5">
                <h3 className="text-[13px] sm:text-[14px] font-bold text-gray-900 mb-2">
                  Color: <span className="font-semibold text-[#FF7A00]">{selectedColor}</span>
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
                            ? "ring-2 ring-[#FF7A00] ring-offset-2 scale-105 shadow-md"
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
            ) : product.color && product.has_colors !== false && product.color.toLowerCase() !== "standard" ? (
              <div className="mt-5">
                <h3 className="text-[13px] sm:text-[14px] font-bold text-gray-900 mb-1">
                  Color: <span className="font-semibold text-[#FF7A00]">{product.color}</span>
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
                    onClick={() => {
                      const newQ = Math.max(1, quantity - 1);
                      setQuantity(newQ);
                      setSelectedBundleTier(newQ === 1 ? 1 : newQ === 2 ? 2 : 3);
                    }}
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
                    onClick={() => {
                      const newQ = Math.min(product?.stock_count || 99, quantity + 1);
                      setQuantity(newQ);
                      setSelectedBundleTier(newQ === 1 ? 1 : newQ === 2 ? 2 : 3);
                    }}
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

            {/* PIN Code Delivery Availability Checker & Animated Timeline */}
            <DeliveryEstimator businessDays={5} />

            {/* ========================================================
                COLLAPSIBLE ACCORDIONS (DYNAMIC SPECIFICATIONS)
               ======================================================== */}
            {/* ========================================================
                PRODUCT DETAILS & OVERVIEW (OPEN VISUAL STORY & GIF SHOWCASE)
               ======================================================== */}
            {product.overview_blocks && product.overview_blocks.length > 0 ? (
              <div className="mt-8 pt-6 border-t border-gray-100 space-y-7">
                {product.overview_blocks.map((block, bIdx) => {
                  const hasHeading = Boolean(block.heading && block.heading.trim());
                  const hasDetails = Boolean(block.details && block.details.trim());
                  const hasMedia = Boolean(block.media_url && block.media_url.trim());

                  if (!hasHeading && !hasDetails && !hasMedia) return null;

                  return (
                    <div key={block.id || bIdx} className="space-y-3.5">
                      {hasHeading && (
                        <h2 className="text-[17px] sm:text-[19px] font-display font-bold text-gray-900 leading-snug tracking-tight">
                          {block.heading}
                        </h2>
                      )}

                      {hasDetails && (
                        <div className="text-[13px] sm:text-[14px] text-gray-700 leading-relaxed whitespace-pre-line font-normal space-y-1">
                          {block.details}
                        </div>
                      )}

                      {hasMedia && (
                        <div className="relative w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100/90 shadow-2xs">
                          <img
                            src={block.media_url}
                            alt={block.heading || `${product.name} visual story ${bIdx + 1}`}
                            className="w-full h-auto object-cover rounded-2xl"
                            loading="lazy"
                          />
                          {block.media_caption && (
                            <p className="text-[11px] text-gray-500 italic text-center py-2 px-3 bg-gray-50/70 border-t border-gray-100">
                              {block.media_caption}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : product.description ? (
              <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
                <h2 className="text-[16px] sm:text-[18px] font-display font-bold text-gray-900 leading-snug">
                  Product Details & Overview
                </h2>
                <div className="text-[13px] sm:text-[14px] text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
                {product.tagline && (
                  <p className="font-semibold text-gray-800 italic text-[13px]">
                    &ldquo;{product.tagline}&rdquo;
                  </p>
                )}
              </div>
            ) : null}

            {/* ========================================================
                COLLAPSIBLE ACCORDIONS (SPECIFICATIONS, WHAT'S IN THE BOX, ETC.)
               ======================================================== */}
            <div className="mt-6 space-y-2.5 border-t border-gray-100 pt-5">

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
                        {product.color && product.has_colors !== false && product.color.toLowerCase() !== "standard" && (
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
                              <Check className="w-4 h-4 text-[#FF7A00] shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-[#FF7A00]" />
                            <span>1 × {product.name}</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-[#FF7A00]" />
                            <span>1 × Official User Manual & Operating Guide</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-[#FF7A00]" />
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
                        📞 <strong>Direct Support:</strong> Contact our WhatsApp support at{" "}
                        <a
                          href="https://wa.me/919744122853?text=Hi%20Zupe%20Store%2C%20I%20have%20an%20inquiry%20about%20a%20product"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#FF7A00] font-semibold hover:underline"
                        >
                          +91 97441 22853
                        </a>{" "}
                        or email{" "}
                        <a
                          href="mailto:zupestoreonline@gmail.com"
                          className="text-[#FF7A00] font-semibold hover:underline"
                        >
                          zupestoreonline@gmail.com
                        </a>{" "}
                        for instant assistance.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* "Why You'll Love This ❤️" Card (Repositioned after accordions before You May Also Like) */}
            <div className="mt-6 p-4 sm:p-5 rounded-[20px] bg-[#F3F4F6] border border-gray-100">
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
          </div>
        </div>
      </main>

      {/* ========================================================
          YOU MAY ALSO LIKE (MATCHING PRODUCTS SET)
         ======================================================== */}
      {product && (
        <YouMayAlsoLike
          currentProduct={product}
          onToast={(msg) => showToast(msg)}
        />
      )}

      {/* ========================================================
          SHOPPABLE PRODUCT VIDEOS & REELS (BEFORE REVIEWS)
         ======================================================== */}
      {product && (
        <ShoppableVideosSection
          currentProduct={product}
          onToast={(msg) => showToast(msg)}
        />
      )}

      {/* ========================================================
          CUSTOMER REVIEWS & RATINGS SECTION (LAST OF PRODUCT PAGE)
         ======================================================== */}
      {product && (
        <ProductReviewsSection
          productId={product.slug || product.id}
          productName={product.name}
          productImage={product.poster_image || (product.images && product.images[0])}
          fallbackRating={liveReviewStats?.averageRating ?? (product.rating ? Number(product.rating) : 0)}
          fallbackReviewCount={liveReviewStats?.totalReviews ?? (product.review_count ? Number(product.review_count) : 0)}
          onStatsChange={(newStats) => setLiveReviewStats(newStats)}
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
        <div className="max-w-[480px] mx-auto grid grid-cols-2 gap-2.5">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`py-3 px-3 rounded-xl font-black text-[13px] uppercase tracking-wider flex items-center justify-center transition-all ${
              isOutOfStock
                ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                : "bg-[#282736] text-white active:scale-95"
            }`}
          >
            <span>{isOutOfStock ? "Out of Stock" : "ADD TO CART"}</span>
          </button>

          <button
            onClick={handleBuyWithUpi}
            disabled={isOutOfStock}
            className={`py-3 px-3 rounded-xl font-black text-[13px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              isOutOfStock
                ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70"
                : "bg-gradient-to-r from-[#FF4D15] via-[#FF451A] to-[#FA3B00] text-white shadow-md shadow-[#FF7A00]/25 active:scale-95"
            }`}
          >
            {isOutOfStock ? (
              <span>OUT OF STOCK</span>
            ) : (
              <>
                <span className="tracking-wide">BUY NOW</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
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
