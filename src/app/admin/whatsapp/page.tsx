"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Search,
  Send,
  MoreVertical,
  Check,
  CheckCheck,
  Phone,
  Paperclip,
  Smile,
  RotateCw,
  Pin,
  Archive,
  MessageSquarePlus,
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  X,
  Sparkles,
  Info,
  Clock,
  Filter,
} from "lucide-react";

interface WhatsAppChat {
  id: string;
  phone: string;
  customer_name: string | null;
  avatar_url: string | null;
  last_message: string | null;
  last_message_at: string;
  unread_count: number;
  is_pinned: number;
  is_archived: number;
  tags?: string | null;
  latest_order_id?: string;
  latest_order_amount?: number;
  latest_order_status?: string;
}

interface WhatsAppMessage {
  id: string;
  chat_id: string;
  phone: string;
  sender: "customer" | "admin" | "system" | "bot";
  message_type: "text" | "image" | "template" | "interactive" | "button" | "document" | "audio";
  content: string;
  template_name?: string | null;
  media_url?: string | null;
  buttons?: string | null;
  status: "sent" | "delivered" | "read" | "failed" | "received";
  created_at: string;
}

const QUICK_EMOJIS = ["👍", "❤️", "😊", "📦", "🛒", "🚚", "✅", "❌", "🙏", "🔥", "⚡", "⭐"];

const QUICK_TEMPLATES = [
  {
    title: "Order Status",
    text: "Hi! Your order is being processed and will be dispatched via express courier shortly. You will receive live tracking updates here.",
  },
  {
    title: "Delivery Timeline",
    text: "Standard delivery takes 3 to 5 business days across India. We will share the tracking link as soon as the courier driver picks up the parcel.",
  },
  {
    title: "COD Confirmation",
    text: "Thank you for confirming your Cash on Delivery order. Please keep the exact amount ready for the delivery partner.",
  },
  {
    title: "Customer Support",
    text: "Hi! This is the official Zupe Store support team. How can we help you today with your order or inquiry?",
  },
];

export default function WhatsAppAdminPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [activeChat, setActiveChat] = useState<WhatsAppChat | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncingOrders, setIsSyncingOrders] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "pinned" | "orders">("all");

  // Chat Input
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTemplatesPicker, setShowTemplatesPicker] = useState(false);

  // Drawers & Modals
  const [showOrderDrawer, setShowOrderDrawer] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatPhone, setNewChatPhone] = useState("");
  const [newChatName, setNewChatName] = useState("");
  const [newChatError, setNewChatError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Format Phone for display: +91 97781 37954
  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length === 12) {
      return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
    }
    return phone.startsWith("+") ? phone : `+${digits}`;
  };

  // Format timestamp (e.g., 10:14 AM or Yesterday or 29 Oct)
  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } else if (diffDays === 1) {
        return "Yesterday";
      } else if (diffDays < 7) {
        return date.toLocaleDateString([], { weekday: "short" });
      } else {
        return date.toLocaleDateString([], { day: "numeric", month: "short" });
      }
    } catch {
      return "";
    }
  };

  // Helper to attach admin token & credentials to every admin API request
  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("zupe_admin_token") : null;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["x-admin-token"] = token;
    }
    return headers;
  };

  // 1. Fetch Conversations List
  const fetchChats = async (silent = false) => {
    if (!silent) setLoadingChats(true);
    try {
      const filterParam = activeFilter === "orders" ? "all" : activeFilter;
      const res = await fetch(
        `/api/admin/whatsapp/chats?search=${encodeURIComponent(searchQuery)}&filter=${filterParam}`,
        {
          headers: getAuthHeaders(),
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.chats)) {
        let list: WhatsAppChat[] = data.chats;
        if (activeFilter === "orders") {
          list = list.filter((c) => Boolean(c.latest_order_id));
        }
        setChats(list);

        // If no active chat selected yet on desktop, select the first one
        if (!activeChat && list.length > 0 && typeof window !== "undefined" && window.innerWidth >= 1024) {
          setActiveChat(list[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch WhatsApp conversations:", err);
    } finally {
      if (!silent) setLoadingChats(false);
      setIsRefreshing(false);
    }
  };

  // 2. Fetch Messages for Active Chat
  const fetchMessages = async (chatId: string, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/admin/whatsapp/messages?chatId=${encodeURIComponent(chatId)}`, {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
        // Clear unread count locally for active chat
        setChats((prev) =>
          prev.map((c) => (c.id === chatId ? { ...c, unread_count: 0 } : c))
        );
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchChats();
  }, [activeFilter, searchQuery]);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
      setSendError(null);
    } else {
      setMessages([]);
    }
  }, [activeChat?.id]);

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Real-time polling every 5 seconds for live webhook updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchChats(true);
      if (activeChat) {
        fetchMessages(activeChat.id, true);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeChat?.id]);

  // Handle Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeChat || isSending) return;

    const textToSend = inputText.trim();
    setInputText("");
    setIsSending(true);
    setSendError(null);

    // Optimistic message bubble
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg: WhatsAppMessage = {
      id: tempId,
      chat_id: activeChat.id,
      phone: activeChat.phone,
      sender: "admin",
      message_type: "text",
      content: textToSend,
      status: "sent",
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch("/api/admin/whatsapp/messages", {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({
          phone: activeChat.phone,
          message: textToSend,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setSendError(
          data.error ||
            "Could not deliver message via Meta Cloud API. (Customer 24h window may be closed)."
        );
        // Refresh thread to show failed status
        fetchMessages(activeChat.id, true);
      } else if (data.messages) {
        setMessages(data.messages);
      }
      fetchChats(true);
    } catch (err: any) {
      setSendError(err.message || "Network error while sending WhatsApp message");
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  // Sync Store Orders into WhatsApp conversations
  const handleSyncOrders = async () => {
    setIsSyncingOrders(true);
    try {
      const res = await fetch("/api/admin/whatsapp/chats", {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ action: "sync_orders" }),
      });
      const data = await res.json();
      if (data.success && data.chats) {
        setChats(data.chats);
        if (!activeChat && data.chats.length > 0) {
          setActiveChat(data.chats[0]);
        }
      }
    } catch (err) {
      console.error("Failed to sync customer orders:", err);
    } finally {
      setIsSyncingOrders(false);
    }
  };

  // Pin / Unpin Conversation
  const handleTogglePin = async (chat: WhatsAppChat, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newPinned = chat.is_pinned === 1 ? 0 : 1;
    setChats((prev) =>
      prev.map((c) => (c.id === chat.id ? { ...c, is_pinned: newPinned } : c))
    );
    try {
      await fetch("/api/admin/whatsapp/chats", {
        method: "PATCH",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ chatId: chat.id, isPinned: Boolean(newPinned) }),
      });
    } catch {}
  };

  // Start New Chat Modal Submit
  const handleCreateNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatPhone.trim()) {
      setNewChatError("Please enter a customer phone number");
      return;
    }
    setNewChatError(null);
    try {
      const res = await fetch("/api/admin/whatsapp/chats", {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({
          phone: newChatPhone.trim(),
          customerName: newChatName.trim() || undefined,
          initialMessage: "Conversation initiated by admin",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowNewChatModal(false);
        setNewChatPhone("");
        setNewChatName("");
        if (data.chats) setChats(data.chats);
        const created = data.chats?.find((c: any) => c.id === data.chatId);
        if (created) setActiveChat(created);
      } else {
        setNewChatError(data.error || "Failed to create conversation");
      }
    } catch (err: any) {
      setNewChatError(err.message || "Failed to start chat");
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans flex flex-col">
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col flex-1 h-screen overflow-hidden">
        <AdminHeader
          onOpenMobile={() => setMobileSidebarOpen(true)}
          onRefresh={() => {
            setIsRefreshing(true);
            fetchChats();
            if (activeChat) fetchMessages(activeChat.id);
          }}
          isRefreshing={isRefreshing}
        />

        {/* WhatsApp App Container: Authentic WhatsApp Web Split Layout */}
        <div className="flex-1 p-2 sm:p-4 overflow-hidden flex flex-col">
          <div className="w-full flex-1 bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden flex flex-row relative">
            
            {/* ========================================================================= */}
            {/* LEFT PANE: WhatsApp Conversation List (Desktop always, Mobile when no chat) */}
            {/* ========================================================================= */}
            <div
              className={`w-full md:w-[360px] lg:w-[410px] xl:w-[440px] flex-shrink-0 flex flex-col bg-white border-r border-slate-200 ${
                activeChat ? "hidden md:flex" : "flex"
              }`}
            >
              {/* WhatsApp Profile & Toolbar Header */}
              <div className="h-16 px-4 bg-[#F0F2F5] border-b border-slate-200/90 flex items-center justify-between select-none">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    <span>ZS</span>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#25D366] border-2 border-white ring-1 ring-emerald-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 text-sm">Zupe Store</span>
                      <ShieldCheck className="w-4 h-4 text-[#25D366] fill-[#25D366]/20" />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                      +91 97781 37954
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-slate-600">
                  <button
                    onClick={handleSyncOrders}
                    disabled={isSyncingOrders}
                    title="Sync Customer Orders"
                    className="p-2 rounded-full hover:bg-slate-200/70 transition-colors"
                  >
                    <RotateCw className={`w-4 h-4 ${isSyncingOrders ? "animate-spin text-emerald-600" : ""}`} />
                  </button>
                  <button
                    onClick={() => setShowNewChatModal(true)}
                    title="Start New Chat"
                    className="p-2 rounded-full hover:bg-slate-200/70 transition-colors"
                  >
                    <MessageSquarePlus className="w-5 h-5 text-emerald-700" />
                  </button>
                </div>
              </div>

              {/* Meta Cloud API Notice Pill */}
              <div className="px-3.5 py-2 bg-emerald-50/80 border-b border-emerald-100/80 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                  <span className="truncate font-medium text-[11px]">
                    Meta Business Cloud API Live • Two-Way Sync
                  </span>
                </div>
                <button
                  onClick={handleSyncOrders}
                  className="text-[10px] font-bold text-emerald-700 hover:underline uppercase tracking-wider flex-shrink-0"
                >
                  Sync Orders
                </button>
              </div>

              {/* Search Bar & Filter Pills */}
              <div className="p-2.5 bg-white border-b border-slate-100 space-y-2">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search or start new chat"
                    className="w-full pl-10 pr-8 py-2 bg-[#F0F2F5] hover:bg-[#E9EDEF] focus:bg-white text-xs sm:text-sm rounded-lg outline-none border border-transparent focus:border-[#00a884] transition-all text-slate-800 placeholder:text-slate-400 font-sans"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
                  {(
                    [
                      { id: "all", label: "All" },
                      { id: "unread", label: "Unread" },
                      { id: "orders", label: "Orders" },
                      { id: "pinned", label: "Pinned" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
                        activeFilter === tab.id
                          ? "bg-emerald-600 text-white font-semibold shadow-sm"
                          : "bg-[#F0F2F5] text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Items List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100/70">
                {loadingChats ? (
                  <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                    <RotateCw className="w-5 h-5 animate-spin text-emerald-600" />
                    <span>Loading conversations...</span>
                  </div>
                ) : chats.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-slate-700">No chats found</p>
                    <p className="text-[11px] text-slate-400 max-w-xs">
                      Click below to sync recent customer orders into WhatsApp conversations.
                    </p>
                    <button
                      onClick={handleSyncOrders}
                      disabled={isSyncingOrders}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-sm"
                    >
                      {isSyncingOrders ? "Syncing..." : "Sync Customer Orders Now"}
                    </button>
                  </div>
                ) : (
                  chats.map((chat) => {
                    const isSelected = activeChat?.id === chat.id;
                    const displayName = chat.customer_name || formatPhone(chat.phone);
                    const initials = (chat.customer_name || "WA")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <div
                        key={chat.id}
                        onClick={() => setActiveChat(chat)}
                        className={`flex items-center gap-3 px-3.5 py-3 cursor-pointer transition-colors group relative select-none ${
                          isSelected
                            ? "bg-[#F0F2F5] border-l-4 border-emerald-600"
                            : "hover:bg-[#F5F6F6] bg-white"
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm shadow-inner">
                            {initials}
                          </div>
                          {chat.is_pinned === 1 && (
                            <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] shadow">
                              <Pin className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>

                        {/* Middle Text Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-semibold text-slate-900 text-sm truncate">
                              {displayName}
                            </span>
                            <span
                              className={`text-[11px] flex-shrink-0 ml-2 ${
                                chat.unread_count > 0 ? "font-bold text-emerald-600" : "text-slate-400"
                              }`}
                            >
                              {formatTime(chat.last_message_at)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-500 truncate flex items-center gap-1 font-normal">
                              {chat.last_message?.startsWith("📦") ? (
                                <span className="text-emerald-700 font-medium">
                                  {chat.last_message}
                                </span>
                              ) : (
                                chat.last_message || "No messages yet"
                              )}
                            </p>

                            {/* Unread Count or Order Badge */}
                            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                              {chat.latest_order_id && (
                                <span className="text-[10px] font-bold bg-orange-100 text-[#FF7A00] px-1.5 py-0.5 rounded">
                                  #{chat.latest_order_id}
                                </span>
                              )}
                              {chat.unread_count > 0 && (
                                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#25D366] text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                                  {chat.unread_count}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Hover Quick Actions */}
                        <div className="hidden group-hover:flex items-center gap-1 absolute right-2 top-2 bg-white/95 rounded-lg shadow px-1 py-0.5 border border-slate-200">
                          <button
                            onClick={(e) => handleTogglePin(chat, e)}
                            title={chat.is_pinned === 1 ? "Unpin chat" : "Pin chat"}
                            className="p-1 hover:text-amber-600 text-slate-400"
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* RIGHT PANE: Authentic WhatsApp Chat View                                 */}
            {/* ========================================================================= */}
            <div
              className={`flex-1 flex flex-col bg-[#EFEAE2] relative overflow-hidden ${
                activeChat ? "flex" : "hidden md:flex"
              }`}
            >
              {activeChat ? (
                <>
                  {/* WhatsApp Chat Top Header Bar */}
                  <div className="h-16 px-4 bg-[#F0F2F5] border-b border-slate-200 flex items-center justify-between select-none z-10 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Back button on mobile */}
                      <button
                        onClick={() => setActiveChat(null)}
                        className="md:hidden p-1.5 -ml-1 text-slate-600 hover:bg-slate-200 rounded-full"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>

                      <div
                        onClick={() => setShowOrderDrawer(true)}
                        className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-300 to-slate-200 text-slate-800 font-bold flex items-center justify-center text-sm cursor-pointer shadow-inner flex-shrink-0"
                      >
                        {(activeChat.customer_name || "WA").slice(0, 2).toUpperCase()}
                      </div>

                      <div
                        onClick={() => setShowOrderDrawer(true)}
                        className="cursor-pointer min-w-0"
                      >
                        <h2 className="font-bold text-slate-900 text-sm truncate">
                          {activeChat.customer_name || formatPhone(activeChat.phone)}
                        </h2>
                        <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                          <span>{formatPhone(activeChat.phone)}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-emerald-700 font-medium">Meta Cloud API</span>
                        </p>
                      </div>
                    </div>

                    {/* Right Header Action Icons */}
                    <div className="flex items-center gap-1 text-slate-600">
                      {activeChat.latest_order_id && (
                        <button
                          onClick={() => setShowOrderDrawer(!showOrderDrawer)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-[#FF7A00] hover:bg-orange-200 text-xs font-bold transition mr-1"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Order #{activeChat.latest_order_id}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleTogglePin(activeChat)}
                        title={activeChat.is_pinned === 1 ? "Unpin chat" : "Pin chat"}
                        className={`p-2 rounded-full hover:bg-slate-200 transition ${
                          activeChat.is_pinned === 1 ? "text-amber-500 font-bold" : "text-slate-600"
                        }`}
                      >
                        <Pin className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => fetchMessages(activeChat.id)}
                        disabled={loadingMessages}
                        title="Refresh Messages"
                        className="p-2 rounded-full hover:bg-slate-200 transition"
                      >
                        <RotateCw className={`w-4 h-4 ${loadingMessages ? "animate-spin text-emerald-600" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* WhatsApp Wallpaper Doodle Pattern Background Overlay */}
                  <div
                    className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 relative"
                    style={{
                      backgroundImage: `radial-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px)`,
                      backgroundSize: "20px 20px",
                    }}
                  >
                    {/* Centered Encryption Banner */}
                    <div className="max-w-md mx-auto my-2 p-2.5 rounded-xl bg-[#FFEECD] text-amber-900 border border-amber-200/80 shadow-sm text-center text-xs space-y-1">
                      <div className="flex items-center justify-center gap-1.5 font-bold text-[11px] text-amber-800">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Meta WhatsApp Business Cloud API (+91 97781 37954)</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-900/90 font-normal">
                        Messages and automated updates are securely routed through Meta's verified servers.
                      </p>
                    </div>

                    {/* Date Separator Pill */}
                    <div className="flex justify-center my-3">
                      <span className="px-3 py-1 rounded-lg bg-white/90 text-slate-600 text-[11px] font-semibold uppercase tracking-wider shadow-sm border border-slate-200/60">
                        Today
                      </span>
                    </div>

                    {/* Message Bubbles */}
                    {loadingMessages ? (
                      <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                        <RotateCw className="w-6 h-6 animate-spin text-emerald-600" />
                        <span>Loading conversation thread...</span>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 text-xs">
                        No messages in this conversation yet. Send a message below to start chatting!
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isOutgoing = msg.sender === "admin" || msg.sender === "system" || msg.sender === "bot";
                        const isTemplate = msg.message_type === "template" || Boolean(msg.template_name);

                        // Parse buttons if JSON
                        let parsedButtons: any[] = [];
                        if (msg.buttons) {
                          try {
                            parsedButtons = typeof msg.buttons === "string" ? JSON.parse(msg.buttons) : msg.buttons;
                          } catch {}
                        }

                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOutgoing ? "justify-end" : "justify-start"} w-full`}
                          >
                            <div
                              className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-[0_1px_2px_rgba(0,0,0,0.1)] relative transition-all ${
                                isOutgoing
                                  ? "bg-[#D9FDD3] text-slate-900 rounded-tr-sm"
                                  : "bg-white text-slate-900 rounded-tl-sm border border-slate-100"
                              }`}
                            >
                              {/* Template / Automation Header Badge */}
                              {isTemplate && (
                                <div className="mb-2 pb-1.5 border-b border-emerald-600/15 flex items-center justify-between text-[11px] font-bold text-emerald-800">
                                  <div className="flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>
                                      {msg.template_name === "zupe_order_verify"
                                        ? "Zupe Store Order Verification"
                                        : msg.template_name === "zupe_login_otp"
                                        ? "Authentication OTP"
                                        : "Automated Message"}
                                    </span>
                                  </div>
                                  <span className="text-[9px] bg-emerald-200/80 text-emerald-900 px-1 rounded uppercase font-semibold">
                                    Template
                                  </span>
                                </div>
                              )}

                              {/* Message Text Body */}
                              <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed break-words font-sans">
                                {msg.content}
                              </div>

                              {/* Interactive Template Buttons */}
                              {parsedButtons.length > 0 && (
                                <div className="mt-2.5 pt-2 border-t border-slate-200/70 space-y-1.5">
                                  {parsedButtons.map((btn, idx) => (
                                    <div
                                      key={idx}
                                      className="w-full text-center py-1.5 px-3 rounded-lg bg-white/80 hover:bg-white text-emerald-700 font-bold text-xs border border-emerald-300 shadow-sm flex items-center justify-center gap-1.5 select-none"
                                    >
                                      <span>{btn.title || btn.text || "Interactive Button"}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Timestamp & Status Double Ticks */}
                              <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-400 select-none">
                                <span>{formatTime(msg.created_at)}</span>
                                {isOutgoing && (
                                  <span>
                                    {msg.status === "read" ? (
                                      <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                                    ) : msg.status === "delivered" ? (
                                      <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                                    ) : msg.status === "failed" ? (
                                      <AlertCircle className="w-3.5 h-3.5 text-rose-500" title="Delivery failed" />
                                    ) : (
                                      <Check className="w-3.5 h-3.5 text-slate-400" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Send Error Notice Banner */}
                  {sendError && (
                    <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 text-rose-800 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <span className="leading-snug">{sendError}</span>
                      </div>
                      <button
                        onClick={() => setSendError(null)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Quick Emojis & Templates Tray */}
                  {showEmojiPicker && (
                    <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto shadow-inner">
                      <span className="text-xs text-slate-400 font-medium">Quick emojis:</span>
                      {QUICK_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setInputText((prev) => prev + emoji);
                            inputRef.current?.focus();
                          }}
                          className="text-lg hover:scale-125 transition p-1"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {showTemplatesPicker && (
                    <div className="p-3 bg-white border-t border-slate-200 space-y-2 max-h-48 overflow-y-auto">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
                          <span>Quick Response Templates</span>
                        </span>
                        <button
                          onClick={() => setShowTemplatesPicker(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {QUICK_TEMPLATES.map((tmpl, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setInputText(tmpl.text);
                              setShowTemplatesPicker(false);
                              inputRef.current?.focus();
                            }}
                            className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 cursor-pointer transition text-left"
                          >
                            <p className="text-xs font-bold text-slate-800">{tmpl.title}</p>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">{tmpl.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* WhatsApp Message Input Bar */}
                  <form
                    onSubmit={handleSendMessage}
                    className="h-16 px-4 bg-[#F0F2F5] border-t border-slate-200 flex items-center gap-2 select-none"
                  >
                    {/* Emoji toggle */}
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`p-2 rounded-full transition ${
                        showEmojiPicker ? "text-emerald-600 bg-slate-200" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <Smile className="w-5 h-5" />
                    </button>

                    {/* Quick Templates Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowTemplatesPicker(!showTemplatesPicker)}
                      title="Quick Customer Response Templates"
                      className={`p-2 rounded-full transition ${
                        showTemplatesPicker ? "text-emerald-600 bg-slate-200" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <Sparkles className="w-5 h-5" />
                    </button>

                    {/* Text Input Box */}
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 py-2.5 px-4 bg-white text-xs sm:text-sm rounded-lg outline-none border border-transparent focus:border-[#00a884] shadow-sm text-slate-900 placeholder:text-slate-400 font-sans"
                    />

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={!inputText.trim() || isSending}
                      className={`p-2.5 rounded-full transition-transform shadow-md flex items-center justify-center ${
                        inputText.trim() && !isSending
                          ? "bg-[#00a884] hover:bg-[#008f6f] text-white active:scale-95"
                          : "bg-slate-300 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <Send className="w-4 h-4 ml-0.5" />
                    </button>
                  </form>
                </>
              ) : (
                /* Authentic WhatsApp Web Welcome Screen (When no chat is selected) */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F0F2F5] select-none">
                  <div className="max-w-md space-y-4">
                    <div className="relative w-24 h-24 mx-auto bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                      <Image
                        src="/zupe-logo.webp"
                        alt="Zupe Store"
                        width={60}
                        height={60}
                        className="object-contain"
                      />
                    </div>

                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                        WhatsApp Web for Zupe Store
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                        Automated Meta Business Cloud API • Registered: +91 97781 37954
                      </p>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                      View inbound messages, order verifications, automated OTPs, and reply directly to customers from this dedicated console.
                    </p>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                      <button
                        onClick={handleSyncOrders}
                        disabled={isSyncingOrders}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm"
                      >
                        {isSyncingOrders ? "Syncing..." : "Sync Store Customer Chats"}
                      </button>
                      <button
                        onClick={() => setShowNewChatModal(true)}
                        className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs transition"
                      >
                        Start New Chat
                      </button>
                    </div>

                    <div className="pt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-[#25D366]" />
                      <span>End-to-end encrypted via Meta Business Cloud API</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* RIGHT SIDEBAR: Customer & Order Details Drawer                            */}
            {/* ========================================================================= */}
            {showOrderDrawer && activeChat && (
              <div className="w-72 sm:w-80 bg-white border-l border-slate-200 flex flex-col z-20 shadow-xl flex-shrink-0 animate-in slide-in-from-right duration-200">
                <div className="h-16 px-4 bg-[#F0F2F5] border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm">Contact Info</h3>
                  <button
                    onClick={() => setShowOrderDrawer(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                  {/* Profile info */}
                  <div className="text-center pb-4 border-b border-slate-100">
                    <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xl flex items-center justify-center shadow-inner">
                      {(activeChat.customer_name || "WA").slice(0, 2).toUpperCase()}
                    </div>
                    <h4 className="font-bold text-slate-900 text-base mt-2">
                      {activeChat.customer_name || "Customer"}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {formatPhone(activeChat.phone)}
                    </p>
                  </div>

                  {/* Order Context */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Linked Zupe Store Order
                    </span>

                    {activeChat.latest_order_id ? (
                      <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-orange-950">
                            Order #{activeChat.latest_order_id}
                          </span>
                          <span className="font-semibold text-emerald-700">
                            {activeChat.latest_order_amount ? `₹${activeChat.latest_order_amount}` : ""}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Status: <span className="font-bold capitalize">{activeChat.latest_order_status || "Pending"}</span>
                        </p>
                        <Link
                          href={`/admin/orders?search=${activeChat.latest_order_id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF7A00] hover:underline pt-1"
                        >
                          <span>Open in Orders Manager</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        No orders recorded under this phone number yet.
                      </p>
                    )}
                  </div>

                  {/* WhatsApp Automation Status */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <p className="font-bold text-slate-800">Automation Settings</p>
                    <p className="text-[11px] text-slate-500">
                      Meta Cloud WABA: <span className="font-semibold text-slate-700">Active</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Sender Phone: <span className="font-semibold text-emerald-700">+91 97781 37954</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Webhook: <span className="font-semibold text-slate-700">Live Listening</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Start New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <MessageSquarePlus className="w-4 h-4 text-emerald-600" />
                <span>Start New WhatsApp Chat</span>
              </h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewChat} className="space-y-3.5 pt-3">
              {newChatError && (
                <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {newChatError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Phone Number *
                </label>
                <input
                  type="tel"
                  value={newChatPhone}
                  onChange={(e) => setNewChatPhone(e.target.value)}
                  placeholder="e.g. 9876543210 or +91 98765 43210"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Name (Optional)
                </label>
                <input
                  type="text"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  Start Conversation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

