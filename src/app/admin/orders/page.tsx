"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  ShoppingBag,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Phone,
  Eye,
  X,
} from "lucide-react";
import { ERPOrder } from "@/lib/erpStore";

export default function AdminOrdersPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<ERPOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<ERPOrder | null>(null);

  const fetchOrders = async () => {
    setIsRefreshing(true);
    try {
      const url = new URL("/api/admin/orders", window.location.origin);
      if (statusFilter !== "all") url.searchParams.set("delivery_status", statusFilter);
      if (paymentFilter !== "all") url.searchParams.set("payment_method", paymentFilter);
      if (search.trim()) url.searchParams.set("search", search.trim());

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.warn("Error fetching orders:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter, search]);

  const handleExportCSV = () => {
    const headers = [
      "Order ID",
      "Date",
      "Customer",
      "Phone",
      "Total Amount",
      "Product Cost",
      "Shipping Cost",
      "Net Profit",
      "Payment Mode",
      "Courier",
      "AWB Number",
      "Delivery Status",
      "NDR Status",
      "RTO Status",
      "Remittance Status",
    ];

    const rows = orders.map((o) => [
      `"${o.shopify_order_id}"`,
      `"${o.created_at}"`,
      `"${o.customer_name}"`,
      `"${o.customer_phone || ""}"`,
      o.total_amount,
      o.product_cost,
      o.shipping_cost,
      o.net_profit,
      `"${o.payment_method}"`,
      `"${o.courier_partner || ""}"`,
      `"${o.shiprocket_awb || ""}"`,
      `"${o.delivery_status}"`,
      `"${o.ndr_status}"`,
      `"${o.rto_status}"`,
      `"${o.remittance_status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zupe_orders_${new Date().toISOString().split("T")[0]}.csv`);
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
        <AdminHeader
          onOpenMobile={() => setMobileSidebarOpen(true)}
          onRefresh={fetchOrders}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Orders & Logistics Tracking
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Complete order lifecycle, courier AWB tracking, NDR management, and net profit per order.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Order ID, Customer, AWB..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none"
              >
                <option value="all">All Delivery Statuses</option>
                <option value="Delivered">Delivered</option>
                <option value="In Transit">In Transit</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="NDR">NDR (Non-Delivery)</option>
                <option value="RTO Delivered">RTO Delivered</option>
                <option value="Processing">Processing</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none"
              >
                <option value="all">All Payment Methods</option>
                <option value="COD">Cash on Delivery (COD)</option>
                <option value="Prepaid">Prepaid</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Shopify ID</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4">Selling Price</th>
                    <th className="py-3.5 px-4">COGS & Ship</th>
                    <th className="py-3.5 px-4">Courier & AWB</th>
                    <th className="py-3.5 px-4">Delivery Status</th>
                    <th className="py-3.5 px-4">Net Profit</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400">
                        No orders found matching filters.
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 font-bold text-blue-600 whitespace-nowrap">
                          {ord.shopify_order_id}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-xs">
                          {ord.created_at.split(" ")[0]}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-semibold text-slate-900">{ord.customer_name}</p>
                          <a
                            href={`tel:${ord.customer_phone}`}
                            className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{ord.customer_phone}</span>
                          </a>
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
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          ₹{ord.total_amount}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                          <span>Cost: ₹{ord.product_cost}</span>
                          <span className="block text-[11px] text-slate-400">
                            Ship: ₹{ord.shipping_cost}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-semibold text-slate-800">{ord.courier_partner || "Delhivery"}</p>
                          <span className="font-mono text-[11px] text-blue-600">
                            {ord.shiprocket_awb || "Pending"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {ord.delivery_status === "Delivered" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                            </span>
                          )}
                          {ord.delivery_status === "In Transit" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">
                              <Truck className="w-3.5 h-3.5" /> In Transit
                            </span>
                          )}
                          {ord.delivery_status === "NDR" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">
                              <AlertTriangle className="w-3.5 h-3.5" /> NDR
                            </span>
                          )}
                          {ord.delivery_status === "RTO Delivered" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                              <RotateCcw className="w-3.5 h-3.5" /> RTO
                            </span>
                          )}
                          {ord.delivery_status === "Out for Delivery" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700">
                              <Clock className="w-3.5 h-3.5" /> Out for Delivery
                            </span>
                          )}
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
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Order 360° Breakdown: {selectedOrder.shopify_order_id}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Customer Name:</span>
                <span className="font-bold text-slate-900">{selectedOrder.customer_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Phone:</span>
                <span className="font-bold text-blue-600">{selectedOrder.customer_phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Shipping Address:</span>
                <span className="font-medium text-slate-700 text-right max-w-xs">{selectedOrder.shipping_address}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Selling Price:</span>
                <span className="font-bold text-slate-900">₹{selectedOrder.total_amount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Product Supplier Cost (COGS):</span>
                <span className="font-semibold text-slate-700">₹{selectedOrder.product_cost}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Forward Shipping (Shiprocket):</span>
                <span className="font-semibold text-slate-700">₹{selectedOrder.shipping_cost}</span>
              </div>
              {selectedOrder.rto_shipping_charge > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Reverse RTO Freight:</span>
                  <span className="font-semibold text-rose-600">₹{selectedOrder.rto_shipping_charge}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Attributed Ad Spend (Meta):</span>
                <span className="font-semibold text-purple-600">₹{selectedOrder.ad_spend_attributed}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Net Profit:</span>
                <span className={`font-black text-base ${selectedOrder.net_profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  ₹{selectedOrder.net_profit}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Courier & AWB:</span>
                <span className="font-mono text-blue-600">{selectedOrder.courier_partner} ({selectedOrder.shiprocket_awb})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">NDR Status:</span>
                <span className="font-semibold text-slate-700">{selectedOrder.ndr_status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">RTO Status:</span>
                <span className="font-semibold text-slate-700">{selectedOrder.rto_status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">COD Remittance:</span>
                <span className="font-bold text-amber-600">{selectedOrder.remittance_status}</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
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
