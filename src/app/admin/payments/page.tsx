"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  CreditCard,
  Plus,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  RefreshCw,
  X,
  FileCheck,
} from "lucide-react";
import { RemittanceRecord } from "@/lib/erpStore";

export default function AdminPaymentsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [remittances, setRemittances] = useState<RemittanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [metrics, setMetrics] = useState({
    totalCollected: 40850,
    totalDeducted: 4910,
    totalRemitted: 35940,
    pendingCODRemittance: 84600,
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [crnId, setCrnId] = useState("");
  const [courier, setCourier] = useState("Shiprocket (Delhivery)");
  const [collected, setCollected] = useState("");
  const [deducted, setDeducted] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [bankUtr, setBankUtr] = useState("");
  const [ordersCount, setOrdersCount] = useState("5");

  const fetchRemittances = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/remittances");
      const data = await res.json();
      if (data.success) {
        setRemittances(data.remittances || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.warn("Error fetching remittances:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRemittances();
  }, []);

  // Lock background scroll when modals are open
  useEffect(() => {
    if (showAddModal) {
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
  }, [showAddModal]);

  const handleAddRemittance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crnId || !collected || !date) return;

    try {
      const res = await fetch("/api/admin/remittances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crn_id: crnId,
          courier,
          total_cod_collected: Number(collected),
          courier_charges_deducted: Number(deducted || 0),
          remittance_date: date,
          bank_utr: bankUtr,
          status: "Remitted",
          orders_count: Number(ordersCount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setCrnId("");
        setCollected("");
        setDeducted("");
        setBankUtr("");
        fetchRemittances();
      }
    } catch (err) {
      console.error(err);
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
          onRefresh={fetchRemittances}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Payments & COD Courier Remittances
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Reconcile cash collected by courier partners against bank deposits and track pending payouts.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FA521C] hover:bg-[#D4380D] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm shadow-orange-500/25"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Record Remittance</span>
              </button>
            </div>
          </div>

          {/* 4 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total COD Collected
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                ₹{metrics.totalCollected.toLocaleString("en-IN")}
              </p>
              <span className="text-xs text-slate-500 mt-1 block">Doorstep cash receipts</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Courier Charges Deducted
              </p>
              <p className="text-2xl font-bold text-rose-600 mt-1">
                ₹{metrics.totalDeducted.toLocaleString("en-IN")}
              </p>
              <span className="text-xs text-slate-500 mt-1 block">Freight & COD processing fees</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Net Remitted to Bank
              </p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                ₹{metrics.totalRemitted.toLocaleString("en-IN")}
              </p>
              <span className="text-xs text-emerald-600 font-semibold mt-1 block">Settled via NEFT / RTGS</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pending COD Remittance
              </p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                ₹{metrics.pendingCODRemittance.toLocaleString("en-IN")}
              </p>
              <span className="text-xs text-amber-700 font-semibold mt-1 block">Courier payout pipeline</span>
            </div>
          </div>

          {/* Remittance Batches Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                Courier Remittance Settlements (CRN History)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Remittance Date</th>
                    <th className="py-3.5 px-4">CRN ID</th>
                    <th className="py-3.5 px-4">Courier Partner</th>
                    <th className="py-3.5 px-4">Orders</th>
                    <th className="py-3.5 px-4">COD Collected</th>
                    <th className="py-3.5 px-4">Deductions</th>
                    <th className="py-3.5 px-4">Net Deposited</th>
                    <th className="py-3.5 px-4">Bank UTR Ref</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {remittances.map((rem) => (
                    <tr key={rem.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 sm:px-6 font-mono text-slate-600 whitespace-nowrap">
                        {rem.remittance_date}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#FA521C] whitespace-nowrap">
                        {rem.crn_id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        {rem.courier}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                        {rem.orders_count} pkgs
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        ₹{rem.total_cod_collected.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-rose-600 font-semibold whitespace-nowrap">
                        -₹{rem.courier_charges_deducted.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-emerald-600 font-bold whitespace-nowrap">
                        ₹{rem.net_remitted_amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {rem.bank_utr || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            rem.status === "Remitted"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {rem.status === "Remitted" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          {rem.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Record Remittance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto overscroll-contain">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Record Courier Remittance
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRemittance} className="mt-4 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    CRN ID
                  </label>
                  <input
                    type="text"
                    placeholder="CRN-SR-20261005"
                    value={crnId}
                    onChange={(e) => setCrnId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Courier Partner
                  </label>
                  <input
                    type="text"
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    COD Collected (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="15000"
                    value={collected}
                    onChange={(e) => setCollected(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Charges Deducted (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="1800"
                    value={deducted}
                    onChange={(e) => setDeducted(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Remittance Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bank UTR Reference
                  </label>
                  <input
                    type="text"
                    placeholder="HDFC000987654"
                    value={bankUtr}
                    onChange={(e) => setBankUtr(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FA521C]/20 focus:border-[#FA521C] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FA521C] text-white rounded-xl hover:bg-[#D4380D] font-semibold shadow-sm shadow-orange-500/25"
                >
                  Save Remittance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
