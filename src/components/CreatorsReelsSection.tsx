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
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { ProductVideo } from "@/lib/videoStore";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

// Fallback seed videos with working R2 / local public MP4 assets
const SEED_CREATOR_VIDEOS: ProductVideo[] = [
  {
    id: "creator-vid-01",
    productId: "watch",
    title: "Titan Minimalist Watch Hands-on",
    videoUrl:
      "https://pub-abec22fbfdb8446490341e69eabe6a1c.r2.dev/videos/1791519244046-VID_20260913_013314_447-9d231d.mp4",
    posterUrl: "",
    viewsText: "28.4k",
    badge: "POPULAR",
    productName: "Titan Minimalist Analog Watch",
    productPrice: 1799,
    productMrp: 2999,
    productSlug: "watch",
    productImage:
      "https://www.titan.co.in/dw/image/v2/BKDD_PRD/on/demandware.static/-/Sites-titan-master-catalog/default/dw429f4592/images/Titan/Catalog/10011NM01_1.jpg?sw=600&sh=600",
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

export function CreatorsReelsSection() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const { addToCart, addItem } = useCart();

  const [videos, setVideos] = useState<ProductVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [stepWidth, setStepWidth] = useState(150);

  // Reel modal state
  const [modalVideoIndex, setModalVideoIndex] = useState<number | null>(null);
  const [modalPlaying, setModalPlaying] = useState(true);
  const [modalMuted, setModalMuted] = useState(false);
  const [modalProgress, setModalProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLDivElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  // References to all card video elements to ensure they always play muted
  const cardVideoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());

  // Touch tracking for mobile swipe
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Fetch dynamic videos selected for home page
  useEffect(() => {
    fetch(`/api/videos?scope=home&_t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.videos)) {
          setVideos(data.videos);
        }
      })
      .catch((err) => {
        console.warn("Failed to load home creator reels:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const totalItems = videos.length;
  // Only triplicate if we have 3 or more videos for continuous infinite marquee.
  // If 1 or 2 videos, never repeat/triplicate them!
  const extendedVideos = totalItems >= 3 ? [...videos, ...videos, ...videos] : videos;

  // Measure card width + gap dynamically
  const measureStepWidth = useCallback(() => {
    if (firstCardRef.current && trackRef.current) {
      const cardW = firstCardRef.current.offsetWidth;
      const trackStyle = window.getComputedStyle(trackRef.current);
      const gap = parseFloat(trackStyle.gap) || (window.innerWidth < 640 ? 12 : 16);
      setStepWidth(cardW + gap);
    }
  }, []);

  useEffect(() => {
    measureStepWidth();
    window.addEventListener("resize", measureStepWidth);
    return () => window.removeEventListener("resize", measureStepWidth);
  }, [measureStepWidth]);

  // Track if creators section is visible on screen using IntersectionObserver
  const [isSectionVisible, setIsSectionVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionVisible(entry.isIntersecting);
      },
      { rootMargin: "250px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Ensure only VISIBLE videos play muted; pause off-screen videos to save 75% GPU/CPU
  useEffect(() => {
    if (!isSectionVisible) {
      cardVideoRefs.current.forEach((video) => {
        if (video && !video.paused) {
          video.pause();
        }
      });
      return;
    }

    const startIdx = currentIndex;
    const endIdx = currentIndex + 7;

    cardVideoRefs.current.forEach((video, idx) => {
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
  }, [isSectionVisible, videos, currentIndex]);

  // Automatic moving behavior:
  // 1. Stays 2 seconds (2000ms pause)
  // 2. Smoothly shifts left by 1 card over 650ms
  // 3. Repeats moving behavior
  useEffect(() => {
    if (isPaused || modalVideoIndex !== null || totalItems <= 1 || !isSectionVisible) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 2650); // 2000ms stay + 650ms animation

    return () => clearInterval(interval);
  }, [isPaused, modalVideoIndex, totalItems, isSectionVisible]);

  // Seamless infinite wrap-around when first set finishes
  const handleTransitionEnd = () => {
    if (currentIndex >= totalItems) {
      setIsTransitioning(false);
      setCurrentIndex(0);
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (diff > 35) {
        setIsTransitioning(true);
        setCurrentIndex((prev) => prev + 1);
      } else if (diff < -35) {
        if (currentIndex === 0) {
          setIsTransitioning(false);
          setCurrentIndex(totalItems);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setIsTransitioning(true);
              setCurrentIndex(totalItems - 1);
            });
          });
        } else {
          setIsTransitioning(true);
          setCurrentIndex((prev) => prev - 1);
        }
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Open reel modal on card click
  const handleOpenReel = (idx: number) => {
    const realIndex = idx % totalItems;
    setModalVideoIndex(realIndex);
    setModalPlaying(true);
    setModalMuted(false); // Unmute when user explicitly taps to view reel
    setModalProgress(0);
  };

  const handleCloseReel = () => {
    setModalVideoIndex(null);
    setModalPlaying(false);
  };

  const handlePrevReel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (modalVideoIndex === null) return;
    setModalVideoIndex((modalVideoIndex - 1 + totalItems) % totalItems);
    setModalProgress(0);
    setModalPlaying(true);
  };

  const handleNextReel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (modalVideoIndex === null) return;
    setModalVideoIndex((modalVideoIndex + 1) % totalItems);
    setModalProgress(0);
    setModalPlaying(true);
  };

  const toggleModalPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!modalVideoRef.current) return;
    if (modalPlaying) {
      modalVideoRef.current.pause();
      setModalPlaying(false);
    } else {
      modalVideoRef.current.play();
      setModalPlaying(true);
    }
  };

  const toggleModalMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!modalVideoRef.current) return;
    modalVideoRef.current.muted = !modalMuted;
    setModalMuted(!modalMuted);
  };

  const handleModalTimeUpdate = () => {
    if (modalVideoRef.current) {
      const current = modalVideoRef.current.currentTime;
      const duration = modalVideoRef.current.duration;
      if (duration > 0) {
        setModalProgress((current / duration) * 100);
      }
    }
  };

  const handleBuyNowFromModal = (e: React.MouseEvent, video: ProductVideo) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal("login", "Sign in required: Please log in to complete your order 🛍️");
      return;
    }
    const targetSlug = video.productSlug || video.productId;
    if (targetSlug && targetSlug !== "none" && targetSlug !== "all") {
      router.push(`/checkout?productId=${encodeURIComponent(targetSlug)}&qty=1`);
    } else {
      router.push("/checkout");
    }
  };

  if (totalItems === 0) return null;

  const currentModalVideo = modalVideoIndex !== null ? videos[modalVideoIndex] : null;

  return (
    <section className="w-full max-w-[1520px] mx-auto px-3 sm:px-6 my-3 sm:my-5 select-none">
      {/* Section Heading matching Outpickz reference */}
      <div className="flex items-center justify-between mb-2.5 sm:mb-3.5 px-0.5">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
          From our creators
        </h2>
      </div>

      {/* Viewport for horizontal moving track */}
      <div
        ref={containerRef}
        className="w-full overflow-hidden relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={trackRef}
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform:
              totalItems <= 1
                ? "none"
                : `translate3d(-${currentIndex * stepWidth}px, 0, 0)`,
            transition: isTransitioning
              ? "transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)"
              : "none",
          }}
          className="flex items-stretch gap-2.5 sm:gap-3.5 md:gap-4 will-change-transform"
        >
          {extendedVideos.map((video, idx) => {
            const poster = video.posterUrl || video.productImage || undefined;

            return (
              <div
                key={`${video.id}-${idx}`}
                ref={idx === 0 ? firstCardRef : undefined}
                onClick={() => handleOpenReel(idx)}
                className="w-[155px] min-w-[155px] sm:w-[175px] sm:min-w-[175px] md:w-[200px] md:min-w-[200px] lg:w-[225px] lg:min-w-[225px] xl:w-[240px] xl:min-w-[240px] aspect-[9/15.5] flex-shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden relative shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-slate-950 group border border-slate-200/60 hover:border-[#FF7A00]/50 hover:-translate-y-0.5"
              >
                {/* Background Video (Muted Autoplay Always) */}
                <video
                  ref={(el) => {
                    if (el) {
                      el.muted = true;
                      el.defaultMuted = true;
                      cardVideoRefs.current.set(idx, el);
                      el.play().catch(() => {});
                    } else {
                      cardVideoRefs.current.delete(idx);
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

                {/* Top-Right Outpickz-Style Orange Brand Badge */}
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

      {/* Interactive Fullscreen Reel Modal */}
      {modalVideoIndex !== null && currentModalVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none"
          onClick={handleCloseReel}
        >
          {/* Modal Container */}
          <div
            className="relative w-full max-w-[420px] aspect-[9/16] max-h-[92vh] bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Video Progress Bar */}
            <div className="absolute top-0 inset-x-0 z-30 h-1 bg-white/20">
              <div
                className="h-full bg-[#FF7A00] transition-all duration-100"
                style={{ width: `${modalProgress}%` }}
              />
            </div>

            {/* Top Bar Controls */}
            <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
                <span>Creator Reel</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleModalMute}
                  className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  aria-label={modalMuted ? "Unmute" : "Mute"}
                >
                  {modalMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={handleCloseReel}
                  className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active Video Player */}
            <div className="relative w-full h-full cursor-pointer" onClick={toggleModalPlay}>
              <video
                ref={modalVideoRef}
                src={currentModalVideo.videoUrl}
                poster={currentModalVideo.posterUrl || currentModalVideo.productImage || undefined}
                autoPlay
                loop
                playsInline
                muted={modalMuted}
                onTimeUpdate={handleModalTimeUpdate}
                className="w-full h-full object-cover"
              />

              {/* Play / Pause Center Overlay Indicator */}
              {!modalPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center">
                    <Play className="w-8 h-8 fill-white ml-1" />
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={handlePrevReel}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              aria-label="Previous reel"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNextReel}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              aria-label="Next reel"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Bottom Shoppable Product Card Overlay */}
            <div className="absolute bottom-3 inset-x-3 z-30 p-3 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-white/60">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  <Image
                    src={
                      currentModalVideo.productImage ||
                      currentModalVideo.posterUrl ||
                      "/products/ripple/ripple-amber.jpg"
                    }
                    alt={currentModalVideo.productName || "Product"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {currentModalVideo.productName || currentModalVideo.title}
                  </p>
                  <p className="text-xs font-extrabold text-[#FF7A00] mt-0.5">
                    ₹{Number(currentModalVideo.productPrice || 650).toFixed(0)}
                  </p>
                </div>
                <button
                  onClick={(e) => handleBuyNowFromModal(e, currentModalVideo)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9029] hover:from-[#E06A00] hover:to-[#FF7A00] text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
