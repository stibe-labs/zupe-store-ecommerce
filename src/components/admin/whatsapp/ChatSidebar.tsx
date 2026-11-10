"use client";

import React, { useState } from "react";
import Image from "next/image";
import { formatChatListTimeIST } from "@/lib/istTime";
import {
  Search,
  Plus,
  MoreVertical,
  Volume2,
  VolumeX,
  CircleDot,
  Pin,
  Check,
  CheckCheck,
  Clock,
  X,
  Sparkles,
  MessageSquare,
  ShieldAlert,
  ShoppingBag,
  RotateCcw,
  Users,
  User,
  Trash2,
} from "lucide-react";
import { WhatsAppConversation } from "@/lib/whatsappStore";
import { waAudio } from "@/lib/whatsappAudio";

interface ChatSidebarProps {
  conversations: WhatsAppConversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onOpenNewChat: () => void;
  onSimulateInbound: () => void;
  onClearAllChats?: () => void;
  filter: string;
  onFilterChange: (f: string) => void;
  search: string;
  onSearchChange: (q: string) => void;
  onTogglePin: (id: string) => void;
}

const CATEGORY_TABS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "orders", label: "Orders" },
  { id: "ndr", label: "NDR" },
  { id: "abandoned", label: "Carts" },
  { id: "internal", label: "Team" },
];

export default function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onOpenNewChat,
  onSimulateInbound,
  onClearAllChats,
  filter,
  onFilterChange,
  search,
  onSearchChange,
  onTogglePin,
}: ChatSidebarProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    waAudio.setMuted(next);
  };

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <div className="w-full md:w-80 lg:w-96 flex flex-col h-full bg-white dark:bg-[#111b21] border-r border-slate-200 dark:border-white/10 select-none">
      {/* 1. Sidebar Top Header */}
      <div className="h-16 px-4 bg-[#f0f2f5] dark:bg-[#202c33] flex items-center justify-between border-b border-slate-200 dark:border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-xs overflow-hidden">
            <Image
              src="/turkiye-jam-logo.svg"
              alt="Turkiye Jam Support"
              width={26}
              height={26}
              className="object-contain"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-[#202c33]" />
          </div>
          <div>
            <div className="font-semibold text-xs text-slate-800 dark:text-white flex items-center gap-1">
              Turkiye Jam Support
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              Live WhatsApp Desk
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <button
            onClick={toggleMute}
            title={isMuted ? "Unmute sounds" : "Mute sounds"}
            className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenNewChat}
            title="Start new chat"
            className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              title="Menu"
              className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 z-50 w-52 bg-white dark:bg-[#233138] rounded-xl shadow-xl border border-slate-200 dark:border-white/10 py-1 text-xs">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onSimulateInbound();
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-600 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  Simulate Inbound Customer
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    toggleMute();
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2"
                >
                  {isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  {isMuted ? "Unmute Audio" : "Mute Audio Alerts"}
                </button>
                {onClearAllChats && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      if (window.confirm("Are you sure you want to clear all WhatsApp chats? This will permanently delete test conversations and messages.")) {
                        onClearAllChats();
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 border-t border-slate-100 dark:border-white/5 cursor-pointer font-medium"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    Clear All Chats
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Search & Category Filters */}
      <div className="p-3 border-b border-slate-200 dark:border-white/10 space-y-2 bg-white dark:bg-[#111b21]">
        {/* Search Input */}
        <div className="relative flex items-center bg-[#f0f2f5] dark:bg-[#202c33] rounded-xl px-3 py-1.5">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden px-2"
          />
          {search && (
            <button onClick={() => onSearchChange("")} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-xs">
          {CATEGORY_TABS.map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onFilterChange(tab.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#00a884] text-white shadow-xs"
                    : "bg-[#f0f2f5] dark:bg-[#202c33] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                }`}
              >
                {tab.label}
                {tab.id === "unread" && totalUnread > 0 && (
                  <span className="ml-1 px-1 py-0.2 rounded-full bg-white text-emerald-700 text-[9px] font-bold">
                    {totalUnread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Conversation List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.04]">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <MessageSquare className="w-10 h-10 mb-2 opacity-40 text-emerald-500" />
            <p className="text-xs">No conversations found</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isSelected = activeConversationId === conv.id;
            const isPhoneTitle = conv.customerName.includes("(") || /^\+?\d+/.test(conv.customerName);
            const displayTitle = isPhoneTitle ? conv.customerPhone || conv.customerName : conv.customerName;

            let initials = "TJ";
            if (!isPhoneTitle && conv.customerName) {
              const cleanWords = conv.customerName.replace(/[()+\d-]/g, "").trim().split(/\s+/).filter(Boolean);
              if (cleanWords.length >= 2) {
                initials = (cleanWords[0][0] + cleanWords[1][0]).toUpperCase();
              } else if (cleanWords.length === 1 && cleanWords[0].length >= 2) {
                initials = cleanWords[0].substring(0, 2).toUpperCase();
              }
            }

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group relative flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-[#f0f2f5] dark:bg-[#2a3942]"
                    : "hover:bg-slate-50 dark:hover:bg-[#202c33]/60"
                }`}
              >
                {/* Avatar */}
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 overflow-hidden shadow-xs">
                  {conv.avatarUrl ? (
                    <Image
                      src={conv.avatarUrl}
                      alt={conv.customerName}
                      fill
                      className="object-cover"
                    />
                  ) : isPhoneTitle ? (
                    <User className="w-5 h-5 text-white/90" />
                  ) : (
                    <span>{initials}</span>
                  )}
                  {conv.lastSeen === "online" && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#111b21]" />
                  )}
                </div>

                {/* Contact Info & Last Message */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                      {displayTitle}
                    </span>
                    <span
                      className={`text-[10px] ${
                        conv.unreadCount > 0
                          ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                          : "text-slate-400"
                      }`}
                    >
                      {formatChatListTimeIST(conv.lastMessageTimestamp || conv.lastMessage.timestamp, conv.lastMessage.timestamp)}
                    </span>
                  </div>

                  {/* Order Tag & Phone */}
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                    {conv.orderId ? (
                      <>
                        <span
                          title={`Order #${conv.orderId}`}
                          className="px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-white/10 font-mono text-emerald-600 dark:text-emerald-400 font-medium truncate max-w-[95px]"
                        >
                          #{conv.orderId.length > 10 ? `${conv.orderId.substring(0, 8)}...` : conv.orderId}
                        </span>
                        <span className="truncate">{conv.customerPhone}</span>
                      </>
                    ) : (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        WhatsApp Contact
                      </span>
                    )}
                  </div>

                  {/* Last Message Snippet */}
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 truncate pr-2">
                      {conv.lastMessage.sender === "agent" && (
                        <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] flex-shrink-0" />
                      )}
                      <span className="truncate">
                        {conv.lastMessage.text?.trim().toLowerCase() === "[unsupported]" ||
                        conv.lastMessage.text?.includes("not supported on WhatsApp Cloud API")
                          ? "📎 Unsupported attachment"
                          : conv.lastMessage.text}
                      </span>
                    </div>

                    {/* Unread Badge / Pin Icon */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePin(conv.id);
                        }}
                        title={conv.isPinned ? "Unpin chat" : "Pin chat to top"}
                        className={`p-1 rounded-full cursor-pointer transition-all ${
                          conv.isPinned
                            ? "text-emerald-500 hover:text-emerald-600 dark:text-emerald-400"
                            : "opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400"
                        }`}
                      >
                        <Pin className={`w-3.5 h-3.5 rotate-45 ${conv.isPinned ? "fill-current" : ""}`} />
                      </button>
                      {conv.unreadCount > 0 && !isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#25d366] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

