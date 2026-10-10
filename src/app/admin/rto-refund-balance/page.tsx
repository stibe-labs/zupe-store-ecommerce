"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  RotateCcw,
  MinusCircle,
  Wallet,
  Clock,
  HelpCircle,
  Plus,
  Search,
  Filter,
  Download,
  CheckCircle2,
  PlayCircle,
  CheckCircle,
  MoreVertical,
  X,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  Info,
} from "lucide-react";
import { RTOLedgerEntry, Supplier } from "@/lib/erpStore";

export default function RTORefundBalancePage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "ledger" | "used" | "pending" | "suppliers" | "reports"
  >("ledger");

  const [ledger, setLedger] = useState<RTOLedgerEntry[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [showAddCreditModal, setShowAddCreditModal] = useState(false);
  const [showUseCreditModal, setShowUseCreditModal] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<RTOLedgerEntry | null>(null);

  // Form state for Add Credit
  const [formSupplierId, setFormSupplierId] = useState("sup-a");
  const [formOrderId, setFormOrderId] = useState("");
  const [formProductName, setFormProductName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formStatus, setFormStatus] = useState<"Credited" | "Pending">("Credited");
  const [formNotes, setFormNotes] = useState("");

  // Form state for Use Credit
  const [useSupplierId, setUseSupplierId] = useState("sup-a");
  const [useOrderId, setUseOrderId] = useState("");
  const [useAmount, setUseAmount] = useState("");
  const [useNotes, setUseNotes] = useState("");

  // Summary Metrics
  const [metrics, setMetrics] = useState({
    totalCreditsAdded: 25400,
    totalCreditsUsed: 17900,
    availableBalance: 7500,
    pendingCredits: 2800,
    statusBreakdown: {
      credited: { count: 42, amount: 22600 },
      pending: { count: 6, amount: 2800 },
      partiallyUsed: { count: 5, amount: 3200 },
      fullyUsed: { count: 31, amount: 14700 },
    },
  });

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const url = new URL("/api/admin/rto-ledger", window.location.origin);
      if (supplierFilter !== "all") url.searchParams.set("supplier_id", supplierFilter);
      if (statusFilter !== "all") url.searchParams.set("status", statusFilter);
      if (searchQuery.trim()) url.searchParams.set("search", searchQuery.trim());

      const res = await fetch(url.toString());
      const data = await res.json();

      if (data.success) {
        setLedger(data.ledger || []);
        setSuppliers(data.suppliers || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.warn("Failed to fetch RTO ledger:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [supplierFilter, statusFilter, searchQuery]);

  // Lock background scroll when modals are open
  useEffect(() => {
    if (showAddCreditModal || showUseCreditModal || showHowItWorksModal || Boolean(selectedEntry)) {
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
  }, [showAddCreditModal, showUseCreditModal, showHowItWorksModal, selectedEntry]);

  // Handle Add RTO Credit submit
  const handleAddCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOrderId || !formProductName || !formAmount) return;

    try {
      const res = await fetch("/api/admin/rto-ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier_id: formSupplierId,
          order_id: formOrderId.startsWith("#") ? formOrderId : `#${formOrderId}`,
          product_name: formProductName,
          amount: Number(formAmount),
          status: formStatus,
          date: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          notes: formNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddCreditModal(false);
        setFormOrderId("");
        setFormProductName("");
        setFormAmount("");
        setFormNotes("");
        fetchData();
      } else {
        alert(data.error || "Failed to add RTO credit");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Use Credit submit
  const handleUseCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!useOrderId || !useAmount) return;

    try {
      const res = await fetch("/api/admin/rto-ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "use_credit",
          supplier_id: useSupplierId,
          order_id: "PO-OFFSET",
          used_against_order_id: useOrderId.startsWith("#") ? useOrderId : `#${useOrderId}`,
          amount_to_use: Number(useAmount),
          product_name: "Inventory PO Deduction",
          date: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          notes: useNotes || `Deducted against order ${useOrderId}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowUseCreditModal(false);
        setUseOrderId("");
        setUseAmount("");
        setUseNotes("");
        fetchData();
      } else {
        alert(data.error || "Failed to apply credit");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      "Date",
      "Order ID",
      "Supplier",
      "Product",
      "Type",
      "Amount (INR)",
      "Running Balance (INR)",
      "Status",
      "Used Against",
      "Notes",
    ];

    const rows = filteredLedger.map((row) => [
      `"${row.date}"`,
      `"${row.order_id}"`,
      `"${row.supplier_name || row.supplier_id}"`,
      `"${row.product_name}"`,
      `"${row.type}"`,
      row.amount,
      row.running_balance,
      `"${row.status}"`,
      `"${row.used_against_order_id || "-"}"`,
      `"${row.notes || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `zupe_rto_refund_balance_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Tab Filtering
  const filteredLedger = ledger.filter((item) => {
    if (activeTab === "used") return item.type === "Credit Used" || item.status === "Used";
    if (activeTab === "pending") return item.status === "Pending";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans">
      {/* Sidebar */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <AdminHeader
          onOpenMobile={() => setMobileSidebarOpen(true)}
          onRefresh={fetchData}
          isRefreshing={isRefreshing}
        />

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* Header Row: Title, Subtitle & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shadow-sm">
                <RotateCcw className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  RTO Refund Balance
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Manage supplier credits from returned orders and track usage.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowHowItWorksModal(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
              >
                <HelpCircle className="w-4 h-4 text-[#FF7A00]" />
                <span>How it works?</span>
              </button>

              <button
                onClick={() => setShowUseCreditModal(true)}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-orange-200 hover:bg-orange-50 text-[#FF7A00] text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
              >
                <MinusCircle className="w-4 h-4 text-[#FF7A00]" />
                <span>Use Credit</span>
              </button>

              <button
                onClick={() => setShowAddCreditModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm shadow-orange-500/25"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add RTO Credit</span>
              </button>
            </div>
          </div>

          {/* 4 Top KPI Cards (Matching Image 3) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Card 1: Total RTO Credits Added */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-4 hover:border-slate-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <RotateCcw className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total RTO Credits Added
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">
                  ₹{metrics.totalCreditsAdded.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">From 48 orders</p>
              </div>
            </div>

            {/* Card 2: Total Credits Used */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-4 hover:border-slate-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <MinusCircle className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Credits Used
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">
                  ₹{metrics.totalCreditsUsed.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Used for 36 orders</p>
              </div>
            </div>

            {/* Card 3: Available RTO Balance */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-4 hover:border-slate-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF7A00] flex items-center justify-center shrink-0 border border-orange-100">
                <Wallet className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Available RTO Balance
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">
                  ₹{metrics.availableBalance.toLocaleString("en-IN")}
                </p>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-[#FF7A00] font-medium">
                  <span>Supplier Credit</span>
                  <Info className="w-3.5 h-3.5 text-[#FF7A00]" />
                </div>
              </div>
            </div>

            {/* Card 4: Pending Supplier Credits */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-4 hover:border-slate-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                <Clock className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pending Supplier Credits
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">
                  ₹{metrics.pendingCredits.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">From 6 orders</p>
              </div>
            </div>
          </div>

          {/* 3 Visual & Analytical Cards (Matching Image 3) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Chart 1: RTO Balance Overview (col-span-5) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    RTO Balance Overview
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Credits Added
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> Credits Used
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#FF7A00]" /> Balance
                    </span>
                  </div>
                </div>

                {/* SVG Visual Chart */}
                <div className="mt-6 relative h-48 w-full flex flex-col justify-between">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400">
                    <div className="border-b border-slate-100 pb-0.5 flex justify-between">
                      <span>₹20,000</span>
                    </div>
                    <div className="border-b border-slate-100 pb-0.5 flex justify-between">
                      <span>₹15,000</span>
                    </div>
                    <div className="border-b border-slate-100 pb-0.5 flex justify-between">
                      <span>₹10,000</span>
                    </div>
                    <div className="border-b border-slate-100 pb-0.5 flex justify-between">
                      <span>₹5,000</span>
                    </div>
                    <div className="border-b border-slate-200 pb-0.5 flex justify-between">
                      <span>₹0</span>
                    </div>
                  </div>

                  {/* Bars & Trendline */}
                  <div className="relative z-10 pl-10 pr-2 h-full flex items-end justify-between">
                    {[
                      { m: "Jan", add: 20, use: 15, bal: 30 },
                      { m: "Feb", add: 35, use: 20, bal: 42 },
                      { m: "Mar", add: 45, use: 35, bal: 50 },
                      { m: "Apr", add: 30, use: 28, bal: 48 },
                      { m: "May", add: 55, use: 40, bal: 60 },
                      { m: "Jun", add: 60, use: 48, bal: 65 },
                      { m: "Jul", add: 50, use: 42, bal: 62 },
                      { m: "Aug", add: 70, use: 55, bal: 72 },
                      { m: "Sep", add: 65, use: 50, bal: 70 },
                      { m: "Oct", add: 58, use: 45, bal: 68 },
                    ].map((col, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1 group">
                        <div className="flex items-end gap-0.5 h-36">
                          <div
                            style={{ height: `${col.add}%` }}
                            className="w-1.5 sm:w-2 bg-emerald-500 rounded-t transition-all group-hover:bg-emerald-600"
                            title={`Credits Added: ${col.add * 250}`}
                          />
                          <div
                            style={{ height: `${col.use}%` }}
                            className="w-1.5 sm:w-2 bg-rose-400 rounded-t transition-all group-hover:bg-rose-500"
                            title={`Credits Used: ${col.use * 250}`}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">{col.m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Supplier-wise RTO Balance (col-span-4) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Supplier-wise RTO Balance
              </h3>

              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* Donut representation */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    {/* Background Circle */}
                    <path
                      className="text-slate-100"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Supplier A: 42% (Orange) */}
                    <path
                      className="text-[#FF7A00]"
                      strokeDasharray="42, 100"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Supplier B: 28% (Orange) */}
                    <path
                      className="text-amber-500"
                      strokeDasharray="28, 100"
                      strokeDashoffset="-42"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Supplier C: 15% (Emerald) */}
                    <path
                      className="text-emerald-500"
                      strokeDasharray="15, 100"
                      strokeDashoffset="-70"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Supplier D: 15% (Purple) */}
                    <path
                      className="text-purple-600"
                      strokeDasharray="15, 100"
                      strokeDashoffset="-85"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-bold text-slate-900">₹7,500</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Total Balance
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-2.5 text-xs flex-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00]" /> Supplier A
                    </span>
                    <span className="font-bold text-slate-900">₹3,200</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Supplier B
                    </span>
                    <span className="font-bold text-slate-900">₹2,150</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Supplier C
                    </span>
                    <span className="font-bold text-slate-900">₹1,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Supplier D
                    </span>
                    <span className="font-bold text-slate-900">₹1,150</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 3: RTO Status Breakdown (col-span-3) */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <h3 className="text-sm font-bold text-slate-900">RTO Status</h3>

              <div className="mt-4 space-y-3.5">
                {/* Credited */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="font-semibold text-slate-800">Credited</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">42</span>
                    <span className="font-bold text-slate-900">₹22,600</span>
                  </div>
                </div>

                {/* Pending */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="font-semibold text-slate-800">Pending</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">6</span>
                    <span className="font-bold text-slate-900">₹2,800</span>
                  </div>
                </div>

                {/* Partially Used */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-orange-100 text-[#FF7A00] flex items-center justify-center">
                      <PlayCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="font-semibold text-slate-800">Partially Used</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">5</span>
                    <span className="font-bold text-slate-900">₹3,200</span>
                  </div>
                </div>

                {/* Fully Used */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="font-semibold text-slate-800">Fully Used</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">31</span>
                    <span className="font-bold text-slate-900">₹14,700</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-navigation Tabs (Matching Image 3) */}
          <div className="border-b border-slate-200">
            <nav className="flex space-x-6 sm:space-x-8 text-sm">
              {[
                { id: "ledger", label: "RTO Credit Ledger" },
                { id: "used", label: "Credits Used" },
                { id: "pending", label: "Pending Credits" },
                { id: "suppliers", label: "Supplier-wise" },
                { id: "reports", label: "Reports" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 font-semibold text-xs sm:text-sm border-b-2 transition-all ${
                    activeTab === tab.id
                      ? "border-[#FF7A00] text-[#FF7A00]"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Filters & Action Bar (Matching Image 3) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search order ID, product, supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200/60"
                  aria-label="Clear RTO search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none"
              >
                <option value="all">All Suppliers</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="Credited">Credited</option>
                <option value="Used">Used</option>
                <option value="Partially Used">Partially Used</option>
                <option value="Pending">Pending</option>
              </select>

              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Ledger Table (Matching Image 3) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Date</th>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Supplier</th>
                    <th className="py-3.5 px-4">Product</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Amount (₹)</th>
                    <th className="py-3.5 px-4">Balance (₹)</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Used Against</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredLedger.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400">
                        No RTO ledger entries found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLedger.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-3.5 px-4 sm:px-6 text-slate-600 whitespace-nowrap">
                          {row.date}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#FF7A00] hover:underline cursor-pointer whitespace-nowrap">
                          {row.order_id}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-semibold whitespace-nowrap">
                          {row.supplier_name || row.supplier_id}
                        </td>
                        <td className="py-3.5 px-4 text-slate-900 font-medium max-w-[200px] truncate">
                          {row.product_name}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {row.type === "RTO Credit" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              RTO Credit
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                              Credit Used
                            </span>
                          )}
                        </td>
                        <td
                          className={`py-3.5 px-4 font-bold whitespace-nowrap ${
                            row.amount > 0 ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {row.amount > 0 ? `+${row.amount}` : row.amount}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {row.running_balance.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {row.status === "Credited" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100/70 text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Credited
                            </span>
                          )}
                          {row.status === "Used" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100/70 text-sky-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-600" /> Used
                            </span>
                          )}
                          {row.status === "Partially Used" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100/70 text-[#FF7A00]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" /> Partially Used
                            </span>
                          )}
                          {row.status === "Pending" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100/70 text-amber-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap font-medium">
                          {row.used_against_order_id ? (
                            <span className="text-[#FF7A00] font-semibold">
                              {row.used_against_order_id}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedEntry(row)}
                            className="text-[#FF7A00] font-semibold hover:text-[#E66E00] hover:underline text-xs mr-3"
                          >
                            View
                          </button>
                          <button className="text-slate-400 hover:text-slate-700">
                            <MoreVertical className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: ADD RTO CREDIT */}
      {/* ======================================================== */}
      {showAddCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  Add RTO Supplier Credit
                </h3>
              </div>
              <button
                onClick={() => setShowAddCreditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCredit} className="mt-4 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Supplier
                </label>
                <select
                  value={formSupplierId}
                  onChange={(e) => setFormSupplierId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Current Credit: ₹{s.available_rto_balance})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Returned Order ID
                  </label>
                  <input
                    type="text"
                    placeholder="#1060"
                    value={formOrderId}
                    onChange={(e) => setFormOrderId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Credit Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="500"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="Dynamic Water Ripple Night Light"
                  value={formProductName}
                  onChange={(e) => setFormProductName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                >
                  <option value="Credited">Credited (Supplier Restocked & Approved)</option>
                  <option value="Pending">Pending (Delivered to Supplier, Pending Verification)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Returned unopened. Supplier credit memo received."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddCreditModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF7A00] text-white rounded-xl hover:bg-[#E66E00] font-semibold shadow-sm shadow-orange-500/25"
                >
                  Save Credit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: USE CREDIT AGAINST NEW ORDER */}
      {/* ======================================================== */}
      {showUseCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF7A00] flex items-center justify-center">
                  <MinusCircle className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  Deduct RTO Credit Against New Purchase
                </h3>
              </div>
              <button
                onClick={() => setShowUseCreditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUseCredit} className="mt-4 space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  Supplier credits are strictly isolated. You may only deduct credit against purchase orders for the same supplier.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Supplier
                </label>
                <select
                  value={useSupplierId}
                  onChange={(e) => setUseSupplierId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — Available Balance: ₹{s.available_rto_balance}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    New Order / PO ID
                  </label>
                  <input
                    type="text"
                    placeholder="#1076"
                    value={useOrderId}
                    onChange={(e) => setUseOrderId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Credit to Apply (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="300"
                    value={useAmount}
                    onChange={(e) => setUseAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Offsetting product cost for customer order"
                  value={useNotes}
                  onChange={(e) => setUseNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowUseCreditModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF7A00] text-white rounded-xl hover:bg-[#E66E00] font-semibold shadow-sm shadow-orange-500/25"
                >
                  Apply Deduction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: HOW IT WORKS (ACCOUNTING EXPLAINER) */}
      {/* ======================================================== */}
      {showHowItWorksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF7A00] flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    How RTO Refund Balance Works
                  </h3>
                  <p className="text-xs text-slate-500">
                    Supplier credit lifecycle & double-entry accounting rules
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHowItWorksModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-xl space-y-2">
                <h4 className="font-bold text-orange-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#FF7A00] text-white text-[11px] font-bold flex items-center justify-center">
                    1
                  </span>
                  Order Returns (RTO) to Supplier
                </h4>
                <p className="text-xs text-orange-900 leading-relaxed pl-6.5">
                  When a courier marks an order as RTO and delivers the parcel back to the supplier, the supplier inspects and restocks the goods, issuing you a Product Cost Credit Note.
                </p>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
                    2
                  </span>
                  Credit Accrues in Supplier Balance
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed pl-6.5">
                  The refunded product cost (e.g. ₹500) is added to that specific supplier's RTO Refund Balance.
                </p>
              </div>

              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
                <h4 className="font-bold text-purple-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] font-bold flex items-center justify-center">
                    3
                  </span>
                  Auto-Deducted from Future Purchase Orders
                </h4>
                <p className="text-xs text-purple-800 leading-relaxed pl-6.5">
                  When you place subsequent customer orders with that supplier, the system deducts the product cost from the available balance. Cash payable to supplier becomes ₹0 until the balance is exhausted.
                </p>
              </div>

              <div className="p-3.5 bg-slate-900 text-white rounded-xl text-xs space-y-1">
                <p className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                  Important Accounting Rule:
                </p>
                <p className="text-slate-300">
                  The system does not count RTO Refund Balance as cash in hand or bank balance. It is an Accounts Receivable / Supplier Credit ledger strictly isolated per supplier.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHowItWorksModal(false)}
                className="px-5 py-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl font-semibold text-xs sm:text-sm shadow-sm shadow-orange-500/25"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: ENTRY DETAILS VIEW */}
      {/* ======================================================== */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Transaction Detail
              </h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-bold text-[#FF7A00]">{selectedEntry.order_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Supplier:</span>
                <span className="font-semibold text-slate-800">{selectedEntry.supplier_name || selectedEntry.supplier_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Product:</span>
                <span className="font-medium text-slate-800">{selectedEntry.product_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Transaction Type:</span>
                <span className="font-bold">{selectedEntry.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Amount:</span>
                <span className={`font-bold ${selectedEntry.amount > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  ₹{Math.abs(selectedEntry.amount)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Running Balance:</span>
                <span className="font-bold text-slate-900">₹{selectedEntry.running_balance.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-slate-800">{selectedEntry.status}</span>
              </div>
              {selectedEntry.used_against_order_id && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Used Against:</span>
                  <span className="font-bold text-[#FF7A00]">{selectedEntry.used_against_order_id}</span>
                </div>
              )}
              {selectedEntry.notes && (
                <div className="pt-1">
                  <span className="text-slate-500 block mb-1">Notes:</span>
                  <p className="p-2 bg-slate-50 rounded-lg text-slate-700 text-xs">
                    {selectedEntry.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
