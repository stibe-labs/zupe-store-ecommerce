"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Phone,
  Video,
  Search,
  PanelRightOpen,
  PanelRightClose,
  MoreVertical,
  X,
  Lock,
  User,
} from "lucide-react";
import { WhatsAppConversation, WhatsAppMessage } from "@/lib/whatsappStore";
import MessageBubble from "./MessageBubble";
import ChatInputDock from "./ChatInputDock";
import WhatsAppDoodleBackground from "./WhatsAppDoodleBackground";

interface ActiveChatAreaProps {
  conversation: WhatsAppConversation;
  messages: WhatsAppMessage[];
  onSendMessage: (payload: any) => void;
  onReactToMessage: (messageId: string, emoji: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: string) => void;
  onStartVoiceCall: () => void;
  onStartVideoCall: () => void;
  onToggleDrawer: () => void;
  isDrawerOpen: boolean;
  onOpenTemplates: () => void;
  isTyping?: boolean;
}

export default function ActiveChatArea({
  conversation,
  messages,
  onSendMessage,
  onReactToMessage,
  onDeleteMessage,
  onUpdateOrderStatus,
  onStartVoiceCall,
  onStartVideoCall,
  onToggleDrawer,
  isDrawerOpen,
  onOpenTemplates,
  isTyping = false,
}: ActiveChatAreaProps) {
  const [replyTarget, setReplyTarget] = useState<WhatsAppMessage | null>(null);
  const [inChatSearch, setInChatSearch] = useState("");
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const filteredMessages = inChatSearch.trim()
    ? messages.filter((m) =>
        m.content.toLowerCase().includes(inChatSearch.toLowerCase().trim())
      )
    : messages;

  const isPhoneTitle =
    conversation.customerName.includes("(") || /^\+?\d+/.test(conversation.customerName);
  const displayTitle = isPhoneTitle
    ? conversation.customerPhone || conversation.customerName
    : conversation.customerName;

  let initials = "TJ";
  if (!isPhoneTitle && conversation.customerName) {
    const cleanWords = conversation.customerName.replace(/[()+\d-]/g, "").trim().split(/\s+/).filter(Boolean);
    if (cleanWords.length >= 2) {
      initials = (cleanWords[0][0] + cleanWords[1][0]).toUpperCase();
    } else if (cleanWords.length === 1 && cleanWords[0].length >= 2) {
      initials = cleanWords[0].substring(0, 2).toUpperCase();
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#efeae2] dark:bg-[#0b141a]">
      {/* Authentic WhatsApp Doodle Background */}
      <WhatsAppDoodleBackground />

      {/* 1. Chat Header */}
      <div className="h-16 px-4 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-slate-200 dark:border-white/10 flex items-center justify-between z-10 select-none flex-shrink-0">
        {/* Contact info */}
        <div
          onClick={onToggleDrawer}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden flex-shrink-0 shadow-xs">
            {conversation.avatarUrl ? (
              <Image
                src={conversation.avatarUrl}
                alt={conversation.customerName}
                fill
                className="object-cover"
              />
            ) : isPhoneTitle ? (
              <User className="w-5 h-5 text-white/90" />
            ) : (
              <span>{initials}</span>
            )}
            {conversation.lastSeen === "online" && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white dark:border-[#202c33]" />
            )}
          </div>

          <div>
            <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5 group-hover:text-emerald-600 transition-colors">
              {displayTitle}
              {conversation.orderId && (
                <span
                  title={`Order #${conversation.orderId}`}
                  className="px-1.5 py-0.5 rounded-sm bg-emerald-500/10 text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 max-w-[120px] truncate"
                >
                  #{conversation.orderId.length > 10 ? `${conversation.orderId.substring(0, 8)}...` : conversation.orderId}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {isTyping ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold animate-pulse">
                  typing...
                </span>
              ) : conversation.lastSeen === "online" ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">online</span>
              ) : (
                <span>{conversation.lastSeen || conversation.customerPhone}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <button
            onClick={onStartVoiceCall}
            title="Voice Call"
            className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </button>

          <button
            onClick={onStartVideoCall}
            title="Video Call"
            className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <Video className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </button>

          <button
            onClick={() => setShowSearchBox(!showSearchBox)}
            title="Search in chat"
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              showSearchBox
                ? "bg-emerald-500/15 text-emerald-600"
                : "hover:bg-slate-200 dark:hover:bg-white/10"
            }`}
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleDrawer}
            title={isDrawerOpen ? "Hide Details" : "Show Order Details"}
            className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            {isDrawerOpen ? (
              <PanelRightClose className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <PanelRightOpen className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* In-chat Search Bar Overlay */}
      {showSearchBox && (
        <div className="px-4 py-2 bg-white dark:bg-[#202c33] border-b border-slate-200 dark:border-white/10 flex items-center justify-between z-10">
          <div className="relative flex items-center flex-1 max-w-md bg-[#f0f2f5] dark:bg-[#111b21] rounded-xl px-3 py-1 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <input
              type="text"
              value={inChatSearch}
              onChange={(e) => setInChatSearch(e.target.value)}
              placeholder="Search messages in this chat..."
              className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
              autoFocus
            />
            {inChatSearch && (
              <button onClick={() => setInChatSearch("")} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setShowSearchBox(false);
              setInChatSearch("");
            }}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white ml-3"
          >
            Done
          </button>
        </div>
      )}

      {/* 2. Messages Canvas */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-6 py-4 z-10 space-y-1">
        {/* Date chip */}
        <div className="flex justify-center my-3 select-none">
          <span className="bg-white/90 dark:bg-[#182229]/90 text-slate-600 dark:text-slate-300 text-[11px] px-3 py-1 rounded-lg shadow-2xs font-medium uppercase tracking-wider border border-black/5 dark:border-white/5">
            Today
          </span>
        </div>

        {/* Messages */}
        {filteredMessages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onReact={(msgId, emoji) => onReactToMessage(msgId, emoji)}
            onReply={(m) => setReplyTarget(m)}
            onDelete={(msgId) => onDeleteMessage(msgId)}
            onUpdateOrderStatus={onUpdateOrderStatus}
            onImageZoom={(url) => setZoomedImage(url)}
          />
        ))}

        {/* Live Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start my-1 px-4">
            <div className="bg-white dark:bg-[#202c33] rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-xs flex items-center gap-1.5 border border-slate-100 dark:border-white/5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
              <span
                className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input Dock */}
      <ChatInputDock
        onSendMessage={onSendMessage}
        replyToMessage={replyTarget}
        onClearReply={() => setReplyTarget(null)}
        onOpenTemplates={onOpenTemplates}
      />

      {/* Lightbox Modal for Photo Zoom */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm cursor-zoom-out animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
            <Image
              src={zoomedImage}
              alt="Zoomed Photo"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

