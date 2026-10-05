"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<ERPOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState(urlSearch);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<ERPOrder | null>(null);

  // Edit order modal form state
  const [editDeliveryStatus, setEditDeliveryStatus] = useState<string>("Processing");
  const [editCourier, setEditCourier] = useState<string>("Delhivery");
  const [editAWB, setEditAWB] = useState<string>("");
  const [editPaymentStatus, setEditPaymentStatus] = useState<string>("Completed");
  const [editRemittance, setEditRemittance] = useState<string>("Pending");
  const [isSavingOrder, setIsSavingOrder] = useState<boolean>(false);
  const [isCreditingSupplier, setIsCreditingSupplier] = useState<boolean>(false);
  const [orderModalMsg, setOrderModalMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (selectedOrder) {
      setEditDeliveryStatus(selectedOrder.delivery_status || "Processing");
      setEditCourier(selectedOrder.courier_partner || "Delhivery");
      setEditAWB(selectedOrder.shiprocket_awb || "");
      setEditPaymentStatus(selectedOrder.payment_status || "Pending");
      setEditRemittance(selectedOrder.remittance_status || "Pending");
      setOrderModalMsg(null);
    }
  }, [selectedOrder]);

  const handleSaveOrderUpdates = async () => {
    if (!selectedOrder) return;
    setIsSavingOrder(true);
    setOrderModalMsg(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: selectedOrder.id,
          delivery_status: editDeliveryStatus,
          courier_partner: editCourier,
          shiprocket_awb: editAWB,
          payment_status: editPaymentStatus,
          remittance_status: editRemittance,
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setSelectedOrder(data.order);
        setOrders((prev) =>
          prev.map((o) => (o.id === data.order.id ? data.order : o))
        );
        setOrderModalMsg({ text: "Order updated successfully!", type: "success" });
      } else {
        setOrderModalMsg({ text: data.error || "Update failed", type: "error" });
      }
    } catch (err: any) {
      setOrderModalMsg({ text: err.message || "Failed to update order", type: "error" });
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleCreditToSupplier = async () => {
    if (!selectedOrder) return;
    setIsCreditingSupplier(true);
    setOrderModalMsg(null);
    try {
      const creditRes = await fetch("/api/admin/rto-ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier_id: selectedOrder.supplier_id || "sup-a",
          order_id: selectedOrder.shopify_order_id,
          product_name: selectedOrder.items?.[0]?.product_name || "Returned Product",
          amount: selectedOrder.product_cost || 400,
          status: "Credited",
          notes: `RTO item returned & restocked. Credited ₹${selectedOrder.product_cost} to supplier ledger.`,
        }),
      });
      const creditData = await creditRes.json();
      if (creditData.success) {
        const patchRes = await fetch("/api/admin/orders", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: selectedOrder.id,
            rto_status: "Supplier Credited",
          }),
        });
        const patchData = await patchRes.json();
        if (patchData.success && patchData.order) {
          setSelectedOrder(patchData.order);
          setOrders((prev) =>
            prev.map((o) => (o.id === patchData.order.id ? patchData.order : o))
          );
        }
        setOrderModalMsg({
          text: `Successfully credited ₹${selectedOrder.product_cost} to supplier balance!`,
          type: "success",
        });
      } else {
        setOrderModalMsg({ text: creditData.error || "Credit failed", type: "error" });
      }
    } catch (err: any) {
      setOrderModalMsg({ text: err.message || "Failed to credit supplier", type: "error" });
    } finally {
      setIsCreditingSupplier(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null && q !== undefined) {
      setSearch(q);
    }
  }, [searchParams]);

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
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Order ID, Customer, AWB..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200/60"
                  aria-label="Clear order search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
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
                        <td className="py-3.5 px-4 sm:px-6 font-bold text-[#FA521C] whitespace-nowrap">
                          {ord.shopify_order_id}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-xs">
                          {ord.created_at.split(" ")[0]}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-semibold text-slate-900">{ord.customer_name}</p>
                          <a
                            href={`tel:${ord.customer_phone}`}
                            className="text-[11px] text-slate-500 hover:text-[#FA521C] hover:underline flex items-center gap-1"
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
                                : "bg-orange-50 text-[#FA521C] border border-orange-200"
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
                          <span className="font-mono text-[11px] text-slate-600">
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
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-700">
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
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#FA521C] hover:text-[#D4380D] hover:underline"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  Order 360° Management: {selectedOrder.shopify_order_id}
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 font-mono">
                  {selectedOrder.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {orderModalMsg && (
              <div
                className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  orderModalMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {orderModalMsg.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                )}
                <span>{orderModalMsg.text}</span>
              </div>
            )}

            <div className="mt-4 space-y-4 text-xs sm:text-sm">
              {/* Customer details card */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Customer:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Phone:</span>
                  <a href={`tel:${selectedOrder.customer_phone}`} className="font-bold text-[#FA521C] hover:underline">
                    {selectedOrder.customer_phone}
                  </a>
                </div>
                {selectedOrder.guest_email && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Email:</span>
                    <span className="text-slate-700">{selectedOrder.guest_email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Address:</span>
                  <span className="text-slate-700 text-right max-w-xs">{selectedOrder.shipping_address}</span>
                </div>
              </div>

              {/* Editable Operational Controls */}
              <div className="p-4 rounded-xl border border-orange-100 bg-orange-50/30 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Update Logistics & Delivery Status
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Delivery Status
                    </label>
                    <select
                      value={editDeliveryStatus}
                      onChange={(e) => setEditDeliveryStatus(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C]"
                    >
                      <option value="Processing">Processing</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="NDR">NDR (Non-Delivery)</option>
                      <option value="RTO Delivered">RTO Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Courier Partner
                    </label>
                    <select
                      value={editCourier}
                      onChange={(e) => setEditCourier(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C]"
                    >
                      <option value="Delhivery">Delhivery</option>
                      <option value="Bluedart">Bluedart</option>
                      <option value="Xpressbees">Xpressbees</option>
                      <option value="Shadowfax">Shadowfax</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      AWB Tracking Number
                    </label>
                    <input
                      type="text"
                      value={editAWB}
                      onChange={(e) => setEditAWB(e.target.value)}
                      placeholder="e.g. SR-AWB-9871101"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      COD Remittance Status
                    </label>
                    <select
                      value={editRemittance}
                      onChange={(e) => setEditRemittance(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C]"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Remitted">Remitted</option>
                      <option value="Settled">Settled</option>
                      <option value="N/A">N/A (Prepaid)</option>
                    </select>
                  </div>
                </div>

                {/* RTO Supplier Credit Button */}
                {(editDeliveryStatus === "RTO Delivered" || selectedOrder.status === "Returned") && (
                  <div className="pt-2 border-t border-orange-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block">Supplier Credit Memo</span>
                      <span className="text-xs text-slate-500">
                        {selectedOrder.rto_status === "Supplier Credited"
                          ? "✓ Supplier ledger has been credited"
                          : `Claim ₹${selectedOrder.product_cost} back from supplier`}
                      </span>
                    </div>

                    {selectedOrder.rto_status === "Supplier Credited" ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ✓ Supplier Credited (₹{selectedOrder.product_cost})
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCreditToSupplier}
                        disabled={isCreditingSupplier}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{isCreditingSupplier ? "Crediting..." : `Credit ₹${selectedOrder.product_cost} to Supplier`}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Financial Profitability Breakdown */}
              <div className="space-y-1.5 pt-1 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Selling Price (Revenue):</span>
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
                <div className="flex justify-between py-1.5 border-t border-slate-200">
                  <span className="font-bold text-slate-900">Net Profit:</span>
                  <span className={`font-black text-base ${selectedOrder.net_profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    ₹{selectedOrder.net_profit}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-all"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleSaveOrderUpdates}
                disabled={isSavingOrder}
                className="px-5 py-2 bg-[#FA521C] hover:bg-[#D4380D] text-white rounded-xl font-semibold text-xs transition-all shadow-sm shadow-orange-500/25 flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSavingOrder ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Order Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#FA521C] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-500">Loading orders...</p>
          </div>
        </div>
      }
    >
      <AdminOrdersContent />
    </React.Suspense>
  );
}
