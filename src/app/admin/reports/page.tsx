"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  BarChart2,
  Download,
  Calendar,
  TrendingUp,
  RotateCcw,
  ShoppingBag,
  DollarSign,
  FileSpreadsheet,
  RefreshCw,
  Truck,
  AlertTriangle,
  CheckCircle,
  Percent,
  ArrowUpRight,
  ShieldCheck,
  Layers,
} from "lucide-react";

interface PLRow {
  period: string;
  grossSales: number;
  cogs: number;
  shipping: number;
  rtoCharges: number;
  adSpend: number;
  other: number;
  netProfit: number;
  margin: string;
}

interface ProductProfitRow {
  name: string;
  sku: string;
  orders: number;
  revenue: number;
  cogs: number;
  netProfit: number;
  rtoCount: number;
  rtoRate: string;
}

interface CourierStat {
  courier: string;
  total: number;
  delivered: number;
  rto: number;
  rate: string;
}

interface ReasonStat {
  reason: string;
  count: number;
  percentage: string;
}

interface RTODiagnostics {
  topReason: string;
  topReasonPercent: string;
  bestCourier: string;
  bestCourierRate: string;
  recoveryRate: string;
  courierBreakdown?: CourierStat[];
  reasonsList?: ReasonStat[];
}

interface SummaryKPIs {
  totalRevenue: number;
  totalNetProfit: number;
  totalOrdersCount: number;
  avgMargin: string;
  totalRTOOrders: number;
}

export default function AdminReportsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [reportType, setReportType] = useState<"pl" | "product" | "rto">("pl");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [plData, setPlData] = useState<PLRow[]>([]);
  const [productData, setProductData] = useState<ProductProfitRow[]>([]);
  const [rtoDiagnostics, setRtoDiagnostics] = useState<RTODiagnostics>({
    topReason: "Customer Refused at Doorstep",
    topReasonPercent: "54%",
    bestCourier: "Delhivery Priority",
    bestCourierRate: "92.4%",
    recoveryRate: "98.2%",
    courierBreakdown: [],
    reasonsList: [],
  });
  const [summaryKPIs, setSummaryKPIs] = useState<SummaryKPIs>({
    totalRevenue: 0,
    totalNetProfit: 0,
    totalOrdersCount: 0,
    avgMargin: "0.0%",
    totalRTOOrders: 0,
  });

  const fetchReports = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      if (data.success) {
        setPlData(data.plData || []);
        setProductData(data.productData || []);
        if (data.rtoDiagnostics) {
          setRtoDiagnostics(data.rtoDiagnostics);
        }
        if (data.summaryKPIs) {
          setSummaryKPIs(data.summaryKPIs);
        }
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExport = () => {
    let headers: string[] = [];
    let rows: any[] = [];

    if (reportType === "pl") {
      headers = [
        "Period",
        "Gross Sales (INR)",
        "COGS (INR)",
        "Shipping Cost (INR)",
        "RTO Charges (INR)",
        "Ad Spend (INR)",
        "Overhead Expenses (INR)",
        "Net Profit (INR)",
        "Net Margin",
      ];
      rows = plData.map((d) => [
        `"${d.period}"`,
        d.grossSales,
        d.cogs,
        d.shipping,
        d.rtoCharges,
        d.adSpend,
        d.other,
        d.netProfit,
        `"${d.margin}"`,
      ]);
    } else if (reportType === "product") {
      headers = [
        "Product Name",
        "SKU",
        "Orders Sold",
        "Gross Revenue (INR)",
        "Supplier Cost (INR)",
        "Net Profit (INR)",
        "RTO Rate",
      ];
      rows = productData.map((d) => [
        `"${d.name.replace(/"/g, '""')}"`,
        `"${d.sku}"`,
        d.orders,
        d.revenue,
        d.cogs,
        d.netProfit,
        `"${d.rtoRate}"`,
      ]);
    } else {
      headers = ["Courier Partner", "Dispatches", "Delivered", "RTO Returns", "Delivery Rate"];
      rows = (rtoDiagnostics.courierBreakdown || []).map((c) => [
        `"${c.courier}"`,
        c.total,
        c.delivered,
        c.rto,
        `"${c.rate}"`,
      ]);
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `zupe_report_${reportType}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans">
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminHeader onOpenMobile={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* Top Title & Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Business Intelligence & Reports
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live BI
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Financial P&L statements, product margin analytics, and RTO return diagnostics computed from real live orders.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => fetchReports(true)}
                disabled={refreshing || loading}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
                <span>{refreshing ? "Refreshing..." : "Sync Live"}</span>
              </button>

              <button
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export ({reportType.toUpperCase()})</span>
              </button>
            </div>
          </div>

          {/* KPI Executive Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-blue-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Gross Revenue
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  ₹
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-slate-900">
                  ₹{summaryKPIs.totalRevenue.toLocaleString("en-IN")}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Realized customer orders</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-emerald-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Cumulative Net Profit
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-emerald-600">
                  ₹{summaryKPIs.totalNetProfit.toLocaleString("en-IN")}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                  <span>After COGS, courier & ad deductions</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-purple-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Overall Net Margin
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-purple-700">
                  {summaryKPIs.avgMargin}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-purple-600 font-medium">
                  <span>Operating store efficiency</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden group hover:border-amber-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Orders Audited
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-slate-900">
                  {summaryKPIs.totalOrdersCount} <span className="text-sm font-semibold text-slate-500">orders</span>
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-500 font-medium">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{summaryKPIs.totalRTOOrders} RTO / returns recorded</span>
                </div>
              </div>
            </div>
          </div>

          {/* Report Type Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            {[
              { id: "pl", label: "Profit & Loss (P&L)", icon: FileSpreadsheet },
              { id: "product", label: "Product Unit Economics", icon: ShoppingBag },
              { id: "rto", label: "RTO Diagnostics & Couriers", icon: RotateCcw },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setReportType(t.id as any)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    reportType === t.id
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200/90 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-600">
                Aggregating real financial statements from database...
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: P&L Statement */}
              {reportType === "pl" && (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        Monthly Profit & Loss Statement (P&L)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Monthly breakdown of net sales minus COGS, logistics, ad spend, and overheads.
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg self-start sm:self-auto">
                      {plData.length} Periods Calculated
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                      <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-5">Accounting Period</th>
                          <th className="py-3.5 px-4 text-right">Gross Sales</th>
                          <th className="py-3.5 px-4 text-right">COGS</th>
                          <th className="py-3.5 px-4 text-right">Shipping</th>
                          <th className="py-3.5 px-4 text-right">RTO Charges</th>
                          <th className="py-3.5 px-4 text-right">Ad Spend</th>
                          <th className="py-3.5 px-4 text-right">Overhead</th>
                          <th className="py-3.5 px-4 text-right">Net Profit</th>
                          <th className="py-3.5 px-5 text-right">Net Margin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {plData.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-slate-400">
                              No financial records found. Place orders to generate P&L statements.
                            </td>
                          </tr>
                        ) : (
                          plData.map((row) => (
                            <tr key={row.period} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-slate-400" />
                                  <span>{row.period}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-bold text-slate-900 text-right whitespace-nowrap">
                                ₹{row.grossSales.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 text-right whitespace-nowrap">
                                ₹{row.cogs.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 text-right whitespace-nowrap">
                                ₹{row.shipping.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-4 text-rose-600 text-right whitespace-nowrap">
                                ₹{row.rtoCharges.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-4 text-purple-600 text-right whitespace-nowrap">
                                ₹{row.adSpend.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-4 text-slate-500 text-right whitespace-nowrap">
                                ₹{row.other.toLocaleString("en-IN")}
                              </td>
                              <td className={`py-3.5 px-4 font-black text-right whitespace-nowrap ${
                                row.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"
                              }`}>
                                ₹{row.netProfit.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-5 text-right whitespace-nowrap">
                                <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-xs ${
                                  parseFloat(row.margin) >= 20
                                    ? "bg-emerald-50 text-emerald-700"
                                    : parseFloat(row.margin) > 0
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-rose-50 text-rose-700"
                                }`}>
                                  {row.margin}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: Product Unit Economics */}
              {reportType === "product" && (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        Product Profitability & Unit Economics
                      </h3>
                      <p className="text-xs text-slate-500">
                        Itemized gross revenue, supplier COGS, net contribution margin, and doorstep return rates.
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg self-start sm:self-auto">
                      {productData.length} Products Monitored
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                      <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-5">Product Name</th>
                          <th className="py-3.5 px-4">SKU</th>
                          <th className="py-3.5 px-4 text-center">Orders Sold</th>
                          <th className="py-3.5 px-4 text-right">Gross Revenue</th>
                          <th className="py-3.5 px-4 text-right">Supplier Cost (COGS)</th>
                          <th className="py-3.5 px-4 text-right">Est. Net Profit</th>
                          <th className="py-3.5 px-5 text-right">RTO Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {productData.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400">
                              No product sales recorded yet.
                            </td>
                          </tr>
                        ) : (
                          productData.map((p) => (
                            <tr key={p.sku} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                                {p.name}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-slate-500 text-xs whitespace-nowrap">
                                {p.sku}
                              </td>
                              <td className="py-3.5 px-4 text-center text-slate-800 whitespace-nowrap font-bold">
                                {p.orders}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-slate-900 text-right whitespace-nowrap">
                                ₹{p.revenue.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 text-right whitespace-nowrap">
                                ₹{p.cogs.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-emerald-600 text-right whitespace-nowrap">
                                ₹{p.netProfit.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-5 text-right whitespace-nowrap">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    parseFloat(p.rtoRate) <= 5
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : parseFloat(p.rtoRate) <= 12
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : "bg-rose-50 text-rose-700 border border-rose-200"
                                  }`}
                                >
                                  {p.rtoRate}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: RTO Diagnostics & Couriers */}
              {reportType === "rto" && (
                <div className="space-y-6">
                  {/* Top Insight Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Top Return Reason
                        </span>
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      </div>
                      <p className="text-lg font-bold text-slate-900">
                        {rtoDiagnostics.topReason}
                      </p>
                      <p className="text-xs text-slate-500">
                        Accounts for {rtoDiagnostics.topReasonPercent} of all recorded COD return events.
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Highest Delivering Partner
                        </span>
                        <Truck className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-lg font-bold text-emerald-700">
                        {rtoDiagnostics.bestCourier}
                      </p>
                      <p className="text-xs text-slate-500">
                        {rtoDiagnostics.bestCourierRate} delivery success rate across prepaid and COD routes.
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          RTO Credit Recovery Rate
                        </span>
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-lg font-bold text-blue-700">
                        {rtoDiagnostics.recoveryRate}
                      </p>
                      <p className="text-xs text-slate-500">
                        Supplier balance credited back for failed parcels via RTO Ledger.
                      </p>
                    </div>
                  </div>

                  {/* Courier Partner Performance Table */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          Courier Logistics Delivery Performance
                        </h3>
                        <p className="text-xs text-slate-500">
                          Live delivery conversion and failure rates by integrated 3PL partner.
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                        <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          <tr>
                            <th className="py-3.5 px-5">Courier Partner</th>
                            <th className="py-3.5 px-4 text-center">Total Dispatched</th>
                            <th className="py-3.5 px-4 text-center">Delivered</th>
                            <th className="py-3.5 px-4 text-center">RTO Returns</th>
                            <th className="py-3.5 px-4 text-center">Delivery Success Rate</th>
                            <th className="py-3.5 px-5 text-right">Route Health</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {(rtoDiagnostics.courierBreakdown && rtoDiagnostics.courierBreakdown.length > 0) ? (
                            rtoDiagnostics.courierBreakdown.map((c) => {
                              const successRateNum = parseFloat(c.rate) || 0;
                              return (
                                <tr key={c.courier} className="hover:bg-slate-50/70">
                                  <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-blue-600" />
                                    <span>{c.courier}</span>
                                  </td>
                                  <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                                    {c.total}
                                  </td>
                                  <td className="py-3.5 px-4 text-center font-semibold text-emerald-600">
                                    {c.delivered}
                                  </td>
                                  <td className="py-3.5 px-4 text-center font-semibold text-rose-600">
                                    {c.rto}
                                  </td>
                                  <td className="py-3.5 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${
                                            successRateNum >= 80 ? "bg-emerald-500" : successRateNum >= 60 ? "bg-amber-500" : "bg-rose-500"
                                          }`}
                                          style={{ width: `${Math.min(100, successRateNum)}%` }}
                                        />
                                      </div>
                                      <span className="font-bold text-slate-900">{c.rate}</span>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-5 text-right">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                      successRateNum >= 80
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-amber-100 text-amber-800"
                                    }`}>
                                      {successRateNum >= 80 ? "Optimal" : "Monitor NDR"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={6} className="py-6 text-center text-slate-400">
                                No courier dispatches recorded yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Return Reasons Distribution */}
                  {rtoDiagnostics.reasonsList && rtoDiagnostics.reasonsList.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                      <h4 className="font-bold text-slate-900 text-sm">
                        NDR & Doorstep Rejection Breakdown
                      </h4>
                      <div className="space-y-3">
                        {rtoDiagnostics.reasonsList.map((r) => (
                          <div key={r.reason} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                              <span>{r.reason}</span>
                              <span className="text-slate-500">{r.count} instances ({r.percentage})</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-rose-500 h-full rounded-full transition-all"
                                style={{ width: r.percentage }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
