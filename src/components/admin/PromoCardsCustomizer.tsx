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
} from "lucide-react";

interface PromoCardsCustomizerProps {
  categories: StoreCategory[];
  showToast: (type: "success" | "error", text: string) => void;
}

const BG_COLOR_PRESETS = [
  { label: "Warm Cream", value: "#F9EFE7" },
  { label: "Dark Slate", value: "#1F2329" },
  { label: "Obsidian Black", value: "#111827" },
  { label: "Midnight Navy", value: "#0F172A" },
  { label: "Soft Coral", value: "#FEEBEA" },
  { label: "Sky Blue", value: "#E0F2FE" },
  { label: "Mint Whisper", value: "#DCFCE7" },
  { label: "Lilac Violet", value: "#F3E8FF" },
  { label: "Amber Gold", value: "#FEF3C7" },
  { label: "Sunset Peach", value: "#FFEDD5" },
];

const BUTTON_BG_PRESETS = [
  { label: "Solid Black", value: "#1A1A1A" },
  { label: "Pure White", value: "#FFFFFF" },
  { label: "Brand Orange", value: "#FF7A00" },
  { label: "Royal Blue", value: "#2563EB" },
  { label: "Forest Green", value: "#059669" },
  { label: "Crimson Red", value: "#DC2626" },
  { label: "Amber Gold", value: "#D97706" },
  { label: "Slate Charcoal", value: "#334155" },
];

const BUTTON_TEXT_PRESETS = [
  { label: "Pure White", value: "#FFFFFF" },
  { label: "Dark Black", value: "#111111" },
  { label: "Charcoal", value: "#1F2937" },
  { label: "Brand Orange", value: "#FF7A00" },
];

const TEXT_COLOR_PRESETS = [
  { label: "Dark Charcoal", value: "#1A1A1A" },
  { label: "Pure White", value: "#FFFFFF" },
  { label: "Slate Gray", value: "#334155" },
  { label: "Muted Gray", value: "#64748B" },
  { label: "Soft Muted", value: "#9CA3AF" },
];

const PHOTO_PRESETS = [
  { label: "Thermal Printer", url: "/products/thermal-printer.jpg" },
  { label: "Popcorn Maker", url: "/products/popcorn-maker.jpg" },
  { label: "Helicopter Perfume", url: "/products/helicopter-perfume.jpg" },
  { label: "Water Ripple Lamp", url: "/products/hero-banner.jpg" },
  { label: "Powerbank Earbuds", url: "/products/powerbank-earbuds.jpg" },
  { label: "Mini Steam Iron", url: "/products/iron/iron-teal-1.jpg" },
  { label: "Car Diffuser", url: "/products/car-perfume.jpg" },
  { label: "Crystal Lamp", url: "/products/ripple-lamp.jpg" },
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
  const [activeCardTab, setActiveCardTab] = useState<"both" | "card-1" | "card-2">("both");

  // Load promo banners from API on mount
  const loadPromoBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content/promo-banners");
      const data = await res.json();
      if (data.success && Array.isArray(data.banners) && data.banners.length === 2) {
        setSavedCards(data.banners);
        setDraftCards(data.banners);
      }
    } catch (err) {
      console.error("Failed to fetch promo banners:", err);
      showToast("error", "Failed to load promo banners from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromoBanners();
  }, []);

  const isDirty = JSON.stringify(savedCards) !== JSON.stringify(draftCards);

  // Update a field on one of the cards in draft state (instant live preview)
  const handleUpdateField = (
    cardId: "card-1" | "card-2",
    field: keyof PromoBannerCard,
    value: string
  ) => {
    setDraftCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, [field]: value } : c))
    );
  };

  // Image file upload to Base64 Data URL
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    cardId: "card-1" | "card-2",
    field: "image1" | "image2"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("error", "Image size exceeds 2MB limit. Please choose a smaller photo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        handleUpdateField(cardId, field, dataUrl);
        showToast("success", `New photo uploaded for ${cardId === "card-1" ? "Card 1" : "Card 2"}!`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Save draft cards to Live Storefront
  const handleSaveToLive = async () => {
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
        showToast("success", "Promo cards saved! Live website updated successfully.");
      } else {
        showToast("error", data.error || "Failed to save promo cards");
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Discard changes & revert to saved live website version
  const handleDiscardChanges = () => {
    setDraftCards([...savedCards]);
    showToast("success", "Draft discarded. Reverted to current live website content.");
  };

  // Reset to factory defaults
  const handleResetDefaults = () => {
    if (
      !confirm(
        "Reset both promo cards to the factory default template? Changes will appear in preview, then click 'Save Changes' to push live."
      )
    )
      return;
    setDraftCards([...DEFAULT_PROMO_BANNERS]);
    showToast("success", "Default template loaded into preview. Click 'Save Changes' to push live.");
  };

  const card1 = draftCards[0] || DEFAULT_PROMO_BANNERS[0];
  const card2 = draftCards[1] || DEFAULT_PROMO_BANNERS[1];

  // Build category options list for dropdown
  const categoryOptions = [
    { label: "All Products", link: "/products" },
    ...categories.map((c) => ({
      label: c.name,
      link: `/products?category=${encodeURIComponent(c.slug || c.name)}`,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* ========================================================
          TOP ACTION BAR & SYNC STATUS
         ======================================================== */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#FF7A00]" />
              <span>Promo Dual Cards Customizer</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-orange-100 text-[#FF7A00]">
              2 Cards Only
            </span>
            {isDirty ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                <AlertCircle className="w-3 h-3" />
                <span>Unsaved Draft (Previewing)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                <span>Live Website In Sync</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Customize colors, photos, headings, text, button labels & colors, and category redirects for the 2 homepage promo cards.
            Changes remain in live preview until you click <strong>Save Changes</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            title="Reset to default template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          {isDirty && (
            <button
              type="button"
              onClick={handleDiscardChanges}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
              title="Discard draft changes"
            >
              <span>Discard Draft</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveToLive}
            disabled={saving || !isDirty}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
              isDirty
                ? "bg-[#FF7A00] text-white hover:bg-[#E66E00] ring-2 ring-[#FF7A00]/30 shadow-md animate-pulse"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saving ? "Saving to Live..." : "Save Changes to Live Website"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          LIVE STOREFRONT PREVIEW (DESKTOP VS MOBILE SIMULATOR)
         ======================================================== */}
      <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 text-white border border-slate-800 shadow-xl overflow-hidden">
        {/* Preview Header & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#FF7A00]" />
              <h3 className="text-sm font-bold tracking-tight text-white uppercase tracking-wider">
                100% Real-time Storefront Preview
              </h3>
            </div>
            <p className="text-[11px] text-slate-400">
              {previewDevice === "desktop"
                ? "Simulating desktop browser view (Side-by-side 2-column layout)"
                : "Simulating smartphone view (Vertical 1-column stacked layout)"}
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setPreviewDevice("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                previewDevice === "desktop"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-blue-500" />
              <span>Desktop View</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                previewDevice === "mobile"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
              <span>Mobile View</span>
            </button>
          </div>
        </div>

        {/* Live Simulation Viewport */}
        <div className="py-4">
          {previewDevice === "desktop" ? (
            /* Desktop Browser Simulation */
            <div className="bg-[#F3F4F6] rounded-2xl p-4 sm:p-6 border border-slate-200/20 text-slate-900 shadow-inner overflow-hidden">
              <div className="text-[10px] font-mono text-slate-400 mb-2 flex items-center justify-between">
                <span>Desktop Storefront Container (max-w-[1600px])</span>
                <span>Dual Column Grid</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Desktop Card 1 */}
                <div
                  className="relative rounded-3xl overflow-hidden p-6 sm:p-8 flex items-center justify-between min-h-[240px] shadow-sm transition-all duration-300"
                  style={{
                    backgroundColor: card1.bgColor || "#F9EFE7",
                  }}
                >
                  <div className="max-w-[200px] sm:max-w-xs z-10 space-y-3">
                    <h3
                      className="text-xl sm:text-2xl font-display font-extrabold leading-tight whitespace-pre-line tracking-tight"
                      style={{ color: card1.textColor || "#1A1A1A" }}
                    >
                      {card1.title || "Upgrade Your\nEveryday Essentials"}
                    </h3>
                    <p
                      className="text-xs sm:text-sm font-medium whitespace-pre-line"
                      style={{ color: card1.subtitleColor || "#4B5563" }}
                    >
                      {card1.subtitle || "Smart products for a smarter lifestyle."}
                    </p>
                    <div className="pt-1">
                      <div
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold shadow-md cursor-default select-none transition-all"
                        style={{
                          backgroundColor: card1.btnBgColor || "#1A1A1A",
                          color: card1.btnTextColor || "#FFFFFF",
                        }}
                      >
                        <span>{card1.ctaText || "Explore Now"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Right Product Image Collage */}
                  <div className="relative w-44 sm:w-56 h-36 sm:h-44 flex-shrink-0 flex items-center justify-end">
                    {card1.image2 ? (
                      <>
                        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-md -mr-4 z-10 border-2 border-white">
                          <Image
                            src={card1.image1 || "/products/thermal-printer.jpg"}
                            alt={card1.title || "Product 1"}
                            fill
                            unoptimized={card1.image1?.startsWith("data:") || card1.image1?.startsWith("http")}
                            className="object-cover object-bottom"
                          />
                        </div>
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-md border-2 border-white">
                          <Image
                            src={card1.image2}
                            alt={card1.title || "Product 2"}
                            fill
                            unoptimized={card1.image2?.startsWith("data:") || card1.image2?.startsWith("http")}
                            className="object-cover object-bottom"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="relative w-40 sm:w-52 h-32 sm:h-40 rounded-2xl overflow-hidden shadow-md border-2 border-white/80">
                        <Image
                          src={card1.image1 || "/products/thermal-printer.jpg"}
                          alt={card1.title || "Product"}
                          fill
                          unoptimized={card1.image1?.startsWith("data:") || card1.image1?.startsWith("http")}
                          className="object-cover object-bottom"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop Card 2 */}
                <div
                  className="relative rounded-3xl overflow-hidden p-6 sm:p-8 flex items-center justify-between min-h-[240px] shadow-sm transition-all duration-300"
                  style={{
                    backgroundColor: card2.bgColor || "#1F2329",
                  }}
                >
                  <div className="max-w-[200px] sm:max-w-xs z-10 space-y-3">
                    <h3
                      className="text-xl sm:text-2xl font-display font-extrabold leading-tight whitespace-pre-line tracking-tight"
                      style={{ color: card2.textColor || "#FFFFFF" }}
                    >
                      {card2.title || "Auto Essentials"}
                    </h3>
                    <p
                      className="text-xs sm:text-sm font-medium whitespace-pre-line"
                      style={{ color: card2.subtitleColor || "#9CA3AF" }}
                    >
                      {card2.subtitle || "Drive in Style and Comfort."}
                    </p>
                    <div className="pt-1">
                      <div
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold shadow-md cursor-default select-none transition-all"
                        style={{
                          backgroundColor: card2.btnBgColor || "#FFFFFF",
                          color: card2.btnTextColor || "#111111",
                        }}
                      >
                        <span>{card2.ctaText || "Shop Now"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Right Product Image */}
                  <div className="relative w-48 sm:w-60 h-36 sm:h-44 flex-shrink-0 rounded-2xl overflow-hidden shadow-xl border border-white/10">
                    <Image
                      src={card2.image1 || "/products/helicopter-perfume.jpg"}
                      alt={card2.title || "Auto Essentials"}
                      fill
                      unoptimized={card2.image1?.startsWith("data:") || card2.image1?.startsWith("http")}
                      className="object-cover object-bottom"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Authentic Smartphone Simulator */
            <div className="max-w-[390px] mx-auto bg-slate-950 p-3 sm:p-4 rounded-[44px] shadow-2xl border-4 border-slate-700">
              {/* iPhone Dynamic Island / Speaker */}
              <div className="w-24 h-4 bg-black rounded-full mx-auto mb-3 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-800 ml-auto mr-2" />
              </div>

              {/* Mobile Screen Contents (Stacked 1-Column) */}
              <div className="rounded-[28px] overflow-hidden bg-[#F3F4F6] p-3 space-y-4 text-slate-900">
                {/* Mobile Card 1 */}
                <div
                  className="relative rounded-2xl overflow-hidden p-4 flex items-center justify-between min-h-[190px] shadow-xs"
                  style={{ backgroundColor: card1.bgColor || "#F9EFE7" }}
                >
                  <div className="max-w-[150px] z-10 space-y-2">
                    <h3
                      className="text-base font-display font-extrabold leading-tight whitespace-pre-line"
                      style={{ color: card1.textColor || "#1A1A1A" }}
                    >
                      {card1.title || "Upgrade Your Essentials"}
                    </h3>
                    <p
                      className="text-[10px] font-medium leading-snug whitespace-pre-line"
                      style={{ color: card1.subtitleColor || "#4B5563" }}
                    >
                      {card1.subtitle}
                    </p>
                    <div>
                      <div
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold shadow-xs select-none"
                        style={{
                          backgroundColor: card1.btnBgColor || "#1A1A1A",
                          color: card1.btnTextColor || "#FFFFFF",
                        }}
                      >
                        <span>{card1.ctaText || "Explore Now"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>

                  <div className="relative w-32 h-28 flex items-center justify-end">
                    {card1.image2 ? (
                      <>
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-xs -mr-3 z-10 border-2 border-white">
                          <Image
                            src={card1.image1 || "/products/thermal-printer.jpg"}
                            alt="Product 1"
                            fill
                            unoptimized={card1.image1?.startsWith("data:") || card1.image1?.startsWith("http")}
                            className="object-cover object-bottom"
                          />
                        </div>
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-xs border-2 border-white">
                          <Image
                            src={card1.image2}
                            alt="Product 2"
                            fill
                            unoptimized={card1.image2?.startsWith("data:") || card1.image2?.startsWith("http")}
                            className="object-cover object-bottom"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="relative w-28 h-24 rounded-xl overflow-hidden shadow-xs border border-white">
                        <Image
                          src={card1.image1 || "/products/thermal-printer.jpg"}
                          alt="Product"
                          fill
                          unoptimized={card1.image1?.startsWith("data:") || card1.image1?.startsWith("http")}
                          className="object-cover object-bottom"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Card 2 */}
                <div
                  className="relative rounded-2xl overflow-hidden p-4 flex items-center justify-between min-h-[190px] shadow-xs"
                  style={{ backgroundColor: card2.bgColor || "#1F2329" }}
                >
                  <div className="max-w-[150px] z-10 space-y-2">
                    <h3
                      className="text-base font-display font-extrabold leading-tight whitespace-pre-line"
                      style={{ color: card2.textColor || "#FFFFFF" }}
                    >
                      {card2.title || "Auto Essentials"}
                    </h3>
                    <p
                      className="text-[10px] font-medium leading-snug whitespace-pre-line"
                      style={{ color: card2.subtitleColor || "#9CA3AF" }}
                    >
                      {card2.subtitle}
                    </p>
                    <div>
                      <div
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold shadow-xs select-none"
                        style={{
                          backgroundColor: card2.btnBgColor || "#FFFFFF",
                          color: card2.btnTextColor || "#111111",
                        }}
                      >
                        <span>{card2.ctaText || "Shop Now"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>

                  <div className="relative w-32 h-28 rounded-xl overflow-hidden shadow-sm border border-white/10">
                    <Image
                      src={card2.image1 || "/products/helicopter-perfume.jpg"}
                      alt="Product"
                      fill
                      unoptimized={card2.image1?.startsWith("data:") || card2.image1?.startsWith("http")}
                      className="object-cover object-bottom"
                    />
                  </div>
                </div>
              </div>

              {/* iPhone Bottom Bar */}
              <div className="w-32 h-1 bg-white/40 rounded-full mx-auto mt-3" />
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          CARD CUSTOMIZATION WORKSPACE (DUAL SIDE-BY-SIDE PANELS)
         ======================================================== */}
      <div>
        {/* Workspace Tab Switcher */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#FF7A00]" />
            <h3 className="text-sm font-bold text-slate-800">
              Customize Card Content & Styling
            </h3>
          </div>

          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveCardTab("both")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCardTab === "both"
                  ? "bg-[#FF7A00] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Side-by-Side (Both)
            </button>
            <button
              type="button"
              onClick={() => setActiveCardTab("card-1")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCardTab === "card-1"
                  ? "bg-[#FF7A00] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Card 1 Only
            </button>
            <button
              type="button"
              onClick={() => setActiveCardTab("card-2")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCardTab === "card-2"
                  ? "bg-[#FF7A00] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Card 2 Only
            </button>
          </div>
        </div>

        {/* Dual Card Forms Grid */}
        <div
          className={`grid gap-6 ${
            activeCardTab === "both" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {/* ========================================================
              CARD 1: LEFT PROMO CARD (EVERYDAY ESSENTIALS)
             ======================================================== */}
          {(activeCardTab === "both" || activeCardTab === "card-1") && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-6">
              {/* Card Title & Mini Indicator */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF7A00] font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Card 1 (Left Promo Card)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Default: "Upgrade Your Everyday Essentials"
                    </p>
                  </div>
                </div>
                <div
                  className="w-8 h-8 rounded-xl border border-slate-200 shadow-2xs"
                  style={{ backgroundColor: card1.bgColor }}
                  title="Card background color"
                />
              </div>

              {/* 1. Background Color */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Card Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={card1.bgColor.startsWith("#") ? card1.bgColor : "#F9EFE7"}
                    onChange={(e) => handleUpdateField("card-1", "bgColor", e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                    title="Choose custom background color"
                  />
                  <input
                    type="text"
                    value={card1.bgColor}
                    onChange={(e) => handleUpdateField("card-1", "bgColor", e.target.value)}
                    placeholder="#F9EFE7"
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                  />
                </div>
                {/* Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {BG_COLOR_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => handleUpdateField("card-1", "bgColor", p.value)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                        card1.bgColor.toLowerCase() === p.value.toLowerCase()
                          ? "border-[#FF7A00] ring-1 ring-[#FF7A00] bg-orange-50/40 text-slate-900"
                          : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/10"
                        style={{ backgroundColor: p.value }}
                      />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Heading Text & Text Color */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Heading Title
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">Color:</span>
                    <input
                      type="color"
                      value={card1.textColor.startsWith("#") ? card1.textColor : "#1A1A1A"}
                      onChange={(e) => handleUpdateField("card-1", "textColor", e.target.value)}
                      className="w-6 h-6 rounded-md border border-slate-200 cursor-pointer p-0.5"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={card1.title}
                  onChange={(e) => handleUpdateField("card-1", "title", e.target.value)}
                  placeholder="Upgrade Your Everyday Essentials"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                />
              </div>

              {/* 3. Subtitle / Description Text & Color */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Subtitle Description
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">Color:</span>
                    <input
                      type="color"
                      value={card1.subtitleColor?.startsWith("#") ? card1.subtitleColor : "#4B5563"}
                      onChange={(e) => handleUpdateField("card-1", "subtitleColor", e.target.value)}
                      className="w-6 h-6 rounded-md border border-slate-200 cursor-pointer p-0.5"
                    />
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={card1.subtitle}
                  onChange={(e) => handleUpdateField("card-1", "subtitle", e.target.value)}
                  placeholder="Smart products for a smarter lifestyle."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF7A00] resize-none"
                />
              </div>

              {/* 4. Button Customization (Name, Colors, Destination) */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-[#FF7A00]" />
                    <span>Button Customization</span>
                  </span>
                  {/* Live Mini Button Preview */}
                  <div
                    className="px-3 py-1 rounded-full text-[10px] font-bold shadow-2xs select-none"
                    style={{
                      backgroundColor: card1.btnBgColor || "#1A1A1A",
                      color: card1.btnTextColor || "#FFFFFF",
                    }}
                  >
                    <span>{card1.ctaText || "Explore Now"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      value={card1.ctaText}
                      onChange={(e) => handleUpdateField("card-1", "ctaText", e.target.value)}
                      placeholder="Explore Now"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Redirect Destination
                    </label>
                    <select
                      value={
                        categoryOptions.some((c) => c.link === card1.ctaLink)
                          ? card1.ctaLink
                          : "custom"
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== "custom") {
                          handleUpdateField("card-1", "ctaLink", val);
                        }
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00] cursor-pointer"
                    >
                      <optgroup label="Store Categories & Pages">
                        {categoryOptions.map((c) => (
                          <option key={c.link} value={c.link}>
                            {c.label} ({c.link})
                          </option>
                        ))}
                      </optgroup>
                      <option value="custom">Custom URL / Product Page...</option>
                    </select>
                  </div>
                </div>

                {/* Custom URL Input if selected */}
                {(!categoryOptions.some((c) => c.link === card1.ctaLink) ||
                  card1.ctaLink.startsWith("/products/")) && (
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      Custom Redirect Path
                    </label>
                    <input
                      type="text"
                      value={card1.ctaLink}
                      onChange={(e) => handleUpdateField("card-1", "ctaLink", e.target.value)}
                      placeholder="/products?category=..."
                      className="w-full px-3 py-1.5 text-xs font-mono rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                    />
                  </div>
                )}

                {/* Button Colors: Solid Background & Text Color */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Button Background Color
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={card1.btnBgColor.startsWith("#") ? card1.btnBgColor : "#1A1A1A"}
                        onChange={(e) => handleUpdateField("card-1", "btnBgColor", e.target.value)}
                        className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={card1.btnBgColor}
                        onChange={(e) => handleUpdateField("card-1", "btnBgColor", e.target.value)}
                        placeholder="#1A1A1A"
                        className="flex-1 px-2 py-1 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Button Text Color
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={card1.btnTextColor.startsWith("#") ? card1.btnTextColor : "#FFFFFF"}
                        onChange={(e) => handleUpdateField("card-1", "btnTextColor", e.target.value)}
                        className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={card1.btnTextColor}
                        onChange={(e) => handleUpdateField("card-1", "btnTextColor", e.target.value)}
                        placeholder="#FFFFFF"
                        className="flex-1 px-2 py-1 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Photos: Primary Image + Secondary Collage Image */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-700">
                  Card Photos & Images
                </label>

                {/* Primary Photo */}
                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      Primary Product Photo (Front)
                    </span>
                    <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs">
                      <Upload className="w-3 h-3 text-[#FF7A00]" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "card-1", "image1")}
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                      <Image
                        src={card1.image1 || "/products/thermal-printer.jpg"}
                        alt="Preview"
                        fill
                        unoptimized={card1.image1?.startsWith("data:") || card1.image1?.startsWith("http")}
                        className="object-cover"
                      />
                    </div>
                    <input
                      type="text"
                      value={card1.image1}
                      onChange={(e) => handleUpdateField("card-1", "image1", e.target.value)}
                      placeholder="/products/thermal-printer.jpg"
                      className="flex-1 px-3 py-1.5 text-xs font-mono rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  {/* Preset quick picks */}
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[10px] text-slate-400 mr-1">Presets:</span>
                    {PHOTO_PRESETS.map((p) => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() => handleUpdateField("card-1", "image1", p.url)}
                        className="px-2 py-0.5 rounded-md text-[10px] bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Secondary Photo (Collage) */}
                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      Secondary Product Photo (Overlapping Collage)
                    </span>
                    <div className="flex items-center gap-1.5">
                      {card1.image2 && (
                        <button
                          type="button"
                          onClick={() => handleUpdateField("card-1", "image2", "")}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Remove secondary collage photo"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      )}
                      <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs">
                        <Upload className="w-3 h-3 text-[#FF7A00]" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, "card-1", "image2")}
                        />
                      </label>
                    </div>
                  </div>

                  {card1.image2 ? (
                    <div className="flex items-center gap-2">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                        <Image
                          src={card1.image2}
                          alt="Collage Preview"
                          fill
                          unoptimized={card1.image2?.startsWith("data:") || card1.image2?.startsWith("http")}
                          className="object-cover"
                        />
                      </div>
                      <input
                        type="text"
                        value={card1.image2}
                        onChange={(e) => handleUpdateField("card-1", "image2", e.target.value)}
                        placeholder="/products/popcorn-maker.jpg"
                        className="flex-1 px-3 py-1.5 text-xs font-mono rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      No secondary image selected. Card 1 will display as a single large product photo. Click "Upload" or pick a preset below to add one.
                    </p>
                  )}

                  {/* Preset quick picks */}
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[10px] text-slate-400 mr-1">Presets:</span>
                    {PHOTO_PRESETS.map((p) => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() => handleUpdateField("card-1", "image2", p.url)}
                        className="px-2 py-0.5 rounded-md text-[10px] bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              CARD 2: RIGHT PROMO CARD (AUTO ESSENTIALS)
             ======================================================== */}
          {(activeCardTab === "both" || activeCardTab === "card-2") && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-6">
              {/* Card Title & Mini Indicator */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF7A00] font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Card 2 (Right Promo Card)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Default: "Auto Essentials"
                    </p>
                  </div>
                </div>
                <div
                  className="w-8 h-8 rounded-xl border border-slate-200 shadow-2xs"
                  style={{ backgroundColor: card2.bgColor }}
                  title="Card background color"
                />
              </div>

              {/* 1. Background Color */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Card Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={card2.bgColor.startsWith("#") ? card2.bgColor : "#1F2329"}
                    onChange={(e) => handleUpdateField("card-2", "bgColor", e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                    title="Choose custom background color"
                  />
                  <input
                    type="text"
                    value={card2.bgColor}
                    onChange={(e) => handleUpdateField("card-2", "bgColor", e.target.value)}
                    placeholder="#1F2329"
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                  />
                </div>
                {/* Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {BG_COLOR_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => handleUpdateField("card-2", "bgColor", p.value)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                        card2.bgColor.toLowerCase() === p.value.toLowerCase()
                          ? "border-[#FF7A00] ring-1 ring-[#FF7A00] bg-orange-50/40 text-slate-900"
                          : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/10"
                        style={{ backgroundColor: p.value }}
                      />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Heading Text & Text Color */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Heading Title
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">Color:</span>
                    <input
                      type="color"
                      value={card2.textColor.startsWith("#") ? card2.textColor : "#FFFFFF"}
                      onChange={(e) => handleUpdateField("card-2", "textColor", e.target.value)}
                      className="w-6 h-6 rounded-md border border-slate-200 cursor-pointer p-0.5"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={card2.title}
                  onChange={(e) => handleUpdateField("card-2", "title", e.target.value)}
                  placeholder="Auto Essentials"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                />
              </div>

              {/* 3. Subtitle / Description Text & Color */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Subtitle Description
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">Color:</span>
                    <input
                      type="color"
                      value={card2.subtitleColor?.startsWith("#") ? card2.subtitleColor : "#9CA3AF"}
                      onChange={(e) => handleUpdateField("card-2", "subtitleColor", e.target.value)}
                      className="w-6 h-6 rounded-md border border-slate-200 cursor-pointer p-0.5"
                    />
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={card2.subtitle}
                  onChange={(e) => handleUpdateField("card-2", "subtitle", e.target.value)}
                  placeholder="Drive in Style and Comfort."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF7A00] resize-none"
                />
              </div>

              {/* 4. Button Customization (Name, Colors, Destination) */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-[#FF7A00]" />
                    <span>Button Customization (Solid Static Colors)</span>
                  </span>
                  {/* Live Mini Button Preview */}
                  <div
                    className="px-3 py-1 rounded-full text-[10px] font-bold shadow-2xs select-none"
                    style={{
                      backgroundColor: card2.btnBgColor || "#FFFFFF",
                      color: card2.btnTextColor || "#111111",
                    }}
                  >
                    <span>{card2.ctaText || "Shop Now"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      value={card2.ctaText}
                      onChange={(e) => handleUpdateField("card-2", "ctaText", e.target.value)}
                      placeholder="Shop Now"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Redirect Destination
                    </label>
                    <select
                      value={
                        categoryOptions.some((c) => c.link === card2.ctaLink)
                          ? card2.ctaLink
                          : "custom"
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== "custom") {
                          handleUpdateField("card-2", "ctaLink", val);
                        }
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00] cursor-pointer"
                    >
                      <optgroup label="Store Categories & Pages">
                        {categoryOptions.map((c) => (
                          <option key={c.link} value={c.link}>
                            {c.label} ({c.link})
                          </option>
                        ))}
                      </optgroup>
                      <option value="custom">Custom URL / Product Page...</option>
                    </select>
                  </div>
                </div>

                {/* Custom URL Input if selected */}
                {(!categoryOptions.some((c) => c.link === card2.ctaLink) ||
                  card2.ctaLink.startsWith("/products/")) && (
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      Custom Redirect Path
                    </label>
                    <input
                      type="text"
                      value={card2.ctaLink}
                      onChange={(e) => handleUpdateField("card-2", "ctaLink", e.target.value)}
                      placeholder="/products?category=Auto+Essentials"
                      className="w-full px-3 py-1.5 text-xs font-mono rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                    />
                  </div>
                )}

                {/* Button Colors: Solid Background & Text Color */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Button Background Color
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={card2.btnBgColor.startsWith("#") ? card2.btnBgColor : "#FFFFFF"}
                        onChange={(e) => handleUpdateField("card-2", "btnBgColor", e.target.value)}
                        className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={card2.btnBgColor}
                        onChange={(e) => handleUpdateField("card-2", "btnBgColor", e.target.value)}
                        placeholder="#FFFFFF"
                        className="flex-1 px-2 py-1 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Button Text Color
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={card2.btnTextColor.startsWith("#") ? card2.btnTextColor : "#111111"}
                        onChange={(e) => handleUpdateField("card-2", "btnTextColor", e.target.value)}
                        className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={card2.btnTextColor}
                        onChange={(e) => handleUpdateField("card-2", "btnTextColor", e.target.value)}
                        placeholder="#111111"
                        className="flex-1 px-2 py-1 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Photos: Primary Image */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Card Product Photo
                </label>

                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      Primary Product Photo
                    </span>
                    <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs">
                      <Upload className="w-3 h-3 text-[#FF7A00]" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "card-2", "image1")}
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                      <Image
                        src={card2.image1 || "/products/helicopter-perfume.jpg"}
                        alt="Preview"
                        fill
                        unoptimized={card2.image1?.startsWith("data:") || card2.image1?.startsWith("http")}
                        className="object-cover"
                      />
                    </div>
                    <input
                      type="text"
                      value={card2.image1}
                      onChange={(e) => handleUpdateField("card-2", "image1", e.target.value)}
                      placeholder="/products/helicopter-perfume.jpg"
                      className="flex-1 px-3 py-1.5 text-xs font-mono rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  {/* Preset quick picks */}
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[10px] text-slate-400 mr-1">Presets:</span>
                    {PHOTO_PRESETS.map((p) => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() => handleUpdateField("card-2", "image1", p.url)}
                        className="px-2 py-0.5 rounded-md text-[10px] bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          STICKY BOTTOM SAVE BAR (WHEN DRAFT HAS UNSAVED EDITS)
         ======================================================== */}
      {isDirty && (
        <div className="sticky bottom-4 z-40 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-slideUp">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] animate-ping" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">
                Unsaved changes in live preview
              </p>
              <p className="text-[11px] text-slate-400">
                Customers on the live site will not see these changes until you click "Save Changes".
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDiscardChanges}
              disabled={saving}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Discard Draft
            </button>
            <button
              type="button"
              onClick={handleSaveToLive}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold bg-[#FF7A00] text-white hover:bg-[#E66E00] shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
            >
              {saving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{saving ? "Publishing Changes..." : "Save Changes to Live Website"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
