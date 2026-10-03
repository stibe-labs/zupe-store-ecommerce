"use client";

import React, { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Settings,
  ShoppingBag,
  Truck,
  Database,
  Key,
  Shield,
  CheckCircle2,
  RefreshCw,
  Save,
  Download,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Form states
  const [shopifyDomain, setShopifyDomain] = useState("zupe-store.myshopify.com");
  const [shopifyToken, setShopifyToken] = useState("shpat_live_98a76d54f32e10cba");
  const [shopifyWebhookSecret, setShopifyWebhookSecret] = useState("whsec_9871122334455");

  const [shiprocketEmail, setShiprocketEmail] = useState("logistics@zupestore.com");
  const [shiprocketToken, setShiprocketToken] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
  const [shiprocketAutoSync, setShiprocketAutoSync] = useState(true);

  const [metaAccountId, setMetaAccountId] = useState("act_109283746552");
  const [metaToken, setMetaToken] = useState("EAAK10928374...");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage("Settings and API credentials updated successfully.");
    setTimeout(() => setSavedMessage(null), 4000);
  };

  const handleBackupExport = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      store: "Zupe Store",
      integrations: {
        shopifyDomain,
        shiprocketEmail,
        metaAccountId,
      },
      exportedBy: "Admin",
    };

    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `zupe_store_erp_backup_${new Date().toISOString().split("T")[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans">
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminHeader onOpenMobile={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1200px] w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Integrations & API Settings
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Configure connections for Shopify, Shiprocket, and Meta Ads.
              </p>
            </div>

            <button
              onClick={handleBackupExport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Full ERP Backup</span>
            </button>
          </div>

          {savedMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{savedMessage}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6 text-xs sm:text-sm">
            {/* Shopify Integration Box */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Shopify Connection</h3>
                    <p className="text-xs text-slate-500">Automatic order and fulfillment synchronization</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Shopify Store Domain (.myshopify.com)
                  </label>
                  <input
                    type="text"
                    value={shopifyDomain}
                    onChange={(e) => setShopifyDomain(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Shopify Admin Access Token
                  </label>
                  <input
                    type="password"
                    value={shopifyToken}
                    onChange={(e) => setShopifyToken(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Webhook Ingestion URL (Auto-configured)
                </label>
                <input
                  type="text"
                  readOnly
                  value="https://zupe-store.stibelabs.workers.dev/api/admin/sync/shopify"
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-xs text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Shiprocket Logistics Box */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Truck className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Shiprocket Logistics</h3>
                    <p className="text-xs text-slate-500">Live courier AWB tracking, NDR management, and RTO events</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Shiprocket Account Email
                  </label>
                  <input
                    type="email"
                    value={shiprocketEmail}
                    onChange={(e) => setShiprocketEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Shiprocket API Token / JWT
                  </label>
                  <input
                    type="password"
                    value={shiprocketToken}
                    onChange={(e) => setShiprocketToken(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Shiprocket Webhook Receiver URL
                </label>
                <input
                  type="text"
                  readOnly
                  value="https://zupe-store.stibelabs.workers.dev/api/admin/sync/shiprocket"
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-xs text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Meta Ads Box */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Key className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Meta Ads Integration</h3>
                    <p className="text-xs text-slate-500">Track campaign spend and customer acquisition cost (CAC)</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700">
                  Ready
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Meta Ad Account ID
                  </label>
                  <input
                    type="text"
                    value={metaAccountId}
                    onChange={(e) => setMetaAccountId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Meta System User Access Token
                  </label>
                  <input
                    type="password"
                    value={metaToken}
                    onChange={(e) => setMetaToken(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 text-xs sm:text-sm transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
