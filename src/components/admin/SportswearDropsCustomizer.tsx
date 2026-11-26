"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  SportswearCampaignConfig,
  SportswearCard,
  DEFAULT_SPORTSWEAR_CAMPAIGN,
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
  ShoppingBag,
  MousePointer,
  Hash,
  Type,
} from "lucide-react";

interface SportswearDropsCustomizerProps {
  categories?: StoreCategory[];
  showToast: (type: "success" | "error", text: string) => void;
}

const IMAGE_PRESETS = [
  { label: "Teveo Runner (Default Card 1)", url: "/vittal/drop-teveo-run.jpg" },
  { label: "Mountain Trekker (Default Card 2)", url: "/vittal/drop-mountain.jpg" },
  { label: "Fitness Runner (Default Card 3)", url: "/vittal/drop-run-fitness.jpg" },
  { label: "Performance Jackets Cutout", url: "/vittal/drop-jackets.png" },
  { label: "Active Joggers Cutout", url: "/vittal/drop-joggers.png" },
  { label: "Gym Performance Tees Cutout", url: "/vittal/drop-tees.png" },
  { label: "Activewear Duo Cutout", url: "/vittal/cutout-fitness-duo.png" },
  { label: "Athlete Strength Cutout", url: "/vittal/cutout-athlete-supplements.png" },
];

const HASHTAG_PRESETS = [
  "#ENGINEEREDFOREVERYMOVE",
  "#VITTALFITNESS",
  "#PERFORMANCEDRIVEN",
  "#LIMITLESSMOVEMENT",
  "#CURATEDSPORTSWEAR",
  "#BEYONDLIMITS",
];

const REDIRECT_PRESETS = [
  { label: "Outfits", url: "/products?category=Outfits" },
  { label: "Apparels", url: "/products?category=Apparels" },
  { label: "Gym Supplements", url: "/products?category=Gym+Supplements" },
  { label: "Dates & Nuts", url: "/products?category=Dates+%26+Nuts" },
  { label: "Candy & Chocolates", url: "/products?category=Candy+%26+Chocolates" },
  { label: "All Products", url: "/products" },
];

export function SportswearDropsCustomizer({
  categories = [],
  showToast,
}: SportswearDropsCustomizerProps) {
  const [savedConfig, setSavedConfig] = useState<SportswearCampaignConfig>(DEFAULT_SPORTSWEAR_CAMPAIGN);
  const [draftConfig, setDraftConfig] = useState<SportswearCampaignConfig>(DEFAULT_SPORTSWEAR_CAMPAIGN);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Active card selected for editing (0, 1, 2)
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);

  // Preview device mode: desktop vs mobile
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Control View Tab: desktop vs mobile
  const [controlViewTab, setControlViewTab] = useState<"desktop" | "mobile">("desktop");

  // Mouse Drag state for interactive frame dragging
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; initialOffsetX: number; initialOffsetY: number } | null>(null);

  // Load campaign config from API
  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content/sportswear-drops");
      const data = await res.json();
      if (data.success && data.config) {
        setSavedConfig(data.config);
        setDraftConfig(data.config);
      }
    } catch (err) {
      console.error("Failed to fetch sportswear campaign:", err);
      showToast("error", "Failed to load sportswear drops from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const isDirty = JSON.stringify(savedConfig) !== JSON.stringify(draftConfig);

  const currentCard = draftConfig.cards[selectedCardIndex] || draftConfig.cards[0];

  // Helper to update a field on the current active card
  const handleUpdateCurrentCard = (field: keyof SportswearCard, value: any) => {
    setDraftConfig((prev) => ({
      ...prev,
      cards: prev.cards.map((c, idx) =>
        idx === selectedCardIndex ? { ...c, [field]: value } : c
      ),
    }));
  };

  // Helper to update banner headers
  const handleUpdateBanner = (field: keyof SportswearCampaignConfig, value: string) => {
    setDraftConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Image Upload helper (supports R2 + local fallback)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    // 1. Instant local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        handleUpdateCurrentCard("image", dataUrl);
      }
    };
    reader.readAsDataURL(file);

    // 2. Upload to Cloudflare R2 bucket via /api/admin/upload
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
        handleUpdateCurrentCard("image", data.url);
        showToast("success", "Card image uploaded to cloud storage!");
      }
    } catch (err) {
      console.warn("Upload failed, keeping local preview:", err);
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  // Save changes to database
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/content/sportswear-drops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: draftConfig }),
      });
      const data = await res.json();
      if (data.success && data.config) {
        setSavedConfig(data.config);
        setDraftConfig(data.config);
        showToast("success", "Sportswear drops saved and live on website!");

        // Dispatch custom event for real-time live preview on storefront
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("vittal_sportswear_updated", {
              detail: { config: data.config },
            })
          );
        }
      } else {
        showToast("error", data.error || "Failed to save changes");
      }
    } catch (err: any) {
      showToast("error", err.message || "Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  // Reset defaults
  const handleResetDefaults = async () => {
    if (!confirm("Are you sure you want to reset Sportswear Drops to default brand values?")) {
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/content/sportswear-drops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_defaults" }),
      });
      const data = await res.json();
      if (data.success && data.config) {
        setSavedConfig(data.config);
        setDraftConfig(data.config);
        showToast("success", "Reset to original defaults successfully!");
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("vittal_sportswear_updated", {
              detail: { config: data.config },
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

  // Interactive Drag Event Handlers
  const handleFrameMouseDown = (e: React.MouseEvent, cardIndex: number) => {
    if (cardIndex !== selectedCardIndex) {
      setSelectedCardIndex(cardIndex);
    }
    setIsDragging(true);

    const isDesktopTab = controlViewTab === "desktop";
    const targetCard = draftConfig.cards[cardIndex];
    const initialOffsetX = isDesktopTab
      ? targetCard.desktopOffsetX ?? 0
      : targetCard.mobileOffsetX ?? 0;
    const initialOffsetY = isDesktopTab
      ? targetCard.desktopOffsetY ?? 0
      : targetCard.mobileOffsetY ?? 0;

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialOffsetX,
      initialOffsetY,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      const newOffsetX = Math.max(-200, Math.min(200, Math.round(dragStartRef.current.initialOffsetX + dx)));
      const newOffsetY = Math.max(-200, Math.min(200, Math.round(dragStartRef.current.initialOffsetY + dy)));

      const isDesktopTab = controlViewTab === "desktop";
      handleUpdateCurrentCard(isDesktopTab ? "desktopOffsetX" : "mobileOffsetX", newOffsetX);
      handleUpdateCurrentCard(isDesktopTab ? "desktopOffsetY" : "mobileOffsetY", newOffsetY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, controlViewTab, selectedCardIndex]);

  const isDesktopControl = controlViewTab === "desktop";
  const activeScale = isDesktopControl
    ? currentCard?.desktopScale ?? 100
    : currentCard?.mobileScale ?? 100;
  const activeOffsetX = isDesktopControl
    ? currentCard?.desktopOffsetX ?? 0
    : currentCard?.mobileOffsetX ?? 0;
  const activeOffsetY = isDesktopControl
    ? currentCard?.desktopOffsetY ?? 0
    : currentCard?.mobileOffsetY ?? 0;

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#0B5D44]" />
        <span className="font-mograph font-medium">Loading Sportswear Drops customizer...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#E6F4EF] text-[#074230]">
              <ShoppingBag className="w-5 h-5 text-[#0B5D44]" />
            </span>
            <h2 className="text-lg font-black text-slate-900 tracking-tight font-movault">
              Sportswear Drops Cards Customizer
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E6F4EF] text-[#074230]">
              3 Active Cards
            </span>
            {isDirty ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
                Unsaved Changes
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live In Sync
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-mograph">
            Customize the upper campaign banner, hashtags, and each card&apos;s image framing (drag &amp; zoom), headings, prices, and redirect links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={saving}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
              isDirty
                ? "bg-[#0B5D44] hover:bg-[#074230] text-white shadow-[#0B5D44]/20"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes to Live Website</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Interactive Live Preview */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#0B5D44]" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 font-movault">
              Live Interactive Preview:
            </span>
            <span className="text-xs font-bold text-[#0B5D44] bg-[#E6F4EF]/60 px-2 py-0.5 rounded-md">
              Editing: {currentCard?.title || `Card #${selectedCardIndex + 1}`}
            </span>
          </div>

          {/* Viewport switch: Desktop vs Mobile */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setPreviewDevice("desktop");
                setControlViewTab("desktop");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                previewDevice === "desktop"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                previewDevice === "mobile"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile View</span>
            </button>
          </div>
        </div>

        {/* Live Preview Canvas Container */}
        <div className="bg-neutral-50 rounded-2xl p-4 sm:p-6 border border-neutral-200/80 overflow-hidden">
          <div
            className={`mx-auto transition-all duration-300 ${
              previewDevice === "mobile" ? "max-w-[420px]" : "w-full max-w-[1200px]"
            }`}
          >
            {/* Top Campaign Header Banner Preview (Editorial Obsidian Pine & Champagne Gold) */}
            <div className={`relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-[#061812] via-[#09241B] to-[#0B5D44] border border-[#C59B27]/30 text-center mb-4 shadow-[0_12px_32px_rgba(6,24,18,0.16)] ${
              previewDevice === "mobile" ? "p-4 sm:p-5" : "p-5 sm:p-7 md:p-8"
            }`}>
              <div aria-hidden="true" className="absolute inset-x-12 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#E5C469]/60 to-transparent" />
              <h3 className={`relative font-movault font-extrabold text-white tracking-[-0.02em] mb-1.5 ${
                previewDevice === "mobile" ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl md:text-4xl"
              }`}>
                {draftConfig.bannerHeadingPrefix ?? "Fresh"}{" "}
                <span className="font-mograph italic font-bold text-[#E5C469]">
                  {draftConfig.bannerHeadingHighlight ?? "Sportswear"}
                </span>{" "}
                {draftConfig.bannerHeadingSuffix ?? "Drops"}
              </h3>
              <p className="relative font-mono text-[10px] sm:text-xs font-semibold text-[#A7F3D0] tracking-[0.24em] uppercase">
                {draftConfig.bannerHashtag ?? "#EngineeredForEveryMove"}
              </p>
            </div>

            {/* Desktop Layout Cards Preview (hidden if previewDevice === 'mobile') */}
            {previewDevice === "desktop" && (
              <div className="flex flex-row gap-3.5 w-full items-stretch">
                {/* Card 1: Wide Card */}
                {(() => {
                  const card = draftConfig.cards[0] || DEFAULT_SPORTSWEAR_CAMPAIGN.cards[0];
                  const isSelected = selectedCardIndex === 0;
                  const scale = (card.desktopScale ?? 100) / 100;
                  const offX = card.desktopOffsetX ?? 0;
                  const offY = card.desktopOffsetY ?? 0;

                  return (
                    <div
                      onClick={() => setSelectedCardIndex(0)}
                      className={`group w-[43%] rounded-2xl bg-white border p-4 flex flex-row items-stretch justify-between gap-4 transition-all duration-200 cursor-pointer relative ${
                        isSelected
                          ? "border-[#0B5D44] ring-2 ring-[#0B5D44]/30 shadow-md"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-[#0B5D44] text-white text-[10px] font-black uppercase tracking-wider shadow-xs z-20">
                          Active Selection
                        </span>
                      )}

                      {/* Left: Text Info */}
                      <div className="flex flex-col justify-between py-1 pr-2 flex-1 min-w-0">
                        <h4 className="font-movault text-lg lg:text-xl font-black uppercase italic tracking-wide text-neutral-950 leading-tight mb-2">
                          {card.title}
                        </h4>
                        <div className="mt-auto">
                          <span className="font-mograph text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mb-0.5">
                            {card.priceLabel || "Starting At"}
                          </span>
                          <span className="font-movault text-xl lg:text-2xl font-black text-[#0B5D44] tracking-tight">
                            {card.price}
                          </span>
                        </div>
                      </div>

                      {/* Right: Inner Image with Drag & Positioning */}
                      <div
                        onMouseDown={(e) => handleFrameMouseDown(e, 0)}
                        className={`relative w-[48%] self-stretch min-h-[180px] rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200/60 select-none ${
                          isSelected ? (isDragging ? "cursor-grabbing" : "cursor-grab ring-1 ring-[#0B5D44]") : ""
                        }`}
                        title="Click and drag to position image inside frame"
                      >
                        <div
                          className="absolute inset-0 transition-transform"
                          style={{
                            transform: `translate(${offX}px, ${offY}px) scale(${scale})`,
                            transformOrigin: "center center",
                          }}
                        >
                          <Image
                            src={card.image}
                            alt={card.title}
                            fill
                            draggable={false}
                            className="object-cover object-center pointer-events-none"
                            sizes="250px"
                          />
                        </div>

                        {isSelected && (
                          <div className="absolute inset-x-0 bottom-1 flex justify-center pointer-events-none">
                            <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold flex items-center gap-1 shadow-xs">
                              <MousePointer className="w-2.5 h-2.5" />
                              <span>Drag to move</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Card 2: Jackets & Track Pants */}
                {(() => {
                  const card = draftConfig.cards[1] || DEFAULT_SPORTSWEAR_CAMPAIGN.cards[1];
                  const isSelected = selectedCardIndex === 1;
                  const scale = (card.desktopScale ?? 100) / 100;
                  const offX = card.desktopOffsetX ?? 0;
                  const offY = card.desktopOffsetY ?? 0;

                  return (
                    <div
                      onClick={() => setSelectedCardIndex(1)}
                      className={`group w-[28.5%] rounded-2xl bg-white border p-4 flex flex-col justify-between gap-3 transition-all duration-200 cursor-pointer relative ${
                        isSelected
                          ? "border-[#0B5D44] ring-2 ring-[#0B5D44]/30 shadow-md"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-[#0B5D44] text-white text-[10px] font-black uppercase tracking-wider shadow-xs z-20">
                          Active Selection
                        </span>
                      )}

                      {/* Top: Inner Image with Drag */}
                      <div
                        onMouseDown={(e) => handleFrameMouseDown(e, 1)}
                        className={`relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200/60 shrink-0 select-none ${
                          isSelected ? (isDragging ? "cursor-grabbing" : "cursor-grab ring-1 ring-[#0B5D44]") : ""
                        }`}
                        title="Click and drag to position image inside frame"
                      >
                        <div
                          className="absolute inset-0 transition-transform"
                          style={{
                            transform: `translate(${offX}px, ${offY}px) scale(${scale})`,
                            transformOrigin: "center center",
                          }}
                        >
                          <Image
                            src={card.image}
                            alt={card.title}
                            fill
                            draggable={false}
                            className="object-cover object-center pointer-events-none"
                            sizes="200px"
                          />
                        </div>

                        {isSelected && (
                          <div className="absolute inset-x-0 bottom-1 flex justify-center pointer-events-none">
                            <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold flex items-center gap-1 shadow-xs">
                              <MousePointer className="w-2.5 h-2.5" />
                              <span>Drag to move</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Bottom: Text Info & Arrow */}
                      <div className="flex items-end justify-between gap-2 mt-auto pt-1">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-movault text-xs lg:text-sm font-black uppercase tracking-wide text-neutral-950 leading-tight mb-0.5 truncate">
                            {card.title}
                          </h4>
                          <span className="font-mograph text-[9px] text-neutral-500 font-bold uppercase tracking-wider block mb-0.5">
                            {card.priceLabel || "Starting At"}
                          </span>
                          <span className="font-movault text-base lg:text-lg font-black text-[#0B5D44] tracking-tight">
                            {card.price}
                          </span>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-neutral-900 stroke-[2.5] shrink-0 mb-0.5" />
                      </div>
                    </div>
                  );
                })()}

                {/* Card 3: Shorts */}
                {(() => {
                  const card = draftConfig.cards[2] || DEFAULT_SPORTSWEAR_CAMPAIGN.cards[2];
                  const isSelected = selectedCardIndex === 2;
                  const scale = (card.desktopScale ?? 100) / 100;
                  const offX = card.desktopOffsetX ?? 0;
                  const offY = card.desktopOffsetY ?? 0;

                  return (
                    <div
                      onClick={() => setSelectedCardIndex(2)}
                      className={`group w-[28.5%] rounded-2xl bg-white border p-4 flex flex-col justify-between gap-3 transition-all duration-200 cursor-pointer relative ${
                        isSelected
                          ? "border-[#0B5D44] ring-2 ring-[#0B5D44]/30 shadow-md"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-[#0B5D44] text-white text-[10px] font-black uppercase tracking-wider shadow-xs z-20">
                          Active Selection
                        </span>
                      )}

                      {/* Top: Inner Image with Drag */}
                      <div
                        onMouseDown={(e) => handleFrameMouseDown(e, 2)}
                        className={`relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200/60 shrink-0 select-none ${
                          isSelected ? (isDragging ? "cursor-grabbing" : "cursor-grab ring-1 ring-[#0B5D44]") : ""
                        }`}
                        title="Click and drag to position image inside frame"
                      >
                        <div
                          className="absolute inset-0 transition-transform"
                          style={{
                            transform: `translate(${offX}px, ${offY}px) scale(${scale})`,
                            transformOrigin: "center center",
                          }}
                        >
                          <Image
                            src={card.image}
                            alt={card.title}
                            fill
                            draggable={false}
                            className="object-cover object-center pointer-events-none"
                            sizes="200px"
                          />
                        </div>

                        {isSelected && (
                          <div className="absolute inset-x-0 bottom-1 flex justify-center pointer-events-none">
                            <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold flex items-center gap-1 shadow-xs">
                              <MousePointer className="w-2.5 h-2.5" />
                              <span>Drag to move</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Bottom: Text Info & Arrow */}
                      <div className="flex items-end justify-between gap-2 mt-auto pt-1">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-movault text-xs lg:text-sm font-black uppercase tracking-wide text-neutral-950 leading-tight mb-0.5 truncate">
                            {card.title}
                          </h4>
                          <span className="font-mograph text-[9px] text-neutral-500 font-bold uppercase tracking-wider block mb-0.5">
                            {card.priceLabel || "Starting At"}
                          </span>
                          <span className="font-movault text-base lg:text-lg font-black text-[#0B5D44] tracking-tight">
                            {card.price}
                          </span>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-neutral-900 stroke-[2.5] shrink-0 mb-0.5" />
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Mobile Layout Cards Preview (shown if previewDevice === 'mobile') */}
            {previewDevice === "mobile" && (
              <div className="grid grid-cols-2 gap-2.5 w-full items-stretch">
                {/* Column 1: Card 1 (Tall Card) */}
                {(() => {
                  const card = draftConfig.cards[0] || DEFAULT_SPORTSWEAR_CAMPAIGN.cards[0];
                  const isSelected = selectedCardIndex === 0;
                  const scale = (card.mobileScale ?? 100) / 100;
                  const offX = card.mobileOffsetX ?? 0;
                  const offY = card.mobileOffsetY ?? 0;

                  return (
                    <div
                      onClick={() => setSelectedCardIndex(0)}
                      className={`group rounded-2xl bg-white border p-2.5 flex flex-col justify-between h-full transition-all duration-200 cursor-pointer relative ${
                        isSelected
                          ? "border-[#0B5D44] ring-2 ring-[#0B5D44]/30 shadow-md"
                          : "border-neutral-200"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute -top-2 left-2 px-1.5 py-0.5 rounded-full bg-[#0B5D44] text-white text-[8px] font-black uppercase tracking-wider z-20">
                          Active
                        </span>
                      )}

                      {/* Top: Tall Image */}
                      <div
                        onMouseDown={(e) => handleFrameMouseDown(e, 0)}
                        className={`relative aspect-[4/5.6] w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200/60 shrink-0 select-none ${
                          isSelected ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
                        }`}
                      >
                        <div
                          className="absolute inset-0 transition-transform"
                          style={{
                            transform: `translate(${offX}px, ${offY}px) scale(${scale})`,
                            transformOrigin: "center center",
                          }}
                        >
                          <Image
                            src={card.image}
                            alt={card.title}
                            fill
                            draggable={false}
                            className="object-cover object-center pointer-events-none"
                            sizes="200px"
                          />
                        </div>
                      </div>

                      {/* Bottom: Text Info */}
                      <div className="flex flex-col justify-end flex-1 min-w-0 pt-2 pb-0.5">
                        <h4 className="font-movault text-xs font-black uppercase italic tracking-wide text-neutral-950 leading-tight mb-1">
                          {card.title}
                        </h4>
                        <div>
                          <span className="font-mograph text-[8px] text-neutral-500 font-bold uppercase tracking-wider block">
                            {card.priceLabel || "Starting At"}
                          </span>
                          <span className="font-movault text-sm font-black text-[#0B5D44] tracking-tight">
                            {card.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Column 2: Stacked Cards (Card 2 & Card 3) */}
                <div className="flex flex-col gap-2.5 h-full">
                  {/* Card 2 */}
                  {(() => {
                    const card = draftConfig.cards[1] || DEFAULT_SPORTSWEAR_CAMPAIGN.cards[1];
                    const isSelected = selectedCardIndex === 1;
                    const scale = (card.mobileScale ?? 100) / 100;
                    const offX = card.mobileOffsetX ?? 0;
                    const offY = card.mobileOffsetY ?? 0;

                    return (
                      <div
                        onClick={() => setSelectedCardIndex(1)}
                        className={`group rounded-2xl bg-white border p-2 flex flex-col justify-between flex-1 transition-all duration-200 cursor-pointer relative ${
                          isSelected
                            ? "border-[#0B5D44] ring-2 ring-[#0B5D44]/30 shadow-md"
                            : "border-neutral-200"
                        }`}
                      >
                        {/* Top: Image */}
                        <div
                          onMouseDown={(e) => handleFrameMouseDown(e, 1)}
                          className={`relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200/60 shrink-0 select-none ${
                            isSelected ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
                          }`}
                        >
                          <div
                            className="absolute inset-0 transition-transform"
                            style={{
                              transform: `translate(${offX}px, ${offY}px) scale(${scale})`,
                              transformOrigin: "center center",
                            }}
                          >
                            <Image
                              src={card.image}
                              alt={card.title}
                              fill
                              draggable={false}
                              className="object-cover object-center pointer-events-none"
                              sizes="150px"
                            />
                          </div>
                        </div>

                        {/* Bottom: Text Info & Arrow */}
                        <div className="flex items-end justify-between gap-1 mt-auto pt-1">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-movault text-[10px] sm:text-[11px] font-black uppercase tracking-wide text-neutral-950 leading-tight mb-0.5 truncate">
                              {card.title}
                            </h4>
                            <span className="font-mograph text-[8px] text-neutral-500 font-bold uppercase tracking-wider block">
                              {card.priceLabel || "Starting At"}
                            </span>
                            <span className="font-movault text-xs sm:text-sm font-black text-[#0B5D44] tracking-tight block">
                              {card.price}
                            </span>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-neutral-900 stroke-[2.5] shrink-0" />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Card 3 */}
                  {(() => {
                    const card = draftConfig.cards[2] || DEFAULT_SPORTSWEAR_CAMPAIGN.cards[2];
                    const isSelected = selectedCardIndex === 2;
                    const scale = (card.mobileScale ?? 100) / 100;
                    const offX = card.mobileOffsetX ?? 0;
                    const offY = card.mobileOffsetY ?? 0;

                    return (
                      <div
                        onClick={() => setSelectedCardIndex(2)}
                        className={`group rounded-2xl bg-white border p-2 flex flex-col justify-between flex-1 transition-all duration-200 cursor-pointer relative ${
                          isSelected
                            ? "border-[#0B5D44] ring-2 ring-[#0B5D44]/30 shadow-md"
                            : "border-neutral-200"
                        }`}
                      >
                        {/* Top: Image */}
                        <div
                          onMouseDown={(e) => handleFrameMouseDown(e, 2)}
                          className={`relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200/60 shrink-0 select-none ${
                            isSelected ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
                          }`}
                        >
                          <div
                            className="absolute inset-0 transition-transform"
                            style={{
                              transform: `translate(${offX}px, ${offY}px) scale(${scale})`,
                              transformOrigin: "center center",
                            }}
                          >
                            <Image
                              src={card.image}
                              alt={card.title}
                              fill
                              draggable={false}
                              className="object-cover object-center pointer-events-none"
                              sizes="150px"
                            />
                          </div>
                        </div>

                        {/* Bottom: Text Info & Arrow */}
                        <div className="flex items-end justify-between gap-1 mt-auto pt-1">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-movault text-[10px] sm:text-[11px] font-black uppercase tracking-wide text-neutral-950 leading-tight mb-0.5 truncate">
                              {card.title}
                            </h4>
                            <span className="font-mograph text-[8px] text-neutral-500 font-bold uppercase tracking-wider block">
                              {card.priceLabel || "Starting At"}
                            </span>
                            <span className="font-movault text-xs sm:text-sm font-black text-[#0B5D44] tracking-tight block">
                              {card.price}
                            </span>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-neutral-900 stroke-[2.5] shrink-0" />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Header Banner Customization Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Type className="w-4 h-4 text-[#0B5D44]" />
          <h3 className="text-sm font-black text-slate-900 font-movault uppercase tracking-wider">
            Upper Campaign Banner: Texts &amp; Hashtag
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Heading Prefix
            </label>
            <input
              type="text"
              value={draftConfig.bannerHeadingPrefix ?? "Fresh"}
              onChange={(e) => handleUpdateBanner("bannerHeadingPrefix", e.target.value)}
              placeholder="Fresh"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0B5D44] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Highlighted Brand Word (Italic Green)
            </label>
            <input
              type="text"
              value={draftConfig.bannerHeadingHighlight ?? "Sportswear"}
              onChange={(e) => handleUpdateBanner("bannerHeadingHighlight", e.target.value)}
              placeholder="Sportswear"
              className="w-full px-3 py-2 text-xs border border-[#0B5D44] bg-[#E6F4EF]/10 rounded-xl text-[#074230] font-bold focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Heading Suffix
            </label>
            <input
              type="text"
              value={draftConfig.bannerHeadingSuffix ?? "Drops"}
              onChange={(e) => handleUpdateBanner("bannerHeadingSuffix", e.target.value)}
              placeholder="Drops"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0B5D44] focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-[#0B5D44]" />
            <span>Campaign Hashtag / Subtitle</span>
          </label>
          <input
            type="text"
            value={draftConfig.bannerHashtag ?? "#EngineeredForEveryMove"}
            onChange={(e) => handleUpdateBanner("bannerHashtag", e.target.value)}
            placeholder="#EngineeredForEveryMove"
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0B5D44] focus:outline-hidden"
          />

          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[10px] font-bold text-slate-400">Quick Presets:</span>
            {HASHTAG_PRESETS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleUpdateBanner("bannerHashtag", tag)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                  draftConfig.bannerHashtag === tag
                    ? "bg-[#0B5D44] text-white border-[#0B5D44]"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Card Selection & Customization Controls */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#0B5D44]" />
            <h3 className="text-sm font-black text-slate-900 font-movault uppercase tracking-wider">
              Card Customization &amp; Image Framing
            </h3>
          </div>

          {/* Card Selector Pills */}
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((idx) => {
              const card = draftConfig.cards[idx] || DEFAULT_SPORTSWEAR_CAMPAIGN.cards[idx];
              const isActive = selectedCardIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedCardIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-[#0B5D44] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>Card #{idx + 1}:</span>
                  <span className="font-normal truncate max-w-[100px]">{card.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Card Heading / Title
            </label>
            <input
              type="text"
              value={currentCard?.title || ""}
              onChange={(e) => handleUpdateCurrentCard("title", e.target.value)}
              placeholder="e.g. Sports Wear"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0B5D44] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Price Text (with currency &amp; asterisk)
            </label>
            <input
              type="text"
              value={currentCard?.price || ""}
              onChange={(e) => handleUpdateCurrentCard("price", e.target.value)}
              placeholder="e.g. ₹999*"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0B5D44] focus:outline-hidden font-bold text-[#0B5D44]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Price Label
            </label>
            <input
              type="text"
              value={currentCard?.priceLabel || "Starting At"}
              onChange={(e) => handleUpdateCurrentCard("priceLabel", e.target.value)}
              placeholder="Starting At"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0B5D44] focus:outline-hidden"
            />
          </div>
        </div>

        {/* Redirect Product Category URL */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-[#0B5D44]" />
            <span>Redirect Product Category Page URL</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={currentCard?.linkUrl || "/products?category=Outfits"}
              onChange={(e) => handleUpdateCurrentCard("linkUrl", e.target.value)}
              placeholder="/products?category=Outfits"
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0B5D44] focus:outline-hidden font-mono"
            />

            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleUpdateCurrentCard("linkUrl", e.target.value);
                }
              }}
              value=""
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 cursor-pointer"
            >
              <option value="" disabled>
                Select Store Category...
              </option>
              {categories.map((c) => (
                <option key={c.id} value={`/products?category=${encodeURIComponent(c.name)}`}>
                  {c.name} (/products?category={c.name})
                </option>
              ))}
              {REDIRECT_PRESETS.map((p) => (
                <option key={p.url} value={p.url}>
                  Preset: {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Image Source & Upload */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-[#0B5D44]" />
              <span>Card Image Source</span>
            </span>
            {uploadingImage && (
              <span className="text-xs text-[#0B5D44] font-bold flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Uploading image...
              </span>
            )}
          </label>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={currentCard?.image || ""}
              onChange={(e) => handleUpdateCurrentCard("image", e.target.value)}
              placeholder="e.g. /vittal/drop-teveo-run.jpg or https://..."
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-[#0B5D44] focus:outline-hidden font-mono"
            />

            <label className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Preset image thumbnails */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 block mb-1.5">
              Or pick from high-res sports photography presets:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {IMAGE_PRESETS.map((preset) => {
                const isSelected = currentCard?.image === preset.url;
                return (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => handleUpdateCurrentCard("image", preset.url)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#0B5D44] bg-[#E6F4EF]/20 ring-1 ring-[#0B5D44]"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 relative shrink-0">
                      <Image
                        src={preset.url}
                        alt={preset.label}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 line-clamp-2 leading-tight">
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 5. Image Framing Adjustments: Drag, Zoom In/Out, Left/Right, Upper/Lower */}
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 font-movault flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-[#0B5D44]" />
                <span>Image Framing &amp; Positioning (Card #{selectedCardIndex + 1})</span>
              </h4>
              <p className="text-[11px] text-slate-500 font-mograph">
                Drag directly with your mouse in the live preview above, or use the precise sliders below.
              </p>
            </div>

            {/* Viewport tab selector for adjustments */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setControlViewTab("desktop")}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  controlViewTab === "desktop"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Monitor className="w-3 h-3" />
                <span>Desktop Settings</span>
              </button>
              <button
                type="button"
                onClick={() => setControlViewTab("mobile")}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  controlViewTab === "mobile"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>Mobile Settings</span>
              </button>
            </div>
          </div>

          <div className="bg-neutral-50/80 rounded-2xl p-5 border border-neutral-200/80 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700">
                Adjusting: <span className="text-[#0B5D44] uppercase font-extrabold">{controlViewTab} View</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  if (isDesktopControl) {
                    handleUpdateCurrentCard("desktopScale", 100);
                    handleUpdateCurrentCard("desktopOffsetX", 0);
                    handleUpdateCurrentCard("desktopOffsetY", 0);
                  } else {
                    handleUpdateCurrentCard("mobileScale", 100);
                    handleUpdateCurrentCard("mobileOffsetX", 0);
                    handleUpdateCurrentCard("mobileOffsetY", 0);
                  }
                  showToast("success", `Reset ${controlViewTab} zoom & position to defaults.`);
                }}
                className="text-[11px] font-bold text-neutral-500 hover:text-neutral-800 underline cursor-pointer"
              >
                Reset {controlViewTab} Position &amp; Zoom
              </button>
            </div>

            {/* 1. Zoom Slider (Scale %) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-neutral-800">
                  <ZoomIn className="w-3.5 h-3.5 text-[#0B5D44]" />
                  <span>Zoom / Scale:</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-[#074230] font-bold">
                  {activeScale}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.max(50, activeScale - 5);
                    handleUpdateCurrentCard(isDesktopControl ? "desktopScale" : "mobileScale", newVal);
                  }}
                  className="w-8 h-8 rounded-lg bg-white border border-neutral-200 text-neutral-700 font-bold hover:bg-neutral-100 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  -
                </button>
                <input
                  type="range"
                  min="50"
                  max="250"
                  step="1"
                  value={activeScale}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    handleUpdateCurrentCard(isDesktopControl ? "desktopScale" : "mobileScale", val);
                  }}
                  className="w-full accent-[#0B5D44] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.min(250, activeScale + 5);
                    handleUpdateCurrentCard(isDesktopControl ? "desktopScale" : "mobileScale", newVal);
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
                  <Move className="w-3.5 h-3.5 text-[#0B5D44]" />
                  <span>Move Left / Right (X Offset):</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-[#074230] font-bold">
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
                    const newVal = Math.max(-200, activeOffsetX - 5);
                    handleUpdateCurrentCard(isDesktopControl ? "desktopOffsetX" : "mobileOffsetX", newVal);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-[11px] font-bold text-neutral-700 hover:bg-neutral-100 flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Left</span>
                </button>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  step="2"
                  value={activeOffsetX}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    handleUpdateCurrentCard(isDesktopControl ? "desktopOffsetX" : "mobileOffsetX", val);
                  }}
                  className="w-full accent-[#0B5D44] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.min(200, activeOffsetX + 5);
                    handleUpdateCurrentCard(isDesktopControl ? "desktopOffsetX" : "mobileOffsetX", newVal);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-[11px] font-bold text-neutral-700 hover:bg-neutral-100 flex items-center gap-1 shrink-0 cursor-pointer"
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
                  <Move className="w-3.5 h-3.5 text-[#0B5D44]" />
                  <span>Move Upper / Lower (Y Offset):</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-[#074230] font-bold">
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
                    handleUpdateCurrentCard(isDesktopControl ? "desktopOffsetY" : "mobileOffsetY", newVal);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-[11px] font-bold text-neutral-700 hover:bg-neutral-100 flex items-center gap-1 shrink-0 cursor-pointer"
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
                    handleUpdateCurrentCard(isDesktopControl ? "desktopOffsetY" : "mobileOffsetY", val);
                  }}
                  className="w-full accent-[#0B5D44] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newVal = Math.min(200, activeOffsetY + 5);
                    handleUpdateCurrentCard(isDesktopControl ? "desktopOffsetY" : "mobileOffsetY", newVal);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-[11px] font-bold text-neutral-700 hover:bg-neutral-100 flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>Down</span>
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
