"use client";

import React, { useState, useEffect, useMemo } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Share2,
  Plus,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  ExternalLink,
  Edit2,
  DollarSign,
  Award,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Link as LinkIcon,
  ShoppingBag,
  TrendingUp,
  MousePointerClick,
  Sparkles,
  FileText,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  BookOpen,
  HelpCircle,
  Info,
} from "lucide-react";
import { InfluencerAggregatedStats, InfluencerRecord } from "@/lib/influencerService";

export default function AdminInfluencersPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [influencers, setInfluencers] = useState<InfluencerAggregatedStats[]>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Timeframe filter state
  const [timeframe, setTimeframe] = useState<"today" | "yesterday" | "7d" | "30d" | "custom">("7d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Sorting state
  const [sortField, setSortField] = useState<"orders" | "clicks" | "conversion_rate" | "revenue" | "return_multiplier">("orders");
  const [sortAsc, setSortAsc] = useState(false);

  // Expanded rows (influencer IDs)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Copy feedback state { [key: string]: boolean }
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Add Influencer Form state (Top of page)
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState("");
  const [instaId, setInstaId] = useState("");
  const [notes, setNotes] = useState("");
  const [productCost, setProductCost] = useState("");
  const [commissionType, setCommissionType] = useState<"none" | "percent" | "fixed">("percent");
  const [commissionValue, setCommissionValue] = useState("10");
  const [firstLinkName, setFirstLinkName] = useState("Instagram Reel");
  const [firstLinkDestination, setFirstLinkDestination] = useState("home");
  const [creating, setCreating] = useState(false);

  // Created Link Success Banner/Modal
  const [createdResult, setCreatedResult] = useState<{ name: string; code: string; url: string } | null>(null);

  // Add Link Modal
  const [showAddLinkModal, setShowAddLinkModal] = useState<InfluencerAggregatedStats | null>(null);
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkDestination, setNewLinkDestination] = useState("home");
  const [newLinkCustomCode, setNewLinkCustomCode] = useState("");
  const [addingLink, setAddingLink] = useState(false);

  // Mark Paid Modal
  const [showMarkPaidModal, setShowMarkPaidModal] = useState<InfluencerAggregatedStats | null>(null);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [markingPaid, setMarkingPaid] = useState(false);

  // Edit Influencer Modal
  const [showEditModal, setShowEditModal] = useState<InfluencerAggregatedStats | null>(null);
  const [editName, setEditName] = useState("");
  const [editInstaId, setEditInstaId] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editProductCost, setEditProductCost] = useState("");
  const [editCommissionType, setEditCommissionType] = useState<"none" | "percent" | "fixed">("none");
  const [editCommissionValue, setEditCommissionValue] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // View/Edit Notes Modal
  const [showNotesModal, setShowNotesModal] = useState<InfluencerAggregatedStats | null>(null);
  const [currentNotes, setCurrentNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Guide Modal State
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideTab, setGuideTab] = useState<"overview" | "kpis" | "roi" | "columns" | "form" | "payout">("overview");

  // Summary KPIs from API
  const [summary, setSummary] = useState<any>({
    total_influencers: 0,
    active_influencers: 0,
    total_clicks: 0,
    total_orders: 0,
    total_revenue: 0,
    total_commission_period: 0,
    total_pending_all_time: 0,
    total_spend_period: 0,
  });

  const getStoreBaseUrl = () => {
    if (typeof window !== "undefined") {
      const host = window.location.host;
      if (host.startsWith("admin.")) {
        return `${window.location.protocol}//${host.replace(/^admin\./, "")}`;
      }
      return window.location.origin;
    }
    return "https://zupestore.in";
  };

  const fetchInfluencers = async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);

    try {
      const url = new URL("/api/admin/influencers", window.location.origin);
      url.searchParams.set("timeframe", timeframe);
      if (timeframe === "custom") {
        if (customStart) url.searchParams.set("startDate", customStart);
        if (customEnd) url.searchParams.set("endDate", customEnd);
      }

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setInfluencers(data.influencers || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error("Failed to load influencers:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCatalogProducts = async () => {
    try {
      const res = await fetch(`/api/products?t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(
          data.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug || p.id,
          }))
        );
      }
    } catch (e) {
      console.warn("Could not fetch products list:", e);
    }
  };

  useEffect(() => {
    fetchInfluencers();
    fetchCatalogProducts();
  }, [timeframe, customStart, customEnd]);

  // Copy helper with visual feedback
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Toggle row expansion
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Handle Create Influencer
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !instaId.trim()) return;
    setCreating(true);

    try {
      const res = await fetch("/api/admin/influencers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          insta_id: instaId.trim(),
          notes: notes.trim(),
          product_cost: Number(productCost || 0),
          commission_type: commissionType,
          commission_value: commissionType === "none" ? 0 : Number(commissionValue || 0),
          link_name: firstLinkName.trim() || "Instagram Reel",
          destination: firstLinkDestination,
        }),
      });

      const data = await res.json();
      if (data.success && data.link) {
        const fullUrl = `${getStoreBaseUrl()}/r/${data.link.code}`;
        setCreatedResult({
          name: data.influencer.name,
          code: data.link.code,
          url: fullUrl,
        });

        // Reset form fields
        setName("");
        setInstaId("");
        setNotes("");
        setProductCost("");
        setCommissionType("percent");
        setCommissionValue("10");
        setFirstLinkName("Instagram Reel");
        setFirstLinkDestination("home");
        setShowCreateForm(false);

        fetchInfluencers(true);
      } else {
        alert(data.error || "Failed to create influencer.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  // Handle Active Toggle
  const handleToggleActive = async (inf: InfluencerAggregatedStats) => {
    const newActive = !inf.active;
    // Optimistic update
    setInfluencers((prev) =>
      prev.map((i) => (i.id === inf.id ? { ...i, active: newActive } : i))
    );

    try {
      await fetch("/api/admin/influencers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: inf.id,
          active: newActive,
        }),
      });
      fetchInfluencers(true);
    } catch (e) {
      console.error("Toggle active error:", e);
    }
  };

  // Handle Add Extra Link
  const handleAddLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddLinkModal || !newLinkName.trim()) return;
    setAddingLink(true);

    try {
      const res = await fetch("/api/admin/influencers/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          influencer_id: showAddLinkModal.id,
          name: newLinkName.trim(),
          destination: newLinkDestination,
          custom_code: newLinkCustomCode.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.link) {
        const fullUrl = `${getStoreBaseUrl()}/r/${data.link.code}`;
        setCreatedResult({
          name: `${showAddLinkModal.name} (${data.link.name})`,
          code: data.link.code,
          url: fullUrl,
        });
        setShowAddLinkModal(null);
        setNewLinkName("");
        setNewLinkCustomCode("");
        setNewLinkDestination("home");
        fetchInfluencers(true);
      } else {
        alert(data.error || "Failed to add link.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setAddingLink(false);
    }
  };

  // Handle Mark Paid
  const handleMarkPaidSubmit = async () => {
    if (!showMarkPaidModal) return;
    setMarkingPaid(true);

    try {
      const res = await fetch("/api/admin/influencers/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          influencer_id: showMarkPaidModal.id,
          amount: showMarkPaidModal.pending_amount,
          notes: paymentNotes.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowMarkPaidModal(null);
        setPaymentNotes("");
        fetchInfluencers(true);
      } else {
        alert(data.error || "Failed to record payment.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setMarkingPaid(false);
    }
  };

  // Handle Edit Influencer Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal || !editName.trim() || !editInstaId.trim()) return;
    setSavingEdit(true);

    try {
      const res = await fetch("/api/admin/influencers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: showEditModal.id,
          name: editName.trim(),
          insta_id: editInstaId.trim(),
          notes: editNotes.trim(),
          product_cost: Number(editProductCost || 0),
          commission_type: editCommissionType,
          commission_value: editCommissionType === "none" ? 0 : Number(editCommissionValue || 0),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowEditModal(null);
        fetchInfluencers(true);
      } else {
        alert(data.error || "Failed to update influencer.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle Save Notes
  const handleSaveNotes = async () => {
    if (!showNotesModal) return;
    setSavingNotes(true);

    try {
      await fetch("/api/admin/influencers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: showNotesModal.id,
          notes: currentNotes.trim(),
        }),
      });
      setShowNotesModal(null);
      fetchInfluencers(true);
    } catch (err: any) {
      alert("Failed to save notes: " + err.message);
    } finally {
      setSavingNotes(false);
    }
  };

  // WhatsApp Message Generator (spec compliant)
  const getWhatsAppMessage = (inf: InfluencerAggregatedStats) => {
    const timeframeLabel =
      timeframe === "today"
        ? "today"
        : timeframe === "yesterday"
        ? "yesterday"
        : timeframe === "7d"
        ? "last 7 days"
        : timeframe === "30d"
        ? "last 30 days"
        : "selected dates";

    if (inf.commission_type === "none") {
      return `Hi ${inf.name} 👋 Your Zupestore link report (${timeframeLabel}): ${inf.clicks} clicks, ${inf.orders} orders. Thank you! 🙌`;
    }

    return `Hi ${inf.name} 👋 Your Zupestore link report (${timeframeLabel}): ${inf.clicks} clicks, ${inf.orders} orders, commission ₹${inf.commission_earned.toLocaleString("en-IN")}. Thank you! 🙌`;
  };

  // Sorting
  const sortedInfluencers = useMemo(() => {
    const list = [...influencers];
    list.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === "return_multiplier") {
        valA = a.return_multiplier ?? -1;
        valB = b.return_multiplier ?? -1;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
    return list;
  }, [influencers, sortField, sortAsc]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default high -> low
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans">
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminHeader
          onOpenMobile={() => setMobileSidebarOpen(true)}
          onRefresh={() => {
            fetchInfluencers(true);
            fetchCatalogProducts();
          }}
          isRefreshing={refreshing}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* TOP BAR / TITLE */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 rounded-xl text-purple-600 border border-purple-100 shadow-2xs">
                  <Share2 className="w-5 h-5" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Influencer Orders
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  Affiliate
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Track clicks and orders from creator bio/story links and settle pending commissions with 1-click payouts.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowGuideModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-2xs cursor-pointer"
                title="System guide & calculation rules"
              >
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>Guide</span>
              </button>

              <button
                onClick={() => {
                  fetchInfluencers(true);
                  fetchCatalogProducts();
                }}
                disabled={refreshing || loading}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-2xs disabled:opacity-60 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#FF7A00]" : ""}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => {
                  if (!showCreateForm) fetchCatalogProducts();
                  setShowCreateForm(!showCreateForm);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm shadow-orange-500/25 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{showCreateForm ? "Close Form" : "Add Influencer"}</span>
              </button>
            </div>
          </div>

          {/* CREATED LINK SUCCESS POPUP */}
          {createdResult && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-bold">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">
                    Link Ready for {createdResult.name}
                  </h4>
                  <p className="text-xs text-emerald-700 font-mono select-all">
                    {createdResult.url}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(createdResult.url, "created_banner")}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === "created_banner" ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setCreatedResult(null)}
                  className="p-1.5 text-emerald-600 hover:text-emerald-800 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* SECTION 2: ADD INFLUENCER FORM (TOP OF THE PAGE) */}
          {showCreateForm && (
            <div className="p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-5 animate-in slide-in-from-top-2 duration-200">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Create New Influencer Partnership</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generate custom tracked links, assign commission rules, and calculate gifted sample costs.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Influencer Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Influencer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anu Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>

                  {/* Instagram ID */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Instagram ID <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">@</span>
                      <input
                        type="text"
                        required
                        placeholder="anusharma"
                        value={instaId}
                        onChange={(e) => setInstaId(e.target.value)}
                        className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Free Product Cost */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Free Product Cost (₹) <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="150"
                        value={productCost}
                        onChange={(e) => setProductCost(e.target.value)}
                        className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Commission Type Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Commission Structure
                    </label>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setCommissionType("none")}
                        className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                          commissionType === "none"
                            ? "bg-white text-slate-900 shadow-2xs font-bold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        None (0)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCommissionType("percent")}
                        className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                          commissionType === "percent"
                            ? "bg-white text-purple-700 shadow-2xs font-bold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        % Order
                      </button>
                      <button
                        type="button"
                        onClick={() => setCommissionType("fixed")}
                        className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                          commissionType === "fixed"
                            ? "bg-white text-purple-700 shadow-2xs font-bold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        ₹ Fixed
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Commission Value (hidden if none) */}
                  {commissionType !== "none" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Commission Value ({commissionType === "percent" ? "% of Order Total" : "₹ Fixed per Order"})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        required
                        value={commissionValue}
                        onChange={(e) => setCommissionValue(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-semibold"
                      />
                    </div>
                  )}

                  {/* First Link Name */}
                  <div className={commissionType === "none" ? "sm:col-span-1" : ""}>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      First Link Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sharpener Reel"
                      value={firstLinkName}
                      onChange={(e) => setFirstLinkName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>

                  {/* Destination (Opens) */}
                  <div className={commissionType === "none" ? "sm:col-span-2" : ""}>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Link Opens (Destination)
                    </label>
                    <select
                      value={firstLinkDestination}
                      onChange={(e) => setFirstLinkDestination(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
                    >
                      <option value="home">Homepage (zupestore.in)</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.slug || p.id}>
                          Product: {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Notes <span className="text-slate-400 font-normal">(Free text, e.g. "Sent knife sharpener free on 20 Nov")</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sent sample package via Shiprocket on 20 Nov"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-sm shadow-purple-500/25 transition-all disabled:opacity-60 cursor-pointer flex items-center gap-2"
                  >
                    {creating && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>Create Influencer &amp; Generate Link</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* DATE FILTER PRESETS BAR */}
          <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500 px-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Date Filter:</span>
              </span>
              {[
                { label: "Today", val: "today" },
                { label: "Yesterday", val: "yesterday" },
                { label: "7 Days", val: "7d" },
                { label: "1 Month", val: "30d" },
                { label: "Custom", val: "custom" },
              ].map((btn) => (
                <button
                  key={btn.val}
                  onClick={() => setTimeframe(btn.val as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    timeframe === btn.val
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Custom Date Pickers */}
            {timeframe === "custom" && (
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 bg-slate-50"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 bg-slate-50"
                />
              </div>
            )}
          </div>

          {/* SUMMARY KPI CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Influencers</span>
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  {summary.total_influencers}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  {summary.active_influencers} active
                </span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <MousePointerClick className="w-3.5 h-3.5 text-blue-600" />
                <span>Total Clicks</span>
              </span>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  {summary.total_clicks.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                <span>Orders</span>
              </span>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  {summary.total_orders.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-[#FF7A00]" />
                <span>Attributed Revenue</span>
              </span>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  ₹{summary.total_revenue.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                <span>Commission (Period)</span>
              </span>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  ₹{summary.total_commission_period.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-amber-200 bg-amber-50/30 shadow-2xs">
              <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Total Pending (All-Time)</span>
              </span>
              <div className="mt-2">
                <span className="text-xl sm:text-2xl font-black text-amber-800">
                  ₹{summary.total_pending_all_time.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: INFLUENCERS TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Partner Performance &amp; Commission Tracking
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Default sort: Orders high → low. Click column headers to reorder.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {influencers.length} registered creator{influencers.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3.5">Name / Insta ID</th>
                    <th className="py-3 px-3">Links</th>
                    <th
                      onClick={() => toggleSort("clicks")}
                      className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>Clicks</span>
                        {sortField === "clicks" ? (
                          sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => toggleSort("orders")}
                      className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors select-none text-[#FF7A00]"
                    >
                      <div className="flex items-center gap-1 font-black">
                        <span>Orders</span>
                        {sortField === "orders" ? (
                          sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => toggleSort("conversion_rate")}
                      className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>Conv %</span>
                        {sortField === "conversion_rate" ? (
                          sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => toggleSort("revenue")}
                      className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>Revenue ₹</span>
                        {sortField === "revenue" ? (
                          sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-3">Commission ₹</th>
                    <th className="py-3 px-3">Pending ₹</th>
                    <th
                      onClick={() => toggleSort("return_multiplier")}
                      className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>Spend / Return</span>
                        {sortField === "return_multiplier" ? (
                          sortAsc ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-2 text-center">Active</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FF7A00]" />
                        <span>Loading influencer metrics...</span>
                      </td>
                    </tr>
                  ) : sortedInfluencers.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-slate-400">
                        <Share2 className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                        <p className="font-semibold text-slate-600">No influencers registered yet.</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Click "Add Influencer" above to create your first partner link.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    sortedInfluencers.map((inf) => {
                      const isExpanded = expandedIds.has(inf.id);
                      const isInactive = !inf.active;

                      return (
                        <React.Fragment key={inf.id}>
                          <tr
                            className={`transition-colors hover:bg-slate-50/60 ${
                              isInactive ? "opacity-60 bg-slate-50/50" : ""
                            }`}
                          >
                            {/* Name / Insta ID */}
                            <td className="py-3.5 px-3.5">
                              <div className="flex items-center gap-2">
                                {inf.is_top_performer && (
                                  <span
                                    title="Top Performer (Most orders in selected period)"
                                    className="text-base select-none"
                                  >
                                    🏆
                                  </span>
                                )}
                                <div>
                                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                    <span>{inf.name}</span>
                                    {inf.notes && (
                                      <button
                                        onClick={() => {
                                          setShowNotesModal(inf);
                                          setCurrentNotes(inf.notes || "");
                                        }}
                                        title={`Notes: ${inf.notes}`}
                                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                      >
                                        <FileText className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                  <a
                                    href={`https://instagram.com/${inf.insta_id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] text-purple-600 hover:underline flex items-center gap-0.5 mt-0.5"
                                  >
                                    <span>@{inf.insta_id}</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                </div>
                              </div>
                            </td>

                            {/* Links Count + Expand Toggle */}
                            <td className="py-3.5 px-3">
                              <button
                                onClick={() => toggleExpand(inf.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                              >
                                <span>{inf.links.length}</span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                                )}
                              </button>
                            </td>

                            {/* Clicks */}
                            <td className="py-3.5 px-3 font-semibold text-slate-700">
                              {inf.clicks.toLocaleString("en-IN")}
                            </td>

                            {/* Orders */}
                            <td className="py-3.5 px-3 font-black text-slate-950 text-sm">
                              {inf.orders.toLocaleString("en-IN")}
                            </td>

                            {/* Conversion % */}
                            <td className="py-3.5 px-3 font-bold text-slate-700">
                              {inf.conversion_rate}%
                            </td>

                            {/* Revenue ₹ */}
                            <td className="py-3.5 px-3 font-bold text-slate-900">
                              ₹{inf.revenue.toLocaleString("en-IN")}
                            </td>

                            {/* Commission ₹ (Selected Dates) */}
                            <td className="py-3.5 px-3">
                              {inf.commission_type === "none" ? (
                                <span className="text-slate-400 font-semibold">—</span>
                              ) : (
                                <div>
                                  <span className="font-bold text-slate-900">
                                    ₹{inf.commission_earned.toLocaleString("en-IN")}
                                  </span>
                                  <span className="block text-[10px] text-slate-400">
                                    {inf.commission_type === "percent"
                                      ? `${inf.commission_value}%`
                                      : `₹${inf.commission_value}/order`}
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Pending ₹ (All-Time) */}
                            <td className="py-3.5 px-3">
                              {inf.commission_type === "none" ? (
                                <span className="text-slate-400 font-semibold">—</span>
                              ) : inf.pending_amount > 0 ? (
                                <span className="font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                  ₹{inf.pending_amount.toLocaleString("en-IN")}
                                </span>
                              ) : (
                                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                                  ₹0
                                </span>
                              )}
                            </td>

                            {/* Spend / Return */}
                            <td className="py-3.5 px-3">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                                      inf.return_color === "high"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : inf.return_color === "medium"
                                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                                        : "bg-rose-50 text-rose-700 border border-rose-200"
                                    }`}
                                  >
                                    {inf.return_text}
                                  </span>
                                </div>
                                <span className="block text-[10px] text-slate-400 mt-0.5">
                                  Spend: ₹{inf.spend.toLocaleString("en-IN")}
                                </span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-3">
                              {inf.status === "no_commission" ? (
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500">
                                  No commission
                                </span>
                              ) : inf.status === "pending" ? (
                                <div>
                                  <button
                                    onClick={() => {
                                      setShowMarkPaidModal(inf);
                                      setPaymentNotes("");
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <span>🟡 Mark Paid</span>
                                  </button>
                                  {inf.last_paid_amount !== undefined && inf.last_paid_on && (
                                    <span className="block text-[10px] text-slate-400 mt-1">
                                      Last paid: ₹{inf.last_paid_amount} on{" "}
                                      {new Date(inf.last_paid_on).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                      })}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <Check className="w-3 h-3" />
                                    <span>Paid</span>
                                  </span>
                                  {inf.last_paid_amount !== undefined && inf.last_paid_on && (
                                    <span className="block text-[10px] text-slate-400 mt-1">
                                      Last paid: ₹{inf.last_paid_amount} on{" "}
                                      {new Date(inf.last_paid_on).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                      })}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>

                            {/* Active Toggle */}
                            <td className="py-3.5 px-2 text-center">
                              <button
                                onClick={() => handleToggleActive(inf)}
                                title={inf.active ? "Active (Click to disable)" : "Inactive (Click to enable)"}
                                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer mx-auto ${
                                  inf.active ? "bg-emerald-500" : "bg-slate-300"
                                }`}
                              >
                                <div
                                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                    inf.active ? "translate-x-5" : "translate-x-0"
                                  }`}
                                />
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Add Link */}
                                <button
                                  onClick={() => {
                                    fetchCatalogProducts();
                                    setShowAddLinkModal(inf);
                                    setNewLinkName("");
                                    setNewLinkDestination("home");
                                    setNewLinkCustomCode("");
                                  }}
                                  title="+ Add another link for this influencer"
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>

                                {/* Edit Profile */}
                                <button
                                  onClick={() => {
                                    setShowEditModal(inf);
                                    setEditName(inf.name);
                                    setEditInstaId(inf.insta_id);
                                    setEditNotes(inf.notes || "");
                                    setEditProductCost(String(inf.product_cost || 0));
                                    setEditCommissionType(inf.commission_type);
                                    setEditCommissionValue(String(inf.commission_value || 0));
                                  }}
                                  title="Edit Influencer Details"
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                {/* WhatsApp Report Copy */}
                                <button
                                  onClick={() => handleCopy(getWhatsAppMessage(inf), `wa_${inf.id}`)}
                                  title="Copy ready WhatsApp report for this influencer"
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                                >
                                  {copiedKey === `wa_${inf.id}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* EXPAND ROW: LINKS BREAKDOWN */}
                          {isExpanded && (
                            <tr className="bg-purple-50/30 border-b border-slate-200">
                              <td colSpan={12} className="p-3.5 sm:px-6">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                                      <LinkIcon className="w-3.5 h-3.5 text-purple-600" />
                                      <span>Tracking Links Breakdown ({inf.links.length})</span>
                                    </span>
                                    <button
                                      onClick={() => {
                                        fetchCatalogProducts();
                                        setShowAddLinkModal(inf);
                                        setNewLinkName("");
                                        setNewLinkDestination("home");
                                        setNewLinkCustomCode("");
                                      }}
                                      className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>Add Link</span>
                                    </button>
                                  </div>

                                  <div className="border border-purple-100 rounded-xl overflow-hidden bg-white">
                                    <table className="w-full text-left text-xs">
                                      <thead className="bg-purple-50/60 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                                        <tr>
                                          <th className="py-2 px-3">Link Name</th>
                                          <th className="py-2 px-3">Tracking Link</th>
                                          <th className="py-2 px-3">Opens (Target)</th>
                                          <th className="py-2 px-3">Clicks</th>
                                          <th className="py-2 px-3">Orders</th>
                                          <th className="py-2 px-3">Conv %</th>
                                          <th className="py-2 px-3 text-right">Revenue ₹</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {inf.links.map((link) => {
                                          const fullUrl = `${getStoreBaseUrl()}/r/${link.code}`;
                                          const isCopied = copiedKey === `link_${link.id}`;

                                          return (
                                            <tr key={link.id} className="hover:bg-slate-50">
                                              <td className="py-2 px-3 font-bold text-slate-900">
                                                {link.name}
                                              </td>
                                              <td className="py-2 px-3">
                                                <button
                                                  onClick={() => handleCopy(fullUrl, `link_${link.id}`)}
                                                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 hover:bg-purple-50 hover:text-purple-700 font-mono text-[11px] text-slate-700 transition-colors cursor-pointer"
                                                >
                                                  {isCopied ? (
                                                    <Check className="w-3 h-3 text-emerald-600" />
                                                  ) : (
                                                    <Copy className="w-3 h-3 text-slate-400" />
                                                  )}
                                                  <span>zupestore.in/r/{link.code}</span>
                                                </button>
                                              </td>
                                              <td className="py-2 px-3 text-slate-600">
                                                {link.destination === "home" || !link.destination
                                                  ? "Homepage"
                                                  : `Product: ${
                                                      products.find(
                                                        (p) =>
                                                          p.slug.toLowerCase() === link.destination.toLowerCase() ||
                                                          p.id.toLowerCase() === link.destination.toLowerCase() ||
                                                          p.slug.toLowerCase() ===
                                                            link.destination.replace(/^products\//, "").toLowerCase()
                                                      )?.name || link.destination
                                                    }`}
                                              </td>
                                              <td className="py-2 px-3 font-semibold text-slate-700">
                                                {link.clicks}
                                              </td>
                                              <td className="py-2 px-3 font-black text-slate-900">
                                                {link.orders}
                                              </td>
                                              <td className="py-2 px-3 font-bold text-slate-700">
                                                {link.conversion_rate}%
                                              </td>
                                              <td className="py-2 px-3 text-right font-bold text-slate-900">
                                                ₹{link.revenue.toLocaleString("en-IN")}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL 1: ADD EXTRA LINK MODAL */}
      {showAddLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-purple-600" />
                <span>Add Link for {showAddLinkModal.name}</span>
              </h3>
              <button
                onClick={() => setShowAddLinkModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLinkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Link Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sharpener Story 2"
                  value={newLinkName}
                  onChange={(e) => setNewLinkName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Opens (Destination)
                </label>
                <select
                  value={newLinkDestination}
                  onChange={(e) => setNewLinkDestination(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
                >
                  <option value="home">Homepage (zupestore.in)</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.slug || p.id}>
                      Product: {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Custom Short Code <span className="text-slate-400 font-normal">(Optional, auto-generated if blank)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-mono">zupestore.in/r/</span>
                  <input
                    type="text"
                    placeholder={`${showAddLinkModal.insta_id}-2`}
                    value={newLinkCustomCode}
                    onChange={(e) => setNewLinkCustomCode(e.target.value)}
                    className="w-full pl-28 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLinkModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingLink}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm shadow-purple-500/25 transition-all disabled:opacity-60 cursor-pointer flex items-center gap-1.5"
                >
                  {addingLink && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Generate Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MARK PAID CONFIRMATION MODAL */}
      {showMarkPaidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-600" />
                <span>Confirm Commission Payout</span>
              </h3>
              <button
                onClick={() => setShowMarkPaidModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
              <span className="text-xs font-semibold text-amber-800">Pending Payout for:</span>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-amber-950">{showMarkPaidModal.name}</span>
                <span className="text-2xl font-black text-amber-900">
                  ₹{showMarkPaidModal.pending_amount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Marking as paid will record this payout, reset their pending balance to <strong>₹0</strong>, and switch their status to <strong className="text-emerald-700">✅ Paid</strong>. New orders placed after today will resume accumulating as pending.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payout Notes / UPI Ref <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. GPay UPI ref 123456789"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowMarkPaidModal(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMarkPaidSubmit}
                disabled={markingPaid}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm shadow-amber-500/25 transition-all disabled:opacity-60 cursor-pointer flex items-center gap-1.5"
              >
                {markingPaid && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Payment (₹{showMarkPaidModal.pending_amount})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT INFLUENCER MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-purple-600" />
                <span>Edit Influencer Profile</span>
              </h3>
              <button
                onClick={() => setShowEditModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Instagram ID</label>
                  <input
                    type="text"
                    required
                    value={editInstaId}
                    onChange={(e) => setEditInstaId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Free Product Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editProductCost}
                    onChange={(e) => setEditProductCost(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Commission Type</label>
                  <select
                    value={editCommissionType}
                    onChange={(e) => setEditCommissionType(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white"
                  >
                    <option value="none">No Commission (0)</option>
                    <option value="percent">% of Order</option>
                    <option value="fixed">₹ Fixed per Order</option>
                  </select>
                </div>
              </div>

              {editCommissionType !== "none" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Commission Value ({editCommissionType === "percent" ? "%" : "₹"})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={editCommissionValue}
                    onChange={(e) => setEditCommissionValue(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-semibold"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-60 cursor-pointer flex items-center gap-1.5"
                >
                  {savingEdit && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: VIEW / EDIT NOTES MODAL */}
      {showNotesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Notes for {showNotesModal.name}</span>
              </h3>
              <button
                onClick={() => setShowNotesModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              rows={4}
              value={currentNotes}
              onChange={(e) => setCurrentNotes(e.target.value)}
              placeholder="Record gifted product details, dispatch dates, or WhatsApp notes..."
              className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNotesModal(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-60 cursor-pointer flex items-center gap-1.5"
              >
                {savingNotes && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Notes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: SYSTEM GUIDE & CALCULATION MODAL */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                    <span>Influencer Orders &amp; Affiliate Guide</span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800">
                      Documentation
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Plain-English explanations for KPIs, calculations, table columns, and creator onboarding.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab Navigation */}
            <div className="px-6 pt-3 pb-2 border-b border-slate-100 flex items-center gap-2 overflow-x-auto bg-white text-xs font-semibold">
              {[
                { id: "overview", label: "Overview & Tracking", icon: Share2 },
                { id: "kpis", label: "Top KPI Cards", icon: TrendingUp },
                { id: "roi", label: "Spend & Return (ROI)", icon: DollarSign },
                { id: "columns", label: "Table Columns", icon: Filter },
                { id: "form", label: "Add Creator Form", icon: Sparkles },
                { id: "payout", label: "Mark Paid & WhatsApp", icon: MessageCircle },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = guideTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setGuideTab(tab.id as any)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-purple-600 text-white shadow-xs font-bold"
                        : "bg-slate-100 hover:bg-slate-200/70 text-slate-600"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-700 text-sm">
              {/* TAB 1: OVERVIEW */}
              {guideTab === "overview" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100">
                    <h4 className="font-bold text-purple-900 text-sm mb-1">How Influencer Affiliate Marketing Works</h4>
                    <p className="text-xs text-purple-800 leading-relaxed">
                      Zupe Store gives creators custom tracking links (e.g. <code className="bg-purple-200/60 px-1 py-0.5 rounded text-purple-900">zupestore.in/r/creator</code>) to share in Instagram Stories, Bios, or YouTube descriptions. When their followers click, the system tracks sales and calculates commission with 100% transparency.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[11px]">1</span>
                        <span>Link Clicked</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Follower taps link on Instagram. The server logs +1 Click and instantly redirects to the product page.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[11px]">2</span>
                        <span>7-Day Memory Tag</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        A tracking cookie &amp; storage tag is saved on the customer's phone valid for 7 days, even if they close the browser and buy later.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[11px]">3</span>
                        <span>Order Credited</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        When the customer buys (Prepaid or COD), the system calculates creator commission and updates this dashboard live!
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    <strong>💡 Built for Instagram &amp; Facebook Browsers:</strong> Uses dual HTTP Cookies + LocalStorage so that in-app mobile browsers will never lose creator attribution.
                  </div>
                </div>
              )}

              {/* TAB 2: KPIS */}
              {guideTab === "kpis" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl border border-slate-200 bg-white">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase">Attributed Revenue</span>
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-sm font-bold text-slate-900 mt-1">Total Sales From Creator Links</p>
                      <p className="text-xs text-slate-600 mt-1">
                        The sum of all customer order values that arrived through creator links in the selected dates.
                        <br /><span className="text-slate-400 font-mono">Example: Order 1 (₹599) + Order 2 (₹1,499) = ₹2,098</span>
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-white">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase">Commission (Period)</span>
                        <DollarSign className="w-4 h-4 text-purple-600" />
                      </div>
                      <p className="text-sm font-bold text-slate-900 mt-1">Commission Earned in Selected Dates</p>
                      <p className="text-xs text-slate-600 mt-1">
                        Total creator commissions earned <strong>only inside the chosen date filter</strong> (e.g. Today or 7 Days).
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-800 uppercase">Total Pending (All-Time)</span>
                        <Clock className="w-4 h-4 text-amber-600" />
                      </div>
                      <p className="text-sm font-bold text-slate-900 mt-1">Actual Money You Owe Creators Right Now</p>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                        <strong>Why is this All-Time and not filtered by dates?</strong> Because unpaid creator commission is a business debt! If an influencer brought sales 2 weeks ago and has not been paid yet, you still owe them today. It does not disappear when you select "Today".
                        <br />
                        <span className="font-mono text-amber-900 font-semibold">
                          Total Pending = Lifetime Commission Earned - Total Money Already Paid Out
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ROI MATH */}
              {guideTab === "roi" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm">How Return on Investment (ROI) is Calculated</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-900 block mb-1">1. Spend on Creator:</span>
                        <p className="text-slate-600 font-mono">Spend = Gifted Product Cost + Commission Earned</p>
                        <p className="text-slate-500 mt-1">If you sent a free sample costing ₹150 and they earned ₹59.90 commission, your total spend is ₹209.90.</p>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-900 block mb-1">2. Return Multiplier:</span>
                        <p className="text-slate-600 font-mono">Return Multiplier = Attributed Revenue ÷ Spend</p>
                        <p className="text-slate-500 mt-1">If you spent ₹149.90 on ijas and they brought ₹1,499 in sales, the return is <strong>10.0x</strong>!</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-bold text-slate-800 text-xs">Visual Return Badges:</h5>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                        <span className="font-black block">🟢 3.0x or higher</span>
                        <span className="text-[11px] text-emerald-700">Highly profitable! Keep working with this creator.</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                        <span className="font-black block">🟡 1.0x to 2.9x</span>
                        <span className="text-[11px] text-amber-700">Moderate / Breakeven. Profitable if product margins allow.</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900">
                        <span className="font-black block">🔴 Below 1.0x</span>
                        <span className="text-[11px] text-rose-700">Loss-making. Spent more on sample + fees than sales brought.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: COLUMNS */}
              {guideTab === "columns" && (
                <div className="space-y-3">
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <div className="p-3 bg-slate-50 font-bold text-slate-900 flex justify-between">
                      <span>Column</span>
                      <span>Explanation</span>
                    </div>
                    <div className="p-3 flex justify-between gap-4">
                      <span className="font-semibold text-slate-900 min-w-28">NAME / INSTA ID</span>
                      <span className="text-slate-600">Creator's name and Instagram handle. Clicking handle opens their IG profile.</span>
                    </div>
                    <div className="p-3 flex justify-between gap-4 bg-slate-50/50">
                      <span className="font-semibold text-slate-900 min-w-28">LINKS</span>
                      <span className="text-slate-600">Number of tracking links. Click arrow <code className="font-mono">v</code> to expand per-link breakdown (Reel vs Story).</span>
                    </div>
                    <div className="p-3 flex justify-between gap-4">
                      <span className="font-semibold text-slate-900 min-w-28">CLICKS / ORDERS</span>
                      <span className="text-slate-600">Total visits to link vs completed customer checkouts.</span>
                    </div>
                    <div className="p-3 flex justify-between gap-4 bg-slate-50/50">
                      <span className="font-semibold text-slate-900 min-w-28">CONV %</span>
                      <span className="text-slate-600">Conversion Rate: <code className="font-mono">(Orders ÷ Clicks) × 100%</code>.</span>
                    </div>
                    <div className="p-3 flex justify-between gap-4">
                      <span className="font-semibold text-slate-900 min-w-28">REVENUE ₹</span>
                      <span className="text-slate-600">Gross sales value generated by this creator.</span>
                    </div>
                    <div className="p-3 flex justify-between gap-4 bg-slate-50/50">
                      <span className="font-semibold text-slate-900 min-w-28">COMMISSION ₹</span>
                      <span className="text-slate-600">Commission earned in selected date window (shows rate beneath).</span>
                    </div>
                    <div className="p-3 flex justify-between gap-4">
                      <span className="font-semibold text-slate-900 min-w-28">PENDING ₹</span>
                      <span className="text-slate-600">Unpaid balance. Green ₹0 if paid; orange badge if money is owed.</span>
                    </div>
                    <div className="p-3 flex justify-between gap-4 bg-slate-50/50">
                      <span className="font-semibold text-slate-900 min-w-28">STATUS</span>
                      <span className="text-slate-600">Shows "Paid" or an orange "Mark Paid" button to settle.</span>
                    </div>
                    <div className="p-3 flex justify-between gap-4">
                      <span className="font-semibold text-slate-900 min-w-28">ACTIVE TOGGLE</span>
                      <span className="text-slate-600">Turn OFF to stop recording clicks and commissions without breaking customer links.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: FORM */}
              {guideTab === "form" && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-purple-900">
                    <strong>+ Add Influencer Form Fields:</strong>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-bold text-slate-900">1. Creator Name:</span>
                      <p className="text-slate-600">Real name or brand name (e.g. Anu Sharma, ijas).</p>
                    </div>

                    <div className="p-3 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-bold text-slate-900">2. Instagram Handle / ID:</span>
                      <p className="text-slate-600">Username <strong>without @</strong> (e.g. <code className="font-mono">_i__jas_</code>). Generates their unique shortlink.</p>
                    </div>

                    <div className="p-3 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-bold text-slate-900">3. Gifted Product Cost (₹):</span>
                      <p className="text-slate-600">Your cost for free samples shipped (e.g. ₹150). Enter 0 if none sent.</p>
                    </div>

                    <div className="p-3 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-bold text-slate-900">4. Commission Model:</span>
                      <p className="text-slate-600"><strong>None:</strong> Barter only. <strong>Percentage %:</strong> e.g. 10% per sale. <strong>Fixed ₹:</strong> Flat amount per order.</p>
                    </div>

                    <div className="p-3 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-bold text-slate-900">5. First Link Name:</span>
                      <p className="text-slate-600">Friendly label (e.g. "Instagram Bio", "Reel Link", "Story 1").</p>
                    </div>

                    <div className="p-3 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-bold text-slate-900">6. Link Opens (Destination):</span>
                      <p className="text-slate-600">Choose Homepage or select a specific product from the catalog dropdown.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: PAYOUT & WHATSAPP */}
              {guideTab === "payout" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span>How to Settle Payouts ("Mark Paid")</span>
                    </h4>
                    <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600">
                      <li>Pay the creator via Google Pay, PhonePe, UPI, or Bank Transfer.</li>
                      <li>Click the orange <strong>"Mark Paid"</strong> button next to their name.</li>
                      <li>Review the pending amount and optionally enter your payment note (e.g. "GPay UPI Ref 987654").</li>
                      <li>Click <strong>"Confirm Payout"</strong>. The creator's pending balance drops to ₹0 and the top "Total Pending (All-Time)" card automatically reduces!</li>
                    </ol>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>1-Click WhatsApp Report Generator</span>
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Click the speech bubble icon (💬) under <strong>ACTIONS</strong> to copy an instant update message:
                    </p>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800">
                      Hi ijas 👋 Your Zupestore link report (last 7 days): 2 clicks, 1 orders, commission ₹150. Thank you! 🙌
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Open WhatsApp Web or mobile, paste and send! Creators love seeing their real-time performance.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-500">
                Full documentation also in <code className="font-mono font-semibold text-slate-700">docs/INFLUENCER_AFFILIATE_ADMIN_GUIDE.md</code>
              </span>
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer shadow-xs transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
