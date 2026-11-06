"use client";

import React, { useState, useEffect, useMemo } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Target,
  Users,
  DollarSign,
  TrendingUp,
  Phone,
  Mail,
  MessageSquare,
  Flame,
  Sparkles,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  BarChart2,
  Activity,
  ShieldCheck,
  Layers,
  Send,
  Calendar,
  ChevronRight,
  X,
  Tag,
  Trash2,
  Edit3,
  Save,
  HelpCircle,
  ShoppingBag,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { CRMLead } from "@/app/api/admin/crm/leads/route";

export default function AdminCRMPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "leads" | "customers" | "meta" | "pixel">("overview");

  // Leads State
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [leadStats, setLeadStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    hotLeads: 0,
    convertedLeads: 0,
    pipelineValue: 0,
    conversionRate: 0,
  });
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadSearch, setLeadSearch] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");
  const [leadTempFilter, setLeadTempFilter] = useState("all");

  // Meta & Ad Spend State
  const [metaConfig, setMetaConfig] = useState({
    accountId: "",
    token: "",
    pixelId: "",
    testEventCode: "",
    isActive: false,
    lastSyncedAt: "",
    hasToken: false,
  });
  const [metaMetrics, setMetaMetrics] = useState({
    totalMetaSpend: 0,
    deliveredRevenue: 0,
    realizedNetProfit: 0,
    blendedRoas: 0,
    cac: 0,
    cpa: 0,
    poas: 0,
    totalImpressions: 0,
    totalClicks: 0,
    avgCpc: 0,
    avgCtr: 0,
    totalOrdersCount: 0,
  });
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaSaving, setMetaSaving] = useState(false);
  const [metaTesting, setMetaTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Pixel Events Log State
  const [pixelEvents, setPixelEvents] = useState<any[]>([]);
  const [pixelLoading, setPixelLoading] = useState(false);
  const [testEventSending, setTestEventSending] = useState(false);
  const [testEventMsg, setTestEventMsg] = useState("");

  // Customers 360 State
  const [customers, setCustomers] = useState<any[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerSegment, setCustomerSegment] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customerNotes, setCustomerNotes] = useState<any[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Modals
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    source: "meta_ads",
    temperature: "warm",
    potential_value: "899",
    notes: "",
  });
  const [creatingLead, setCreatingLead] = useState(false);

  const [showLogSpendModal, setShowLogSpendModal] = useState(false);
  const [logSpendForm, setLogSpendForm] = useState({
    date: new Date().toISOString().split("T")[0],
    campaignName: "TJ - Men Energy & Vitality - Pan India",
    spend: "500",
    impressions: "3500",
    clicks: "150",
    purchases: "2",
    purchaseValue: "1798",
  });
  const [loggingSpend, setLoggingSpend] = useState(false);

  // 1-Click WhatsApp Quick Action Modal
  const [whatsAppModalLead, setWhatsAppModalLead] = useState<CRMLead | null>(null);
  const [customWaMsg, setCustomWaMsg] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // =========================================================
  // FETCH DATA
  // =========================================================
  const fetchLeads = async () => {
    try {
      setLeadsLoading(true);
      const url = new URL("/api/admin/crm/leads", window.location.origin);
      if (leadStatusFilter !== "all") url.searchParams.set("status", leadStatusFilter);
      if (leadTempFilter !== "all") url.searchParams.set("temperature", leadTempFilter);
      if (leadSearch) url.searchParams.set("search", leadSearch);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads || []);
        if (data.stats) setLeadStats(data.stats);
      }
    } catch (err) {
      console.warn("Failed to fetch CRM leads:", err);
    } finally {
      setLeadsLoading(false);
    }
  };

  const fetchMetaData = async () => {
    try {
      setMetaLoading(true);
      const res = await fetch("/api/admin/crm/meta");
      const data = await res.json();
      if (data.success) {
        if (data.config) setMetaConfig(data.config);
        if (data.metrics) setMetaMetrics(data.metrics);
        if (data.campaigns) setCampaigns(data.campaigns);
      }
    } catch (err) {
      console.warn("Failed to fetch Meta CRM data:", err);
    } finally {
      setMetaLoading(false);
    }
  };

  const fetchPixelEvents = async () => {
    try {
      setPixelLoading(true);
      const res = await fetch("/api/meta/capi");
      const data = await res.json();
      if (data.success) {
        setPixelEvents(data.events || []);
      }
    } catch (err) {
      console.warn("Failed to fetch pixel events:", err);
    } finally {
      setPixelLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      if (data.success && Array.isArray(data.customers)) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.warn("Failed to fetch customers for CRM:", err);
    } finally {
      setCustomersLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchMetaData();
    fetchPixelEvents();
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [leadStatusFilter, leadTempFilter]);

  // Load customer notes when a customer is selected
  const handleSelectCustomer = async (cust: any) => {
    setSelectedCustomer(cust);
    const identifier = cust.phone || cust.email || cust.id;
    try {
      const res = await fetch(`/api/admin/crm/notes?customer=${encodeURIComponent(identifier)}`);
      const data = await res.json();
      if (data.success) {
        setCustomerNotes(data.notes || []);
      }
    } catch (err) {
      setCustomerNotes([]);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedCustomer) return;
    setAddingNote(true);
    try {
      const identifier = selectedCustomer.phone || selectedCustomer.email || selectedCustomer.id;
      const res = await fetch("/api/admin/crm/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_identifier: identifier,
          content: newNoteText.trim(),
          author: "Admin",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomerNotes((prev) => [
          {
            id: data.id,
            customer_identifier: identifier,
            author: "Admin",
            content: newNoteText.trim(),
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setNewNoteText("");
      }
    } finally {
      setAddingNote(false);
    }
  };

  // Lead Status Quick-Update
  const handleUpdateLeadStatus = async (leadId: string, newStatus: CRMLead["status"]) => {
    try {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
      await fetch("/api/admin/crm/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      });
      fetchLeads();
    } catch (e) {
      console.warn("Failed to patch lead status:", e);
    }
  };

  // Create Lead Form Submission
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.phone) return;
    setCreatingLead(true);
    try {
      const res = await fetch("/api/admin/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newLeadForm.name,
          phone: newLeadForm.phone,
          email: newLeadForm.email,
          source: newLeadForm.source,
          temperature: newLeadForm.temperature,
          potential_value: Number(newLeadForm.potential_value) || 0,
          notes: newLeadForm.notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddLeadModal(false);
        setNewLeadForm({
          name: "",
          phone: "",
          email: "",
          source: "meta_ads",
          temperature: "warm",
          potential_value: "899",
          notes: "",
        });
        fetchLeads();
      } else {
        alert(data.error || "Failed to create lead.");
      }
    } finally {
      setCreatingLead(false);
    }
  };

  // Log Daily Ad Spend Submission
  const handleLogAdSpend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logSpendForm.spend || Number(logSpendForm.spend) <= 0) return;
    setLoggingSpend(true);
    try {
      const res = await fetch("/api/admin/crm/meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "log_spend",
          date: logSpendForm.date,
          campaignName: logSpendForm.campaignName,
          spend: Number(logSpendForm.spend),
          impressions: Number(logSpendForm.impressions || 0),
          clicks: Number(logSpendForm.clicks || 0),
          purchases: Number(logSpendForm.purchases || 0),
          purchaseValue: Number(logSpendForm.purchaseValue || 0),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowLogSpendModal(false);
        fetchMetaData();
      } else {
        alert(data.error || "Failed to log ad spend.");
      }
    } finally {
      setLoggingSpend(false);
    }
  };

  // Save Meta Configuration
  const handleSaveMetaConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setMetaSaving(true);
    try {
      const res = await fetch("/api/admin/crm/meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_config",
          accountId: metaConfig.accountId,
          token: metaConfig.token,
          pixelId: metaConfig.pixelId,
          testEventCode: metaConfig.testEventCode,
          isActive: metaConfig.isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: "Meta configuration saved successfully!" });
      } else {
        setTestResult({ success: false, message: data.error || "Failed to save configuration." });
      }
    } finally {
      setMetaSaving(false);
    }
  };

  // Test Meta API Handshake
  const handleTestMetaConnection = async () => {
    setMetaTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/crm/meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_connection",
          accountId: metaConfig.accountId,
          token: metaConfig.token,
        }),
      });
      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.message || (data.success ? "Meta handshake successful!" : "Connection failed."),
      });
    } finally {
      setMetaTesting(false);
    }
  };

  // Send Test Purchase Event to Meta Events Manager
  const handleSendTestEvent = async () => {
    setTestEventSending(true);
    setTestEventMsg("");
    try {
      const res = await fetch("/api/meta/capi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: "Purchase",
          testEventCode: metaConfig.testEventCode || undefined,
          eventSourceUrl: "https://turkiyejam.com/checkout",
          userData: {
            email: "test.customer@turkiyejam.com",
            phone: "+91 98765 43210",
            firstName: "Test",
            lastName: "Buyer",
            city: "Mumbai",
          },
          customData: {
            currency: "INR",
            value: 899,
            orderId: `test_order_${Date.now().toString().slice(-4)}`,
            contentIds: ["turkiye-jam-pack-2"],
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestEventMsg(`✓ Dispatched test Purchase (₹899) to Pixel ${metaConfig.pixelId} & CAPI! Status: ${data.status}`);
        fetchPixelEvents();
      } else {
        setTestEventMsg(`Error: ${data.error || "Failed to dispatch test event"}`);
      }
    } finally {
      setTestEventSending(false);
    }
  };

  // Open 1-Click WhatsApp modal
  const openWhatsAppModal = (lead: CRMLead) => {
    setWhatsAppModalLead(lead);
    const firstName = lead.name.split(" ")[0] || "there";
    setCustomWaMsg(
      `Hi ${firstName}! 🍯 Thank you for your inquiry on our Instagram / Facebook ad for Turkiye Jam! Here is your exclusive ₹100 Off coupon code: 'META100' valid on your order today: https://turkiyejam.com/checkout`
    );
  };

  const executeWhatsAppDirect = () => {
    if (!whatsAppModalLead) return;
    const cleanPhone = whatsAppModalLead.phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    const encodedMsg = encodeURIComponent(customWaMsg);
    window.open(`https://wa.me/${formattedPhone}?text=${encodedMsg}`, "_blank");

    // Mark lead as contacted
    fetch("/api/admin/crm/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: whatsAppModalLead.id, mark_contacted: true }),
    }).then(() => fetchLeads());

    setWhatsAppModalLead(null);
  };

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (customerSegment === "vip" && (c.totalSpend || 0) < 2500) return false;
      if (customerSegment === "repeat" && (c.ordersCount || 0) < 2) return false;
      if (customerSegment === "rto_risk" && (c.rtoCount || 0) === 0) return false;

      if (!customerSearch) return true;
      const q = customerSearch.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q)
      );
    });
  }, [customers, customerSegment, customerSearch]);

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <AdminHeader onOpenMobile={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Banner / Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
                  <Target className="h-5 w-5" />
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  CRM &amp; Meta Growth Center
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Unified Leads Management, Meta Pixel &amp; CAPI, Ad Spend Analytics, and Customer 360 with Real Cloudflare D1 Data.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  fetchLeads();
                  fetchMetaData();
                  fetchPixelEvents();
                  fetchCustomers();
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh Real Data
              </button>

              <button
                onClick={() => setShowAddLeadModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition"
              >
                <Plus className="h-4 w-4" />
                New Lead
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-2 scrollbar-none">
            {[
              { id: "overview", label: "Executive Cockpit", icon: BarChart2 },
              { id: "leads", label: "Meta Ad Leads", icon: Flame, badge: String(leadStats.totalLeads || 0) },
              { id: "customers", label: "Customer 360", icon: Users, badge: String(customers.length || 0) },
              { id: "meta", label: "Meta Ad Spends", icon: DollarSign, badge: `${metaMetrics.blendedRoas}x ROAS` },
              { id: "pixel", label: "Pixel & CAPI Diagnostics", icon: Activity, badge: "Health" },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ========================================================= */}
          {/* TAB 1: EXECUTIVE OVERVIEW & KPI FUNNEL */}
          {/* ========================================================= */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Primary KPI Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Blended ROAS</span>
                    <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <TrendingUp className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mt-2">
                    {metaMetrics.blendedRoas}x
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    Delivered Rev / Ad Spend
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Total Meta Ad Spend</span>
                    <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                      <DollarSign className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mt-2">
                    ₹{metaMetrics.totalMetaSpend.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Realized in ERP expense ledger
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Customer CAC</span>
                    <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                      <Users className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mt-2">
                    ₹{metaMetrics.cac.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    CPA per Order: ₹{metaMetrics.cpa.toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Hot Leads Pipeline</span>
                    <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
                      <Flame className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mt-2">
                    ₹{leadStats.pipelineValue.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-orange-400 mt-1">
                    {leadStats.hotLeads} Hot Leads awaiting follow-up
                  </div>
                </div>
              </div>

              {/* Lead Conversion Funnel */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      E-Commerce Conversion &amp; Lead Funnel
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Real visitor journey from Meta Ads impressions to verified order delivery
                    </p>
                  </div>
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                    {leadStats.conversionRate}% Lead-to-Order Rate
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stage 1: Awareness</span>
                    <div className="text-xl font-bold text-white mt-1">
                      {metaMetrics.totalImpressions.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Ad Impressions (Meta)</p>
                    <div className="text-[11px] text-indigo-400 mt-2">
                      {metaMetrics.totalClicks} Clicks ({metaMetrics.avgCtr}% CTR)
                    </div>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stage 2: Meta Ad Leads</span>
                    <div className="text-xl font-bold text-white mt-1">
                      {leadStats.totalLeads} Leads
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Ad Clicks &amp; Instant Forms</p>
                    <div className="text-[11px] text-amber-400 mt-2">
                      {leadStats.newLeads} Untouched / New
                    </div>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stage 3: Engagement</span>
                    <div className="text-xl font-bold text-white mt-1">
                      {leadStats.contactedLeads} Contacted
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">1-Click WhatsApp Follow-up</p>
                    <div className="text-[11px] text-emerald-400 mt-2">
                      Direct WhatsApp Desk
                    </div>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stage 4: Converted Orders</span>
                    <div className="text-xl font-bold text-white mt-1">
                      {metaMetrics.totalOrdersCount} Orders
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Confirmed in D1 / ERP</p>
                    <div className="text-[11px] text-emerald-400 mt-2">
                      ₹{metaMetrics.deliveredRevenue.toLocaleString()} Delivered Revenue
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Hot Leads */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-400" />
                      Priority Meta Ad Leads (High-Value Inquiries)
                    </h3>
                    <button
                      onClick={() => setActiveTab("leads")}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      View Meta Leads &rarr;
                    </button>
                  </div>

                  <div className="space-y-3">
                    {leads
                      .filter((l) => l.temperature === "hot" || l.potential_value >= 900)
                      .slice(0, 4)
                      .map((lead) => (
                        <div
                          key={lead.id}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white text-xs sm:text-sm truncate">
                                {lead.name}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                                Hot 🔥
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{lead.phone}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-bold text-sm text-emerald-400">
                              ₹{lead.potential_value.toLocaleString()}
                            </span>
                            <button
                              onClick={() => openWhatsAppModal(lead)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                            >
                              <MessageSquare className="h-3 w-3" />
                              WhatsApp
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Activity className="h-4 w-4 text-emerald-400" />
                      Meta Marketing &amp; CAPI Status
                    </h3>
                    <button
                      onClick={() => setActiveTab("pixel")}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      View Diagnostics &rarr;
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                      <div>
                        <span className="font-semibold text-white">Browser Pixel ID</span>
                        <p className="text-slate-400 font-mono text-[11px]">{metaConfig.pixelId}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" />
                        Active on Storefront
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                      <div>
                        <span className="font-semibold text-white">Server-Side CAPI</span>
                        <p className="text-slate-400 text-[11px]">Deduplication enabled with event_id</p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <ShieldCheck className="h-3 w-3" />
                        Server Running
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                      <div>
                        <span className="font-semibold text-white">Meta Ad Account</span>
                        <p className="text-slate-400 font-mono text-[11px]">{metaConfig.accountId}</p>
                      </div>
                      <button
                        onClick={() => setActiveTab("meta")}
                        className="px-2.5 py-1 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition"
                      >
                        Manage Token
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: META AD LEADS */}
          {/* ========================================================= */}
          {activeTab === "leads" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Meta Leads Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-900/40 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-white">Meta Ad Leads Desk</h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Instagram &amp; Facebook Ads
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Exclusively tracking visitor inquiries captured via Meta Ad clicks (fbclid / UTMs) and Meta Instant Lead Forms.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                    {leadStats.totalLeads} Total Meta Leads
                  </span>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchLeads()}
                    placeholder="Search Meta leads by name, phone, notes..."
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto scrollbar-none">
                  {/* Status Pills */}
                  <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs">
                    {["all", "new", "contacted", "converted", "lost"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setLeadStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-lg capitalize font-medium transition ${
                          leadStatusFilter === st
                            ? "bg-indigo-600 text-white font-bold"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* Temperature Filter */}
                  <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs">
                    {["all", "hot", "warm", "cold"].map((temp) => (
                      <button
                        key={temp}
                        onClick={() => setLeadTempFilter(temp)}
                        className={`px-2 py-1 rounded-lg capitalize font-medium transition ${
                          leadTempFilter === temp
                            ? "bg-slate-700 text-white font-bold"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {temp === "hot" ? "Hot 🔥" : temp === "warm" ? "Warm ⚡" : temp === "cold" ? "Cold ❄️" : "All"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Leads Table */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/60 border-b border-slate-700/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                      <tr>
                        <th className="px-5 py-3.5">Lead / Contact</th>
                        <th className="px-4 py-3.5">Meta Attribution</th>
                        <th className="px-4 py-3.5">Potential Deal</th>
                        <th className="px-4 py-3.5">Score</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5">Notes</th>
                        <th className="px-5 py-3.5 text-right">Direct Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {leadsLoading ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            Loading Meta CRM leads database...
                          </td>
                        </tr>
                      ) : leads.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                            <Flame className="h-8 w-8 text-slate-600 mx-auto mb-2 opacity-50" />
                            <p className="font-semibold text-slate-300">No Meta Ad Leads found</p>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                              Incoming leads from Instagram / Facebook ad clicks (fbclid) and Meta Instant Lead Forms will populate here in real-time.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        leads.map((lead) => {
                          const isHot = lead.temperature === "hot";
                          const isWarm = lead.temperature === "warm";

                          return (
                            <tr key={lead.id} className="hover:bg-slate-800/40 transition">
                              <td className="px-5 py-3.5">
                                <div className="font-semibold text-white">{lead.name}</div>
                                <div className="font-mono text-slate-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                                  <Phone className="h-3 w-3 text-slate-500" />
                                  {lead.phone}
                                </div>
                                {lead.email && (
                                  <div className="text-slate-500 text-[10px] truncate max-w-[180px]">
                                    {lead.email}
                                  </div>
                                )}
                              </td>

                              <td className="px-4 py-3.5">
                                <div className="flex flex-col gap-1">
                                  <span className="inline-flex items-center gap-1 w-fit px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                                    <Sparkles className="h-2.5 w-2.5 text-indigo-400" />
                                    {lead.source === "meta_ads"
                                      ? "Meta Ads (IG/FB)"
                                      : lead.source === "meta_instant_form"
                                      ? "Instant Lead Form"
                                      : lead.source.replace("_", " ")}
                                  </span>
                                  {Array.isArray(lead.tags) && lead.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {lead.tags.slice(0, 3).map((tag: string, idx: number) => (
                                        <span
                                          key={idx}
                                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 font-mono"
                                        >
                                          #{tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>

                              <td className="px-4 py-3.5 font-bold text-emerald-400 text-sm">
                                ₹{lead.potential_value.toLocaleString()}
                              </td>

                              <td className="px-4 py-3.5">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    isHot
                                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                      : isWarm
                                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                      : "bg-slate-800 text-slate-400 border border-slate-700"
                                  }`}
                                >
                                  {isHot ? "Hot 🔥" : isWarm ? "Warm ⚡" : "Cold ❄️"}
                                </span>
                              </td>

                              <td className="px-4 py-3.5">
                                <select
                                  value={lead.status}
                                  onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as any)}
                                  className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 capitalize"
                                >
                                  <option value="new">New Lead</option>
                                  <option value="contacted">Contacted</option>
                                  <option value="interested">Interested</option>
                                  <option value="converted">Converted</option>
                                  <option value="lost">Lost</option>
                                </select>
                              </td>

                              <td className="px-4 py-3.5 text-slate-400 max-w-xs truncate text-[11px]">
                                {lead.notes || <span className="italic text-slate-600">No notes</span>}
                              </td>

                              <td className="px-5 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => openWhatsAppModal(lead)}
                                    title="Send 1-Click WhatsApp Message"
                                    className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-white transition border border-emerald-500/30"
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                  </button>

                                  <a
                                    href={`tel:${lead.phone}`}
                                    title="Direct Call"
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
                                  >
                                    <Phone className="h-4 w-4" />
                                  </a>
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
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: CUSTOMER 360 & NOTES */}
          {/* ========================================================= */}
          {activeTab === "customers" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Customer Filters */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search by name, phone, city..."
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs">
                  {[
                    { id: "all", label: "All Customers" },
                    { id: "vip", label: "VIP (>₹2.5k)" },
                    { id: "repeat", label: "Repeat Buyers" },
                    { id: "rto_risk", label: "RTO Flags" },
                  ].map((seg) => (
                    <button
                      key={seg.id}
                      onClick={() => setCustomerSegment(seg.id)}
                      className={`px-3 py-1 rounded-lg capitalize font-medium transition ${
                        customerSegment === seg.id
                          ? "bg-indigo-600 text-white font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {seg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customers Table */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/60 border-b border-slate-700/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                      <tr>
                        <th className="px-5 py-3.5">Customer Profile</th>
                        <th className="px-4 py-3.5">Location</th>
                        <th className="px-4 py-3.5">Orders</th>
                        <th className="px-4 py-3.5">Lifetime Spend (LTV)</th>
                        <th className="px-4 py-3.5">RTO History</th>
                        <th className="px-4 py-3.5">Segment</th>
                        <th className="px-5 py-3.5 text-right">Profile 360</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {customersLoading ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                            Loading customer database...
                          </td>
                        </tr>
                      ) : filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                            No customers found.
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((cust) => {
                          const isVip = (cust.totalSpend || 0) >= 2500;
                          const hasRto = (cust.rtoCount || 0) > 0;

                          return (
                            <tr key={cust.id} className="hover:bg-slate-800/40 transition">
                              <td className="px-5 py-3.5">
                                <div className="font-semibold text-white">{cust.name}</div>
                                <div className="font-mono text-slate-400 text-[11px] mt-0.5">
                                  {cust.phone}
                                </div>
                              </td>

                              <td className="px-4 py-3.5 text-slate-400">
                                {cust.city || "India"}
                              </td>

                              <td className="px-4 py-3.5 font-bold text-white">
                                {cust.ordersCount || 1} Order(s)
                              </td>

                              <td className="px-4 py-3.5 font-bold text-emerald-400 text-sm">
                                ₹{(cust.totalSpend || 0).toLocaleString()}
                              </td>

                              <td className="px-4 py-3.5">
                                {hasRto ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                    <AlertTriangle className="h-3 w-3" />
                                    {cust.rtoCount} RTO
                                  </span>
                                ) : (
                                  <span className="text-emerald-400 text-xs">✓ 100% Clean</span>
                                )}
                              </td>

                              <td className="px-4 py-3.5">
                                {isVip ? (
                                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    VIP
                                  </span>
                                ) : cust.ordersCount > 1 ? (
                                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    Repeat
                                  </span>
                                ) : (
                                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                                    First-Time
                                  </span>
                                )}
                              </td>

                              <td className="px-5 py-3.5 text-right">
                                <button
                                  onClick={() => handleSelectCustomer(cust)}
                                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                                >
                                  Open 360 &rarr;
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: META AD SPENDS & CAMPAIGNS */}
          {/* ========================================================= */}
          {activeTab === "meta" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Meta Credentials & Integration Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Target className="h-5 w-5 text-indigo-400" />
                      Meta Marketing API &amp; Ad Account Integration
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Connect your Facebook / Instagram Ad Account to track daily campaign spend and calculate blended ROAS.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestMetaConnection}
                      disabled={metaTesting}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                    >
                      {metaTesting ? "Testing Handshake..." : "Test Connection Handshake"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowLogSpendModal(true)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" />
                      Log Ad Spend
                    </button>
                  </div>
                </div>

                {testResult && (
                  <div
                    className={`mb-5 p-3.5 rounded-2xl text-xs flex items-center gap-2 border ${
                      testResult.success
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-300 border-rose-500/30"
                    }`}
                  >
                    {testResult.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
                    <span>{testResult.message}</span>
                  </div>
                )}

                <form onSubmit={handleSaveMetaConfig} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Meta Ad Account ID
                    </label>
                    <input
                      type="text"
                      value={metaConfig.accountId}
                      onChange={(e) => setMetaConfig({ ...metaConfig, accountId: e.target.value })}
                      placeholder="e.g. act_1234567890"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Meta Marketing Access Token
                    </label>
                    <input
                      type="password"
                      value={metaConfig.token}
                      onChange={(e) => setMetaConfig({ ...metaConfig, token: e.target.value })}
                      placeholder={metaConfig.hasToken ? "•••••••••••• (Token saved)" : "EAAK..."}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Meta Pixel ID
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={metaConfig.pixelId}
                        onChange={(e) => setMetaConfig({ ...metaConfig, pixelId: e.target.value })}
                        placeholder="e.g. 123456789012345"
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      <button
                        type="submit"
                        disabled={metaSaving}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shrink-0"
                      >
                        {metaSaving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Campaigns & Daily Spend Table */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-indigo-400" />
                    Meta Ad Spend &amp; Campaign Performance Ledger
                  </h3>
                  <span className="text-xs text-slate-400">
                    Total Campaign Spend: <strong className="text-white">₹{metaMetrics.totalMetaSpend.toLocaleString()}</strong>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/60 border-b border-slate-700/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                      <tr>
                        <th className="px-5 py-3.5">Date</th>
                        <th className="px-4 py-3.5">Campaign Name</th>
                        <th className="px-4 py-3.5">Targeting / Adset</th>
                        <th className="px-4 py-3.5">Ad Spend</th>
                        <th className="px-4 py-3.5">Impressions</th>
                        <th className="px-4 py-3.5">Clicks / CPC</th>
                        <th className="px-4 py-3.5">Purchases</th>
                        <th className="px-5 py-3.5 text-right">ROAS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {campaigns.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                            No campaign spend recorded. Use &quot;Log Ad Spend&quot; to add daily budget.
                          </td>
                        </tr>
                      ) : (
                        campaigns.map((camp) => (
                          <tr key={camp.id} className="hover:bg-slate-800/40 transition">
                            <td className="px-5 py-3.5 font-mono text-slate-400">{camp.date}</td>
                            <td className="px-4 py-3.5 font-semibold text-white">{camp.campaign_name}</td>
                            <td className="px-4 py-3.5 text-slate-400 text-[11px]">{camp.adset_name || "Advantage+ Pan-India"}</td>
                            <td className="px-4 py-3.5 font-bold text-rose-400">₹{Number(camp.spend).toLocaleString()}</td>
                            <td className="px-4 py-3.5 text-slate-300">{Number(camp.impressions).toLocaleString()}</td>
                            <td className="px-4 py-3.5 text-slate-300">
                              {camp.clicks} clicks <span className="text-slate-500 text-[10px]">(₹{camp.cpc})</span>
                            </td>
                            <td className="px-4 py-3.5 font-semibold text-emerald-400">
                              {camp.purchases} (₹{Number(camp.purchase_value || 0).toLocaleString()})
                            </td>
                            <td className="px-5 py-3.5 text-right font-bold text-indigo-400">
                              {camp.roas ? `${camp.roas}x` : "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: PIXEL & CAPI DIAGNOSTICS */}
          {/* ========================================================= */}
          {activeTab === "pixel" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Pixel Health Status */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Activity className="h-5 w-5 text-emerald-400" />
                      Meta Pixel &amp; Server-Side Conversions API (CAPI) Monitor
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Verify browser pixel triggers and server-to-server CAPI delivery with deduplication in Meta Events Manager.
                    </p>
                  </div>

                  <button
                    onClick={handleSendTestEvent}
                    disabled={testEventSending}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {testEventSending ? "Dispatching..." : "Send Test Purchase Event"}
                  </button>
                </div>

                {testEventMsg && (
                  <div className="mb-5 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs">
                    {testEventMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Browser Pixel</span>
                    <div className="text-base font-bold text-white mt-1">ID: {metaConfig.pixelId}</div>
                    <p className="text-[11px] text-emerald-400 mt-1">✓ Active on /checkout, /products, and root</p>
                  </div>

                  <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Server Conversions API</span>
                    <div className="text-base font-bold text-white mt-1">Endpoint: /api/meta/capi</div>
                    <p className="text-[11px] text-emerald-400 mt-1">✓ SHA-256 Hashed Phone &amp; Email</p>
                  </div>

                  <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Test Event Code</span>
                    <div className="text-base font-bold text-white mt-1 font-mono">{metaConfig.testEventCode || "None"}</div>
                    <p className="text-[11px] text-slate-400 mt-1">Routes to Meta Events Manager Live Sandbox</p>
                  </div>
                </div>
              </div>

              {/* Event Stream Log */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    Live Event Stream &amp; CAPI Dispatch Log
                  </h3>
                  <button
                    onClick={fetchPixelEvents}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Refresh Log
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/60 border-b border-slate-700/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                      <tr>
                        <th className="px-5 py-3.5">Event Name</th>
                        <th className="px-4 py-3.5">Event ID</th>
                        <th className="px-4 py-3.5">Source</th>
                        <th className="px-4 py-3.5">Payload Preview</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {pixelLoading ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                            Loading event logs...
                          </td>
                        </tr>
                      ) : pixelEvents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                            No events captured yet.
                          </td>
                        </tr>
                      ) : (
                        pixelEvents.map((evt) => (
                          <tr key={evt.id} className="hover:bg-slate-800/40 transition">
                            <td className="px-5 py-3.5 font-bold text-white flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-emerald-400" />
                              {evt.event_name}
                            </td>
                            <td className="px-4 py-3.5 font-mono text-slate-400 text-[11px]">{evt.event_id}</td>
                            <td className="px-4 py-3.5 capitalize text-slate-300">
                              {evt.event_source.replace("_", " ")}
                            </td>
                            <td className="px-4 py-3.5 text-slate-400 font-mono text-[10px] max-w-xs truncate">
                              {evt.payload}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {evt.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right text-slate-500 text-[11px]">
                              {evt.created_at}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: ADD NEW CRM LEAD */}
      {/* ========================================================= */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-indigo-400" />
                Add New CRM Lead
              </h3>
              <button onClick={() => setShowAddLeadModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Customer / Lead Name</label>
                <input
                  type="text"
                  required
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Mobile Phone (WhatsApp)</label>
                <input
                  type="tel"
                  required
                  value={newLeadForm.phone}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Meta Source</label>
                  <select
                    value={newLeadForm.source}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="meta_ads">Meta Ads (IG / FB)</option>
                    <option value="meta_instant_form">Meta Instant Lead Form</option>
                    <option value="ad_campaign">Meta Ad Campaign</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Score / Temp</label>
                  <select
                    value={newLeadForm.temperature}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, temperature: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="hot">Hot 🔥</option>
                    <option value="warm">Warm ⚡</option>
                    <option value="cold">Cold ❄️</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Potential Value (₹)</label>
                <input
                  type="number"
                  value={newLeadForm.potential_value}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, potential_value: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Lead Notes</label>
                <textarea
                  rows={2}
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  placeholder="Inquired about 4-sachet bundle, preferred prepaid delivery..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingLead}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/30"
                >
                  {creatingLead ? "Creating..." : "Save Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: LOG DAILY AD SPEND */}
      {/* ========================================================= */}
      {showLogSpendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                Log Daily Meta Ad Spend
              </h3>
              <button onClick={() => setShowLogSpendModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleLogAdSpend} className="space-y-3.5 text-xs">
              <p className="text-slate-400 text-[11px]">
                Logging ad spend automatically updates the CRM campaign ledger AND the ERP Expense balance so your P&amp;L margin is accurate.
              </p>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Spend Date</label>
                <input
                  type="date"
                  required
                  value={logSpendForm.date}
                  onChange={(e) => setLogSpendForm({ ...logSpendForm, date: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  value={logSpendForm.campaignName}
                  onChange={(e) => setLogSpendForm({ ...logSpendForm, campaignName: e.target.value })}
                  placeholder="e.g. TJ - Men Energy & Vitality - Pan India"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Ad Spend (₹)</label>
                  <input
                    type="number"
                    required
                    value={logSpendForm.spend}
                    onChange={(e) => setLogSpendForm({ ...logSpendForm, spend: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Purchases Attributed</label>
                  <input
                    type="number"
                    value={logSpendForm.purchases}
                    onChange={(e) => setLogSpendForm({ ...logSpendForm, purchases: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Impressions</label>
                  <input
                    type="number"
                    value={logSpendForm.impressions}
                    onChange={(e) => setLogSpendForm({ ...logSpendForm, impressions: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Clicks</label>
                  <input
                    type="number"
                    value={logSpendForm.clicks}
                    onChange={(e) => setLogSpendForm({ ...logSpendForm, clicks: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogSpendModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loggingSpend}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md shadow-emerald-600/30"
                >
                  {loggingSpend ? "Saving..." : "Log & Sync ERP"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: 1-CLICK WHATSAPP QUICK ACTION */}
      {/* ========================================================= */}
      {whatsAppModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-400" />
                1-Click WhatsApp Direct Action
              </h3>
              <button onClick={() => setWhatsAppModalLead(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/80 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white">{whatsAppModalLead.name}</span>
                <p className="font-mono text-slate-400">{whatsAppModalLead.phone}</p>
              </div>
              <span className="font-bold text-emerald-400">
                Potential: ₹{whatsAppModalLead.potential_value.toLocaleString()}
              </span>
            </div>

            {/* Template Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Select Pre-Configured Message Template:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const firstName = whatsAppModalLead.name.split(" ")[0] || "there";
                    setCustomWaMsg(
                      `Hi ${firstName}! 🍯 Thank you for your inquiry on our Instagram / Facebook ad for Turkiye Jam! Here is your exclusive ₹100 Off coupon code: 'META100' valid on your order today: https://turkiyejam.com/checkout`
                    );
                  }}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left text-slate-300 font-medium border border-slate-700 transition"
                >
                  🎁 Meta Ad ₹100 Off Recovery
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const firstName = whatsAppModalLead.name.split(" ")[0] || "there";
                    setCustomWaMsg(
                      `Hello ${firstName}! 🚚 We saw your interest in Turkiye Jam from our Meta ad. Would you like to confirm Free Express Delivery via UPI or Cash on Delivery (₹49 advance)? Reply to confirm your delivery address!`
                    );
                  }}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left text-slate-300 font-medium border border-slate-700 transition"
                >
                  ⚡ Meta Lead Fast Delivery
                </button>
              </div>
            </div>

            {/* Editable Message Preview */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Message Content:
              </label>
              <textarea
                rows={4}
                value={customWaMsg}
                onChange={(e) => setCustomWaMsg(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(customWaMsg);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedLink ? "Copied Message!" : "Copy Text"}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWhatsAppModalLead(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeWhatsAppDirect}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <MessageSquare className="h-4 w-4" />
                  Launch WhatsApp &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DRAWER / MODAL 4: CUSTOMER 360 PROFILE & STAFF NOTES */}
      {/* ========================================================= */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-400" />
                  Customer 360: {selectedCustomer.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">{selectedCustomer.phone}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Total LTV</span>
                <div className="text-base font-bold text-emerald-400 mt-0.5">
                  ₹{(selectedCustomer.totalSpend || 0).toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Total Orders</span>
                <div className="text-base font-bold text-white mt-0.5">
                  {selectedCustomer.ordersCount || 1}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                <span className="text-slate-400 text-[10px] uppercase font-bold">RTO Rate</span>
                <div className="text-base font-bold text-white mt-0.5">
                  {selectedCustomer.rtoRate || 0}%
                </div>
              </div>
            </div>

            {/* Order History */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Recent Orders</h4>
              <div className="space-y-2">
                {selectedCustomer.recentOrders?.map((ord: any) => (
                  <div
                    key={ord.id}
                    className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/70 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{ord.shopify_order_id || ord.id}</span>
                      <p className="text-slate-500 text-[10px]">{ord.created_at}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-400">₹{ord.total_amount?.toLocaleString()}</span>
                      <p className="text-[10px] text-slate-400 capitalize">{ord.delivery_status || "Processing"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Staff CRM Notes */}
            <div className="border-t border-slate-800 pt-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Internal Staff Notes</h4>

              <form onSubmit={handleAddNote} className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Add a customer note (e.g. Call requested before 5 PM)..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={addingNote || !newNoteText.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {addingNote ? "Adding..." : "Add"}
                </button>
              </form>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {customerNotes.length === 0 ? (
                  <p className="text-slate-500 text-xs italic">No internal staff notes for this customer yet.</p>
                ) : (
                  customerNotes.map((note) => (
                    <div key={note.id} className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                        <span className="font-bold text-indigo-400">{note.author || "Admin"}</span>
                        <span>{note.created_at?.slice(0, 16).replace("T", " ")}</span>
                      </div>
                      <p className="text-slate-200">{note.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

