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
} from "lucide-react";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";
import { Product } from "@/types/product";

export default function AdminProductsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Decor");
  const [formTagline, setFormTagline] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formMrp, setFormMrp] = useState("");
  const [formCost, setFormCost] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formBadge, setFormBadge] = useState<string>("");
  const [formInStock, setFormInStock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchProducts = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/products");
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setFormName("");
    setFormCategory("Home & Living");
    setFormTagline("");
    setFormPrice("");
    setFormMrp("");
    setFormCost("");
    setFormStock("50");
    setFormImage("");
    setFormBadge("");
    setFormInStock(true);
    setActionMessage(null);
    setShowAddModal(true);
  };

  const openEditModal = (prod: Product) => {
    const cost = prod.cost_price !== undefined ? prod.cost_price : Math.round(prod.price * 0.42);
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategory(prod.category || "Decor");
    setFormTagline(prod.tagline || "");
    setFormPrice(String(prod.price));
    setFormMrp(String(prod.mrp || prod.price));
    setFormCost(String(cost));
    setFormStock(String(prod.stock_count || 0));
    setFormImage(prod.poster_image || "");
    setFormBadge(prod.badge || "");
    setFormInStock(prod.in_stock === 1);
    setActionMessage(null);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice) return;

    setIsSubmitting(true);
    setActionMessage(null);

    const priceNum = Number(formPrice) || 0;
    const mrpNum = Number(formMrp) || priceNum;
    const costNum = formCost ? Number(formCost) : Math.round(priceNum * 0.42);
    const stockNum = Number(formStock) || 0;

    const payload = {
      ...(editingProduct ? { id: editingProduct.id, slug: editingProduct.slug } : {}),
      name: formName,
      category: formCategory,
      tagline: formTagline,
      price: priceNum,
      offer_price: priceNum,
      mrp: mrpNum,
      cost_price: costNum,
      stock_count: stockNum,
      poster_image: formImage || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop",
      badge: formBadge || "",
      in_stock: formInStock ? 1 : 0,
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
          setEditingProduct(null);
        } else {
          setProducts((prev) => [data.product, ...prev]);
          setShowAddModal(false);
        }
      } else {
        setActionMessage({ text: data.error || "Save failed", type: "error" });
      }
    } catch (err: any) {
      setActionMessage({ text: err.message || "Failed to save product", type: "error" });
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
        (p.tagline && p.tagline.toLowerCase().includes(s))
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
        (p.cost_price !== undefined ? Number(p.cost_price) : Math.round(Number(p.price) * 0.42)),
    0
  );
  const avgMargin =
    totalCatalogValue > 0
      ? (((totalCatalogValue - totalCapitalInvested) / totalCatalogValue) * 100).toFixed(1)
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
                Products & Supplier Costing
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Manage product catalog, real unit supplier costs (COGS), selling prices, and live stock levels.
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
              <p className="text-2xl sm:text-3xl font-bold text-amber-600 mt-2 tracking-tight">
                ₹{totalCapitalInvested.toLocaleString("en-IN")}
              </p>
              <span className="text-xs text-slate-500 mt-1 block">
                Invested supplier procurement cost
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Avg Catalog Margin
              </span>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2 tracking-tight">
                {avgMargin}%
              </p>
              <span className="text-xs text-emerald-700 font-semibold mt-1 block">
                Healthy unit economics
              </span>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200/60"
                  aria-label="Clear product search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-5">Product</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Supplier Cost</th>
                    <th className="py-3.5 px-4">Selling Price</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4">Gross Margin</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No products found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((prod) => {
                      const cost =
                        prod.cost_price !== undefined
                          ? prod.cost_price
                          : Math.round(prod.price * 0.42);
                      const margin = prod.price - cost;
                      const marginPercent =
                        prod.price > 0 ? ((margin / prod.price) * 100).toFixed(0) : "0";

                      return (
                        <tr key={prod.id} className="hover:bg-slate-50/70">
                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.poster_image}
                                alt={prod.name}
                                className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200"
                              />
                              <div>
                                <p className="font-bold text-slate-900">{prod.name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[11px] text-slate-400 font-mono">
                                    SKU: ZUPE-{prod.id.substring(0, 6).toUpperCase()}
                                  </span>
                                  {prod.badge && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                      {prod.badge}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                            {prod.category}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                            ₹{cost}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                            ₹{prod.price}
                            {prod.mrp && prod.mrp > prod.price && (
                              <span className="text-[11px] text-slate-400 line-through ml-1.5 font-normal">
                                ₹{prod.mrp}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                            {prod.stock_count} units
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-bold text-emerald-600">₹{margin}</span>
                            <span className="text-[11px] text-slate-400 ml-1">
                              ({marginPercent}%)
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {prod.in_stock === 1 && prod.stock_count > 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                                In Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                                Out of Stock
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditModal(prod)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Edit Product & Cost"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmProduct(prod)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                title="Delete Product"
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

      {/* Add / Edit Product Modal */}
      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Product"}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionMessage && (
              <div
                className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  actionMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {actionMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                )}
                <span>{actionMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-4 text-xs sm:text-sm">
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Dynamic Water Ripple Night Light"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
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
                      placeholder="e.g. Home & Living, Decor"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Badge / Tag
                    </label>
                    <select
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">No Badge</option>
                      <option value="Sale">Sale</option>
                      <option value="Trending">Trending</option>
                      <option value="New">New</option>
                      <option value="Limited">Limited</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={formTagline}
                    onChange={(e) => setFormTagline(e.target.value)}
                    placeholder="e.g. Ambient crystal rotating glow for modern homes"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Financial & Costing Inputs */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                    Pricing & Supplier COGS
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Selling Price (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        placeholder="650"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        MRP (₹)
                      </label>
                      <input
                        type="number"
                        value={formMrp}
                        onChange={(e) => setFormMrp(e.target.value)}
                        placeholder="1099"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
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

                  {formPrice && formCost && (
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Estimated Unit Margin:</span>
                      <span className="font-bold text-emerald-600">
                        ₹{Number(formPrice) - Number(formCost)} (
                        {(
                          ((Number(formPrice) - Number(formCost)) / Number(formPrice)) *
                          100
                        ).toFixed(0)}
                        %)
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Inventory Stock Count *
                    </label>
                    <input
                      type="number"
                      required
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      placeholder="85"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Availability Status
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormInStock(!formInStock)}
                      className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                        formInStock
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-rose-50 border-rose-200 text-rose-800"
                      }`}
                    >
                      {formInStock ? "✓ In Stock (Live on Store)" : "✕ Out of Stock (Hidden)"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Poster Image URL
                  </label>
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://... or /products/..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {formImage && (
                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src={formImage}
                        alt="Preview"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                        onError={(e) => {
                          (e.target as any).src =
                            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop";
                        }}
                      />
                      <span className="text-xs text-slate-500">Image preview valid</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingProduct ? "Update Product" : "Create Product"}</span>
                  )}
                </button>
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

