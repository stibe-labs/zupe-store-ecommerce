"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShoppingBag,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { ProductVideo } from "@/lib/videoStore";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

// Fallback seed creator videos matching home page for guaranteed playback
const SEED_CREATOR_VIDEOS: ProductVideo[] = [
  {
    id: "creator-vid-01",
    productId: "watch",
    title: "Titan Minimalist Watch Hands-on",
    videoUrl:
      "https://pub-abec22fbfdb8446490341e69eabe6a1c.r2.dev/videos/1791519244046-VID_20260913_013314_447-9d231d.mp4",
    posterUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800",
    viewsText: "28.4k",
    badge: "POPULAR",
    productName: "Titan Minimalist Analog Watch",
    productPrice: 1799,
    productMrp: 2999,
    productSlug: "watch",
    productImage:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600",
    active: true,
    createdAt: "2026-03-08T12:00:00.000Z",
  },
  {
    id: "creator-vid-02",
    productId: "water-ripple-lamp",
    title: "Dynamic Water Ripple Night Light",
    videoUrl: "/videos/creator-flower.mp4",
    posterUrl: "/products/ripple/ripple-amber.jpg",
    viewsText: "42.1k",
    badge: "TRENDING",
    productName: "Water Ripple Crystal Lamp",
    productPrice: 650,
    productMrp: 1099,
    productSlug: "dynamic-water-ripple-night-light",
    productImage: "/products/ripple/ripple-amber.jpg",
    active: true,
    createdAt: "2026-03-05T12:00:00.000Z",
  },
  {
    id: "creator-vid-03",
    productId: "menstrual-heating-pad",
    title: "Portable Heating Pad Experience",
    videoUrl: "/videos/creator-bear.mp4",
    posterUrl: "/products/heating-pad/pad-pink-1.jpg",
    viewsText: "31.5k",
    badge: "HOT",
    productName: "Portable Menstrual Heating Pad",
    productPrice: 799,
    productMrp: 1149,
    productSlug: "portable-menstrual-heating-pad",
    productImage: "/products/heating-pad.jpg",
    active: true,
    createdAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "creator-vid-04",
    productId: "mini-portable-steam-iron",
    title: "Handheld Steam Iron Unboxing & Test",
    videoUrl: "/videos/creator-sintel.mp4",
    posterUrl: "/products/iron/iron-teal-1.jpg",
    viewsText: "19.8k",
    badge: "NEW",
    productName: "Mini Handheld Garment Steamer",
    productPrice: 599,
    productMrp: 1199,
    productSlug: "mini-portable-steam-iron",
    productImage: "/products/steam-iron.jpg",
    active: true,
    createdAt: "2026-02-28T09:00:00.000Z",
  },
  {
    id: "creator-vid-05",
    productId: "foldable-mini-washer",
    title: "Compact Washer Delicate Clothes Demo",
    videoUrl: "/videos/creator-bunny.mp4",
    posterUrl: "/products/washer/washer-purple-1.jpg",
    viewsText: "37.2k",
    badge: "MUST HAVE",
    productName: "Portable Mini Foldable Washer",
    productPrice: 1299,
    productMrp: 1949,
    productSlug: "portable-mini-foldable-washer-spin-dryer",
    productImage: "/products/foldable-washer.jpg",
    active: true,
    createdAt: "2026-02-15T15:30:00.000Z",
  },
];

interface ShoppableVideosSectionProps {
  currentProduct?: Product;
  showHeader?: boolean;
  title?: string;
  subtitle?: string;
  centeredHeader?: boolean;
  variant?: "mobile" | "desktop" | "auto";
  className?: string;
  onToast?: (msg: string) => void;
}

export function ShoppableVideosSection({
  currentProduct,
  showHeader = true,
  title = "SEE IT IN ACTION",
  subtitle = "Discover the little details, clever features, and everyday benefits that make a big difference.",
  centeredHeader = true,
  variant = "auto",
  className = "",
  onToast,
}: ShoppableVideosSectionProps) {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const { addToCart, addItem } = useCart();

  const [videos, setVideos] = useState<ProductVideo[]>(SEED_CREATOR_VIDEOS);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Active full-screen modal player state
  const [activeModalVideoIndex, setActiveModalVideoIndex] = useState<number | null>(null);
  const [isModalPlaying, setIsModalPlaying] = useState(true);
  const [isModalMuted, setIsModalMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  // ==========================================================
  // MOBILE POP-UP 3-IN-1 CAROUSEL STATE
  // ==========================================================
  const [containerWidth, setContainerWidth] = useState(0);
  const [mobileTrackIndex, setMobileTrackIndex] = useState(0);
  const [isMobileTransitioning, setIsMobileTransitioning] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isCenterMuted, setIsCenterMuted] = useState(true);
  const [isCenterPlaying, setIsCenterPlaying] = useState(false);

  // ==========================================================
  // DESKTOP 1-ROW CONTINUOUS MOVING STRIP STATE (HOMEPAGE MATCH)
  // ==========================================================
  const [desktopIndex, setDesktopIndex] = useState(0);
  const [desktopStepWidth, setDesktopStepWidth] = useState(240);
  const [isDesktopTransitioning, setIsDesktopTransitioning] = useState(true);

  // Shared state
  const [isHovered, setIsHovered] = useState(false);
  const [isSectionInView, setIsSectionInView] = useState(false);

  // DOM Refs
  const sectionRef = useRef<HTMLElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const mobileCardVideoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());

  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const desktopTrackRef = useRef<HTMLDivElement>(null);
  const firstDesktopCardRef = useRef<HTMLDivElement>(null);
  const desktopVideoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());

  const activeModalVideoRef = useRef<HTMLVideoElement>(null);

  // Touch & Mouse drag refs for mobile
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwipingHorizontally = useRef<boolean | null>(null);
  const isMouseDownRef = useRef(false);
  const mouseStartXRef = useRef(0);

  // 1. Fetch videos for product or store, merged with guaranteed local fallbacks
  useEffect(() => {
    let isMounted = true;
    const prodKey = currentProduct?.slug || currentProduct?.id;
    const url = prodKey
      ? `/api/videos?productId=${encodeURIComponent(prodKey)}&_t=${Date.now()}`
      : `/api/videos?_t=${Date.now()}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.videos) && data.videos.length > 0) {
          const merged = data.videos.map((v: ProductVideo, i: number) => {
            const fallback = SEED_CREATOR_VIDEOS[i % SEED_CREATOR_VIDEOS.length];
            const isGoogleStorage = (v.videoUrl || "").includes("gtv-videos-bucket");
            return {
              ...v,
              videoUrl: isGoogleStorage || !v.videoUrl ? fallback.videoUrl : v.videoUrl,
              posterUrl: v.posterUrl || fallback.posterUrl,
              productImage: v.productImage || fallback.productImage,
              productName: v.productName || fallback.productName,
              productPrice: v.productPrice || fallback.productPrice,
              productSlug: v.productSlug || fallback.productSlug,
            };
          });
          setVideos(merged);
        } else if (isMounted) {
          setVideos(SEED_CREATOR_VIDEOS);
        }
      })
      .catch(() => {
        if (isMounted) setVideos(SEED_CREATOR_VIDEOS);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentProduct]);

  // 2. Fetch live products catalog for shoppable modal
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/products?_t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (isMounted && d.products && Array.isArray(d.products)) {
          setCatalog(d.products);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Total items & infinite wrap arrays
  const totalItems = videos.length;
  const baseVideos: ProductVideo[] =
    videos.length === 2 ? [...videos, ...videos] : videos;
  const mobileN = baseVideos.length;
  const displayMobileVideos: ProductVideo[] =
    mobileN >= 3 ? [...baseVideos, ...baseVideos, ...baseVideos] : baseVideos;

  // Triplicate array for desktop continuous scrolling
  const extendedDesktopVideos = [...videos, ...videos, ...videos];

  // 3. Initialize mobile track index
  useEffect(() => {
    if (mobileN >= 3) {
      setMobileTrackIndex(mobileN);
    } else {
      setMobileTrackIndex(0);
    }
  }, [mobileN]);

  // 4. Observe section visibility
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsSectionInView(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "100px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 5. Measure mobile container width for pixel-perfect card sizing & translation
  useEffect(() => {
    if (!mobileContainerRef.current) return;
    const updateSize = () => {
      if (mobileContainerRef.current) {
        setContainerWidth(mobileContainerRef.current.clientWidth);
      }
    };
    updateSize();

    window.addEventListener("resize", updateSize);
    const ro = new ResizeObserver(updateSize);
    ro.observe(mobileContainerRef.current);

    return () => {
      window.removeEventListener("resize", updateSize);
      ro.disconnect();
    };
  }, []);

  const mobileGap = 8;
  const mobileCardWidth =
    containerWidth > 0 ? (containerWidth - 2 * mobileGap) / 3 : 110;
  const mobileStep = mobileCardWidth + mobileGap;
  const mobileBaseTranslateX =
    mobileN >= 3 ? -(mobileTrackIndex - 1) * mobileStep : 0;
  const mobileCurrentTranslateX = mobileBaseTranslateX + dragOffset;
  const realVideoIndex =
    mobileN > 0 ? (mobileTrackIndex % mobileN) % videos.length : 0;

  // 6. Measure desktop step width dynamically (matching CreatorsReelsSection)
  const measureDesktopStepWidth = useCallback(() => {
    if (firstDesktopCardRef.current && desktopTrackRef.current) {
      const cardW = firstDesktopCardRef.current.offsetWidth;
      const trackStyle = window.getComputedStyle(desktopTrackRef.current);
      const gap = parseFloat(trackStyle.gap) || 16;
      setDesktopStepWidth(cardW + gap);
    }
  }, []);

  useEffect(() => {
    measureDesktopStepWidth();
    window.addEventListener("resize", measureDesktopStepWidth);
    return () => window.removeEventListener("resize", measureDesktopStepWidth);
  }, [measureDesktopStepWidth, videos]);

  // 7. MOBILE: Transition End for seamless wrap-around
  const handleMobileTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    setIsMobileTransitioning(false);

    if (mobileN >= 3) {
      if (mobileTrackIndex >= 2 * mobileN) {
        setMobileTrackIndex((prev) => prev - mobileN);
      } else if (mobileTrackIndex < mobileN) {
        setMobileTrackIndex((prev) => prev + mobileN);
      }
    }
  };

  // 8. MOBILE: Auto-advance every 3s
  useEffect(() => {
    if (variant === "desktop") return;
    if (
      !isSectionInView ||
      isDragging ||
      activeModalVideoIndex !== null ||
      isHovered ||
      mobileN <= 1
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setIsMobileTransitioning(true);
      setMobileTrackIndex((prev) => prev + 1);
    }, 3000);

    return () => clearTimeout(timer);
  }, [
    variant,
    mobileTrackIndex,
    isSectionInView,
    isDragging,
    activeModalVideoIndex,
    isHovered,
    mobileN,
  ]);

  // 9. MOBILE: Auto-play center video muted
  useEffect(() => {
    if (variant === "desktop") return;
    if (!isSectionInView || activeModalVideoIndex !== null) {
      mobileCardVideoRefs.current.forEach((video) => {
        if (video && !video.paused) video.pause();
      });
      setIsCenterPlaying(false);
      return;
    }

    mobileCardVideoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === mobileTrackIndex) {
        video.muted = isCenterMuted;
        video.defaultMuted = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsCenterPlaying(true))
            .catch(() => {
              video.muted = true;
              video.play().catch(() => {});
            });
        }
      } else {
        if (!video.paused) {
          video.pause();
        }
      }
    });
  }, [
    variant,
    mobileTrackIndex,
    isSectionInView,
    activeModalVideoIndex,
    isCenterMuted,
    displayMobileVideos,
  ]);

  // 10. DESKTOP: Continuous moving step behavior (Exact replica of CreatorsReelsSection on homepage)
  // - Stays 2000ms
  // - Smoothly shifts left by 1 card over 650ms
  // - Repeats infinitely
  useEffect(() => {
    if (variant === "mobile") return;
    if (
      isHovered ||
      activeModalVideoIndex !== null ||
      totalItems <= 1 ||
      !isSectionInView
    ) {
      return;
    }

    const interval = setInterval(() => {
      setIsDesktopTransitioning(true);
      setDesktopIndex((prev) => prev + 1);
    }, 2650);

    return () => clearInterval(interval);
  }, [variant, isHovered, activeModalVideoIndex, totalItems, isSectionInView]);

  // DESKTOP: Seamless infinite wrap-around
  const handleDesktopTransitionEnd = () => {
    if (desktopIndex >= totalItems) {
      setIsDesktopTransitioning(false);
      setDesktopIndex(0);
    }
  };

  // DESKTOP: Autoplay all visible cards muted at all times
  useEffect(() => {
    if (variant === "mobile") return;
    if (!isSectionInView) {
      desktopVideoRefs.current.forEach((video) => {
        if (video && !video.paused) {
          video.pause();
        }
      });
      return;
    }

    const startIdx = desktopIndex;
    const endIdx = desktopIndex + 7;

    desktopVideoRefs.current.forEach((video, idx) => {
      if (!video) return;
      const isVisible = idx >= startIdx && idx <= endIdx;
      if (isVisible) {
        video.muted = true;
        video.defaultMuted = true;
        if (video.paused) {
          video.play().catch(() => {});
        }
      } else {
        if (!video.paused) {
          video.pause();
        }
      }
    });
  }, [variant, isSectionInView, videos, desktopIndex]);

  // 11. Mobile touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (mobileN <= 1) return;
    setIsDragging(true);
    setIsMobileTransitioning(false);
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwipingHorizontally.current = null;
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || mobileN <= 1) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    if (isSwipingHorizontally.current === null) {
      if (Math.abs(diffX) > 7 || Math.abs(diffY) > 7) {
        isSwipingHorizontally.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (isSwipingHorizontally.current === false) return;
    setDragOffset(diffX);
  };

  const handleTouchEnd = () => {
    if (!isDragging || mobileN <= 1) return;
    setIsDragging(false);
    setIsMobileTransitioning(true);

    const threshold = Math.max(30, mobileCardWidth * 0.22);
    if (dragOffset < -threshold) {
      setMobileTrackIndex((prev) => prev + 1);
    } else if (dragOffset > threshold) {
      setMobileTrackIndex((prev) => prev - 1);
    }
    setDragOffset(0);
    isSwipingHorizontally.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mobileN <= 1) return;
    isMouseDownRef.current = true;
    setIsDragging(true);
    setIsMobileTransitioning(false);
    mouseStartXRef.current = e.clientX;
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || mobileN <= 1) return;
    const diffX = e.clientX - mouseStartXRef.current;
    setDragOffset(diffX);
  };

  const handleMouseUp = () => {
    if (!isMouseDownRef.current || mobileN <= 1) return;
    isMouseDownRef.current = false;
    setIsDragging(false);
    setIsMobileTransitioning(true);

    const threshold = Math.max(30, mobileCardWidth * 0.22);
    if (dragOffset < -threshold) {
      setMobileTrackIndex((prev) => prev + 1);
    } else if (dragOffset > threshold) {
      setMobileTrackIndex((prev) => prev - 1);
    }
    setDragOffset(0);
  };

  const handleCardClick = (idx: number, realIdx: number) => {
    if (mobileN <= 1) {
      handleOpenReel(realIdx);
      return;
    }

    if (idx === mobileTrackIndex) {
      handleOpenReel(realIdx);
    } else if (idx === mobileTrackIndex - 1) {
      setIsMobileTransitioning(true);
      setMobileTrackIndex(idx);
    } else if (idx === mobileTrackIndex + 1) {
      setIsMobileTransitioning(true);
      setMobileTrackIndex(idx);
    } else {
      setIsMobileTransitioning(true);
      setMobileTrackIndex(idx);
    }
  };

  const toggleCenterMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isCenterMuted;
    setIsCenterMuted(nextMuted);
    const activeVid = mobileCardVideoRefs.current.get(mobileTrackIndex);
    if (activeVid) {
      activeVid.muted = nextMuted;
    }
  };

  const toggleCenterPlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    const activeVid = mobileCardVideoRefs.current.get(mobileTrackIndex);
    if (!activeVid) return;
    if (activeVid.paused) {
      activeVid.play().catch(() => {});
      setIsCenterPlaying(true);
    } else {
      activeVid.pause();
      setIsCenterPlaying(false);
    }
  };

  // 12. Modal Player controls
  const handleOpenReel = (idx: number) => {
    mobileCardVideoRefs.current.forEach((video) => {
      if (video && !video.paused) video.pause();
    });
    desktopVideoRefs.current.forEach((video) => {
      if (video && !video.paused) video.pause();
    });
    setActiveModalVideoIndex(idx);
    setIsModalPlaying(true);
    setProgress(0);
  };

  const handleCloseReel = () => {
    setActiveModalVideoIndex(null);
  };

  const handleTimeUpdate = () => {
    if (activeModalVideoRef.current) {
      const current = activeModalVideoRef.current.currentTime;
      const total = activeModalVideoRef.current.duration || 1;
      setProgress((current / total) * 100);
    }
  };

  const toggleModalPlayPause = () => {
    if (!activeModalVideoRef.current) return;
    if (activeModalVideoRef.current.paused) {
      activeModalVideoRef.current.play();
      setIsModalPlaying(true);
    } else {
      activeModalVideoRef.current.pause();
      setIsModalPlaying(false);
    }
  };

  const toggleModalMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeModalVideoRef.current) return;
    activeModalVideoRef.current.muted = !activeModalVideoRef.current.muted;
    setIsModalMuted(activeModalVideoRef.current.muted);
  };

  const handlePrevReel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeModalVideoIndex === null) return;
    const prevIdx =
      activeModalVideoIndex === 0 ? videos.length - 1 : activeModalVideoIndex - 1;
    setActiveModalVideoIndex(prevIdx);
    setProgress(0);
  };

  const handleNextReel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeModalVideoIndex === null) return;
    const nextIdx =
      activeModalVideoIndex === videos.length - 1 ? 0 : activeModalVideoIndex + 1;
    setActiveModalVideoIndex(nextIdx);
    setProgress(0);
  };

  const currentReel =
    activeModalVideoIndex !== null ? videos[activeModalVideoIndex] : null;

  const currentReelProduct = currentReel
    ? catalog.find(
        (p) =>
          (currentReel.productId &&
            (p.id.toLowerCase() === currentReel.productId.toLowerCase() ||
              p.slug.toLowerCase() === currentReel.productId.toLowerCase())) ||
          (currentReel.productSlug &&
            (p.slug.toLowerCase() === currentReel.productSlug.toLowerCase() ||
              p.id.toLowerCase() === currentReel.productSlug.toLowerCase()))
      ) || currentProduct
    : null;

  const isCurrentReelOutOfStock = currentReelProduct
    ? currentReelProduct.in_stock === 0 ||
      (currentReelProduct.stock_count !== undefined &&
        currentReelProduct.stock_count <= 0)
    : false;

  const handleBuyNowFromVideo = (vid: ProductVideo) => {
    if (isCurrentReelOutOfStock) return;
    if (!user) {
      openAuthModal(
        "login",
        "Sign in required: Please log in or create an account to proceed with purchase 🛍️"
      );
      return;
    }

    const attachedItem = {
      id:
        vid.productSlug ||
        vid.productId ||
        currentProduct?.id ||
        "featured-product",
      slug:
        vid.productSlug ||
        vid.productId ||
        currentProduct?.slug ||
        "featured-product",
      name:
        vid.productName ||
        currentProduct?.name ||
        vid.title ||
        "Featured Product",
      price:
        vid.productPrice !== undefined
          ? vid.productPrice
          : currentProduct?.price || 799,
      mrp:
        vid.productMrp !== undefined
          ? vid.productMrp
          : currentProduct?.mrp || 1199,
      poster_image:
        vid.productImage ||
        currentProduct?.poster_image ||
        vid.posterUrl ||
        "/images/placeholder.png",
      images: [
        vid.productImage ||
          currentProduct?.poster_image ||
          vid.posterUrl ||
          "/images/placeholder.png",
      ],
    };

    const addFn = addToCart || addItem;
    if (typeof addFn === "function") {
      addFn(attachedItem, 1);
    }
    router.push("/checkout");
  };

  const handleAddToCartFromVideo = (vid: ProductVideo) => {
    if (isCurrentReelOutOfStock) return;
    if (!user) {
      openAuthModal(
        "login",
        "Sign in required: Please log in to add items to your cart 🛒"
      );
      return;
    }

    const attachedItem = {
      id:
        vid.productSlug ||
        vid.productId ||
        currentProduct?.id ||
        "featured-product",
      slug:
        vid.productSlug ||
        vid.productId ||
        currentProduct?.slug ||
        "featured-product",
      name:
        vid.productName ||
        currentProduct?.name ||
        vid.title ||
        "Featured Product",
      price:
        vid.productPrice !== undefined
          ? vid.productPrice
          : currentProduct?.price || 799,
      mrp:
        vid.productMrp !== undefined
          ? vid.productMrp
          : currentProduct?.mrp || 1199,
      poster_image:
        vid.productImage ||
        currentProduct?.poster_image ||
        vid.posterUrl ||
        "/images/placeholder.png",
      images: [
        vid.productImage ||
          currentProduct?.poster_image ||
          vid.posterUrl ||
          "/images/placeholder.png",
      ],
    };

    const addFn = addToCart || addItem;
    if (typeof addFn === "function") {
      addFn(attachedItem, 1);
    }
    if (onToast) {
      onToast(`Added ${attachedItem.name} to cart! 🛒`);
    }
    handleCloseReel();
    router.push("/cart");
  };

  if (!loading && (!videos || videos.length === 0)) {
    return null;
  }

  // ==========================================================
  // RENDER DESKTOP VARIANT (Exact replica of CreatorsReelsSection on homepage)
  // ==========================================================
  if (variant === "desktop") {
    return (
      <section
        ref={sectionRef}
        className={`w-full max-w-[1520px] mx-auto select-none ${className}`}
      >
        {/* Section Heading & Desktop side buttons */}
        {showHeader && (
          <div className="flex items-center justify-between mb-3.5 px-0.5">
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[#0F172A] tracking-tight uppercase">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">
                  {subtitle}
                </p>
              )}
            </div>

            {totalItems > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDesktopTransitioning(true);
                    setDesktopIndex((prev) => Math.max(0, prev - 1));
                  }}
                  className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-gray-900 text-gray-700 hover:text-black flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
                  aria-label="Previous videos"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDesktopTransitioning(true);
                    setDesktopIndex((prev) => prev + 1);
                  }}
                  className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-gray-900 text-gray-700 hover:text-black flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
                  aria-label="Next videos"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Viewport for horizontal continuous moving track */}
        <div
          ref={desktopContainerRef}
          className="w-full overflow-hidden relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            ref={desktopTrackRef}
            onTransitionEnd={handleDesktopTransitionEnd}
            style={{
              transform: `translate3d(-${desktopIndex * desktopStepWidth}px, 0, 0)`,
              transition: isDesktopTransitioning
                ? "transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)"
                : "none",
            }}
            className="flex items-stretch gap-2.5 sm:gap-3.5 md:gap-4 will-change-transform"
          >
            {extendedDesktopVideos.map((video, idx) => {
              const poster =
                video.posterUrl ||
                video.productImage ||
                currentProduct?.poster_image ||
                "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800";

              return (
                <div
                  key={`${video.id}-${idx}`}
                  ref={idx === 0 ? firstDesktopCardRef : undefined}
                  onClick={() => handleOpenReel(idx % videos.length)}
                  className="w-[155px] min-w-[155px] sm:w-[175px] sm:min-w-[175px] md:w-[200px] md:min-w-[200px] lg:w-[225px] lg:min-w-[225px] xl:w-[240px] xl:min-w-[240px] aspect-[9/15.5] flex-shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden relative shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-slate-950 group border border-slate-200/60 hover:border-[#FF7A00]/50 hover:-translate-y-0.5"
                >
                  {/* Background Video (All Visible Videos Play Muted at all times) */}
                  <video
                    ref={(el) => {
                      if (el) {
                        el.muted = true;
                        el.defaultMuted = true;
                        desktopVideoRefs.current.set(idx, el);
                        if (isSectionInView) {
                          el.play().catch(() => {});
                        }
                      } else {
                        desktopVideoRefs.current.delete(idx);
                      }
                    }}
                    src={video.videoUrl}
                    poster={poster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover pointer-events-none group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Top-Right Brand Badge */}
                  <div className="absolute top-2.5 right-2.5 z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-gradient-to-tr from-[#FF7A00] to-[#FF9E42] flex items-center justify-center shadow-md border border-white/20">
                    <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white drop-shadow-xs" />
                  </div>

                  {/* Center Hover Play Icon */}
                  <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 backdrop-blur-xs text-white flex items-center justify-center shadow-lg border border-white/30 scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom Gradient Overlay with Title and Price */}
                  <div className="absolute inset-x-0 bottom-0 z-10 p-2.5 sm:p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none">
                    <p className="text-[11px] sm:text-xs md:text-[13px] font-semibold text-white truncate drop-shadow-sm leading-tight">
                      {video.productName || video.title}
                    </p>
                    {video.productPrice && (
                      <span className="inline-block mt-1 text-[10px] sm:text-xs font-bold text-white bg-white/25 backdrop-blur-md px-2 py-0.5 rounded-full">
                        ₹{Number(video.productPrice).toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Player */}
        {renderModal()}
      </section>
    );
  }

  // ==========================================================
  // RENDER MOBILE VARIANT (Exact 3-in-1 3D Pop-Up Carousel)
  // ==========================================================
  return (
    <section
      ref={sectionRef}
      className={`w-full max-w-[1600px] mx-auto px-4 sm:px-6 ${
        showHeader ? "py-4 sm:py-8" : "py-2 sm:py-4"
      } ${className}`}
    >
      {/* Section Header */}
      {showHeader && (
        <div
          className={`mb-3 sm:mb-5 ${
            centeredHeader ? "text-center" : "flex items-center justify-between"
          }`}
        >
          <div className={centeredHeader ? "max-w-xl mx-auto" : ""}>
            <h2 className="text-[17px] sm:text-2xl font-display font-extrabold text-[#111111] tracking-tight uppercase">
              {title}
            </h2>
            <p className="text-[11.5px] sm:text-sm text-gray-500 mt-1 leading-snug">
              {subtitle}
            </p>
          </div>
        </div>
      )}

      {/* 3D POP-UP 3-IN-1 REEL CAROUSEL STAGE */}
      <div className="relative group/carousel max-w-[760px] mx-auto">
        {/* Carousel Sliding Viewport Container */}
        <div
          ref={mobileContainerRef}
          className="relative w-full overflow-hidden py-4 sm:py-6 touch-pan-y select-none"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            handleMouseUp();
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Track sliding row */}
          <div
            className="flex items-center will-change-transform"
            style={{
              transform: `translateX(${mobileCurrentTranslateX}px)`,
              transition: isMobileTransitioning
                ? "transform 500ms cubic-bezier(0.25, 1, 0.5, 1)"
                : "none",
              gap: `${mobileGap}px`,
            }}
            onTransitionEnd={handleMobileTransitionEnd}
          >
            {displayMobileVideos.map((vid, idx) => {
              const isCenter = mobileN >= 3 ? idx === mobileTrackIndex : idx === 0;
              const realIdx = idx % videos.length;

              const poster =
                vid.posterUrl ||
                vid.productImage ||
                currentProduct?.poster_image ||
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800";

              return (
                <div
                  key={`${vid.id || "reel"}-${idx}`}
                  onClick={() => handleCardClick(idx, realIdx)}
                  style={{
                    width: `${mobileCardWidth}px`,
                    flexShrink: 0,
                  }}
                  className={`relative aspect-[9/16] rounded-[18px] sm:rounded-[24px] overflow-hidden bg-slate-950 transition-all duration-500 ease-out select-none ${
                    isCenter
                      ? "scale-[1.08] sm:scale-105 z-20 shadow-[0_16px_36px_rgba(0,0,0,0.4)] border-2 border-white/80 ring-2 ring-black/10 cursor-pointer"
                      : "scale-[0.92] sm:scale-95 z-10 opacity-75 hover:opacity-95 shadow-md border border-gray-200/60 cursor-pointer"
                  }`}
                >
                  {/* Background Video Element or Poster */}
                  <div className="absolute inset-0 z-0 overflow-hidden bg-black">
                    {vid.videoUrl ? (
                      <video
                        ref={(el) => {
                          if (el) {
                            mobileCardVideoRefs.current.set(idx, el);
                          } else {
                            mobileCardVideoRefs.current.delete(idx);
                          }
                        }}
                        src={vid.videoUrl}
                        poster={poster}
                        muted={isCenter ? isCenterMuted : true}
                        loop
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    ) : (
                      <img
                        src={poster}
                        alt={vid.title}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/35 pointer-events-none" />
                  </div>

                  {/* Top Overlay: Badges, View Counter & Mute Toggle for Center Card */}
                  <div className="absolute top-1.5 left-1.5 right-1.5 sm:top-2.5 sm:left-2.5 sm:right-2.5 z-20 flex items-center justify-between">
                    {vid.badge ? (
                      <span className="bg-[#FF3B30] text-white text-[8px] sm:text-[9.5px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs">
                        {vid.badge}
                      </span>
                    ) : (
                      <span className="bg-[#FF7A00] text-white text-[8px] sm:text-[9.5px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs">
                        NEW
                      </span>
                    )}

                    <div className="flex items-center gap-1">
                      {isCenter ? (
                        <button
                          type="button"
                          onClick={toggleCenterMute}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/90 transition-all shadow-md active:scale-90 cursor-pointer"
                          aria-label={isCenterMuted ? "Unmute video" : "Mute video"}
                          title={isCenterMuted ? "Unmute" : "Mute"}
                        >
                          {isCenterMuted ? (
                            <VolumeX className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5 text-white" />
                          )}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[8px] sm:text-[9.5px] font-bold shadow-xs">
                          <Eye className="w-2.5 h-2.5 text-rose-400" />
                          <span>{vid.viewsText || "24.5k"}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Center Play/Pause Button */}
                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    {isCenter ? (
                      <button
                        type="button"
                        onClick={toggleCenterPlayPause}
                        className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/45 backdrop-blur-xs border border-white/40 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all cursor-pointer"
                        aria-label={isCenterPlaying ? "Pause video" : "Play video"}
                      >
                        {isCenterPlaying ? (
                          <Pause className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-white text-white" />
                        ) : (
                          <Play className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-white text-white ml-0.5" />
                        )}
                      </button>
                    ) : (
                      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/40 backdrop-blur-xs border border-white/30 text-white flex items-center justify-center shadow-md">
                        <Play className="w-3 h-3 sm:w-4 sm:h-4 fill-white text-white ml-0.5" />
                      </div>
                    )}
                  </div>

                  {/* Bottom Price Badge */}
                  <div className="absolute bottom-1.5 sm:bottom-2.5 left-1.5 sm:left-2.5 right-1.5 sm:right-2.5 z-20">
                    {isCenter ? (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenReel(realIdx);
                        }}
                        className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-white text-center shadow-lg hover:bg-black/85 transition-all cursor-pointer"
                        title="Click to view shoppable details"
                      >
                        <p className="text-[8.5px] sm:text-[11px] font-bold truncate leading-tight text-white/95">
                          {vid.productName || vid.title}
                        </p>
                        <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-0.5">
                          <span className="text-[9.5px] sm:text-xs font-black text-[#FF7A00]">
                            ₹{(vid.productPrice || currentProduct?.price || 799).toLocaleString("en-IN")}
                          </span>
                          {(vid.productMrp || currentProduct?.mrp) && (
                            <span className="text-[7.5px] sm:text-[9.5px] text-gray-400 line-through">
                              ₹{(vid.productMrp || currentProduct?.mrp || 1199).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="px-1.5 py-0.5 rounded-md bg-black/65 backdrop-blur-xs text-white text-[9px] font-bold truncate text-center leading-tight">
                        ₹{(vid.productPrice || currentProduct?.price || 799).toLocaleString("en-IN")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Pagination Dots */}
        {videos.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-2 select-none">
            {videos.map((_, dotIdx) => {
              const isActive = dotIdx === realVideoIndex;
              return (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => {
                    setIsMobileTransitioning(true);
                    if (mobileN >= 3) {
                      const diff = dotIdx - realVideoIndex;
                      setMobileTrackIndex((prev) => prev + diff);
                    } else {
                      setMobileTrackIndex(dotIdx);
                    }
                  }}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    isActive
                      ? "w-4 h-2 bg-gray-900"
                      : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to video ${dotIdx + 1}`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Player */}
      {renderModal()}
    </section>
  );

  // ==========================================================
  // SHARED FULLSCREEN REELS MODAL VIDEO PLAYER
  // ==========================================================
  function renderModal() {
    if (!currentReel) return null;

    return (
      <div
        data-lenis-prevent
        className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn select-none"
        onClick={handleCloseReel}
      >
        <div
          data-lenis-prevent
          className="relative w-full max-w-[430px] h-full sm:h-[88vh] sm:max-h-[820px] bg-black sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Progress Bar */}
          <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-white/20">
            <div
              className="h-full bg-[#FF7A00] transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Top Controls */}
          <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold shadow-md">
                <Eye className="w-3.5 h-3.5 text-rose-400" />
                <span>{currentReel.viewsText || "24.5k"}</span>
              </span>
              {currentReel.badge && (
                <span className="px-2 py-0.5 rounded-full bg-[#FF3B30] text-white text-[10px] font-black uppercase">
                  {currentReel.badge}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleModalMute}
                className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/90 transition-colors cursor-pointer"
                title={isModalMuted ? "Unmute" : "Mute"}
              >
                {isModalMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={handleCloseReel}
                className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/90 transition-colors cursor-pointer"
                title="Close Reel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Video Element */}
          <div
            className="relative flex-1 w-full h-full flex items-center justify-center cursor-pointer bg-black"
            onClick={toggleModalPlayPause}
          >
            <video
              ref={activeModalVideoRef}
              src={currentReel.videoUrl}
              poster={currentReel.posterUrl}
              autoPlay
              playsInline
              loop
              muted={isModalMuted}
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full object-cover"
            />

            {!isModalPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center">
                  <Play className="w-8 h-8 fill-white ml-1" />
                </div>
              </div>
            )}
          </div>

          {/* Prev / Next Floating Navigation Arrows */}
          {videos.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevReel}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/70 flex items-center justify-center transition-all cursor-pointer"
                title="Previous video"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextReel}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/70 flex items-center justify-center transition-all cursor-pointer"
                title="Next video"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Bottom Shoppable Product Bar & Buy Actions */}
          <div className="relative z-30 p-4 bg-gradient-to-t from-black via-black/90 to-transparent pt-8 space-y-3">
            <h3 className="text-white text-sm font-bold line-clamp-1">
              {currentReel.title}
            </h3>

            {currentReel.productId &&
            currentReel.productId !== "none" &&
            currentReel.productId !== "all" &&
            (currentReel.productName || currentReel.productSlug) ? (
              <>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    const target =
                      currentReel.productSlug || currentReel.productId;
                    handleCloseReel();
                    if (target && target !== "all" && target !== "none") {
                      router.push(`/products/${target}`);
                    } else {
                      router.push("/products");
                    }
                  }}
                  className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/20 hover:border-white/30 transition-all flex items-center gap-3 cursor-pointer group/modalpill"
                  title={`View ${currentReel.productName || "product"} page`}
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/10 shrink-0 border border-white/20">
                    <img
                      src={
                        currentReel.productImage ||
                        currentProduct?.poster_image
                      }
                      alt={
                        currentReel.productName ||
                        currentProduct?.name ||
                        currentReel.title
                      }
                      className="w-full h-full object-cover group-hover/modalpill:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-white">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold truncate group-hover/modalpill:text-[#FF7A00] transition-colors">
                        {currentReel.productName ||
                          currentProduct?.name ||
                          currentReel.title}
                      </h4>
                      <ExternalLink className="w-3 h-3 text-gray-300 shrink-0" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-sm font-black text-[#FF7A00]">
                        ₹
                        {(
                          currentReel.productPrice ||
                          currentProduct?.price ||
                          799
                        ).toLocaleString("en-IN")}
                      </span>
                      {(currentReel.productMrp || currentProduct?.mrp) && (
                        <span className="text-[11px] text-gray-400 line-through">
                          ₹
                          {(
                            currentReel.productMrp ||
                            currentProduct?.mrp ||
                            1199
                          ).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isCurrentReelOutOfStock ? (
                  <div className="w-full py-2.5 px-3 rounded-xl bg-white/10 border border-white/20 text-gray-300 text-xs font-black uppercase text-center tracking-wider select-none">
                    OUT OF STOCK
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleAddToCartFromVideo(currentReel)}
                      className="w-full py-2.5 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-black tracking-wide uppercase transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>ADD TO CART</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBuyNowFromVideo(currentReel)}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FF4D15] via-[#FF451A] to-[#FA3B00] text-white text-xs font-black tracking-wide uppercase transition-all shadow-md shadow-orange-500/30 active:scale-95 flex items-center justify-center text-center cursor-pointer"
                    >
                      <span>BUY NOW</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleCloseReel();
                    router.push("/products");
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-black tracking-wide uppercase transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>BROWSE STORE</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBuyNowFromVideo(currentReel)}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FF4D15] via-[#FF451A] to-[#FA3B00] text-white text-xs font-black tracking-wide uppercase transition-all shadow-md shadow-orange-500/30 active:scale-95 flex items-center justify-center text-center cursor-pointer"
                >
                  <span>BUY THIS ITEM</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
