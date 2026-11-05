"use client";

import React, { useState } from "react";
import { X, UserPlus, Phone, User, ShoppingBag, Send } from "lucide-react";

interface NewChatModalProps {
  onClose: () => void;
  onCreateChat: (payload: {
    customerPhone: string;
    customerName: string;
    customerEmail?: string;
    orderId?: string;
    category?: "orders" | "ndr" | "abandoned" | "internal";
  }) => void;
}

export default function NewChatModal({ onClose, onCreateChat }: NewChatModalProps) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [category, setCategory] = useState<"orders" | "ndr" | "abandoned" | "internal">("orders");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!name.trim()) {
      setError("Please enter the customer name");
      return;
    }

    onCreateChat({
      customerPhone: phone.trim(),
      customerName: name.trim(),
      customerEmail: email.trim() || undefined,
      orderId: orderId.trim() || undefined,
      category,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#1f2c34] text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-white/10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base">Start New WhatsApp Chat</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Mobile Phone Number (WhatsApp)*
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 font-mono">+91</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210"
                className="w-full bg-[#f0f2f5] dark:bg-[#111b21] rounded-xl pl-12 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Customer Name*
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-[#f0f2f5] dark:bg-[#111b21] rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Order ID (optional)
              </label>
              <div className="relative flex items-center">
                <ShoppingBag className="absolute left-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="ORD-10492"
                  className="w-full bg-[#f0f2f5] dark:bg-[#111b21] rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#f0f2f5] dark:bg-[#111b21] rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="orders">Orders</option>
                <option value="ndr">NDR Reattempt</option>
                <option value="abandoned">Abandoned Cart</option>
                <option value="internal">Internal Team</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Send className="w-3.5 h-3.5" /> Start Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

