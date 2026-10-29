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
  MessageCircle,
  XCircle,
  MoreVertical,
  Tag,
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
  const [courierFilter, setCourierFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<ERPOrder | null>(null);

  const isFiltered =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    paymentFilter !== "all" ||
    courierFilter !== "all";

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setCourierFilter("all");
  };

  // Edit order modal form state
  const [editDeliveryStatus, setEditDeliveryStatus] = useState<string>("Processing");
  const [editCourier, setEditCourier] = useState<string>("");
  const [editAWB, setEditAWB] = useState<string>("");
  const [editPaymentStatus, setEditPaymentStatus] = useState<string>("Completed");
  const [editRemittance, setEditRemittance] = useState<string>("Pending");
  const [isSavingOrder, setIsSavingOrder] = useState<boolean>(false);
  const [isCreditingSupplier, setIsCreditingSupplier] = useState<boolean>(false);
  const [isPushingToShopify, setIsPushingToShopify] = useState<boolean>(false);
  const [isGeneratingAWB, setIsGeneratingAWB] = useState<boolean>(false);
  const [isSyncingShiprocket, setIsSyncingShiprocket] = useState<boolean>(false);
  const [orderModalMsg, setOrderModalMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Quick WhatsApp / Manual Confirm / Cancel Action states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"resend" | "confirm" | "cancel" | "refund_update" | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<ERPOrder | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("Customer requested via phone call");
  const [cancelNotes, setCancelNotes] = useState<string>("");
  const [openMenuOrderId, setOpenMenuOrderId] = useState<string | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 5000);
  };

  // Close 3-dots action menu on outside click or scroll
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement)?.closest?.(".order-action-menu-container")) {
        setOpenMenuOrderId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock background body scroll when order cancellation modal is open
  useEffect(() => {
    if (orderToCancel) {
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
  }, [orderToCancel]);

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
      setEditCourier(selectedOrder.courier_partner || "");
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

  const handleManualWAConfirm = async () => {
    if (!selectedOrder) return;
    try {
      const res = await fetch(`/api/orders/whatsapp-confirm?orderId=${encodeURIComponent(selectedOrder.id)}`);
      const updated = {
        ...selectedOrder,
        whatsapp_confirm_status: "confirmed",
        whatsapp_token_used: true,
      };
      setSelectedOrder(updated);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      showToast("success", `Order #${selectedOrder.shopify_order_id || selectedOrder.id} manually verified!`);
    } catch (e: any) {
      showToast("error", e.message || "Manual confirmation failed");
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

  const handleSyncShiprocketAll = async () => {
    setIsSyncingShiprocket(true);
    try {
      const res = await fetch("/api/admin/sync/shiprocket");
      const data = await res.json();
      if (data.success) {
        showToast("success", data.message || "Shiprocket orders synced successfully!");
        await fetchOrders();
      } else {
        showToast("error", data.error || "Failed to sync with Shiprocket");
      }
    } catch (e: any) {
      showToast("error", e.message || "Error syncing with Shiprocket");
    } finally {
      setIsSyncingShiprocket(false);
    }
  };

  const handleResendWAButtons = async (ord: ERPOrder) => {
    setActionLoadingId(ord.id);
    setActionType("resend");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resend_wa_buttons",
          order_id: ord.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const updatedOrder = data.order || ord;
        setOrders((prev) =>
          prev.map((o) => (o.id === ord.id ? { ...o, ...updatedOrder } : o))
        );
        if (selectedOrder && selectedOrder.id === ord.id) {
          setSelectedOrder((prev) => (prev ? { ...prev, ...updatedOrder } : null));
        }
        showToast(
          "success",
          `WhatsApp message with Confirm & Cancel buttons sent to ${updatedOrder.customer_phone || ord.customer_phone}!`
        );
      } else {
        const errMsg = data.error || "Failed to resend WhatsApp buttons";
        showToast("error", errMsg);
      }
    } catch (err: any) {
      showToast("error", err.message || "Network error while resending WhatsApp buttons");
    } finally {
      setActionLoadingId(null);
      setActionType(null);
    }
  };

  const handleManualConfirmOrder = async (ord: ERPOrder) => {
    setActionLoadingId(ord.id);
    setActionType("confirm");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "manual_confirm",
          order_id: ord.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === data.order.id ? { ...o, ...data.order } : o))
        );
        if (selectedOrder && selectedOrder.id === data.order.id) {
          setSelectedOrder((prev) => (prev ? { ...prev, ...data.order } : null));
          setEditDeliveryStatus(data.order.delivery_status || "Processing");
          if (data.order.shiprocket_awb) setEditAWB(data.order.shiprocket_awb);
          if (data.order.courier_partner) setEditCourier(data.order.courier_partner);
        }
        showToast(
          "success",
          `Order #${data.order.shopify_order_id || ord.id} confirmed! Normal confirmation WhatsApp dispatched.`
        );
      } else {
        const errMsg = data.error || "Failed to manually confirm order";
        showToast("error", errMsg);
      }
    } catch (err: any) {
      showToast("error", err.message || "Network error while confirming order");
    } finally {
      setActionLoadingId(null);
      setActionType(null);
    }
  };

  const handleManualCancelOrder = async () => {
    if (!orderToCancel) return;
    const ord = orderToCancel;
    setActionLoadingId(ord.id);
    setActionType("cancel");
    try {
      const combinedReason = cancelNotes.trim()
        ? `${cancelReason} - ${cancelNotes.trim()}`
        : cancelReason;
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "manual_cancel",
          order_id: ord.id,
          reason: combinedReason,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === data.order.id ? { ...o, ...data.order } : o))
        );
        if (selectedOrder && selectedOrder.id === data.order.id) {
          setSelectedOrder((prev) => (prev ? { ...prev, ...data.order } : null));
          setEditDeliveryStatus("Cancelled");
          if (data.order.payment_status) setEditPaymentStatus(data.order.payment_status);
        }
        const refundMsg = data.refund ? ` (Refund ₹${data.refund.amount} initiated)` : "";
        showToast(
          "success",
          `Order #${data.order.shopify_order_id || ord.id} cancelled successfully${refundMsg}. Customer WhatsApp notification sent.`
        );
        setOrderToCancel(null);
      } else {
        const errMsg = data.error || "Failed to cancel order";
        showToast("error", errMsg);
      }
    } catch (err: any) {
      showToast("error", err.message || "Network error while cancelling order");
    } finally {
      setActionLoadingId(null);
      setActionType(null);
    }
  };

  const handleUpdateRefundStatus = async (
    ord: ERPOrder,
    newStatus: "Refund Pending" | "Refunded" | "Refund Rejected"
  ) => {
    setActionLoadingId(ord.id);
    setActionType("refund_update");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_refund_status",
          order_id: ord.id,
          refund_status: newStatus,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === ord.id ? { ...o, payment_status: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === ord.id) {
          setSelectedOrder((prev) => (prev ? { ...prev, payment_status: newStatus } : null));
          setEditPaymentStatus(newStatus);
        }
        showToast("success", `Refund status for Order #${ord.shopify_order_id || ord.id} updated to "${newStatus}"!`);
      } else {
        const errMsg = data.error || "Failed to update refund status";
        showToast("error", errMsg);
      }
    } catch (err: any) {
      showToast("error", err.message || "Network error while updating refund status");
    } finally {
      setActionLoadingId(null);
      setActionType(null);
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
      if (courierFilter !== "all") url.searchParams.set("courier_partner", courierFilter);
      if (search.trim()) url.searchParams.set("search", search.trim());

      const res = await fetch(url.toString(), { cache: "no-store" });
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
    const interval = setInterval(fetchOrders, 15000);
    const onFocus = () => fetchOrders();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [statusFilter, paymentFilter, courierFilter, search]);

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
                onClick={handleSyncShiprocketAll}
                disabled={isSyncingShiprocket}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-orange-50 border border-orange-200 hover:bg-orange-100 text-[#FF7A00] text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                title="Sync AWB, couriers, and live tracking status directly from Shiprocket"
              >
                <RefreshCw className={`w-4 h-4 text-[#FF7A00] ${isSyncingShiprocket ? "animate-spin" : ""}`} />
                <span>{isSyncingShiprocket ? "Syncing..." : "Sync Shiprocket"}</span>
              </button>
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
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
              >
                <option value="all">All Delivery Statuses</option>
                <option value="Pending WhatsApp">⏳ Awaiting WhatsApp Confirmation</option>
                <option value="Processing">Processing</option>
                <option value="In Transit">In Transit</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="NDR">⚠️ NDR (Non-Delivery)</option>
                <option value="RTO Delivered">RTO Delivered</option>
                <option value="Cancelled">❌ Cancelled</option>
              </select>

              <select
                value={courierFilter}
                onChange={(e) => setCourierFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
              >
                <option value="all">All Courier Partners</option>
                <option value="Delhivery">Delhivery</option>
                <option value="Bluedart">Bluedart</option>
                <option value="Xpressbees">Xpressbees</option>
                <option value="Shadowfax">Shadowfax</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
              >
                <option value="all">All Payment Methods</option>
                <option value="COD">Cash on Delivery (COD)</option>
                <option value="Prepaid">Prepaid / UPI</option>
                <option value="Refunded">Refunded (Razorpay)</option>
              </select>

              <button
                type="button"
                onClick={handleResetFilters}
                disabled={!isFiltered}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isFiltered
                    ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer shadow-xs"
                    : "bg-slate-100 text-slate-400 border border-slate-200/60 cursor-not-allowed opacity-60"
                }`}
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto min-h-[480px] pb-28">
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
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertTriangle className="w-7 h-7 text-slate-300" />
                          <p className="font-semibold text-slate-800 text-sm">
                            No orders match your filter criteria
                          </p>
                          <p className="text-xs text-slate-400">
                            Try changing the delivery status, courier, payment method, or clearing the search box.
                          </p>
                          {isFiltered && (
                            <button
                              type="button"
                              onClick={handleResetFilters}
                              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl shadow-xs transition-all"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reset Filters</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord, idx) => (
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
                            const bundleItem = rawItems.find((it) => (it.bundle_tier && Number(it.bundle_tier) > 1) || it.offer_label);

                            return (
                              <div className="space-y-1">
                                <span className="block text-[11px] text-[#FF7A00] font-semibold truncate max-w-[200px] mt-0.5">
                                  📦 {totalQty > 1 ? `${totalQty}× ` : ""}{firstName}
                                  {rawItems.length > 1 ? ` +${rawItems.length - 1} more` : ""}
                                </span>
                                {bundleItem && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-gradient-to-r from-orange-100 to-amber-100 text-[#E65100] border border-orange-200">
                                    <span>✨</span>
                                    <span>{bundleItem.offer_label || `Buy ${bundleItem.bundle_tier || totalQty} Save More`}</span>
                                  </span>
                                )}
                                {ord.promo_code && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                    <Tag className="w-2.5 h-2.5 text-purple-600" />
                                    <span>Promo: {ord.promo_code}</span>
                                    {ord.discount_amount ? <span className="text-purple-600 font-extrabold">(-₹{ord.discount_amount})</span> : null}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                              ord.payment_method === "COD" || (ord.payment_method && ord.payment_method.toLowerCase().includes("cash on delivery"))
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {ord.payment_method}
                          </span>
                          <span className="block text-[10px] font-semibold mt-0.5">
                            {ord.payment_status?.toLowerCase() === "refunded" ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Refunded
                              </span>
                            ) : ord.payment_status?.toLowerCase().includes("reject") ? (
                              <span className="inline-flex items-center gap-1 text-rose-700 font-extrabold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                <XCircle className="w-3 h-3 text-rose-600" /> Refund Rejected
                              </span>
                            ) : ord.payment_status === "Refund Pending" || ord.payment_status === "refund_pending" ? (
                              <span className="inline-flex items-center gap-1 text-amber-700 font-extrabold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" /> Refund Processing
                              </span>
                            ) : ord.payment_status === "Completed" || ord.payment_status === "paid" ? (
                              <span className="text-emerald-600 font-bold">✓ Paid</span>
                            ) : (
                              <span className="text-amber-600 font-medium">Pending</span>
                            )}
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
                          {ord.whatsapp_confirm_status === "pending_whatsapp" ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                                <Clock className="w-3 h-3 text-amber-600" /> Awaiting Confirmation
                              </span>
                              <span className="block text-[10px] text-slate-400 mt-0.5">AWB generated on verify</span>
                            </div>
                          ) : (
                            <>
                              <p className="font-semibold text-slate-800">
                                {ord.courier_partner || (ord.shiprocket_awb && !ord.shiprocket_awb.startsWith("SR-AWB-") ? "Assigned" : "Awaiting Dispatch")}
                              </p>
                              <span className="font-mono text-[11px] text-slate-600">
                                {ord.shiprocket_awb && !ord.shiprocket_awb.startsWith("SR-AWB-") ? ord.shiprocket_awb : "Pending AWB"}
                              </span>
                            </>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {ord.whatsapp_confirm_status === "pending_whatsapp" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-amber-600" /> Awaiting WA
                            </span>
                          ) : (ord.whatsapp_confirm_status === "cancelled" || ord.delivery_status === "Cancelled" || ord.status === "Cancelled") ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                <X className="w-3.5 h-3.5" /> Cancelled
                              </span>
                              {ord.payment_status === "Refunded" ? (
                                <span className="block text-[9.5px] font-bold text-emerald-700 mt-0.5">
                                  ✓ Refunded
                                </span>
                              ) : ord.payment_status === "Refund Rejected" ? (
                                <span className="block text-[9.5px] font-bold text-rose-600 mt-0.5">
                                  ✕ Refund Rejected
                                </span>
                              ) : (
                                <span className="block text-[9.5px] font-bold text-amber-600 mt-0.5">
                                  ⏳ Refund Pending
                                </span>
                              )}
                            </div>
                          ) : ord.delivery_status === "Delivered" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                            </span>
                          ) : ord.delivery_status === "In Transit" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-700">
                              <Truck className="w-3.5 h-3.5" /> In Transit
                            </span>
                          ) : ord.delivery_status === "NDR" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">
                              <AlertTriangle className="w-3.5 h-3.5" /> NDR
                            </span>
                          ) : ord.delivery_status === "RTO Delivered" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                              <RotateCcw className="w-3.5 h-3.5" /> RTO
                            </span>
                          ) : ord.delivery_status === "Out for Delivery" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700">
                              <Clock className="w-3.5 h-3.5" /> Out for Delivery
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                              <Clock className="w-3.5 h-3.5 text-slate-500" /> Processing
                            </span>
                          )}

                          {ord.whatsapp_confirm_status === "confirmed" && (
                            <span className="block text-[10px] text-emerald-600 font-bold mt-0.5">
                              ✓ WA Confirmed
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
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="relative inline-block text-left order-action-menu-container">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuOrderId(openMenuOrderId === ord.id ? null : ord.id);
                              }}
                              className={`w-8 h-8 rounded-xl inline-flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 border transition-all cursor-pointer ${
                                openMenuOrderId === ord.id
                                  ? "bg-slate-100 text-slate-900 border-slate-300 shadow-inner"
                                  : "border-transparent"
                              }`}
                              title="Order actions"
                              aria-label="Order actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {openMenuOrderId === ord.id && (() => {
                              const isOrdCancelled =
                                ord.delivery_status === "Cancelled" ||
                                ord.status === "Cancelled" ||
                                ord.whatsapp_confirm_status === "cancelled";
                              const isOrdDelivered =
                                ord.delivery_status === "Delivered" ||
                                ord.delivery_status === "RTO Delivered";
                              const canResend = !isOrdCancelled && !isOrdDelivered && ord.whatsapp_confirm_status !== "confirmed";
                              const canConfirm = !isOrdCancelled && !isOrdDelivered && ord.whatsapp_confirm_status !== "confirmed";
                              const canCancel = !isOrdCancelled && !isOrdDelivered;
                              const hasActionButtons = canResend || canConfirm || canCancel;

                              return (
                                <div
                                  className={`absolute right-0 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left ${
                                    idx >= orders.length - 2 && orders.length > 2
                                      ? "bottom-full mb-1.5 origin-bottom-right"
                                      : "top-full mt-1.5 origin-top-right"
                                  }`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {/* 1. Resend WhatsApp Interactive Buttons */}
                                  {canResend && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuOrderId(null);
                                        handleResendWAButtons(ord);
                                      }}
                                      disabled={actionLoadingId === ord.id}
                                      className="w-full px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors cursor-pointer text-left disabled:opacity-50"
                                    >
                                      {actionLoadingId === ord.id && actionType === "resend" ? (
                                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
                                      ) : (
                                        <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                      )}
                                      <div>
                                        <p className="font-bold text-slate-800">Resend WA Buttons</p>
                                        <p className="text-[10px] text-slate-400 font-normal">Confirm & Cancel prompt</p>
                                      </div>
                                    </button>
                                  )}

                                  {/* 2. Manually Confirm Order */}
                                  {canConfirm && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuOrderId(null);
                                        handleManualConfirmOrder(ord);
                                      }}
                                      disabled={actionLoadingId === ord.id}
                                      className="w-full px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 flex items-center gap-2.5 transition-colors cursor-pointer text-left disabled:opacity-50"
                                    >
                                      {actionLoadingId === ord.id && actionType === "confirm" ? (
                                        <RefreshCw className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                                      ) : (
                                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                      )}
                                      <div>
                                        <p className="font-bold text-slate-800">Confirm Order</p>
                                        <p className="text-[10px] text-slate-400 font-normal">Manual verify & notify</p>
                                      </div>
                                    </button>
                                  )}

                                  {/* 3. Cancel Order */}
                                  {canCancel && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuOrderId(null);
                                        setOrderToCancel(ord);
                                        setCancelReason("Customer requested cancellation");
                                        setCancelNotes("");
                                      }}
                                      disabled={actionLoadingId === ord.id}
                                      className="w-full px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer text-left disabled:opacity-50"
                                    >
                                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                      <div>
                                        <p className="font-bold text-slate-800">Cancel Order</p>
                                        <p className="text-[10px] text-slate-400 font-normal">Restock & refund if paid</p>
                                      </div>
                                    </button>
                                  )}

                                  {/* Manual Refund Status Actions (Only for Cancelled Orders) */}
                                  {isOrdCancelled && (
                                    <div className="border-b border-slate-100 pb-1 mb-1">
                                      <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                        <span>Refund Status</span>
                                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                          ord.payment_status === "Refunded"
                                            ? "bg-emerald-100 text-emerald-800"
                                            : ord.payment_status === "Refund Rejected"
                                            ? "bg-rose-100 text-rose-800"
                                            : "bg-amber-100 text-amber-800"
                                        }`}>
                                          {ord.payment_status || "Pending"}
                                        </span>
                                      </div>

                                      {ord.payment_status !== "Refunded" && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setOpenMenuOrderId(null);
                                            handleUpdateRefundStatus(ord, "Refunded");
                                          }}
                                          disabled={actionLoadingId === ord.id}
                                          className="w-full px-3.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 transition-colors cursor-pointer text-left"
                                        >
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                          <div>
                                            <p className="font-bold text-slate-800">Mark as Refunded</p>
                                            <p className="text-[9.5px] text-slate-400 font-normal">Customer sees "Refunded"</p>
                                          </div>
                                        </button>
                                      )}

                                      {ord.payment_status !== "Refund Pending" && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setOpenMenuOrderId(null);
                                            handleUpdateRefundStatus(ord, "Refund Pending");
                                          }}
                                          disabled={actionLoadingId === ord.id}
                                          className="w-full px-3.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-2 transition-colors cursor-pointer text-left"
                                        >
                                          <RotateCcw className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                          <div>
                                            <p className="font-bold text-slate-800">Set Refund Processing</p>
                                            <p className="text-[9.5px] text-slate-400 font-normal">Customer sees "Processing"</p>
                                          </div>
                                        </button>
                                      )}

                                      {ord.payment_status !== "Refund Rejected" && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setOpenMenuOrderId(null);
                                            handleUpdateRefundStatus(ord, "Refund Rejected");
                                          }}
                                          disabled={actionLoadingId === ord.id}
                                          className="w-full px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer text-left"
                                        >
                                          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                          <div>
                                            <p className="font-bold text-slate-800">Reject Refund</p>
                                            <p className="text-[9.5px] text-slate-400 font-normal">Mark refund ineligible</p>
                                          </div>
                                        </button>
                                      )}
                                    </div>
                                  )}

                                  {hasActionButtons && <div className="my-1 border-t border-slate-100" />}

                                  {/* 4. Details Option */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuOrderId(null);
                                      setSelectedOrder(ord);
                                    }}
                                    className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#FF7A00] flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                                  >
                                    <Eye className="w-4 h-4 text-[#FF7A00] shrink-0" />
                                    <div>
                                      <p className="font-bold text-slate-800">Order 360° Details</p>
                                      <p className="text-[10px] text-slate-400 font-normal">View items & logistics</p>
                                    </div>
                                  </button>
                                </div>
                              );
                            })()}
                          </div>
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
                        const isBundle = Boolean((item.bundle_tier && Number(item.bundle_tier) > 1) || item.offer_label);
                        const itemTotal = Number(item.bundle_total || (itemPrice * itemQty));

                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border text-xs shadow-2xs ${
                              isBundle
                                ? "bg-gradient-to-r from-orange-50/50 via-amber-50/30 to-white border-orange-200"
                                : "bg-white border-slate-200/70"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5 min-w-0">
                                {itemImg ? (
                                  <img
                                    src={itemImg}
                                    alt={itemName}
                                    className="w-11 h-11 object-cover rounded-lg border border-slate-100 shrink-0"
                                  />
                                ) : (
                                  <div className="w-11 h-11 rounded-lg bg-orange-50 text-[#FF7A00] flex items-center justify-center font-bold text-xs shrink-0">
                                    ZP
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 truncate max-w-[240px]">
                                    {itemName}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF7A00] text-white">
                                      Qty: {itemQty}
                                    </span>
                                    <span className="text-slate-600 text-[11px] font-semibold">
                                      ₹{itemPrice.toLocaleString()} each
                                    </span>
                                    {item.original_price && Number(item.original_price) > itemPrice && (
                                      <span className="text-slate-400 text-[10px] line-through">
                                        ₹{Number(item.original_price).toLocaleString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-extrabold text-slate-900 block text-xs sm:text-sm">
                                  ₹{itemTotal.toLocaleString()}
                                </span>
                                {item.bundle_savings && Number(item.bundle_savings) > 0 && (
                                  <span className="text-[10px] font-bold text-emerald-600 block">
                                    Saved ₹{Number(item.bundle_savings).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Buy More Save More Badge & Savings Highlight */}
                            {isBundle && (
                              <div className="mt-2 pt-2 border-t border-orange-200/60 flex items-center justify-between flex-wrap gap-2">
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-gradient-to-r from-orange-100 to-amber-100 text-[#E65100] border border-orange-300">
                                  <span>✨</span>
                                  <span>
                                    {item.offer_label || `Buy More Save More: ${itemQty} Units Offer`}
                                  </span>
                                </div>
                                {item.bundle_savings && Number(item.bundle_savings) > 0 && (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    🎉 Bundle Discount: ₹{Number(item.bundle_savings).toLocaleString()} OFF
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {selectedOrder.promo_code && (
                      <div className="mt-3 p-3 rounded-xl bg-purple-50/90 border border-purple-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-purple-600" />
                          <span className="font-bold text-purple-900">
                            Promo Code Applied:{" "}
                            <span className="font-mono bg-purple-100 px-2 py-0.5 rounded text-purple-800 tracking-wider">
                              {selectedOrder.promo_code}
                            </span>
                          </span>
                        </div>
                        {selectedOrder.discount_amount && selectedOrder.discount_amount > 0 && (
                          <span className="font-extrabold text-purple-800 bg-purple-100 px-2.5 py-1 rounded-md border border-purple-200">
                            🎉 -₹{Number(selectedOrder.discount_amount).toLocaleString()} Discount
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Manual Refund Status & Payment Coordination Card (Only for Cancelled Orders) */}
              {(selectedOrder.delivery_status === "Cancelled" ||
                selectedOrder.status === "Cancelled" ||
                selectedOrder.whatsapp_confirm_status === "cancelled" ||
                selectedOrder.payment_status?.toLowerCase().includes("refund")) && (() => {
                const isCod =
                  (selectedOrder.payment_method || "").toLowerCase().includes("cash on delivery") ||
                  (selectedOrder.payment_method || "").toUpperCase() === "COD" ||
                  (selectedOrder.payment_method || "").toLowerCase().includes("partial");

                const refundAmount = isCod ? 10 : selectedOrder.total_amount;
                const isStatusRefunded = selectedOrder.payment_status === "Refunded";
                const isStatusRejected = selectedOrder.payment_status === "Refund Rejected";
                const isStatusPending = !isStatusRefunded && !isStatusRejected;

                return (
                  <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isStatusRefunded
                            ? "bg-emerald-100 text-emerald-700"
                            : isStatusRejected
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {isStatusRefunded ? (
                            <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                          ) : isStatusRejected ? (
                            <XCircle className="w-4 h-4 stroke-[2.2]" />
                          ) : (
                            <RotateCcw className="w-4 h-4 stroke-[2.2]" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Customer Refund Management
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {isCod ? "COD ₹10 Advance Fee (100% Refundable)" : "Prepaid Online Order Refund"}
                          </p>
                        </div>
                      </div>

                      {/* Current Status Pill */}
                      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                        isStatusRefunded
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : isStatusRejected
                          ? "bg-rose-100 text-rose-800 border border-rose-300"
                          : "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                      }`}>
                        {isStatusRefunded ? "✓ Refund Completed" : isStatusRejected ? "✕ Refund Rejected" : "⏳ Refund Processing"}
                      </span>
                    </div>

                    {/* Payment & Refund Financial Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Refundable Amount</span>
                        <span className="font-bold text-slate-900 text-sm">
                          ₹{refundAmount}
                          {isCod && <span className="text-[10px] text-amber-700 font-medium block">(₹10 COD Advance)</span>}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Payment ID</span>
                        <span className="font-mono font-bold text-slate-800 text-[11px] truncate block" title={selectedOrder.razorpay_payment_id || "N/A"}>
                          {selectedOrder.razorpay_payment_id || "Recorded at Checkout"}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Customer Phone</span>
                        <span className="font-bold text-slate-800 text-xs">
                          {selectedOrder.customer_phone || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-white/70 p-2.5 rounded-xl border border-slate-200/60 leading-relaxed">
                      💡 <strong>Customer Visibility:</strong> The customer storefront shows <strong>"{isStatusRefunded ? "Refunded" : isStatusRejected ? "Refund Ineligible" : "Refund Processing"}"</strong>. Update status below after manually completing payment or review.
                    </div>

                    {/* Status Updater Buttons */}
                    <div className="pt-1 flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleUpdateRefundStatus(selectedOrder, "Refunded")}
                        disabled={actionLoadingId === selectedOrder.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isStatusRefunded
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark as Refunded</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateRefundStatus(selectedOrder, "Refund Pending")}
                        disabled={actionLoadingId === selectedOrder.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isStatusPending
                            ? "bg-amber-500 text-white shadow-xs"
                            : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300"
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Set to Refund Processing</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateRefundStatus(selectedOrder, "Refund Rejected")}
                        disabled={actionLoadingId === selectedOrder.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isStatusRejected
                            ? "bg-rose-600 text-white shadow-xs"
                            : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-300"
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject Refund</span>
                      </button>

                      {selectedOrder.customer_phone && (
                        <a
                          href={`https://wa.me/${selectedOrder.customer_phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `Hello ${selectedOrder.customer_name},\nRegarding your canceled order ${selectedOrder.shopify_order_id || selectedOrder.id}:\nYour refund of ₹${refundAmount} has been verified.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#1EBE5D] text-white ml-auto transition shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Customer</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* WhatsApp Order Verification Status Card */}
              <div
                className={`p-4 rounded-xl border flex flex-col gap-3.5 ${
                  selectedOrder.whatsapp_confirm_status === "pending_whatsapp"
                    ? "bg-amber-50/80 border-amber-300"
                    : (selectedOrder.whatsapp_confirm_status === "cancelled" || selectedOrder.delivery_status === "Cancelled")
                    ? "bg-rose-50/80 border-rose-300"
                    : "bg-emerald-50/80 border-emerald-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        selectedOrder.whatsapp_confirm_status === "pending_whatsapp"
                          ? "bg-amber-100 text-amber-700"
                          : (selectedOrder.whatsapp_confirm_status === "cancelled" || selectedOrder.delivery_status === "Cancelled")
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {selectedOrder.whatsapp_confirm_status === "pending_whatsapp" ? (
                        <Clock className="w-5 h-5 stroke-[2.2]" />
                      ) : (selectedOrder.whatsapp_confirm_status === "cancelled" || selectedOrder.delivery_status === "Cancelled") ? (
                        <X className="w-5 h-5 stroke-[2.2]" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                          WhatsApp Status:
                        </span>
                        {selectedOrder.whatsapp_confirm_status === "pending_whatsapp" ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-200 text-amber-900 animate-pulse">
                            Awaiting Customer Confirmation
                          </span>
                        ) : (selectedOrder.whatsapp_confirm_status === "cancelled" || selectedOrder.delivery_status === "Cancelled") ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-200 text-rose-900">
                            Order Cancelled
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-200 text-emerald-900">
                            Verified & Confirmed
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-slate-600 mt-1">
                        {selectedOrder.whatsapp_confirm_status === "pending_whatsapp"
                          ? `Interactive message with Confirm & Cancel buttons was sent to ${selectedOrder.customer_phone || "customer"}. Awaiting customer button tap.`
                          : (selectedOrder.whatsapp_confirm_status === "cancelled" || selectedOrder.delivery_status === "Cancelled")
                          ? "Order is cancelled. Customer received standard cancellation notice."
                          : "Order verified and confirmed. Standard confirmation template dispatched to customer WhatsApp."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interactive Action Bar inside WhatsApp Card */}
                {(() => {
                  const isModalCancelled =
                    selectedOrder.delivery_status === "Cancelled" ||
                    selectedOrder.status === "Cancelled" ||
                    selectedOrder.whatsapp_confirm_status === "cancelled";
                  const isModalDelivered =
                    selectedOrder.delivery_status === "Delivered" ||
                    selectedOrder.delivery_status === "RTO Delivered";

                  if (isModalCancelled || isModalDelivered) return null;

                  if (selectedOrder.whatsapp_confirm_status === "pending_whatsapp") {
                    return (
                      <div className="pt-2.5 border-t border-amber-200/80 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleResendWAButtons(selectedOrder)}
                          disabled={actionLoadingId === selectedOrder.id}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          title="Resend WhatsApp message with interactive Confirm & Cancel buttons attached"
                        >
                          {actionLoadingId === selectedOrder.id && actionType === "resend" ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <MessageCircle className="w-3.5 h-3.5" />
                          )}
                          <span>Resend WA Buttons</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleManualConfirmOrder(selectedOrder)}
                          disabled={actionLoadingId === selectedOrder.id}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          title="Manually confirm order (sends normal WhatsApp confirmation to customer)"
                        >
                          {actionLoadingId === selectedOrder.id && actionType === "confirm" ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>Manually Confirm Order</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setOrderToCancel(selectedOrder);
                            setCancelReason("Customer requested cancellation");
                            setCancelNotes("");
                          }}
                          disabled={actionLoadingId === selectedOrder.id}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          title="Cancel order, restock inventory, process refund if prepaid, and send cancellation notification"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Order</span>
                        </button>
                      </div>
                    );
                  }

                  if (selectedOrder.whatsapp_confirm_status === "confirmed") {
                    return (
                      <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between">
                        <span className="text-[11px] text-emerald-800 font-medium">✓ Order confirmed and ready for fulfillment.</span>
                        <button
                          type="button"
                          onClick={() => {
                            setOrderToCancel(selectedOrder);
                            setCancelReason("Customer requested cancellation");
                            setCancelNotes("");
                          }}
                          disabled={actionLoadingId === selectedOrder.id}
                          className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Order</span>
                        </button>
                      </div>
                    );
                  }

                  return null;
                })()}
              </div>

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

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Payment Status
                    </label>
                    <select
                      value={editPaymentStatus}
                      onChange={(e) => setEditPaymentStatus(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed / Paid</option>
                      <option value="Refunded">Refunded (Razorpay / Instant)</option>
                      <option value="Failed">Failed</option>
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

      {/* Cancel Order Confirmation Modal */}
      {orderToCancel && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget && actionLoadingId !== orderToCancel.id) {
              setOrderToCancel(null);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-rose-50/80 border-b border-rose-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                  <XCircle className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Cancel Order #{orderToCancel.shopify_order_id || orderToCancel.id}
                  </h3>
                  <p className="text-xs text-rose-600 font-semibold">
                    Order Cancellation & Customer Notification
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                disabled={actionLoadingId === orderToCancel.id}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white/80 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Order Quick Summary */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Customer:</span>
                  <span className="font-bold text-slate-900">{orderToCancel.customer_name} ({orderToCancel.customer_phone})</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Order Total:</span>
                  <span className="font-bold text-slate-900 font-mono">₹{orderToCancel.total_amount}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Payment Method:</span>
                  <span className="font-bold uppercase text-slate-900">{orderToCancel.payment_method}</span>
                </div>
              </div>

              {/* Prepaid / COD Context Banner */}
              {orderToCancel.payment_method !== "COD" &&
               !orderToCancel.payment_method?.toLowerCase().includes("cash on delivery") ? (
                <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 flex items-start gap-2.5">
                  <RotateCcw className="w-4 h-4 text-purple-700 mt-0.5 shrink-0" />
                  <div className="text-xs text-purple-900">
                    <p className="font-bold">Refund Coordination (₹{orderToCancel.total_amount})</p>
                    <p className="mt-0.5 text-purple-700 text-[11px] leading-relaxed">
                      This is a prepaid order. Cancelling will mark the order as Cancelled, restock product inventory, and retrieve customer payment details for refund processing.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                  <div className="text-xs text-amber-900">
                    <p className="font-bold">Cash on Delivery Order</p>
                    <p className="mt-0.5 text-amber-700 text-[11px] leading-relaxed">
                      No customer payment was captured. Cancelling will restock product inventory and release reserved units.
                    </p>
                  </div>
                </div>
              )}

              {/* Cancellation Reason Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cancellation Reason
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  <option value="Customer requested via phone call">Customer requested via phone call</option>
                  <option value="Customer requested cancellation via WhatsApp / Chat">Customer requested cancellation via WhatsApp / Chat</option>
                  <option value="Customer unresponsive to WhatsApp verification">Customer unresponsive to WhatsApp verification</option>
                  <option value="Customer address incomplete or unreachable">Customer address incomplete or unreachable</option>
                  <option value="Duplicate order / Customer changed mind">Duplicate order / Customer changed mind</option>
                  <option value="Item temporarily out of stock">Item temporarily out of stock</option>
                  <option value="Fraud check / Operational reason">Fraud check / Operational reason</option>
                </select>
              </div>

              {/* Optional Custom Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Internal Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spoke with customer at 11:30 AM"
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              {/* Customer Experience Notice */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                ℹ️ <strong>Customer Experience:</strong> Customer will receive standard order cancellation WhatsApp & email templates, and their order on &quot;My Orders&quot; will show Cancelled seamlessly without mentioning admin action.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                disabled={actionLoadingId === orderToCancel.id}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleManualCancelOrder}
                disabled={actionLoadingId === orderToCancel.id}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionLoadingId === orderToCancel.id && actionType === "cancel" ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Cancellation...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Confirm Order Cancellation</span>
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
