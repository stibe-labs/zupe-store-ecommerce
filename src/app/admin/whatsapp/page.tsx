"use client";

import React, { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import WhatsAppLayout from "@/components/admin/whatsapp/WhatsAppLayout";

function AdminWhatsAppContent() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F172A] flex text-slate-100 antialiased font-sans">
      {/* Admin Sidebar Navigation */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 h-screen overflow-hidden">
        {/* Admin Header */}
        <AdminHeader onOpenMobile={() => setMobileSidebarOpen(true)} />

        {/* WhatsApp Web Experience */}
        <main className="flex-1 p-2 sm:p-3 overflow-hidden flex flex-col min-h-0">
          <WhatsAppLayout />
        </main>
      </div>
    </div>
  );
}

export default function AdminWhatsAppPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
          <div className="text-center">
            <div className="w-9 h-9 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-emerald-400">Loading WhatsApp Desk...</p>
          </div>
        </div>
      }
    >
      <AdminWhatsAppContent />
    </React.Suspense>
  );
}

