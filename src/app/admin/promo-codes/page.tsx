"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Tag,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Edit2,
  Copy,
  Check,
  Percent,
  DollarSign,
  Box,
  Layers,
  ChevronRight,
  X,
  ExternalLink,
  Sparkles,
  Zap,
} from "lucide-react";
import { Coupon } from "@/lib/couponStore";
import { DEFAULT_PRODUCTS } from "@/data/zupeProducts";

export default function AdminPromoCodesPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");

  // KPIs
  const [kpis, setKpis] = useState({
    total: 0,
    active: 0,
    expired: 0,
    totalUses: 0,
  });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteConfirmCoupon, setDeleteConfirmCoupon] = useState<Coupon | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form Fields
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDiscountType, setFormDiscountType] = useState<"PERCENTAGE" | "FLAT">("PERCENTAGE");
  const [formDiscountValue, setFormDiscountValue] = useState("");
  const [formMinOrder, setFormMinOrder] = useState("");
  const [formMaxDiscount, setFormMaxDiscount] = useState("");
  const [formExpiresAt, setFormExpiresAt] = useState("");
  const [formUsageLimit, setFormUsageLimit] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formApplicableType, setFormApplicableType] = useState<"ALL" | "SPECIFIC">("ALL");
  const [formApplicableProducts, setFormApplicableProducts] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const fetchCoupons = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/admin/promo-codes");
      const data = await res.json();
      if (data.success && Array.isArray(data.coupons)) {
        setCoupons(data.coupons);
        if (data.kpis) {
          setKpis(data.kpis);
        }
      }
    } catch (err) {
      console.warn("Failed to load promo codes:", err);
      showToast("Failed to load promo codes", "error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (modalOpen || Boolean(deleteConfirmCoupon)) {
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
  }, [modalOpen, deleteConfirmCoupon]);

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode((prev) => (prev === code ? null : prev)), 2500);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setFormCode("");
    setFormDescription("");
    setFormDiscountType("PERCENTAGE");
    setFormDiscountValue("10");
    setFormMinOrder("0");
    setFormMaxDiscount("100");
    // Default expiry 30 days ahead
    const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    setFormExpiresAt(d.toISOString().slice(0, 16));
    setFormUsageLimit("500");
    setFormIsActive(true);
    setFormApplicableType("ALL");
    setFormApplicableProducts([]);
    setModalError("");
    setModalOpen(true);
  };

  const handleOpenEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormCode(coupon.code);
    setFormDescription(coupon.description || "");
    setFormDiscountType(coupon.discount_type);
    setFormDiscountValue(String(coupon.discount_value));
    setFormMinOrder(coupon.min_order_amount ? String(coupon.min_order_amount) : "0");
    setFormMaxDiscount(coupon.max_discount_amount ? String(coupon.max_discount_amount) : "");
    setFormExpiresAt(coupon.expires_at ? new Date(coupon.expires_at).toISOString().slice(0, 16) : "");
    setFormUsageLimit(coupon.usage_limit ? String(coupon.usage_limit) : "");
    setFormIsActive(coupon.is_active);
    setFormApplicableType(coupon.applicable_type);
    setFormApplicableProducts(coupon.applicable_products || []);
    setModalError("");
    setModalOpen(true);
  };

  const handleGenerateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let rand = "";
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const prefix = formDiscountType === "PERCENTAGE" ? `SAVE${formDiscountValue || "20"}` : "OFF";
    setFormCode(`${prefix}-${rand}`.toUpperCase());
  };

  const handleQuickPresetDays = (days: number | null) => {
    if (days === null) {
      setFormExpiresAt("");
      return;
    }
    const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    setFormExpiresAt(d.toISOString().slice(0, 16));
  };

  const handleToggleProduct = (productId: string) => {
    setFormApplicableProducts((prev) =>
      prev.includes(productId) ? prev.filter((p) => p !== productId) : [...prev, productId]
    );
  };

  const handleToggleActive = async (coupon: Coupon) => {
    const newStatus = !coupon.is_active;
    // Optimistic UI update
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, is_active: newStatus } : c))
    );

    try {
      const res = await fetch("/api/admin/promo-codes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coupon.id, action: "toggle", is_active: newStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error);
      }
      showToast(newStatus ? `Promo code ${coupon.code} activated` : `Promo code ${coupon.code} paused`);
    } catch {
      // Revert on error
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, is_active: coupon.is_active } : c))
      );
      showToast("Failed to update status", "error");
    }
  };

  const handleSubmitCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    const codeClean = formCode.trim().toUpperCase();
    if (!codeClean) {
      setModalError("Please enter a promo code.");
      return;
    }

    const valNum = Number(formDiscountValue);
    if (isNaN(valNum) || valNum <= 0) {
      setModalError("Please provide a valid discount value greater than 0.");
      return;
    }

    if (formDiscountType === "PERCENTAGE" && valNum > 100) {
      setModalError("Percentage discount cannot exceed 100%.");
      return;
    }

    if (formApplicableType === "SPECIFIC" && formApplicableProducts.length === 0) {
      setModalError("Please select at least one promotional product or change to 'All Products'.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        code: codeClean,
        description: formDescription.trim(),
        discount_type: formDiscountType,
        discount_value: valNum,
        min_order_amount: formMinOrder ? Number(formMinOrder) : 0,
        max_discount_amount:
          formDiscountType === "PERCENTAGE" && formMaxDiscount ? Number(formMaxDiscount) : null,
        expires_at: formExpiresAt ? new Date(formExpiresAt).toISOString() : null,
        usage_limit: formUsageLimit ? Number(formUsageLimit) : null,
        is_active: formIsActive,
        applicable_type: formApplicableType,
        applicable_products: formApplicableProducts,
      };

      if (editingCoupon) {
        // Edit existing
        const res = await fetch("/api/admin/promo-codes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingCoupon.id, ...payload }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to update promo code");

        setCoupons((prev) => prev.map((c) => (c.id === editingCoupon.id ? data.coupon : c)));
        showToast(`Promo code ${codeClean} updated successfully!`);
      } else {
        // Create new
        const res = await fetch("/api/admin/promo-codes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to create promo code");

        setCoupons((prev) => [data.coupon, ...prev]);
        showToast(`Promo code ${codeClean} created successfully!`);
      }

      setModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      setModalError(err.message || "An error occurred while saving promo code.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async () => {
    if (!deleteConfirmCoupon) return;

    try {
      const res = await fetch(`/api/admin/promo-codes?id=${encodeURIComponent(deleteConfirmCoupon.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== deleteConfirmCoupon.id));
        showToast(`Deleted promo code ${deleteConfirmCoupon.code}`);
      } else {
        showToast(data.error || "Failed to delete promo code", "error");
      }
    } catch {
      showToast("Network error while deleting promo code", "error");
    } finally {
      setDeleteConfirmCoupon(null);
    }
  };

  // Filter Logic
  const filteredCoupons = coupons.filter((c) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const codeMatches = c.code.toLowerCase().includes(q);
      const descMatches = c.description.toLowerCase().includes(q);
      if (!codeMatches && !descMatches) return false;
    }

    // Status
    const now = Date.now();
    const isExpired = c.expires_at ? new Date(c.expires_at).getTime() < now : false;

    if (statusFilter === "active") {
      if (isExpired || !c.is_active) return false;
    } else if (statusFilter === "expired") {
      if (!isExpired) return false;
    } else if (statusFilter === "inactive") {
      if (c.is_active) return false;
    }

    // Type
    if (typeFilter !== "all") {
      if (c.discount_type !== typeFilter) return false;
    }

    // Scope
    if (scopeFilter !== "all") {
      if (c.applicable_type !== scopeFilter) return false;
    }

    return true;
  });

  const getExpiryDetails = (expires_at?: string | null) => {
    if (!expires_at) {
      return { label: "Never expires", status: "none", color: "text-slate-600 bg-slate-100 border-slate-200" };
    }
    const diff = new Date(expires_at).getTime() - Date.now();
    const formatted = new Date(expires_at).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    if (diff <= 0) {
      return {
        label: `Expired on ${formatted}`,
        status: "expired",
        color: "text-rose-700 bg-rose-50 border-rose-200",
      };
    }

    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (daysLeft === 1) {
      return {
        label: `Expires today (${formatted})`,
        status: "warning",
        color: "text-amber-700 bg-amber-50 border-amber-200",
      };
    }
    if (daysLeft <= 7) {
      return {
        label: `Expires in ${daysLeft} days (${formatted})`,
        status: "warning",
        color: "text-amber-700 bg-amber-50 border-amber-200",
      };
    }
    return {
      label: `Expires in ${daysLeft} days (${formatted})`,
      status: "active",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    };
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-[100] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-medium backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Admin Sidebar */}
      <AdminSidebar mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />

      {/* Main Container */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminHeader
          onOpenMobile={() => setMobileSidebarOpen(true)}
          onRefresh={() => fetchCoupons(true)}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shadow-sm">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                    Promo Codes & Discounts
                  </h1>
                  <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                    Configure promotional coupons, expiration limits, and product-specific deals.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Create Promo Code</span>
            </button>
          </div>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Coupons</span>
                <Tag className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{kpis.total}</div>
              <p className="text-xs text-slate-500 mt-1">Configured in store</p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between text-emerald-600 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Codes</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{kpis.active}</div>
              <p className="text-xs text-slate-500 mt-1">Ready for checkout</p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between text-rose-600 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Expired Codes</span>
                <Clock className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">{kpis.expired}</div>
              <p className="text-xs text-slate-500 mt-1">Past validity window</p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between text-amber-600 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Uses</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">{kpis.totalUses}</div>
              <p className="text-xs text-slate-500 mt-1">Redeemed by customers</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search promo code or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter promo codes by status"
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="expired">Expired Only</option>
                <option value="inactive">Disabled / Paused</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                aria-label="Filter promo codes by discount type"
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20"
              >
                <option value="all">All Types</option>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Amount (₹)</option>
              </select>

              <select
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value)}
                aria-label="Filter promo codes by product scope"
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20"
              >
                <option value="all">All Product Scopes</option>
                <option value="ALL">All Products (Storewide)</option>
                <option value="SPECIFIC">Specific Products Only</option>
              </select>

              {(searchQuery || statusFilter !== "all" || typeFilter !== "all" || scopeFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                    setScopeFilter("all");
                  }}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Coupons Table / Grid */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-slate-500 font-medium">Loading promo codes from database...</p>
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div className="py-16 text-center space-y-4 px-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
                  <Tag className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-900">No promo codes found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {searchQuery || statusFilter !== "all"
                      ? "No promo codes match your current filter criteria."
                      : "No promo codes have been created yet. Click 'Create Promo Code' to set up your first campaign."}
                  </p>
                </div>
                <button
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100 text-xs font-semibold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Promo Code</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      <th className="py-3.5 px-4">Promo Code</th>
                      <th className="py-3.5 px-4">Discount</th>
                      <th className="py-3.5 px-4">Applicable Products</th>
                      <th className="py-3.5 px-4">Expiration / Status</th>
                      <th className="py-3.5 px-4">Min Order & Usage</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCoupons.map((coupon) => {
                      const expiryInfo = getExpiryDetails(coupon.expires_at);
                      const isExpired = expiryInfo.status === "expired";

                      return (
                        <tr
                          key={coupon.id}
                          className="hover:bg-slate-50/70 transition-colors group text-slate-700"
                        >
                          {/* Code */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm tracking-wide px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 inline-flex items-center gap-1.5">
                                {coupon.code}
                              </span>
                              <button
                                onClick={() => handleCopyCode(coupon.code)}
                                title="Copy promo code"
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              >
                                {copiedCode === coupon.code ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            {coupon.description && (
                              <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-[220px]">
                                {coupon.description}
                              </p>
                            )}
                          </td>

                          {/* Discount Value */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {coupon.discount_type === "PERCENTAGE" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <Percent className="w-3 h-3" />
                                  {coupon.discount_value}% OFF
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                  ₹{coupon.discount_value} FLAT OFF
                                </span>
                              )}
                            </div>
                            {coupon.discount_type === "PERCENTAGE" && coupon.max_discount_amount && (
                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                Max discount: ₹{coupon.max_discount_amount}
                              </span>
                            )}
                          </td>

                          {/* Product Scope */}
                          <td className="py-4 px-4">
                            {coupon.applicable_type === "SPECIFIC" && coupon.applicable_products?.length > 0 ? (
                              <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                  <Box className="w-3 h-3" />
                                  {coupon.applicable_products.length} Selected Product
                                  {coupon.applicable_products.length > 1 ? "s" : ""}
                                </span>
                                <div className="text-[11px] text-slate-500 mt-1 line-clamp-1 max-w-[200px]" title={coupon.applicable_products.join(", ")}>
                                  {coupon.applicable_products.map((pid) => {
                                    const p = DEFAULT_PRODUCTS.find((dp) => dp.id === pid || dp.slug === pid);
                                    return p?.name || pid;
                                  }).join(", ")}
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                <Layers className="w-3 h-3" />
                                All Products (Storewide)
                              </span>
                            )}
                          </td>

                          {/* Expiration Details */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${expiryInfo.color}`}
                            >
                              <Clock className="w-3 h-3" />
                              {expiryInfo.label}
                            </span>
                          </td>

                          {/* Min Order & Usage */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="text-xs text-slate-600">
                              Min Order:{" "}
                              <span className="font-semibold text-slate-900">
                                {coupon.min_order_amount > 0 ? `₹${coupon.min_order_amount}` : "None (₹0)"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-slate-500">
                                {coupon.usage_count || 0}{" "}
                                {coupon.usage_limit ? `/ ${coupon.usage_limit}` : "redemptions"}
                              </span>
                              {coupon.usage_limit && (
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-orange-500 rounded-full"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        Math.round(((coupon.usage_count || 0) / coupon.usage_limit) * 100)
                                      )}%`,
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Status Toggle */}
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleToggleActive(coupon)}
                              title={coupon.is_active ? "Click to Pause" : "Click to Activate"}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                coupon.is_active ? "bg-orange-500" : "bg-slate-300"
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  coupon.is_active ? "translate-x-6" : "translate-x-1"
                                }`}
                              />
                            </button>
                            <span className="block text-[10px] uppercase font-semibold text-slate-400 mt-1">
                              {coupon.is_active ? "Active" : "Paused"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditModal(coupon)}
                                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                title="Edit promo code"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmCoupon(coupon)}
                                className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                                title="Delete promo code"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* CREATE / EDIT PROMO CODE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-800 my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-orange-500" />
                  {editingCoupon ? `Edit Promo Code: ${editingCoupon.code}` : "Create New Promo Code"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set voucher discount percentage or amount, duration, and eligible products.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {modalError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitCoupon} className="mt-5 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {/* Code & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Promo Code <span className="text-orange-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="text-[11px] text-orange-600 hover:text-orange-700 flex items-center gap-1 font-semibold"
                    >
                      <Zap className="w-3 h-3" />
                      Auto Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SAVE20, WELCOME10"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold tracking-wider text-orange-600 uppercase focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Description / Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 20% off for festival special"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                  />
                </div>
              </div>

              {/* Discount Type & Value */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Discount Configuration
                  </span>
                  {/* Type Selector Pills */}
                  <div className="flex p-0.5 rounded-lg bg-slate-200/60 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setFormDiscountType("PERCENTAGE")}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                        formDiscountType === "PERCENTAGE"
                          ? "bg-white text-orange-600 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Percentage (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormDiscountType("FLAT")}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                        formDiscountType === "FLAT"
                          ? "bg-white text-orange-600 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Flat Amount (₹)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs text-slate-500 font-medium mb-1">
                      {formDiscountType === "PERCENTAGE" ? "Discount Percentage (%)" : "Flat Discount (₹)"}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max={formDiscountType === "PERCENTAGE" ? "100" : "10000"}
                        required
                        placeholder={formDiscountType === "PERCENTAGE" ? "20" : "100"}
                        value={formDiscountValue}
                        onChange={(e) => setFormDiscountValue(e.target.value)}
                        className="w-full pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                        {formDiscountType === "PERCENTAGE" ? "%" : "₹"}
                      </span>
                    </div>
                  </div>

                  {formDiscountType === "PERCENTAGE" ? (
                    <div>
                      <label className="block text-xs text-slate-500 font-medium mb-1">
                        Max Discount Cap (₹) <span className="text-slate-400">(Optional)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          placeholder="e.g. 200 (Leave blank for no cap)"
                          value={formMaxDiscount}
                          onChange={(e) => setFormMaxDiscount(e.target.value)}
                          className="w-full pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                          ₹
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs text-slate-500 font-medium mb-1">
                        Minimum Order Value (₹)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          placeholder="e.g. 499 (0 for no minimum)"
                          value={formMinOrder}
                          onChange={(e) => setFormMinOrder(e.target.value)}
                          className="w-full pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                          ₹
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {formDiscountType === "PERCENTAGE" && (
                  <div>
                    <label className="block text-xs text-slate-500 font-medium mb-1">
                      Minimum Order Value (₹)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 499 (0 for no minimum requirement)"
                        value={formMinOrder}
                        onChange={(e) => setFormMinOrder(e.target.value)}
                        className="w-full pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                        ₹
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Expiration Time & Quick Presets */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Expiry Date & Time
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickPresetDays(7)}
                      className="px-2 py-0.5 rounded text-[11px] bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
                    >
                      +7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPresetDays(15)}
                      className="px-2 py-0.5 rounded text-[11px] bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
                    >
                      +15 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPresetDays(30)}
                      className="px-2 py-0.5 rounded text-[11px] bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
                    >
                      +30 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPresetDays(null)}
                      className="px-2 py-0.5 rounded text-[11px] bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-medium"
                    >
                      Never
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 font-medium mb-1">Select Expiry Timestamp</label>
                    <input
                      type="datetime-local"
                      value={formExpiresAt}
                      onChange={(e) => setFormExpiresAt(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 font-medium mb-1">
                      Max Redemptions / Uses Limit <span className="text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 500 (Leave empty for unlimited)"
                      value={formUsageLimit}
                      onChange={(e) => setFormUsageLimit(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                    />
                  </div>
                </div>
              </div>

              {/* Product Applicability Scope */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 block">
                  Eligible Products
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      formApplicableType === "ALL"
                        ? "bg-orange-50/80 border-orange-500 text-slate-900 shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="applicableType"
                      checked={formApplicableType === "ALL"}
                      onChange={() => setFormApplicableType("ALL")}
                      className="accent-orange-500"
                    />
                    <div>
                      <div className="text-sm font-semibold">All Store Products</div>
                      <div className="text-[11px] text-slate-500">Discount applies across the entire cart</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      formApplicableType === "SPECIFIC"
                        ? "bg-orange-50/80 border-orange-500 text-slate-900 shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="applicableType"
                      checked={formApplicableType === "SPECIFIC"}
                      onChange={() => setFormApplicableType("SPECIFIC")}
                      className="accent-orange-500"
                    />
                    <div>
                      <div className="text-sm font-semibold">Specific Products Only</div>
                      <div className="text-[11px] text-slate-500">Discount applies only to chosen items</div>
                    </div>
                  </label>
                </div>

                {/* Specific Products Selector */}
                {formApplicableType === "SPECIFIC" && (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search product by title..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
                      {DEFAULT_PRODUCTS.filter((p) =>
                        p.name.toLowerCase().includes(productSearch.toLowerCase())
                      ).map((product) => {
                        const isSelected = formApplicableProducts.includes(product.id) || formApplicableProducts.includes(product.slug);

                        return (
                          <div
                            key={product.id}
                            onClick={() => handleToggleProduct(product.id)}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-orange-50 border border-orange-200 text-slate-900"
                                : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-md bg-slate-100 overflow-hidden relative flex-shrink-0 border border-slate-200">
                                <Image
                                  src={product.poster_image || "/products/ripple-lamp.jpg"}
                                  alt={product.name}
                                  width={32}
                                  height={32}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              <div>
                                <div className="text-xs font-medium line-clamp-1">{product.name}</div>
                                <div className="text-[10px] text-slate-500">₹{product.offer_price || product.price}</div>
                              </div>
                            </div>

                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                isSelected ? "bg-orange-500 border-orange-500 text-white" : "border-slate-300"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {formApplicableProducts.length} product(s) selected
                    </p>
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Enable Promo Code Immediately</div>
                  <div className="text-[11px] text-slate-500">Allows shoppers to apply this code at checkout</div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    formIsActive ? "bg-orange-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formIsActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-semibold shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all"
                >
                  {submitting ? "Saving..." : editingCoupon ? "Save Changes" : "Create Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Delete Promo Code</h3>
            <p className="text-xs text-slate-600 mt-1">
              Are you sure you want to permanently delete{" "}
              <span className="font-mono font-bold text-slate-900">{deleteConfirmCoupon.code}</span>? Customers will
              no longer be able to redeem this voucher.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmCoupon(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCoupon}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                Delete Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
