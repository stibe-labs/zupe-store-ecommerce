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
  currentProduct: Product;
  onToast?: (msg: string) => void;
}

export function ShoppableVideosSection({
  currentProduct,
  onToast,
}: ShoppableVideosSectionProps) {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const { addToCart, addItem } = useCart();

  const [videos, setVideos] = useState<ProductVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModalVideoIndex, setActiveModalVideoIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeVideoRef = useRef<HTMLVideoElement>(null);

  // Fetch videos for this product
  useEffect(() => {
    let isMounted = true;
    const prodKey = currentProduct.slug || currentProduct.id;
    fetch(`/api/videos?productId=${encodeURIComponent(prodKey)}&_t=${Date.now()}`)
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

  const handleBuyNowFromVideo = (vid: ProductVideo) => {
    if (!user) {
      openAuthModal("login", "Sign in required: Please log in or create an account to proceed with purchase 🛍️");
      return;
    }

    const attachedItem =
      vid.productId &&
      vid.productId !== "all" &&
      vid.productId !== currentProduct.id &&
      vid.productName
        ? {
            ...currentProduct,
            id: vid.productSlug || vid.productId,
            slug: vid.productSlug || vid.productId,
            name: vid.productName,
            price: vid.productPrice || currentProduct.price,
            mrp: vid.productMrp || currentProduct.mrp,
            poster_image: vid.productImage || currentProduct.poster_image,
            images: [vid.productImage || currentProduct.poster_image],
          }
        : currentProduct;

    const addFn = addToCart || addItem;
    if (typeof addFn === "function") {
      addFn(attachedItem, 1);
    }
    router.push("/checkout");
  };

  const handleAddToCartFromVideo = (vid: ProductVideo) => {
    if (!user) {
      openAuthModal("login", "Sign in required: Please log in to add items to your cart 🛒");
      return;
    }

    const attachedItem =
      vid.productId &&
      vid.productId !== "all" &&
      vid.productId !== currentProduct.id &&
      vid.productName
        ? {
            ...currentProduct,
            id: vid.productSlug || vid.productId,
            slug: vid.productSlug || vid.productId,
            name: vid.productName,
            price: vid.productPrice || currentProduct.price,
            mrp: vid.productMrp || currentProduct.mrp,
            poster_image: vid.productImage || currentProduct.poster_image,
            images: [vid.productImage || currentProduct.poster_image],
          }
        : currentProduct;

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

  const currentReel = activeModalVideoIndex !== null ? videos[activeModalVideoIndex] : null;

  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-8 sm:py-12 border-t border-gray-100">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#111111] tracking-tight">
            Watch in Action
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Real unboxings, tutorials, and authentic customer experiences
          </p>
        </div>

        {/* Carousel Navigation Buttons */}
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
      </div>

      {/* Horizontal Carousel of 9:16 Video Reel Cards */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory select-none"
      >
        {videos.map((vid, idx) => {
          const poster =
            vid.posterUrl ||
            vid.productImage ||
            currentProduct.poster_image ||
            "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800";

          return (
            <div
              key={vid.id || idx}
              onClick={() => handleOpenReel(idx)}
              className="group relative flex-shrink-0 w-[240px] sm:w-[280px] h-[390px] sm:h-[450px] rounded-[24px] sm:rounded-[28px] overflow-hidden bg-slate-900 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer snap-start border border-gray-200/80 hover:border-[#FF7A00]/50"
            >
              {/* Background Video or Poster */}
              <div className="absolute inset-0 z-0">
                <img
                  src={poster}
                  alt={vid.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />
              </div>

              {/* Top Badges */}
              <div className="absolute top-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between">
                {vid.badge ? (
                  <span className="bg-[#FF3B30] text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
                    {vid.badge}
                  </span>
                ) : (
                  <span />
                )}

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold shadow-md">
                  <Eye className="w-3 h-3 text-rose-400" />
                  <span>{vid.viewsText || "24.5k"}</span>
                </span>
              </div>

              {/* Center Play Button Icon */}
              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <div className="w-13 h-13 rounded-full bg-black/40 backdrop-blur-sm border border-white/30 text-white flex items-center justify-center group-hover:scale-115 group-hover:bg-[#FF7A00] transition-all duration-300 shadow-xl">
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </div>
              </div>

              {/* Bottom Floating Shoppable Product Card Overlay (Only if product attached) */}
              {vid.productId &&
              vid.productId !== "none" &&
              vid.productId !== "all" &&
              (vid.productName || vid.productSlug) ? (
                <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10">
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
                    className="p-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/60 shadow-lg flex items-center gap-2.5 hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group/pill"
                    title={`View ${vid.productName || "product"} page`}
                  >
                    {/* Small Square Thumbnail */}
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                      <img
                        src={vid.productImage || currentProduct.poster_image || poster}
                        alt={vid.productName || currentProduct.name}
                        className="w-full h-full object-cover group-hover/pill:scale-110 transition-transform duration-300"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate leading-tight group-hover/pill:text-[#FF7A00] transition-colors">
                        {vid.productName || currentProduct.name}
                      </p>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-xs font-black text-[#FF7A00]">
                          ₹{(vid.productPrice || currentProduct.price).toLocaleString("en-IN")}
                        </span>
                        {(vid.productMrp || currentProduct.mrp) && (
                          <span className="text-[10px] text-gray-400 line-through">
                            ₹{(vid.productMrp || currentProduct.mrp).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Arrow / Action Icon */}
                    <div className="w-7 h-7 rounded-full bg-[#FF7A00]/10 text-[#FF7A00] flex items-center justify-center shrink-0 group-hover/pill:bg-[#FF7A00] group-hover/pill:text-white transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 pointer-events-none">
                  <div className="p-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 text-white">
                    <p className="text-xs font-bold truncate leading-tight">
                      {vid.title}
                    </p>
                    <p className="text-[10px] text-gray-300 mt-0.5">Tap to watch reel</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
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
                        src={currentReel.productImage || currentProduct.poster_image}
                        alt={currentReel.productName || currentProduct.name}
                        className="w-full h-full object-cover group-hover/modalpill:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-white">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold truncate group-hover/modalpill:text-[#FF7A00] transition-colors">
                          {currentReel.productName || currentProduct.name}
                        </h4>
                        <ExternalLink className="w-3 h-3 text-gray-300 shrink-0" />
                      </div>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-sm font-black text-[#FF7A00]">
                          ₹{(currentReel.productPrice || currentProduct.price).toLocaleString("en-IN")}
                        </span>
                        {(currentReel.productMrp || currentProduct.mrp) && (
                          <span className="text-[11px] text-gray-400 line-through">
                            ₹{(currentReel.productMrp || currentProduct.mrp).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: BUY NOW & ADD TO CART */}
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
