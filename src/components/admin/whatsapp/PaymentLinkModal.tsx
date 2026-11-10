"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  Sparkles,
  Send,
  Copy,
  Check,
  Loader2,
  Package,
  Truck,
  MapPin,
  Globe,
  CornerDownLeft,
} from "lucide-react";
import { WhatsAppConversation } from "@/lib/whatsappStore";

interface PaymentLinkModalProps {
  conversation: WhatsAppConversation;
  onClose: () => void;
  onPasteToChat: (renderedText: string) => void;
  onSendDirectly: (renderedText: string) => void;
}

const PRESET_PACKAGES = [
  {
    id: "pack-2",
    name: "Turkiye Jam (2 Sachet Pack)",
    itemAmount: 899,
    deliveryCharge: 49,
    label: "2 Sachets (₹899 + ₹49 = ₹948)",
  },
  {
    id: "pack-3",
    name: "Turkiye Jam (3 Sachet Pack)",
    itemAmount: 1099,
    deliveryCharge: 0,
    label: "3 Sachets (₹1,099 Free Delivery)",
  },
  {
    id: "pack-4",
    name: "Turkiye Jam (4 Sachet Pack)",
    itemAmount: 1399,
    deliveryCharge: 0,
    label: "4 Sachets (₹1,399 Free Delivery)",
  },
  {
    id: "pack-6",
    name: "Turkiye Jam (6 Sachet Pack)",
    itemAmount: 1899,
    deliveryCharge: 0,
    label: "6 Sachets (₹1,899 Free Delivery)",
  },
  {
    id: "box-14",
    name: "Turkiye Jam (14 Sachet Box)",
    itemAmount: 2899,
    deliveryCharge: 0,
    label: "14 Sachets Box (₹2,899 Free Delivery)",
  },
  {
    id: "custom",
    name: "Turkiye Jam Custom Order",
    itemAmount: 899,
    deliveryCharge: 49,
    label: "Custom Amount",
  },
];

export default function PaymentLinkModal({
  conversation,
  onClose,
  onPasteToChat,
  onSendDirectly,
}: PaymentLinkModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("pack-2");
  const [customerName, setCustomerName] = useState(
    conversation.customerName && !conversation.customerName.startsWith("Customer ")
      ? conversation.customerName
      : "Shihab"
  );
  const [customerPhone, setCustomerPhone] = useState(
    conversation.customerPhone || ""
  );
  const [productTitle, setProductTitle] = useState("Turkiye Jam (2 Sachet Pack)");
  const [itemAmount, setItemAmount] = useState<number>(899);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(49);
  const [totalAmount, setTotalAmount] = useState<number>(948);
  const [shippingAddress, setShippingAddress] = useState(
    conversation.shippingAddress || "Gudalur, Nilgiris, Tamil Nadu - 643212"
  );
  const [language, setLanguage] = useState<"ml" | "en">("ml");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync total when item amount or delivery charge changes
  const handleItemAmountChange = (val: number) => {
    setItemAmount(val);
    setTotalAmount(val + deliveryCharge);
    setGeneratedLink(null);
  };

  const handleDeliveryChange = (val: number) => {
    setDeliveryCharge(val);
    setTotalAmount(itemAmount + val);
    setGeneratedLink(null);
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    const found = PRESET_PACKAGES.find((p) => p.id === presetId);
    if (found) {
      setProductTitle(found.name);
      setItemAmount(found.itemAmount);
      setDeliveryCharge(found.deliveryCharge);
      setTotalAmount(found.itemAmount + found.deliveryCharge);
      setGeneratedLink(null);
    }
  };

  // Render message text template
  const getRenderedMessage = (payUrl: string) => {
    const cleanName = customerName.trim() || "Customer";
    const cleanAddr = shippingAddress.trim() || "Delivery address provided on WhatsApp";

    if (language === "ml") {
      return `പ്രിയപ്പെട്ട ${cleanName},

നിങ്ങൾ തിരഞ്ഞെടുത്ത തുർക്കിയെ ജാം ഓർഡർ വിവരങ്ങൾ താഴെ നൽകുന്നു:

📦 പ്രോഡക്റ്റ്: ${productTitle} - ₹${itemAmount}
🚚 ഡെലിവറി ചാർജ്ജ്: ${deliveryCharge > 0 ? `₹${deliveryCharge}` : "സൗജന്യം (FREE)"}
📍 ഡെലിവറി വിലാസം: ${cleanAddr}
💰 ആകെ അടയ്ക്കേണ്ട തുക: ₹${totalAmount}

ഓർഡർ കൺഫേം ചെയ്യാനും സുരക്ഷിതമായി UPI / GPay / PhonePe / Card വഴി പണമടയ്ക്കാനും താഴെയുള്ള ലിങ്കിൽ ക്ലിക്ക് ചെയ്യുക:
👉 ${payUrl}

പെയ്മെന്റ് പൂർത്തിയായാലുടൻ ഓർഡർ പാക്ക് ചെയ്ത് അയക്കുന്നതായിരിക്കും. നന്ദി! 🍯✨`;
    }

    return `Hi ${cleanName},

Thank you for your order details! Here is your order breakdown:

📦 Item: ${productTitle} - ₹${itemAmount}
🚚 Delivery: ${deliveryCharge > 0 ? `₹${deliveryCharge}` : "FREE Express Delivery"}
📍 Shipping to: ${cleanAddr}
💰 Total Payable: ₹${totalAmount}

Please complete your payment via UPI / GPay / PhonePe / Card using our secure payment link below:
👉 ${payUrl}

Once paid, we will immediately dispatch your order with live tracking. Thank you! 🍯✨`;
  };

  const currentPreviewText = getRenderedMessage(
    generatedLink || "https://settler.pydart.com/pay/inv_..."
  );

  // Call API to generate Settler payment link
  const createLink = async (): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/payment-link/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          title: productTitle.trim(),
          itemAmount,
          deliveryCharge,
          totalAmount,
          shippingAddress: shippingAddress.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.payUrl) {
        throw new Error(data.error || "Failed to generate payment link");
      }

      setGeneratedLink(data.payUrl);
      setLoading(false);
      return data.payUrl;
    } catch (err: any) {
      setError(err.message || "Failed to generate link");
      setLoading(false);
      return null;
    }
  };

  const handlePasteToChat = async () => {
    let url = generatedLink;
    if (!url) {
      url = await createLink();
    }
    if (url) {
      const finalMsg = getRenderedMessage(url);
      onPasteToChat(finalMsg);
      onClose();
    }
  };

  const handleSendDirectly = async () => {
    let url = generatedLink;
    if (!url) {
      url = await createLink();
    }
    if (url) {
      const finalMsg = getRenderedMessage(url);
      onSendDirectly(finalMsg);
      onClose();
    }
  };

  const handleCopyLink = async () => {
    let url = generatedLink;
    if (!url) {
      url = await createLink();
    }
    if (url) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-[#1f2c34] text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="h-16 px-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-[#111b21]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Create &amp; Send Payment Link</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                  Settler ⚡ Cashfree
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Custom amounts, UPI QR, GPay &amp; automated WhatsApp invoice breakdown
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-white/10 flex-1 overflow-y-auto">
          {/* Left Form: Amount & Customer Inputs (7 cols) */}
          <div className="md:col-span-7 p-5 space-y-4 overflow-y-auto">
            {/* Quick Preset Packages */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-emerald-500" />
                <span>Quick Package Presets</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_PACKAGES.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => handlePresetSelect(pkg.id)}
                    className={`p-2 rounded-xl text-left text-xs transition-all cursor-pointer border ${
                      selectedPreset === pkg.id
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-300 font-bold shadow-2xs"
                        : "bg-slate-50 dark:bg-[#111b21] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    <div className="truncate font-medium">{pkg.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Product Title */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Product Title / Item Description
              </label>
              <input
                type="text"
                value={productTitle}
                onChange={(e) => {
                  setProductTitle(e.target.value);
                  setGeneratedLink(null);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#111b21] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-emerald-500 font-medium"
              />
            </div>

            {/* Amount Inputs Grid (Item, Delivery, Total) */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-[#111b21] border border-slate-200 dark:border-white/10">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Item Price (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  value={itemAmount}
                  onChange={(e) => handleItemAmountChange(Math.max(0, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-[#1f2c34] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Truck className="w-2.5 h-2.5 text-emerald-500" />
                  <span>Delivery (₹)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={deliveryCharge}
                  onChange={(e) => handleDeliveryChange(Math.max(0, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-[#1f2c34] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 mb-1">
                  Total Payable (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  value={totalAmount}
                  onChange={(e) => {
                    setTotalAmount(Math.max(0, Number(e.target.value)));
                    setGeneratedLink(null);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs font-extrabold rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 focus:outline-emerald-500"
                />
              </div>
            </div>

            {/* Customer Contact & Address */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#111b21] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Customer Phone
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#111b21] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-emerald-500"
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-500" />
                <span>Delivery Address (as confirmed in WhatsApp)</span>
              </label>
              <textarea
                rows={2}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="e.g. Gudalur, Nilgiris, Tamil Nadu - 643212"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#111b21] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-emerald-500 resize-none"
              />
            </div>

            {/* Language Switch */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span>Message Language</span>
              </span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#111b21] p-0.5 rounded-xl border border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setLanguage("ml")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    language === "ml"
                      ? "bg-white dark:bg-[#1f2c34] text-emerald-600 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  മലയാളം (Malayalam)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    language === "en"
                      ? "bg-white dark:bg-[#1f2c34] text-emerald-600 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-300 text-xs font-medium">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Right Preview Column (5 cols) */}
          <div className="md:col-span-5 p-5 bg-slate-50/70 dark:bg-[#111b21]/70 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Live WhatsApp Preview
                </span>
                {generatedLink && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Live Link Ready
                  </span>
                )}
              </div>

              {/* WhatsApp Bubble Preview */}
              <div className="p-4 rounded-2xl bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-white text-xs whitespace-pre-wrap leading-relaxed shadow-sm rounded-tr-xs border border-emerald-500/20 font-sans">
                {currentPreviewText}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-white/10 space-y-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePasteToChat}
                  disabled={loading}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white dark:bg-[#1f2c34] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                  title="Generate link and insert message text into input box"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  ) : (
                    <CornerDownLeft className="w-4 h-4 text-emerald-600" />
                  )}
                  <span>Paste to Chat</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-xl bg-white dark:bg-[#1f2c34] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                  title="Copy payment link to clipboard"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{copied ? "Copied" : "Copy Link"}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSendDirectly}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Generate &amp; Send to Customer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

