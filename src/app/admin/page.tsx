"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import Link from "next/link";
import {
  ShoppingBag,
  TrendingUp,
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  DollarSign,
  CreditCard,
  Percent,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  ChevronRight,
  Calendar,
  Sparkles,
  BarChart3,
  Layers,
  Activity,
  Award,
  Clock,
} from "lucide-react";
import { ERPOrder } from "@/lib/erpStore";

// ==========================================
// SMOOTH NUMBER COUNT-UP INTRO ANIMATION
// ==========================================
function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  isCurrency = false,
  duration = 900,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  isCurrency?: boolean;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animId: number;
    const startVal = 0;
    const endVal = Number(value) || 0;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out exponential curve: 1 - 2^(-10 * progress)
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startVal + (endVal - startVal) * ease;

      setDisplayValue(current);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setDisplayValue(endVal);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [value, duration]);

  const formatted = isCurrency
    ? Math.round(displayValue).toLocaleString("en-IN")
    : decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString("en-IN");

  return <span>{prefix}{formatted}{suffix}</span>;
}

// Chart Point Interface
interface ChartPoint {
  label: string;
  sales: number;
  netProfit: number;
  orders: number;
  margin: number;
}

export default function AdminDashboardPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [timeframe, setTimeframe] = useState<"today" | "weekly" | "monthly" | "yearly" | "custom">("monthly");
  const [customStartDate, setCustomStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [customEndDate, setCustomEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [chartViewMode, setChartViewMode] = useState<"dual" | "margin">("dual");
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);

  const [kpis, setKpis] = useState<{
    totalOrders: number;
    confirmedOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    ndrOrders: number;
    rtoOrders: number;
    totalSales: number;
    productCosts: number;
    shippingCosts: number;
    rtoCharges: number;
    adSpend: number;
    otherExpenses: number;
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
    rtoPercentage: number;
    pendingCODRemittance: number;
    totalRTOBalance: number;
    chartData?: ChartPoint[];
  }>({
    totalOrders: 29,
    confirmedOrders: 25,
    shippedOrders: 4,
    deliveredOrders: 6,
    ndrOrders: 1,
    rtoOrders: 3,
    totalSales: 33512,
    productCosts: 13974,
    shippingCosts: 2260,
    rtoCharges: 125,
    adSpend: 4500,
    otherExpenses: 9169,
    grossProfit: 19538,
    netProfit: 3484,
    profitMargin: 10.4,
    rtoPercentage: 10.3,
    pendingCODRemittance: 7794,
    totalRTOBalance: 8320,
    chartData: [],
  });

  const [recentOrders, setRecentOrders] = useState<ERPOrder[]>([]);

  const loadDashboardData = async () => {
    setIsRefreshing(true);
    try {
      let statsUrl = `/api/admin/dashboard/stats?timeframe=${timeframe}`;
      if (timeframe === "custom") {
        statsUrl += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      }
      const [statsRes, ordersRes] = await Promise.all([
        fetch(statsUrl, { cache: "no-store" }),
        fetch("/api/admin/orders", { cache: "no-store" }),
      ]);
      const statsData = await statsRes.json();
      const ordersData = await ordersRes.json();

      if (statsData.success && statsData.kpis) {
        setKpis(statsData.kpis);
      }
      if (ordersData.success && Array.isArray(ordersData.orders)) {
        setRecentOrders(ordersData.orders.slice(0, 6));
      }
    } catch (err) {
      console.warn("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 15000);
    const onFocus = () => loadDashboardData();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [timeframe, customStartDate, customEndDate]);

  const triggerShopifySync = async () => {
    setSyncStatus("Syncing Shopify orders...");
    try {
      const res = await fetch("/api/admin/sync/shopify");
      const data = await res.json();
      setSyncStatus(data.message || "Shopify synced!");
      setTimeout(() => setSyncStatus(null), 4000);
      loadDashboardData();
    } catch (err) {
      setSyncStatus("Shopify sync failed");
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  const triggerShiprocketSync = async () => {
    setSyncStatus("Syncing Shiprocket tracking & NDR/RTO...");
    try {
      const res = await fetch("/api/admin/sync/shiprocket");
      const data = await res.json();
      setSyncStatus(data.message || "Shiprocket synced!");
      setTimeout(() => setSyncStatus(null), 4000);
      loadDashboardData();
    } catch (err) {
      setSyncStatus("Shiprocket sync failed");
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  // Derive points for chart
  const chartPoints: ChartPoint[] = (kpis.chartData && kpis.chartData.length > 0)
    ? kpis.chartData
    : [
        { label: "Oct 01 - 05", sales: 8200, netProfit: 1420, orders: 7, margin: 17.3 },
        { label: "Oct 06 - 10", sales: 11450, netProfit: 2180, orders: 10, margin: 19.0 },
        { label: "Oct 11 - 15", sales: 9860, netProfit: 1790, orders: 8, margin: 18.2 },
        { label: "Oct 16 - 20", sales: 4002, netProfit: 890, orders: 4, margin: 22.2 },
      ];

  const maxSalesVal = Math.max(...chartPoints.map((p) => p.sales), 1000);
  const peakPoint = [...chartPoints].sort((a, b) => b.sales - a.sales)[0] || chartPoints[0];
  const bestMarginPoint = [...chartPoints].sort((a, b) => b.margin - a.margin)[0] || chartPoints[0];

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans">
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminHeader
          onOpenMobile={() => setMobileSidebarOpen(true)}
          onRefresh={loadDashboardData}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* Top Banner & Quick Sync */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Operations & Profit Command Center
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-[#FF7A00] border border-orange-200">
                  Live Edge Sync
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Real-time Shopify orders, Shiprocket logistics tracking, COD remittance & double-entry supplier credit ledger.
              </p>
              {syncStatus && (
                <div className="mt-2 text-xs font-semibold text-[#FF7A00] flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{syncStatus}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={triggerShopifySync}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sync Shopify</span>
              </button>

              <button
                onClick={triggerShiprocketSync}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
              >
                <Truck className="w-3.5 h-3.5 text-orange-500" />
                <span>Sync Shiprocket</span>
              </button>

              <Link
                href="/admin/rto-refund-balance"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm shadow-orange-500/25"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>
                  RTO Balance (
                  <AnimatedCounter isCurrency value={kpis.totalRTOBalance} prefix="₹" />
                  )
                </span>
              </Link>
            </div>
          </div>

          {/* Timeframe Selector Pills & Custom Date Range */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              {[
                { id: "today", label: "Today" },
                { id: "weekly", label: "This Week" },
                { id: "monthly", label: "This Month" },
                { id: "yearly", label: "This Year" },
                { id: "custom", label: "Custom Range" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setTimeframe(p.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    timeframe === p.id
                      ? "bg-[#FF7A00] text-white shadow-sm shadow-orange-500/20"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {timeframe === "custom" && (
              <div className="flex flex-wrap items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200/90 shadow-sm text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-500">From:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-[#FF7A00]"
                />
                <span className="font-semibold text-slate-500">To:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-[#FF7A00]"
                />
                <button
                  onClick={loadDashboardData}
                  className="px-3 py-1 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-lg font-semibold text-xs transition-all shadow-sm shadow-orange-500/20"
                >
                  Apply Filter
                </button>
              </div>
            )}
          </div>

          {/* Awaiting WhatsApp Confirmation Alert Banner */}
          {recentOrders.some((o) => o.whatsapp_confirm_status === "pending_whatsapp") && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                    <span>
                      {recentOrders.filter((o) => o.whatsapp_confirm_status === "pending_whatsapp").length} Order(s) Awaiting WhatsApp Confirmation
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                      Pending Action
                    </span>
                  </h3>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Customers received the WhatsApp verification message. Pack & dispatch unlocks once customers tap "Confirm Order" or when you manually verify.
                  </p>
                </div>
              </div>
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 self-start sm:self-center cursor-pointer"
              >
                <span>View Pending Orders</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Order Funnel KPI Cards (Module 1) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:border-orange-200 transition-all">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Orders
              </span>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                <AnimatedCounter value={kpis.totalOrders} />
              </p>
              <span className="text-[11px] text-[#FF7A00] font-semibold flex items-center mt-1">
                <ShoppingBag className="w-3 h-3 mr-1" /> 100% Volume
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:border-emerald-200 transition-all">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Confirmed
              </span>
              <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">
                <AnimatedCounter value={kpis.confirmedOrders} />
              </p>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                Ready / Packed
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:border-sky-200 transition-all">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Shipped
              </span>
              <p className="text-xl sm:text-2xl font-bold text-sky-700 mt-1">
                <AnimatedCounter value={kpis.shippedOrders} />
              </p>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                In Courier Transit
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:border-emerald-200 transition-all">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Delivered
              </span>
              <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">
                <AnimatedCounter value={kpis.deliveredOrders} />
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center mt-1">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                <AnimatedCounter
                  value={kpis.totalOrders > 0 ? (kpis.deliveredOrders / kpis.totalOrders) * 100 : 0}
                  decimals={1}
                  suffix="% Delivery"
                />
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:border-amber-200 transition-all">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                NDR Orders
              </span>
              <p className="text-xl sm:text-2xl font-bold text-amber-600 mt-1">
                <AnimatedCounter value={kpis.ndrOrders} />
              </p>
              <span className="text-[11px] text-amber-700 font-semibold flex items-center mt-1">
                <AlertTriangle className="w-3 h-3 mr-1" /> Action Required
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:border-rose-200 transition-all">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                RTO Orders
              </span>
              <p className="text-xl sm:text-2xl font-bold text-rose-600 mt-1">
                <AnimatedCounter value={kpis.rtoOrders} />
              </p>
              <span className="text-[11px] text-rose-600 font-semibold flex items-center mt-1">
                <RotateCcw className="w-3 h-3 mr-1" />
                <AnimatedCounter value={kpis.rtoPercentage} decimals={1} suffix="% RTO Rate" />
              </span>
            </div>
          </div>

          {/* Financial Intelligence: 2x2 KPI Cards (Left) + Compact Animated Bar Graph (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
            {/* LEFT SIDE: 2x2 Primary Financial KPI Cards (col-span-5) */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {/* Card 1: Total Sales Revenue */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm hover:border-orange-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Total Sales Revenue
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF7A00] flex items-center justify-center">
                    <DollarSign className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className="my-2">
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    <AnimatedCounter isCurrency value={kpis.totalSales} prefix="₹" />
                  </p>
                </div>
                <div className="text-[11px] text-slate-500">
                  <span>Gross sales from all orders</span>
                </div>
              </div>

              {/* Card 2: Gross Profit */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Gross Profit (Sales - COGS)
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className="my-2">
                  <p className="text-xl sm:text-2xl font-bold text-emerald-600 tracking-tight">
                    <AnimatedCounter isCurrency value={kpis.grossProfit} prefix="₹" />
                  </p>
                </div>
                <div className="text-[11px] text-slate-500">
                  <span>COGS: <AnimatedCounter isCurrency value={kpis.productCosts} prefix="₹" /></span>
                </div>
              </div>

              {/* Card 3: True Net Profit */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-emerald-500/30 bg-gradient-to-br from-white to-emerald-50/40 shadow-sm hover:border-emerald-500 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                    True Net Profit
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className="my-2">
                  <p className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
                    <AnimatedCounter isCurrency value={kpis.netProfit} prefix="₹" />
                  </p>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-800">
                    <AnimatedCounter value={kpis.profitMargin} decimals={1} suffix="% Profit Margin" />
                  </span>
                  <span className="text-slate-500">After Ads & Logistics</span>
                </div>
              </div>

              {/* Card 4: Pending COD Remittance */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Pending COD Remittance
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className="my-2">
                  <p className="text-xl sm:text-2xl font-bold text-amber-600 tracking-tight">
                    <AnimatedCounter isCurrency value={kpis.pendingCODRemittance} prefix="₹" />
                  </p>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Held by couriers</span>
                  <Link
                    href="/admin/payments"
                    className="text-[#FF7A00] font-semibold hover:underline"
                  >
                    Reconcile →
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Compact Animated Bar Graph (col-span-7) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-3">
              {/* Graph Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                      Sales & Profit Velocity
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-[#FF7A00] border border-orange-200">
                      <BarChart3 className="w-3 h-3" />
                      Live BI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Gross revenue vs. net retained earnings
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2.5 text-[11px] font-medium mr-1">
                    <span className="flex items-center gap-1 text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-[#FF7A00] to-[#FFA742]" />
                      <span>Sales</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-[#10B981] to-[#34D399]" />
                      <span>Profit</span>
                    </span>
                  </div>

                  <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-[11px] font-semibold">
                    <button
                      onClick={() => setChartViewMode("dual")}
                      className={`px-2.5 py-0.5 rounded-md transition-all ${
                        chartViewMode === "dual"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Dual Bar
                    </button>
                    <button
                      onClick={() => setChartViewMode("margin")}
                      className={`px-2.5 py-0.5 rounded-md transition-all ${
                        chartViewMode === "margin"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Margin %
                    </button>
                  </div>
                </div>
              </div>

              {/* The Compact Visual Bar Chart Container */}
              <div className="relative pt-3 pb-1">
                {/* Background Horizontal Grid Lines */}
                <div className="absolute inset-x-0 top-3 bottom-7 flex flex-col justify-between pointer-events-none opacity-40">
                  <div className="border-b border-dashed border-slate-200 w-full flex justify-end">
                    <span className="text-[9px] text-slate-400 font-mono pr-1 -mt-2">
                      ₹{maxSalesVal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="border-b border-dashed border-slate-200 w-full flex justify-end">
                    <span className="text-[9px] text-slate-400 font-mono pr-1 -mt-2">
                      ₹{Math.round(maxSalesVal * 0.5).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="border-b border-slate-200 w-full flex justify-end">
                    <span className="text-[9px] text-slate-400 font-mono pr-1 -mt-2">₹0</span>
                  </div>
                </div>

                {/* Bar Columns Container */}
                <div className="relative z-10 flex items-end justify-around h-36 sm:h-40 px-2 sm:px-4 gap-2 sm:gap-3">
                  {chartPoints.map((pt, idx) => {
                    const salesHeightPct = maxSalesVal > 0 ? Math.min(100, Math.round((pt.sales / maxSalesVal) * 100)) : 0;
                    const profitHeightPct = maxSalesVal > 0 ? Math.min(100, Math.max(0, Math.round((pt.netProfit / maxSalesVal) * 100))) : 0;
                    const marginHeightPct = Math.min(100, Math.max(0, Math.round(pt.margin * 3.2)));

                    const isHovered = hoveredPoint?.label === pt.label;

                    return (
                      <div
                        key={pt.label}
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        className="flex-1 max-w-[85px] flex flex-col items-center h-full justify-end group cursor-pointer relative"
                      >
                        {/* Floating Tooltip */}
                        {isHovered && (
                          <div className="absolute -top-20 z-30 bg-slate-900 text-white rounded-xl px-3 py-2 shadow-2xl text-[11px] w-40 pointer-events-none transform -translate-x-1/2 left-1/2 animate-in fade-in zoom-in-95 duration-150">
                            <p className="font-bold text-slate-200 border-b border-slate-700/60 pb-1 mb-1 flex items-center justify-between text-[10px]">
                              <span>{pt.label}</span>
                              <span className="text-slate-400">{pt.orders} orders</span>
                            </p>
                            <div className="space-y-0.5">
                              <div className="flex justify-between items-center text-slate-300">
                                <span className="text-[#FFA742]">Sales:</span>
                                <span className="font-bold text-white">₹{pt.sales.toLocaleString("en-IN")}</span>
                              </div>
                              <div className="flex justify-between items-center text-slate-300">
                                <span className="text-[#34D399]">Profit:</span>
                                <span className="font-bold text-emerald-400">₹{pt.netProfit.toLocaleString("en-IN")}</span>
                              </div>
                              <div className="flex justify-between items-center text-slate-300 border-t border-slate-800 pt-0.5">
                                <span className="text-purple-300">Margin:</span>
                                <span className="font-bold text-purple-300">{pt.margin}%</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Bar Visuals */}
                        {chartViewMode === "dual" ? (
                          <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-[85%]">
                            {/* Sales Bar */}
                            <div
                              className="w-1/2 rounded-t bg-gradient-to-t from-[#FF7A00] to-[#FFA742] shadow-sm transition-all duration-700 ease-out group-hover:brightness-110 relative"
                              style={{
                                height: `${salesHeightPct}%`,
                                minHeight: pt.sales > 0 ? "5px" : "0px",
                                transitionDelay: `${idx * 45}ms`,
                              }}
                            />

                            {/* Profit Bar */}
                            <div
                              className={`w-1/2 rounded-t transition-all duration-700 ease-out group-hover:brightness-110 relative ${
                                pt.netProfit >= 0
                                  ? "bg-gradient-to-t from-[#10B981] to-[#34D399]"
                                  : "bg-gradient-to-t from-rose-500 to-rose-400"
                              }`}
                              style={{
                                height: `${profitHeightPct}%`,
                                minHeight: pt.netProfit !== 0 ? "5px" : "0px",
                                transitionDelay: `${idx * 45 + 20}ms`,
                              }}
                            />
                          </div>
                        ) : (
                          /* Margin % Mode Bar */
                          <div className="w-full flex items-end justify-center h-[85%]">
                            <div
                              className={`w-1/2 rounded-t transition-all duration-700 ease-out group-hover:brightness-110 relative ${
                                pt.margin >= 20
                                  ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                                  : pt.margin >= 10
                                  ? "bg-gradient-to-t from-[#FF7A00] to-[#FFA742]"
                                  : "bg-gradient-to-t from-rose-500 to-rose-400"
                              }`}
                              style={{
                                height: `${marginHeightPct}%`,
                                minHeight: "6px",
                                transitionDelay: `${idx * 45}ms`,
                              }}
                            >
                              <span className="hidden sm:group-hover:block absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-700 whitespace-nowrap">
                                {pt.margin}%
                              </span>
                            </div>
                          </div>
                        )}

                        {/* X-Axis Interval Label */}
                        <div className="w-full text-center pt-1.5 border-t border-slate-200">
                          <span className="text-[10px] font-semibold text-slate-600 group-hover:text-[#FF7A00] transition-colors block truncate">
                            {pt.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Compact Quick Executive Insights Footer */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-orange-50/70 border border-orange-100">
                  <Award className="w-3.5 h-3.5 text-[#FF7A00] shrink-0" />
                  <div className="truncate">
                    <span className="text-slate-500 block text-[10px]">Peak Interval:</span>
                    <span className="font-bold text-slate-900 block truncate">
                      {peakPoint.label} (₹{peakPoint.sales.toLocaleString("en-IN")})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <div className="truncate">
                    <span className="text-slate-500 block text-[10px]">Best Margin:</span>
                    <span className="font-bold text-emerald-800 block truncate">
                      {bestMarginPoint.label} ({bestMarginPoint.margin}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Expenses Breakdown Bar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Cost Structure Breakdown (
              <AnimatedCounter
                isCurrency
                value={kpis.productCosts + kpis.shippingCosts + kpis.rtoCharges + kpis.adSpend + kpis.otherExpenses}
                prefix="₹"
              /> Total Outflow)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Product Costs (COGS)</span>
                <span className="text-base font-bold text-slate-900 block mt-0.5">
                  <AnimatedCounter isCurrency value={kpis.productCosts} prefix="₹" />
                </span>
              </div>

              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100">
                <span className="text-sky-700 block">Shiprocket Shipping</span>
                <span className="text-base font-bold text-sky-900 block mt-0.5">
                  <AnimatedCounter isCurrency value={kpis.shippingCosts} prefix="₹" />
                </span>
              </div>

              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
                <span className="text-rose-700 block">RTO Reverse Charges</span>
                <span className="text-base font-bold text-rose-900 block mt-0.5">
                  <AnimatedCounter isCurrency value={kpis.rtoCharges} prefix="₹" />
                </span>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                <span className="text-purple-700 block">Meta Ads Spend</span>
                <span className="text-base font-bold text-purple-900 block mt-0.5">
                  <AnimatedCounter isCurrency value={kpis.adSpend} prefix="₹" />
                </span>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                <span className="text-amber-700 block">Software & Other</span>
                <span className="text-base font-bold text-amber-900 block mt-0.5">
                  <AnimatedCounter isCurrency value={kpis.otherExpenses} prefix="₹" />
                </span>
              </div>
            </div>
          </div>

          {/* Recent Orders Snapshot */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Live Operations & Order Flow
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synced in real time across Shopify, Shiprocket & Cloudflare D1
                </p>
              </div>

              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#FF7A00] hover:text-[#E66E00]"
              >
                <span>View All Orders</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/70">
                  <tr>
                    <th className="py-3 px-5">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Courier & AWB</th>
                    <th className="py-3 px-4">Delivery Status</th>
                    <th className="py-3 px-4">Selling Price</th>
                    <th className="py-3 px-4">Net Profit</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-5 font-bold text-[#FF7A00] whitespace-nowrap">
                        {ord.shopify_order_id}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-900">{ord.customer_name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-[11px] text-slate-400">{ord.customer_phone}</p>
                          {(() => {
                            let itemsList: any[] = [];
                            if (Array.isArray(ord.items)) itemsList = ord.items;
                            else if (typeof ord.items === "string") {
                              try { itemsList = JSON.parse(ord.items); } catch { itemsList = []; }
                            }
                            const hasBundle = itemsList.some((it) => (it.bundle_tier && Number(it.bundle_tier) > 1) || it.offer_label);
                            if (!hasBundle) return null;
                            return (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-orange-100 text-[#E65100]">
                                ✨ Save More
                              </span>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                            ord.payment_method === "COD" || (ord.payment_method && ord.payment_method.toLowerCase().includes("cash"))
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {ord.payment_method}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-800">{ord.courier_partner || "Delhivery"}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{ord.shiprocket_awb || "AWB Pending"}</p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {ord.whatsapp_confirm_status === "pending_whatsapp" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-600" /> Awaiting WA
                          </span>
                        ) : (ord.whatsapp_confirm_status === "cancelled" || ord.delivery_status === "Cancelled" || ord.status === "Cancelled") ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Cancelled
                          </span>
                        ) : ord.delivery_status === "Delivered" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Delivered
                          </span>
                        ) : ord.delivery_status === "In Transit" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-600" /> In Transit
                          </span>
                        ) : ord.delivery_status === "NDR" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" /> NDR (Action)
                          </span>
                        ) : ord.delivery_status === "RTO Delivered" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> RTO Delivered
                          </span>
                        ) : ord.delivery_status === "Out for Delivery" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" /> Out for Delivery
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Processing
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        ₹{ord.total_amount}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`font-bold ${
                            ord.net_profit >= 0 ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {ord.net_profit >= 0 ? `+₹${ord.net_profit}` : `-₹${Math.abs(ord.net_profit)}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href="/admin/orders"
                          className="text-xs font-semibold text-[#FF7A00] hover:underline"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
