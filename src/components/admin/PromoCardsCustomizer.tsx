"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  PromoBannerCard,
  DEFAULT_PROMO_BANNERS,
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
  Sparkles,
  Link as LinkIcon,
  Palette,
  Eye,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";

interface PromoCardsCustomizerProps {
  categories: StoreCategory[];
  showToast: (type: "success" | "error", text: string) => void;
}

// Background Gradient Presets specifically designed for Vittal Digital
const GRADIENT_PRESETS = [
  {
    label: "Soft Lavender (Card 1 Default)",
    gradient: "linear-gradient(135deg, #EAEBFF 0%, #E2E6FF 50%, #D5DCFF 100%)",
    bgClass: "from-[#EAEBFF] via-[#E2E6FF] to-[#D5DCFF]",
    border: "border-indigo-100",
  },
  {
    label: "Warm Cream (Card 2 Default)",
    gradient: "linear-gradient(135deg, #FFF4EB 0%, #FCEAE0 50%, #F5D8CA 100%)",
    bgClass: "from-[#FFF4EB] via-[#FCEAE0] to-[#F5D8CA]",
    border: "border-orange-100",
  },
  {
    label: "Sky Blue (Card 3 Default)",
    gradient: "linear-gradient(135deg, #E6F3FA 0%, #D8ECF7 50%, #C9E4F4 100%)",
    bgClass: "from-[#E6F3FA] via-[#D8ECF7] to-[#C9E4F4]",
    border: "border-sky-100",
  },
  {
    label: "Mint Frost",
    gradient: "linear-gradient(135deg, #E6FBF2 0%, #D4F7E6 50%, #C3F2DC 100%)",
    bgClass: "from-[#E6FBF2] via-[#D4F7E6] to-[#C3F2DC]",
    border: "border-emerald-100",
  },
  {
    label: "Rose Quartz",
    gradient: "linear-gradient(135deg, #FDEEF2 0%, #FCDDE5 50%, #FACFDB 100%)",
    bgClass: "from-[#FDEEF2] via-[#FCDDE5] to-[#FACFDB]",
    border: "border-pink-100",
  },
  {
    label: "Golden Sunlight",
    gradient: "linear-gradient(135deg, #FEF9C3 0%, #FEF08A 50%, #FDE047 100%)",
    bgClass: "from-[#FEF9C3] via-[#FEF08A] to-[#FDE047]",
    border: "border-yellow-200",
  },
  {
    label: "Midnight Navy (Dark)",
    gradient: "linear-gradient(135deg, #00223D 0%, #003055 50%, #00182E 100%)",
    bgClass: "from-[#00223D] via-[#003055] to-[#00182E]",
    border: "border-blue-900",
  },
  {
    label: "Obsidian Slate (Dark)",
    gradient: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0B1120 100%)",
    bgClass: "from-[#0F172A] via-[#1E293B] to-[#0B1120]",
    border: "border-slate-800",
  },
];

const BUTTON_BG_PRESETS = [
  { label: "Vittal Gold", value: "#FFBE00" },
  { label: "Brand Navy", value: "#002D62" },
  { label: "Deep Cobalt", value: "#003055" },
  { label: "Solid Black", value: "#020617" },
  { label: "Pure White", value: "#FFFFFF" },
  { label: "Vibrant Orange", value: "#FF7A00" },
  { label: "Emerald Green", value: "#059669" },
  { label: "Crimson Red", value: "#DC2626" },
];

const BADGE_PRESETS = [
  "BEST DEALS",
  "NEW ARRIVAL",
  "TOP SELLER",
  "LIMITED OFFER",
  "HOT DEAL",
  "UP TO 50% OFF",
  "FEATURED",
  "TRENDING",
];

const PHOTO_PRESETS = [
  { label: "iPhone 15 Blue", url: "/vittal/products/iphone-15-transparent.png" },
  { label: "AirPods Pro", url: "/vittal/products/airpods-pro-transparent.png" },
  { label: "Smartwatch Black", url: "/vittal/products/smart-watch-1-transparent.png" },
  { label: "Smartwatch Pro", url: "/vittal/products/smart-watch-pro-transparent.png" },
  { label: "HP Victus Laptop", url: "/vittal/products/hp-victus-transparent.png" },
  { label: "DualSense PS5 Controller", url: "/vittal/products/ps5-controller-transparent.png" },
  { label: "AirPods Max Silver", url: "/vittal/products/airpods-max-transparent.png" },
  { label: "Multi-Device Ecosystem", url: "/vittal/products/bottom-banner-devices-transparent.png" },
];

export function PromoCardsCustomizer({
  categories,
  showToast,
}: PromoCardsCustomizerProps) {
  const [savedCards, setSavedCards] = useState<PromoBannerCard[]>(DEFAULT_PROMO_BANNERS);
  const [draftCards, setDraftCards] = useState<PromoBannerCard[]>(DEFAULT_PROMO_BANNERS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [mobileSlide, setMobileSlide] = useState(0);
  const [activeCardTab, setActiveCardTab] = useState<"all" | "card-1" | "card-2" | "card-3">("all");
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  // Auto-slide preview in mobile mode
  useEffect(() => {
    if (previewDevice !== "mobile") return;
    const timer = setInterval(() => {
      setMobileSlide((prev) => (prev + 1) % draftCards.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [previewDevice, draftCards.length]);

  // Load promo banners from API on mount
  const loadPromoBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content/promo-banners");
      const data = await res.json();
      if (data.success && Array.isArray(data.banners) && data.banners.length === 3) {
        setSavedCards(data.banners);
        setDraftCards(data.banners);
      } else {
        setSavedCards(DEFAULT_PROMO_BANNERS);
        setDraftCards(DEFAULT_PROMO_BANNERS);
      }
    } catch (err: any) {
      console.warn("Failed to load promo banners:", err);
      setSavedCards(DEFAULT_PROMO_BANNERS);
      setDraftCards(DEFAULT_PROMO_BANNERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromoBanners();
  }, []);

  // Check if dirty
  const isDirty = JSON.stringify(savedCards) !== JSON.stringify(draftCards);

  // Update card field
  const updateCard = (index: number, field: keyof PromoBannerCard, value: any) => {
    setDraftCards((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Upload image to Cloudflare R2
  const handleUploadImage = async (index: number, file: File) => {
    setUploadingIdx(index);
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
        updateCard(index, "image", data.url);
        showToast("success", "Product photo uploaded successfully!");
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to upload image");
    } finally {
      setUploadingIdx(null);
    }
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/content/promo-banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banners: draftCards }),
      });
      const data = await res.json();
      if (data.success && data.banners) {
        setSavedCards(data.banners);
        setDraftCards(data.banners);
        showToast("success", "Promo 3-Cards successfully saved and published live!");
      } else {
        throw new Error(data.error || "Failed to save promo cards");
      }
    } catch (err: any) {
      showToast("error", err.message || "Save error occurred");
    } finally {
      setSaving(false);
    }
  };

  // Reset to default
  const handleResetDefaults = async () => {
    if (!confirm("Are you sure you want to revert all 3 promo cards to the default Vittal Digital configuration?")) {
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/content/promo-banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_defaults" }),
      });
      const data = await res.json();
      if (data.success && data.banners) {
        setSavedCards(data.banners);
        setDraftCards(data.banners);
        showToast("success", "Restored default 3 promo banners!");
      } else {
        setDraftCards([...DEFAULT_PROMO_BANNERS]);
      }
    } catch (err: any) {
      setDraftCards([...DEFAULT_PROMO_BANNERS]);
      showToast("error", "Error resetting defaults");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
        <RefreshCw className="w-8 h-8 text-[#002D62] animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading 3-Cards Promo customizer...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF7A00]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-[#002D62]">Promo Banners Customizer</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#002D62] text-white">
                  3 CARDS
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Website In Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize badge, 2-line headings, subtitles, button labels & colors, background gradients, and transparent product photos for the 3 homepage promo cards.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-center">
          <button
            onClick={handleResetDefaults}
            disabled={saving}
            className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
              isDirty
                ? "bg-[#002D62] hover:bg-[#002047] text-white shadow-blue-900/20 active:scale-95"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saving ? "Saving..." : "Save Changes to Live Website"}</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Real-Time Storefront Preview */}
      <div className="bg-[#001D38] rounded-2xl sm:rounded-3xl border border-blue-950 p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FFBE00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-300">
                100% Real-Time Storefront Preview
              </h3>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                ({previewDevice === "desktop" ? "3-Column Desktop Grid" : "Auto-sliding Mobile View"})
              </span>
            </div>

            {/* Viewport switch */}
            <div className="inline-flex items-center bg-black/40 backdrop-blur-md rounded-xl p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  previewDevice === "desktop"
                    ? "bg-[#002D62] text-white shadow-sm border border-blue-400/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop View</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  previewDevice === "mobile"
                    ? "bg-[#002D62] text-white shadow-sm border border-blue-400/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile View</span>
              </button>
            </div>
          </div>

          {/* DESKTOP PREVIEW: 3-Column Side-by-side */}
          {previewDevice === "desktop" && (
            <div className="bg-white/95 rounded-2xl p-4 sm:p-6 backdrop-blur-md border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {draftCards.map((card, idx) => (
                  <div
                    key={card.id || idx}
                    onClick={() => setActiveCardTab(`card-${idx + 1}` as any)}
                    style={{ background: card.bgGradient || card.bgColor }}
                    className="relative rounded-2xl overflow-hidden border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between min-h-[230px] shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    title="Click to edit this card below"
                  >
                    {/* Quick edit indicator */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm text-[#002D62] text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200 shadow-xs z-20 flex items-center gap-1">
                      <span>Click to Edit</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>

                    <div className="z-10 max-w-[200px]">
                      <span
                        style={{
                          backgroundColor: card.badgeBg || "#002D62",
                          color: card.badgeText || "#FFFFFF",
                        }}
                        className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded shadow-xs inline-block mb-2"
                      >
                        {card.badge}
                      </span>
                      <h4
                        style={{ color: card.textColor || "#002D62" }}
                        className="text-lg sm:text-xl font-bold leading-tight mt-1"
                      >
                        {card.titleLine1}
                        {card.titleLine2 ? (
                          <>
                            <br />
                            {card.titleLine2}
                          </>
                        ) : null}
                      </h4>
                      <p
                        style={{ color: card.subtitleColor || "#475569" }}
                        className="text-xs font-medium mt-1 line-clamp-2"
                      >
                        {card.subtitle}
                      </p>
                      <div
                        style={{
                          backgroundColor: card.btnBgColor || "#FFBE00",
                          color: card.btnTextColor || "#020617",
                        }}
                        className="inline-flex items-center gap-1.5 mt-4 font-bold text-xs px-3.5 py-2 rounded-md shadow-xs select-none"
                      >
                        <span>{card.ctaText || "Shop Now"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className={`absolute right-2 bottom-1 ${card.imageClass || "w-36 sm:w-40 h-40 sm:h-44"} z-0 pointer-events-none`}>
                      <Image
                        src={card.image}
                        alt={card.imageAlt || card.titleLine1 || "Promo product"}
                        fill
                        style={{ transform: card.imageScale ? `scale(${card.imageScale / 100})` : undefined }}
                        className="object-contain object-bottom-right drop-shadow-md"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MOBILE PREVIEW: Phone viewport with auto-slide */}
          {previewDevice === "mobile" && (
            <div className="flex justify-center">
              <div className="w-full max-w-[360px] bg-slate-900 rounded-[32px] p-3 shadow-2xl border-4 border-slate-700">
                {/* Notch */}
                <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2" />

                <div className="bg-white rounded-[22px] p-3 overflow-hidden">
                  <div
                    style={{ background: draftCards[mobileSlide].bgGradient || draftCards[mobileSlide].bgColor }}
                    className="relative rounded-2xl overflow-hidden border border-slate-200/80 p-5 flex flex-col justify-between min-h-[210px] shadow-sm transition-all duration-500"
                  >
                    <div className="z-10 max-w-[190px]">
                      <span
                        style={{
                          backgroundColor: draftCards[mobileSlide].badgeBg || "#002D62",
                          color: draftCards[mobileSlide].badgeText || "#FFFFFF",
                        }}
                        className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded shadow-xs inline-block mb-1.5"
                      >
                        {draftCards[mobileSlide].badge}
                      </span>
                      <h4
                        style={{ color: draftCards[mobileSlide].textColor || "#002D62" }}
                        className="text-base sm:text-lg font-bold leading-tight"
                      >
                        {draftCards[mobileSlide].titleLine1}
                        {draftCards[mobileSlide].titleLine2 ? (
                          <>
                            <br />
                            {draftCards[mobileSlide].titleLine2}
                          </>
                        ) : null}
                      </h4>
                      <p
                        style={{ color: draftCards[mobileSlide].subtitleColor || "#475569" }}
                        className="text-[11px] font-medium mt-1 line-clamp-2"
                      >
                        {draftCards[mobileSlide].subtitle}
                      </p>
                      <div
                        style={{
                          backgroundColor: draftCards[mobileSlide].btnBgColor || "#FFBE00",
                          color: draftCards[mobileSlide].btnTextColor || "#020617",
                        }}
                        className="inline-flex items-center gap-1.5 mt-3 font-bold text-[11px] px-3 py-1.5 rounded-md shadow-xs select-none"
                      >
                        <span>{draftCards[mobileSlide].ctaText || "Shop Now"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>

                    <div className="absolute right-2 bottom-1 w-32 h-36 z-0 pointer-events-none">
                      <Image
                        src={draftCards[mobileSlide].image}
                        alt="Promo mobile"
                        fill
                        style={{ transform: draftCards[mobileSlide].imageScale ? `scale(${draftCards[mobileSlide].imageScale / 100})` : undefined }}
                        className="object-contain object-bottom-right drop-shadow-md"
                      />
                    </div>
                  </div>

                  {/* 3 Dots */}
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    {draftCards.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={() => setMobileSlide(dotIdx)}
                        className={`transition-all duration-300 rounded-full ${
                          dotIdx === mobileSlide
                            ? "bg-[#002D62] w-5 h-1.5"
                            : "bg-slate-300 hover:bg-slate-400 w-1.5 h-1.5"
                        }`}
                        aria-label={`Slide ${dotIdx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Card Selector Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveCardTab("all")}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeCardTab === "all"
              ? "border-[#FF7A00] text-[#002D62]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All 3 Cards Side-by-Side</span>
        </button>

        {draftCards.map((card, idx) => (
          <button
            key={card.id || idx}
            type="button"
            onClick={() => setActiveCardTab(`card-${idx + 1}` as any)}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeCardTab === `card-${idx + 1}`
                ? "border-[#FF7A00] text-[#002D62]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: card.btnBgColor || "#FFBE00" }} />
            <span>Card {idx + 1}: {card.badge || card.titleLine1}</span>
          </button>
        ))}
      </div>

      {/* 4. Edit Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {draftCards.map((card, idx) => {
          const isSelected = activeCardTab === "all" || activeCardTab === `card-${idx + 1}`;
          if (!isSelected) return null;

          return (
            <div
              key={card.id || idx}
              className={`bg-white rounded-2xl sm:rounded-3xl border ${
                activeCardTab === `card-${idx + 1}` ? "border-[#FF7A00] ring-2 ring-orange-200" : "border-slate-200/80"
              } p-5 sm:p-6 shadow-xs space-y-5 transition-all`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#002D62] text-white text-xs font-extrabold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Card {idx + 1}: {card.titleLine1} {card.titleLine2}
                    </h3>
                    <p className="text-[11px] text-slate-400">Section 3 Homepage Banner</p>
                  </div>
                </div>
                <span
                  style={{ backgroundColor: card.badgeBg || "#002D62", color: card.badgeText || "#FFFFFF" }}
                  className="text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-xs"
                >
                  {card.badge}
                </span>
              </div>

              {/* 1. Badge Settings */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Badge Text & Pill Style</span>
                </label>
                <input
                  type="text"
                  value={card.badge}
                  onChange={(e) => updateCard(idx, "badge", e.target.value)}
                  placeholder="e.g. BEST DEALS"
                  className="w-full text-xs font-bold px-3 py-2 border border-slate-200 rounded-xl focus:border-[#002D62] focus:ring-1 focus:ring-[#002D62] outline-none"
                />

                {/* Quick badge presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {BADGE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => updateCard(idx, "badge", preset)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all cursor-pointer ${
                        card.badge === preset
                          ? "bg-[#002D62] text-white border-[#002D62]"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">Badge Background</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={card.badgeBg || "#002D62"}
                        onChange={(e) => updateCard(idx, "badgeBg", e.target.value)}
                        className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={card.badgeBg || "#002D62"}
                        onChange={(e) => updateCard(idx, "badgeBg", e.target.value)}
                        className="w-full text-[11px] font-mono px-2 py-1 border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">Badge Text</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={card.badgeText || "#FFFFFF"}
                        onChange={(e) => updateCard(idx, "badgeText", e.target.value)}
                        className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={card.badgeText || "#FFFFFF"}
                        onChange={(e) => updateCard(idx, "badgeText", e.target.value)}
                        className="w-full text-[11px] font-mono px-2 py-1 border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Headings & Subtitle */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Title Line 1 (Main Hook)
                  </label>
                  <input
                    type="text"
                    value={card.titleLine1}
                    onChange={(e) => updateCard(idx, "titleLine1", e.target.value)}
                    placeholder="e.g. Save Up To"
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:border-[#002D62] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Title Line 2 (Second Line Hook)
                  </label>
                  <input
                    type="text"
                    value={card.titleLine2}
                    onChange={(e) => updateCard(idx, "titleLine2", e.target.value)}
                    placeholder="e.g. 50% Off"
                    className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:border-[#002D62] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Subtitle Description
                  </label>
                  <input
                    type="text"
                    value={card.subtitle}
                    onChange={(e) => updateCard(idx, "subtitle", e.target.value)}
                    placeholder="e.g. On Smartphones"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:border-[#002D62] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">Title Color</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={card.textColor || "#002D62"}
                        onChange={(e) => updateCard(idx, "textColor", e.target.value)}
                        className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={card.textColor || "#002D62"}
                        onChange={(e) => updateCard(idx, "textColor", e.target.value)}
                        className="w-full text-[11px] font-mono px-2 py-1 border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">Subtitle Color</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={card.subtitleColor || "#475569"}
                        onChange={(e) => updateCard(idx, "subtitleColor", e.target.value)}
                        className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={card.subtitleColor || "#475569"}
                        onChange={(e) => updateCard(idx, "subtitleColor", e.target.value)}
                        className="w-full text-[11px] font-mono px-2 py-1 border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Button / CTA Settings */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Button Text</label>
                    <input
                      type="text"
                      value={card.ctaText || "Shop Now"}
                      onChange={(e) => updateCard(idx, "ctaText", e.target.value)}
                      placeholder="Shop Now"
                      className="w-full text-xs font-bold px-3 py-2 border border-slate-200 rounded-xl focus:border-[#002D62] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Quick Category</label>
                    <select
                      value={card.ctaLink}
                      onChange={(e) => updateCard(idx, "ctaLink", e.target.value)}
                      className="w-full text-xs font-medium px-2.5 py-2 border border-slate-200 rounded-xl focus:border-[#002D62] outline-none bg-white cursor-pointer"
                    >
                      <option value="/products">All Products</option>
                      {categories.map((c) => (
                        <option key={c.id} value={`/products?category=${encodeURIComponent(c.name)}`}>
                          {c.name}
                        </option>
                      ))}
                      <option value="/#deals">Today's Deals</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Destination URL / Path</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 pl-2">
                      <LinkIcon className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      value={card.ctaLink}
                      onChange={(e) => updateCard(idx, "ctaLink", e.target.value)}
                      placeholder="/products?category=Smartphones"
                      className="w-full text-xs font-mono px-2 py-1.5 border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                </div>

                {/* Button Colors */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">Button Background</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={card.btnBgColor || "#FFBE00"}
                        onChange={(e) => updateCard(idx, "btnBgColor", e.target.value)}
                        className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={card.btnBgColor || "#FFBE00"}
                        onChange={(e) => updateCard(idx, "btnBgColor", e.target.value)}
                        className="w-full text-[11px] font-mono px-2 py-1 border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">Button Text</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={card.btnTextColor || "#020617"}
                        onChange={(e) => updateCard(idx, "btnTextColor", e.target.value)}
                        className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={card.btnTextColor || "#020617"}
                        onChange={(e) => updateCard(idx, "btnTextColor", e.target.value)}
                        className="w-full text-[11px] font-mono px-2 py-1 border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick button color swatches */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-slate-400 font-medium">Presets:</span>
                  {BUTTON_BG_PRESETS.map((btn) => (
                    <button
                      key={btn.value}
                      type="button"
                      onClick={() => {
                        updateCard(idx, "btnBgColor", btn.value);
                        updateCard(idx, "btnTextColor", btn.value === "#FFFFFF" || btn.value === "#FFBE00" ? "#020617" : "#FFFFFF");
                      }}
                      title={btn.label}
                      style={{ backgroundColor: btn.value }}
                      className={`w-5 h-5 rounded-md border border-slate-300 transition-transform cursor-pointer ${
                        card.btnBgColor === btn.value ? "ring-2 ring-blue-500 scale-110" : "hover:scale-105"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* 4. Background Gradient */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Card Background Styling</span>
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                </label>

                {/* Preset Gradient Swatches */}
                <div className="grid grid-cols-2 gap-2">
                  {GRADIENT_PRESETS.slice(0, 4).map((g) => (
                    <button
                      key={g.label}
                      type="button"
                      onClick={() => updateCard(idx, "bgGradient", g.gradient)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        card.bgGradient === g.gradient
                          ? "border-[#002D62] ring-1 ring-[#002D62] bg-blue-50/50"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <span className="w-5 h-5 rounded-lg shadow-xs flex-shrink-0" style={{ background: g.gradient }} />
                      <span className="text-[10px] font-bold text-slate-700 truncate">{g.label.split(" (")[0]}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-500 block mb-1">Custom CSS Gradient or Hex</span>
                  <input
                    type="text"
                    value={card.bgGradient || card.bgColor || ""}
                    onChange={(e) => updateCard(idx, "bgGradient", e.target.value)}
                    placeholder="linear-gradient(135deg, #EAEBFF 0%, #D5DCFF 100%)"
                    className="w-full text-[11px] font-mono px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              {/* 5. Product Image */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Transparent Product Photo</span>
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                </label>

                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 relative overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                    <Image
                      src={card.image}
                      alt="Thumbnail"
                      fill
                      className="object-contain"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <label className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#002D62] border border-blue-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                      {uploadingIdx === idx ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{uploadingIdx === idx ? "Uploading..." : "Upload New Photo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingIdx === idx}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadImage(idx, file);
                        }}
                      />
                    </label>

                    <input
                      type="text"
                      value={card.image}
                      onChange={(e) => updateCard(idx, "image", e.target.value)}
                      placeholder="/vittal/products/iphone-15-transparent.png"
                      className="w-full text-[11px] font-mono px-2 py-1 border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                </div>

                {/* Preset Photos */}
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 block mb-1.5">
                    Fast Preset Studio Cutouts (Transparent PNGs):
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {PHOTO_PRESETS.map((photo) => (
                      <button
                        key={photo.url}
                        type="button"
                        onClick={() => updateCard(idx, "image", photo.url)}
                        title={photo.label}
                        className={`p-1 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          card.image === photo.url
                            ? "border-[#002D62] bg-blue-50/60 ring-1 ring-[#002D62]"
                            : "border-slate-200 hover:border-slate-300 bg-slate-50"
                        }`}
                      >
                        <div className="w-8 h-8 relative">
                          <Image
                            src={photo.url}
                            alt={photo.label}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="text-[9px] font-medium text-slate-600 truncate w-full text-center">
                          {photo.label.split(" ")[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Scale Slider */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>Photo Zoom & Scale</span>
                    <span className="font-mono text-slate-800">{card.imageScale || 100}%</span>
                  </div>
                  <input
                    type="range"
                    min={70}
                    max={130}
                    step={2}
                    value={card.imageScale || 100}
                    onChange={(e) => updateCard(idx, "imageScale", Number(e.target.value))}
                    className="w-full accent-[#002D62] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}