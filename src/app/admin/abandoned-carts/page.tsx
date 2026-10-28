"use client";

import React, { useState, useEffect, useMemo } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  ShoppingCart,
  Phone,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Copy,
  MessageCircle,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  X,
  User,
  MapPin,
  Check,
  BellRing,
  Trash2,
} from "lucide-react";
import Image from "next/image";

interface AbandonedItem {
  id?: string;
  product_id?: string;
  name?: string;
  product_name?: string;
  price?: number;
  unit_price?: number;
  quantity?: number;
  poster_image?: string;
  image?: string;
}

interface AbandonedCheckout {
  id: string;
  customer_name?: string;
  customer_phone: string;
  customer_email?: string;
  items: AbandonedItem[];
  total_amount: number;
  shipping_address?: string;
  city?: string;
  postal_code?: string;
  recovery_token: string;
  recovery_url: string;
  status: "abandoned" | "recovered" | "expired";
  recovered_order_id?: string;
  whatsapp_sent_count: number;
  last_whatsapp_sent_at?: string;
  source?: "checkout" | "cart";
  created_at: string;
  updated_at: string;
}

function getProductThumbnail(item?: AbandonedItem): string {
  if (!item) return "/products/ripple-lamp.jpg";
  if (item.poster_image && item.poster_image.trim()) return item.poster_image;
  if (item.image && item.image.trim()) return item.image;
  const idOrName = `${item.id || ""} ${item.product_id || ""} ${item.name || ""} ${item.product_name || ""}`.toLowerCase();
  if (idOrName.includes("ripple")) return "/products/ripple-lamp.jpg";
  if (idOrName.includes("heating") || idOrName.includes("pad") || idOrName.includes("menstrual")) return "/products/heating-pad.jpg";
  if (idOrName.includes("iron") || idOrName.includes("steam")) return "/products/steam-iron.jpg";
  if (idOrName.includes("printer")) return "/products/thermal-printer.jpg";
  if (idOrName.includes("faucet") || idOrName.includes("heater")) return "/products/faucet-heater.jpg";
  if (idOrName.includes("washer")) return "/products/foldable-washer.jpg";
  if (idOrName.includes("popcorn")) return "/products/popcorn-maker.jpg";
  if (idOrName.includes("nebulizer")) return "/products/mesh-nebulizer.jpg";
  if (idOrName.includes("powerbank") || idOrName.includes("earbuds")) return "/products/powerbank-earbuds.jpg";
  if (idOrName.includes("helicopter") || idOrName.includes("perfume")) return "/products/helicopter-perfume.jpg";
  return "/products/ripple-lamp.jpg";
}

interface Stats {
  totalCount: number;
  abandonedCount: number;
  recoveredCount: number;
  potentialRevenue: number;
  recoveredRevenue: number;
  recoveryRate: number;
}

export default function AbandonedCartsAdminPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [checkouts, setCheckouts] = useState<AbandonedCheckout[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCount: 0,
    abandonedCount: 0,
    recoveredCount: 0,
    potentialRevenue: 0,
    recoveredRevenue: 0,
    recoveryRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearingRecovered, setClearingRecovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Default to 'abandoned' so purchased/recovered orders do not clutter the active action list
  const [statusFilter, setStatusFilter] = useState<"all" | "abandoned" | "recovered">("abandoned");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [selectedCheckout, setSelectedCheckout] = useState<AbandonedCheckout | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const fetchAbandonedCheckouts = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/abandoned-checkouts?status=all");
      const data = await res.json();
      if (data.success) {
        setCheckouts(data.checkouts || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch abandoned checkouts:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAbandonedCheckouts();

    // Auto-poll every 15 seconds so new backouts appear in real time on the dashboard
    const interval = setInterval(() => {
      fetchAbandonedCheckouts(false);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // 1-Click Manual Send (Opens WhatsApp Web / Mobile with recovery text and updates DB tracking)
  const handleSendWhatsApp = async (checkout: AbandonedCheckout) => {
    setSendingId(checkout.id);
    const cleanPhone = checkout.customer_phone.replace(/\D/g, "");
    const targetDigits = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    const sectionName = checkout.source === "cart" ? "cart" : "checkout section";

    const itemSummary = (checkout.items || [])
      .map(
        (it) =>
          `• ${it.name || it.product_name || "Product"} (x${it.quantity || 1}) — ₹${Number(
            it.price || it.unit_price || 0
          ).toLocaleString("en-IN")}`
      )
      .join("\n");

    const firstName = checkout.customer_name?.trim()
      ? checkout.customer_name.trim().split(" ")[0]
      : "there";
    const actionText =
      checkout.source === "cart"
        ? "👉 Tap here to view your cart & complete your order:"
        : "👉 Tap here to complete your order in 1 click:";

    const waMessage =
      `Hi ${firstName}! We noticed you left some great items in your ${sectionName} at Zupe Store:\n\n` +
      `${itemSummary}\n\n` +
      `⚡ Currently this is a great price! Plus, if you order now, you get Free Delivery without any extra charges.\n\n` +
      `${actionText}\n${checkout.recovery_url}\n\n` +
      `Need any assistance? Just reply to this message!\n` +
      `Zupe Store Team`;

    const waDirectUrl = `https://api.whatsapp.com/send?phone=${targetDigits}&text=${encodeURIComponent(
      waMessage
    )}`;

    // Open WhatsApp directly so message is 100% delivered to the customer without Meta Cloud API restrictions
    if (typeof window !== "undefined") {
      window.open(waDirectUrl, "_blank");
    }

    try {
      const res = await fetch("/api/admin/abandoned-checkouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: checkout.id }),
      });
      const data = await res.json();

      setCheckouts((prev) =>
        prev.map((c) =>
          c.id === checkout.id
            ? {
                ...c,
                whatsapp_sent_count: (c.whatsapp_sent_count || 0) + 1,
                last_whatsapp_sent_at: new Date().toISOString(),
              }
            : c
        )
      );

      showToast(
        `WhatsApp chat opened for +${checkout.customer_phone}! Press send in WhatsApp to deliver.`,
        "success"
      );
    } catch (err: any) {
      showToast("WhatsApp opened. Note: Network error updating background sent counter.", "success");
    } finally {
      setSendingId(null);
    }
  };

  // Broadcast Reminders to All Unrecovered Carts
  const handleSendAllReminders = async () => {
    setBroadcasting(true);
    try {
      const res = await fetch("/api/admin/abandoned-checkouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remind_all" }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Recovery reminders dispatched!", "success");
        await fetchAbandonedCheckouts(false);
      } else {
        showToast(data.error || "Failed to send reminders.", "error");
      }
    } catch (err) {
      showToast("Network error while broadcasting reminders.", "error");
    } finally {
      setBroadcasting(false);
    }
  };

  // Delete / Remove Single Checkout Session
  const handleDeleteCheckout = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to remove this cart session from the dashboard?")) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/abandoned-checkouts?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Cart session removed successfully.", "success");
        setCheckouts((prev) => prev.filter((c) => c.id !== id));
        fetchAbandonedCheckouts(false);
      } else {
        showToast(data.error || "Failed to remove cart session.", "error");
      }
    } catch {
      showToast("Network error while removing cart session.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Clear All Recovered Sessions from database
  const handleClearAllRecovered = async () => {
    if (!confirm("Are you sure you want to clear all recovered cart sessions from the database?")) {
      return;
    }
    setClearingRecovered(true);
    try {
      const res = await fetch("/api/admin/abandoned-checkouts?action=clear_recovered", {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast("All recovered cart sessions have been cleared.", "success");
        fetchAbandonedCheckouts(false);
      } else {
        showToast(data.error || "Failed to clear recovered sessions.", "error");
      }
    } catch {
      showToast("Network error while clearing recovered sessions.", "error");
    } finally {
      setClearingRecovered(false);
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedToken(id);
      showToast("1-Click cart recovery link copied to clipboard!");
      setTimeout(() => setCopiedToken(null), 2500);
    }
  };

  const filteredCheckouts = useMemo(() => {
    return checkouts.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const nameMatch = (c.customer_name || "").toLowerCase().includes(q);
      const phoneMatch = c.customer_phone.includes(q);
      const emailMatch = (c.customer_email || "").toLowerCase().includes(q);
      const productMatch = (c.items || []).some((it) =>
        (it.name || it.product_name || "").toLowerCase().includes(q)
      );
      return nameMatch || phoneMatch || emailMatch || productMatch;
    });
  }, [checkouts, statusFilter, searchQuery]);

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return "Recently";
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diffMs / (1000 * 60));
      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans">
      {/* Sidebar */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Container with lg:pl-64 to clear fixed sidebar */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <AdminHeader
          onOpenMobile={() => setMobileSidebarOpen(true)}
          onRefresh={() => fetchAbandonedCheckouts(true)}
          isRefreshing={refreshing}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* Toast Notification */}
          {toastMessage && (
            <div
              className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm backdrop-blur-md transition-all animate-in slide-in-from-top duration-300 ${
                toastMessage.type === "success"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : "bg-rose-50 border-rose-300 text-rose-900"
              }`}
            >
              {toastMessage.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span className="font-semibold">{toastMessage.text}</span>
            </div>
          )}

          {/* Page Title & Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-orange-100 text-[#FF7A00] flex items-center justify-center shadow-xs border border-orange-200/80">
                <ShoppingCart className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                  Abandoned Carts &amp; Back-Out Recovery
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    Live Real-Time
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Auto-captures customer mobile numbers on checkout exit &amp; dispatches automated WhatsApp recovery links.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Broadcast Reminders to All */}
              <button
                onClick={handleSendAllReminders}
                disabled={broadcasting || stats.abandonedCount === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF7A00] hover:bg-[#E66E00] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm shadow-orange-500/25 cursor-pointer"
                title="Send recovery WhatsApp reminders to all unrecovered abandoned carts"
              >
                {broadcasting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <BellRing className="w-4 h-4 stroke-[2.2]" />
                )}
                <span>{broadcasting ? "Sending Reminders..." : "Send Reminders to All"}</span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={() => fetchAbandonedCheckouts(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#FF7A00]" : ""}`} />
                <span>{refreshing ? "Syncing..." : "Refresh"}</span>
              </button>
            </div>
          </div>

          {/* 4 KPI Summary Cards (2 per row on mobile) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
            {/* Card 1: Potential Recoverable Revenue */}
            <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-slate-300 transition-all">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                  Recoverable
                </p>
                <div className="text-base sm:text-2xl font-extrabold text-slate-900 mt-0.5 sm:mt-1 truncate">
                  ₹{stats.potentialRevenue.toLocaleString("en-IN")}
                </div>
                <div className="text-[10px] sm:text-[11px] text-amber-600 font-medium mt-0.5 truncate">
                  {stats.abandonedCount} unrecovered
                </div>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 ml-2">
                <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2.2]" />
              </div>
            </div>

            {/* Card 2: Recovered Revenue */}
            <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-slate-300 transition-all">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                  Recovered
                </p>
                <div className="text-base sm:text-2xl font-extrabold text-slate-900 mt-0.5 sm:mt-1 truncate">
                  ₹{stats.recoveredRevenue.toLocaleString("en-IN")}
                </div>
                <div className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5 truncate">
                  {stats.recoveredCount} orders done
                </div>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 ml-2">
                <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2.2]" />
              </div>
            </div>

            {/* Card 3: Captured Sessions */}
            <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-slate-300 transition-all">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                  Captured Carts
                </p>
                <div className="text-base sm:text-2xl font-extrabold text-slate-900 mt-0.5 sm:mt-1 truncate">
                  {stats.totalCount}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                  Phone captured
                </div>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 ml-2">
                <ShoppingCart className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2.2]" />
              </div>
            </div>

            {/* Card 4: Recovery Conversion Rate */}
            <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/90 shadow-sm flex items-center justify-between hover:border-slate-300 transition-all">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                  Recovery Rate
                </p>
                <div className="text-base sm:text-2xl font-extrabold text-slate-900 mt-0.5 sm:mt-1 truncate">
                  {stats.recoveryRate}%
                </div>
                <div className="text-[10px] sm:text-[11px] text-purple-600 font-medium mt-0.5 truncate">
                  Cart to order
                </div>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 ml-2">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2.2]" />
              </div>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input (Matching Orders page search) */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by customer, phone, or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200/60"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setStatusFilter("abandoned")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === "abandoned"
                      ? "bg-[#FF7A00] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  Abandoned ({stats.abandonedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("recovered")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === "recovered"
                      ? "bg-[#FF7A00] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  Recovered ({stats.recoveredCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === "all"
                      ? "bg-[#FF7A00] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  All ({checkouts.length})
                </button>
              </div>

              {/* Clear All Recovered Sessions Button (when on Recovered tab) */}
              {statusFilter === "recovered" && stats.recoveredCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllRecovered}
                  disabled={clearingRecovered}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  title="Remove all recovered sessions from the database"
                >
                  {clearingRecovered ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Clear Recovered</span>
                </button>
              )}
            </div>
          </div>

          {/* Checkouts Table (Matching Orders Page Table Design) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-20 text-center">
                  <RefreshCw className="w-8 h-8 text-[#FF7A00] animate-spin mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-600">Loading abandoned carts...</p>
                </div>
              ) : filteredCheckouts.length === 0 ? (
                <div className="py-20 px-4 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 opacity-40" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">No Abandoned Carts Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {searchQuery
                      ? "No records matched your search query. Try clearing the search box."
                      : "When customers enter their mobile number at checkout and back out, their sessions will appear here automatically."}
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Customer</th>
                      <th className="py-3.5 px-4">Products &amp; Cart</th>
                      <th className="py-3.5 px-4">Value</th>
                      <th className="py-3.5 px-4">Abandoned</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">WhatsApp Messages</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredCheckouts.map((c) => {
                      const isRecovered = c.status === "recovered";
                      const cleanPhone = c.customer_phone.replace(/\D/g, "");
                      const sectionName = c.source === "cart" ? "cart" : "checkout section";
                      const itemSummary = (c.items || [])
                        .slice(0, 3)
                        .map((it) => `• ${it.name || it.product_name || "Product"} — ₹${Number(it.price || it.unit_price || 0).toLocaleString("en-IN")}`)
                        .join("\n");
                      const waChatUrl = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`}?text=${encodeURIComponent(
                        `Hi ${c.customer_name || "there"}! We noticed you left some great items in your ${sectionName} at Zupe Store:\n\n${itemSummary}\n\n⚡ Currently this is a great price! Plus, if you order now, you get Free Delivery without any extra charges.\n\n👉 Complete your order here: ${c.recovery_url}`
                      )}`;

                      return (
                        <tr
                          key={c.id}
                          className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                          onClick={() => setSelectedCheckout(c)}
                        >
                          {/* Customer Column */}
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">
                                {c.customer_name || "Guest Customer"}
                              </span>
                              {c.source === "cart" ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                  🛒 Cart (30m)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  🚪 Checkout Exit
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 mt-0.5 font-mono text-xs">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>+{c.customer_phone}</span>
                            </div>
                            {c.city && (
                              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5" />
                                <span>{c.city}</span>
                              </div>
                            )}
                          </td>

                          {/* Products Column */}
                          <td className="py-3 px-4">
                            <div className="space-y-1.5 min-w-[200px] max-w-[320px]">
                              {c.items && c.items.length > 0 ? (
                                c.items.slice(0, 3).map((it, idx) => {
                                  const thumb = getProductThumbnail(it);
                                  return (
                                    <div key={idx} className="flex items-center gap-2">
                                      <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                        <img
                                          src={thumb}
                                          alt={it.name || "Product"}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = "/products/ripple-lamp.jpg";
                                          }}
                                        />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p
                                          className="font-semibold text-slate-900 truncate text-xs leading-snug"
                                          title={it.name || it.product_name || "Product"}
                                        >
                                          {it.name || it.product_name || "Cart Product"}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-medium">
                                          Qty: {it.quantity || 1} • ₹{Number(it.price || it.unit_price || 0).toLocaleString("en-IN")}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <span className="text-xs text-slate-400">Empty cart</span>
                              )}

                              {c.items && c.items.length > 3 && (
                                <p className="text-[10px] text-[#FF7A00] font-bold pl-10 cursor-pointer hover:underline">
                                  +{c.items.length - 3} more item{c.items.length - 3 > 1 ? "s" : ""} in cart →
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Value Column */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-extrabold text-slate-900 text-sm">
                              ₹{c.total_amount.toLocaleString("en-IN")}
                            </span>
                          </td>

                          {/* Abandoned Time */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="text-slate-800 font-semibold block text-xs">
                              {formatRelativeTime(c.created_at)}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(c.created_at).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isRecovered ? (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Recovered</span>
                                </span>
                                {c.recovered_order_id && (
                                  <a
                                    href={`/admin/orders?search=${encodeURIComponent(c.recovered_order_id)}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="block text-[11px] text-[#FF7A00] hover:underline font-bold mt-1"
                                    title="View placed order in Orders list"
                                  >
                                    View Order #{c.recovered_order_id.replace(/^ord_\d+_/, "")} →
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3 h-3" />
                                <span>Abandoned</span>
                              </span>
                            )}
                          </td>

                          {/* WhatsApp Messages Sent */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {c.whatsapp_sent_count > 0 ? (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <MessageCircle className="w-3 h-3 text-emerald-600" />
                                  <span>Sent {c.whatsapp_sent_count}x</span>
                                </span>
                                {c.last_whatsapp_sent_at && (
                                  <span className="block text-[10px] text-slate-400 mt-0.5 font-medium">
                                    Last: {formatRelativeTime(c.last_whatsapp_sent_at)}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">Not sent yet</span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td
                            className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 1-Click Send Recovery WA Button */}
                              <button
                                onClick={() => handleSendWhatsApp(c)}
                                disabled={sendingId === c.id || isRecovered}
                                title={isRecovered ? "Order already recovered" : "Send WhatsApp recovery message"}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                  isRecovered
                                    ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs hover:shadow-emerald-500/20"
                                }`}
                              >
                                {sendingId === c.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Send className="w-3.5 h-3.5" />
                                )}
                                <span>{isRecovered ? "Recovered" : "Send WA"}</span>
                              </button>

                              {/* Chat on WhatsApp */}
                              <a
                                href={waChatUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Chat directly with customer on WhatsApp"
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>

                              {/* Copy 1-Click Recovery Link */}
                              <button
                                onClick={() => handleCopyLink(c.recovery_url, c.id)}
                                title="Copy 1-Click Cart Recovery Link"
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                              >
                                {copiedToken === c.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Delete / Remove Cart Session Button */}
                              <button
                                onClick={(e) => handleDeleteCheckout(c.id, e)}
                                disabled={deletingId === c.id}
                                title="Remove this cart session from dashboard"
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                              >
                                {deletingId === c.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-500" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Details Modal */}
          {selectedCheckout && (
            <div
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
              onClick={() => setSelectedCheckout(null)}
            >
              <div
                className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative text-slate-800"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF7A00] flex items-center justify-center border border-orange-200">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Cart Session Details</h3>
                      <p className="text-xs text-slate-500 font-mono">ID: {selectedCheckout.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCheckout(null)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Customer Information Box */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Customer Name:
                    </span>
                    <span className="font-bold text-slate-900">
                      {selectedCheckout.customer_name || "Guest Customer"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Trigger Source:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedCheckout.source === "cart" ? "🛒 Cart Abandonment (30-Minute Trigger)" : "🚪 Checkout Page Exit (Immediate)"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Mobile:
                    </span>
                    <span className="font-mono font-bold text-emerald-600">
                      +{selectedCheckout.customer_phone}
                    </span>
                  </div>
                  {selectedCheckout.customer_email && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Email:</span>
                      <span className="text-slate-800">{selectedCheckout.customer_email}</span>
                    </div>
                  )}
                  {selectedCheckout.shipping_address && (
                    <div className="text-xs pt-1 border-t border-slate-200">
                      <span className="text-slate-500 block mb-0.5">Shipping Address:</span>
                      <span className="text-slate-800">
                        {selectedCheckout.shipping_address}
                        {selectedCheckout.city ? `, ${selectedCheckout.city}` : ""}
                        {selectedCheckout.postal_code ? ` - ${selectedCheckout.postal_code}` : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Items in Cart */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Items in Cart ({selectedCheckout.items?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {selectedCheckout.items?.map((it, idx) => {
                      const thumb = getProductThumbnail(it);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                              <img
                                src={thumb}
                                alt={it.name || "Item"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = "/products/ripple-lamp.jpg";
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {it.name || it.product_name || "Cart Item"}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Qty: {it.quantity || 1} × ₹{(it.price || it.unit_price || 0).toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-900 shrink-0 ml-2">
                            ₹{((it.price || it.unit_price || 0) * (it.quantity || 1)).toLocaleString("en-IN")}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-2 px-1 text-sm font-bold">
                    <span className="text-slate-500">Cart Total</span>
                    <span className="text-slate-900 text-base">
                      ₹{selectedCheckout.total_amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Direct 1-Click Recovery Link */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    1-Click Direct Recovery Link
                  </h4>
                  <div className="flex items-center gap-2 p-2.5 bg-slate-100 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700">
                    <span className="truncate flex-1">{selectedCheckout.recovery_url}</span>
                    <button
                      onClick={() => handleCopyLink(selectedCheckout.recovery_url, selectedCheckout.id)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-900 rounded-lg transition-colors cursor-pointer shrink-0 font-sans text-xs font-semibold border border-slate-200"
                    >
                      {copiedToken === selectedCheckout.id ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                  <button
                    onClick={() => setSelectedCheckout(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleSendWhatsApp(selectedCheckout)}
                    disabled={sendingId === selectedCheckout.id || selectedCheckout.status === "recovered"}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Recovery WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
