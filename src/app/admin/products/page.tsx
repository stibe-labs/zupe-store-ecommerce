"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Box,
  Plus,
  Search,
  Tag,
  DollarSign,
  TrendingUp,
  Package,
  Layers,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Palette,
  Image as ImageIcon,
  Sparkles,
  ListPlus,
  Check,
  Star,
  Info,
} from "lucide-react";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { Product, ProductColorVariant } from "@/types/product";

export default function AdminProductsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);

  // Tab state in Edit/Add Modal
  const [activeTab, setActiveTab] = useState<
    "basic" | "pricing" | "colors" | "media" | "highlights" | "specs"
  >("basic");

  // Form states:
  // Tab 1: Basic
  const [formName, setFormName] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState("Gadgets");
  const [formBadge, setFormBadge] = useState("");
  const [formTagline, setFormTagline] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Tab 2: Pricing & Stock
  const [formPrice, setFormPrice] = useState("");
  const [formMrp, setFormMrp] = useState("");
  const [formCost, setFormCost] = useState("");
  const [formStock, setFormStock] = useState("50");
  const [formInStock, setFormInStock] = useState(true);

  // Tab 3: Colors & Multi-Angle Photos
  const [formColors, setFormColors] = useState<ProductColorVariant[]>([]);

  // Tab 4: Media
  const [formImage, setFormImage] = useState("");
  const [formGalleryImages, setFormGalleryImages] = useState<string[]>([]);
  const [newGalleryInput, setNewGalleryInput] = useState("");

  // Tab 5: Highlights ("Why You'll Love This ❤️")
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [newFeatureInput, setNewFeatureInput] = useState("");

  // Tab 6: Specs & Box
  const [formVolume, setFormVolume] = useState("");
  const [formMaterial, setFormMaterial] = useState("");
  const [formSpecs, setFormSpecs] = useState<{ key: string; val: string }[]>([]);
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecVal, setNewSpecVal] = useState("");
  const [formWhatsInBox, setFormWhatsInBox] = useState<string[]>([]);
  const [newBoxInput, setNewBoxInput] = useState("");

  // Social Proof:
  const [formRating, setFormRating] = useState("4.8");
  const [formReviewCount, setFormReviewCount] = useState("120");
  const [formSoldCount, setFormSoldCount] = useState("1,250+ verified orders");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const fetchProducts = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/products?_t=" + Date.now());
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.warn("Failed to fetch products:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const toggleStockStatus = async (prod: Product) => {
    const newInStock = prod.in_stock === 1 ? 0 : 1;
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, in_stock: newInStock } : p))
    );
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: prod.id,
          in_stock: newInStock,
        }),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === data.product.id ? data.product : p))
        );
      } else {
        fetchProducts();
      }
    } catch (err) {
      fetchProducts();
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setActiveTab("basic");
    setFormName("");
    setFormSubtitle("");
    setFormSlug("");
    setFormCategory("Gadgets");
    setFormBadge("New");
    setFormTagline("");
    setFormDescription("");

    setFormPrice("");
    setFormMrp("");
    setFormCost("");
    setFormStock("50");
    setFormInStock(true);

    setFormColors([
      {
        name: "Standard",
        colorHex: "#3B82F6",
        image: "/products/steam-iron.jpg",
        images: ["/products/steam-iron.jpg"],
      },
    ]);

    setFormImage("");
    setFormGalleryImages([]);
    setNewGalleryInput("");

    setFormFeatures([
      "Premium quality design and build materials",
      "Ergonomic travel-friendly form factor",
      "Intelligent safety protection & fast operation",
    ]);
    setNewFeatureInput("");

    setFormVolume("");
    setFormMaterial("");
    setFormSpecs([]);
    setNewSpecKey("");
    setNewSpecVal("");

    setFormWhatsInBox([
      "1 × Main Product Unit",
      "1 × Official User Manual & Operating Guide",
      "1 × Zupe Store Quality Verification & Warranty Seal",
    ]);
    setNewBoxInput("");

    setFormRating("4.8");
    setFormReviewCount("120");
    setFormSoldCount("1,250+ verified orders");

    setActionMessage(null);
    setShowModal(true);
  };

  const openEditModal = (prod: Product) => {
    const cost =
      prod.cost_price !== undefined ? prod.cost_price : Math.round(prod.price * 0.42);

    setEditingProduct(prod);
    setActiveTab("basic");

    setFormName(prod.name || "");
    setFormSubtitle(prod.subtitle || "");
    setFormSlug(prod.slug || "");
    setFormCategory(prod.category || "Decor");
    setFormBadge(prod.badge || "");
    setFormTagline(prod.tagline || "");
    setFormDescription(prod.description || "");

    setFormPrice(String(prod.price || ""));
    setFormMrp(String(prod.mrp || prod.price || ""));
    setFormCost(String(cost));
    setFormStock(String(prod.stock_count || 0));
    setFormInStock(prod.in_stock === 1);

    // Deep clone colors
    setFormColors(
      prod.colors && Array.isArray(prod.colors) && prod.colors.length > 0
        ? JSON.parse(JSON.stringify(prod.colors))
        : [
            {
              name: prod.color || "Standard",
              colorHex: "#3B82F6",
              image: prod.poster_image || "",
              images: prod.images || [prod.poster_image || ""],
            },
          ]
    );

    setFormImage(prod.poster_image || "");
    setFormGalleryImages(
      prod.images && Array.isArray(prod.images) ? [...prod.images] : []
    );
    setNewGalleryInput("");

    setFormFeatures(
      prod.features && Array.isArray(prod.features) ? [...prod.features] : []
    );
    setNewFeatureInput("");

    setFormVolume(prod.volume || "");
    setFormMaterial(prod.material || "");
    setFormSpecs(
      prod.specifications && typeof prod.specifications === "object"
        ? Object.entries(prod.specifications).map(([key, val]) => ({
            key,
            val: String(val),
          }))
        : []
    );
    setNewSpecKey("");
    setNewSpecVal("");

    setFormWhatsInBox(
      prod.whats_in_box && Array.isArray(prod.whats_in_box)
        ? [...prod.whats_in_box]
        : []
    );
    setNewBoxInput("");

    setFormRating(String(prod.rating ?? 4.8));
    setFormReviewCount(String(prod.review_count ?? 120));
    setFormSoldCount(prod.sold_count || "1,250+ verified orders");

    setActionMessage(null);
    setShowModal(true);
  };

  // Color Variant Manipulation Helpers
  const addColorVariant = () => {
    setFormColors((prev) => [
      ...prev,
      {
        name: `Color ${prev.length + 1}`,
        colorHex: "#10B981",
        image: formImage || "/products/steam-iron.jpg",
        images: [formImage || "/products/steam-iron.jpg"],
      },
    ]);
  };

  const removeColorVariant = (idx: number) => {
    setFormColors((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateColorField = (idx: number, field: string, value: any) => {
    setFormColors((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c))
    );
  };

  const addAnglePhotoToColor = (colorIdx: number, photoUrl: string) => {
    if (!photoUrl.trim()) return;
    setFormColors((prev) =>
      prev.map((c, i) => {
        if (i !== colorIdx) return c;
        const currentImgs = Array.isArray(c.images) ? c.images : [];
        return {
          ...c,
          images: [...currentImgs, photoUrl.trim()],
        };
      })
    );
  };

  const removeAnglePhotoFromColor = (colorIdx: number, photoIdx: number) => {
    setFormColors((prev) =>
      prev.map((c, i) => {
        if (i !== colorIdx) return c;
        const currentImgs = Array.isArray(c.images) ? c.images : [];
        return {
          ...c,
          images: currentImgs.filter((_, pi) => pi !== photoIdx),
        };
      })
    );
  };

  // Feature manipulation helpers
  const addFeature = () => {
    if (!newFeatureInput.trim()) return;
    setFormFeatures((prev) => [...prev, newFeatureInput.trim()]);
    setNewFeatureInput("");
  };

  const removeFeature = (idx: number) => {
    setFormFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  // Specs manipulation helpers
  const addSpec = () => {
    if (!newSpecKey.trim() || !newSpecVal.trim()) return;
    setFormSpecs((prev) => [...prev, { key: newSpecKey.trim(), val: newSpecVal.trim() }]);
    setNewSpecKey("");
    setNewSpecVal("");
  };

  const removeSpec = (idx: number) => {
    setFormSpecs((prev) => prev.filter((_, i) => i !== idx));
  };

  // What's in the Box helpers
  const addBoxItem = () => {
    if (!newBoxInput.trim()) return;
    setFormWhatsInBox((prev) => [...prev, newBoxInput.trim()]);
    setNewBoxInput("");
  };

  const removeBoxItem = (idx: number) => {
    setFormWhatsInBox((prev) => prev.filter((_, i) => i !== idx));
  };

  // Gallery image helpers
  const addGalleryImage = () => {
    if (!newGalleryInput.trim()) return;
    setFormGalleryImages((prev) => [...prev, newGalleryInput.trim()]);
    setNewGalleryInput("");
  };

  const removeGalleryImage = (idx: number) => {
    setFormGalleryImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setActiveTab("basic");
      setActionMessage({ text: "Product Name is required", type: "error" });
      return;
    }
    if (!formPrice) {
      setActiveTab("pricing");
      setActionMessage({ text: "Selling Price is required", type: "error" });
      return;
    }

    setIsSubmitting(true);
    setActionMessage(null);

    const priceNum = Number(formPrice) || 0;
    const mrpNum = Number(formMrp) || priceNum;
    const costNum = formCost ? Number(formCost) : Math.round(priceNum * 0.42);
    const stockNum = Number(formStock) || 0;

    const specsObj: Record<string, string> = {};
    formSpecs.forEach((s) => {
      if (s.key.trim()) {
        specsObj[s.key.trim()] = s.val.trim();
      }
    });

    const generatedSlug =
      formSlug.trim() ||
      formName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const posterImg =
      formImage.trim() ||
      formColors[0]?.image ||
      formColors[0]?.images?.[0] ||
      "/products/steam-iron.jpg";

    const payload = {
      ...(editingProduct ? { id: editingProduct.id } : {}),
      slug: generatedSlug,
      name: formName.trim(),
      subtitle: formSubtitle.trim(),
      category: formCategory.trim(),
      badge: formBadge,
      tagline: formTagline.trim(),
      description: formDescription.trim(),
      price: priceNum,
      mrp: mrpNum,
      offer_price: priceNum,
      cost_price: costNum,
      stock_count: stockNum,
      in_stock: formInStock ? 1 : 0,
      poster_image: posterImg,
      images:
        formGalleryImages.length > 0
          ? formGalleryImages
          : formColors[0]?.images && formColors[0].images.length > 0
          ? formColors[0].images
          : [posterImg],
      color: formColors[0]?.name || "",
      colors: formColors,
      volume: formVolume.trim(),
      material: formMaterial.trim(),
      rating: Number(formRating) || 4.8,
      review_count: Number(formReviewCount) || 120,
      sold_count: formSoldCount.trim() || "1,250+ verified orders",
      features: formFeatures.filter(Boolean),
      specifications: Object.keys(specsObj).length > 0 ? specsObj : undefined,
      whats_in_box: formWhatsInBox.filter(Boolean),
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.product) {
        if (editingProduct) {
          setProducts((prev) =>
            prev.map((p) => (p.id === data.product.id ? data.product : p))
          );
        } else {
          setProducts((prev) => [data.product, ...prev]);
        }
        setActionMessage({
          text: `Product "${data.product.name}" successfully saved and synchronized!`,
          type: "success",
        });
        setTimeout(() => {
          setShowModal(false);
          setEditingProduct(null);
        }, 800);
      } else {
        setActionMessage({ text: data.error || "Save failed", type: "error" });
      }
    } catch (err: any) {
      setActionMessage({
        text: err.message || "Failed to save product",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(prodId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== prodId));
        setDeleteConfirmProduct(null);
      }
    } catch (err) {
      console.warn("Error deleting product:", err);
    }
  };

  // Categories list
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  // Filtered products
  const filtered = products.filter((p) => {
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s) ||
        (p.tagline && p.tagline.toLowerCase().includes(s)) ||
        (p.slug && p.slug.toLowerCase().includes(s))
      );
    }
    return true;
  });

  // KPI calculations
  const totalProducts = products.length;
  const totalUnits = products.reduce((sum, p) => sum + (Number(p.stock_count) || 0), 0);
  const totalCatalogValue = products.reduce(
    (sum, p) => sum + (Number(p.stock_count) || 0) * (Number(p.price) || 0),
    0
  );
  const totalCapitalInvested = products.reduce(
    (sum, p) =>
      sum +
      (Number(p.stock_count) || 0) *
        (p.cost_price !== undefined
          ? Number(p.cost_price)
          : Math.round(Number(p.price) * 0.42)),
    0
  );
  const avgMargin =
    totalCatalogValue > 0
      ? (
          ((totalCatalogValue - totalCapitalInvested) / totalCatalogValue) *
          100
        ).toFixed(1)
      : "58.0";

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans">
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminHeader
          onOpenMobile={() => setMobileSidebarOpen(true)}
          onRefresh={fetchProducts}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* Header & Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Products & Multi-Angle Catalog
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Edit all details of live products, create new entries, configure color variants with multiple angle photos, and manage pricing & stock.
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Catalog KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Products
              </span>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">
                {totalProducts}
              </p>
              <span className="text-xs text-slate-500 mt-1 block">
                {totalUnits.toLocaleString("en-IN")} units in inventory
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Inventory Retail Value
              </span>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">
                ₹{totalCatalogValue.toLocaleString("en-IN")}
              </p>
              <span className="text-xs text-slate-500 mt-1 block">
                Based on current selling prices
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Supplier Capital (COGS)
              </span>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">
                ₹{totalCapitalInvested.toLocaleString("en-IN")}
              </p>
              <span className="text-xs text-slate-500 mt-1 block">
                Total capital tied in stock
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Gross Margin
              </span>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2 tracking-tight">
                {avgMargin}%
              </p>
              <span className="text-xs text-slate-500 mt-1 block">
                Average across active catalog
              </span>
            </div>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, category, or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  categoryFilter === "all"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Categories ({products.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    categoryFilter === cat
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] sm:text-[11px] tracking-wider">
                    <th className="py-3.5 px-4">Product & Visuals</th>
                    <th className="py-3.5 px-4">Colors & Angles</th>
                    <th className="py-3.5 px-4">Price & MRP</th>
                    <th className="py-3.5 px-4">Supplier Cost</th>
                    <th className="py-3.5 px-4">Margin</th>
                    <th className="py-3.5 px-4">Stock Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        No products match your search or filter.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((prod) => {
                      const cost =
                        prod.cost_price !== undefined
                          ? prod.cost_price
                          : Math.round(prod.price * 0.42);
                      const marginAmount = prod.price - cost;
                      const marginPercent =
                        prod.price > 0 ? ((marginAmount / prod.price) * 100).toFixed(0) : "0";

                      const colorCount = prod.colors?.length || 0;
                      const totalPhotosCount =
                        prod.colors && prod.colors.length > 0
                          ? prod.colors.reduce((acc, c) => acc + (c.images?.length || 1), 0)
                          : prod.images?.length || 1;

                      return (
                        <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* Product & Visuals */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.poster_image || "/products/steam-iron.jpg"}
                                alt={prod.name}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                                onError={(e) => {
                                  (e.target as any).src =
                                    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop";
                                }}
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-900 truncate max-w-[200px]">
                                    {prod.name}
                                  </span>
                                  {prod.badge && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                                      {prod.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                                  <span className="font-medium text-slate-600">
                                    {prod.category}
                                  </span>
                                  <span>•</span>
                                  <span className="font-mono text-slate-400 text-[10px]">
                                    /{prod.slug}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Colors & Angles */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {prod.colors && prod.colors.length > 0 ? (
                                <>
                                  <div className="flex items-center -space-x-1.5">
                                    {prod.colors.slice(0, 4).map((c, i) => (
                                      <span
                                        key={i}
                                        className="w-4 h-4 rounded-full border-2 border-white shadow-xs"
                                        style={{ backgroundColor: c.colorHex || "#CBD5E1" }}
                                        title={`${c.name} (${c.images?.length || 1} photos)`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[11px] font-semibold text-slate-600 ml-1">
                                    {colorCount} colors
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    ({totalPhotosCount} photos)
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs text-slate-400 italic">Single photo</span>
                              )}
                            </div>
                          </td>

                          {/* Price & MRP */}
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            <div>₹{prod.price.toLocaleString("en-IN")}</div>
                            {prod.mrp && prod.mrp > prod.price && (
                              <div className="text-[10px] text-slate-400 line-through">
                                ₹{prod.mrp.toLocaleString("en-IN")}
                              </div>
                            )}
                          </td>

                          {/* Supplier Cost */}
                          <td className="py-3.5 px-4 font-medium text-amber-700">
                            ₹{cost.toLocaleString("en-IN")}
                          </td>

                          {/* Margin */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              +{marginPercent}% (₹{marginAmount})
                            </span>
                          </td>

                          {/* Stock Status */}
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => toggleStockStatus(prod)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                                prod.in_stock === 1
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  prod.in_stock === 1 ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                              />
                              <span>
                                {prod.in_stock === 1
                                  ? `In Stock (${prod.stock_count || 0})`
                                  : "Out of Stock"}
                              </span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <a
                                href={`/products/${prod.slug || prod.id}`}
                                target="_blank"
                                rel="noreferrer"
                                title="View Live Product Page"
                                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => openEditModal(prod)}
                                title="Edit All Product Details"
                                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmProduct(prod)}
                                title="Delete Product"
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* ========================================================
          FULL EDIT & ADD PRODUCT MODAL (WITH TABS FOR ALL DETAILS)
         ======================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  {editingProduct ? <Edit2 className="w-4 h-4" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    {editingProduct ? `Edit: ${editingProduct.name}` : "Create New Product"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    All details update live on the storefront and sync directly to Cloudflare D1.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {editingProduct && (
                  <a
                    href={`/products/${editingProduct.slug || editingProduct.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
                  >
                    <span>View Live</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 px-4 sm:px-5 border-b border-slate-200 bg-slate-50/40 overflow-x-auto text-xs font-bold scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className={`py-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === "basic"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Basic Info</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("pricing")}
                className={`py-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === "pricing"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Pricing & Stock</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("colors")}
                className={`py-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === "colors"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Colors & Multi-Angle Photos ({formColors.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("media")}
                className={`py-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === "media"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Poster & Gallery</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("highlights")}
                className={`py-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === "highlights"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Highlights ({formFeatures.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("specs")}
                className={`py-3 px-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === "specs"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <ListPlus className="w-3.5 h-3.5" />
                <span>Specs & Box</span>
              </button>
            </div>

            {/* Action Feedback Message */}
            {actionMessage && (
              <div
                className={`mx-5 mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  actionMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {actionMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{actionMessage.text}</span>
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs sm:text-sm">
              {/* ========================================================
                  TAB 1: BASIC INFO
                 ======================================================== */}
              {activeTab === "basic" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Product Name / Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Portable Menstrual Heating Pad"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Subtitle (Shown below Title)
                      </label>
                      <input
                        type="text"
                        value={formSubtitle}
                        onChange={(e) => setFormSubtitle(e.target.value)}
                        placeholder="e.g. Cordless Waist Relief"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Slug (URL identifier)
                      </label>
                      <input
                        type="text"
                        value={formSlug}
                        onChange={(e) => setFormSlug(e.target.value)}
                        placeholder="e.g. portable-menstrual-heating-pad"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Leave blank to auto-generate from Product Name.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Category *
                      </label>
                      <input
                        type="text"
                        required
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        placeholder="e.g. Health & Wellness, Gadgets, Home & Living"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Badge / Label
                      </label>
                      <select
                        value={formBadge}
                        onChange={(e) => setFormBadge(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="">No Badge</option>
                        <option value="Sale">Sale (e.g. Red/Orange Badge)</option>
                        <option value="Trending">Trending</option>
                        <option value="New">New</option>
                        <option value="Limited">Limited Edition</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Short Tagline
                    </label>
                    <input
                      type="text"
                      value={formTagline}
                      onChange={(e) => setFormTagline(e.target.value)}
                      placeholder="e.g. Soothing warmth & multi-frequency massage"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Overview Description (Product Details Accordion)
                    </label>
                    <textarea
                      rows={4}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Provide full details about the product, materials, operations, and benefits..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 2: PRICING & STOCK
                 ======================================================== */}
              {activeTab === "pricing" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Price Configuration & Profit Margins
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Selling Price (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          placeholder="799"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          MRP (₹) [Strikethrough Price]
                        </label>
                        <input
                          type="number"
                          value={formMrp}
                          onChange={(e) => setFormMrp(e.target.value)}
                          placeholder="1149"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Supplier Cost / COGS (₹)
                        </label>
                        <input
                          type="number"
                          value={formCost}
                          onChange={(e) => setFormCost(e.target.value)}
                          placeholder="280"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-amber-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    {formPrice && (
                      <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-xs gap-2">
                        {formMrp && Number(formMrp) > Number(formPrice) && (
                          <div className="text-slate-600">
                            Customer Discount:{" "}
                            <span className="font-bold text-rose-600">
                              {Math.round(
                                ((Number(formMrp) - Number(formPrice)) / Number(formMrp)) * 100
                              )}
                              % OFF
                            </span>
                          </div>
                        )}
                        {formCost && (
                          <div className="text-slate-600">
                            Unit Profit:{" "}
                            <span className="font-bold text-emerald-600">
                              ₹{Number(formPrice) - Number(formCost)} (
                              {(
                                ((Number(formPrice) - Number(formCost)) / Number(formPrice)) *
                                100
                              ).toFixed(0)}
                              % margin)
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Inventory Stock Units *
                      </label>
                      <input
                        type="number"
                        required
                        value={formStock}
                        onChange={(e) => setFormStock(e.target.value)}
                        placeholder="92"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Displayed to customer as "In Stock (XX units available)".
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Storefront Availability
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormInStock(!formInStock)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                          formInStock
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-rose-50 border-rose-200 text-rose-800"
                        }`}
                      >
                        {formInStock
                          ? "✓ Active / In Stock (Purchase Enabled)"
                          : "✕ Marked Out of Stock (Disabled)"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 3: COLORS & MULTI-ANGLE PHOTOS
                 ======================================================== */}
              {activeTab === "colors" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                        Product Color Swatches & Angle Galleries
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Each color variant has its own thumbnail swatch, color dot, and independent multi-angle photo gallery.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addColorVariant}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Color Variant</span>
                    </button>
                  </div>

                  {formColors.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                      <Palette className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">No color variants added yet.</p>
                      <button
                        type="button"
                        onClick={addColorVariant}
                        className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                      >
                        Add First Color
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formColors.map((colorItem, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-xs flex items-center gap-2">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block"
                                style={{ backgroundColor: colorItem.colorHex || "#ccc" }}
                              />
                              Color Variant #{cIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeColorVariant(cIdx)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors text-xs flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                Color Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={colorItem.name}
                                onChange={(e) =>
                                  updateColorField(cIdx, "name", e.target.value)
                                }
                                placeholder="e.g. Soft Pink, Pearl White"
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                Swatch Hex Code
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={colorItem.colorHex || "#3B82F6"}
                                  onChange={(e) =>
                                    updateColorField(cIdx, "colorHex", e.target.value)
                                  }
                                  className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                                />
                                <input
                                  type="text"
                                  value={colorItem.colorHex || ""}
                                  onChange={(e) =>
                                    updateColorField(cIdx, "colorHex", e.target.value)
                                  }
                                  placeholder="#F9A8D4"
                                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                Swatch Thumbnail URL
                              </label>
                              <input
                                type="text"
                                value={colorItem.image || ""}
                                onChange={(e) =>
                                  updateColorField(cIdx, "image", e.target.value)
                                }
                                placeholder="/products/... or https://..."
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              />
                            </div>
                          </div>

                          {/* Angle Photos for this Color */}
                          <div className="pt-2 border-t border-slate-200/80">
                            <label className="block text-[10px] font-bold text-slate-600 mb-1.5">
                              Different Angle Photos for this Color ({colorItem.images?.length || 0} photos)
                            </label>

                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              {colorItem.images?.map((angleImg, aIdx) => (
                                <div
                                  key={aIdx}
                                  className="relative group w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0"
                                >
                                  <img
                                    src={angleImg}
                                    alt={`Angle ${aIdx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeAnglePhotoFromColor(cIdx, aIdx)}
                                    className="absolute inset-0 bg-rose-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                    title="Delete this angle photo"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>

                            {/* Add Angle Photo input row */}
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                id={`angle-input-${cIdx}`}
                                placeholder="Paste image path (e.g. /products/heating-pad/pad-pink-1.jpg)"
                                className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    const val = (e.target as HTMLInputElement).value;
                                    addAnglePhotoToColor(cIdx, val);
                                    (e.target as HTMLInputElement).value = "";
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const el = document.getElementById(
                                    `angle-input-${cIdx}`
                                  ) as HTMLInputElement;
                                  if (el && el.value) {
                                    addAnglePhotoToColor(cIdx, el.value);
                                    el.value = "";
                                  }
                                }}
                                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors shrink-0"
                              >
                                + Add Angle Photo
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
                  TAB 4: POSTER & GALLERY
                 ======================================================== */}
              {activeTab === "media" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Primary Poster Image URL *
                    </label>
                    <input
                      type="text"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="/products/steam-iron.jpg or https://..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    {formImage && (
                      <div className="mt-2 flex items-center gap-3">
                        <img
                          src={formImage}
                          alt="Poster Preview"
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs"
                          onError={(e) => {
                            (e.target as any).src =
                              "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop";
                          }}
                        />
                        <span className="text-xs text-slate-500">
                          Main thumbnail shown in catalog cards and search results.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      General Product Gallery Images ({formGalleryImages.length} images)
                    </label>
                    <p className="text-[10px] text-slate-400 mb-2">
                      Used when no color swatches are selected or as default photos.
                    </p>

                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {formGalleryImages.map((gImg, gIdx) => (
                        <div
                          key={gIdx}
                          className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0"
                        >
                          <img
                            src={gImg}
                            alt={`Gallery ${gIdx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(gIdx)}
                            className="absolute inset-0 bg-rose-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            title="Remove photo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newGalleryInput}
                        onChange={(e) => setNewGalleryInput(e.target.value)}
                        placeholder="Paste image URL (e.g. /products/washer/washer-green-1.jpg)"
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addGalleryImage();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addGalleryImage}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold shrink-0 transition-colors"
                      >
                        + Add Image
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 5: KEY HIGHLIGHTS ("Why You'll Love This ❤️")
                 ======================================================== */}
              {activeTab === "highlights" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                      Key Highlights ("Why You'll Love This ❤️" Card)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      These bullet points appear directly below the quantity selector on the product page.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {formFeatures.map((feat, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80"
                      >
                        <span className="text-base select-none">✨</span>
                        <input
                          type="text"
                          value={feat}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormFeatures((prev) =>
                              prev.map((f, i) => (i === fIdx ? val : f))
                            );
                          }}
                          className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-slate-800 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeFeature(fIdx)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={newFeatureInput}
                      onChange={(e) => setNewFeatureInput(e.target.value)}
                      placeholder="e.g. Dual wet & dry ironing modes for all delicate and heavy fabrics"
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addFeature();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors"
                    >
                      + Add Highlight
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 6: SPECS & BOX & SOCIAL PROOF
                 ======================================================== */}
              {activeTab === "specs" && (
                <div className="space-y-5">
                  {/* General Specs */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm mb-2">
                      General Specifications & Material
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Size / Variant / Capacity
                        </label>
                        <input
                          type="text"
                          value={formVolume}
                          onChange={(e) => setFormVolume(e.target.value)}
                          placeholder="e.g. Adjustable Elastic Strap, 50ml Tank, 8L Capacity"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Material
                        </label>
                        <input
                          type="text"
                          value={formMaterial}
                          onChange={(e) => setFormMaterial(e.target.value)}
                          placeholder="e.g. Lycra + Plush Velvet, Ceramic + ABS"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Custom Key-Value Specs */}
                  <div className="pt-3 border-t border-slate-200">
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm mb-1">
                      Custom Technical Specifications
                    </h4>
                    <p className="text-[10px] text-slate-400 mb-2">
                      Rendered in the Specifications Accordion table on the product page.
                    </p>

                    <div className="space-y-2 mb-3">
                      {formSpecs.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200"
                        >
                          <span className="w-1/3 font-semibold text-slate-700 text-xs">
                            {s.key}
                          </span>
                          <span className="flex-1 text-slate-600 text-xs">{s.val}</span>
                          <button
                            type="button"
                            onClick={() => removeSpec(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Spec Name (e.g. Battery Capacity)"
                        value={newSpecKey}
                        onChange={(e) => setNewSpecKey(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <input
                        type="text"
                        placeholder="Spec Value (e.g. 1800mAh Rechargeable)"
                        value={newSpecVal}
                        onChange={(e) => setNewSpecVal(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <button
                        type="button"
                        onClick={addSpec}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
                      >
                        + Add Spec Row
                      </button>
                    </div>
                  </div>

                  {/* What's in the Box */}
                  <div className="pt-3 border-t border-slate-200">
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm mb-1">
                      What's in the Box (Accordion Content)
                    </h4>

                    <div className="space-y-2 mb-2">
                      {formWhatsInBox.map((boxItem, bIdx) => (
                        <div
                          key={bIdx}
                          className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200"
                        >
                          <Check className="w-4 h-4 text-[#FA521C] shrink-0" />
                          <span className="flex-1 text-slate-700 text-xs">{boxItem}</span>
                          <button
                            type="button"
                            onClick={() => removeBoxItem(bIdx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newBoxInput}
                        onChange={(e) => setNewBoxInput(e.target.value)}
                        placeholder="e.g. 1 × USB-C Charging Cable"
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addBoxItem();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addBoxItem}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold shrink-0 transition-colors"
                      >
                        + Add Box Item
                      </button>
                    </div>
                  </div>

                  {/* Social Proof Stats */}
                  <div className="pt-3 border-t border-slate-200">
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm mb-2">
                      Social Proof & Rating Indicators
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Rating (Out of 5.0)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          value={formRating}
                          onChange={(e) => setFormRating(e.target.value)}
                          placeholder="4.8"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Review Count
                        </label>
                        <input
                          type="number"
                          value={formReviewCount}
                          onChange={(e) => setFormReviewCount(e.target.value)}
                          placeholder="1250"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Verified Sold Text
                        </label>
                        <input
                          type="text"
                          value={formSoldCount}
                          onChange={(e) => setFormSoldCount(e.target.value)}
                          placeholder="1,250+ verified orders"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving to Cloudflare D1...</span>
                      </>
                    ) : (
                      <span>{editingProduct ? "Update Product" : "Create Product"}</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-base">Delete Product?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-slate-800">
                  {deleteConfirmProduct.name}
                </span>{" "}
                from the store catalog?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmProduct(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteProduct(deleteConfirmProduct.id)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
