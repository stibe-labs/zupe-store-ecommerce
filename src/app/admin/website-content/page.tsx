"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Palette,
  Image as ImageIcon,
  Tag,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Sliders,
  Layers,
  X,
  Check,
  ChevronRight,
  Info,
  Upload,
  Smartphone,
  Monitor,
  Armchair,
  Headphones,
  Leaf,
  Car,
  UtensilsCrossed,
  PenTool,
  Footprints,
  Watch,
  Heart,
  Gift,
} from "lucide-react";
import { HeroBannerSlide, StoreCategory } from "@/lib/storeContent";

const IMAGE_PRESETS = [
  { label: "Water Ripple Lamp", url: "/products/hero-banner.jpg" },
  { label: "Helicopter Perfume", url: "/products/helicopter-perfume.jpg" },
  { label: "Powerbank Earbuds", url: "/products/powerbank-earbuds.jpg" },
  { label: "Mini Steam Iron", url: "/products/iron/iron-green.jpg" },
  { label: "Car Diffuser", url: "/products/car-perfume.jpg" },
  { label: "Crystal Lamp", url: "/products/ripple-lamp.jpg" },
];

const MOBILE_IMAGE_PRESETS = [
  { label: "Ripple Lamp (Square)", url: "/products/ripple/ripple-amber.jpg" },
  { label: "Helicopter (Square)", url: "/products/helicopter/heli-black.jpg" },
  { label: "Earbuds (Square)", url: "/products/earbuds/earbuds-matte.jpg" },
  { label: "Steam Iron (Portrait)", url: "/products/iron/iron-green.jpg" },
];

const CATEGORY_ICON_PRESETS = [
  { name: "Armchair", label: "Furniture / Home", Icon: Armchair },
  { name: "Headphones", label: "Gadgets / Audio", Icon: Headphones },
  { name: "Sparkles", label: "Beauty / Care", Icon: Sparkles },
  { name: "Leaf", label: "Health / Nature", Icon: Leaf },
  { name: "Car", label: "Automotive", Icon: Car },
  { name: "UtensilsCrossed", label: "Kitchen / Dining", Icon: UtensilsCrossed },
  { name: "PenTool", label: "Stationery / Office", Icon: PenTool },
  { name: "Footprints", label: "Pets / Animals", Icon: Footprints },
  { name: "Smartphone", label: "Mobiles / Tech", Icon: Smartphone },
  { name: "Watch", label: "Watches / Accessories", Icon: Watch },
  { name: "Heart", label: "Wellness / Favorites", Icon: Heart },
  { name: "Gift", label: "Gifts / Combos", Icon: Gift },
  { name: "Tag", label: "General Products", Icon: Tag },
];

const CATEGORY_COLORS = [
  { bg: "bg-[#FEEBEA]", text: "text-[#E0533C]", label: "Warm Coral" },
  { bg: "bg-[#E0F2FE]", text: "text-[#0284C7]", label: "Sky Blue" },
  { bg: "bg-[#F3E8FF]", text: "text-[#9333EA]", label: "Purple" },
  { bg: "bg-[#DCFCE7]", text: "text-[#16A34A]", label: "Fresh Green" },
  { bg: "bg-[#FEF3C7]", text: "text-[#D97706]", label: "Amber Gold" },
  { bg: "bg-[#FFEDD5]", text: "text-[#EA580C]", label: "Tangerine" },
  { bg: "bg-[#FCE7F3]", text: "text-[#DB2777]", label: "Soft Pink" },
  { bg: "bg-[#E0E7FF]", text: "text-[#4F46E5]", label: "Indigo" },
];

export default function WebsiteContentPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"banners" | "categories">("banners");

  const [banners, setBanners] = useState<HeroBannerSlide[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Banner Modal state
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBannerSlide | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [bannerForm, setBannerForm] = useState({
    badge: "",
    titleLine1: "",
    titleLine2: "",
    description: "",
    ctaText: "Explore Now",
    ctaLink: "/products",
    image: "/products/hero-banner.jpg",
    mobileImage: "",
    taglineRight: "Drive In Luxury ♡",
    active: true,
  });

  // Category Modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<StoreCategory | null>(null);
  const [categoryIconTab, setCategoryIconTab] = useState<"presets" | "custom">("presets");
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    icon: "Tag",
    customIcon: "",
    bgColor: "bg-[#FEEBEA]",
    iconColor: "text-[#E0533C]",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    active: true,
  });

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "banner" | "category";
    id: string;
    title: string;
  } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bannersRes, categoriesRes] = await Promise.all([
        fetch("/api/content/banners?all=true"),
        fetch("/api/content/categories?all=true"),
      ]);

      const bannersData = await bannersRes.json();
      const categoriesData = await categoriesRes.json();

      if (bannersData.success && bannersData.banners) {
        setBanners(bannersData.banners);
      }
      if (categoriesData.success && categoriesData.categories) {
        setCategories(categoriesData.categories);
      }
    } catch (err) {
      console.error("Failed to load website content:", err);
      setMessage({ type: "error", text: "Failed to connect to content database" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // File upload helper for direct image uploads (converts file to base64 Data URL)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onSuccess(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // --- Banner Actions ---
  const handleOpenAddBanner = () => {
    setEditingBanner(null);
    setPreviewMode("desktop");
    setBannerForm({
      badge: "PREMIUM LIFESTYLE ESSENTIALS",
      titleLine1: "New Arrival Collection",
      titleLine2: "Style & Comfort.",
      description: "Discover modern products tailored to upgrade your everyday lifestyle.",
      ctaText: "Shop Collection",
      ctaLink: "/products",
      image: "/products/hero-banner.jpg",
      mobileImage: "",
      taglineRight: "Special Edition ♡",
      active: true,
    });
    setBannerModalOpen(true);
  };

  const handleOpenEditBanner = (b: HeroBannerSlide) => {
    setEditingBanner(b);
    setPreviewMode(b.mobileImage ? "mobile" : "desktop");
    setBannerForm({
      badge: b.badge,
      titleLine1: b.titleLine1,
      titleLine2: b.titleLine2,
      description: b.description,
      ctaText: b.ctaText,
      ctaLink: b.ctaLink,
      image: b.image,
      mobileImage: b.mobileImage || "",
      taglineRight: b.taglineRight || "",
      active: b.active !== false,
    });
    setBannerModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingBanner) {
        // Update existing banner
        const res = await fetch("/api/content/banners", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingBanner.id,
            updates: bannerForm,
          }),
        });
        const data = await res.json();
        if (data.success && data.banners) {
          setBanners(data.banners);
          setBannerModalOpen(false);
          showToast("success", "Hero banner updated successfully!");
        } else {
          showToast("error", data.error || "Failed to update banner");
        }
      } else {
        // Add new banner
        const res = await fetch("/api/content/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bannerForm),
        });
        const data = await res.json();
        if (data.success && data.banners) {
          setBanners(data.banners);
          setBannerModalOpen(false);
          showToast("success", "New hero banner published successfully!");
        } else {
          showToast("error", data.error || "Failed to create banner");
        }
      }
    } catch (err: any) {
      showToast("error", err.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBannerActive = async (b: HeroBannerSlide) => {
    try {
      const res = await fetch("/api/content/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: b.id,
          updates: { active: !b.active },
        }),
      });
      const data = await res.json();
      if (data.success && data.banners) {
        setBanners(data.banners);
        showToast("success", `Banner ${!b.active ? "activated" : "paused"}`);
      }
    } catch (err: any) {
      showToast("error", "Failed to update banner status");
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      const res = await fetch(`/api/content/banners?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success && data.banners) {
        setBanners(data.banners);
        setDeleteConfirm(null);
        showToast("success", "Hero banner removed");
      } else {
        showToast("error", data.error || "Failed to delete");
      }
    } catch (err: any) {
      showToast("error", "Failed to delete banner");
    }
  };

  // --- Category Actions ---
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryIconTab("presets");
    setCategoryForm({
      name: "",
      slug: "",
      icon: "Tag",
      customIcon: "",
      bgColor: "bg-[#FEEBEA]",
      iconColor: "text-[#E0533C]",
      showInNavbar: true,
      showInPills: true,
      showInCollections: true,
      active: true,
    });
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (c: StoreCategory) => {
    setEditingCategory(c);
    setCategoryIconTab(c.customIcon ? "custom" : "presets");
    setCategoryForm({
      name: c.name,
      slug: c.slug,
      icon: c.icon || "Tag",
      customIcon: c.customIcon || "",
      bgColor: c.bgColor || "bg-[#FEEBEA]",
      iconColor: c.iconColor || "text-[#E0533C]",
      showInNavbar: c.showInNavbar !== false,
      showInPills: c.showInPills !== false,
      showInCollections: c.showInCollections !== false,
      active: c.active !== false,
    });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    setSaving(true);
    try {
      if (editingCategory) {
        const res = await fetch("/api/content/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingCategory.id,
            updates: {
              ...categoryForm,
              slug: categoryForm.slug.trim() || categoryForm.name.trim(),
            },
          }),
        });
        const data = await res.json();
        if (data.success && data.categories) {
          setCategories(data.categories);
          setCategoryModalOpen(false);
          showToast("success", "Category updated successfully!");
        } else {
          showToast("error", data.error || "Failed to update category");
        }
      } else {
        const res = await fetch("/api/content/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...categoryForm,
            slug: categoryForm.slug.trim() || categoryForm.name.trim(),
          }),
        });
        const data = await res.json();
        if (data.success && data.categories) {
          setCategories(data.categories);
          setCategoryModalOpen(false);
          showToast("success", `Category "${categoryForm.name}" created!`);
        } else {
          showToast("error", data.error || "Failed to create category");
        }
      }
    } catch (err: any) {
      showToast("error", err.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCategoryField = async (c: StoreCategory, field: "active" | "showInNavbar" | "showInPills") => {
    try {
      const res = await fetch("/api/content/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: c.id,
          updates: { [field]: !c[field] },
        }),
      });
      const data = await res.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
        showToast("success", "Visibility preference saved");
      }
    } catch (err: any) {
      showToast("error", "Failed to update category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/content/categories?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
        setDeleteConfirm(null);
        showToast("success", "Category deleted successfully");
      } else {
        showToast("error", data.error || "Failed to delete");
      }
    } catch (err: any) {
      showToast("error", "Failed to delete category");
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm("Reset all banners and categories to official default templates?")) return;
    setSaving(true);
    try {
      await Promise.all([
        fetch("/api/content/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reset_defaults" }),
        }),
        fetch("/api/content/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reset_defaults" }),
        }),
      ]);
      await fetchData();
      showToast("success", "Templates reset to defaults");
    } catch (err: any) {
      showToast("error", "Reset failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 overflow-hidden">
        {/* Header */}
        <AdminHeader
          onOpenMobile={() => setMobileSidebarOpen(true)}
          onRefresh={fetchData}
          isRefreshing={loading}
        />

        {/* Scrollable Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-orange-50 text-[#FA521C]">
                  <Palette className="w-5 h-5" />
                </span>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
                  Website Content & Store Customizer
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Super Admin portal to manage hero promotional banners and categories across mobile & web in real-time.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Live Site</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>

              <button
                type="button"
                onClick={handleResetDefaults}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                title="Restore default banners & categories"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>
            </div>
          </div>

          {/* Toast Message */}
          {message && (
            <div
              className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border animate-fadeIn ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Tabs Selector */}
          <div className="flex border-b border-slate-200 gap-4">
            <button
              onClick={() => setActiveTab("banners")}
              className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "banners"
                  ? "border-[#FA521C] text-[#FA521C]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Hero Banners & Slides</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-extrabold">
                {banners.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("categories")}
              className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "categories"
                  ? "border-[#FA521C] text-[#FA521C]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Store Categories</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-extrabold">
                {categories.length}
              </span>
            </button>
          </div>

          {/* ========================================================
              TAB 1: HERO BANNERS & SLIDES
             ======================================================== */}
          {activeTab === "banners" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Active Hero Banners ({banners.filter((b) => b.active !== false).length} / {banners.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Banners rotate automatically on the home page every 5 seconds with cross-fade transition.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddBanner}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FA521C] text-white text-xs font-bold hover:bg-[#E04515] transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add New Hero Banner</span>
                </button>
              </div>

              {loading ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#FA521C] mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Loading hero banners...</p>
                </div>
              ) : banners.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No Hero Banners Found</p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">Click below to add your first banner or restore defaults.</p>
                  <button
                    onClick={handleResetDefaults}
                    className="px-4 py-2 rounded-xl bg-orange-50 text-[#FA521C] text-xs font-bold hover:bg-orange-100"
                  >
                    Load Default Hero Banners
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {banners.map((slide, idx) => (
                    <div
                      key={slide.id}
                      className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
                    >
                      {/* Banner Mockup Preview */}
                      <div className="relative h-48 sm:h-56 bg-[#18130E] text-white overflow-hidden p-5 flex flex-col justify-between">
                        <Image
                          src={slide.image}
                          alt={slide.titleLine1}
                          fill
                          className="object-cover object-right opacity-70"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

                        {/* Top info badge inside preview */}
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-widest text-orange-200 border border-white/10">
                              Slide #{idx + 1} • {slide.badge}
                            </span>
                            {slide.mobileImage ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[9px] font-bold flex items-center gap-1 shadow-xs">
                                <Smartphone className="w-2.5 h-2.5" /> Mobile Ratio ✓
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 text-[9px] font-medium flex items-center gap-1 border border-white/10">
                                <Monitor className="w-2.5 h-2.5" /> Auto Scaled
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-amber-200">
                            {slide.taglineRight}
                          </span>
                        </div>

                        {/* Bottom text inside preview */}
                        <div className="relative z-10 max-w-sm">
                          <h3 className="text-lg sm:text-xl font-black font-display text-white leading-tight">
                            {slide.titleLine1}{" "}
                            <span className="text-[#FA521C]">{slide.titleLine2}</span>
                          </h3>
                          <p className="text-[11px] text-slate-300 line-clamp-2 mt-1">
                            {slide.description}
                          </p>
                          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FA521C] text-white text-[10px] font-bold">
                            <span>{slide.ctaText}</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>

                      {/* Card Controls & Details */}
                      <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleBannerActive(slide)}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                              slide.active !== false
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {slide.active !== false ? "● Active on Site" : "○ Paused"}
                          </button>
                          <span className="text-xs text-slate-500 font-mono truncate max-w-[140px] sm:max-w-[200px]">
                            {slide.ctaLink}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditBanner(slide)}
                            className="p-2 text-slate-600 hover:text-[#FA521C] hover:bg-orange-50 rounded-xl transition-colors cursor-pointer"
                            title="Edit banner details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                type: "banner",
                                id: slide.id,
                                title: `${slide.titleLine1} ${slide.titleLine2}`,
                              })
                            }
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Delete banner"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB 2: STORE CATEGORIES
             ======================================================== */}
          {activeTab === "categories" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Store Categories ({categories.filter((c) => c.active !== false).length} Active)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Updates here sync across Navbar, Home Category Pills, Search modal, and Product add/edit dropdowns.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddCategory}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FA521C] text-white text-xs font-bold hover:bg-[#E04515] transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add New Category</span>
                </button>
              </div>

              {loading ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#FA521C] mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Loading categories...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <Tag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No Categories Found</p>
                  <button
                    onClick={handleResetDefaults}
                    className="mt-3 px-4 py-2 rounded-xl bg-orange-50 text-[#FA521C] text-xs font-bold hover:bg-orange-100"
                  >
                    Load Default Categories
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Category Name</th>
                          <th className="py-3 px-4">Query / Slug</th>
                          <th className="py-3 px-4 text-center">In Navbar</th>
                          <th className="py-3 px-4 text-center">In Home Pills</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {categories.map((cat) => (
                          <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                            {/* Name + Icon preview */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs overflow-hidden ${
                                    cat.bgColor || "bg-orange-50"
                                  } ${cat.iconColor || "text-[#FA521C]"}`}
                                >
                                  {cat.customIcon ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={cat.customIcon}
                                      alt={cat.name}
                                      className="w-5 h-5 object-contain rounded-full"
                                    />
                                  ) : (
                                    (() => {
                                      const match = CATEGORY_ICON_PRESETS.find((p) => p.name === cat.icon);
                                      if (match) {
                                        const IconComp = match.Icon;
                                        return <IconComp className="w-4 h-4" />;
                                      }
                                      return <Tag className="w-4 h-4" />;
                                    })()
                                  )}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 block">{cat.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {cat.customIcon ? "Custom Icon • " : ""}ID: {cat.id}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Slug */}
                            <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                              /products?category={encodeURIComponent(cat.slug || cat.name)}
                            </td>

                            {/* In Navbar toggle */}
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleCategoryField(cat, "showInNavbar")}
                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                                  cat.showInNavbar !== false
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                {cat.showInNavbar !== false ? "Visible" : "Hidden"}
                              </button>
                            </td>

                            {/* In Home Pills toggle */}
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleCategoryField(cat, "showInPills")}
                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                                  cat.showInPills !== false
                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                    : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                {cat.showInPills !== false ? "Visible" : "Hidden"}
                              </button>
                            </td>

                            {/* Active status */}
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleCategoryField(cat, "active")}
                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                                  cat.active !== false
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {cat.active !== false ? "Active" : "Disabled"}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Link
                                  href={`/products?category=${encodeURIComponent(cat.slug || cat.name)}`}
                                  target="_blank"
                                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="View on store"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditCategory(cat)}
                                  className="p-1.5 text-slate-500 hover:text-[#FA521C] hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                                  title="Edit category"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteConfirm({
                                      type: "category",
                                      id: cat.id,
                                      title: cat.name,
                                    })
                                  }
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete category"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ========================================================
          MODAL: ADD / EDIT HERO BANNER
         ======================================================== */}
      {bannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scaleIn">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingBanner ? "Edit Hero Banner Slide" : "Add New Hero Banner"}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure headings, imagery, and target CTA button.
                </p>
              </div>
              <button
                onClick={() => setBannerModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Live Dual Preview Box (Desktop vs Mobile) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Live Banner Preview ({previewMode === "desktop" ? "Desktop 16:9 Landscape" : "Mobile 4:5 Phone View"})
                  </label>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setPreviewMode("desktop")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        previewMode === "desktop"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Desktop 16:9</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode("mobile")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        previewMode === "mobile"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Mobile 4:5</span>
                    </button>
                  </div>
                </div>

                {previewMode === "desktop" ? (
                  /* Desktop Preview */
                  <div className="relative h-44 sm:h-52 rounded-2xl bg-[#18130E] text-white overflow-hidden p-4 flex flex-col justify-between border border-slate-200 shadow-xs">
                    <Image
                      src={bannerForm.image || "/products/hero-banner.jpg"}
                      alt={bannerForm.titleLine1 || "Preview"}
                      fill
                      className="object-cover object-right opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-200">
                        {bannerForm.badge || "BADGE"}
                      </span>
                      <span className="text-[10px] text-amber-200">{bannerForm.taglineRight}</span>
                    </div>
                    <div className="relative z-10 max-w-xs">
                      <h4 className="text-base font-black text-white leading-tight">
                        {bannerForm.titleLine1 || "Heading Line 1"}{" "}
                        <span className="text-[#FA521C]">{bannerForm.titleLine2 || "Highlight"}</span>
                      </h4>
                      <p className="text-[10px] text-slate-300 truncate mt-0.5">
                        {bannerForm.description || "Description preview goes here..."}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FA521C] text-white text-[10px] font-bold">
                        <span>{bannerForm.ctaText}</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Mobile Phone Frame Preview */
                  <div className="relative max-w-[280px] mx-auto h-64 rounded-3xl bg-[#18130E] text-white overflow-hidden p-4 flex flex-col justify-between border-4 border-slate-800 shadow-xl">
                    <Image
                      src={bannerForm.mobileImage || bannerForm.image || "/products/hero-banner.jpg"}
                      alt={bannerForm.titleLine1 || "Preview"}
                      fill
                      className="object-cover object-center opacity-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30" />
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-orange-200 bg-black/40 px-2 py-0.5 rounded-full">
                        {bannerForm.badge || "MOBILE VIEW"}
                      </span>
                      <span className="text-[9px] text-amber-200">{bannerForm.taglineRight}</span>
                    </div>
                    <div className="relative z-10 text-center pb-2">
                      <h4 className="text-sm font-black text-white leading-snug">
                        {bannerForm.titleLine1 || "Heading Line 1"}{" "}
                        <span className="text-[#FA521C]">{bannerForm.titleLine2 || "Highlight"}</span>
                      </h4>
                      <p className="text-[10px] text-slate-300 line-clamp-2 mt-1">
                        {bannerForm.description || "Description preview..."}
                      </p>
                      <div className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FA521C] text-white text-[10px] font-bold">
                        <span>{bannerForm.ctaText}</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Photo 1: Desktop View Photo (Landscape 16:9) */}
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-blue-600" />
                    <label className="text-xs font-bold text-slate-800">
                      1. Desktop Banner Photo (16:9 Landscape) *
                    </label>
                  </div>
                  <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    Recommended: 1920×800 (16:9)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={bannerForm.image}
                    onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                    placeholder="Desktop image URL or click Upload File"
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#FA521C]"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-black text-white text-xs font-bold transition-all shadow-xs shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (dataUrl) => setBannerForm({ ...bannerForm, image: dataUrl }))}
                    />
                  </label>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <span className="text-[10px] font-bold text-slate-400 self-center">Presets:</span>
                  {IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setBannerForm({ ...bannerForm, image: preset.url })}
                      className="px-2 py-0.5 rounded-lg bg-white hover:bg-orange-50 hover:text-[#FA521C] text-[10px] font-semibold text-slate-600 border border-slate-200 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo 2: Mobile View Photo (Portrait 4:5 or 1:1) */}
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <label className="text-xs font-bold text-slate-800">
                      2. Mobile Banner Photo (4:5 / 1:1 Portrait)
                    </label>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Recommended: 800×1000 (4:5) or 800×800 (1:1)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={bannerForm.mobileImage}
                    onChange={(e) => setBannerForm({ ...bannerForm, mobileImage: e.target.value })}
                    placeholder="Optional: mobile image URL or click Upload File"
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#FA521C]"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Mobile Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (dataUrl) => setBannerForm({ ...bannerForm, mobileImage: dataUrl }))}
                    />
                  </label>
                  {bannerForm.mobileImage && (
                    <button
                      type="button"
                      onClick={() => setBannerForm({ ...bannerForm, mobileImage: "" })}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Clear mobile image (falls back to desktop photo)"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="font-bold text-slate-400 self-center">Presets:</span>
                    {MOBILE_IMAGE_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setBannerForm({ ...bannerForm, mobileImage: preset.url })}
                        className="px-2 py-0.5 rounded-lg bg-white hover:bg-emerald-50 hover:text-emerald-700 text-[10px] font-semibold text-slate-600 border border-slate-200 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <span className="italic text-slate-400">If blank, desktop photo is used</span>
                </div>
              </div>

              {/* Badge & Right Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Eyebrow / Badge Text
                  </label>
                  <input
                    type="text"
                    value={bannerForm.badge}
                    onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value })}
                    placeholder="e.g. PREMIUM LIFESTYLE ESSENTIALS"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#FA521C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Luxury Tagline (Right Corner)
                  </label>
                  <input
                    type="text"
                    value={bannerForm.taglineRight}
                    onChange={(e) => setBannerForm({ ...bannerForm, taglineRight: e.target.value })}
                    placeholder="e.g. Drive In Luxury ♡"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#FA521C]"
                  />
                </div>
              </div>

              {/* Title 1 & Title 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Heading Line 1 (White text) *
                  </label>
                  <input
                    type="text"
                    required
                    value={bannerForm.titleLine1}
                    onChange={(e) => setBannerForm({ ...bannerForm, titleLine1: e.target.value })}
                    placeholder="e.g. Car Accessories"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#FA521C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Heading Line 2 (Orange highlight)
                  </label>
                  <input
                    type="text"
                    value={bannerForm.titleLine2}
                    onChange={(e) => setBannerForm({ ...bannerForm, titleLine2: e.target.value })}
                    placeholder="e.g. Style & Comfort."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#FA521C] focus:outline-none focus:border-[#FA521C]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Subtitle
                </label>
                <textarea
                  rows={2}
                  value={bannerForm.description}
                  onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
                  placeholder="e.g. Upgrade your driving experience with solar powered diffusing fragrances..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#FA521C]"
                />
              </div>

              {/* CTA Button Text & Target Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={bannerForm.ctaText}
                    onChange={(e) => setBannerForm({ ...bannerForm, ctaText: e.target.value })}
                    placeholder="e.g. Explore Now"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#FA521C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CTA Target Link
                  </label>
                  <input
                    type="text"
                    value={bannerForm.ctaLink}
                    onChange={(e) => setBannerForm({ ...bannerForm, ctaLink: e.target.value })}
                    placeholder="e.g. /products?category=Car+Accessories"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#FA521C]"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="banner-active"
                  checked={bannerForm.active}
                  onChange={(e) => setBannerForm({ ...bannerForm, active: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FA521C] focus:ring-[#FA521C]"
                />
                <label htmlFor="banner-active" className="text-xs font-bold text-slate-800">
                  Active (Display this banner in home hero rotation)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBannerModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FA521C] hover:bg-[#E04515] disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingBanner ? "Save Changes" : "Publish Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT STORE CATEGORY
         ======================================================== */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden shadow-2xl animate-scaleIn">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingCategory ? "Edit Store Category" : "Add New Category"}
                </h3>
                <p className="text-xs text-slate-500">
                  This category will sync across navbar, pills, filters, and admin product dropdowns.
                </p>
              </div>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCategoryForm({
                      ...categoryForm,
                      name: val,
                      slug: !editingCategory ? val : categoryForm.slug,
                    });
                  }}
                  placeholder="e.g. Gaming Gear, Pet Essentials, Kitchenware"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FA521C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Query Parameter / URL Slug
                </label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  placeholder="e.g. Gaming Gear (will be /products?category=Gaming+Gear)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:border-[#FA521C]"
                />
              </div>

              {/* Category Icon & Appearance */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Category Icon
                  </label>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setCategoryIconTab("presets")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        categoryIconTab === "presets"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryIconTab("custom")}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                        categoryIconTab === "custom"
                          ? "bg-white text-[#FA521C] shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>Custom Icon</span>
                      {categoryForm.customIcon && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FA521C]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Live Circular Pill Preview */}
                <div className="mb-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-200 flex items-center gap-3.5">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xs shrink-0 transition-all overflow-hidden ${categoryForm.bgColor} ${categoryForm.iconColor}`}
                  >
                    {categoryForm.customIcon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={categoryForm.customIcon}
                        alt="Preview"
                        className="w-7 h-7 object-contain"
                      />
                    ) : (
                      (() => {
                        const match = CATEGORY_ICON_PRESETS.find(
                          (p) => p.name === categoryForm.icon
                        );
                        if (match) {
                          const IconComp = match.Icon;
                          return <IconComp className="w-6 h-6" />;
                        }
                        return <Tag className="w-6 h-6" />;
                      })()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Live Storefront Pill Preview
                    </span>
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {categoryForm.name || "Category Label"}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {categoryForm.customIcon
                        ? "Custom uploaded icon active"
                        : `Preset icon: ${categoryForm.icon}`}
                    </span>
                  </div>
                  {categoryForm.customIcon && (
                    <button
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, customIcon: "" })}
                      className="px-2 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {categoryIconTab === "presets" ? (
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block mb-2">
                      Choose a system preset icon for this category:
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-50/50 rounded-xl border border-slate-200">
                      {CATEGORY_ICON_PRESETS.map((preset) => {
                        const IconC = preset.Icon;
                        const isSelected =
                          categoryForm.icon === preset.name && !categoryForm.customIcon;
                        return (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() =>
                              setCategoryForm({
                                ...categoryForm,
                                icon: preset.name,
                                customIcon: "",
                              })
                            }
                            className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all border ${
                              isSelected
                                ? "bg-white border-[#FA521C] shadow-xs text-[#FA521C]"
                                : "bg-white hover:bg-slate-50 border-slate-200/60 text-slate-700"
                            }`}
                            title={preset.label}
                          >
                            <IconC className="w-4 h-4" />
                            <span className="text-[10px] font-bold truncate max-w-full">
                              {preset.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Upload Custom Icon / Artwork
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Supports PNG, SVG, WebP
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={categoryForm.customIcon}
                        onChange={(e) =>
                          setCategoryForm({ ...categoryForm, customIcon: e.target.value })
                        }
                        placeholder="Paste image/SVG URL or upload below"
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#FA521C]"
                      />
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-black text-white text-xs font-bold transition-all shadow-xs shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Icon</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleFileUpload(e, (dataUrl) =>
                              setCategoryForm({ ...categoryForm, customIcon: dataUrl })
                            )
                          }
                        />
                      </label>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      💡 Tip: Use a transparent PNG or SVG icon for best visual results inside the circular pill background.
                    </p>
                  </div>
                )}
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pill Color Theme
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORY_COLORS.map((col) => (
                    <button
                      key={col.label}
                      type="button"
                      onClick={() =>
                        setCategoryForm({
                          ...categoryForm,
                          bgColor: col.bg,
                          iconColor: col.text,
                        })
                      }
                      className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center border transition-all ${
                        col.bg
                      } ${col.text} ${
                        categoryForm.bgColor === col.bg
                          ? "border-[#FA521C] ring-2 ring-[#FA521C]/20"
                          : "border-transparent"
                      }`}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visibility Options */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cat-navbar"
                    checked={categoryForm.showInNavbar}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, showInNavbar: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#FA521C] focus:ring-[#FA521C]"
                  />
                  <label htmlFor="cat-navbar" className="text-xs font-bold text-slate-800">
                    Display in Navbar Sub-Nav Row
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cat-pills"
                    checked={categoryForm.showInPills}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, showInPills: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#FA521C] focus:ring-[#FA521C]"
                  />
                  <label htmlFor="cat-pills" className="text-xs font-bold text-slate-800">
                    Display in Home Circular Category Pills
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cat-active"
                    checked={categoryForm.active}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, active: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#FA521C] focus:ring-[#FA521C]"
                  />
                  <label htmlFor="cat-active" className="text-xs font-bold text-slate-800">
                    Active (Include in product catalog dropdowns & filters)
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FA521C] hover:bg-[#E04515] disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CONFIRMATION MODAL
         ======================================================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-3 shadow-2xl animate-scaleIn">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete{" "}
              <strong className="text-slate-800">"{deleteConfirm.title}"</strong>? This will immediately take effect on the store.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirm.type === "banner") {
                    handleDeleteBanner(deleteConfirm.id);
                  } else {
                    handleDeleteCategory(deleteConfirm.id);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
