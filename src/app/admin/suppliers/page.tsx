"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import Link from "next/link";
import {
  Users,
  Plus,
  Phone,
  Mail,
  MapPin,
  RotateCcw,
  Wallet,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Supplier } from "@/lib/erpStore";

export default function AdminSuppliersPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/admin/suppliers");
      const data = await res.json();
      if (data.success && Array.isArray(data.suppliers)) {
        setSuppliers(data.suppliers);
      }
    } catch (err) {
      console.warn("Error fetching suppliers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

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
                Suppliers & Credit Balances
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Directory of product suppliers and their isolated RTO refund balances.
              </p>
            </div>

            <Link
              href="/admin/rto-refund-balance"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Open RTO Ledger</span>
            </Link>
          </div>

          {/* Supplier Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {suppliers.map((sup) => (
              <div
                key={sup.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 font-mono">
                        {sup.code}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base">
                        {sup.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{sup.contact_person || "Contact Representative"}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Available Credit
                    </span>
                    <span className="text-xl font-black text-blue-600">
                      ₹{sup.available_rto_balance.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                  <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100/60">
                    <span className="text-emerald-700 block text-[11px]">Total Credited</span>
                    <span className="font-bold text-emerald-900 text-sm mt-0.5 block">
                      ₹{sup.total_credits_added.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-100/60">
                    <span className="text-rose-700 block text-[11px]">Credits Used</span>
                    <span className="font-bold text-rose-900 text-sm mt-0.5 block">
                      ₹{sup.total_credits_used.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100/60">
                    <span className="text-amber-700 block text-[11px]">Pending Verification</span>
                    <span className="font-bold text-amber-900 text-sm mt-0.5 block">
                      ₹{(sup.pending_credits || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    {sup.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {sup.phone}
                      </span>
                    )}
                    {sup.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {sup.email}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/admin/rto-refund-balance?supplier_id=${sup.id}`}
                    className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                  >
                    <span>View Ledger</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
