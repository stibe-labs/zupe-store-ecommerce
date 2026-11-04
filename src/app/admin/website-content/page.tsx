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
  ChevronLeft,
  Truck,
  Banknote,
  Search,
  ShoppingBag,
  Menu,
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
  Gamepad2,
  LayoutGrid,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { StoreCategory } from "@/lib/storeContent";
import { getSubcategoriesForCategory } from "@/data/zupeProducts";
import { PromoCardsCustomizer } from "@/components/admin/PromoCardsCustomizer";
import { ShowcaseCollectionsCustomizer } from "@/components/admin/ShowcaseCollectionsCustomizer";
import { siteConfig } from "@/config/siteConfig";
import {
  AVAILABLE_CATEGORY_ICONS,
  getSubcategoryFallbackIcon,
  renderIconOrCustom,
} from "@/components/CategoryPills";

const CATEGORY_ICON_PRESETS = [
  { name: "LayoutGrid", label: "All / Grid", Icon: LayoutGrid },
  { name: "Armchair", label: "Furniture / Home", Icon: Armchair },
  { name: "Headphones", label: "Gadgets / Audio", Icon: Headphones },
  { name: "Sparkles", label: "Beauty / Care", Icon: Sparkles },
  { name: "Leaf", label: "Health / Nature", Icon: Leaf },
  { name: "Car", label: "Automotive", Icon: Car },
  { name: "Gamepad2", label: "Kids / Games", Icon: Gamepad2 },
  { name: "Tag", label: "Deals / General", Icon: Tag },
  { name: "UtensilsCrossed", label: "Kitchen / Dining", Icon: UtensilsCrossed },
  { name: "PenTool", label: "Stationery / Office", Icon: PenTool },
  { name: "Footprints", label: "Pets / Animals", Icon: Footprints },
  { name: "Smartphone", label: "Mobiles / Tech", Icon: Smartphone },
  { name: "Watch", label: "Watches / Accessories", Icon: Watch },
  { name: "Heart", label: "Wellness / Favorites", Icon: Heart },
  { name: "Gift", label: "Gifts / Combos", Icon: Gift },
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
  const [activeTab, setActiveTab] = useState<"promo_cards" | "categories" | "showcase">("promo_cards");

  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Category Modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<StoreCategory | null>(null);
  const [categoryIconTab, setCategoryIconTab] = useState<"presets" | "custom">("presets");
  const [applyShapeToAll, setApplyShapeToAll] = useState(false);
  const [newSubcategoryInput, setNewSubcategoryInput] = useState("");
  const [newSubcategoryIcon, setNewSubcategoryIcon] = useState("Smartphone");
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    icon: "Tag",
    customIcon: "",
    iconSize: 85,
    iconShape: "round" as "round" | "square",
    bgColor: "bg-[#FEEBEA]",
    iconColor: "text-[#E0533C]",
    showInNavbar: true,
    showInPills: true,
    showInCollections: true,
    active: true,
    subcategories: [] as string[],
    subcategoryIcons: {} as Record<string, string>,
  });

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Lock background scroll when modals are open
  useEffect(() => {
    if (categoryModalOpen || Boolean(deleteConfirm)) {
      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.classList.remove("modal-open");
        document.documentElement.classList.remove("modal-open");
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [categoryModalOpen, deleteConfirm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content/categories?all=true");
      const categoriesData = await res.json();

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

  // File upload helper: shows instant local preview and uploads to Cloudflare R2 bucket
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onUploaded: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Immediately read as dataURL for instant local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) onUploaded(dataUrl);
    };
    reader.readAsDataURL(file);

    // 2. Upload file directly to Cloudflare R2 bucket via /api/admin/upload
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
        onUploaded(data.url);
        showToast("success", "Uploaded to cloud storage successfully!");
      } else {
        console.warn("Cloud upload response error:", data.error);
      }
    } catch (err: any) {
      console.warn("Direct cloud upload failed, base64 fallback active:", err);
    } finally {
      e.target.value = "";
    }
  };

  // --- Category Actions ---
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryIconTab("presets");
    setApplyShapeToAll(false);
    setCategoryForm({
      name: "",
      slug: "",
      icon: "Tag",
      customIcon: "",
      iconSize: 85,
      iconShape: "round",
      bgColor: "bg-[#FEEBEA]",
      iconColor: "text-[#E0533C]",
      showInNavbar: true,
      showInPills: true,
      showInCollections: true,
      active: true,
      subcategories: [],
      subcategoryIcons: {},
    });
    setNewSubcategoryInput("");
    setNewSubcategoryIcon("Smartphone");
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (c: StoreCategory) => {
    setEditingCategory(c);
    setCategoryIconTab(c.customIcon ? "custom" : "presets");
    setApplyShapeToAll(false);
    const existingSubs = Array.isArray(c.subcategories) && c.subcategories.length > 0
      ? [...c.subcategories]
      : getSubcategoriesForCategory(c.name) || [];

    const existingIcons: Record<string, string> = { ...(c.subcategoryIcons || {}) };
    for (const sub of existingSubs) {
      if (!existingIcons[sub]) {
        existingIcons[sub] = getSubcategoryFallbackIcon(sub);
      }
    }

    setCategoryForm({
      name: c.name,
      slug: c.slug,
      icon: c.icon || "Tag",
      customIcon: c.customIcon || "",
      iconSize: typeof c.iconSize === "number" ? c.iconSize : 85,
      iconShape: c.iconShape || "round",
      bgColor: c.bgColor || "bg-[#FEEBEA]",
      iconColor: c.iconColor || "text-[#E0533C]",
      showInNavbar: c.showInNavbar !== false,
      showInPills: c.showInPills !== false,
      showInCollections: c.showInCollections !== false,
      active: c.active !== false,
      subcategories: existingSubs,
      subcategoryIcons: existingIcons,
    });
    setNewSubcategoryInput("");
    setNewSubcategoryIcon("Smartphone");
    setCategoryModalOpen(true);
  };

  const handleApplyShapeToAll = async (shape: "round" | "square") => {
    setSaving(true);
    try {
      const res = await fetch("/api/content/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_all_shapes",
          iconShape: shape,
        }),
      });
      const data = await res.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
        setCategoryForm((prev) => ({ ...prev, iconShape: shape }));
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("tj_categories_updated", { detail: { categories: data.categories } })
          );
          window.dispatchEvent(
            new CustomEvent("zupe_categories_updated", { detail: { categories: data.categories } })
          );
        }
        showToast(
          "success",
          `All category icons set to ${shape === "square" ? "Curved Square" : "Round Circle"}!`
        );
      } else {
        showToast("error", data.error || "Failed to update shapes");
      }
    } catch (err: any) {
      showToast("error", err.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubcategory = () => {
    const trimmed = newSubcategoryInput.trim();
    if (!trimmed) return;
    if (categoryForm.subcategories.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      showToast("error", `Subcategory "${trimmed}" is already added`);
      return;
    }
    const iconToUse = newSubcategoryIcon || getSubcategoryFallbackIcon(trimmed);
    setCategoryForm((prev) => ({
      ...prev,
      subcategories: [...prev.subcategories, trimmed],
      subcategoryIcons: {
        ...(prev.subcategoryIcons || {}),
        [trimmed]: iconToUse,
      },
    }));
    setNewSubcategoryInput("");
  };

  const handleRemoveSubcategory = (subToRemove: string) => {
    setCategoryForm((prev) => {
      const updatedIcons = { ...(prev.subcategoryIcons || {}) };
      delete updatedIcons[subToRemove];
      return {
        ...prev,
        subcategories: prev.subcategories.filter((s) => s !== subToRemove),
        subcategoryIcons: updatedIcons,
      };
    });
  };

  const handleSubcategoryIconChange = (subcat: string, newIcon: string) => {
    setCategoryForm((prev) => ({
      ...prev,
      subcategoryIcons: {
        ...(prev.subcategoryIcons || {}),
        [subcat]: newIcon,
      },
    }));
  };

  const handleLoadDefaultSubcategories = () => {
    const defaults = getSubcategoriesForCategory(categoryForm.name);
    if (!defaults || defaults.length === 0) {
      showToast("error", "No preset subcategories found for this category name");
      return;
    }
    const combined = Array.from(new Set([...categoryForm.subcategories, ...defaults]));
    const updatedIcons: Record<string, string> = { ...(categoryForm.subcategoryIcons || {}) };
    for (const sub of combined) {
      if (!updatedIcons[sub]) {
        updatedIcons[sub] = getSubcategoryFallbackIcon(sub);
      }
    }
    setCategoryForm((prev) => ({
      ...prev,
      subcategories: combined,
      subcategoryIcons: updatedIcons,
    }));
    showToast("success", `Loaded preset subcategories for ${categoryForm.name || "category"}`);
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
            applyShapeToAll,
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
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("tj_categories_updated", { detail: { categories: data.categories } })
            );
            window.dispatchEvent(
              new CustomEvent("zupe_categories_updated", { detail: { categories: data.categories } })
            );
          }
          showToast(
            "success",
            applyShapeToAll
              ? `Category updated & all icons set to ${categoryForm.iconShape === "square" ? "Curved Square" : "Round"}!`
              : "Category updated successfully!"
          );
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
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("tj_categories_updated", { detail: { categories: data.categories } })
            );
            window.dispatchEvent(
              new CustomEvent("zupe_categories_updated", { detail: { categories: data.categories } })
            );
          }
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
    if (!confirm("Reset store categories to official default templates?")) return;
    setSaving(true);
    try {
      await fetch("/api/content/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_defaults" }),
      });
      await fetchData();
      showToast("success", "Categories reset to defaults");
    } catch (err: any) {
      showToast("error", "Reset failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F4F6FA] text-slate-800 font-sans overflow-hidden">
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* Top Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-orange-50 text-[#002D62]">
                  <Palette className="w-5 h-5" />
                </span>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
                  Website Content & Store Customizer
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Super Admin portal to manage promotional cards, categories, and showcase collections across mobile & web in real-time.
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
                title="Restore default categories"
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
              onClick={() => setActiveTab("promo_cards")}
              className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "promo_cards"
                  ? "border-[#FF7A00] text-[#002D62]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Promo Dual Cards</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-orange-100 text-[#002D62] font-extrabold">
                2 Cards
              </span>
            </button>

            <button
              onClick={() => setActiveTab("categories")}
              className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "categories"
                  ? "border-[#FF7A00] text-[#002D62]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Store Categories</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-extrabold">
                {categories.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("showcase")}
              className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "showcase"
                  ? "border-[#FF7A00] text-[#002D62]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Showcase Collections</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-700 font-extrabold">
                4 Sections
              </span>
            </button>
          </div>

          {/* ========================================================
              TAB: STORE CATEGORIES
             ======================================================== */}
          {activeTab === "categories" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Store Categories ({categories.filter((c) => c.active !== false).length} Active)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Updates here sync across Navbar, Home Category Pills, Search modal, and Product add/edit dropdowns.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Global Shape Switcher */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 px-1.5 hidden md:inline">Shape:</span>
                    <button
                      type="button"
                      onClick={() => handleApplyShapeToAll("round")}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        categories.length > 0 && categories.every((c) => c.iconShape !== "square")
                          ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                      title="Set all category icons to Round (Circle)"
                    >
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />
                      <span>Round</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyShapeToAll("square")}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        categories.length > 0 && categories.every((c) => c.iconShape === "square")
                          ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                      title="Set all category icons to Edge Curved Square"
                    >
                      <div className="w-3.5 h-3.5 rounded-md border-2 border-current" />
                      <span>Curved Square</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenAddCategory}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FFBE00] text-slate-950 text-white text-xs font-bold hover:bg-[#E66E00] transition-all shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add New Category</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#002D62] mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Loading categories...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <Tag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No Categories Found</p>
                  <button
                    onClick={handleResetDefaults}
                    className="mt-3 px-4 py-2 rounded-xl bg-orange-50 text-[#002D62] text-xs font-bold hover:bg-orange-100"
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
                        {categories.map((cat) => {
                          const isAll = cat.id === "all" || cat.name.toLowerCase() === "all categories";
                          const isSquare = cat.iconShape === "square";
                          const shapeClass = isSquare ? "rounded-xl" : "rounded-full";

                          return (
                            <tr key={cat.id} className={`hover:bg-slate-50/70 transition-colors ${isAll ? "bg-blue-50/20" : ""}`}>
                              {/* Name + Icon preview */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-10 h-10 ${shapeClass} flex items-center justify-center font-bold text-xs overflow-hidden shadow-xs shrink-0 ${
                                      cat.bgColor || (isAll ? "bg-[#EEF2FF]" : "bg-orange-50")
                                    } ${cat.iconColor || (isAll ? "text-[#3B82F6]" : "text-[#002D62]")}`}
                                  >
                                    {cat.customIcon ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={cat.customIcon}
                                        alt={cat.name}
                                        style={{
                                          width: `${cat.iconSize || 85}%`,
                                          height: `${cat.iconSize || 85}%`,
                                        }}
                                        className="object-contain"
                                      />
                                    ) : (
                                      (() => {
                                        const match = CATEGORY_ICON_PRESETS.find((p) => p.name === cat.icon);
                                        if (match) {
                                          const IconComp = match.Icon;
                                          return <IconComp className="w-4 h-4" />;
                                        }
                                        return isAll ? <LayoutGrid className="w-4 h-4" /> : <Tag className="w-4 h-4" />;
                                      })()
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-slate-900">{cat.name}</span>
                                      {isAll && (
                                        <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-extrabold text-[10px]">
                                          Primary Home Pill
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {cat.customIcon ? "Custom Icon • " : ""}Shape: {isSquare ? "Curved Square" : "Round"} • ID: {cat.id}
                                    </span>
                                    {/* Subcategories preview tags */}
                                    <div className="flex flex-wrap items-center gap-1 mt-1.5 max-w-sm">
                                      {(() => {
                                        const subs = Array.isArray(cat.subcategories) && cat.subcategories.length > 0
                                          ? cat.subcategories
                                          : getSubcategoriesForCategory(cat.name);
                                        if (subs.length === 0) {
                                          return (
                                            <span className="text-[10px] text-slate-400 italic">
                                              {isAll ? "All Store Products" : "No subcategories"}
                                            </span>
                                          );
                                        }
                                        return (
                                          <>
                                            {subs.slice(0, 3).map((sub) => {
                                              const subIcon = cat.subcategoryIcons?.[sub] || getSubcategoryFallbackIcon(sub);
                                              return (
                                                <span
                                                  key={sub}
                                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                                                >
                                                  <span className="w-2.5 h-2.5 inline-flex items-center justify-center text-slate-500">
                                                    {renderIconOrCustom({ iconName: subIcon, fallbackName: sub, iconSize: 70 })}
                                                  </span>
                                                  <span>{sub}</span>
                                                </span>
                                              );
                                            })}
                                            {subs.length > 3 && (
                                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-orange-50 text-[#002D62] text-[10px] font-bold">
                                                +{subs.length - 3} more
                                              </span>
                                            )}
                                          </>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Slug */}
                              <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                                {isAll ? "/products" : `/products?category=${encodeURIComponent(cat.slug || cat.name)}`}
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
                                    href={isAll ? "/products" : `/products?category=${encodeURIComponent(cat.slug || cat.name)}`}
                                    target="_blank"
                                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                    title="View on store"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditCategory(cat)}
                                    className="p-1.5 text-slate-500 hover:text-[#002D62] hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                                    title="Edit category"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  {isAll ? (
                                    <span
                                      className="p-1.5 text-slate-300 cursor-not-allowed rounded-lg"
                                      title="Primary Storefront Category (cannot delete, toggle Active to hide)"
                                    >
                                      <Trash2 className="w-4 h-4 opacity-30" />
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDeleteConfirm({
                                          id: cat.id,
                                          title: cat.name,
                                        })
                                      }
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                      title="Delete category"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB 3: PROMO DUAL CARDS (HOMEPAGE 2-CARD GRID)
             ======================================================== */}
          {activeTab === "promo_cards" && (
            <PromoCardsCustomizer
              categories={categories}
              showToast={showToast}
            />
          )}

          {/* ========================================================
              TAB 4: SHOWCASE COLLECTIONS (TOP PICKZ, NEW ARRIVALS, BEST SELLERS, DEALS)
             ======================================================== */}
          {activeTab === "showcase" && (
            <ShowcaseCollectionsCustomizer
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* ========================================================
          MODAL: ADD / EDIT STORE CATEGORY
         ======================================================== */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full flex flex-col min-h-0 max-h-[90vh] overflow-hidden shadow-2xl animate-scaleIn">
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

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 overflow-y-auto overscroll-contain flex-1 min-h-0">
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#002D62]"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:border-[#002D62]"
                />
              </div>

              {/* Subcategories Management */}
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-900">
                      Subcategories ({categoryForm.subcategories.length})
                    </label>
                    <p className="text-[10px] text-slate-500">
                      Add subcategories with icons that will appear live as filter cards under this category.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadDefaultSubcategories}
                    className="text-[11px] font-bold text-[#002D62] hover:underline cursor-pointer"
                  >
                    Suggest Presets
                  </button>
                </div>

                {/* Subcategory Input + Icon Picker + Add Button */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSubcategoryInput}
                    onChange={(e) => {
                      setNewSubcategoryInput(e.target.value);
                      if (e.target.value.trim()) {
                        setNewSubcategoryIcon(getSubcategoryFallbackIcon(e.target.value.trim()));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSubcategory();
                      }
                    }}
                    placeholder="Type subcategory name (e.g. Mobile & Charging)..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#002D62]"
                  />
                  <select
                    value={newSubcategoryIcon}
                    onChange={(e) => setNewSubcategoryIcon(e.target.value)}
                    className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-[#002D62] cursor-pointer"
                    title="Choose icon for new subcategory"
                  >
                    {AVAILABLE_CATEGORY_ICONS.map((iconName) => (
                      <option key={iconName} value={iconName}>
                        {iconName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddSubcategory}
                    className="px-3.5 py-2 rounded-xl bg-[#FFBE00] hover:bg-[#E5AA00] text-slate-950 font-bold text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Subcategories List with Icon Previews and Dropdown Selectors */}
                {categoryForm.subcategories.length > 0 ? (
                  <div className="space-y-1.5 p-2 bg-white rounded-xl border border-slate-200/80 min-h-[48px] max-h-48 overflow-y-auto">
                    {categoryForm.subcategories.map((sub) => {
                      const currentIcon = categoryForm.subcategoryIcons?.[sub] || getSubcategoryFallbackIcon(sub);
                      return (
                        <div
                          key={sub}
                          className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-slate-50/70 border border-slate-200/60 hover:border-[#FF7A00]/40 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-orange-50 text-[#002D62] flex items-center justify-center shrink-0 border border-orange-200/50">
                              {renderIconOrCustom({
                                iconName: currentIcon,
                                fallbackName: sub,
                                iconSize: 75,
                              })}
                            </div>
                            <span className="text-xs font-bold text-slate-800 truncate">{sub}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <select
                              value={currentIcon}
                              onChange={(e) => handleSubcategoryIconChange(sub, e.target.value)}
                              className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-0.5 focus:outline-none focus:border-[#002D62] cursor-pointer"
                              title="Change subcategory icon"
                            >
                              {AVAILABLE_CATEGORY_ICONS.map((iconName) => (
                                <option key={iconName} value={iconName}>
                                  {iconName}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => handleRemoveSubcategory(sub)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                              title="Remove subcategory"
                            >
                              <X className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 bg-white/60 rounded-xl border border-dashed border-slate-200 text-center">
                    <p className="text-[11px] text-slate-400 font-medium">
                      No subcategories yet. Type a name above and click Add, or click &ldquo;Suggest Presets&rdquo;.
                    </p>
                  </div>
                )}
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
                          ? "bg-white text-[#002D62] shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>Custom Icon</span>
                      {categoryForm.customIcon && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFBE00] text-slate-950" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Live Pill Preview (Round vs Edge Curved Square) */}
                <div className="mb-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-200 flex items-center gap-3.5">
                  <div
                    className={`w-14 h-14 ${
                      categoryForm.iconShape === "square" ? "rounded-2xl" : "rounded-full"
                    } flex items-center justify-center shadow-xs shrink-0 transition-all overflow-hidden ${categoryForm.bgColor} ${categoryForm.iconColor}`}
                  >
                    {categoryForm.customIcon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={categoryForm.customIcon}
                        alt="Preview"
                        style={{
                          width: `${categoryForm.iconSize || 85}%`,
                          height: `${categoryForm.iconSize || 85}%`,
                        }}
                        className="object-contain transition-all"
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
                      Live Storefront Pill Preview ({categoryForm.iconShape === "square" ? "Curved Square" : "Round Circle"})
                    </span>
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {categoryForm.name || "Category Label"}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {categoryForm.customIcon
                        ? `Custom uploaded icon active (${categoryForm.iconSize || 85}% size)`
                        : `Preset icon: ${categoryForm.icon}`}
                    </span>
                  </div>
                  {categoryForm.customIcon && (
                    <button
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, customIcon: "" })}
                      className="px-2 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 cursor-pointer"
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
                                ? "bg-white border-[#FF7A00] shadow-xs text-[#002D62]"
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
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#002D62]"
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

                    {/* Icon Scale / Size Controls */}
                    {categoryForm.customIcon && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 mt-2 shadow-xs">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span>Adjust Icon Size:</span>
                            <span className="px-1.5 py-0.5 rounded bg-orange-100 text-[#002D62] font-mono font-extrabold text-[11px]">
                              {categoryForm.iconSize || 85}%
                            </span>
                          </span>
                          <div className="flex items-center gap-1">
                            {[
                              { label: "Compact", value: 65 },
                              { label: "Medium", value: 75 },
                              { label: "Large (Rec.)", value: 85 },
                              { label: "Max Fill", value: 95 },
                            ].map((sizeOpt) => (
                              <button
                                key={sizeOpt.value}
                                type="button"
                                onClick={() =>
                                  setCategoryForm({ ...categoryForm, iconSize: sizeOpt.value })
                                }
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  (categoryForm.iconSize || 85) === sizeOpt.value
                                    ? "bg-[#FFBE00] text-slate-950 text-white shadow-xs"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                {sizeOpt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Range Slider */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-[10px] text-slate-400 font-bold shrink-0">50%</span>
                          <input
                            type="range"
                            min="50"
                            max="100"
                            step="5"
                            value={categoryForm.iconSize || 85}
                            onChange={(e) =>
                              setCategoryForm({
                                ...categoryForm,
                                iconSize: Number(e.target.value),
                              })
                            }
                            className="flex-1 accent-[#FF7A00] cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                          />
                          <span className="text-[10px] text-slate-400 font-bold shrink-0">100%</span>
                        </div>
                      </div>
                    )}

                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      💡 Tip: Use a transparent PNG, WebP or SVG icon for best visual results inside the circular pill background.
                    </p>
                  </div>
                )}
              </div>

              {/* Icon Shape Selector (Round vs Edge Curved Square) */}
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      Icon Shape
                    </label>
                    <p className="text-[10px] text-slate-500">
                      Choose Round circle or Edge curved square for the storefront pill.
                    </p>
                  </div>
                  <span className="text-[11px] font-extrabold text-[#002D62] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                    {categoryForm.iconShape === "square" ? "Curved Square" : "Round"}
                  </span>
                </div>

                {/* The 2 Shape Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, iconShape: "round" })}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                      categoryForm.iconShape !== "square"
                        ? "border-[#FF7A00] bg-white text-[#002D62] shadow-xs ring-2 ring-[#FF7A00]/20"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-current shrink-0" />
                    <span>Round (Circle)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, iconShape: "square" })}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                      categoryForm.iconShape === "square"
                        ? "border-[#FF7A00] bg-white text-[#002D62] shadow-xs ring-2 ring-[#FF7A00]/20"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-md border-2 border-current shrink-0" />
                    <span>Edge Curved Square</span>
                  </button>
                </div>

                {/* Option to change all icons shape */}
                <div className="pt-2 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={applyShapeToAll}
                      onChange={(e) => setApplyShapeToAll(e.target.checked)}
                      className="w-4 h-4 rounded text-[#002D62] focus:ring-[#002D62]"
                    />
                    <span>Apply this shape to all category icons</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleApplyShapeToAll(categoryForm.iconShape || "round")}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-700 bg-white hover:bg-orange-50 hover:text-[#002D62] border border-slate-200 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>Apply shape to all now</span>
                  </button>
                </div>
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
                          ? "border-[#FF7A00] ring-2 ring-[#FF7A00]/20"
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
                    className="w-4 h-4 rounded text-[#002D62] focus:ring-[#002D62]"
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
                    className="w-4 h-4 rounded text-[#002D62] focus:ring-[#002D62]"
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
                    className="w-4 h-4 rounded text-[#002D62] focus:ring-[#002D62]"
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
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FFBE00] hover:bg-[#E5AA00] disabled:opacity-50"
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
                  handleDeleteCategory(deleteConfirm.id);
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
