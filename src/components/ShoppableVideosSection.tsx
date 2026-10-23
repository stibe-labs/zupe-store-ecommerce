"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const [activeModalVideoIndex, setActiveModalVideoIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeVideoRef = useRef<HTMLVideoElement>(null);
  const cardVideoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const [isSectionInView, setIsSectionInView] = useState(false);

  // Observe when the Shoppable Videos section enters or leaves viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsSectionInView(entry.isIntersecting);
      },
      {
        threshold: 0.1, // Trigger as soon as 10% of the section is visible
        rootMargin: "60px 0px", // Preload slightly before scrolling directly into it
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Automatically play all card videos with mute when section is in view, pause when out of view
  useEffect(() => {
    if (isSectionInView && activeModalVideoIndex === null) {
      cardVideoRefs.current.forEach((video) => {
        if (video) {
          video.muted = true;
          video.defaultMuted = true;
          const promise = video.play();
          if (promise !== undefined) {
            promise.catch(() => {
              // Muted autoplay is allowed across modern mobile & desktop browsers
            });
          }
        }
      });
    } else {
      cardVideoRefs.current.forEach((video) => {
        if (video && !video.paused) {
          video.pause();
        }
      });
    }
  }, [isSectionInView, activeModalVideoIndex, videos]);

  // Pause carousel videos when page is hidden (e.g. user switches tabs)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        cardVideoRefs.current.forEach((video) => {
          if (video && !video.paused) video.pause();
        });
      } else if (isSectionInView && activeModalVideoIndex === null) {
        cardVideoRefs.current.forEach((video) => {
          if (video) {
            video.muted = true;
            video.play().catch(() => {});
          }
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isSectionInView, activeModalVideoIndex]);

  // Fetch videos for this product or all store videos if no product specified
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

  // Fetch live products to check inventory
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

  // Lock body scroll when Reels modal player is open
  useEffect(() => {
    if (activeModalVideoIndex !== null) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
      return () => {
        document.body.style.overflow = origOverflow;
        document.body.classList.remove("modal-open");
      };
    }
  }, [activeModalVideoIndex]);

  // Handle active video time update in modal
  const handleTimeUpdate = () => {
    if (activeVideoRef.current) {
      const current = activeVideoRef.current.currentTime;
      const total = activeVideoRef.current.duration || 1;
      setProgress((current / total) * 100);
    }
  };

  const togglePlayPause = () => {
    if (!activeVideoRef.current) return;
    if (activeVideoRef.current.paused) {
      activeVideoRef.current.play();
      setIsPlaying(true);
    } else {
      activeVideoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeVideoRef.current) return;
    activeVideoRef.current.muted = !activeVideoRef.current.muted;
    setIsMuted(activeVideoRef.current.muted);
  };

  const scrollPrev = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollNext = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  const handleOpenReel = (idx: number) => {
    cardVideoRefs.current.forEach((video) => {
      if (video && !video.paused) video.pause();
    });
    setActiveModalVideoIndex(idx);
    setIsPlaying(true);
    setProgress(0);
  };

  const handleCloseReel = () => {
    setActiveModalVideoIndex(null);
  };

  const handlePrevReel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeModalVideoIndex === null) return;
    const prevIdx = activeModalVideoIndex === 0 ? videos.length - 1 : activeModalVideoIndex - 1;
    setActiveModalVideoIndex(prevIdx);
    setProgress(0);
  };

  const handleNextReel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeModalVideoIndex === null) return;
    const nextIdx = activeModalVideoIndex === videos.length - 1 ? 0 : activeModalVideoIndex + 1;
    setActiveModalVideoIndex(nextIdx);
    setProgress(0);
  };

  const currentReel = activeModalVideoIndex !== null ? videos[activeModalVideoIndex] : null;
  const currentReelProduct = currentReel ? catalog.find(
    (p) =>
      (currentReel.productId && (p.id.toLowerCase() === currentReel.productId.toLowerCase() || p.slug.toLowerCase() === currentReel.productId.toLowerCase())) ||
      (currentReel.productSlug && (p.slug.toLowerCase() === currentReel.productSlug.toLowerCase() || p.id.toLowerCase() === currentReel.productSlug.toLowerCase()))
  ) || currentProduct : null;
  const isCurrentReelOutOfStock = currentReelProduct
    ? (currentReelProduct.in_stock === 0 || (currentReelProduct.stock_count !== undefined && currentReelProduct.stock_count <= 0))
    : false;

  const handleBuyNowFromVideo = (vid: ProductVideo) => {
    if (isCurrentReelOutOfStock) return;
    if (!user) {
      openAuthModal("login", "Sign in required: Please log in or create an account to proceed with purchase 🛍️");
      return;
    }

    const attachedItem = {
      id: vid.productSlug || vid.productId || currentProduct?.id || "featured-product",
      slug: vid.productSlug || vid.productId || currentProduct?.slug || "featured-product",
      name: vid.productName || currentProduct?.name || vid.title || "Featured Product",
      price: vid.productPrice !== undefined ? vid.productPrice : (currentProduct?.price || 799),
      mrp: vid.productMrp !== undefined ? vid.productMrp : (currentProduct?.mrp || 1199),
      poster_image: vid.productImage || currentProduct?.poster_image || vid.posterUrl || "/images/placeholder.png",
      images: [vid.productImage || currentProduct?.poster_image || vid.posterUrl || "/images/placeholder.png"],
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
      openAuthModal("login", "Sign in required: Please log in to add items to your cart 🛒");
      return;
    }

    const attachedItem = {
      id: vid.productSlug || vid.productId || currentProduct?.id || "featured-product",
      slug: vid.productSlug || vid.productId || currentProduct?.slug || "featured-product",
      name: vid.productName || currentProduct?.name || vid.title || "Featured Product",
      price: vid.productPrice !== undefined ? vid.productPrice : (currentProduct?.price || 799),
      mrp: vid.productMrp !== undefined ? vid.productMrp : (currentProduct?.mrp || 1199),
      poster_image: vid.productImage || currentProduct?.poster_image || vid.posterUrl || "/images/placeholder.png",
      images: [vid.productImage || currentProduct?.poster_image || vid.posterUrl || "/images/placeholder.png"],
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
      className={`w-full max-w-[1600px] mx-auto px-4 sm:px-6 ${showHeader ? "py-6 sm:py-10" : "py-4 sm:py-6"} ${className}`}
    >
      {/* Section Header */}
      {showHeader && (
        <div className={`mb-4 sm:mb-6 ${centeredHeader ? "text-center" : "flex items-center justify-between"}`}>
          <div className={centeredHeader ? "max-w-xl mx-auto" : ""}>
            <h2 className="text-[17px] sm:text-2xl font-display font-extrabold text-[#111111] tracking-tight uppercase">
              {title}
            </h2>
            <p className="text-[11.5px] sm:text-sm text-gray-500 mt-1 leading-snug">
              {subtitle}
            </p>
          </div>

          {!centeredHeader && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={scrollPrev}
                className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-gray-900 text-gray-700 hover:text-black flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
                aria-label="Previous videos"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-gray-900 text-gray-700 hover:text-black flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
                aria-label="Next videos"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Relative wrapper for video carousel & floating navigation */}
      <div className="relative group/carousel">
        {/* Horizontal Carousel of 9:16 Video Reel Cards (3 in 1 row on mobile) */}
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-2 sm:gap-4 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x snap-mandatory select-none"
        >
          {videos.map((vid, idx) => {
            const poster =
              vid.posterUrl ||
              vid.productImage ||
              currentProduct?.poster_image ||
              "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800";

            return (
              <div
                key={vid.id || idx}
                onClick={() => handleOpenReel(idx)}
                className="group relative flex-shrink-0 w-[calc((100%-16px)/3)] min-w-[96px] max-w-[130px] sm:w-[220px] sm:max-w-none aspect-[9/16] sm:aspect-auto sm:h-[390px] rounded-[14px] sm:rounded-[24px] overflow-hidden bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer snap-start border border-gray-200/90 hover:border-[#FF7A00]/50"
              >
                {/* Background Video (Auto-plays muted when reached) or Poster Fallback */}
                <div className="absolute inset-0 z-0 overflow-hidden bg-black">
                  {vid.videoUrl ? (
                    <video
                      ref={(el) => {
                        if (el) {
                          el.muted = true;
                          el.defaultMuted = true;
                          cardVideoRefs.current.set(idx, el);
                          if (isSectionInView && activeModalVideoIndex === null) {
                            el.play().catch(() => {});
                          }
                        } else {
                          cardVideoRefs.current.delete(idx);
                        }
                      }}
                      src={vid.videoUrl}
                      poster={poster}
                      muted
                      loop
                      playsInline
                      preload="auto"
                      onLoadedData={(e) => {
                        const target = e.currentTarget;
                        target.muted = true;
                        if (isSectionInView && activeModalVideoIndex === null) {
                          target.play().catch(() => {});
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                    />
                  ) : (
                    <img
                      src={poster}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 pointer-events-none" />
                </div>

                {/* Top Badges / View count */}
                <div className="absolute top-1.5 left-1.5 right-1.5 sm:top-3 sm:left-3 sm:right-3 z-10 flex items-center justify-between">
                  {vid.badge ? (
                    <span className="bg-[#FF3B30] text-white text-[8px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs">
                      {vid.badge}
                    </span>
                  ) : (
                    <span />
                  )}

                  <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[8px] sm:text-[10px] font-bold shadow-xs">
                    <Eye className="w-2.5 h-2.5 text-rose-400" />
                    <span>{vid.viewsText || "24k"}</span>
                  </span>
                </div>

                {/* Center Play Button Icon */}
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                  <div className="w-7 h-7 sm:w-11 sm:h-11 rounded-full bg-black/40 backdrop-blur-xs border border-white/30 text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-[#FF7A00] transition-all duration-300 shadow-md">
                    <Play className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Bottom Overlay - Compact for Mobile, Detailed for Desktop */}
                {vid.productId &&
                vid.productId !== "none" &&
                vid.productId !== "all" &&
                (vid.productName || vid.productSlug) ? (
                  <>
                    {/* Desktop Full Card Overlay */}
                    <div className="hidden sm:block absolute bottom-3 left-3 right-3 z-10">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          const target = vid.productSlug || vid.productId;
                          if (target && target !== "all" && target !== "none") {
                            router.push(`/products/${target}`);
                          } else {
                            router.push("/products");
                          }
                        }}
                        className="p-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/60 shadow-lg flex items-center gap-2 hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group/pill"
                        title={`View ${vid.productName || "product"} page`}
                      >
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          <img
                            src={vid.productImage || currentProduct?.poster_image || poster}
                            alt={vid.productName || currentProduct?.name || vid.title}
                            className="w-full h-full object-cover group-hover/pill:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate leading-tight group-hover/pill:text-[#FF7A00] transition-colors">
                            {vid.productName || currentProduct?.name || vid.title}
                          </p>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-xs font-black text-[#FF7A00]">
                              ₹{(vid.productPrice || currentProduct?.price || 799).toLocaleString("en-IN")}
                            </span>
                            {(vid.productMrp || currentProduct?.mrp) && (
                              <span className="text-[10px] text-gray-400 line-through">
                                ₹{(vid.productMrp || currentProduct?.mrp || 1199).toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-[#FF7A00]/10 text-[#FF7A00] flex items-center justify-center shrink-0 group-hover/pill:bg-[#FF7A00] group-hover/pill:text-white transition-colors">
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      </div>
                    </div>

                    {/* Mobile Compact Overlay */}
                    <div className="sm:hidden absolute bottom-1.5 left-1.5 right-1.5 z-10 pointer-events-none">
                      <div className="px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold truncate text-center leading-tight">
                        ₹{(vid.productPrice || currentProduct?.price || 799).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute bottom-1.5 sm:bottom-3 left-1.5 sm:left-3 right-1.5 sm:right-3 z-10 pointer-events-none">
                    <div className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-black/60 backdrop-blur-xs border border-white/20 text-white text-center">
                      <p className="text-[9px] sm:text-xs font-bold truncate leading-tight">
                        {vid.title}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-2.5 sm:hidden">
          <span className="w-2 h-2 rounded-full bg-gray-900" />
          <span className="w-2 h-2 rounded-full bg-gray-300" />
        </div>

        {/* Floating Side Navigation Buttons for Desktop */}
        {videos.length > 3 && (
          <>
            <button
              type="button"
              onClick={scrollPrev}
              className="hidden sm:flex absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md border border-gray-200 hover:border-gray-900 text-gray-700 hover:text-black items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer opacity-90 hover:opacity-100"
              aria-label="Previous videos"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              className="hidden sm:flex absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md border border-gray-200 hover:border-gray-900 text-gray-700 hover:text-black items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer opacity-90 hover:opacity-100"
              aria-label="Next videos"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
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
                  onClick={toggleMute}
                  className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/90 transition-colors cursor-pointer"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
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
              onClick={togglePlayPause}
            >
              <video
                ref={activeVideoRef}
                src={currentReel.videoUrl}
                poster={currentReel.posterUrl}
                autoPlay
                playsInline
                loop
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full object-cover"
              />

              {/* Pause Indicator overlay on tap */}
              {!isPlaying && (
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
                      const target = currentReel.productSlug || currentReel.productId;
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
                        src={currentReel.productImage || currentProduct?.poster_image}
                        alt={currentReel.productName || currentProduct?.name || currentReel.title}
                        className="w-full h-full object-cover group-hover/modalpill:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-white">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold truncate group-hover/modalpill:text-[#FF7A00] transition-colors">
                          {currentReel.productName || currentProduct?.name || currentReel.title}
                        </h4>
                        <ExternalLink className="w-3 h-3 text-gray-300 shrink-0" />
                      </div>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-sm font-black text-[#FF7A00]">
                          ₹{(currentReel.productPrice || currentProduct?.price || 799).toLocaleString("en-IN")}
                        </span>
                        {(currentReel.productMrp || currentProduct?.mrp) && (
                          <span className="text-[11px] text-gray-400 line-through">
                            ₹{(currentReel.productMrp || currentProduct?.mrp || 1199).toLocaleString("en-IN")}
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
