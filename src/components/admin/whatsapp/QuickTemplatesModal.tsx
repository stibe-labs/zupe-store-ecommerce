"use client";

import React, { useState } from "react";
import { X, Sparkles, Send } from "lucide-react";
import { WHATSAPP_TEMPLATES, WhatsAppTemplate, WhatsAppConversation } from "@/lib/whatsappStore";

interface QuickTemplatesModalProps {
  conversation: WhatsAppConversation;
  onClose: () => void;
  onSendTemplate: (renderedContent: string) => void;
}

export default function QuickTemplatesModal({
  conversation,
  onClose,
  onSendTemplate,
}: QuickTemplatesModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate>(WHATSAPP_TEMPLATES[0]);

  // Render variables dynamically
  const renderTemplateText = (tpl: WhatsAppTemplate) => {
    let text = tpl.body;
    text = text.replace(/{{name}}/g, conversation.customerName.split(" ")[0]);
    text = text.replace(/{{order_id}}/g, conversation.orderId ? `#${conversation.orderId}` : "#VD-10492");
    text = text.replace(/{{amount}}/g, String(conversation.orderTotal || 2499));
    text = text.replace(
      /{{address}}/g,
      conversation.shippingAddress
        ? conversation.shippingAddress.split(",").slice(0, 2).join(",")
        : "your delivery address"
    );
    text = text.replace(/{{courier}}/g, "DTDC Express / BlueDart Air");
    text = text.replace(/{{awb}}/g, "VD188920489IN");
    return text;
  };

  const previewText = renderTemplateText(selectedTemplate);

  const handleSend = () => {
    onSendTemplate(previewText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-[#1f2c34] text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="h-14 px-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-sm">Quick WhatsApp Canned Templates</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body 2 columns: template list & preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-white/10 flex-1 overflow-y-auto">
          {/* List of templates */}
          <div className="p-3 space-y-1.5 overflow-y-auto max-h-80 md:max-h-none">
            {WHATSAPP_TEMPLATES.map((tpl) => {
              const isSel = selectedTemplate.id === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer ${
                    isSel
                      ? "bg-emerald-500/15 border border-emerald-500 text-emerald-900 dark:text-emerald-300 font-semibold shadow-xs"
                      : "bg-[#f0f2f5] dark:bg-[#202c33] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span>{tpl.title}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-black/5 dark:bg-white/10 font-normal">
                      {tpl.category}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Preview box */}
          <div className="p-4 flex flex-col justify-between bg-slate-50 dark:bg-[#111b21]">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Live Preview (WhatsApp Bubble)
              </div>
              <div className="p-3.5 rounded-2xl bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-white text-xs whitespace-pre-wrap leading-relaxed shadow-xs rounded-tr-xs border border-emerald-500/20">
                {previewText}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-2 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Send Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

