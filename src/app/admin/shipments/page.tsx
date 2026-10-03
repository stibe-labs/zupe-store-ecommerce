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
} from "lucide-react";
import { ERPOrder } from "@/lib/erpStore";

export default function AdminShipmentsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<ERPOrder[]>([]);
  const [search, setSearch] = useState("");
  const [courierFilter, setCourierFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/orders");
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      } catch (e) {
        console.warn(e);
      }
    }
    load();
  }, []);

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
        <AdminHeader onOpenMobile={() => setMobileSidebarOpen(true)} />

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
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search AWB, Customer, Order..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <select
                value={courierFilter}
                onChange={(e) => setCourierFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700"
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
                    <th className="py-3.5 px-4 text-right">Freight Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-5 font-mono font-bold text-blue-600 whitespace-nowrap">
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
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">
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
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        {item.ndr_status !== "None" ? (
                          <span className="text-amber-700 font-semibold">{item.ndr_status}</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        ₹{item.shipping_cost}
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
