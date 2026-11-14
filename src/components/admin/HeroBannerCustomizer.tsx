"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  HeroBannerSlide,
  DEFAULT_HERO_BANNERS,
  StoreCategory,
} from "@/lib/storeContent";
import {
  Monitor,
  Smartphone,
  Upload,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Link as LinkIcon,
  Palette,
  Eye,
  RefreshCw,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Move,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Sliders,
  Check,
} from "lucide-react";

interface HeroBannerCustomizerProps {
  categories?: StoreCategory[];
  showToast: (type: "success" | "error", text: string) => void;
}

const CUTOUT_PRESETS = [
  { label: "Model with Shaker (Slide 1)", url: "/vittal/cutout-hero-1.png" },
  { label: "Gym Athlete with Tub (Slide 2)", url: "/vittal/cutout-hero-2.png" },
  { label: "Activewear Duo (Slide 3)", url: "/vittal/cutout-hero-3.png" },
];

const BADGE_PRESETS = [
  "Limited Offer",
  "Special Offer",
  "Trending Now",
  "New Arrivals",
  "Exclusive Drop",
  "Festive Deal",
  "Member Perk",
];

const REDIRECT_PRESETS = [
  { label: "All Products", url: "/products" },
  { label: "Gym Supplements", url: "/products?category=Gym+Supplements" },
  { label: "Outfits", url: "/products?category=Outfits" },
  { label: "Apparels", url: "/products?category=Apparels" },
  { label: "Dates & Nuts", url: "/products?category=Dates+%26+Nuts" },
  { label: "Candy & Chocolates", url: "/products?category=Candy+%26+Chocolates" },
];

export function HeroBannerCustomizer({
  categories = [],
  showToast,
}: HeroBannerCustomizerProps) {
  const [savedSlides, setSavedSlides] = useState<HeroBannerSlide[]>(DEFAULT_HERO_BANNERS);
  const [draftSlides, setDraftSlides] = useState<HeroBannerSlide[]>(DEFAULT_HERO_BANNERS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCutout, setUploadingCutout] = useState(false);

  // Active slide being edited (0-indexed)
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);

  // Preview device mode: desktop vs mobile
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Controls tab: desktop vs mobile positioning
  const [controlViewTab, setControlViewTab] = useState<"desktop" | "mobile">("desktop");

  // Load hero banners from API on mount
  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content/banners?all=true");
      const data = await res.json();
      if (data.success && Array.isArray(data.banners) && data.banners.length > 0) {
        setSavedSlides(data.banners);
        setDraftSlides(data.banners);
      }
    } catch (err) {
      console.error("Failed to fetch hero banners:", err);
      showToast("error", "Failed to load hero banners from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const isDirty = JSON.stringify(savedSlides) !== JSON.stringify(draftSlides);

  const currentSlide = draftSlides[selectedSlideIndex] || draftSlides[0];

  // Helper to update a field on current active slide
  const handleUpdateCurrentSlide = (field: keyof HeroBannerSlide, value: any) => {
    setDraftSlides((prev) =>
      prev.map((slide, idx) =>
        idx === selectedSlideIndex ? { ...slide, [field]: value } : slide
      )
    );
  };

  // Add new banner slide with smart defaults
  const handleAddNewSlide = () => {
    const newSlideNumber = draftSlides.length + 1;
    const newSlide: HeroBannerSlide = {
      id: `hero-slide-${Date.now()}`,
      badge: "Limited Offer",
      heading: "First Purchase Enjoy\na Special Offer",
      buttonText: "Shop Now",
      buttonLink: "/products",
      bgImage: "/vittal/banner-hero-green-texture.jpg",
      cutoutImage: "", // empty so user uploads or chooses cutout
      desktopScale: 100,
      desktopOffsetX: 0,
      desktopOffsetY: 0,
      mobileScale: 100,
      mobileOffsetX: 0,
      mobileOffsetY: 0,
      active: true,
      order: newSlideNumber,
      image: "",
      ctaText: "Shop Now",
      ctaLink: "/products",
    };

    const updated = [...draftSlides, newSlide];
    setDraftSlides(updated);
    setSelectedSlideIndex(updated.length - 1);
    showToast("success", `Slide #${newSlideNumber} added with default Vittal styling! Add your cutout image.`);
  };

  // Delete slide
  const handleDeleteSlide = (indexToDelete: number) => {
    if (draftSlides.length <= 1) {
      showToast("error", "At least one hero banner slide is required.");
      return;
    }

    const updated = draftSlides.filter((_, idx) => idx !== indexToDelete);
    setDraftSlides(updated);
    if (selectedSlideIndex >= updated.length) {
      setSelectedSlideIndex(updated.length - 1);
    }
    showToast("success", "Banner slide removed.");
  };

  // Move slide order
  const handleMoveSlide = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= draftSlides.length) return;
    const updated = [...draftSlides];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setDraftSlides(updated);
    setSelectedSlideIndex(toIndex);
  };

  // Upload cutout image file
  const handleCutoutFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showToast("error", "Image size exceeds 15MB. Please choose an optimized PNG cutout.");
      return;
    }

    setUploadingCutout(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "images");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        handleUpdateCurrentSlide("cutoutImage", data.url);
        handleUpdateCurrentSlide("image", data.url);
        showToast("success", "Cutout PNG uploaded successfully!");
      } else {
        // Fallback to local Data URL
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          if (dataUrl) {
            handleUpdateCurrentSlide("cutoutImage", dataUrl);
            handleUpdateCurrentSlide("image", dataUrl);
            showToast("success", "Cutout image loaded!");
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      console.warn("Upload fallback to base64:", err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          handleUpdateCurrentSlide("cutoutImage", dataUrl);
          handleUpdateCurrentSlide("image", dataUrl);
          showToast("success", "Cutout image loaded!");
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingCutout(false);
      e.target.value = "";
    }
  };

  // Save draft slides to Live Website
  const handleSaveToLive = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/content/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banners: draftSlides }),
      });
      const data = await res.json();
      if (data.success && data.banners) {
        setSavedSlides(data.banners);
        setDraftSlides(data.banners);
        showToast("success", "Hero banners saved! Live website updated successfully.");

        // Dispatch window event for instant storefront preview
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("vittal_banners_updated", {
              detail: { banners: data.banners },
            })
          );
        }
      } else {
        showToast("error", data.error || "Failed to save hero banners");
      }
    } catch (err: any) {
      showToast("error", err.message || "Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  // Reset to default 3 slides
  const handleResetDefaults = async () => {
    if (!confirm("Reset all hero banner slides back to the 3 original Vittal Lifestyle defaults?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/content/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_defaults" }),
      });
      const data = await res.json();
      if (data.success && data.banners) {
        setSavedSlides(data.banners);
        setDraftSlides(data.banners);
        setSelectedSlideIndex(0);
        showToast("success", "Hero banners reset to original Vittal Lifestyle defaults!");
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("vittal_banners_updated", {
              detail: { banners: data.banners },
            })
          );
        }
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to reset");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[#6B9E3A] animate-spin" />
        <p className="text-sm font-semibold font-mograph text-slate-700">
          Loading Hero Banner customizer...
        </p>
      </div>
    );
  }

  // Active view parameters for controls & preview
  const isDesktopTab = controlViewTab === "desktop";
  const activeScale = isDesktopTab ? (currentSlide?.desktopScale ?? 100) : (currentSlide?.mobileScale ?? 100);
  const activeOffsetX = isDesktopTab ? (currentSlide?.desktopOffsetX ?? 0) : (currentSlide?.mobileOffsetX ?? 0);
  const activeOffsetY = isDesktopTab ? (currentSlide?.desktopOffsetY ?? 0) : (currentSlide?.mobileOffsetY ?? 0);

  const previewScale = previewDevice === "desktop" ? (currentSlide?.desktopScale ?? 100) : (currentSlide?.mobileScale ?? 100);
  const previewOffsetX = previewDevice === "desktop" ? (currentSlide?.desktopOffsetX ?? 0) : (currentSlide?.mobileOffsetX ?? 0);
  const previewOffsetY = previewDevice === "desktop" ? (currentSlide?.desktopOffsetY ?? 0) : (currentSlide?.mobileOffsetY ?? 0);

  return (
    <div className="space-y-6 font-mograph">
      {/* ========================================================
          1. HEADER & STATUS BAR (Vittal Brand Theme)
         ======================================================== */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-[#E2F5B4] text-[#3D6318]">
              <Sparkles className="w-5 h-5 stroke-[2.2]" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 font-mograph">
              Hero Banner Cards Customizer
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E2F5B4] text-[#3D6318] border border-[#85BE33]/30">
              {draftSlides.filter((s) => s.active !== false).length} / {draftSlides.length} Active Slides
            </span>
            {isDirty ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                Unsaved Changes
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Live Website In Sync
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-neutral-500">
            Customize cutout images, zoom & offsets for Desktop & Mobile, badge text, headline, and CTA button.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Restore original Vittal Lifestyle 3 slides"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToLive}
            disabled={saving || !isDirty}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              isDirty
                ? "bg-[#95CF42] hover:bg-[#85BE33] text-black hover:scale-102 hover:shadow-lg"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            }`}
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Saving to Cloudflare..." : "Save Changes to Live Website"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. REAL-TIME STOREFRONT PREVIEW (DESKTOP & MOBILE TOGGLE)
         ======================================================== */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Live Preview:
            </span>
            <span className="text-sm font-bold text-neutral-900">
              Slide #{selectedSlideIndex + 1} ({previewDevice === "desktop" ? "Desktop 16:9 View" : "Mobile Phone View"})
            </span>
          </div>

          {/* Device Switcher */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setPreviewDevice("desktop");
                setControlViewTab("desktop");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                previewDevice === "desktop"
                  ? "bg-white text-neutral-900 shadow-xs font-extrabold"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop View</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPreviewDevice("mobile");
                setControlViewTab("mobile");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                previewDevice === "mobile"
                  ? "bg-white text-neutral-900 shadow-xs font-extrabold"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile View</span>
            </button>
          </div>
        </div>

        {/* Live Preview Screen Container */}
        <div className="w-full bg-neutral-900/5 rounded-2xl p-3 sm:p-6 flex items-center justify-center overflow-hidden">
          {previewDevice === "desktop" ? (
            /* Desktop Banner Preview (16:9 aspect bounds) */
            <div className="w-full max-w-[1200px] relative rounded-3xl overflow-hidden bg-[#95CF42] border border-[#85BE33]/50 shadow-md min-h-[260px] sm:min-h-[300px] md:min-h-[320px] flex items-center">
              {/* Background texture */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={currentSlide?.bgImage || "/vittal/banner-hero-green-texture.jpg"}
                  alt="Hero Background"
                  fill
                  className="object-cover object-center"
                />
              </div>

              {/* Fluid wave */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25 z-0">
                <svg className="w-full h-full object-cover" viewBox="0 0 800 450" fill="none" preserveAspectRatio="none">
                  <path d="M -100,50 Q 200,200 400,100 T 900,150" stroke="#7EBA2B" strokeWidth="40" fill="none" />
                  <path d="M -50,150 Q 250,300 500,200 T 950,250" stroke="#7EBA2B" strokeWidth="50" fill="none" />
                  <path d="M -100,280 Q 200,420 500,320 T 900,400" stroke="#7EBA2B" strokeWidth="60" fill="none" />
                </svg>
              </div>

              {/* Cutout Image with Desktop Zoom & Position */}
              <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
                {currentSlide?.cutoutImage ? (
                  <div
                    className="absolute inset-0 transition-transform duration-150"
                    style={{
                      transform: `translate(${previewOffsetX}px, ${previewOffsetY}px) scale(${previewScale / 100})`,
                      transformOrigin: "right bottom",
                    }}
                  >
                    <Image
                      src={currentSlide.cutoutImage}
                      alt="Cutout Preview"
                      fill
                      className={
                        currentSlide?.imageFit === "cover"
                          ? "object-cover object-right"
                          : "object-contain object-right-bottom"
                      }
                    />
                  </div>
                ) : (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-48 border-2 border-dashed border-white/60 rounded-2xl flex flex-col items-center justify-center text-white/80 p-4 text-center">
                    <Upload className="w-8 h-8 mb-2 opacity-60" />
                    <span className="text-xs font-bold">No Cutout Image</span>
                    <span className="text-[10px] opacity-75">Upload PNG below</span>
                  </div>
                )}
              </div>

              {/* Left Content Overlay */}
              <div className="relative z-10 px-6 sm:px-10 py-6 max-w-[50%]">
                {currentSlide?.badge && (
                  <div className="inline-block bg-[#111111] text-white text-[10px] font-semibold px-3 py-1 rounded-full mb-2.5 shadow-xs">
                    {currentSlide.badge}
                  </div>
                )}
                <h1 className="font-mograph font-bold text-lg sm:text-2xl md:text-3xl text-[#111111] leading-tight mb-4 whitespace-pre-line">
                  {currentSlide?.heading || "First Purchase Enjoy\na Special Offer"}
                </h1>
                <div className="inline-flex items-center gap-2 bg-[#111111] text-white font-bold text-xs pl-4 pr-1 py-1 rounded-full shadow-md">
                  <span>{currentSlide?.buttonText || "Shop Now"}</span>
                  <div className="w-7 h-7 rounded-full bg-white text-[#111111] flex items-center justify-center shrink-0 shadow-xs">
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>
              </div>

              {/* Scoop Notch with Pagination Indicators */}
              <div className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
                <div className="relative">
                  <svg viewBox="0 0 160 30" className="w-36 h-6 fill-white block" preserveAspectRatio="none">
                    <path d="M 0,30 C 22,30 26,0 48,0 L 112,0 C 134,0 138,30 160,30 Z" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center gap-1.5 pb-0.5 pointer-events-auto">
                    {draftSlides.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedSlideIndex(idx)}
                        className={`transition-all duration-300 cursor-pointer ${
                          selectedSlideIndex === idx
                            ? "w-6 h-1.5 rounded-full bg-[#B8ED3E] shadow-2xs"
                            : "w-1.5 h-1.5 rounded-full bg-neutral-300 hover:bg-neutral-400"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Mobile Phone Frame Preview */
            <div className="w-[340px] relative rounded-[32px] overflow-hidden bg-[#95CF42] border border-[#85BE33]/50 shadow-xl min-h-[240px] flex items-center">
              {/* Background texture */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={currentSlide?.bgImage || "/vittal/banner-hero-green-texture.jpg"}
                  alt="Hero Background"
                  fill
                  className="object-cover object-center"
                />
              </div>

              {/* Fluid wave */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25 z-0">
                <svg className="w-full h-full object-cover" viewBox="0 0 800 450" fill="none" preserveAspectRatio="none">
                  <path d="M -100,50 Q 200,200 400,100 T 900,150" stroke="#7EBA2B" strokeWidth="40" fill="none" />
                  <path d="M -50,150 Q 250,300 500,200 T 950,250" stroke="#7EBA2B" strokeWidth="50" fill="none" />
                </svg>
              </div>

              {/* Cutout Image with Mobile Zoom & Position */}
              <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
                {currentSlide?.cutoutImage ? (
                  <div
                    className="absolute inset-0 transition-transform duration-150"
                    style={{
                      transform: `translate(${previewOffsetX}px, ${previewOffsetY}px) scale(${previewScale / 100})`,
                      transformOrigin: "right bottom",
                    }}
                  >
                    <Image
                      src={currentSlide.cutoutImage}
                      alt="Cutout Preview"
                      fill
                      className={
                        currentSlide?.mobileImageFit === "cover" || currentSlide?.imageFit === "cover"
                          ? "object-cover object-right"
                          : "object-contain object-right-bottom"
                      }
                    />
                  </div>
                ) : (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-32 h-32 border-2 border-dashed border-white/60 rounded-xl flex flex-col items-center justify-center text-white/80 p-2 text-center">
                    <Upload className="w-6 h-6 mb-1 opacity-60" />
                    <span className="text-[10px] font-bold">No Cutout</span>
                  </div>
                )}
              </div>

              {/* Left Content Overlay */}
              <div className="relative z-10 px-4 py-4 max-w-[50%]">
                {currentSlide?.badge && (
                  <div className="inline-block bg-[#111111] text-white text-[9px] font-semibold px-2.5 py-0.5 rounded-full mb-1.5 shadow-xs">
                    {currentSlide.badge}
                  </div>
                )}
                <h1 className="font-mograph font-bold text-sm text-[#111111] leading-tight mb-2.5 whitespace-pre-line">
                  {currentSlide?.heading || "First Purchase Enjoy\na Special Offer"}
                </h1>
                <div className="inline-flex items-center gap-1.5 bg-[#111111] text-white font-bold text-[10px] pl-3 pr-1 py-0.5 rounded-full shadow-md">
                  <span>{currentSlide?.buttonText || "Shop Now"}</span>
                  <div className="w-5 h-5 rounded-full bg-white text-[#111111] flex items-center justify-center shrink-0 shadow-xs">
                    <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                  </div>
                </div>
              </div>

              {/* Bottom Scoop Notch */}
              <div className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
                <div className="relative">
                  <svg viewBox="0 0 160 30" className="w-28 h-5 fill-white block" preserveAspectRatio="none">
                    <path d="M 0,30 C 22,30 26,0 48,0 L 112,0 C 134,0 138,30 160,30 Z" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center gap-1 pb-0.5 pointer-events-auto">
                    {draftSlides.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedSlideIndex(idx)}
                        className={`transition-all duration-300 cursor-pointer ${
                          selectedSlideIndex === idx
                            ? "w-5 h-1 rounded-full bg-[#B8ED3E]"
                            : "w-1 h-1 rounded-full bg-neutral-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          3. SLIDE SELECTION & MANAGEMENT BAR
         ======================================================== */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Manage Banner Slides:
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddNewSlide}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#95CF42] hover:bg-[#85BE33] text-black text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ Add New Banner Slide</span>
          </button>
        </div>

        {/* Slide Pills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
          {draftSlides.map((slide, idx) => {
            const isSelected = selectedSlideIndex === idx;
            return (
              <div
                key={slide.id || idx}
                onClick={() => setSelectedSlideIndex(idx)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                  isSelected
                    ? "border-[#6B9E3A] bg-[#F4FBE8] shadow-xs ring-2 ring-[#6B9E3A]/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Thumbnail */}
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-100 relative shrink-0 border border-neutral-200">
                    {slide.cutoutImage ? (
                      <Image
                        src={slide.cutoutImage}
                        alt=""
                        fill
                        className="object-contain object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-neutral-400">
                        PNG
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-neutral-900 truncate">
                        Slide #{idx + 1}
                      </span>
                      {slide.active !== false ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Active" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-neutral-300 shrink-0" title="Hidden" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 truncate">
                      {slide.heading?.replace(/\n/g, " ") || "No heading"}
                    </p>
                  </div>
                </div>

                {/* Quick Reorder & Delete */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveSlide(idx, idx - 1)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      title="Move Left"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  )}
                  {idx < draftSlides.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMoveSlide(idx, idx + 1)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      title="Move Right"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  {draftSlides.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          4. ACTIVE SLIDE CUSTOMIZATION CONTROLS
         ======================================================== */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-7">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-3">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Editing Slide #{selectedSlideIndex + 1}
            </h3>
            <p className="text-xs text-neutral-500">
              Changes update the interactive preview above in real-time. Click &quot;Save Changes to Live Website&quot; when ready.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Active Toggle Switch */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs font-bold text-neutral-700">Slide Active:</span>
              <input
                type="checkbox"
                checked={currentSlide?.active !== false}
                onChange={(e) => handleUpdateCurrentSlide("active", e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  currentSlide?.active !== false ? "bg-[#85BE33]" : "bg-neutral-300"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    currentSlide?.active !== false ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </div>
            </label>
          </div>
        </div>

        {/* SECTION A: CUTOUT IMAGE SETTINGS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#E2F5B4] text-[#3D6318] text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
              Cutout Image (Transparent Background PNG)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {/* Cutout Thumbnail Preview */}
            <div className="w-full aspect-[4/3] rounded-2xl bg-neutral-100 border-2 border-dashed border-neutral-300 relative overflow-hidden flex flex-col items-center justify-center p-3">
              {currentSlide?.cutoutImage ? (
                <div className="relative w-full h-full">
                  <Image
                    src={currentSlide.cutoutImage}
                    alt=""
                    fill
                    className="object-contain object-center"
                  />
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <Upload className="w-8 h-8 mx-auto text-neutral-400" />
                  <p className="text-xs font-bold text-neutral-600">No cutout image</p>
                  <p className="text-[10px] text-neutral-400">Upload a PNG cutout below</p>
                </div>
              )}
            </div>

            {/* Upload & Direct URL Controls */}
            <div className="md:col-span-2 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Upload Cutout Image File (.png, .webp):
                </label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer">
                    {uploadingCutout ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{uploadingCutout ? "Uploading..." : "Choose PNG File"}</span>
                    <input
                      type="file"
                      accept="image/png,image/webp,image/jpeg"
                      onChange={handleCutoutFileUpload}
                      className="hidden"
                      disabled={uploadingCutout}
                    />
                  </label>
                  <span className="text-[11px] text-neutral-500">
                    Transparent PNG cutouts look best against the green wave texture.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Or Paste Cutout Image URL:
                </label>
                <input
                  type="text"
                  value={currentSlide?.cutoutImage || ""}
                  onChange={(e) => {
                    handleUpdateCurrentSlide("cutoutImage", e.target.value);
                    handleUpdateCurrentSlide("image", e.target.value);
                  }}
                  placeholder="https://... or /vittal/cutout-hero-1.png"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#85BE33]"
                />
              </div>

              {/* Quick Preset Picker */}
              <div>
                <span className="block text-[11px] font-bold text-neutral-500 mb-1.5">
                  Quick Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  {CUTOUT_PRESETS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => {
                        handleUpdateCurrentSlide("cutoutImage", preset.url);
                        handleUpdateCurrentSlide("image", preset.url);
                        showToast("success", `Preset applied: ${preset.label}`);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-neutral-100 hover:bg-[#E2F5B4] text-neutral-700 hover:text-[#3D6318] rounded-lg transition-colors border border-neutral-200"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fit Mode Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-bold text-neutral-600">
                  Image Fit Mode:
                </span>
                <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateCurrentSlide("imageFit", "contain");
                      showToast("success", "Fit set to Contain (Full subject visible, no crop)");
                    }}
                    className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                      (currentSlide?.imageFit || "contain") === "contain"
                        ? "bg-white text-neutral-900 shadow-xs font-extrabold"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    Contain (No Crop)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateCurrentSlide("imageFit", "cover");
                      showToast("success", "Fit set to Cover");
                    }}
                    className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                      currentSlide?.imageFit === "cover"
                        ? "bg-white text-neutral-900 shadow-xs font-extrabold"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    Cover (Fill Frame)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION B: ZOOM & POSITION ADJUSTMENTS (INDIVIDUAL DESKTOP & MOBILE) */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#E2F5B4] text-[#3D6318] text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                Cutout Size & Position (Desktop vs Mobile)
              </h4>
            </div>

            {/* View Tab Selector */}
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
              <button
                type="button"
                onClick={() => {
                  setControlViewTab("desktop");
                  setPreviewDevice("desktop");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  controlViewTab === "desktop"
                    ? "bg-[#95CF42] text-black shadow-xs font-extrabold"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop Settings</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setControlViewTab("mobile");
                  setPreviewDevice("mobile");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  controlViewTab === "mobile"
                    ? "bg-[#95CF42] text-black shadow-xs font-extrabold"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile Settings</span>
              </button>
            </div>
          </div>

          <div className="bg-neutral-50/80 rounded-2xl p-5 border border-neutral-200/80 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700">
                Adjusting: <span className="text-[#4A7220] uppercase font-extrabold">{controlViewTab} View</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  if (isDesktopTab) {
                    handleUpdateCurrentSlide("desktopScale", 100);
                    handleUpdateCurrentSlide("desktopOffsetX", 0);
                    handleUpdateCurrentSlide("desktopOffsetY", 0);
                  } else {
                    handleUpdateCurrentSlide("mobileScale", 100);
                    handleUpdateCurrentSlide("mobileOffsetX", 0);
                    handleUpdateCurrentSlide("mobileOffsetY", 0);
                  }
                  showToast("success", `Reset ${controlViewTab} zoom & position to defaults.`);
                }}
                className="text-[11px] font-bold text-neutral-500 hover:text-neutral-800 underline cursor-pointer"
              >
                Reset {controlViewTab} Position & Zoom
              </button>
            </div>

            {/* 1. Zoom Slider (Scale %) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-neutral-800">
                  <ZoomIn className="w-3.5 h-3.5 text-[#6B9E3A]" />
                  <span>Zoom / Scale:</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-[#3D6318] font-bold">
                  {activeScale}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.max(50, activeScale - 5);
                    handleUpdateCurrentSlide(isDesktopTab ? "desktopScale" : "mobileScale", newVal);
                  }}
                  className="w-8 h-8 rounded-lg bg-white border border-neutral-200 text-neutral-700 font-bold hover:bg-neutral-100 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  -
                </button>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="1"
                  value={activeScale}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    handleUpdateCurrentSlide(isDesktopTab ? "desktopScale" : "mobileScale", val);
                  }}
                  className="w-full accent-[#85BE33] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.min(200, activeScale + 5);
                    handleUpdateCurrentSlide(isDesktopTab ? "desktopScale" : "mobileScale", newVal);
                  }}
                  className="w-8 h-8 rounded-lg bg-white border border-neutral-200 text-neutral-700 font-bold hover:bg-neutral-100 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* 2. Horizontal Position Slider (Move Left / Right) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-neutral-800">
                  <Move className="w-3.5 h-3.5 text-[#6B9E3A]" />
                  <span>Move Left / Right (X Offset):</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-[#3D6318] font-bold">
                  {activeOffsetX === 0
                    ? "Centered (0px)"
                    : activeOffsetX < 0
                    ? `${Math.abs(activeOffsetX)}px Left`
                    : `${activeOffsetX}px Right`}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.max(-250, activeOffsetX - 5);
                    handleUpdateCurrentSlide(isDesktopTab ? "desktopOffsetX" : "mobileOffsetX", newVal);
                  }}
                  className="px-2 py-1.5 rounded-lg bg-white border border-neutral-200 text-[11px] font-bold text-neutral-700 hover:bg-neutral-100 flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Left</span>
                </button>
                <input
                  type="range"
                  min="-250"
                  max="250"
                  step="2"
                  value={activeOffsetX}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    handleUpdateCurrentSlide(isDesktopTab ? "desktopOffsetX" : "mobileOffsetX", val);
                  }}
                  className="w-full accent-[#85BE33] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.min(250, activeOffsetX + 5);
                    handleUpdateCurrentSlide(isDesktopTab ? "desktopOffsetX" : "mobileOffsetX", newVal);
                  }}
                  className="px-2 py-1.5 rounded-lg bg-white border border-neutral-200 text-[11px] font-bold text-neutral-700 hover:bg-neutral-100 flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>Right</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 3. Vertical Position Slider (Move Upper / Lower) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-neutral-800">
                  <Move className="w-3.5 h-3.5 text-[#6B9E3A]" />
                  <span>Move Upper / Lower (Y Offset):</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-[#3D6318] font-bold">
                  {activeOffsetY === 0
                    ? "Centered (0px)"
                    : activeOffsetY < 0
                    ? `${Math.abs(activeOffsetY)}px Up`
                    : `${activeOffsetY}px Down`}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.max(-200, activeOffsetY - 5);
                    handleUpdateCurrentSlide(isDesktopTab ? "desktopOffsetY" : "mobileOffsetY", newVal);
                  }}
                  className="px-2 py-1.5 rounded-lg bg-white border border-neutral-200 text-[11px] font-bold text-neutral-700 hover:bg-neutral-100 flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <ArrowUp className="w-3 h-3" />
                  <span>Up</span>
                </button>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  step="2"
                  value={activeOffsetY}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    handleUpdateCurrentSlide(isDesktopTab ? "desktopOffsetY" : "mobileOffsetY", val);
                  }}
                  className="w-full accent-[#85BE33] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.min(200, activeOffsetY + 5);
                    handleUpdateCurrentSlide(isDesktopTab ? "desktopOffsetY" : "mobileOffsetY", newVal);
                  }}
                  className="px-2 py-1.5 rounded-lg bg-white border border-neutral-200 text-[11px] font-bold text-neutral-700 hover:bg-neutral-100 flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>Down</span>
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION C: HEADINGS, BADGE & BUTTON SETTINGS */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#E2F5B4] text-[#3D6318] text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
              Headings, Upper Badge & CTA Button
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Upper Badge */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700">
                Upper Eyebrow Badge Text:
              </label>
              <input
                type="text"
                value={currentSlide?.badge || ""}
                onChange={(e) => handleUpdateCurrentSlide("badge", e.target.value)}
                placeholder="e.g. Limited Offer"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#85BE33]"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {BADGE_PRESETS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => handleUpdateCurrentSlide("badge", b)}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-neutral-100 hover:bg-[#E2F5B4] text-neutral-700 hover:text-[#3D6318] rounded-md transition-colors"
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Button Label */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700">
                Button Label:
              </label>
              <input
                type="text"
                value={currentSlide?.buttonText || currentSlide?.ctaText || ""}
                onChange={(e) => {
                  handleUpdateCurrentSlide("buttonText", e.target.value);
                  handleUpdateCurrentSlide("ctaText", e.target.value);
                }}
                placeholder="e.g. Shop Now"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#85BE33]"
              />
            </div>

            {/* Main Heading Textarea */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold text-neutral-700">
                Main Headline Text (Line breaks will display on banner):
              </label>
              <textarea
                rows={2}
                value={currentSlide?.heading || ""}
                onChange={(e) => handleUpdateCurrentSlide("heading", e.target.value)}
                placeholder="First Purchase Enjoy&#10;a Special Offer"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#85BE33]"
              />
            </div>

            {/* Button Redirect URL */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold text-neutral-700">
                Button Redirect Destination (URL):
              </label>
              <input
                type="text"
                value={currentSlide?.buttonLink || currentSlide?.ctaLink || ""}
                onChange={(e) => {
                  handleUpdateCurrentSlide("buttonLink", e.target.value);
                  handleUpdateCurrentSlide("ctaLink", e.target.value);
                }}
                placeholder="/products or /products?category=Gym+Supplements"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#85BE33]"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {REDIRECT_PRESETS.map((dest) => (
                  <button
                    key={dest.url}
                    type="button"
                    onClick={() => {
                      handleUpdateCurrentSlide("buttonLink", dest.url);
                      handleUpdateCurrentSlide("ctaLink", dest.url);
                    }}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-neutral-100 hover:bg-[#E2F5B4] text-neutral-700 hover:text-[#3D6318] rounded-md transition-colors"
                  >
                    {dest.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION D: BACKGROUND IMAGE (VITTAL TEXTURE) */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-700">
              Banner Background Texture:
            </span>
            <button
              type="button"
              onClick={() => handleUpdateCurrentSlide("bgImage", "/vittal/banner-hero-green-texture.jpg")}
              className="text-[11px] font-bold text-[#4A7220] hover:underline"
            >
              Reset to Brand Lime Wave
            </button>
          </div>
          <input
            type="text"
            value={currentSlide?.bgImage || ""}
            onChange={(e) => handleUpdateCurrentSlide("bgImage", e.target.value)}
            placeholder="/vittal/banner-hero-green-texture.jpg"
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#85BE33]"
          />
        </div>

        {/* Bottom Save Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={handleSaveToLive}
            disabled={saving || !isDirty}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              isDirty
                ? "bg-[#95CF42] hover:bg-[#85BE33] text-black hover:scale-102 hover:shadow-lg"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            }`}
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Saving to Cloudflare..." : "Save Changes to Live Website"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

