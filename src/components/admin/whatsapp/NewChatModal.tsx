"use client";

import React, { useState } from "react";
import { X, UserPlus, Phone, User, ShoppingBag, Send, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { WHATSAPP_TEMPLATES, WhatsAppTemplate } from "@/lib/whatsappStore";

interface NewChatModalProps {
  onClose: () => void;
  onCreateChat: (payload: {
    customerPhone: string;
    customerName: string;
    customerEmail?: string;
    orderId?: string;
    category?: "orders" | "ndr" | "abandoned" | "internal";
    initialMessage?: string;
    templateId?: string;
  }) => void;
}

export default function NewChatModal({ onClose, onCreateChat }: NewChatModalProps) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [category, setCategory] = useState<"orders" | "ndr" | "abandoned" | "internal">("orders");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("malayalam_pricing_inquiry");
  const [showPreview, setShowPreview] = useState(true);
  const [error, setError] = useState("");

  const cleanDigits = phone.replace(/\D/g, "");
  const fallbackName = cleanDigits.length >= 4 ? `Customer (${cleanDigits.slice(-4)})` : "Customer";
  const effectiveName = name.trim() || fallbackName;

  const selectedTemplate = WHATSAPP_TEMPLATES.find((t) => t.id === selectedTemplateId);

  const renderTemplateText = (tpl?: WhatsAppTemplate) => {
    if (!tpl) return "";
    let text = tpl.body;
    text = text.replace(/{{name}}/g, effectiveName.split(" ")[0]);
    text = text.replace(/{{order_id}}/g, orderId.trim() ? `#${orderId.trim()}` : "#ORD-10492");
    text = text.replace(/{{amount}}/g, "899");
    text = text.replace(/{{address}}/g, "your delivery address");
    text = text.replace(/{{courier}}/g, "Shiprocket / Express Logistics");
    text = text.replace(/{{awb}}/g, "SR188920489IN");
    return text;
  };

  const previewText = renderTemplateText(selectedTemplate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || cleanDigits.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    const messageToSend = selectedTemplateId !== "none" ? previewText : undefined;

    onCreateChat({
      customerPhone: phone.trim(),
      customerName: effectiveName,
      customerEmail: email.trim() || undefined,
      orderId: orderId.trim() || undefined,
      category,
      initialMessage: messageToSend,
      templateId: selectedTemplateId !== "none" ? selectedTemplateId : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#1f2c34] text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-white/10 p-5 sm:p-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="font-bold text-base leading-tight">Start New WhatsApp Chat</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Enter phone number & choose a message to dispatch immediately
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Phone Number Field */}
          <div>
            <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
              Mobile Phone Number (WhatsApp)*
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 font-mono font-medium">+91</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (error) setError("");
                }}
                placeholder="98765 43210"
                className="w-full bg-[#f0f2f5] dark:bg-[#111b21] rounded-xl pl-12 pr-3 py-2.5 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:outline-hidden"
                autoFocus
              />
            </div>
          </div>

          {/* Template Selection Box */}
          <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-[#111b21] border border-emerald-200/80 dark:border-emerald-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Select Message / Template to Send:</span>
              </label>
              {selectedTemplateId !== "none" && (
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  {showPreview ? <>Hide Preview <ChevronUp className="w-3 h-3" /></> : <>Show Preview <ChevronDown className="w-3 h-3" /></>}
                </button>
              )}
            </div>

            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full bg-white dark:bg-[#202c33] rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white border border-emerald-300 dark:border-emerald-700/60 focus:border-emerald-500 focus:outline-hidden cursor-pointer"
            >
              <option value="malayalam_pricing_inquiry">
                🌿 മലയാളം പ്രൈസിംഗ് & ഓർഡർ (Malayalam Pricing & Inquiry)
              </option>
              {WHATSAPP_TEMPLATES.filter((t) => t.id !== "malayalam_pricing_inquiry").map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.category})
                </option>
              ))}
              <option value="none">💬 None (Open blank chat without sending)</option>
            </select>

            {/* Live Preview Box */}
            {selectedTemplateId !== "none" && showPreview && (
              <div className="mt-2 p-3 rounded-xl bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-white text-[11px] whitespace-pre-wrap leading-relaxed shadow-2xs border border-emerald-500/20 max-h-48 overflow-y-auto">
                {previewText}
              </div>
            )}
          </div>

          {/* Optional Details (Collapsible or compact) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-medium mb-1 text-slate-600 dark:text-slate-400">
                Customer Name (optional)
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-[#f0f2f5] dark:bg-[#111b21] rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1 text-slate-600 dark:text-slate-400">
                Order ID (optional)
              </label>
              <div className="relative flex items-center">
                <ShoppingBag className="absolute left-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="ORD-10492"
                  className="w-full bg-[#f0f2f5] dark:bg-[#111b21] rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {selectedTemplateId === "malayalam_pricing_inquiry"
                  ? "Send Malayalam Pricing & Start Chat"
                  : selectedTemplateId !== "none"
                  ? "Send Template & Start Chat"
                  : "Start Chat"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

