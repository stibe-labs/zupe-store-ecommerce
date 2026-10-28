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
import { HeroBannerSlide, StoreCategory } from "@/lib/storeContent";
import { getSubcategoriesForCategory } from "@/data/zupeProducts";
import { PromoCardsCustomizer } from "@/components/admin/PromoCardsCustomizer";
import { ShowcaseCollectionsCustomizer } from "@/components/admin/ShowcaseCollectionsCustomizer";
import {
  AVAILABLE_CATEGORY_ICONS,
  getSubcategoryFallbackIcon,
  renderIconOrCustom,
} from "@/components/CategoryPills";

const IMAGE_PRESETS = [
  { label: "🔥 Mega Sale Poster", url: "/banners/banner-mega-sale.jpg" },
  { label: "⚡ Smart Tech Poster", url: "/banners/banner-tech-gadgets.jpg" },
  { label: "✨ Auto & Home Poster", url: "/banners/banner-auto-home.jpg" },
  { label: "Water Ripple Lamp", url: "/products/hero-banner.jpg" },
  { label: "Helicopter Perfume", url: "/products/helicopter-perfume.jpg" },
  { label: "Powerbank Earbuds", url: "/products/powerbank-earbuds.jpg" },
  { label: "Mini Steam Iron", url: "/products/iron/iron-teal-1.jpg" },
  { label: "Car Diffuser", url: "/products/car-perfume.jpg" },
  { label: "Crystal Lamp", url: "/products/ripple-lamp.jpg" },
];

const MOBILE_IMAGE_PRESETS = [
  { label: "🔥 Mega Sale Poster", url: "/banners/banner-mega-sale.jpg" },
  { label: "⚡ Tech Poster", url: "/banners/banner-tech-gadgets.jpg" },
  { label: "✨ Auto Poster", url: "/banners/banner-auto-home.jpg" },
  { label: "Ripple Lamp (Square)", url: "/products/ripple/ripple-amber.jpg" },
  { label: "Helicopter (Square)", url: "/products/helicopter/heli-black-1.jpg" },
  { label: "Earbuds (Square)", url: "/products/earbuds/earbuds-matte.jpg" },
  { label: "Steam Iron (Portrait)", url: "/products/iron/iron-teal-1.jpg" },
];

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
  const [activeTab, setActiveTab] = useState<"banners" | "categories" | "promo_cards" | "showcase">("banners");

  const [banners, setBanners] = useState<HeroBannerSlide[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Banner Modal state
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBannerSlide | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [cardViewModes, setCardViewModes] = useState<Record<string, "desktop" | "mobile">>({});
  const [bannerForm, setBannerForm] = useState({
    badge: "",
    titleLine1: "",
    titleLine2: "",
    description: "",
    ctaText: "Explore Now",
    ctaLink: "/products",
    image: "/products/hero-banner.jpg",
    mobileImage: "",
    imageScale: 100,
    imagePosition: "center",
    imageFit: "cover" as "cover" | "contain",
    mobileImageScale: 100,
    mobileImagePosition: "center",
    mobileImageFit: "cover" as "cover" | "contain",
    taglineRight: "Drive In Luxury ♡",
    active: true,
  });
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

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
    type: "banner" | "category";
    id: string;
    title: string;
  } | null>(null);

  // Lock background scroll when modals are open
  useEffect(() => {
    if (bannerModalOpen || categoryModalOpen || Boolean(deleteConfirm)) {
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
  }, [bannerModalOpen, categoryModalOpen, deleteConfirm]);

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

  // File upload helper: shows instant local preview and uploads to Cloudflare R2 bucket
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "image" | "mobileImage" | ((url: string) => void)
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isCallback = typeof field === "function";
    if (!isCallback) {
      if (field === "image") setUploadingPoster(true);
      else setUploadingMobile(true);
    }

    // 1. Immediately read as dataURL for instant local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        if (isCallback) {
          field(dataUrl);
        } else if (field === "image") {
          setBannerForm((prev) => ({ ...prev, image: dataUrl }));
        } else {
          setBannerForm((prev) => ({ ...prev, mobileImage: dataUrl }));
        }
      }
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
        if (isCallback) {
          field(data.url);
        } else if (field === "image") {
          setBannerForm((prev) => ({ ...prev, image: data.url }));
        } else {
          setBannerForm((prev) => ({ ...prev, mobileImage: data.url }));
        }
        showToast("success", "Uploaded to cloud storage successfully!");
      } else {
        console.warn("Cloud upload response error:", data.error);
      }
    } catch (err: any) {
      console.warn("Direct cloud upload failed, base64 fallback active:", err);
    } finally {
      if (!isCallback) {
        if (field === "image") setUploadingPoster(false);
        else setUploadingMobile(false);
      }
      e.target.value = "";
    }
  };

  // --- Banner Actions ---
  const handleOpenAddBanner = () => {
    setEditingBanner(null);
    setPreviewMode("desktop");
    setBannerForm({
      badge: "PROMO",
      titleLine1: "New Poster Banner",
      titleLine2: "",
      description: "",
      ctaText: "Shop Now",
      ctaLink: "/products",
      image: "/banners/banner-mega-sale.jpg",
      mobileImage: "",
      imageScale: 100,
      imagePosition: "center",
      imageFit: "cover",
      mobileImageScale: 100,
      mobileImagePosition: "center",
      mobileImageFit: "cover",
      taglineRight: "",
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
      ctaLink: b.ctaLink ?? "/products",
      image: b.image,
      mobileImage: b.mobileImage || "",
      imageScale: typeof b.imageScale === "number" ? b.imageScale : 100,
      imagePosition: b.imagePosition || "center",
      imageFit: b.imageFit || "cover",
      mobileImageScale: typeof b.mobileImageScale === "number" ? b.mobileImageScale : 100,
      mobileImagePosition: b.mobileImagePosition || "center",
      mobileImageFit: b.mobileImageFit || "cover",
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
                <span className="p-2 rounded-xl bg-orange-50 text-[#FF7A00]">
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
                  ? "border-[#FF7A00] text-[#FF7A00]"
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
              onClick={() => setActiveTab("promo_cards")}
              className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "promo_cards"
                  ? "border-[#FF7A00] text-[#FF7A00]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Promo Dual Cards</span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-orange-100 text-[#FF7A00] font-extrabold">
                2 Cards
              </span>
            </button>

            <button
              onClick={() => setActiveTab("categories")}
              className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "categories"
                  ? "border-[#FF7A00] text-[#FF7A00]"
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
                  ? "border-[#FF7A00] text-[#FF7A00]"
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
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF7A00] text-white text-xs font-bold hover:bg-[#E66E00] transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add New Hero Banner</span>
                </button>
              </div>

              {loading ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#FF7A00] mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Loading hero banners...</p>
                </div>
              ) : banners.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No Hero Banners Found</p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">Click below to add your first banner or restore defaults.</p>
                  <button
                    onClick={handleResetDefaults}
                    className="px-4 py-2 rounded-xl bg-orange-50 text-[#FF7A00] text-xs font-bold hover:bg-orange-100"
                  >
                    Load Default Hero Banners
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {banners.map((slide, idx) => {
                    const cardMode = cardViewModes[slide.id] || "desktop";
                    return (
                      <div
                        key={slide.id}
                        className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
                      >
                        {/* Top Bar with Device Preview Switcher */}
                        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-extrabold uppercase tracking-wider text-orange-200">
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
                          {/* Device Toggle */}
                          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                            <button
                              type="button"
                              onClick={() => setCardViewModes((prev) => ({ ...prev, [slide.id]: "desktop" }))}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                cardMode === "desktop"
                                  ? "bg-white text-slate-900 shadow-xs"
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              <Monitor className="w-3 h-3" />
                              <span>Desktop</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setCardViewModes((prev) => ({ ...prev, [slide.id]: "mobile" }))}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                cardMode === "mobile"
                                  ? "bg-white text-slate-900 shadow-xs"
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              <Smartphone className="w-3 h-3" />
                              <span>Mobile</span>
                            </button>
                          </div>
                        </div>

                        {/* Live Storefront Mockup Preview (Slim Direct Poster) */}
                        <div className="relative aspect-[3.2/1] bg-slate-100 overflow-hidden group/preview select-none">
                          <Image
                            src={cardMode === "mobile" && slide.mobileImage ? slide.mobileImage : slide.image}
                            alt={slide.titleLine1 || "Banner Poster"}
                            fill
                            style={{
                              transform: `scale(${((cardMode === "mobile" && slide.mobileImage ? slide.mobileImageScale : slide.imageScale) || 100) / 100})`,
                              transformOrigin:
                                ((cardMode === "mobile" && slide.mobileImage ? slide.mobileImagePosition : slide.imagePosition) === "top"
                                  ? "top center"
                                  : (cardMode === "mobile" && slide.mobileImage ? slide.mobileImagePosition : slide.imagePosition) === "bottom"
                                  ? "bottom center"
                                  : "center center"),
                              objectFit: (cardMode === "mobile" && slide.mobileImage ? slide.mobileImageFit : slide.imageFit) || "cover",
                              objectPosition: (cardMode === "mobile" && slide.mobileImage ? slide.mobileImagePosition : slide.imagePosition) || "center",
                            }}
                            className="transition-transform duration-500 ease-out"
                          />

                          {/* Banner Label & Status Pill */}
                          <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                            <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-bold shadow-sm">
                              {slide.titleLine1 || "Promo Poster"}
                            </span>
                            {(slide.imageScale && slide.imageScale !== 100) && (
                              <span className="px-2 py-0.5 rounded-md bg-orange-500 text-white text-[9px] font-extrabold shadow-xs">
                                {slide.imageScale}% Zoom
                              </span>
                            )}
                          </div>

                          {/* Link Pill */}
                          <div className="absolute bottom-3 left-3 z-10">
                            <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white/90 text-[10px] font-mono">
                              {slide.ctaLink && slide.ctaLink.trim() !== "" && slide.ctaLink.trim() !== "#"
                                ? `🔗 ${slide.ctaLink}`
                                : "🔒 Display Only (No Link)"}
                            </span>
                          </div>

                          {/* Arrows simulation */}
                          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 text-slate-800 flex items-center justify-center z-10 backdrop-blur-xs shadow-xs opacity-75">
                            <ChevronLeft className="w-4 h-4" />
                          </div>
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 text-slate-800 flex items-center justify-center z-10 backdrop-blur-xs shadow-xs opacity-75">
                            <ChevronRight className="w-4 h-4" />
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
                            className="p-2 text-slate-600 hover:text-[#FF7A00] hover:bg-orange-50 rounded-xl transition-colors cursor-pointer"
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
                  );
                })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB 2: STORE CATEGORIES
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
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF7A00] text-white text-xs font-bold hover:bg-[#E66E00] transition-all shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add New Category</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#FF7A00] mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Loading categories...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <Tag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No Categories Found</p>
                  <button
                    onClick={handleResetDefaults}
                    className="mt-3 px-4 py-2 rounded-xl bg-orange-50 text-[#FF7A00] text-xs font-bold hover:bg-orange-100"
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
                                    } ${cat.iconColor || (isAll ? "text-[#3B82F6]" : "text-[#FF7A00]")}`}
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
                                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-orange-50 text-[#FF7A00] text-[10px] font-bold">
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
                                    className="p-1.5 text-slate-500 hover:text-[#FF7A00] hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
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
          MODAL: ADD / EDIT HERO BANNER
         ======================================================== */}
      {bannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full min-h-0 max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-scaleIn">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingBanner ? "Edit Hero Banner Slide" : "Add New Hero Banner"}
                </h3>
                <p className="text-xs text-slate-500">
                  Live real-time preview matches the storefront 100% across desktop and mobile screens.
                </p>
              </div>
              <button
                onClick={() => setBannerModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="p-6 overflow-y-auto overscroll-contain space-y-4 flex-1 min-h-0">
              {/* Live Dual Preview Box (Desktop vs Mobile) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      100% Live Site Preview
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                      ({previewMode === "desktop" ? "Widescreen Desktop 16:9 View" : "Smartphone 4:5 / 1:1 Portrait View"})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setPreviewMode("desktop")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        previewMode === "desktop"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5 text-blue-600" />
                      <span>Desktop 16:9</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode("mobile")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        previewMode === "mobile"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mobile 4:5</span>
                    </button>
                  </div>
                </div>

                {previewMode === "desktop" ? (
                  /* ===================================================
                     EXACT DESKTOP BROWSER / STOREFRONT PREVIEW (16:9)
                     =================================================== */
                  <div className="rounded-2xl border border-slate-300/80 bg-slate-950 shadow-xl overflow-hidden">
                    {/* Simulated Browser Address Bar */}
                    <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-300">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                        </div>
                        <div className="ml-2 px-3 py-0.5 bg-slate-950/80 rounded-md text-[10px] font-mono text-slate-400 flex items-center gap-1.5 border border-slate-800">
                          <span className="text-emerald-400 font-bold">🔒 https://</span>
                          <span>zupe-store.stibelabs.workers.dev</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Live Desktop Storefront (16:9)
                      </span>
                    </div>

                    {/* Desktop Hero Section Canvas (Slim Poster Banner) */}
                    <div className="p-3 sm:p-5 bg-slate-100 flex flex-col items-center">
                      <div className="relative w-full aspect-[3.4/1] rounded-2xl overflow-hidden bg-slate-200 shadow-md border border-slate-300/60 select-none group">
                        {/* Background Poster Visual */}
                        <Image
                          src={bannerForm.image || "/banners/banner-mega-sale.jpg"}
                          alt={bannerForm.titleLine1 || "Preview"}
                          fill
                          style={{
                            transform: `scale(${(bannerForm.imageScale || 100) / 100})`,
                            transformOrigin:
                              bannerForm.imagePosition === "top"
                                ? "top center"
                                : bannerForm.imagePosition === "bottom"
                                ? "bottom center"
                                : "center center",
                            objectFit: bannerForm.imageFit || "cover",
                            objectPosition: bannerForm.imagePosition || "center",
                          }}
                          className="transition-transform duration-200"
                        />

                        {/* Chevron controls simulation */}
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 text-slate-800 flex items-center justify-center z-20 backdrop-blur-xs shadow-xs">
                          <ChevronLeft className="w-4 h-4" />
                        </div>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 text-slate-800 flex items-center justify-center z-20 backdrop-blur-xs shadow-xs">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Outpickz-Style Carousel Dots below banner */}
                      <div className="flex items-center justify-center gap-1.5 mt-2.5">
                        <span className="h-1.5 w-6 rounded-full bg-slate-900 shadow-xs" />
                        <span className="h-1.5 w-2 rounded-full bg-slate-300" />
                        <span className="h-1.5 w-2 rounded-full bg-slate-300" />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ===================================================
                     EXACT MOBILE PHONE SIMULATOR (SLIM POSTER)
                     =================================================== */
                  <div className="py-2 flex flex-col items-center justify-center">
                    {/* Device container with Dynamic Island */}
                    <div className="w-full max-w-[340px] bg-slate-950 p-3 rounded-[40px] shadow-2xl border-4 border-slate-800">
                      {/* Dynamic Island Notch */}
                      <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2 flex items-center justify-between px-3">
                        <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0a192f] border border-blue-900/60" />
                      </div>

                      {/* Phone screen */}
                      <div className="rounded-[28px] overflow-hidden bg-white flex flex-col shadow-inner">
                        {/* Mobile top store bar */}
                        <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Menu className="w-4 h-4 text-slate-800" />
                            <Search className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                          <span className="font-extrabold text-xs tracking-tight text-slate-900 font-display">
                            ZUPE <span className="text-[#FF7A00]">STORE</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <Heart className="w-3.5 h-3.5 text-slate-700" />
                            <ShoppingBag className="w-3.5 h-3.5 text-slate-700" />
                          </div>
                        </div>

                        {/* Mobile Banner: Slim Outpickz style */}
                        <div className="p-2.5 bg-slate-50">
                          <div className="relative aspect-[2.35/1] rounded-xl overflow-hidden bg-slate-200 shadow-xs border border-slate-200 select-none">
                            <Image
                              src={bannerForm.mobileImage || bannerForm.image || "/banners/banner-mega-sale.jpg"}
                              alt={bannerForm.titleLine1 || "Preview"}
                              fill
                              style={{
                                transform: `scale(${((bannerForm.mobileImage ? bannerForm.mobileImageScale : bannerForm.imageScale) || 100) / 100})`,
                                transformOrigin:
                                  (bannerForm.mobileImage ? bannerForm.mobileImagePosition : bannerForm.imagePosition) === "top"
                                    ? "top center"
                                    : (bannerForm.mobileImage ? bannerForm.mobileImagePosition : bannerForm.imagePosition) === "bottom"
                                    ? "bottom center"
                                    : "center center",
                                objectFit: (bannerForm.mobileImage ? bannerForm.mobileImageFit : bannerForm.imageFit) || "cover",
                                objectPosition: (bannerForm.mobileImage ? bannerForm.mobileImagePosition : bannerForm.imagePosition) || "center",
                              }}
                              className="transition-transform duration-200"
                            />
                          </div>

                          {/* Dots */}
                          <div className="flex items-center justify-center gap-1 mt-2">
                            <span className="h-1.5 w-5 rounded-full bg-slate-900 shadow-xs" />
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                          </div>
                        </div>

                        {/* Mini Storefront Category Pills Preview below banner */}
                        <div className="px-3 py-2 bg-white flex items-center justify-between border-t border-slate-100">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="flex flex-col items-center shrink-0">
                              <div className="w-7 h-7 rounded-full bg-[#EEF2FF] text-[#3B82F6] flex items-center justify-center text-[10px] font-bold">⊞</div>
                              <span className="text-[8px] text-slate-500 font-semibold mt-0.5">All</span>
                            </div>
                            <div className="flex flex-col items-center shrink-0">
                              <div className="w-7 h-7 rounded-full bg-[#FEEBEA] text-[#E0533C] flex items-center justify-center text-[10px] font-bold">🪑</div>
                              <span className="text-[8px] text-slate-500 font-semibold mt-0.5">Home</span>
                            </div>
                            <div className="flex flex-col items-center shrink-0">
                              <div className="w-7 h-7 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center text-[10px] font-bold">🎧</div>
                              <span className="text-[8px] text-slate-500 font-semibold mt-0.5">Gadgets</span>
                            </div>
                            <div className="flex flex-col items-center shrink-0">
                              <div className="w-7 h-7 rounded-full bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center text-[10px] font-bold">✨</div>
                              <span className="text-[8px] text-slate-500 font-semibold mt-0.5">Care</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {bannerForm.mobileImage ? "Custom Mobile Poster" : "Desktop Poster Scaled"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Photo 1: Desktop View Poster */}
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-blue-600" />
                    <label className="text-xs font-bold text-slate-800">
                      1. Desktop Banner Poster (Slim Landscape) *
                    </label>
                  </div>
                  <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    Recommended: 16:9 or 1920×600
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={bannerForm.image}
                    onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                    placeholder="Poster image URL or click Upload File"
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#FF7A00]"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-black text-white text-xs font-bold transition-all shadow-xs shrink-0">
                    {uploadingPoster ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF7A00]" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Poster</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingPoster}
                      onChange={(e) => handleFileUpload(e, "image")}
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
                      className="px-2 py-0.5 rounded-lg bg-white hover:bg-orange-50 hover:text-[#FF7A00] text-[10px] font-semibold text-slate-600 border border-slate-200 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Desktop Poster Framing & Zoom Adjuster Slider */}
                <div className="mt-2.5 p-3 bg-white rounded-xl border border-slate-200/90 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#FF7A00]" />
                      <span className="text-[11px] font-bold text-slate-800">
                        Desktop Poster Framing & Zoom Adjuster
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-[#FF7A00] font-mono text-[10px] font-extrabold">
                        {bannerForm.imageScale}% Zoom
                      </span>
                      {bannerForm.imageScale !== 100 && (
                        <button
                          type="button"
                          onClick={() => setBannerForm({ ...bannerForm, imageScale: 100 })}
                          className="text-[10px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Zoom In / Zoom Out Slider */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setBannerForm({ ...bannerForm, imageScale: Math.max(50, (bannerForm.imageScale || 100) - 5) })}
                      className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shrink-0"
                      title="Zoom Out (-5%)"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex-1 relative flex items-center">
                      <input
                        type="range"
                        min={50}
                        max={200}
                        step={1}
                        value={bannerForm.imageScale || 100}
                        onChange={(e) => setBannerForm({ ...bannerForm, imageScale: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF7A00]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setBannerForm({ ...bannerForm, imageScale: Math.min(200, (bannerForm.imageScale || 100) + 5) })}
                      className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shrink-0"
                      title="Zoom In (+5%)"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Preset zoom shortcuts */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] font-semibold text-slate-400">Presets:</span>
                    {[
                      { label: "Fit Whole", scale: 100, fit: "contain" as const },
                      { label: "100% (Default)", scale: 100, fit: "cover" as const },
                      { label: "115% Zoom", scale: 115, fit: "cover" as const },
                      { label: "130% Zoom", scale: 130, fit: "cover" as const },
                      { label: "150% Fill", scale: 150, fit: "cover" as const },
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setBannerForm({ ...bannerForm, imageScale: p.scale, imageFit: p.fit })}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                          bannerForm.imageScale === p.scale && bannerForm.imageFit === p.fit
                            ? "bg-[#FF7A00] text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Fit Mode and Alignment Options */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-100 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-500">Fit Mode:</span>
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setBannerForm({ ...bannerForm, imageFit: "cover" })}
                          className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                            bannerForm.imageFit === "cover"
                              ? "bg-white text-slate-900 shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          Fill Frame (Cover)
                        </button>
                        <button
                          type="button"
                          onClick={() => setBannerForm({ ...bannerForm, imageFit: "contain" })}
                          className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                            bannerForm.imageFit === "contain"
                              ? "bg-white text-slate-900 shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          Fit Whole (Contain)
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-500">Vertical Focus:</span>
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        {(["top", "center", "bottom"] as const).map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => setBannerForm({ ...bannerForm, imagePosition: pos })}
                            className={`px-2 py-0.5 rounded font-bold capitalize transition-all cursor-pointer ${
                              bannerForm.imagePosition === pos
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            {pos}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo 2: Mobile View Poster (Optional) */}
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <label className="text-xs font-bold text-slate-800">
                      2. Mobile Banner Poster (Optional)
                    </label>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Aspect 2.3:1 (e.g. 800×340)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={bannerForm.mobileImage}
                    onChange={(e) => setBannerForm({ ...bannerForm, mobileImage: e.target.value })}
                    placeholder="Optional: mobile poster image URL or click Upload"
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#FF7A00]"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs shrink-0">
                    {uploadingMobile ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Mobile</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingMobile}
                      onChange={(e) => handleFileUpload(e, "mobileImage")}
                    />
                  </label>
                  {bannerForm.mobileImage && (
                    <button
                      type="button"
                      onClick={() => setBannerForm({ ...bannerForm, mobileImage: "" })}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Clear mobile image (falls back to desktop poster)"
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
                  <span className="italic text-slate-400">If blank, desktop poster is used</span>
                </div>

                {/* Mobile Poster Framing & Zoom Adjuster Slider */}
                <div className="mt-2.5 p-3 bg-white rounded-xl border border-slate-200/90 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[11px] font-bold text-slate-800">
                        Mobile Poster Framing & Zoom Adjuster
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[10px] font-extrabold">
                        {bannerForm.mobileImageScale}% Zoom
                      </span>
                      {bannerForm.mobileImageScale !== 100 && (
                        <button
                          type="button"
                          onClick={() => setBannerForm({ ...bannerForm, mobileImageScale: 100 })}
                          className="text-[10px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Zoom In / Zoom Out Slider */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setBannerForm({ ...bannerForm, mobileImageScale: Math.max(50, (bannerForm.mobileImageScale || 100) - 5) })}
                      className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shrink-0"
                      title="Zoom Out (-5%)"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex-1 relative flex items-center">
                      <input
                        type="range"
                        min={50}
                        max={200}
                        step={1}
                        value={bannerForm.mobileImageScale || 100}
                        onChange={(e) => setBannerForm({ ...bannerForm, mobileImageScale: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setBannerForm({ ...bannerForm, mobileImageScale: Math.min(200, (bannerForm.mobileImageScale || 100) + 5) })}
                      className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shrink-0"
                      title="Zoom In (+5%)"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Preset zoom shortcuts */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] font-semibold text-slate-400">Presets:</span>
                    {[
                      { label: "Fit Whole", scale: 100, fit: "contain" as const },
                      { label: "100% (Default)", scale: 100, fit: "cover" as const },
                      { label: "115% Zoom", scale: 115, fit: "cover" as const },
                      { label: "130% Zoom", scale: 130, fit: "cover" as const },
                      { label: "150% Fill", scale: 150, fit: "cover" as const },
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setBannerForm({ ...bannerForm, mobileImageScale: p.scale, mobileImageFit: p.fit })}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                          bannerForm.mobileImageScale === p.scale && bannerForm.mobileImageFit === p.fit
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Fit Mode and Alignment Options */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-100 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-500">Fit Mode:</span>
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setBannerForm({ ...bannerForm, mobileImageFit: "cover" })}
                          className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                            bannerForm.mobileImageFit === "cover"
                              ? "bg-white text-slate-900 shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          Fill Frame (Cover)
                        </button>
                        <button
                          type="button"
                          onClick={() => setBannerForm({ ...bannerForm, mobileImageFit: "contain" })}
                          className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                            bannerForm.mobileImageFit === "contain"
                              ? "bg-white text-slate-900 shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          Fit Whole (Contain)
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-500">Vertical Focus:</span>
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        {(["top", "center", "bottom"] as const).map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => setBannerForm({ ...bannerForm, mobileImagePosition: pos })}
                            className={`px-2 py-0.5 rounded font-bold capitalize transition-all cursor-pointer ${
                              bannerForm.mobileImagePosition === pos
                                ? "bg-white text-slate-900 shadow-xs"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            {pos}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Destination Link & Banner Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Destination Click Link (Optional)
                    </label>
                    <span className="text-[10px] text-slate-400">Tapping banner opens URL</span>
                  </div>
                  <input
                    type="text"
                    value={bannerForm.ctaLink}
                    onChange={(e) => setBannerForm({ ...bannerForm, ctaLink: e.target.value })}
                    placeholder="e.g. /products or leave empty if non-clickable"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#FF7A00]"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <span className="text-[10px] font-bold text-slate-400 self-center">Presets:</span>
                    <button
                      type="button"
                      onClick={() => setBannerForm({ ...bannerForm, ctaLink: "/products" })}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-orange-50 hover:text-[#FF7A00] text-[10px] text-slate-600 transition-colors"
                    >
                      /products
                    </button>
                    <button
                      type="button"
                      onClick={() => setBannerForm({ ...bannerForm, ctaLink: "/products?category=Tech+%26+Gadgets" })}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-orange-50 hover:text-[#FF7A00] text-[10px] text-slate-600 transition-colors"
                    >
                      Tech & Gadgets
                    </button>
                    <button
                      type="button"
                      onClick={() => setBannerForm({ ...bannerForm, ctaLink: "/products?category=Home+Essentials" })}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-orange-50 hover:text-[#FF7A00] text-[10px] text-slate-600 transition-colors"
                    >
                      Home Essentials
                    </button>
                    <button
                      type="button"
                      onClick={() => setBannerForm({ ...bannerForm, ctaLink: "" })}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-[10px] text-slate-600 transition-colors"
                    >
                      Non-Clickable (Empty)
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Shoppers who click/tap the banner image will navigate here. Leave empty if you want it to be display-only.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Banner Name / Alt Text (For Reference)
                  </label>
                  <input
                    type="text"
                    value={bannerForm.titleLine1}
                    onChange={(e) => setBannerForm({ ...bannerForm, titleLine1: e.target.value })}
                    placeholder="e.g. Mega Sale Banner 2026"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#FF7A00]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Used as the accessible label and admin identifier.
                  </p>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="banner-active"
                  checked={bannerForm.active}
                  onChange={(e) => setBannerForm({ ...bannerForm, active: e.target.checked })}
                  className="w-4 h-4 rounded text-[#FF7A00] focus:ring-[#FF7A00]"
                />
                <label htmlFor="banner-active" className="text-xs font-bold text-slate-800">
                  Active (Display this poster in the home banner rotation)
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
                  disabled={saving || uploadingPoster || uploadingMobile}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FF7A00] hover:bg-[#E66E00] disabled:opacity-50"
                >
                  {uploadingPoster || uploadingMobile
                    ? "Uploading image to cloud..."
                    : saving
                    ? "Saving..."
                    : editingBanner
                    ? "Save Changes"
                    : "Publish Banner"}
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF7A00]"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:border-[#FF7A00]"
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
                    className="text-[11px] font-bold text-[#FF7A00] hover:underline cursor-pointer"
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
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#FF7A00]"
                  />
                  <select
                    value={newSubcategoryIcon}
                    onChange={(e) => setNewSubcategoryIcon(e.target.value)}
                    className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-[#FF7A00] cursor-pointer"
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
                    className="px-3.5 py-2 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1 cursor-pointer"
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
                            <div className="w-6 h-6 rounded-md bg-orange-50 text-[#FF7A00] flex items-center justify-center shrink-0 border border-orange-200/50">
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
                              className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-0.5 focus:outline-none focus:border-[#FF7A00] cursor-pointer"
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
                          ? "bg-white text-[#FF7A00] shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>Custom Icon</span>
                      {categoryForm.customIcon && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" />
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
                                ? "bg-white border-[#FF7A00] shadow-xs text-[#FF7A00]"
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
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#FF7A00]"
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
                            <span className="px-1.5 py-0.5 rounded bg-orange-100 text-[#FF7A00] font-mono font-extrabold text-[11px]">
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
                                    ? "bg-[#FF7A00] text-white shadow-xs"
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
                  <span className="text-[11px] font-extrabold text-[#FF7A00] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
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
                        ? "border-[#FF7A00] bg-white text-[#FF7A00] shadow-xs ring-2 ring-[#FF7A00]/20"
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
                        ? "border-[#FF7A00] bg-white text-[#FF7A00] shadow-xs ring-2 ring-[#FF7A00]/20"
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
                      className="w-4 h-4 rounded text-[#FF7A00] focus:ring-[#FF7A00]"
                    />
                    <span>Apply this shape to all category icons</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleApplyShapeToAll(categoryForm.iconShape || "round")}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-700 bg-white hover:bg-orange-50 hover:text-[#FF7A00] border border-slate-200 transition-all cursor-pointer shadow-2xs"
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
                    className="w-4 h-4 rounded text-[#FF7A00] focus:ring-[#FF7A00]"
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
                    className="w-4 h-4 rounded text-[#FF7A00] focus:ring-[#FF7A00]"
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
                    className="w-4 h-4 rounded text-[#FF7A00] focus:ring-[#FF7A00]"
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
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FF7A00] hover:bg-[#E66E00] disabled:opacity-50"
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
