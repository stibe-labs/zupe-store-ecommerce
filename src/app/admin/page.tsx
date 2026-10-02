"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Plus,
  Trash2,
  CheckCircle,
  Truck,
  Clock,
  ArrowLeft,
  X,
  Loader2,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { DEFAULT_PRODUCTS, PRODUCT_CATEGORIES } from "@/data/zupeProducts";
import { Product } from "@/types/product";
import { OrderRecord } from "@/lib/orderStore";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // New Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Decor");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [stockCount, setStockCount] = useState("25");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load products and orders
  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, ordRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/orders"),
        ]);
        const prodData = await prodRes.json();
        const ordData = await ordRes.json();

        if (prodData.success && Array.isArray(prodData.products)) {
          setProducts(prodData.products);
        }
        if (ordData.success && Array.isArray(ordData.orders)) {
          setOrders(ordData.orders);
        }
      } catch (err) {
        console.warn("Admin data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !imageUrl) return;
    setIsSubmitting(true);

    const payload = {
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category,
      tagline,
      description: description || tagline || name,
      price: Number(price),
      mrp: Number(mrp) || Number(price),
      offer_price: Number(price),
      stock_count: Number(stockCount) || 10,
      poster_image: imageUrl,
      images: [imageUrl],
      badge: "New",
      in_stock: 1,
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts([data.product, ...products]);
        setShowAddModal(false);
        setName("");
        setTagline("");
        setDescription("");
        setPrice("");
        setMrp("");
        setImageUrl("");
      }
    } catch (err) {
      alert("Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter((p) => p.id !== id));
      }
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderRecord["order_status"]) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, order_status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(
          orders.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
        );
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#12121E] text-white">
      {/* Top Bar */}
      <header className="border-b border-white/10 bg-[#1A1A2E]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-xs">
              <ArrowLeft className="w-4 h-4" /> Back to Store
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#6C5CE7] flex items-center justify-center font-bold">
                Z
              </div>
              <span className="font-display font-bold text-lg">Zupe Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-[#6C5CE7] hover:bg-[#5848d2] text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-[#6C5CE7]/30 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium">Total Revenue</span>
              <DollarSign className="w-4 h-4 text-[#6C5CE7]" />
            </div>
            <p className="text-2xl font-bold font-display text-white">
              ₹{totalRevenue.toLocaleString()}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium">Total Orders</span>
              <Package className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold font-display text-white">
              {orders.length}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium">Active Catalog</span>
              <ShoppingBag className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold font-display text-white">
              {products.length} Items
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium">Platform Status</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Cloudflare D1 Active
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 mb-6 gap-6">
          <button
            onClick={() => setActiveTab("products")}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === "products" ? "text-[#6C5CE7]" : "text-gray-400 hover:text-white"
            }`}
          >
            Products Catalog ({products.length})
            {activeTab === "products" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6C5CE7]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === "orders" ? "text-[#6C5CE7]" : "text-gray-400 hover:text-white"
            }`}
          >
            Customer Orders ({orders.length})
            {activeTab === "orders" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6C5CE7]" />
            )}
          </button>
        </div>

        {/* Tab 1: Products Table */}
        {activeTab === "products" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price / MRP</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Badge</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl bg-white/10 overflow-hidden flex-shrink-0">
                          <Image src={p.poster_image} alt={p.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm line-clamp-1">{p.name}</p>
                          <p className="text-[11px] text-gray-400">{p.id}</p>
                        </div>
                      </td>
                      <td className="p-4 text-gray-300">{p.category}</td>
                      <td className="p-4">
                        <span className="font-bold text-white">₹{p.price.toLocaleString()}</span>
                        {p.mrp && (
                          <span className="text-gray-500 line-through ml-2">₹{p.mrp.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                            p.stock_count > 10
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {p.stock_count} units
                        </span>
                      </td>
                      <td className="p-4">
                        {p.badge && (
                          <span className="px-2 py-0.5 rounded-md bg-[#6C5CE7]/20 text-[#A29BFE] font-bold text-[10px]">
                            {p.badge}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Orders Table */}
        {activeTab === "orders" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Items</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-gray-300 font-semibold">{o.id}</td>
                      <td className="p-4">
                        <p className="font-bold text-white">{o.customer_name}</p>
                        <p className="text-[11px] text-gray-400">{o.customer_email}</p>
                      </td>
                      <td className="p-4 text-gray-300">
                        {o.items?.length || 1} item(s)
                      </td>
                      <td className="p-4 font-bold text-emerald-400">
                        ₹{o.total_amount?.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            o.order_status === "delivered"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : o.order_status === "shipped"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-purple-500/20 text-purple-300"
                          }`}
                        >
                          {o.order_status}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={o.order_status}
                          onChange={(e) =>
                            handleUpdateOrderStatus(o.id, e.target.value as any)
                          }
                          aria-label="Update order status"
                          className="px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-xs text-white focus:outline-none"
                        >
                          <option value="processing" className="bg-[#1A1A2E]">Processing</option>
                          <option value="shipped" className="bg-[#1A1A2E]">Shipped</option>
                          <option value="delivered" className="bg-[#1A1A2E]">Delivered</option>
                          <option value="cancelled" className="bg-[#1A1A2E]">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#1A1A2E] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold font-display text-white mb-6">
              Add New Product to Zupe
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sculptural Ceramic Lamp"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#6C5CE7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    aria-label="Product category"
                    className="w-full px-4 py-2.5 bg-[#1A1A2E] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#6C5CE7]"
                  >
                    {PRODUCT_CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={stockCount}
                    onChange={(e) => setStockCount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Offer Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1990"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Original MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    placeholder="2490"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Image URL (Unsplash or direct image) *
                </label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Minimalist aesthetics for everyday spaces"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed craftsmanship and design notes..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#6C5CE7] hover:bg-[#5848d2] text-white font-semibold text-sm shadow-lg shadow-[#6C5CE7]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>Publish Product</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
