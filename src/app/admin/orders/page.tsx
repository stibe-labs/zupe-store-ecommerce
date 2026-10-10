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
  Zap,
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
  const [isPushingToShopify, setIsPushingToShopify] = useState<boolean>(false);
  const [isGeneratingAWB, setIsGeneratingAWB] = useState<boolean>(false);
  const [orderModalMsg, setOrderModalMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 5000);
  };

  // Lock background body scroll when order modal is open
  useEffect(() => {
    if (selectedOrder) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedOrder]);

  useEffect(() => {
    if (selectedOrder) {
      setEditDeliveryStatus(selectedOrder.delivery_status || "Processing");
      setEditCourier(selectedOrder.courier_partner || "Delhivery");
      setEditAWB(selectedOrder.shiprocket_awb || "");
      setEditPaymentStatus(selectedOrder.payment_status || "Pending");
      setEditRemittance(selectedOrder.remittance_status || "Pending");
      setOrderModalMsg(null);

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
  }, [selectedOrder]);

  const handleSaveOrderUpdates = async () => {
    if (!selectedOrder) return;
    setIsSavingOrder(true);
    setOrderModalMsg(null);
    const orderDisplayId = selectedOrder.shopify_order_id || selectedOrder.id;
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
      if (res.ok && data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === data.order.id ? data.order : o))
        );
        setSelectedOrder(null); // Auto close the form
        showToast("success", `Order #${orderDisplayId} changes saved successfully!`);
      } else {
        const errMsg = data.error || `Update failed (${res.status})`;
        setOrderModalMsg({ text: errMsg, type: "error" });
        showToast("error", errMsg);
      }
    } catch (err: any) {
      const errMsg = err.message || "Failed to update order";
      setOrderModalMsg({ text: errMsg, type: "error" });
      showToast("error", errMsg);
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handlePushToShopify = async () => {
    if (!selectedOrder) return;
    setIsPushingToShopify(true);
    setOrderModalMsg(null);
    try {
      const res = await fetch("/api/admin/sync/shopify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "push_order",
          order_id: selectedOrder.id,
        }),
      });
      const data = await res.json();
      if (data.success && data.shopifyOrderId) {
        const updated = { ...selectedOrder, shopify_order_id: data.shopifyOrderId };
        setSelectedOrder(updated);
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        showToast("success", `Pushed order to Shopify! Assigned Order ID: ${data.shopifyOrderId}`);
        setOrderModalMsg({
          text: `Successfully synced with Shopify! Assigned Order: ${data.shopifyOrderId}`,
          type: "success",
        });
      } else {
        const errMsg = data.error || data.message || "Failed to push order to Shopify";
        setOrderModalMsg({ text: errMsg, type: "error" });
        showToast("error", errMsg);
      }
    } catch (err: any) {
      const errMsg = err.message || "Network error while pushing to Shopify";
      setOrderModalMsg({ text: errMsg, type: "error" });
      showToast("error", errMsg);
    } finally {
      setIsPushingToShopify(false);
    }
  };

  const handleGenerateAWB = async () => {
    if (!selectedOrder) return;
    setIsGeneratingAWB(true);
    setOrderModalMsg(null);
    try {
      const res = await fetch("/api/admin/sync/shiprocket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_awb",
          order_id: selectedOrder.id,
          preferredCourier: editCourier,
        }),
      });
      const data = await res.json();
      if (data.success && data.awb) {
        setEditAWB(data.awb);
        setEditDeliveryStatus(data.delivery_status || "In Transit");
        if (data.courier) setEditCourier(data.courier);

        const updated = {
          ...selectedOrder,
          shiprocket_awb: data.awb,
          tracking_number: data.awb,
          courier_partner: data.courier || selectedOrder.courier_partner,
          delivery_status: data.delivery_status || "In Transit",
          status: data.delivery_status || "In Transit",
        };
        setSelectedOrder(updated);
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        showToast("success", `Generated AWB ${data.awb} via ${data.courier || "Courier"}!`);
        setOrderModalMsg({
          text: data.message || `Generated AWB ${data.awb} via ${data.courier || "Courier"}!`,
          type: "success",
        });
      } else {
        const errMsg = data.error || "Failed to generate Shiprocket AWB";
        setOrderModalMsg({ text: errMsg, type: "error" });
        showToast("error", errMsg);
      }
    } catch (err: any) {
      const errMsg = err.message || "Network error while generating AWB";
      setOrderModalMsg({ text: errMsg, type: "error" });
      showToast("error", errMsg);
    } finally {
      setIsGeneratingAWB(false);
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
        const successMsg = `Successfully credited ₹${selectedOrder.product_cost} to supplier balance!`;
        setOrderModalMsg({
          text: successMsg,
          type: "success",
        });
        showToast("success", successMsg);
      } else {
        const errMsg = creditData.error || "Credit failed";
        setOrderModalMsg({ text: errMsg, type: "error" });
        showToast("error", errMsg);
      }
    } catch (err: any) {
      const errMsg = err.message || "Failed to credit supplier";
      setOrderModalMsg({ text: errMsg, type: "error" });
      showToast("error", errMsg);
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
                className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
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
                        <td className="py-3.5 px-4 sm:px-6 font-bold text-[#FF7A00] whitespace-nowrap">
                          {ord.shopify_order_id}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-xs">
                          {ord.created_at.split(" ")[0]}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-semibold text-slate-900">{ord.customer_name}</p>
                          <a
                            href={`tel:${ord.customer_phone}`}
                            className="text-[11px] text-slate-500 hover:text-[#FF7A00] hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{ord.customer_phone}</span>
                          </a>
                          {(() => {
                            let rawItems: any[] = [];
                            if (Array.isArray(ord.items)) rawItems = ord.items;
                            else if (typeof ord.items === "string") {
                              try { rawItems = JSON.parse(ord.items); } catch { rawItems = []; }
                            }
                            const totalQty = rawItems.reduce((acc, it) => acc + Number(it.quantity || 1), 0);
                            const firstName = rawItems[0]?.name || rawItems[0]?.product_name;
                            if (!firstName) return null;
                            return (
                              <span className="block text-[11px] text-[#FF7A00] font-semibold truncate max-w-[180px] mt-0.5">
                                📦 {totalQty > 1 ? `${totalQty}× ` : ""}{firstName}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${
                              ord.payment_method === "COD"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-orange-50 text-[#FF7A00] border border-orange-200"
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
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF7A00] hover:text-[#E66E00] hover:underline"
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOrder(null);
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 flex flex-col min-h-0 max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header (fixed at top) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
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
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div
              className="p-6 overflow-y-auto overscroll-contain flex-1 min-h-0 space-y-4"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {orderModalMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
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

              {/* Customer details card */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Customer:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Phone:</span>
                  <a href={`tel:${selectedOrder.customer_phone}`} className="font-bold text-[#FF7A00] hover:underline">
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

              {/* Purchased Items & Quantity Breakdown Card */}
              {(() => {
                let parsedItems: any[] = [];
                if (Array.isArray(selectedOrder.items)) {
                  parsedItems = selectedOrder.items;
                } else if (typeof selectedOrder.items === "string") {
                  try {
                    parsedItems = JSON.parse(selectedOrder.items);
                  } catch (e) {
                    parsedItems = [];
                  }
                }
                if (!parsedItems || parsedItems.length === 0) return null;

                const totalUnits = parsedItems.reduce((acc, it) => acc + Number(it.quantity || 1), 0);

                return (
                  <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#FF7A00]" />
                        Purchased Items ({parsedItems.length})
                      </span>
                      <span className="text-[11px] font-extrabold text-[#FF7A00] bg-orange-100 px-2 py-0.5 rounded-full">
                        Total Quantity: {totalUnits} unit{totalUnits === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {parsedItems.map((item, idx) => {
                        const itemName = item.name || item.product_name || "Purchased Product";
                        const itemQty = Number(item.quantity || 1);
                        const itemPrice = Number(item.price || item.unit_price || 0);
                        const itemImg = item.image || item.poster_image || "";

                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200/70 text-xs shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {itemImg ? (
                                <img
                                  src={itemImg}
                                  alt={itemName}
                                  className="w-10 h-10 object-cover rounded-md border border-slate-100 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-md bg-orange-50 text-[#FF7A00] flex items-center justify-center font-bold text-xs shrink-0">
                                  ZP
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate max-w-[220px]">
                                  {itemName}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF7A00] text-white">
                                    Qty: {itemQty}
                                  </span>
                                  <span className="text-slate-500 text-[11px]">
                                    ₹{itemPrice.toLocaleString()} each
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-extrabold text-slate-900 block text-xs">
                                ₹{(itemPrice * itemQty).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Shopify Sync Card */}
              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Shopify Order:</span>
                      <span className="font-mono font-bold text-xs text-emerald-800">
                        {selectedOrder.shopify_order_id || "Unsynced"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Syncs order with Shopify Admin API for fulfillment app routing
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePushToShopify}
                  disabled={isPushingToShopify}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPushingToShopify ? "animate-spin" : ""}`} />
                  <span>{isPushingToShopify ? "Syncing..." : "Push to Shopify"}</span>
                </button>
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
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
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
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                    >
                      <option value="Delhivery">Delhivery</option>
                      <option value="Bluedart">Bluedart</option>
                      <option value="Xpressbees">Xpressbees</option>
                      <option value="Shadowfax">Shadowfax</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-600">
                        AWB Tracking Number
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateAWB}
                        disabled={isGeneratingAWB}
                        className="text-[11px] font-bold text-[#FF7A00] hover:text-[#E66E00] flex items-center gap-1 disabled:opacity-50"
                      >
                        {isGeneratingAWB ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3 text-[#FF7A00]" />
                            <span>Auto-Generate AWB</span>
                          </>
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={editAWB}
                      onChange={(e) => setEditAWB(e.target.value)}
                      placeholder="e.g. DEL-82910384"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      COD Remittance Status
                    </label>
                    <select
                      value={editRemittance}
                      onChange={(e) => setEditRemittance(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
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

            {/* Modal Footer (fixed at bottom) */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 shrink-0 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-semibold text-xs transition-all shadow-sm"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleSaveOrderUpdates}
                disabled={isSavingOrder}
                className="px-5 py-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl font-semibold text-xs transition-all shadow-sm shadow-orange-500/25 flex items-center gap-1.5 disabled:opacity-50"
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

      {/* Floating Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 sm:right-6 z-[9999] max-w-sm sm:max-w-md w-full shadow-2xl transition-all animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-3 border shadow-xl ${
              toastMessage.type === "success"
                ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30 ring-4 ring-emerald-500/20"
                : "bg-rose-600 text-white border-rose-500 shadow-rose-600/30 ring-4 ring-rose-500/20"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-white shrink-0" />
            )}
            <div className="flex-1 leading-snug">{toastMessage.text}</div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
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
            <div className="w-8 h-8 border-4 border-[#FF7A00] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-500">Loading orders...</p>
          </div>
        </div>
      }
    >
      <AdminOrdersContent />
    </React.Suspense>
  );
}
