"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  Flame,
  Tag,
  Trophy,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  Search,
  Check,
  X,
  ExternalLink,
  Layers,
  ShoppingBag,
} from "lucide-react";
import { Product } from "@/types/product";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import {
  ShowcaseCollectionsConfig,
  DEFAULT_SHOWCASE_COLLECTIONS,
} from "@/lib/storeContent";

interface ShowcaseCollectionsCustomizerProps {
  showToast: (type: "success" | "error", text: string) => void;
}

type ShowcaseKey = "top_pickz" | "new_arrivals" | "best_sellers" | "today_deals";

interface ShowcaseMeta {
  key: ShowcaseKey;
  configKey: keyof ShowcaseCollectionsConfig;
  title: string;
  badge: string;
  icon: React.ElementType;
  color: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  destination: string;
}

const SHOWCASE_SECTIONS: ShowcaseMeta[] = [
  {
    key: "top_pickz",
    configKey: "topPickzProductIds",
    title: "Top Pickz",
    badge: "Homepage Top Pickz",
    icon: Flame,
    color: "#FF5722",
    badgeBg: "bg-orange-50 border-orange-200",
    badgeText: "text-orange-700",
    description:
      "Curated products featured in the horizontal moving carousel on the homepage immediately below the hero banner.",
    destination: "Homepage (Top Pickz Carousel)",
  },
  {
    key: "new_arrivals",
    configKey: "newArrivalsProductIds",
    title: "New Arrivals",
    badge: "New Arrivals Page & Home",
    icon: Sparkles,
    color: "#8B5CF6",
    badgeBg: "bg-purple-50 border-purple-200",
    badgeText: "text-purple-700",
    description:
      "Curated latest products displayed in the Homepage New Arrivals section and the New Arrivals filter page (/products?filter=new).",
    destination: "Homepage & /products?filter=new",
  },
  {
    key: "best_sellers",
    configKey: "bestSellersProductIds",
    title: "Best Sellers",
    badge: "Best Sellers Page",
    icon: Trophy,
    color: "#F59E0B",
    badgeBg: "bg-amber-50 border-amber-200",
    badgeText: "text-amber-700",
    description:
      "Top-performing and highest-rated products displayed when users browse Best Sellers (/products?filter=best).",
    destination: "Homepage & /products?filter=best",
  },
  {
    key: "today_deals",
    configKey: "todayDealsProductIds",
    title: "Today's Best Deals",
    badge: "Flash Deals & Offers",
    icon: Tag,
    color: "#10B981",
    badgeBg: "bg-emerald-50 border-emerald-200",
    badgeText: "text-emerald-700",
    description:
      "Special discounted products featured in the Today's Best Deals section on the homepage with promotional pricing badges.",
    destination: "Homepage (Deals Section) & /products?filter=deals",
  },
];

// Helper to ensure collection IDs strictly match real active store products and map legacy aliases
function sanitizeCollectionIds(ids: string[], products: Product[]): string[] {
  if (!Array.isArray(ids)) return [];
  const validIds = new Set(products.map((p) => p.id));
  const validSlugs = new Set(products.map((p) => p.slug).filter(Boolean));
  const aliasMap: Record<string, string> = {
    "water-ripple-lamp": "ripple-lamp",
    "foldable-mini-washer": "mini-washing-machine",
    "mini-thermal-printer": "mini-printer",
    "mini-hot-air-popcorn-maker": "popcorn-maker",
  };
  const seen = new Set<string>();
  const result: string[] = [];

  for (const rawId of ids) {
    const resolvedId = aliasMap[rawId] || rawId;
    if (validIds.has(resolvedId) || validSlugs.has(resolvedId)) {
      if (!seen.has(resolvedId)) {
        seen.add(resolvedId);
        result.push(resolvedId);
      }
    }
  }
  return result;
}

export function ShowcaseCollectionsCustomizer({
  showToast,
}: ShowcaseCollectionsCustomizerProps) {
  const [activeTab, setActiveTab] = useState<ShowcaseKey>("top_pickz");
  const [collections, setCollections] = useState<ShowcaseCollectionsConfig>(
    DEFAULT_SHOWCASE_COLLECTIONS
  );
  const [allProducts, setAllProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [modalCategory, setModalCategory] = useState("All");

  // Fetch collections & products on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [showcaseRes, productsRes] = await Promise.all([
          fetch("/api/content/showcase"),
          fetch("/api/products"),
        ]);

        let items: Product[] = DEFAULT_PRODUCTS;
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          const list = Array.isArray(productsData)
            ? productsData
            : productsData?.products;
          if (Array.isArray(list) && list.length > 0) {
            items = list;
            if (isMounted) setAllProducts(list);
          }
        }

        if (showcaseRes.ok) {
          const showcaseData = await showcaseRes.json();
          if (showcaseData.collections && isMounted) {
            const raw = showcaseData.collections;
            const sanitized: ShowcaseCollectionsConfig = {
              topPickzProductIds: sanitizeCollectionIds(raw.topPickzProductIds, items),
              newArrivalsProductIds: sanitizeCollectionIds(raw.newArrivalsProductIds, items),
              bestSellersProductIds: sanitizeCollectionIds(raw.bestSellersProductIds, items),
              todayDealsProductIds: sanitizeCollectionIds(raw.todayDealsProductIds, items),
            };
            setCollections(sanitized);
          }
        }
      } catch (err) {
        console.error("Failed to load showcase data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeMeta = SHOWCASE_SECTIONS.find((s) => s.key === activeTab)!;
  const currentProductIds = collections[activeMeta.configKey] || [];

  // Map IDs to actual product objects in order
  const currentSelectedProducts = currentProductIds
    .map((id) => allProducts.find((p) => p.id === id || p.slug === id))
    .filter(Boolean) as Product[];

  // Save changes to API
  const handleSave = async () => {
    setSaving(true);
    try {
      const cleanCollections: ShowcaseCollectionsConfig = {
        topPickzProductIds: sanitizeCollectionIds(collections.topPickzProductIds, allProducts),
        newArrivalsProductIds: sanitizeCollectionIds(collections.newArrivalsProductIds, allProducts),
        bestSellersProductIds: sanitizeCollectionIds(collections.bestSellersProductIds, allProducts),
        todayDealsProductIds: sanitizeCollectionIds(collections.todayDealsProductIds, allProducts),
      };

      const res = await fetch("/api/content/showcase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collections: cleanCollections }),
      });
      const data = await res.json();
      if (data.success) {
        setCollections(cleanCollections);
        showToast("success", "Showcase collections saved successfully!");
      } else {
        showToast("error", data.error || "Failed to save collections.");
      }
    } catch {
      showToast("error", "Network error saving collections.");
    } finally {
      setSaving(false);
    }
  };

  // Reset to default
  const handleResetDefaults = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all showcase collections to default store recommendations?"
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/content/showcase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_defaults" }),
      });
      const data = await res.json();
      if (data.success && data.collections) {
        setCollections(data.collections);
        showToast("success", "Reset to default showcase collections.");
      } else {
        showToast("error", data.error || "Failed to reset defaults.");
      }
    } catch {
      showToast("error", "Error resetting defaults.");
    } finally {
      setSaving(false);
    }
  };

  // Move product up/down in current collection
  const moveProduct = (index: number, direction: "up" | "down") => {
    const list = [...currentProductIds];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setCollections((prev) => ({
      ...prev,
      [activeMeta.configKey]: list,
    }));
  };

  // Remove single product from current collection
  const removeProduct = (id: string) => {
    setCollections((prev) => ({
      ...prev,
      [activeMeta.configKey]: prev[activeMeta.configKey].filter(
        (item) => item !== id
      ),
    }));
  };

  // Toggle product selection in modal
  const toggleModalProduct = (id: string) => {
    const isSelected = currentProductIds.includes(id);
    let updated: string[];
    if (isSelected) {
      updated = currentProductIds.filter((item) => item !== id);
    } else {
      updated = [...currentProductIds, id];
    }
    setCollections((prev) => ({
      ...prev,
      [activeMeta.configKey]: updated,
    }));
  };

  // Categories list for modal filter
  const uniqueCategories = [
    "All",
    ...Array.from(new Set(allProducts.map((p) => p.category).filter(Boolean))),
  ];

  // Filter products inside modal
  const filteredModalProducts = allProducts.filter((product) => {
    if (modalCategory !== "All" && product.category !== modalCategory) {
      return false;
    }
    if (modalSearch.trim()) {
      const q = modalSearch.toLowerCase();
      const matchName = product.name?.toLowerCase().includes(q);
      const matchCat = product.category?.toLowerCase().includes(q);
      const matchSub = product.subcategory?.toLowerCase().includes(q);
      const matchId = product.id?.toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchSub && !matchId) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-8 h-8 border-3 border-[#FF7A00] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-500">
          Loading Showcase Collections...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-50 text-[#FF7A00]">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Showcase Collections Manager
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Select and reorder products displayed in <strong>Top Pickz</strong>,{" "}
            <strong>New Arrivals</strong>, <strong>Best Sellers</strong>, and{" "}
            <strong>Today's Best Deals</strong>. Products selected here automatically sync live to the storefront.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleResetDefaults}
            disabled={saving}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Reset to default selections"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-[#FF7A00] hover:bg-[#E06900] text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Showcase Collections</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 Showcase Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SHOWCASE_SECTIONS.map((sec) => {
          const count = (collections[sec.configKey] || []).filter((id) =>
            allProducts.some((p) => p.id === id || p.slug === id)
          ).length;
          const isActive = activeTab === sec.key;
          const Icon = sec.icon;

          return (
            <button
              key={sec.key}
              onClick={() => setActiveTab(sec.key)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? "bg-white border-[#FF7A00] ring-2 ring-[#FF7A00]/20 shadow-md"
                  : "bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: sec.color }}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span
                  className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${
                    isActive
                      ? "bg-orange-50 border-orange-200 text-[#FF7A00]"
                      : "bg-slate-100 border-slate-200 text-slate-600"
                  }`}
                >
                  {count} {count === 1 ? "Product" : "Products"}
                </span>
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">{sec.title}</p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {sec.destination}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Section Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
        {/* Section Info Card */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${activeMeta.badgeBg}`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black uppercase tracking-wider ${activeMeta.badgeText}`}>
                {activeMeta.title} Collection
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/80 text-slate-700 border border-slate-200/50">
                {currentSelectedProducts.length} Selected
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {activeMeta.description}
            </p>
          </div>

          <button
            onClick={() => {
              setModalSearch("");
              setModalCategory("All");
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Select / Add Products</span>
          </button>
        </div>

        {/* Selected Products List */}
        {currentSelectedProducts.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">
              No products selected for {activeMeta.title}
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click the button below to pick products from your store catalog to showcase in this section.
            </p>
            <button
              onClick={() => {
                setModalSearch("");
                setModalCategory("All");
                setIsModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#FF7A00] hover:bg-[#E06900] text-white text-xs font-black inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Products to {activeMeta.title}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
              <span>Selected Products & Display Order</span>
              <span>Reorder / Remove</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
              {currentSelectedProducts.map((product, index) => {
                const isFirst = index === 0;
                const isLast = index === currentSelectedProducts.length - 1;
                const isOutOfStock =
                  product.in_stock === 0 ||
                  (product.stock_count !== undefined && product.stock_count <= 0);

                return (
                  <div
                    key={product.id}
                    className="p-3 bg-white hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3"
                  >
                    {/* Left: Index + Image + Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 text-center text-xs font-black text-slate-400">
                        #{index + 1}
                      </span>

                      <div className="relative w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        {product.poster_image ? (
                          <Image
                            src={product.poster_image}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black text-slate-800 truncate max-w-xs sm:max-w-md">
                            {product.name}
                          </p>
                          {isOutOfStock ? (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-sm bg-red-100 text-red-700 shrink-0">
                              Out of Stock
                            </span>
                          ) : (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-700 shrink-0">
                              In Stock
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {product.category || "General"}
                          {product.subcategory ? ` › ${product.subcategory}` : ""} · ₹{product.price}
                          {product.mrp && product.mrp > product.price && (
                            <span className="line-through ml-1 text-slate-300">
                              ₹{product.mrp}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Right: Move Up / Down & Remove */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => moveProduct(index, "up")}
                        disabled={isFirst}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveProduct(index, "down")}
                        disabled={isLast}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer ml-1"
                        title="Remove from collection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Product Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>Select Products for {activeMeta.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-[#FF7A00] font-black">
                    {currentSelectedProducts.length} Selected
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Check or uncheck products to include them in this showcase collection.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search & Filters */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="Search products by title, category, or ID..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                {uniqueCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setModalCategory(cat)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      modalCategory === cat
                        ? "bg-[#FF7A00] text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Products List */}
            <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100 space-y-1">
              {filteredModalProducts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No products found matching &ldquo;{modalSearch}&rdquo;
                </div>
              ) : (
                filteredModalProducts.map((product) => {
                  const isChecked = currentProductIds.includes(product.id);
                  const isOutOfStock =
                    product.in_stock === 0 ||
                    (product.stock_count !== undefined && product.stock_count <= 0);

                  return (
                    <div
                      key={product.id}
                      onClick={() => toggleModalProduct(product.id)}
                      className={`p-2.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-orange-50/60 border border-orange-200"
                          : "hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox */}
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            isChecked
                              ? "bg-[#FF7A00] border-[#FF7A00] text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        {/* Thumbnail */}
                        <div className="relative w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          {product.poster_image ? (
                            <Image
                              src={product.poster_image}
                              alt={product.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <ShoppingBag className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        {/* Title & Info */}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {product.category} · ₹{product.price}
                            {isOutOfStock && (
                              <span className="ml-2 text-rose-500 font-bold">
                                · Out of Stock
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                          isChecked
                            ? "bg-orange-100 text-[#FF7A00]"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {isChecked ? "Selected" : "Add"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {currentProductIds.length} products currently in {activeMeta.title}
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-colors cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
