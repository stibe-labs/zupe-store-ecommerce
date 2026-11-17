"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MidPromoCard,
  DEFAULT_MID_PROMO_CARDS,
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
  Tag,
  DollarSign,
  Sliders,
  ZoomIn,
} from "lucide-react";

interface MidPromoCardsCustomizerProps {
  categories: StoreCategory[];
  showToast: (type: "success" | "error", text: string) => void;
}

// Curated Background Presets
const BG_PRESETS = [
  {
    label: "Vittal Navy (Default Card 1 & 3)",
    gradient: "linear-gradient(135deg, #002D62 0%, #001f44 100%)",
    theme: "dark" as const,
    textColor: "#FFFFFF",
    subtitleColor: "#BFDBFE",
    previewBg: "bg-[#002D62]",
  },
  {
    label: "Clean White / Light Slate (Default Card 2)",
    gradient: "linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 50%, #EFF6FF 100%)",
    theme: "light" as const,
    textColor: "#0F172A",
    subtitleColor: "#64748B",
    previewBg: "bg-white border border-slate-200",
  },
  {
    label: "Midnight Obsidian (Dark)",
    gradient: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
    theme: "dark" as const,
    textColor: "#FFFFFF",
    subtitleColor: "#94A3B8",
    previewBg: "bg-slate-900",
  },
  {
    label: "Royal Indigo (Dark)",
    gradient: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)",
    theme: "dark" as const,
    textColor: "#FFFFFF",
    subtitleColor: "#C7D2FE",
    previewBg: "bg-indigo-950",
  },
  {
    label: "Crimson Velvet (Dark)",
    gradient: "linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)",
    theme: "dark" as const,
    textColor: "#FFFFFF",
    subtitleColor: "#FECACA",
    previewBg: "bg-red-900",
  },
  {
    label: "Emerald Deep (Dark)",
    gradient: "linear-gradient(135deg, #064E3B 0%, #065F46 100%)",
    theme: "dark" as const,
    textColor: "#FFFFFF",
    subtitleColor: "#A7F3D0",
    previewBg: "bg-emerald-900",
  },
  {
    label: "Soft Warm Cream (Light)",
    gradient: "linear-gradient(135deg, #FFF4EB 0%, #FCEAE0 100%)",
    theme: "light" as const,
    textColor: "#002D62",
    subtitleColor: "#64748B",
    previewBg: "bg-amber-50 border border-amber-200",
  },
  {
    label: "Sky Breeze (Light)",
    gradient: "linear-gradient(135deg, #E6F3FA 0%, #D8ECF7 100%)",
    theme: "light" as const,
    textColor: "#002D62",
    subtitleColor: "#475569",
    previewBg: "bg-sky-50 border border-sky-200",
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

const FRAME_BG_PRESETS = [
  { label: "Pure White", value: "#FFFFFF" },
  { label: "Light Slate", value: "#F8FAFC" },
  { label: "Soft Cream", value: "#FFFBEB" },
  { label: "Ice Blue", value: "#F0F9FF" },
  { label: "Dark Obsidian", value: "#0F172A" },
];

const PHOTO_PRESETS = [
  { label: "JBL Speaker", url: "/vittal/promo-speaker-nobg.png" },
  { label: "Power Bank 10000mAh", url: "/vittal/promo-powerbank-nobg.png" },
  { label: "PS5 Controller", url: "/vittal/promo-console-nobg.png" },
  { label: "AirPods Pro", url: "/vittal/products/airpods-pro-transparent.png" },
  { label: "iPhone 15 Blue", url: "/vittal/products/iphone-15-transparent.png" },
  { label: "Smartwatch Black", url: "/vittal/products/smart-watch-1-transparent.png" },
  { label: "Smartwatch Pro", url: "/vittal/products/smart-watch-pro-transparent.png" },
  { label: "HP Victus Laptop", url: "/vittal/products/hp-victus-transparent.png" },
  { label: "AirPods Max Silver", url: "/vittal/products/airpods-max-transparent.png" },
];

export function MidPromoCardsCustomizer({
  categories,
  showToast,
}: MidPromoCardsCustomizerProps) {
  const [savedCards, setSavedCards] = useState<MidPromoCard[]>(DEFAULT_MID_PROMO_CARDS);
  const [draftCards, setDraftCards] = useState<MidPromoCard[]>(DEFAULT_MID_PROMO_CARDS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [mobileSlide, setMobileSlide] = useState(0);
  const [activeCardTab, setActiveCardTab] = useState<"all" | "card-0" | "card-1" | "card-2">("all");
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  // Auto-slide preview in mobile mode
  useEffect(() => {
    if (previewDevice !== "mobile") return;
    const timer = setInterval(() => {
      setMobileSlide((prev) => (prev + 1) % draftCards.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [previewDevice, draftCards.length]);

  // Load cards from API on mount
  const loadMidPromoCards = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content/mid-promo-banners");
      const data = await res.json();
      if (data.success && Array.isArray(data.cards) && data.cards.length === 3) {
        setSavedCards(data.cards);
        setDraftCards(data.cards);
      } else {
        setSavedCards(DEFAULT_MID_PROMO_CARDS);
        setDraftCards(DEFAULT_MID_PROMO_CARDS);
      }
    } catch (err: any) {
      console.warn("Failed to load middle promo cards:", err);
      setSavedCards(DEFAULT_MID_PROMO_CARDS);
      setDraftCards(DEFAULT_MID_PROMO_CARDS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMidPromoCards();
  }, []);

  const isDirty = JSON.stringify(savedCards) !== JSON.stringify(draftCards);

  const updateCard = (index: number, field: keyof MidPromoCard, value: any) => {
    setDraftCards((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

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
        showToast("success", "Product image uploaded successfully!");
      } else {
        showToast("error", data.error || "Failed to upload image");
      }
    } catch (err: any) {
      showToast("error", "Image upload failed: " + err.message);
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/content/mid-promo-banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards: draftCards }),
      });

      const data = await res.json();
      if (data.success && data.cards) {
        setSavedCards(data.cards);
        setDraftCards(data.cards);
        showToast("success", "Feature promo cards saved & synced live to website!");
      } else {
        showToast("error", data.error || "Failed to save promo cards");
      }
    } catch (err: any) {
      showToast("error", "Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm("Are you sure you want to reset all 3 feature cards to factory defaults?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/content/mid-promo-banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_defaults" }),
      });

      const data = await res.json();
      if (data.success && data.cards) {
        setSavedCards(data.cards);
        setDraftCards(data.cards);
        showToast("success", "Reset to default feature promo cards successfully!");
      } else {
        setDraftCards(DEFAULT_MID_PROMO_CARDS);
        showToast("success", "Restored local defaults!");
      }
    } catch (err: any) {
      setDraftCards(DEFAULT_MID_PROMO_CARDS);
      showToast("error", "Failed to reset remotely: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <RefreshCw className="w-8 h-8 text-[#FF7A00] animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading Feature Promo Cards...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ========================================================
          TOP ACTION BAR
         ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Feature Promo Cards Customizer</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-[#002D62]">
              3 CARDS (SECTION 6)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Live Website In Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Customize the 3 middle promotional feature cards (Speaker, Power Bank, Console Gear) on the homepage. Edit background themes, CTA styles (Button, Price Tag, or Badge), colors, and product photos with instant live preview.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetDefaults}
            disabled={saving}
            className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Reset to original 3 default cards"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSaveChanges}
            disabled={saving || !isDirty}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
              isDirty
                ? "bg-[#FFBE00] hover:bg-[#E5AA00] text-slate-950 font-extrabold shadow-amber-200 animate-pulse"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving to Cloudflare...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isDirty ? "Save Changes to Live Website" : "Changes Saved"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================
          100% REAL-TIME STOREFRONT PREVIEW
         ======================================================== */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-md text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="text-sm font-bold tracking-wide uppercase text-slate-200">
              100% Real-Time Storefront Preview (Section 6)
            </h3>
            <span className="text-[11px] text-slate-400 font-normal hidden md:inline">
              Simulating exact homepage rendering
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 self-start sm:self-auto">
            <button
              onClick={() => setPreviewDevice("desktop")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                previewDevice === "desktop"
                  ? "bg-[#FFBE00] text-slate-950 shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop View</span>
            </button>
            <button
              onClick={() => setPreviewDevice("mobile")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                previewDevice === "mobile"
                  ? "bg-[#FFBE00] text-slate-950 shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile View</span>
            </button>
          </div>
        </div>

        {/* Desktop Preview */}
        {previewDevice === "desktop" && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-inner">
            <div className="text-[11px] text-slate-400 font-semibold mb-3 flex items-center justify-between">
              <span>Homepage Section 6 Container (3-Column Grid)</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Desktop View</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {draftCards.map((card, idx) => {
                const hasCustomBg = card.bgGradient?.includes("gradient") || card.bgGradient?.startsWith("#") || card.bgColor;
                return (
                  <div
                    key={card.id || idx}
                    style={{
                      background: hasCustomBg ? (card.bgGradient || card.bgColor) : undefined,
                    }}
                    className={`relative rounded-2xl overflow-hidden ${!hasCustomBg ? (card.cardBg || "bg-[#002D62]") : ""} ${
                      card.theme === "dark" ? "text-white" : "text-slate-900"
                    } p-6 sm:p-7 flex items-center justify-between gap-4 min-h-[175px] shadow-sm hover:shadow-md transition-all border border-slate-200/50 group`}
                  >
                    <div className="z-10 flex-1 max-w-[210px]">
                      <h3
                        style={{ color: card.textColor }}
                        className="text-lg sm:text-xl font-bold leading-tight"
                      >
                        {card.titleLine1} {card.titleLine2}
                      </h3>
                      <p
                        style={{ color: card.subtitleColor }}
                        className="text-xs mt-1 font-medium"
                      >
                        {card.subtitle}
                      </p>

                      {card.ctaType === "button" && (
                        <div
                          style={{
                            backgroundColor: card.btnBgColor || "#FFBE00",
                            color: card.btnTextColor || "#020617",
                          }}
                          className="inline-flex items-center gap-1.5 mt-4 font-bold text-xs px-4 py-2 rounded-md transition-colors shadow-xs w-fit"
                        >
                          <span>{card.ctaText || "Shop Now"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      )}

                      {card.ctaType === "price" && (
                        <div className="block mt-3">
                          <p
                            style={{
                              color: card.priceColor || (card.theme === "dark" ? "#FFFFFF" : "#0F172A"),
                            }}
                            className="text-2xl font-bold"
                          >
                            {card.priceText || "₹799"}
                          </p>
                        </div>
                      )}

                      {card.ctaType === "badge" && (
                        <div className="inline-block mt-3.5">
                          <span
                            style={{
                              backgroundColor: card.badgeBgColor || "#FFBE00",
                              color: card.badgeTextColor || "#020617",
                            }}
                            className="font-bold text-xs px-3.5 py-1.5 rounded-md inline-block shadow-xs"
                          >
                            {card.badgeText || "Up to 30% Off"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Round-edged white frame containing background-removed product image */}
                    <div
                      style={{ backgroundColor: card.imageBg || "#FFFFFF" }}
                      className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl shadow-md border border-slate-100 flex items-center justify-center p-2.5 overflow-hidden shrink-0 group-hover:scale-105 transition-transform"
                    >
                      <Image
                        src={card.image}
                        alt={card.imageAlt || card.titleLine1}
                        fill
                        sizes="128px"
                        style={{ transform: card.imageScale ? `scale(${card.imageScale / 100})` : undefined }}
                        className="object-contain p-2 drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mobile Preview */}
        {previewDevice === "mobile" && (
          <div className="flex flex-col items-center py-4">
            <div className="w-[340px] bg-slate-950 rounded-[40px] p-3 shadow-2xl border-4 border-slate-700">
              {/* Notch */}
              <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
              </div>

              {/* Mobile Screen */}
              <div className="bg-white rounded-[28px] p-3 overflow-hidden">
                <div className="text-[10px] text-slate-400 font-semibold mb-2 flex items-center justify-between">
                  <span>Mobile Homepage Preview</span>
                  <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                    Auto-slides every 3s
                  </span>
                </div>

                {(() => {
                  const currentCard = draftCards[mobileSlide] || draftCards[0];
                  const hasCustomBg =
                    currentCard.bgGradient?.includes("gradient") ||
                    currentCard.bgGradient?.startsWith("#") ||
                    currentCard.bgColor;

                  return (
                    <div
                      style={{
                        background: hasCustomBg ? (currentCard.bgGradient || currentCard.bgColor) : undefined,
                      }}
                      className={`relative rounded-2xl overflow-hidden ${
                        !hasCustomBg ? (currentCard.cardBg || "bg-[#002D62]") : ""
                      } ${
                        currentCard.theme === "dark" ? "text-white" : "text-slate-900"
                      } p-5 flex items-center justify-between gap-3 min-h-[160px] shadow-sm`}
                    >
                      <div className="z-10 flex-1 max-w-[170px]">
                        <h3
                          style={{ color: currentCard.textColor }}
                          className="text-base font-bold leading-tight"
                        >
                          {currentCard.titleLine1} {currentCard.titleLine2}
                        </h3>
                        <p
                          style={{ color: currentCard.subtitleColor }}
                          className="text-[11px] mt-1 font-medium"
                        >
                          {currentCard.subtitle}
                        </p>

                        {currentCard.ctaType === "button" && (
                          <div
                            style={{
                              backgroundColor: currentCard.btnBgColor || "#FFBE00",
                              color: currentCard.btnTextColor || "#020617",
                            }}
                            className="inline-flex items-center gap-1.5 mt-3.5 font-bold text-xs px-3.5 py-1.5 rounded-md shadow-xs w-fit"
                          >
                            <span>{currentCard.ctaText || "Shop Now"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        )}

                        {currentCard.ctaType === "price" && (
                          <div className="block mt-2.5">
                            <p
                              style={{
                                color: currentCard.priceColor || (currentCard.theme === "dark" ? "#FFFFFF" : "#0F172A"),
                              }}
                              className="text-xl font-bold"
                            >
                              {currentCard.priceText || "₹799"}
                            </p>
                          </div>
                        )}

                        {currentCard.ctaType === "badge" && (
                          <div className="inline-block mt-3">
                            <span
                              style={{
                                backgroundColor: currentCard.badgeBgColor || "#FFBE00",
                                color: currentCard.badgeTextColor || "#020617",
                              }}
                              className="font-bold text-xs px-3 py-1 rounded-md inline-block shadow-xs"
                            >
                              {currentCard.badgeText || "Up to 30% Off"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Mobile White Squircle Container */}
                      <div
                        style={{ backgroundColor: currentCard.imageBg || "#FFFFFF" }}
                        className="relative w-24 h-24 rounded-2xl shadow-md border border-slate-100 flex items-center justify-center p-2 overflow-hidden shrink-0"
                      >
                        <Image
                          src={currentCard.image}
                          alt={currentCard.imageAlt || currentCard.titleLine1}
                          fill
                          sizes="96px"
                          style={{ transform: currentCard.imageScale ? `scale(${currentCard.imageScale / 100})` : undefined }}
                          className="object-contain p-1.5 drop-shadow-sm"
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* 3 Dot Navigation */}
                <div className="flex items-center justify-center gap-2 mt-3 mb-1">
                  {draftCards.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMobileSlide(idx)}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        idx === mobileSlide
                          ? "w-6 h-2 bg-[#002D62]"
                          : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Home bar */}
              <div className="w-28 h-1 bg-slate-700 rounded-full mx-auto mt-2" />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          CARD SELECTOR TABS
         ======================================================== */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveCardTab("all")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeCardTab === "all"
              ? "bg-[#002D62] text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All 3 Cards Side-by-Side</span>
        </button>

        {draftCards.map((c, idx) => (
          <button
            key={c.id || idx}
            onClick={() => setActiveCardTab(`card-${idx}` as any)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeCardTab === `card-${idx}`
                ? "bg-[#002D62] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
              {idx + 1}
            </span>
            <span>Card {idx + 1}: {c.titleLine1} {c.titleLine2}</span>
          </button>
        ))}
      </div>

      {/* ========================================================
          CARD EDITORS (Side-by-side or Single Tab)
         ======================================================== */}
      <div className={`grid gap-6 ${activeCardTab === "all" ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 max-w-3xl mx-auto"}`}>
        {draftCards.map((card, idx) => {
          if (activeCardTab !== "all" && activeCardTab !== `card-${idx}`) return null;

          return (
            <div
              key={card.id || idx}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col"
            >
              {/* Card Header */}
              <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#002D62] text-white text-xs font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Card {idx + 1}: {card.titleLine1} {card.titleLine2}
                    </h4>
                    <p className="text-[11px] text-slate-500">CTA: {card.ctaType.toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-700">
                    {card.theme === "dark" ? "Dark Theme" : "Light Theme"}
                  </span>
                </div>
              </div>

              {/* Form Controls */}
              <div className="p-5 space-y-5 flex-1 text-xs">
                {/* 1. Theme & Background */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-blue-600" />
                      <span>Background & Theme</span>
                    </label>
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                      <button
                        onClick={() => {
                          updateCard(idx, "theme", "dark");
                          updateCard(idx, "textColor", "#FFFFFF");
                          updateCard(idx, "subtitleColor", "#BFDBFE");
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                          card.theme === "dark" ? "bg-[#002D62] text-white" : "text-slate-500"
                        }`}
                      >
                        Dark
                      </button>
                      <button
                        onClick={() => {
                          updateCard(idx, "theme", "light");
                          updateCard(idx, "textColor", "#0F172A");
                          updateCard(idx, "subtitleColor", "#64748B");
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                          card.theme === "light" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                        }`}
                      >
                        Light
                      </button>
                    </div>
                  </div>

                  {/* Gradient Presets */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {BG_PRESETS.map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => {
                          updateCard(idx, "bgGradient", preset.gradient);
                          updateCard(idx, "theme", preset.theme);
                          updateCard(idx, "textColor", preset.textColor);
                          updateCard(idx, "subtitleColor", preset.subtitleColor);
                        }}
                        className={`h-8 rounded-lg border text-[9px] font-bold p-1 text-left overflow-hidden transition-all cursor-pointer relative ${
                          preset.previewBg
                        } ${
                          card.bgGradient === preset.gradient ? "ring-2 ring-[#002D62] scale-102" : "hover:scale-102"
                        }`}
                        title={preset.label}
                      >
                        {card.bgGradient === preset.gradient && (
                          <Check className={`w-3 h-3 absolute top-1 right-1 ${preset.theme === "dark" ? "text-white" : "text-slate-900"}`} />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Custom CSS gradient string or hex */}
                  <div className="mt-1.5">
                    <input
                      type="text"
                      value={card.bgGradient || card.bgColor || ""}
                      onChange={(e) => {
                        updateCard(idx, "bgGradient", e.target.value);
                        updateCard(idx, "bgColor", e.target.value);
                      }}
                      placeholder="linear-gradient(...) or #002D62"
                      className="w-full px-2.5 py-1.5 text-[11px] font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* 2. Headings & Typography */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <label className="font-bold text-slate-800">Heading & Subtitle</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium">Title Line 1</span>
                      <input
                        type="text"
                        value={card.titleLine1}
                        onChange={(e) => updateCard(idx, "titleLine1", e.target.value)}
                        className="w-full px-2.5 py-1.5 font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium">Title Line 2</span>
                      <input
                        type="text"
                        value={card.titleLine2}
                        onChange={(e) => updateCard(idx, "titleLine2", e.target.value)}
                        className="w-full px-2.5 py-1.5 font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-medium shrink-0">Heading Color:</span>
                    <input
                      type="color"
                      value={card.textColor || (card.theme === "dark" ? "#FFFFFF" : "#0F172A")}
                      onChange={(e) => updateCard(idx, "textColor", e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border border-slate-300 p-0"
                    />
                    <span className="font-mono text-[10px] text-slate-600">{card.textColor}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">Subtitle Description</span>
                    <input
                      type="text"
                      value={card.subtitle}
                      onChange={(e) => updateCard(idx, "subtitle", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-medium shrink-0">Subtitle Color:</span>
                    <input
                      type="color"
                      value={card.subtitleColor || (card.theme === "dark" ? "#BFDBFE" : "#64748B")}
                      onChange={(e) => updateCard(idx, "subtitleColor", e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border border-slate-300 p-0"
                    />
                    <span className="font-mono text-[10px] text-slate-600">{card.subtitleColor}</span>
                  </div>
                </div>

                {/* 3. Call to Action (CTA Style Selector) */}
                <div className="space-y-3 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-500" />
                      <span>Call to Action Style</span>
                    </label>
                  </div>

                  {/* 3 Segmented Toggle */}
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => updateCard(idx, "ctaType", "button")}
                      className={`py-1.5 text-center font-bold text-[11px] rounded-lg transition-all cursor-pointer ${
                        card.ctaType === "button"
                          ? "bg-white text-slate-950 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Button
                    </button>
                    <button
                      onClick={() => updateCard(idx, "ctaType", "price")}
                      className={`py-1.5 text-center font-bold text-[11px] rounded-lg transition-all cursor-pointer ${
                        card.ctaType === "price"
                          ? "bg-white text-slate-950 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Price Tag
                    </button>
                    <button
                      onClick={() => updateCard(idx, "ctaType", "badge")}
                      className={`py-1.5 text-center font-bold text-[11px] rounded-lg transition-all cursor-pointer ${
                        card.ctaType === "badge"
                          ? "bg-white text-slate-950 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Promo Tag
                    </button>
                  </div>

                  {/* Fields based on CTA Type */}
                  {card.ctaType === "button" && (
                    <div className="space-y-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                      <div>
                        <span className="text-[10px] text-slate-600 font-medium">Button Label</span>
                        <input
                          type="text"
                          value={card.ctaText || "Shop Now"}
                          onChange={(e) => updateCard(idx, "ctaText", e.target.value)}
                          className="w-full px-2.5 py-1.5 font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-600 font-medium">Button Bg</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <input
                              type="color"
                              value={card.btnBgColor || "#FFBE00"}
                              onChange={(e) => updateCard(idx, "btnBgColor", e.target.value)}
                              className="w-6 h-6 rounded cursor-pointer border border-slate-300 p-0"
                            />
                            <input
                              type="text"
                              value={card.btnBgColor || "#FFBE00"}
                              onChange={(e) => updateCard(idx, "btnBgColor", e.target.value)}
                              className="w-full px-2 py-1 text-[10px] font-mono rounded border border-slate-300"
                            />
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-600 font-medium">Text Color</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <input
                              type="color"
                              value={card.btnTextColor || "#020617"}
                              onChange={(e) => updateCard(idx, "btnTextColor", e.target.value)}
                              className="w-6 h-6 rounded cursor-pointer border border-slate-300 p-0"
                            />
                            <input
                              type="text"
                              value={card.btnTextColor || "#020617"}
                              onChange={(e) => updateCard(idx, "btnTextColor", e.target.value)}
                              className="w-full px-2 py-1 text-[10px] font-mono rounded border border-slate-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {card.ctaType === "price" && (
                    <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-600 font-medium">Price Tag Display</span>
                        <input
                          type="text"
                          value={card.priceText || "₹799"}
                          onChange={(e) => updateCard(idx, "priceText", e.target.value)}
                          placeholder="e.g. ₹799 or From ₹499"
                          className="w-full px-2.5 py-1.5 font-bold text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-600 font-medium">Price Text Color:</span>
                        <input
                          type="color"
                          value={card.priceColor || (card.theme === "dark" ? "#FFFFFF" : "#0F172A")}
                          onChange={(e) => updateCard(idx, "priceColor", e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border border-slate-300 p-0"
                        />
                        <span className="font-mono text-[10px] text-slate-600">{card.priceColor || "#0F172A"}</span>
                      </div>
                    </div>
                  )}

                  {card.ctaType === "badge" && (
                    <div className="space-y-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                      <div>
                        <span className="text-[10px] text-slate-600 font-medium">Promo Badge Label</span>
                        <input
                          type="text"
                          value={card.badgeText || "Up to 30% Off"}
                          onChange={(e) => updateCard(idx, "badgeText", e.target.value)}
                          placeholder="e.g. Up to 30% Off"
                          className="w-full px-2.5 py-1.5 font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-600 font-medium">Badge Bg</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <input
                              type="color"
                              value={card.badgeBgColor || "#FFBE00"}
                              onChange={(e) => updateCard(idx, "badgeBgColor", e.target.value)}
                              className="w-6 h-6 rounded cursor-pointer border border-slate-300 p-0"
                            />
                            <input
                              type="text"
                              value={card.badgeBgColor || "#FFBE00"}
                              onChange={(e) => updateCard(idx, "badgeBgColor", e.target.value)}
                              className="w-full px-2 py-1 text-[10px] font-mono rounded border border-slate-300"
                            />
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-600 font-medium">Text Color</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <input
                              type="color"
                              value={card.badgeTextColor || "#020617"}
                              onChange={(e) => updateCard(idx, "badgeTextColor", e.target.value)}
                              className="w-6 h-6 rounded cursor-pointer border border-slate-300 p-0"
                            />
                            <input
                              type="text"
                              value={card.badgeTextColor || "#020617"}
                              onChange={(e) => updateCard(idx, "badgeTextColor", e.target.value)}
                              className="w-full px-2 py-1 text-[10px] font-mono rounded border border-slate-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Destination Link */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">Redirect Category / Link</span>
                    <div className="space-y-1.5 mt-1">
                      <select
                        value={card.ctaLink}
                        onChange={(e) => updateCard(idx, "ctaLink", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">-- Choose Category Shortcut --</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={`/products?category=${encodeURIComponent(cat.name)}`}>
                            Category: {cat.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={card.ctaLink}
                        onChange={(e) => updateCard(idx, "ctaLink", e.target.value)}
                        placeholder="/products?category=..."
                        className="w-full px-2.5 py-1.5 font-mono text-[11px] rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Product Photo & White Squircle Frame */}
                <div className="space-y-3 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Product Image & Squircle Frame</span>
                    </label>
                  </div>

                  {/* Current image preview + Upload button */}
                  <div className="flex items-center gap-3">
                    <div
                      style={{ backgroundColor: card.imageBg || "#FFFFFF" }}
                      className="relative w-16 h-16 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden shrink-0"
                    >
                      <Image
                        src={card.image}
                        alt="Current"
                        fill
                        className="object-contain p-1.5"
                      />
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] cursor-pointer transition-colors border border-indigo-200">
                        <Upload className="w-3 h-3" />
                        <span>{uploadingIdx === idx ? "Uploading..." : "Upload Cutout PNG"}</span>
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
                      <p className="text-[10px] text-slate-400">
                        Saved to Cloudflare R2 bucket. Transparent PNG recommended.
                      </p>
                    </div>
                  </div>

                  {/* Image URL input */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">Direct Image URL</span>
                    <input
                      type="text"
                      value={card.image}
                      onChange={(e) => updateCard(idx, "image", e.target.value)}
                      placeholder="/vittal/..."
                      className="w-full px-2.5 py-1.5 text-[11px] font-mono rounded-lg border border-slate-300"
                    />
                  </div>

                  {/* Preset Photos */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">Quick Photo Presets</span>
                    <div className="grid grid-cols-3 gap-1.5 mt-1">
                      {PHOTO_PRESETS.map((p, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => {
                            updateCard(idx, "image", p.url);
                            updateCard(idx, "imageAlt", p.label);
                          }}
                          className={`p-1 rounded-lg border text-[10px] text-left truncate flex items-center gap-1.5 transition-all cursor-pointer ${
                            card.image === p.url
                              ? "bg-indigo-50 border-indigo-300 font-bold text-indigo-900"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white"
                          }`}
                        >
                          <div className="w-5 h-5 relative shrink-0">
                            <Image src={p.url} alt="" fill className="object-contain" />
                          </div>
                          <span className="truncate">{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Frame Background Color */}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-medium">Squircle Frame Background</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={card.imageBg || "#FFFFFF"}
                          onChange={(e) => updateCard(idx, "imageBg", e.target.value)}
                          className="w-5 h-5 rounded cursor-pointer border border-slate-300 p-0"
                        />
                        <span className="font-mono text-[10px] text-slate-600">{card.imageBg || "#FFFFFF"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      {FRAME_BG_PRESETS.map((fb, fbIdx) => (
                        <button
                          key={fbIdx}
                          onClick={() => updateCard(idx, "imageBg", fb.value)}
                          className={`px-2 py-1 text-[9px] font-bold rounded border cursor-pointer ${
                            card.imageBg === fb.value ? "ring-2 ring-[#002D62] border-transparent" : "border-slate-200"
                          }`}
                          style={{ backgroundColor: fb.value, color: fb.value === "#0F172A" ? "#FFF" : "#000" }}
                        >
                          {fb.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image Scale Slider */}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-medium">Product Zoom / Scale</span>
                      <span className="font-mono text-[10px] font-bold text-indigo-700">
                        {card.imageScale || 100}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="range"
                        min="50"
                        max="150"
                        step="5"
                        value={card.imageScale || 100}
                        onChange={(e) => updateCard(idx, "imageScale", parseInt(e.target.value, 10))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => updateCard(idx, "imageScale", 100)}
                        className="text-[9px] font-bold text-slate-500 hover:text-slate-800 px-1.5 py-0.5 rounded border border-slate-200 cursor-pointer shrink-0"
                      >
                        100%
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
