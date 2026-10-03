"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export default function AdminReportsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [reportType, setReportType] = useState<"pl" | "product" | "rto">("pl");

  const plData = [
    { period: "October 2026", grossSales: 1485600, cogs: 580000, shipping: 118400, rtoCharges: 21500, adSpend: 284000, other: 65000, netProfit: 416700, margin: "28.1%" },
    { period: "September 2026", grossSales: 1240000, cogs: 495000, shipping: 102000, rtoCharges: 18400, adSpend: 245000, other: 58000, netProfit: 321600, margin: "25.9%" },
    { period: "August 2026", grossSales: 980000, cogs: 390000, shipping: 81000, rtoCharges: 14200, adSpend: 195000, other: 50000, netProfit: 249800, margin: "25.5%" },
  ];

  const productData = [
    { name: "Dynamic Water Ripple Night Light", sku: "ZUPE-LAMP-01", orders: 342, revenue: 222300, cogs: 102600, netProfit: 71820, rtoRate: "4.2%" },
    { name: "Mini Portable Steam Iron", sku: "ZUPE-IRON-02", orders: 284, revenue: 170116, cogs: 79520, netProfit: 53960, rtoRate: "3.8%" },
    { name: "Portable Menstrual Heating Pad", sku: "ZUPE-PAD-03", orders: 215, revenue: 171785, cogs: 75250, netProfit: 60200, rtoRate: "5.1%" },
    { name: "Foldable Mini Washing Machine", sku: "ZUPE-WASH-04", orders: 128, revenue: 230272, cogs: 96000, netProfit: 83200, rtoRate: "7.8%" },
    { name: "Pocket Thermal Mini Printer", sku: "ZUPE-PRINT-05", orders: 165, revenue: 164835, cogs: 66000, netProfit: 57750, rtoRate: "4.5%" },
  ];

  const handleExport = () => {
    let headers: string[] = [];
    let rows: any[] = [];

    if (reportType === "pl") {
      headers = ["Period", "Gross Sales", "COGS", "Shipping Cost", "RTO Charges", "Ad Spend", "Other Expenses", "Net Profit", "Margin"];
      rows = plData.map((d) => [d.period, d.grossSales, d.cogs, d.shipping, d.rtoCharges, d.adSpend, d.other, d.netProfit, d.margin]);
    } else {
      headers = ["Product Name", "SKU", "Orders", "Revenue", "COGS", "Net Profit", "RTO Rate"];
      rows = productData.map((d) => [d.name, d.sku, d.orders, d.revenue, d.cogs, d.netProfit, d.rtoRate]);
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zupe_report_${reportType}_${new Date().toISOString().split("T")[0]}.csv`);
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Business Intelligence & Reports
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Financial P&L statements, product margin analytics, and RTO return diagnostics.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export Report (CSV)</span>
              </button>
            </div>
          </div>

          {/* Report Type Tabs */}
          <div className="flex items-center gap-2">
            {[
              { id: "pl", label: "Profit & Loss (P&L)" },
              { id: "product", label: "Product Profitability" },
              { id: "rto", label: "RTO Diagnostics" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setReportType(t.id as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  reportType === t.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Report Content */}
          {reportType === "pl" && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">
                  Monthly Profit & Loss Statement (P&L)
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-5">Accounting Period</th>
                      <th className="py-3.5 px-4">Gross Sales</th>
                      <th className="py-3.5 px-4">COGS</th>
                      <th className="py-3.5 px-4">Shipping</th>
                      <th className="py-3.5 px-4">RTO Charges</th>
                      <th className="py-3.5 px-4">Ad Spend</th>
                      <th className="py-3.5 px-4">Other Overhead</th>
                      <th className="py-3.5 px-4">Net Profit</th>
                      <th className="py-3.5 px-4 text-right">Net Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {plData.map((row) => (
                      <tr key={row.period} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                          {row.period}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          ₹{row.grossSales.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          ₹{row.cogs.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          ₹{row.shipping.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-rose-600 whitespace-nowrap">
                          ₹{row.rtoCharges.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-purple-600 whitespace-nowrap">
                          ₹{row.adSpend.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          ₹{row.other.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600 whitespace-nowrap">
                          ₹{row.netProfit.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-slate-900 whitespace-nowrap">
                          {row.margin}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportType === "product" && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">
                  Product Profitability & Unit Economics
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-5">Product Name</th>
                      <th className="py-3.5 px-4">SKU</th>
                      <th className="py-3.5 px-4">Orders Sold</th>
                      <th className="py-3.5 px-4">Gross Revenue</th>
                      <th className="py-3.5 px-4">Supplier Cost</th>
                      <th className="py-3.5 px-4">Net Profit</th>
                      <th className="py-3.5 px-4 text-right">RTO Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {productData.map((p) => (
                      <tr key={p.sku} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                          {p.name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                          {p.sku}
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 whitespace-nowrap">
                          {p.orders}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          ₹{p.revenue.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          ₹{p.cogs.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600 whitespace-nowrap">
                          ₹{p.netProfit.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                          {p.rtoRate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportType === "rto" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base">
                RTO Diagnostics & Mitigation Insights
              </h3>
              <p className="text-xs text-slate-500">
                Identify why packages are returning and isolate high-risk couriers or destinations.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-600 uppercase">Top Return Reason</span>
                  <p className="text-base font-bold text-slate-900">Doorstep Customer Refusal</p>
                  <p className="text-xs text-slate-500">Accounts for 54% of all COD return events.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-600 uppercase">Highest Delivering Partner</span>
                  <p className="text-base font-bold text-emerald-700">Bluedart Priority</p>
                  <p className="text-xs text-slate-500">92.4% delivery success rate on prepaid and COD.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-600 uppercase">RTO Credit Recovery Rate</span>
                  <p className="text-base font-bold text-blue-700">98.2% Recovered</p>
                  <p className="text-xs text-slate-500">Supplier credits successfully credited and offset.</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
