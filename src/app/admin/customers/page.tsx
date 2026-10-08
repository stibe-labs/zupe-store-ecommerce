"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import Link from "next/link";
import {
  UserCheck,
  Search,
  Phone,
  Mail,
  MapPin,
  X,
  Download,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  shipping_address: string;
  ordersCount: number;
  totalSpend: number;
  rtoCount: number;
  rtoRate: number;
  lastOrderDate: string;
  recentOrders: {
    id: string;
    shopify_order_id: string;
    total_amount: number;
    delivery_status: string;
    created_at: string;
  }[];
}

export default function AdminCustomersPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [metrics, setMetrics] = useState({
    totalCustomers: 5,
    repeatCustomers: 4,
    repeatRate: 80.0,
    avgLtv: 3836,
    cleanCustomers: 4,
    rtoRiskCustomers: 1,
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  const fetchCustomers = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      if (data.success && Array.isArray(data.customers)) {
        setCustomers(data.customers);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.warn("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Lock background scroll when modals are open
  useEffect(() => {
    if (selectedCustomer) {
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
  }, [selectedCustomer]);

  const handleExportCSV = () => {
    const headers = [
      "Customer Name",
      "Phone",
      "Email",
      "Location / City",
      "Total Orders",
      "Lifetime Spend (INR)",
      "RTO Returns",
      "RTO Rate (%)",
      "Last Order Date",
    ];

    const rows = customers.map((c) => [
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${c.city}"`,
      c.ordersCount,
      c.totalSpend,
      c.rtoCount,
      `${c.rtoRate}%`,
      `"${c.lastOrderDate}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zupe_customers_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = customers.filter((c) => {
    if (segmentFilter === "repeat" && c.ordersCount <= 1) return false;
    if (segmentFilter === "high_value" && c.totalSpend < 3000) return false;
    if (segmentFilter === "clean" && c.rtoCount > 0) return false;
    if (segmentFilter === "rto_risk" && c.rtoRate < 25) return false;

    if (search.trim()) {
      const s = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(s) ||
        c.phone.includes(s) ||
        c.email.toLowerCase().includes(s) ||
        c.city.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans">
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminHeader
          onOpenMobile={() => setMobileSidebarOpen(true)}
          onRefresh={fetchCustomers}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Customer Intelligence & LTV
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Real profiles, lifetime purchases, repeat rates, and doorstep delivery reliability scores.
              </p>
            </div>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Customers (CSV)</span>
            </button>
          </div>

          {/* Customer KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Unique Customers
              </span>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight">
                {metrics.totalCustomers}
              </p>
              <span className="text-xs text-slate-500 mt-1 block">
                Shoppers from store checkouts
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Repeat Buyer Rate
              </span>
              <p className="text-2xl sm:text-3xl font-bold text-[#FA521C] mt-2 tracking-tight">
                {metrics.repeatRate}%
              </p>
              <span className="text-xs text-slate-500 mt-1 block">
                {metrics.repeatCustomers} customers placed 2+ orders
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Average Customer LTV
              </span>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2 tracking-tight">
                ₹{metrics.avgLtv.toLocaleString("en-IN")}
              </p>
              <span className="text-xs text-slate-500 mt-1 block">
                Lifetime spend per customer
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Doorstep Reliability
              </span>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-2 tracking-tight">
                {metrics.cleanCustomers} / {metrics.totalCustomers}
              </p>
              <span className="text-xs text-emerald-700 font-semibold mt-1 block">
                Clean accounts with 0% RTO rate
              </span>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, phone, email, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200/60"
                  aria-label="Clear customer search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <select
                value={segmentFilter}
                onChange={(e) => setSegmentFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium"
              >
                <option value="all">All Segments</option>
                <option value="repeat">Repeat Buyers (2+ orders)</option>
                <option value="high_value">High Value (₹3,000+)</option>
                <option value="clean">Clean (0% RTO)</option>
                <option value="rto_risk">RTO Risk (≥25% RTO)</option>
              </select>
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-5">Customer</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Total Orders</th>
                    <th className="py-3.5 px-4">Lifetime Spend</th>
                    <th className="py-3.5 px-4">Delivery Track Record</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No customers found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                          {c.name}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-semibold text-[#FA521C]">{c.phone || "No phone"}</p>
                          <p className="text-[11px] text-slate-400">{c.email || "No email"}</p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          {c.city}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                          {c.ordersCount} orders
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          ₹{c.totalSpend.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              c.rtoCount === 0
                                ? "bg-emerald-100 text-emerald-700"
                                : c.rtoRate < 35
                                ? "bg-amber-100 text-amber-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {c.rtoCount === 0 ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>100% Reliable (0% RTO)</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3 h-3" />
                                <span>{c.rtoRate}% RTO ({c.rtoCount} returned)</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(c)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-all"
                          >
                            View Profile
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

      {/* Customer 360° Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FA521C] flex items-center justify-center font-bold text-base">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedCustomer.email || "No email"}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium block">Total Orders</span>
                  <span className="text-lg font-bold text-slate-900">{selectedCustomer.ordersCount}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium block">Lifetime Spend</span>
                  <span className="text-lg font-bold text-emerald-600">₹{selectedCustomer.totalSpend}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium block">RTO Rate</span>
                  <span className={`text-lg font-bold ${selectedCustomer.rtoCount === 0 ? "text-emerald-700" : "text-amber-700"}`}>
                    {selectedCustomer.rtoRate}%
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Contact Phone:</span>
                  <a href={`tel:${selectedCustomer.phone}`} className="font-bold text-[#FA521C] hover:underline">
                    {selectedCustomer.phone || "Not specified"}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Location:</span>
                  <span className="font-semibold text-slate-800">{selectedCustomer.city}</span>
                </div>
                {selectedCustomer.shipping_address && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Address:</span>
                    <span className="text-slate-700 text-right max-w-xs">{selectedCustomer.shipping_address}</span>
                  </div>
                )}
              </div>

              {/* Order History */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                  Order History ({selectedCustomer.recentOrders.length})
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedCustomer.recentOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{ord.shopify_order_id}</span>
                        <span className="text-[11px] text-slate-400 ml-2">{ord.created_at}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">₹{ord.total_amount}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-[#FA521C] border border-orange-200">
                          {ord.delivery_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                href={`/admin/orders?search=${encodeURIComponent(selectedCustomer.name)}`}
                className="text-xs font-semibold text-[#FA521C] hover:text-[#D4380D] hover:underline flex items-center gap-1"
              >
                <span>View All Customer Orders</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-all"
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

