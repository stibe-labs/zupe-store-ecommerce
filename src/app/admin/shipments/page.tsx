"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Truck,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Phone,
  X,
  RefreshCw,
  Zap,
} from "lucide-react";
import { ERPOrder } from "@/lib/erpStore";

export default function AdminShipmentsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<ERPOrder[]>([]);
  const [search, setSearch] = useState("");
  const [courierFilter, setCourierFilter] = useState("all");

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeneratingAWB, setIsGeneratingAWB] = useState<string | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<ERPOrder | null>(null);
  const [editDeliveryStatus, setEditDeliveryStatus] = useState("In Transit");
  const [editCourier, setEditCourier] = useState("Delhivery");
  const [editAWB, setEditAWB] = useState("");
  const [editNDR, setEditNDR] = useState("None");
  const [isSaving, setIsSaving] = useState(false);
  const [modalMsg, setModalMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchOrders = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedShipment) {
      setEditDeliveryStatus(selectedShipment.delivery_status || "In Transit");
      setEditCourier(selectedShipment.courier_partner || "Delhivery");
      setEditAWB(selectedShipment.shiprocket_awb || "");
      setEditNDR(selectedShipment.ndr_status || "None");
      setModalMsg(null);

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
  }, [selectedShipment]);

  const handleSaveShipment = async () => {
    if (!selectedShipment) return;
    setIsSaving(true);
    setModalMsg(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: selectedShipment.id,
          delivery_status: editDeliveryStatus,
          courier_partner: editCourier,
          shiprocket_awb: editAWB,
          ndr_status: editNDR,
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setSelectedShipment(data.order);
        setOrders((prev) =>
          prev.map((o) => (o.id === data.order.id ? data.order : o))
        );
        setModalMsg({ text: "Shipment status updated!", type: "success" });
      } else {
        setModalMsg({ text: data.error || "Update failed", type: "error" });
      }
    } catch (err: any) {
      setModalMsg({ text: err.message || "Network error", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateAWB = async (orderId: string, preferredCourier?: string) => {
    setIsGeneratingAWB(orderId);
    setModalMsg(null);
    try {
      const res = await fetch("/api/admin/sync/shiprocket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_awb",
          order_id: orderId,
          preferredCourier: preferredCourier || editCourier,
        }),
      });
      const data = await res.json();
      if (data.success && data.awb) {
        setEditAWB(data.awb);
        setEditDeliveryStatus(data.delivery_status || "In Transit");
        if (data.courier) setEditCourier(data.courier);

        // Update in orders list
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  shiprocket_awb: data.awb,
                  tracking_number: data.awb,
                  courier_partner: data.courier || o.courier_partner,
                  delivery_status: data.delivery_status || "In Transit",
                  status: data.delivery_status || "In Transit",
                }
              : o
          )
        );

        if (selectedShipment && selectedShipment.id === orderId) {
          setSelectedShipment((prev) =>
            prev
              ? {
                  ...prev,
                  shiprocket_awb: data.awb,
                  tracking_number: data.awb,
                  courier_partner: data.courier || prev.courier_partner,
                  delivery_status: data.delivery_status || "In Transit",
                  status: data.delivery_status || "In Transit",
                }
              : null
          );
        }

        setModalMsg({
          text: data.message || `Generated AWB ${data.awb} via ${data.courier || "Courier"}!`,
          type: "success",
        });
      } else {
        setModalMsg({
          text: data.error || "Failed to generate Shiprocket AWB",
          type: "error",
        });
      }
    } catch (err: any) {
      setModalMsg({ text: err.message || "Network error", type: "error" });
    } finally {
      setIsGeneratingAWB(null);
    }
  };

  const filtered = orders.filter((o) => {
    if (courierFilter !== "all" && o.courier_partner !== courierFilter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      return (
        o.shopify_order_id.toLowerCase().includes(s) ||
        o.customer_name.toLowerCase().includes(s) ||
        (o.shiprocket_awb && o.shiprocket_awb.toLowerCase().includes(s))
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
          onRefresh={fetchOrders}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Shiprocket Logistics & Consignments
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Real-time tracking of packages across Delhivery, Bluedart, Xpressbees, and Shadowfax.
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search AWB, Customer, Order..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200/60"
                  aria-label="Clear shipments search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <select
                value={courierFilter}
                onChange={(e) => setCourierFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00] focus:outline-none"
              >
                <option value="all">All Courier Partners</option>
                <option value="Delhivery">Delhivery</option>
                <option value="Bluedart">Bluedart</option>
                <option value="Xpressbees">Xpressbees</option>
                <option value="Shadowfax">Shadowfax</option>
              </select>
            </div>
          </div>

          {/* Shipments List */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-5">AWB Tracking #</th>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Courier</th>
                    <th className="py-3.5 px-4">Recipient</th>
                    <th className="py-3.5 px-4">Destination</th>
                    <th className="py-3.5 px-4">Delivery Status</th>
                    <th className="py-3.5 px-4">NDR Reason</th>
                    <th className="py-3.5 px-4">Freight Fee</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-5 font-mono font-bold text-[#FF7A00] whitespace-nowrap">
                        {item.shiprocket_awb || "AWB-PENDING"}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {item.shopify_order_id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        {item.courier_partner || "Delhivery"}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-900">{item.customer_name}</p>
                        <p className="text-[11px] text-slate-400">{item.customer_phone}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {item.shipping_address}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.delivery_status === "Delivered" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                          </span>
                        )}
                        {item.delivery_status === "In Transit" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-700">
                            <Truck className="w-3.5 h-3.5" /> In Transit
                          </span>
                        )}
                        {item.delivery_status === "NDR" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">
                            <AlertTriangle className="w-3.5 h-3.5" /> NDR
                          </span>
                        )}
                        {item.delivery_status === "RTO Delivered" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                            <RotateCcw className="w-3.5 h-3.5" /> RTO Delivered
                          </span>
                        )}
                        {item.delivery_status === "Out for Delivery" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700">
                            <Clock className="w-3.5 h-3.5" /> Out for Delivery
                          </span>
                        )}
                        {item.delivery_status === "Processing" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                            <Clock className="w-3.5 h-3.5" /> Processing
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        {item.ndr_status !== "None" ? (
                          <span className="text-amber-700 font-semibold">{item.ndr_status}</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        ₹{item.shipping_cost}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {(!item.shiprocket_awb || item.shiprocket_awb.includes("PENDING")) && (
                            <button
                              type="button"
                              onClick={() => handleGenerateAWB(item.id, item.courier_partner)}
                              disabled={isGeneratingAWB === item.id}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 disabled:opacity-50"
                              title="Generate Shiprocket AWB"
                            >
                              {isGeneratingAWB === item.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Zap className="w-3 h-3 text-amber-600" />
                              )}
                              <span>AWB</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedShipment(item)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-all"
                          >
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Shipment Update Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Update Shipment: {selectedShipment.shopify_order_id}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  AWB: {selectedShipment.shiprocket_awb || "Pending"}
                </p>
              </div>
              <button
                onClick={() => setSelectedShipment(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  modalMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {modalMsg.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                )}
                <span>{modalMsg.text}</span>
              </div>
            )}

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Delivery Status
                </label>
                <select
                  value={editDeliveryStatus}
                  onChange={(e) => setEditDeliveryStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
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
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
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
                    onClick={() => handleGenerateAWB(selectedShipment.id, editCourier)}
                    disabled={isGeneratingAWB === selectedShipment.id}
                    className="text-[11px] font-bold text-[#FF7A00] hover:text-[#E66E00] flex items-center gap-1 disabled:opacity-50"
                  >
                    {isGeneratingAWB === selectedShipment.id ? (
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
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  NDR / Exception Note
                </label>
                <input
                  type="text"
                  value={editNDR}
                  onChange={(e) => setEditNDR(e.target.value)}
                  placeholder="e.g. Customer Unavailable / None"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedShipment(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-all"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleSaveShipment}
                disabled={isSaving}
                className="px-5 py-2 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl font-semibold text-xs transition-all shadow-sm shadow-orange-500/25 flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Shipment</span>
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
