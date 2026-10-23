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

interface ShoppableVideosSectionProps {
  currentProduct?: Product;
  showHeader?: boolean;
  title?: string;
  subtitle?: string;
  centeredHeader?: boolean;
  className?: string;
  onToast?: (msg: string) => void;
}

export function ShoppableVideosSection({
  currentProduct,
  showHeader = true,
  title = "SEE IT IN ACTION",
  subtitle = "Discover the little details, clever features, and everyday benefits that make a big difference.",
  centeredHeader = true,
  className = "",
  onToast,
}: ShoppableVideosSectionProps) {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const { addToCart, addItem } = useCart();

  const [videos, setVideos] = useState<ProductVideo[]>([]);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Active full-screen modal player state
  const [activeModalVideoIndex, setActiveModalVideoIndex] = useState<number | null>(null);
  const [isModalPlaying, setIsModalPlaying] = useState(true);
  const [isModalMuted, setIsModalMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  // Carousel interactive & auto-cycling state
  const [containerWidth, setContainerWidth] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isCenterPlaying, setIsCenterPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSectionInView, setIsSectionInView] = useState(false);

  // DOM Refs
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardVideoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const activeModalVideoRef = useRef<HTMLVideoElement>(null);

  // Touch and Mouse drag gesture refs
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwipingHorizontally = useRef<boolean | null>(null);
  const isMouseDownRef = useRef(false);
  const mouseStartXRef = useRef(0);

  // 1. Fetch videos for this product or all store videos
  useEffect(() => {
    let isMounted = true;
    const prodKey = currentProduct?.slug || currentProduct?.id;
    const url = prodKey
      ? `/api/videos?productId=${encodeURIComponent(prodKey)}&_t=${Date.now()}`
      : `/api/videos?_t=${Date.now()}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.videos)) {
          setVideos(data.videos);
        }
      })
      .catch((err) => {
        console.warn("Failed to load shoppable videos:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentProduct]);

  // 2. Fetch live products catalog for shoppable links
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

  // 3. Prepare normalized videos and cloned track for seamless infinite carousel
  // We expand 2 videos to 4 so there are always at least 3 cards visible
  const baseVideos: ProductVideo[] =
    videos.length === 2
      ? [...videos, ...videos]
      : videos;

  const N = baseVideos.length;

  // Cloned items for seamless infinite sliding: [set0 (N items), set1 (N items), set2 (N items)]
  const displayVideos: ProductVideo[] =
    N >= 3
      ? [...baseVideos, ...baseVideos, ...baseVideos]
      : baseVideos;

  // Initialize trackIndex to the start of set 1 (i.e. index N) so we have a full set to the left
  useEffect(() => {
    if (N >= 3) {
      setTrackIndex(N);
    } else {
      setTrackIndex(0);
    }
  }, [N]);

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
        threshold: 0.15,
        rootMargin: "80px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 5. Measure container width for pixel-perfect card scaling & sliding math
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateSize();

    window.addEventListener("resize", updateSize);
    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);

    return () => {
      window.removeEventListener("resize", updateSize);
      ro.disconnect();
    };
  }, []);

  // Card geometry calculations:
  // On mobile (< 640px): 3 cards fill 100% of container with 8px gap.
  // On desktop (>= 640px): max-w-[760px] with 14px gap.
  const gap = containerWidth >= 640 ? 14 : 8;
  const cardWidth = containerWidth > 0 ? (containerWidth - 2 * gap) / 3 : 110;
  const step = cardWidth + gap;

  // The track is offset so that card `trackIndex` is centered in Slot 1
  const baseTranslateX = N >= 3 ? -(trackIndex - 1) * step : 0;
  const currentTranslateX = baseTranslateX + dragOffset;

  // Real index of current video for indicators and modal
  const realVideoIndex = N > 0 ? (trackIndex % N) % videos.length : 0;

  // 6. Handle Transition End for seamless infinite looping
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    setIsTransitioning(false);

    if (N >= 3) {
      if (trackIndex >= 2 * N) {
        setTrackIndex((prev) => prev - N);
      } else if (trackIndex < N) {
        setTrackIndex((prev) => prev + N);
      }
    }
  };

  // 7. Auto-advance every 3 seconds when in view and user is not interacting
  useEffect(() => {
    if (
      !isSectionInView ||
      isDragging ||
      activeModalVideoIndex !== null ||
      isHovered ||
      N <= 1
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setIsTransitioning(true);
      setTrackIndex((prev) => prev + 1);
    }, 3000);

    return () => clearTimeout(timer);
  }, [
    trackIndex,
    isSectionInView,
    isDragging,
    activeModalVideoIndex,
    isHovered,
    N,
  ]);

  // 8. Auto-play center video with mute, pause non-center videos
  useEffect(() => {
    if (!isSectionInView || activeModalVideoIndex !== null) {
      cardVideoRefs.current.forEach((video) => {
        if (video && !video.paused) video.pause();
      });
      setIsCenterPlaying(false);
      return;
    }

    cardVideoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === trackIndex) {
        video.muted = isMuted;
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
  }, [trackIndex, isSectionInView, activeModalVideoIndex, isMuted, displayVideos]);

  // 9. Manual Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (N <= 1) return;
    setIsDragging(true);
    setIsTransitioning(false);
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwipingHorizontally.current = null;
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || N <= 1) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    if (isSwipingHorizontally.current === null) {
      if (Math.abs(diffX) > 7 || Math.abs(diffY) > 7) {
        isSwipingHorizontally.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (isSwipingHorizontally.current === false) {
      return;
    }

    setDragOffset(diffX);
  };

  const handleTouchEnd = () => {
    if (!isDragging || N <= 1) return;
    setIsDragging(false);
    setIsTransitioning(true);

    const threshold = Math.max(30, cardWidth * 0.22);
    if (dragOffset < -threshold) {
      setTrackIndex((prev) => prev + 1);
    } else if (dragOffset > threshold) {
      setTrackIndex((prev) => prev - 1);
    }
    setDragOffset(0);
    isSwipingHorizontally.current = null;
  };

  // 10. Manual Mouse Drag Handlers (Desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (N <= 1) return;
    isMouseDownRef.current = true;
    setIsDragging(true);
    setIsTransitioning(false);
    mouseStartXRef.current = e.clientX;
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || N <= 1) return;
    const diffX = e.clientX - mouseStartXRef.current;
    setDragOffset(diffX);
  };

  const handleMouseUp = () => {
    if (!isMouseDownRef.current || N <= 1) return;
    isMouseDownRef.current = false;
    setIsDragging(false);
    setIsTransitioning(true);

    const threshold = Math.max(30, cardWidth * 0.22);
    if (dragOffset < -threshold) {
      setTrackIndex((prev) => prev + 1);
    } else if (dragOffset > threshold) {
      setTrackIndex((prev) => prev - 1);
    }
    setDragOffset(0);
  };

  // 11. Card Click & Controls Handlers
  const handleCardClick = (idx: number, realIdx: number) => {
    if (N <= 1) {
      handleOpenReel(realIdx);
      return;
    }

    if (idx === trackIndex) {
      // Center card clicked -> open fullscreen reel modal
      handleOpenReel(realIdx);
    } else if (idx === trackIndex - 1) {
      // Left card clicked -> slide into center
      setIsTransitioning(true);
      setTrackIndex(idx);
    } else if (idx === trackIndex + 1) {
      // Right card clicked -> slide into center
      setIsTransitioning(true);
      setTrackIndex(idx);
    } else {
      setIsTransitioning(true);
      setTrackIndex(idx);
    }
  };

  const toggleCenterMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    const activeVid = cardVideoRefs.current.get(trackIndex);
    if (activeVid) {
      activeVid.muted = nextMuted;
    }
  };

  const toggleCenterPlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    const activeVid = cardVideoRefs.current.get(trackIndex);
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
    cardVideoRefs.current.forEach((video) => {
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

      {/* ========================================================
          3D POP-UP 3-IN-1 REEL CAROUSEL STAGE
         ======================================================== */}
      <div className="relative group/carousel max-w-[760px] mx-auto">
        {/* Floating Side Navigation Arrows on Desktop */}
        {videos.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsTransitioning(true);
                setTrackIndex((prev) => prev - 1);
              }}
              className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md border border-gray-200 hover:border-gray-900 text-gray-800 hover:text-black items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer opacity-90 hover:opacity-100"
              aria-label="Previous video"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsTransitioning(true);
                setTrackIndex((prev) => prev + 1);
              }}
              className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md border border-gray-200 hover:border-gray-900 text-gray-800 hover:text-black items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer opacity-90 hover:opacity-100"
              aria-label="Next video"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Carousel Sliding Viewport Container */}
        <div
          ref={containerRef}
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
              transform: `translateX(${currentTranslateX}px)`,
              transition: isTransitioning
                ? "transform 500ms cubic-bezier(0.25, 1, 0.5, 1)"
                : "none",
              gap: `${gap}px`,
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {displayVideos.map((vid, idx) => {
              const isCenter = N >= 3 ? idx === trackIndex : idx === 0;
              const isLeft = N >= 3 && idx === trackIndex - 1;
              const isRight = N >= 3 && idx === trackIndex + 1;
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
                    width: `${cardWidth}px`,
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
                            cardVideoRefs.current.set(idx, el);
                          } else {
                            cardVideoRefs.current.delete(idx);
                          }
                        }}
                        src={vid.videoUrl}
                        poster={poster}
                        muted={isCenter ? isMuted : true}
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
                    {/* Atmospheric gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/35 pointer-events-none" />
                  </div>

                  {/* Top Overlay: Badges, View Counter & Mute Toggle for Center Card */}
                  <div className="absolute top-1.5 left-1.5 right-1.5 sm:top-2.5 sm:left-2.5 sm:right-2.5 z-20 flex items-center justify-between">
                    {/* Left: Badge */}
                    {vid.badge ? (
                      <span className="bg-[#FF3B30] text-white text-[8px] sm:text-[9.5px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs">
                        {vid.badge}
                      </span>
                    ) : (
                      <span className="bg-[#FF7A00] text-white text-[8px] sm:text-[9.5px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs">
                        NEW
                      </span>
                    )}

                    {/* Right: Sound Toggle on Center Card OR Views Badge */}
                    <div className="flex items-center gap-1">
                      {isCenter ? (
                        <button
                          type="button"
                          onClick={toggleCenterMute}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/90 transition-all shadow-md active:scale-90 cursor-pointer"
                          aria-label={isMuted ? "Unmute video" : "Mute video"}
                          title={isMuted ? "Unmute" : "Mute"}
                        >
                          {isMuted ? (
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

                  {/* Center Play/Pause Indicator Button */}
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

                  {/* Bottom Product Overlay / Price Badge */}
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

        {/* Pagination Dots (matching reference photo) */}
        {videos.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-2 select-none">
            {videos.map((_, dotIdx) => {
              const isActive = dotIdx === realVideoIndex;
              return (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => {
                    setIsTransitioning(true);
                    if (N >= 3) {
                      const diff = dotIdx - realVideoIndex;
                      setTrackIndex((prev) => prev + diff);
                    } else {
                      setTrackIndex(dotIdx);
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

      {/* ========================================================
          FULLSCREEN REELS MODAL VIDEO PLAYER OVERLAY
         ======================================================== */}
      {currentReel && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn select-none"
          onClick={handleCloseReel}
        >
          {/* Main Reel Container (9:16 aspect ratio) */}
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

            {/* Top Controls: Close, Mute, View Counter */}
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

              {/* Pause Indicator overlay on tap */}
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

              {/* Product Info Row (Only if product attached) */}
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

                  {/* Action Buttons: BUY NOW & ADD TO CART or OUT OF STOCK */}
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
      )}
    </section>
  );
}
