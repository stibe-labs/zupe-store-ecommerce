"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Palette,
  Sparkles,
  Dumbbell,
  Check,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Upload,
  Search,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Monitor,
  Smartphone,
  Eye,
  Layers,
  Tag,
  ShoppingBag,
  Sliders,
  Image as ImageIcon,
  Edit2,
  X,
  Flame,
  Info,
} from "lucide-react";
import {
  SupplementShowcaseConfig,
  SupplementCategoryTab,
  ShowcaseItem,
  DEFAULT_SUPPLEMENT_SHOWCASE,
  SUPPLEMENT_COLOR_TEMPLATES,
  SupplementColorTemplate,
} from "@/lib/storeContent";
import { Product } from "@/types/product";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

interface GymSupplementsShowcaseCustomizerProps {
  showToast: (type: "success" | "error", text: string) => void;
}

// Preset Icon suggestions for Gym Categories
const PRESET_CATEGORY_ICONS = [
  { label: "ON Gold Standard Whey", url: "/vittal/catalog/on-gold-standard-whey.png" },
  { label: "Vittal Pure Whey Isolate", url: "/vittal/product-whey-protein-jar.png" },
  { label: "Sports Research Omega-3", url: "/vittal/catalog/sports-research-omega3.png" },
  { label: "ON Creatine Container", url: "/vittal/catalog/on-creatine-container.png" },
  { label: "GNC Creatine Powder", url: "/vittal/catalog/gnc-creatine-monohydrate.png" },
  { label: "MuscleTech Nitro-Tech Fruit Punch", url: "/products/muscletech-nitrotech-fruit-punch.png" },
  { label: "Nitro-Tech Protein Bucket", url: "/vittal/catalog/nitro-tech-protein-bucket.png" },
  { label: "ON Whey Tub", url: "/vittal/catalog/on-whey-protein-tub.png" },
];

export function GymSupplementsShowcaseCustomizer({
  showToast,
}: GymSupplementsShowcaseCustomizerProps) {
  const [savedConfig, setSavedConfig] = useState<SupplementShowcaseConfig>(DEFAULT_SUPPLEMENT_SHOWCASE);
  const [draftConfig, setDraftConfig] = useState<SupplementShowcaseConfig>(DEFAULT_SUPPLEMENT_SHOWCASE);
  const [allProducts, setAllProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  // Active Category Tab for editing
  const [activeTabId, setActiveTabId] = useState<string>("whey_protein");

  // Preview Device: Desktop vs Mobile
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Product Selection Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [modalCategory, setModalCategory] = useState("All");

  // New Category Modal / Input
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("/vittal/catalog/on-gold-standard-whey.png");

  // Load config and products from API
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [configRes, productsRes] = await Promise.all([
          fetch("/api/content/supplement-showcase"),
          fetch("/api/products"),
        ]);

        if (configRes.ok) {
          const configData = await configRes.json();
          if (configData.success && configData.config && isMounted) {
            setSavedConfig(configData.config);
            setDraftConfig(configData.config);
            if (configData.config.categories?.length > 0) {
              setActiveTabId(configData.config.categories[0].id);
            }
          }
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          const items = Array.isArray(productsData) ? productsData : productsData?.products;
          if (Array.isArray(items) && items.length > 0 && isMounted) {
            setAllProducts(items);
          }
        }
      } catch (err) {
        console.error("Failed to load supplement showcase data:", err);
        showToast("error", "Failed to load showcase data from server");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const isDirty = JSON.stringify(savedConfig) !== JSON.stringify(draftConfig);

  const activeCategory: SupplementCategoryTab =
    draftConfig.categories.find((c) => c.id === activeTabId) || draftConfig.categories[0] || {
      id: "whey_protein",
      label: "Whey Protein",
      iconImage: "/vittal/catalog/on-gold-standard-whey.png",
      items: [],
    };

  // Helper: Apply Color Grading Template
  const handleApplyTemplate = (tmpl: SupplementColorTemplate) => {
    setDraftConfig((prev) => ({
      ...prev,
      templateKey: tmpl.id,
      bgGradientFrom: tmpl.from,
      bgGradientVia: tmpl.via,
      bgGradientTo: tmpl.to,
      borderColor: tmpl.border,
    }));
    showToast("success", `Applied "${tmpl.name}" color grading!`);
  };

  // Helper: Save to Live Website
  const handleSaveToLive = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/content/supplement-showcase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: draftConfig }),
      });
      const data = await res.json();
      if (data.success && data.config) {
        setSavedConfig(data.config);
        setDraftConfig(data.config);
        showToast("success", "Gym supplements showcase saved & live on website!");
      } else {
        showToast("error", data.error || "Failed to save showcase changes");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      showToast("error", err.message || "Failed to save showcase");
    } finally {
      setSaving(false);
    }
  };

  // Helper: Reset to Defaults
  const handleResetDefaults = async () => {
    if (!window.confirm("Reset the Gym Supplements Showcase back to original brand defaults?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/content/supplement-showcase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_defaults" }),
      });
      const data = await res.json();
      if (data.success && data.config) {
        setSavedConfig(data.config);
        setDraftConfig(data.config);
        if (data.config.categories?.length > 0) {
          setActiveTabId(data.config.categories[0].id);
        }
        showToast("success", "Showcase restored to brand defaults!");
      }
    } catch (err) {
      showToast("error", "Failed to reset showcase");
    } finally {
      setSaving(false);
    }
  };

  // Helper: Upload Icon Image
  const handleUploadCategoryIcon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIcon(true);
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
        handleUpdateCurrentCategory("iconImage", data.url);
        showToast("success", "Category icon uploaded to cloud storage!");
      } else {
        showToast("error", "Upload failed: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      showToast("error", "Upload error: " + err.message);
    } finally {
      setUploadingIcon(false);
    }
  };

  // Helper: Update a field on active category tab
  const handleUpdateCurrentCategory = (field: keyof SupplementCategoryTab, value: any) => {
    setDraftConfig((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === activeTabId ? { ...c, [field]: value } : c
      ),
    }));
  };

  // Helper: Add New Category
  const handleAddNewCategory = () => {
    if (!newCategoryLabel.trim()) return;
    const newId = newCategoryLabel.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    if (draftConfig.categories.some((c) => c.id === newId)) {
      showToast("error", "A category with this name already exists");
      return;
    }

    const newCat: SupplementCategoryTab = {
      id: newId,
      label: newCategoryLabel.trim(),
      iconImage: newCategoryIcon || "/vittal/catalog/on-gold-standard-whey.png",
      items: [],
    };

    setDraftConfig((prev) => ({
      ...prev,
      categories: [...prev.categories, newCat],
    }));
    setActiveTabId(newId);
    setNewCategoryLabel("");
    setIsAddCategoryOpen(false);
    showToast("success", `Added category "${newCat.label}"!`);
  };

  // Helper: Delete Category
  const handleDeleteCategory = (catId: string, label: string) => {
    if (draftConfig.categories.length <= 1) {
      showToast("error", "You must keep at least 1 category tab");
      return;
    }
    if (!window.confirm(`Delete "${label}" category tab and its products?`)) return;

    setDraftConfig((prev) => {
      const filtered = prev.categories.filter((c) => c.id !== catId);
      return { ...prev, categories: filtered };
    });
    const remaining = draftConfig.categories.filter((c) => c.id !== catId);
    if (remaining.length > 0) {
      setActiveTabId(remaining[0].id);
    }
    showToast("success", `Deleted "${label}" category`);
  };

  // Helper: Add Product to Current Category (Auto Detects Offer Percentage!)
  const handleAddProductToCategory = (p: Product) => {
    // 1. Calculate discount percentage automatically if mrp > price
    const mrp = Number(p.mrp || p.price || 0);
    const price = Number(p.price || 0);
    let discountPercent = 0;
    if (mrp > price && mrp > 0) {
      discountPercent = Math.round(((mrp - price) / mrp) * 100);
    }

    // 2. Auto-detect offer tag (uses product's existing badge or calculates Min/Up To)
    let autoOfferTag = "Special Offer";
    if (p.badge && (p.badge.includes("%") || p.badge.toLowerCase().includes("off"))) {
      autoOfferTag = p.badge;
    } else if (discountPercent > 0) {
      autoOfferTag = `Min. ${discountPercent}% Off`;
    }

    const newItem: ShowcaseItem = {
      id: p.id || `item_${Date.now()}`,
      slug: p.slug || p.id,
      name: p.name,
      subtitle: p.subtitle || p.tagline || "",
      image: p.poster_image || p.image || "/vittal/product-whey-protein-jar.png",
      price: price,
      mrp: mrp,
      discountTag: autoOfferTag,
      badge: p.badge || "",
    };

    setDraftConfig((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => {
        if (c.id === activeTabId) {
          // Avoid duplicate product in same tab
          if (c.items.some((it) => it.id === newItem.id || it.slug === newItem.slug)) {
            return c;
          }
          return {
            ...c,
            items: [...c.items, newItem],
          };
        }
        return c;
      }),
    }));

    showToast("success", `Added "${p.name}" with auto-detected offer (${autoOfferTag})!`);
  };

  // Helper: Remove Product from Current Category
  const handleRemoveProduct = (itemId: string) => {
    setDraftConfig((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => {
        if (c.id === activeTabId) {
          return {
            ...c,
            items: c.items.filter((it) => it.id !== itemId),
          };
        }
        return c;
      }),
    }));
  };

  // Helper: Move Product Left / Right in order
  const handleMoveProduct = (index: number, direction: "left" | "right") => {
    const items = [...(activeCategory.items || [])];
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    handleUpdateCurrentCategory("items", items);
  };

  // Helper: Update a field on a specific product item
  const handleUpdateProductItem = (itemId: string, field: keyof ShowcaseItem, value: any) => {
    setDraftConfig((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => {
        if (c.id === activeTabId) {
          return {
            ...c,
            items: c.items.map((it) => (it.id === itemId ? { ...it, [field]: value } : it)),
          };
        }
        return c;
      }),
    }));
  };

  // Filter products for the modal
  const filteredModalProducts = allProducts.filter((p) => {
    const matchesSearch =
      !modalSearch ||
      p.name?.toLowerCase().includes(modalSearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(modalSearch.toLowerCase());
    const matchesCategory =
      modalCategory === "All" || p.category?.toLowerCase() === modalCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 font-mograph">
      {/* =================================================================== */}
      {/* TOP CONTROLS & SAVE BAR                                             */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E2F5B4] text-[#3D6318] flex items-center justify-center font-bold">
            <Dumbbell className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                Gym Supplements Showcase Customizer
              </h2>
              {isDirty ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                  Unsaved Changes
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  Live Website In Sync
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 font-normal mt-0.5">
              Customize background colors with luxury presets, edit headings, manage category tabs & auto-detect product offers.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-center flex-wrap">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToLive}
            disabled={saving || !isDirty}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isDirty
                ? "bg-[#95CF42] hover:bg-[#85BE33] text-black shadow-md hover:scale-102"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Publishing to Live...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Save Changes to Live Website</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* LIVE INTERACTIVE PREVIEW FRAME                                      */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#6B9E3A]" />
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              Interactive Live Preview
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              (Click tabs or inspect layout in real-time)
            </span>
          </div>

          {/* Device Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setPreviewDevice("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                previewDevice === "desktop"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                previewDevice === "mobile"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile (390px)</span>
            </button>
          </div>
        </div>

        {/* Outer Preview Stage */}
        <div className="bg-neutral-100 rounded-2xl p-3 sm:p-6 flex items-center justify-center overflow-hidden min-h-[440px]">
          <div
            className={`transition-all duration-300 w-full ${
              previewDevice === "mobile"
                ? "max-w-[400px] border-8 border-neutral-800 rounded-[38px] shadow-2xl overflow-hidden bg-neutral-900"
                : "max-w-5xl"
            }`}
          >
            {/* The Live Rendered Card with Preserved Texture */}
            <div
              className="relative rounded-3xl overflow-hidden p-4 sm:p-6 md:p-8 shadow-xl transition-all"
              style={{
                background: `linear-gradient(to bottom, ${draftConfig.bgGradientFrom}, ${draftConfig.bgGradientVia}, ${draftConfig.bgGradientTo})`,
                border: `1px solid ${draftConfig.borderColor}66`,
              }}
            >
              {/* Preserved Micro-Dot Watermark Texture */}
              <div
                className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-overlay"
                style={{
                  backgroundImage: `radial-gradient(#FFFFFF 1.5px, transparent 1.5px), radial-gradient(#FFFFFF 1.5px, ${draftConfig.bgGradientTo} 1.5px)`,
                  backgroundSize: "28px 28px",
                  backgroundPosition: "0 0, 14px 14px",
                }}
              />

              {/* Ambient Glow */}
              <div
                className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 blur-3xl pointer-events-none opacity-40"
                style={{ backgroundColor: draftConfig.borderColor }}
              />

              {/* Headings */}
              <div className="relative mb-3">
                <span className="text-[10px] sm:text-xs font-bold tracking-[0.22em] uppercase text-[#D5EBBF] block mb-1">
                  {draftConfig.overlineText}
                </span>
                <h3 className="font-movault text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  {draftConfig.headingText}
                </h3>
              </div>

              {/* Category Switcher Tabs */}
              <div className="relative flex items-center justify-between sm:justify-start gap-2.5 sm:gap-6 pt-3 pb-2 mb-3 overflow-x-auto no-scrollbar">
                {draftConfig.categories.map((tab) => {
                  const isActive = tab.id === activeTabId;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTabId(tab.id)}
                      className="group flex flex-col items-center shrink-0 cursor-pointer transition-all focus:outline-none"
                    >
                      <div
                        className={`relative w-13 h-13 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all p-2 overflow-hidden ${
                          isActive
                            ? "bg-[#D8ECC0] ring-2 ring-white/95 shadow-md scale-105"
                            : "bg-white/20 hover:bg-white/30 opacity-80 group-hover:opacity-100"
                        }`}
                      >
                        <div className="relative w-full h-full flex items-center justify-center">
                          <Image
                            src={tab.iconImage || "/vittal/catalog/on-gold-standard-whey.png"}
                            alt={tab.label}
                            fill
                            className="object-contain"
                            sizes="64px"
                          />
                        </div>
                      </div>
                      <span
                        className={`font-mograph text-[11px] sm:text-xs mt-1.5 transition-colors text-center whitespace-nowrap ${
                          isActive
                            ? "text-white font-bold tracking-tight"
                            : "text-[#E3F2CE]/80 font-medium"
                        }`}
                      >
                        {tab.label}
                      </span>
                      <div
                        className={`h-0.5 sm:h-1 rounded-full mt-1 transition-all ${
                          isActive ? "w-8 sm:w-12 bg-white" : "w-0 bg-transparent"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Products Row Preview (Swipeable 1-row) */}
              <div className="flex flex-row overflow-x-auto snap-x snap-mandatory gap-2.5 sm:gap-3.5 pb-2 pt-1 no-scrollbar w-full items-stretch">
                {(activeCategory.items || []).length === 0 ? (
                  <div className="w-full py-8 text-center text-white/70 text-xs bg-white/5 rounded-2xl border border-white/10">
                    No products added to this category tab yet. Click "Add Products from Catalog" below.
                  </div>
                ) : (
                  activeCategory.items.map((prod) => (
                    <div
                      key={prod.id}
                      className={`group shrink-0 snap-start flex flex-col ${
                        previewDevice === "mobile"
                          ? "w-[calc((100%-16px)/2.25)] min-w-[calc((100%-16px)/2.25)]"
                          : "w-[calc((100%-48px)/4.25)] min-w-[calc((100%-48px)/4.25)]"
                      } transition-transform`}
                    >
                      <div
                        className={`relative w-full rounded-2xl bg-white flex items-center justify-center overflow-hidden shadow-xs ${
                          previewDevice === "mobile"
                            ? "aspect-[4/5] p-2"
                            : "aspect-square p-2.5 sm:p-3"
                        }`}
                      >
                        <Image
                          src={prod.image || "/vittal/product-whey-protein-jar.png"}
                          alt={prod.name}
                          fill
                          className={`object-contain ${
                            previewDevice === "mobile" ? "p-1.5" : "p-1 sm:p-1.5"
                          }`}
                          sizes="150px"
                        />
                      </div>
                      <h4 className="font-mograph text-[11px] sm:text-xs font-bold text-white text-center leading-snug line-clamp-1 mt-2 px-1">
                        {prod.name}
                      </h4>
                      <p className="font-movault text-xs sm:text-sm font-black text-[#FEF08A] text-center tracking-tight mt-0.5">
                        {prod.discountTag}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Explore Button */}
              <div className="mt-4 sm:mt-5 text-center">
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold text-neutral-950 bg-white shadow-md border border-white px-5 sm:px-7 py-2 rounded-full cursor-pointer font-mograph"
                  style={{
                    backgroundImage: "radial-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px)",
                    backgroundSize: "6px 6px",
                  }}
                >
                  <span>{draftConfig.buttonText}</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SECTION 1: BACKGROUND COLOR GRADING & TEMPLATES                     */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Palette className="w-5 h-5 text-[#6B9E3A]" />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-neutral-950">
              Card Background Color Grading & Luxury Templates
            </h3>
            <p className="text-xs text-neutral-500 font-normal mt-0.5">
              Select one of our store-matching luxury gradient templates, or enter custom colors. The micro-dot texture overlay is always preserved automatically!
            </p>
          </div>
        </div>

        {/* 6 Store-Matching Templates Grid */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Website Matching Color Grading Templates
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {SUPPLEMENT_COLOR_TEMPLATES.map((tmpl) => {
              const isSelected =
                draftConfig.bgGradientFrom === tmpl.from &&
                draftConfig.bgGradientTo === tmpl.to;
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? "border-[#6B9E3A] ring-2 ring-[#6B9E3A]/40 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  {/* Miniature Gradient Strip */}
                  <div
                    className="w-full h-12 rounded-xl mb-2.5 shadow-xs relative overflow-hidden flex items-center justify-center"
                    style={{
                      background: `linear-gradient(to bottom, ${tmpl.from}, ${tmpl.via}, ${tmpl.to})`,
                      border: `1px solid ${tmpl.border}88`,
                    }}
                  >
                    {/* Micro-dot texture overlay simulation */}
                    <div
                      className="absolute inset-0 opacity-15"
                      style={{
                        backgroundImage: "radial-gradient(#FFFFFF 1px, transparent 1px)",
                        backgroundSize: "6px 6px",
                      }}
                    />
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center shadow-md z-10">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-900 truncate">{tmpl.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{tmpl.from}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Color Grading Editor */}
        <div className="pt-3 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Custom Color Fine-Tuning
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* From */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                Top Color (From)
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={draftConfig.bgGradientFrom}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      bgGradientFrom: e.target.value,
                      templateKey: "custom",
                    }))
                  }
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={draftConfig.bgGradientFrom}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      bgGradientFrom: e.target.value,
                      templateKey: "custom",
                    }))
                  }
                  className="w-full text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-[#6B9E3A]"
                />
              </div>
            </div>

            {/* Via */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                Middle Color (Via)
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={draftConfig.bgGradientVia}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      bgGradientVia: e.target.value,
                      templateKey: "custom",
                    }))
                  }
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={draftConfig.bgGradientVia}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      bgGradientVia: e.target.value,
                      templateKey: "custom",
                    }))
                  }
                  className="w-full text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-[#6B9E3A]"
                />
              </div>
            </div>

            {/* To */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                Bottom Color (To)
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={draftConfig.bgGradientTo}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      bgGradientTo: e.target.value,
                      templateKey: "custom",
                    }))
                  }
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={draftConfig.bgGradientTo}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      bgGradientTo: e.target.value,
                      templateKey: "custom",
                    }))
                  }
                  className="w-full text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-[#6B9E3A]"
                />
              </div>
            </div>

            {/* Border & Glow */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                Border & Glow Color
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={draftConfig.borderColor}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      borderColor: e.target.value,
                      templateKey: "custom",
                    }))
                  }
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={draftConfig.borderColor}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      borderColor: e.target.value,
                      templateKey: "custom",
                    }))
                  }
                  className="w-full text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-[#6B9E3A]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SECTION 2: HEADINGS & BUTTON SETTINGS                               */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Edit2 className="w-5 h-5 text-[#6B9E3A]" />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-neutral-950">
              Section Headings & Action Button
            </h3>
            <p className="text-xs text-neutral-500 font-normal mt-0.5">
              Edit the overline category title, main banner heading, and bottom explore button.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Overline */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Overline Subtitle (Small Top Badge)
            </label>
            <input
              type="text"
              value={draftConfig.overlineText}
              onChange={(e) =>
                setDraftConfig((prev) => ({ ...prev, overlineText: e.target.value }))
              }
              placeholder="e.g. PRO GYM NUTRITION"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 focus:outline-[#6B9E3A] bg-white text-slate-900"
            />
          </div>

          {/* Main Heading */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Main Section Headline
            </label>
            <input
              type="text"
              value={draftConfig.headingText}
              onChange={(e) =>
                setDraftConfig((prev) => ({ ...prev, headingText: e.target.value }))
              }
              placeholder="e.g. Fuel Every Workout"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 focus:outline-[#6B9E3A] bg-white text-slate-900"
            />
          </div>

          {/* Button Text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Bottom Button Label
            </label>
            <input
              type="text"
              value={draftConfig.buttonText}
              onChange={(e) =>
                setDraftConfig((prev) => ({ ...prev, buttonText: e.target.value }))
              }
              placeholder="e.g. Explore All Gym Supplements"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 focus:outline-[#6B9E3A] bg-white text-slate-900"
            />
          </div>

          {/* Button Link */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Button Destination Link
            </label>
            <input
              type="text"
              value={draftConfig.buttonLink}
              onChange={(e) =>
                setDraftConfig((prev) => ({ ...prev, buttonLink: e.target.value }))
              }
              placeholder="e.g. /products?category=Gym+Supplementaries"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 focus:outline-[#6B9E3A] bg-white text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SECTION 3: CATEGORY TABS & ICONS MANAGEMENT                        */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-[#6B9E3A]" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-neutral-950">
                Category Tabs & Icon Images
              </h3>
              <p className="text-xs text-neutral-500 font-normal mt-0.5">
                Select a tab to edit its label, change icon image, or manage its assigned products.
              </p>
            </div>
          </div>

          {/* Add Category Tab Button */}
          <button
            type="button"
            onClick={() => setIsAddCategoryOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F4FBE8] text-[#3D6318] hover:bg-[#E5F2D0] border border-[#95CF42]/40 text-xs font-bold transition-colors cursor-pointer self-start sm:self-center"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Category Tab</span>
          </button>
        </div>

        {/* Tab Selection Carousel */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {draftConfig.categories.map((tab) => {
            const isSelected = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#111111] text-white border-black shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-white p-1 relative overflow-hidden shrink-0 border border-slate-200">
                  <Image
                    src={tab.iconImage || "/vittal/catalog/on-gold-standard-whey.png"}
                    alt={tab.label}
                    fill
                    className="object-contain p-0.5"
                    sizes="32px"
                  />
                </div>
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    isSelected ? "bg-white/20 text-[#95CF42]" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {tab.items?.length || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Category Detail Editor Box */}
        <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white p-1.5 relative overflow-hidden border border-slate-300 shadow-2xs">
                <Image
                  src={activeCategory.iconImage || "/vittal/catalog/on-gold-standard-whey.png"}
                  alt={activeCategory.label}
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Editing Tab: <span className="text-[#3D6318]">{activeCategory.label}</span>
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">ID: {activeCategory.id}</p>
              </div>
            </div>

            {/* Delete Tab Button */}
            <button
              type="button"
              onClick={() => handleDeleteCategory(activeCategory.id, activeCategory.label)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer self-start sm:self-center"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Category Tab</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Label Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category Display Name / Label
              </label>
              <input
                type="text"
                value={activeCategory.label}
                onChange={(e) => handleUpdateCurrentCategory("label", e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 focus:outline-[#6B9E3A] bg-white text-slate-900"
              />
            </div>

            {/* Icon Image URL & Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category Icon Image
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={activeCategory.iconImage}
                  onChange={(e) => handleUpdateCurrentCategory("iconImage", e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-xl border border-slate-200 focus:outline-[#6B9E3A] bg-white text-slate-900 truncate"
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingIcon ? "Uploading..." : "Upload"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadCategoryIcon}
                    className="hidden"
                    disabled={uploadingIcon}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Quick Preset Icon Picks */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Quick Pick from Catalog Images:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {PRESET_CATEGORY_ICONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUpdateCurrentCategory("iconImage", preset.url)}
                  className={`p-1.5 rounded-xl border shrink-0 transition-all cursor-pointer bg-white flex items-center gap-1.5 ${
                    activeCategory.iconImage === preset.url
                      ? "border-[#6B9E3A] ring-2 ring-[#6B9E3A]/40"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  title={preset.label}
                >
                  <div className="w-6 h-6 relative">
                    <Image
                      src={preset.url}
                      alt={preset.label}
                      fill
                      className="object-contain"
                      sizes="24px"
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-700 max-w-[100px] truncate">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SECTION 4: PRODUCTS UNDER ACTIVE CATEGORY TAB                       */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#6B9E3A]" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-neutral-950">
                Products in "{activeCategory.label}" ({activeCategory.items?.length || 0})
              </h3>
              <p className="text-xs text-neutral-500 font-normal mt-0.5">
                Manage the products shown when customers select this tab. Offer percentage is auto-detected from price/MRP!
              </p>
            </div>
          </div>

          {/* Open Add Products Modal */}
          <button
            type="button"
            onClick={() => {
              setModalCategory("Gym Supplementaries");
              setIsProductModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#95CF42] hover:bg-[#85BE33] text-black text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-center font-mograph"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Products from Catalog</span>
          </button>
        </div>

        {/* Product List */}
        {(activeCategory.items || []).length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Dumbbell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700 mb-1">
              No products assigned to "{activeCategory.label}"
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 font-normal">
              Click the button below to browse gym supplements and add them to this category tab.
            </p>
            <button
              type="button"
              onClick={() => {
                setModalCategory("Gym Supplementaries");
                setIsProductModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Browse Catalog & Add Products</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeCategory.items.map((prod, idx) => (
              <div
                key={prod.id}
                className="p-3.5 sm:p-4 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Position Badge */}
                  <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>

                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-xl bg-white p-1 border border-slate-200 shrink-0 relative overflow-hidden">
                    <Image
                      src={prod.image || "/vittal/product-whey-protein-jar.png"}
                      alt={prod.name}
                      fill
                      className="object-contain p-0.5"
                      sizes="56px"
                    />
                  </div>

                  {/* Title & Offer Tag Inline Inputs */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={prod.name}
                        onChange={(e) =>
                          handleUpdateProductItem(prod.id, "name", e.target.value)
                        }
                        className="text-xs sm:text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1 w-full max-w-md focus:outline-[#6B9E3A]"
                        placeholder="Product Name"
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-500">Offer Tag:</span>
                      <input
                        type="text"
                        value={prod.discountTag}
                        onChange={(e) =>
                          handleUpdateProductItem(prod.id, "discountTag", e.target.value)
                        }
                        className="text-xs font-extrabold text-[#3D6318] bg-[#F4FBE8] border border-[#95CF42]/40 rounded-lg px-2 py-0.5 w-36 focus:outline-[#6B9E3A]"
                        placeholder="e.g. Min. 25% Off"
                      />
                      <span className="text-[11px] text-slate-400 font-mono">
                        Price: ₹{prod.price} {prod.mrp ? `/ MRP: ₹${prod.mrp}` : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Controls (Reorder & Delete) */}
                <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveProduct(idx, "left")}
                    disabled={idx === 0}
                    className={`p-2 rounded-xl border border-slate-200 transition-colors ${
                      idx === 0
                        ? "text-slate-300 bg-slate-50 cursor-not-allowed"
                        : "text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 cursor-pointer"
                    }`}
                    title="Move Left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMoveProduct(idx, "right")}
                    disabled={idx === activeCategory.items.length - 1}
                    className={`p-2 rounded-xl border border-slate-200 transition-colors ${
                      idx === activeCategory.items.length - 1
                        ? "text-slate-300 bg-slate-50 cursor-not-allowed"
                        : "text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 cursor-pointer"
                    }`}
                    title="Move Right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(prod.id)}
                    className="p-2 rounded-xl text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer ml-1"
                    title="Remove from Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* MODAL: ADD PRODUCT FROM CATALOG WITH AUTO OFFER PERCENTAGE          */}
      {/* =================================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-mograph">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Select Products for "{activeCategory.label}"
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Offers & discounts are automatically detected from the product's regular price and MRP.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Filters */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by title or category..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-200 focus:outline-[#6B9E3A] text-slate-900"
                />
              </div>
              <select
                value={modalCategory}
                onChange={(e) => setModalCategory(e.target.value)}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 focus:outline-[#6B9E3A]"
              >
                <option value="All">All Categories</option>
                <option value="Gym Supplementaries">Gym Supplementaries</option>
                <option value="Gym Supplements">Gym Supplements</option>
                <option value="Outfits">Outfits & Athleisure</option>
                <option value="Dates & Nuts">Dates & Nuts</option>
                <option value="Candy & Chocolates">Candy & Chocolates</option>
              </select>
            </div>

            {/* Modal Products List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {filteredModalProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No matching products found. Try a different search term or category.
                </div>
              ) : (
                filteredModalProducts.map((p) => {
                  const mrp = Number(p.mrp || p.price || 0);
                  const price = Number(p.price || 0);
                  let discount = 0;
                  if (mrp > price && mrp > 0) {
                    discount = Math.round(((mrp - price) / mrp) * 100);
                  }
                  const alreadyAdded = (activeCategory.items || []).some(
                    (it) => it.id === p.id || it.slug === p.slug
                  );

                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        alreadyAdded
                          ? "bg-slate-50 border-slate-200 opacity-60"
                          : "bg-white hover:bg-[#F4FBE8]/50 border-slate-200 hover:border-[#95CF42]/60 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-200 relative shrink-0 overflow-hidden">
                          <Image
                            src={p.poster_image || p.image || "/vittal/product-whey-protein-jar.png"}
                            alt={p.name}
                            fill
                            className="object-contain"
                            sizes="48px"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-xs font-extrabold text-neutral-900">
                              ₹{price}
                            </span>
                            {mrp > price && (
                              <span className="text-[11px] text-slate-400 line-through">
                                ₹{mrp}
                              </span>
                            )}
                            {discount > 0 && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E2F5B4] text-[#3D6318]">
                                Auto Offer: Min. {discount}% Off
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">
                              {p.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={alreadyAdded}
                        onClick={() => handleAddProductToCategory(p)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          alreadyAdded
                            ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                            : "bg-[#95CF42] hover:bg-[#85BE33] text-black shadow-2xs"
                        }`}
                      >
                        {alreadyAdded ? "Added" : "+ Add"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {activeCategory.items?.length || 0} products currently in "{activeCategory.label}"
              </span>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: ADD NEW CATEGORY TAB                                         */}
      {/* =================================================================== */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-mograph">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add New Category Tab</h3>
              <button
                type="button"
                onClick={() => setIsAddCategoryOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category Name (e.g. BCAA, Pre-Workout, Multivitamin)
              </label>
              <input
                type="text"
                value={newCategoryLabel}
                onChange={(e) => setNewCategoryLabel(e.target.value)}
                placeholder="e.g. BCAAs & Amino"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 focus:outline-[#6B9E3A] bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Icon Image:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_CATEGORY_ICONS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNewCategoryIcon(preset.url)}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      newCategoryIcon === preset.url
                        ? "border-[#6B9E3A] ring-2 ring-[#6B9E3A]/40 bg-[#F4FBE8]"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="w-8 h-8 relative mb-1">
                      <Image
                        src={preset.url}
                        alt={preset.label}
                        fill
                        className="object-contain"
                        sizes="32px"
                      />
                    </div>
                    <span className="text-[9px] font-semibold text-slate-600 truncate w-full text-center">
                      {preset.label.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddCategoryOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewCategory}
                disabled={!newCategoryLabel.trim()}
                className="px-5 py-2 rounded-xl bg-[#95CF42] hover:bg-[#85BE33] text-black text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
