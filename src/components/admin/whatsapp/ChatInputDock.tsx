"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Smile,
  Paperclip,
  Mic,
  Send,
  X,
  Image as ImageIcon,
  FileText,
  ShoppingBag,
  Sparkles,
  MapPin,
  Trash2,
  Check,
} from "lucide-react";
import { WhatsAppMessage } from "@/lib/whatsappStore";
import { waAudio } from "@/lib/whatsappAudio";

interface ChatInputDockProps {
  onSendMessage: (payload: {
    content: string;
    type?: "text" | "image" | "voice" | "order_card" | "tracking_card" | "product_card" | "template" | "document";
    mediaUrl?: string;
    mediaCaption?: string;
    mediaDuration?: number;
    productData?: any;
    replyTo?: any;
    sendLiveMeta?: boolean;
  }) => void;
  replyToMessage?: WhatsAppMessage | null;
  onClearReply?: () => void;
  onOpenTemplates?: () => void;
  isSending?: boolean;
}

const EMOJI_CATEGORIES = {
  Recent: ["👍", "❤️", "🌿", "🍯", "✅", "🙏", "😊", "📦"],
  Smileys: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🙂", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘"],
  Gestures: ["👍", "👎", "👌", "✌️", "🤞", "🤝", "👏", "🙌", "🙏", "💪", "👊", "👋", "✍️", "🖐️"],
  TurkiyeJam: ["🌿", "🍯", "🇹🇷", "📦", "🚚", "🚀", "✨", "💊", "🔥", "💯", "🏷️", "⭐", "🛒", "🛍️"],
  Symbols: ["✅", "❌", "⚠️", "⏳", "🔒", "📍", "📞", "💬", "❤️", "💚", "🧡", "💎", "⚡", "🎉"],
};

export default function ChatInputDock({
  onSendMessage,
  replyToMessage,
  onClearReply,
  onOpenTemplates,
  isSending = false,
}: ChatInputDockProps) {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [sendLiveMeta, setSendLiveMeta] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recordingTimerRef = useRef<any>(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  // Voice recording timer
  useEffect(() => {
    if (isRecordingVoice) {
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecordingVoice]);

  const handleSendText = () => {
    if (!text.trim() || isSending) return;

    waAudio.playOutgoingPop();
    onSendMessage({
      content: text.trim(),
      type: "text",
      replyTo: replyToMessage
        ? {
            id: replyToMessage.id,
            sender: replyToMessage.sender === "agent" ? "You" : "Customer",
            snippet: replyToMessage.content,
          }
        : undefined,
      sendLiveMeta,
    });

    setText("");
    if (onClearReply) onClearReply();
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const handleSendVoiceNote = () => {
    setIsRecordingVoice(false);
    waAudio.playOutgoingPop();
    const duration = recordingDuration || 8;
    onSendMessage({
      content: `Voice message (${duration}s)`,
      type: "voice",
      mediaDuration: duration,
      sendLiveMeta,
    });
  };

  const handleCancelVoiceNote = () => {
    setIsRecordingVoice(false);
    setRecordingDuration(0);
  };

  const handleSendCatalogProduct = () => {
    setShowAttachmentMenu(false);
    waAudio.playOutgoingPop();
    onSendMessage({
      content: "Check out Turkiye Jam Herbal Anatolian Paste (3 Sachet Pack). 100% natural organic formula.",
      type: "product_card",
      productData: {
        name: "Turkiye Jam (3 Sachet Trial Pack)",
        price: 1099,
        mrp: 1499,
        image: "/turkiye-jam-logo.svg",
        badge: "Best Seller • 100% Pure Anatolian Formula",
        description:
          "Made with pure Turkish honey, Royal Jelly, Ginseng & Epimedium. Formulated for maximum daily vitality & vigor.",
      },
      sendLiveMeta,
    });
  };

  const handleSendInvoiceDoc = () => {
    setShowAttachmentMenu(false);
    waAudio.playOutgoingPop();
    onSendMessage({
      content: "TurkiyeJam_Order_Invoice_TaxReceipt.pdf",
      type: "document",
      sendLiveMeta,
    });
  };

  const handleSendLocation = () => {
    setShowAttachmentMenu(false);
    waAudio.playOutgoingPop();
    onSendMessage({
      content:
        "📍 Turkiye Jam Central Fulfillment Warehouse\nPlot 42, Logistics Park, Bhiwandi, Maharashtra 421302\nPickup & Dispatch Timing: 9 AM - 7 PM Mon-Sat",
      type: "text",
      sendLiveMeta,
    });
  };

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    if (textareaRef.current) textareaRef.current.focus();
  };

  return (
    <div className="relative bg-[#f0f2f5] dark:bg-[#202c33] border-t border-slate-200 dark:border-white/10 px-4 py-2.5 z-20">
      {/* Quoted Reply Banner */}
      {replyToMessage && (
        <div className="flex items-center justify-between mb-2 px-3 py-2 bg-white dark:bg-[#111b21] rounded-xl border-l-4 border-emerald-500 shadow-xs">
          <div className="min-w-0 pr-3">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
              Replying to {replyToMessage.sender === "agent" ? "You" : "Customer"}
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
              {replyToMessage.content}
            </p>
          </div>
          <button
            onClick={onClearReply}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 z-40 w-72 sm:w-80 bg-white dark:bg-[#1f2c34] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 p-3 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2 mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              WhatsApp Emojis
            </span>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="p-0.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="max-h-56 overflow-y-auto space-y-3 pr-1 text-lg">
            {Object.entries(EMOJI_CATEGORIES).map(([cat, emojis]) => (
              <div key={cat}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {cat}
                </div>
                <div className="grid grid-cols-8 gap-1">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => insertEmoji(emoji)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-center transition-colors cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachment Popover Menu */}
      {showAttachmentMenu && (
        <div className="absolute bottom-16 left-12 z-40 w-56 bg-white dark:bg-[#1f2c34] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 p-2 space-y-1 animate-in fade-in zoom-in-95">
          <button
            onClick={onOpenTemplates}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            Quick Canned Templates
          </button>
          <button
            onClick={handleSendCatalogProduct}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-600 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            Turkiye Jam Catalog Item
          </button>
          <button
            onClick={handleSendInvoiceDoc}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            Order Invoice PDF
          </button>
          <button
            onClick={handleSendLocation}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-rose-500/10 hover:text-rose-600 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            Warehouse Location
          </button>
        </div>
      )}

      {/* Voice Recording Mode Bar */}
      {isRecordingVoice ? (
        <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#111b21] rounded-2xl px-4 py-2 border border-rose-500/30 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              Recording Voice Note: {Math.floor(recordingDuration / 60)}:
              {String(recordingDuration % 60).padStart(2, "0")}
            </span>
            {/* Visualizer wave pulses */}
            <div className="flex items-center gap-1 h-4">
              {[8, 14, 20, 12, 18, 22, 10, 16].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-rose-500 rounded-full animate-pulse"
                  style={{ height: `${h}px`, animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCancelVoiceNote}
              title="Cancel recording"
              className="p-2 text-slate-400 hover:text-rose-500 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleSendVoiceNote}
              title="Send voice note"
              className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Standard Composition Row */
        <div className="flex items-end gap-2">
          {/* Emoji button */}
          <button
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowAttachmentMenu(false);
            }}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${
              showEmojiPicker
                ? "text-emerald-600 bg-emerald-500/10"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
            }`}
          >
            <Smile className="w-6 h-6" />
          </button>

          {/* Attachment button */}
          <button
            onClick={() => {
              setShowAttachmentMenu(!showAttachmentMenu);
              setShowEmojiPicker(false);
            }}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${
              showAttachmentMenu
                ? "text-emerald-600 bg-emerald-500/10"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
            }`}
          >
            <Paperclip className="w-6 h-6" />
          </button>

          {/* Textarea */}
          <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-2xl px-4 py-2 border border-slate-200 dark:border-transparent focus-within:border-emerald-500 transition-colors">
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message (Shift+Enter for newline)..."
              className="w-full bg-transparent resize-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden max-h-32 leading-relaxed"
            />
          </div>

          {/* Send or Voice Note Button */}
          {text.trim() ? (
            <button
              onClick={handleSendText}
              disabled={isSending}
              className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#02906f] text-white flex items-center justify-center shadow-md shadow-emerald-600/20 flex-shrink-0 transition-transform active:scale-95 disabled:opacity-50"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          ) : (
            <button
              onClick={() => setIsRecordingVoice(true)}
              title="Record voice note"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full flex-shrink-0 transition-colors"
            >
              <Mic className="w-6 h-6" />
            </button>
          )}
        </div>
      )}

      {/* Meta Cloud API broadcast toggle indicator */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1 select-none">
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">
          <input
            type="checkbox"
            checked={sendLiveMeta}
            onChange={(e) => setSendLiveMeta(e.target.checked)}
            className="rounded-xs text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
          />
          <span>Also dispatch live via Meta WhatsApp Cloud API</span>
        </label>
        <span className="hidden sm:inline">Press Enter ↵ to send</span>
      </div>
    </div>
  );
}

