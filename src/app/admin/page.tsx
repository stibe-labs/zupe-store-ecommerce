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
} from "lucide-react";
import { ERPOrder } from "@/lib/erpStore";

export default function AdminDashboardPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [timeframe, setTimeframe] = useState<"today" | "weekly" | "monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const [kpis, setKpis] = useState({
    totalOrders: 1248,
    confirmedOrders: 1180,
    shippedOrders: 142,
    deliveredOrders: 980,
    ndrOrders: 28,
    rtoOrders: 64,
    totalSales: 1485600,
    productCosts: 580000,
    shippingCosts: 118400,
    rtoCharges: 21500,
    adSpend: 284000,
    otherExpenses: 65000,
    grossProfit: 905600,
    netProfit: 416700,
    profitMargin: 28.1,
    rtoPercentage: 5.1,
    pendingCODRemittance: 84600,
    totalRTOBalance: 7500,
  });

  const [recentOrders, setRecentOrders] = useState<ERPOrder[]>([]);

  const loadDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/dashboard/stats"),
        fetch("/api/admin/orders"),
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
  }, [timeframe]);

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
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Live Edge Sync
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Real-time Shopify orders, Shiprocket logistics tracking, COD remittance & double-entry supplier credit ledger.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {syncStatus && (
                <div className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 animate-pulse">
                  {syncStatus}
                </div>
              )}

              <button
                onClick={triggerShopifySync}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sync Shopify</span>
              </button>

              <button
                onClick={triggerShiprocketSync}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 transition-all"
              >
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                <span>Sync Shiprocket</span>
              </button>

              <Link
                href="/admin/rto-refund-balance"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RTO Balance (₹{kpis.totalRTOBalance.toLocaleString("en-IN")})</span>
              </Link>
            </div>
          </div>

          {/* Timeframe Selector Pills */}
          <div className="flex items-center gap-2">
            {[
              { id: "today", label: "Today" },
              { id: "weekly", label: "This Week" },
              { id: "monthly", label: "This Month" },
              { id: "yearly", label: "This Year" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setTimeframe(p.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  timeframe === p.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Order Funnel KPI Cards (Module 1) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Orders
              </span>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {kpis.totalOrders}
              </p>
              <span className="text-[11px] text-blue-600 font-semibold flex items-center mt-1">
                <ShoppingBag className="w-3 h-3 mr-1" /> 100% Volume
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Confirmed
              </span>
              <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">
                {kpis.confirmedOrders}
              </p>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                Ready / Packed
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Shipped
              </span>
              <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">
                {kpis.shippedOrders}
              </p>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                In Courier Transit
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Delivered
              </span>
              <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">
                {kpis.deliveredOrders}
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center mt-1">
                <CheckCircle2 className="w-3 h-3 mr-1" /> 78.5% Delivery
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                NDR Orders
              </span>
              <p className="text-xl sm:text-2xl font-bold text-amber-600 mt-1">
                {kpis.ndrOrders}
              </p>
              <span className="text-[11px] text-amber-700 font-semibold flex items-center mt-1">
                <AlertTriangle className="w-3 h-3 mr-1" /> Action Required
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                RTO Orders
              </span>
              <p className="text-xl sm:text-2xl font-bold text-rose-600 mt-1">
                {kpis.rtoOrders}
              </p>
              <span className="text-[11px] text-rose-600 font-semibold flex items-center mt-1">
                <RotateCcw className="w-3 h-3 mr-1" /> {kpis.rtoPercentage}% RTO Rate
              </span>
            </div>
          </div>

          {/* Financial Breakdown & True Profitability Engine */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Total Sales */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Sales Revenue
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">
                ₹{kpis.totalSales.toLocaleString("en-IN")}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                <span>Gross sales from all orders</span>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Gross Profit (Sales - COGS)
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2 tracking-tight">
                ₹{kpis.grossProfit.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                COGS: ₹{kpis.productCosts.toLocaleString("en-IN")}
              </p>
            </div>

            {/* Net Profit */}
            <div className="bg-white rounded-2xl p-5 border-2 border-emerald-500/30 bg-gradient-to-br from-white to-emerald-50/40 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  True Net Profit
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2 tracking-tight">
                ₹{kpis.netProfit.toLocaleString("en-IN")}
              </p>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="font-bold text-emerald-800">
                  {kpis.profitMargin}% Profit Margin
                </span>
                <span className="text-slate-500">After Ads & Logistics</span>
              </div>
            </div>

            {/* Pending COD Remittance */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pending COD Remittance
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-amber-600 mt-2 tracking-tight">
                ₹{kpis.pendingCODRemittance.toLocaleString("en-IN")}
              </p>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-slate-500">Held by couriers</span>
                <Link
                  href="/admin/payments"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Reconcile →
                </Link>
              </div>
            </div>
          </div>

          {/* Operational Expenses Breakdown Bar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Cost Structure Breakdown (₹{(kpis.productCosts + kpis.shippingCosts + kpis.rtoCharges + kpis.adSpend + kpis.otherExpenses).toLocaleString("en-IN")} Total Outflow)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Product Costs (COGS)</span>
                <span className="text-base font-bold text-slate-900 block mt-0.5">
                  ₹{kpis.productCosts.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <span className="text-blue-700 block">Shiprocket Shipping</span>
                <span className="text-base font-bold text-blue-900 block mt-0.5">
                  ₹{kpis.shippingCosts.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
                <span className="text-rose-700 block">RTO Reverse Charges</span>
                <span className="text-base font-bold text-rose-900 block mt-0.5">
                  ₹{kpis.rtoCharges.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                <span className="text-purple-700 block">Meta Ads Spend</span>
                <span className="text-base font-bold text-purple-900 block mt-0.5">
                  ₹{kpis.adSpend.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                <span className="text-amber-700 block">Software & Other</span>
                <span className="text-base font-bold text-amber-900 block mt-0.5">
                  ₹{kpis.otherExpenses.toLocaleString("en-IN")}
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
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700"
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
                      <td className="py-3.5 px-5 font-bold text-blue-600 whitespace-nowrap">
                        {ord.shopify_order_id}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-900">{ord.customer_name}</p>
                        <p className="text-[11px] text-slate-400">{ord.customer_phone}</p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${
                            ord.payment_method === "COD"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {ord.payment_method}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-800">{ord.courier_partner || "Delhivery"}</p>
                        <p className="text-[11px] text-blue-600 font-mono">{ord.shiprocket_awb || "AWB Pending"}</p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {ord.delivery_status === "Delivered" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Delivered
                          </span>
                        )}
                        {ord.delivery_status === "In Transit" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> In Transit
                          </span>
                        )}
                        {ord.delivery_status === "NDR" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" /> NDR (Action)
                          </span>
                        )}
                        {ord.delivery_status === "RTO Delivered" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> RTO Delivered
                          </span>
                        )}
                        {ord.delivery_status === "Out for Delivery" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" /> Out for Delivery
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
                          className="text-xs font-semibold text-blue-600 hover:underline"
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
