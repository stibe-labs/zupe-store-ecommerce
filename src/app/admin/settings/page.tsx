"use client";

import React, { useState, useEffect } from "react";
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
  Store,
  Check,
  AlertTriangle,
  Activity,
  Layers,
} from "lucide-react";
import { ERPIntegrationsSettings } from "@/lib/erpStore";

export default function AdminSettingsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ provider: string; success: boolean; message: string } | null>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  // Store Profile
  const [storeName, setStoreName] = useState("Zupe Store India");
  const [supportEmail, setSupportEmail] = useState("support@zupestore.in");
  const [supportPhone, setSupportPhone] = useState("+91 98765 43210");
  const [currency, setCurrency] = useState("INR (₹)");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("499");
  const [standardShippingFee, setStandardShippingFee] = useState("49");

  // Shopify
  const [shopifyDomain, setShopifyDomain] = useState("zupe-store.myshopify.com");
  const [shopifyToken, setShopifyToken] = useState("shpat_live_98a76d54f32e10cba");
  const [shopifyWebhookSecret, setShopifyWebhookSecret] = useState("whsec_9871122334455");
  const [shopifyActive, setShopifyActive] = useState(true);

  // Shiprocket
  const [shiprocketEmail, setShiprocketEmail] = useState("logistics@zupestore.com");
  const [shiprocketToken, setShiprocketToken] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
  const [shiprocketAutoSync, setShiprocketAutoSync] = useState(true);
  const [preferredCourier, setPreferredCourier] = useState("Delhivery Priority");
  const [shiprocketActive, setShiprocketActive] = useState(true);

  // Meta
  const [metaAccountId, setMetaAccountId] = useState("act_109283746552");
  const [metaToken, setMetaToken] = useState("EAAK10928374...");
  const [metaPixelId, setMetaPixelId] = useState("982736451029384");
  const [metaActive, setMetaActive] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        const s: ERPIntegrationsSettings = data.settings;
        if (s.storeProfile) {
          setStoreName(s.storeProfile.storeName || "Zupe Store India");
          setSupportEmail(s.storeProfile.supportEmail || "support@zupestore.in");
          setSupportPhone(s.storeProfile.supportPhone || "+91 98765 43210");
          setCurrency(s.storeProfile.currency || "INR (₹)");
          setFreeShippingThreshold(String(s.storeProfile.freeShippingThreshold ?? 499));
          setStandardShippingFee(String(s.storeProfile.standardShippingFee ?? 49));
        }
        if (s.shopify) {
          setShopifyDomain(s.shopify.domain || "");
          setShopifyToken(s.shopify.token || "");
          setShopifyWebhookSecret(s.shopify.webhookSecret || "");
          setShopifyActive(s.shopify.isActive !== false);
        }
        if (s.shiprocket) {
          setShiprocketEmail(s.shiprocket.email || "");
          setShiprocketToken(s.shiprocket.token || "");
          setShiprocketAutoSync(s.shiprocket.autoSync !== false);
          setPreferredCourier(s.shiprocket.preferredCourier || "Delhivery Priority");
          setShiprocketActive(s.shiprocket.isActive !== false);
        }
        if (s.meta) {
          setMetaAccountId(s.meta.accountId || "");
          setMetaToken(s.meta.token || "");
          setMetaPixelId(s.meta.pixelId || "");
          setMetaActive(s.meta.isActive !== false);
        }
      }
    } catch (err) {
      console.warn("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage(null);

    const payload = {
      storeProfile: {
        storeName: storeName.trim(),
        supportEmail: supportEmail.trim(),
        supportPhone: supportPhone.trim(),
        currency,
        freeShippingThreshold: Number(freeShippingThreshold) || 499,
        standardShippingFee: Number(standardShippingFee) || 49,
      },
      shopify: {
        domain: shopifyDomain.trim(),
        token: shopifyToken.trim(),
        webhookSecret: shopifyWebhookSecret.trim(),
        isActive: shopifyActive,
      },
      shiprocket: {
        email: shiprocketEmail.trim(),
        token: shiprocketToken.trim(),
        autoSync: shiprocketAutoSync,
        preferredCourier,
        isActive: shiprocketActive,
      },
      meta: {
        accountId: metaAccountId.trim(),
        token: metaToken.trim(),
        pixelId: metaPixelId.trim(),
        isActive: metaActive,
      },
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSavedMessage("All integration credentials and store settings saved securely!");
        setTimeout(() => setSavedMessage(null), 5000);
      }
    } catch (err) {
      console.error("Save settings error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (provider: "shopify" | "shiprocket" | "meta") => {
    setTestingProvider(provider);
    setTestResult(null);

    let testPayload: any = { action: "test_connection", provider };
    if (provider === "shopify") {
      testPayload.domain = shopifyDomain;
      testPayload.token = shopifyToken;
    } else if (provider === "shiprocket") {
      testPayload.email = shiprocketEmail;
      testPayload.token = shiprocketToken;
    } else if (provider === "meta") {
      testPayload.accountId = metaAccountId;
      testPayload.token = metaToken;
    }

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testPayload),
      });
      const data = await res.json();
      setTestResult({
        provider,
        success: Boolean(data.success),
        message: data.message || (data.success ? "Connection verified!" : "Handshake failed."),
      });
    } catch (err: any) {
      setTestResult({
        provider,
        success: false,
        message: "Failed to connect to verification server.",
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const handleBackupExport = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      storeProfile: {
        storeName,
        supportEmail,
        supportPhone,
        currency,
        freeShippingThreshold,
        standardShippingFee,
      },
      integrations: {
        shopify: { domain: shopifyDomain, isActive: shopifyActive },
        shiprocket: { email: shiprocketEmail, preferredCourier, autoSync: shiprocketAutoSync },
        meta: { accountId: metaAccountId, pixelId: metaPixelId },
      },
      exportedBy: "Zupe Administrator",
    };

    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `zupe_store_erp_settings_backup_${new Date().toISOString().split("T")[0]}.json`
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Integrations & API Settings
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Live Persistent
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Configure live API tokens for Shopify orders, Shiprocket logistics, and Meta Conversion tracking.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleBackupExport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export ERP Backup</span>
              </button>
            </div>
          </div>

          {savedMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm flex items-center gap-2 font-semibold shadow-sm animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{savedMessage}</span>
            </div>
          )}

          {testResult && (
            <div
              className={`p-4 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-2 font-semibold shadow-sm animate-in fade-in ${
                testResult.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>
                  <strong className="uppercase font-bold tracking-wider mr-1">[{testResult.provider}]:</strong>
                  {testResult.message}
                </span>
              </div>
              <button
                onClick={() => setTestResult(null)}
                className="text-xs opacity-60 hover:opacity-100"
              >
                Dismiss
              </button>
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200/90 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-[#FA521C] animate-spin" />
              <p className="text-sm font-semibold text-slate-600">Loading stored integration credentials...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6 text-xs sm:text-sm">
              {/* 1. General Store Profile */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FA521C] flex items-center justify-center">
                    <Store className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Store Profile & Logistics Policy</h3>
                    <p className="text-xs text-slate-500">General store identity, customer support details, and shipping thresholds</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Store Brand Name
                    </label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Customer Helpline Phone
                    </label>
                    <input
                      type="text"
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Store Currency
                    </label>
                    <input
                      type="text"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Free Shipping Min Order (₹)
                    </label>
                    <input
                      type="number"
                      value={freeShippingThreshold}
                      onChange={(e) => setFreeShippingThreshold(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Standard Shipping Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={standardShippingFee}
                      onChange={(e) => setStandardShippingFee(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Shopify Integration Box */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Shopify Storefront Sync</h3>
                      <p className="text-xs text-slate-500">Automatic order ingest and fulfillment tracking sync</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTestConnection("shopify")}
                      disabled={testingProvider === "shopify"}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {testingProvider === "shopify" ? "Testing..." : "Test Connection"}
                    </button>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  </div>
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
                    Auto-Configured Webhook Ingestion URL
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="https://zupe-store.stibelabs.workers.dev/api/admin/sync/shopify"
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-xs text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* 3. Shiprocket Logistics Box */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FA521C] flex items-center justify-center">
                      <Truck className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Shiprocket Logistics Gateway</h3>
                      <p className="text-xs text-slate-500">Live courier AWB generation, NDR automation, and RTO events</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTestConnection("shiprocket")}
                      disabled={testingProvider === "shiprocket"}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {testingProvider === "shiprocket" ? "Testing..." : "Test Connection"}
                    </button>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Preferred Courier Routing
                    </label>
                    <select
                      value={preferredCourier}
                      onChange={(e) => setPreferredCourier(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="Delhivery Priority">Delhivery Priority (Recommended)</option>
                      <option value="Bluedart Express">Bluedart Express</option>
                      <option value="Shadowfax Local">Shadowfax Local</option>
                      <option value="Xpressbees Standard">Xpressbees Standard</option>
                    </select>
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

              {/* 4. Meta Ads Box */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Key className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Meta Marketing & Conversion API (CAPI)</h3>
                      <p className="text-xs text-slate-500">Track campaign spend, customer ROAS, and purchase events</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTestConnection("meta")}
                      disabled={testingProvider === "meta"}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {testingProvider === "meta" ? "Testing..." : "Test Connection"}
                    </button>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700">
                      CAPI Ready
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      Meta Pixel ID
                    </label>
                    <input
                      type="text"
                      value={metaPixelId}
                      onChange={(e) => setMetaPixelId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      System User Access Token
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

              {/* Submit Action */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FA521C] hover:bg-[#D4380D] text-white rounded-xl font-bold shadow-md shadow-orange-500/25 text-xs sm:text-sm transition-all disabled:opacity-60"
                >
                  <Save className={`w-4 h-4 ${saving ? "animate-spin" : ""}`} />
                  <span>{saving ? "Saving All Settings..." : "Save All Settings"}</span>
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
