"use client";

import React, { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { UserCheck, Search, Phone, Mail, MapPin, X } from "lucide-react";

export default function AdminCustomersPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const customers = [
    { name: "Rahul Mishra", phone: "+91 98112 34567", email: "rahul.m@gmail.com", city: "Mumbai, Maharashtra", orders: 3, spend: 3297, rtoCount: 1 },
    { name: "Sneha Kapoor", phone: "+91 98223 45678", email: "sneha.k@outlook.com", city: "Gurugram, Haryana", orders: 5, spend: 7495, rtoCount: 0 },
    { name: "Amit Bansal", phone: "+91 98450 11223", email: "amit.b@yahoo.com", city: "Bengaluru, Karnataka", orders: 2, spend: 1798, rtoCount: 0 },
    { name: "Vikram Singh", phone: "+91 99100 88776", email: "vikram.s@gmail.com", city: "Chennai, Tamil Nadu", orders: 4, spend: 5196, rtoCount: 0 },
    { name: "Pooja Nair", phone: "+91 98470 55443", email: "pooja.n@gmail.com", city: "Thiruvananthapuram, Kerala", orders: 2, spend: 1398, rtoCount: 0 },
  ];

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

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
                Customer Database
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Customer profiles, order frequency, delivery reliability, and lifetime value.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, phone, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
          </div>

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
                    <th className="py-3.5 px-4 text-right">RTO Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filtered.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                        {c.name}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-semibold text-blue-600">{c.phone}</p>
                        <p className="text-[11px] text-slate-400">{c.email}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {c.city}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        {c.orders} orders
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        ₹{c.spend.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            c.rtoCount === 0
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {c.rtoCount === 0 ? "0% (Clean)" : `${((c.rtoCount / c.orders) * 100).toFixed(0)}% RTO`}
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
    </div>
  );
}
