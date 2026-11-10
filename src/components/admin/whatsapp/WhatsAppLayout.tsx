"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquare, Sparkles } from "lucide-react";
import ChatSidebar from "./ChatSidebar";
import ActiveChatArea from "./ActiveChatArea";
import CustomerOrderDrawer from "./CustomerOrderDrawer";
import VoiceCallModal from "./VoiceCallModal";
import VideoCallModal from "./VideoCallModal";
import QuickTemplatesModal from "./QuickTemplatesModal";
import PaymentLinkModal from "./PaymentLinkModal";
import NewChatModal from "./NewChatModal";
import {
  WhatsAppConversation,
  WhatsAppMessage,
} from "@/lib/whatsappStore";
import { waAudio } from "@/lib/whatsappAudio";

export default function WhatsAppLayout() {
  const searchParams = useSearchParams();
  const initialChatId = searchParams.get("chat") || searchParams.get("phone") || "";

  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Modals & Panels
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [draftMessageText, setDraftMessageText] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isCustomerTyping, setIsCustomerTyping] = useState(false);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/whatsapp?action=conversations&filter=${filter}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.conversations)) {
        const nextConvs: WhatsAppConversation[] = data.conversations.map((c: WhatsAppConversation) => {
          // If conversation is currently active, ensure its unreadCount stays 0 locally to prevent badge flashing
          if (c.id === activeConversationId) {
            return { ...c, unreadCount: 0 };
          }
          return c;
        });

        setConversations((prev) => {
          if (prev.length !== nextConvs.length) return nextConvs;
          const isSame = prev.every((pc, idx) => {
            const nc = nextConvs[idx];
            return (
              nc &&
              pc.id === nc.id &&
              pc.unreadCount === nc.unreadCount &&
              pc.isPinned === nc.isPinned &&
              pc.orderStatus === nc.orderStatus &&
              pc.lastMessage?.text === nc.lastMessage?.text &&
              pc.lastMessage?.timestamp === nc.lastMessage?.timestamp &&
              pc.lastMessage?.status === nc.lastMessage?.status
            );
          });
          return isSame ? prev : nextConvs;
        });

        // Auto select first or matched conversation
        if (!activeConversationId && nextConvs.length > 0) {
          if (initialChatId) {
            const matched = nextConvs.find(
              (c: WhatsAppConversation) =>
                c.id === initialChatId ||
                c.customerPhone.includes(initialChatId) ||
                (c.orderId && c.orderId.includes(initialChatId))
            );
            if (matched) {
              setActiveConversationId(matched.id);
            } else {
              setActiveConversationId(nextConvs[0].id);
            }
          } else {
            setActiveConversationId(nextConvs[0].id);
          }
        }
      }
    } catch (e) {
      console.warn("Failed to fetch WhatsApp conversations:", e);
    } finally {
      setLoading(false);
    }
  }, [filter, search, activeConversationId, initialChatId]);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/admin/whatsapp?action=messages&conversationId=${encodeURIComponent(convId)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages((prev) => {
          const merged = data.messages.map((nm: WhatsAppMessage) => {
            const pm = prev.find((m) => m.id === nm.id);
            // If local state is already 'delivered' or 'read', don't downgrade to 'sending'
            if (pm && (pm.status === "delivered" || pm.status === "read") && nm.status === "sending") {
              return { ...nm, status: pm.status };
            }
            return nm;
          });

          if (prev.length !== merged.length) return merged;
          const isSame = prev.every((pm, idx) => {
            const nm = merged[idx];
            return (
              nm &&
              pm.id === nm.id &&
              pm.status === nm.status &&
              pm.content === nm.content
            );
          });
          return isSame ? prev : merged;
        });

        // Mark as read in store
        fetch(`/api/admin/whatsapp`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "mark_read", conversationId: convId }),
        }).catch(() => {});

        // Local state update
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
        );
      }
    } catch (e) {
      console.warn("Failed to fetch messages:", e);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    }
  }, [activeConversationId, fetchMessages]);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || null;

  const prevMessagesCountRef = useRef<number>(0);

  // Live polling: automatically sync conversations & active chat every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      fetchConversations();
      if (activeConversationId) {
        fetchMessages(activeConversationId);
      }
    }, 3500);

    return () => clearInterval(timer);
  }, [fetchConversations, fetchMessages, activeConversationId]);

  // Authentic WhatsApp chime on incoming customer message
  useEffect(() => {
    if (messages.length > prevMessagesCountRef.current && prevMessagesCountRef.current > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.sender === "customer") {
        waAudio.playIncomingChime();
      }
    }
    prevMessagesCountRef.current = messages.length;
  }, [messages]);

  // Send message handler with live progression
  const handleSendMessage = async (payload: {
    content: string;
    type?: any;
    orderData?: any;
    productData?: any;
    mediaUrl?: string;
    mediaCaption?: string;
    mediaDuration?: number;
    replyTo?: any;
    sendLiveMeta?: boolean;
  }) => {
    if (!activeConversationId) return;

    try {
      const res = await fetch("/api/admin/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_message",
          conversationId: activeConversationId,
          ...payload,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        const sentMsg = data.message;
        setMessages((prev) => [...prev, sentMsg]);

        // Broadcast live via Meta Cloud API by default
        const shouldSendLive = payload.sendLiveMeta !== false;
        if (shouldSendLive && activeConversation?.customerPhone) {
          fetch("/api/admin/whatsapp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "send_live_meta",
              recipientPhone: activeConversation.customerPhone,
              messageText: payload.content,
              messageId: sentMsg.id,
            }),
          })
            .then((res) => res.json())
            .then((metaRes) => {
              if (metaRes.success) {
                setMessages((prev) =>
                  prev.map((m) => (m.id === sentMsg.id ? { ...m, status: "delivered" } : m))
                );
              }
            })
            .catch(() => {});
        }

        // Live status progression: sending -> sent -> delivered
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) => (m.id === sentMsg.id && m.status === "sending" ? { ...m, status: "sent" } : m))
          );
        }, 500);

        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) => (m.id === sentMsg.id ? { ...m, status: "delivered" } : m))
          );
          // Persist delivered status to database
          fetch("/api/admin/whatsapp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "update_status",
              messageId: sentMsg.id,
              status: "delivered",
            }),
          }).catch(() => {});
        }, 1200);
      }
    } catch (e) {
      console.warn("Failed to send message:", e);
    }
  };

  // Reactions
  const handleReact = async (messageId: string, emoji: string) => {
    if (!activeConversationId) return;

    // Optimistic local update
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === messageId) {
          const currentReactions = m.reactions || [];
          const exists = currentReactions.find((r) => r.by === "agent");
          let newReactions;
          if (exists) {
            if (exists.emoji === emoji) {
              newReactions = currentReactions.filter((r) => r.by !== "agent");
            } else {
              newReactions = currentReactions.map((r) =>
                r.by === "agent" ? { ...r, emoji } : r
              );
            }
          } else {
            newReactions = [...currentReactions, { emoji, by: "agent" as const }];
          }
          return { ...m, reactions: newReactions };
        }
        return m;
      })
    );

    await fetch("/api/admin/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "react",
        conversationId: activeConversationId,
        messageId,
        emoji,
        by: "agent",
      }),
    });
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!activeConversationId) return;
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    await fetch("/api/admin/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete_message",
        conversationId: activeConversationId,
        messageId,
      }),
    });
  };

  // Toggle Pin
  const handleTogglePin = async (convId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, isPinned: !c.isPinned } : c))
    );
    await fetch("/api/admin/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_pin", conversationId: convId }),
    });
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    await fetch("/api/admin/whatsapp", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_order",
        orderId,
        deliveryStatus: status,
      }),
    });

    // Also send confirmation card message in chat
    handleSendMessage({
      content: `System update: Order #${orderId} marked as *${status}* in ERP.`,
      type: "text",
    });
  };

  // Trigger simulated inbound customer message for testing
  const handleSimulateInbound = async () => {
    if (!activeConversationId) return;
    try {
      const res = await fetch("/api/admin/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "simulate_reply",
          conversationId: activeConversationId,
        }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        waAudio.playIncomingChime();
      }
    } catch (e) {
      console.warn("Failed inbound test:", e);
    }
  };

  // Create new conversation
  const handleCreateChat = async (payload: any) => {
    try {
      const res = await fetch("/api/admin/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_conversation",
          customerPhone: payload.customerPhone,
          customerName: payload.customerName,
          customerEmail: payload.customerEmail,
          orderId: payload.orderId,
          category: payload.category,
        }),
      });
      const data = await res.json();
      if (data.success && data.conversation) {
        setConversations((prev) => [data.conversation, ...prev]);
        setActiveConversationId(data.conversation.id);

        // If an initial template message was selected, immediately dispatch it
        if (payload.initialMessage) {
          try {
            const sendRes = await fetch("/api/admin/whatsapp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "send_message",
                conversationId: data.conversation.id,
                content: payload.initialMessage,
                type: "template",
              }),
            });
            const sendData = await sendRes.json();
            if (sendData.success && sendData.message) {
              setMessages([sendData.message]);
              waAudio.playOutgoingPop();

              // Update conversation preview in sidebar
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === data.conversation.id
                    ? {
                        ...c,
                        lastMessage: {
                          text: payload.initialMessage,
                          sender: "agent",
                          timestamp: "Just now",
                          status: "sent",
                        },
                      }
                    : c
                )
              );

              // Broadcast live via Meta Cloud API
              if (data.conversation.customerPhone) {
                fetch("/api/admin/whatsapp", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "send_live_meta",
                    recipientPhone: data.conversation.customerPhone,
                    messageText: payload.initialMessage,
                    messageId: sendData.message.id,
                  }),
                }).catch(() => {});
              }
            }
          } catch (sendErr) {
            console.warn("Failed to dispatch initial message:", sendErr);
          }
        }
      }
    } catch (e) {
      console.warn("Failed to create chat:", e);
    }
  };

  // Clear all chats & messages
  const handleClearAllChats = async () => {
    try {
      const res = await fetch("/api/admin/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_all_chats" }),
      });
      const data = await res.json();
      if (data.success) {
        setConversations([]);
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (e) {
      console.warn("Failed to clear all chats:", e);
    }
  };

  return (
    <div className="relative flex h-full flex-1 w-full overflow-hidden bg-white dark:bg-[#111b21] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10">
      {/* 1. Left Sidebar: Chats Feed */}
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => setActiveConversationId(id)}
        onOpenNewChat={() => setShowNewChatModal(true)}
        onSimulateInbound={handleSimulateInbound}
        onClearAllChats={handleClearAllChats}
        filter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
        onTogglePin={handleTogglePin}
      />

      {/* 2. Center Area: Active Chat Canvas */}
      {activeConversation ? (
        <ActiveChatArea
          conversation={activeConversation}
          messages={messages}
          onSendMessage={handleSendMessage}
          onReactToMessage={handleReact}
          onDeleteMessage={handleDeleteMessage}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onStartVoiceCall={() => setShowVoiceCall(true)}
          onStartVideoCall={() => setShowVideoCall(true)}
          onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
          isDrawerOpen={isDrawerOpen}
          onOpenTemplates={() => setShowTemplatesModal(true)}
          onOpenPaymentLinkModal={() => setShowPaymentLinkModal(true)}
          draftText={draftMessageText}
          onClearDraftText={() => setDraftMessageText("")}
          isTyping={isCustomerTyping}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#f0f2f5] dark:bg-[#202c33] text-center select-none">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
            WhatsApp Desk
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
            Select a customer conversation from the list to view real-time chat, confirm orders, send tracking links, and manage support.
          </p>
        </div>
      )}

      {/* 3. Right Area: Collapsible Order Intelligence Drawer */}
      {activeConversation && isDrawerOpen && (
        <CustomerOrderDrawer
          conversation={activeConversation}
          onClose={() => setIsDrawerOpen(false)}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onRefreshConversations={fetchConversations}
          onOpenPaymentLinkModal={() => setShowPaymentLinkModal(true)}
          onSendQuickTemplate={(type) => {
            const cleanName = activeConversation.customerName.includes("(")
              ? "there"
              : activeConversation.customerName.split(" ")[0];

            let tpl = "";
            if (type === "malayalam_pricing_inquiry") {
              tpl = `നമസ്കാരം 😊\n*Turkiye Jam* അന്വേഷിച്ചതിന് നന്ദി!\n\nലഭ്യമായ പാക്കുകളും വിലയും 👇\n\n🔸 *2 സാഷെ — ₹899*\n🔸 *3 സാഷെ — ₹1,099*\n🔸 *4 സാഷെ — ₹1,399*\n🔸 *6 സാഷെ — ₹1,899*\n🎁 *12 + 2 സാഷെ ബോക്സ് — ₹2,899*\n(ആകെ 14 സാഷെ ലഭിക്കും!)\n\n🫙 *240g ജാർ + 2 സാഷെ ഫ്രീ — ₹2,899*\n_(നിലവിൽ സ്റ്റോക്കില്ല)_\n\n📦 ഇന്ത്യയിലുടനീളം സൗജന്യ ഡെലിവറി (Free Delivery)\n💵 Cash on Delivery (COD) ലഭ്യമാണ്\n🛵 കൊച്ചിയിൽ Porter വഴി 1 മണിക്കൂർ എക്സ്പ്രസ് ഡെലിവറി — ലഭ്യത അനുസരിച്ച്.\n\n🌐 *വെബ്‌സൈറ്റ് വഴി നേരിട്ട് ഓർഡർ ചെയ്യാൻ:*\nhttps://turkiyejam.com\n\n💬 *WhatsApp വഴി നേരിട്ട് വാങ്ങാൻ:*\nഏത് പാക്കാണ് വേണ്ടതെന്ന് അറിയിച്ച് നിങ്ങളുടെ *പേര്, പൂർണ്ണ വിലാസം, പിൻകോഡ്* ഇവിടെ അയച്ചാൽ മതിയാകും. ഞങ്ങൾ ഓർഡർ ബുക്ക് ചെയ്ത് അയച്ചു തരാം! 😊\n\n*ഏത് പാക്കാണ് താങ്കൾക്ക് വേണ്ടത്?*`;
            } else if (type === "order_confirmation_cod") {
              tpl = `Salam ${cleanName}! 🌿 Your Turkiye Jam Cash on Delivery order #${activeConversation.orderId ? activeConversation.orderId.substring(0, 8) : "TJ-6383"} of ₹${activeConversation.orderTotal || 899} is ready for dispatch. Please reply *YES* to confirm!`;
            } else if (type === "order_dispatched_awb") {
              tpl = `Great news ${cleanName}! 🚀 Your Turkiye Jam package has been dispatched via Shiprocket / Express Logistics.\n\nLive tracking: https://turkiyejam.com/track-order?awb=SR-434776383`;
            } else if (type === "abandoned_cart_discount") {
              tpl = `Hi ${cleanName}! 🍯 Use exclusive VIP coupon code *TURKIYE100* for instant ₹100 OFF on your Turkiye Jam order: https://turkiyejam.com/cart?discount=TURKIYE100`;
            } else if (type === "catalog_products") {
              tpl = `Salam ${cleanName}! 🌿 Welcome to *Turkiye Jam Official*.\n\nExplore our authentic herbal formulas:\n• *Turkiye Jam (2 Sachet Pack)* — ₹899\n• *Turkiye Jam (3 Sachet Pack)* — ₹1,099\n\nVisit our storefront: https://turkiyejam.com\nNeed help placing an order? Reply to this message!`;
            } else if (type === "usage_guide") {
              tpl = `🌿 *Turkiye Jam Usage & Dosage Instructions*\n\n1. Take 1 sachet (or 1 teaspoon) 30-45 minutes before sleep.\n2. Mix with lukewarm milk or water, or consume directly.\n3. Drink 1-2 glasses of water afterwards.\n\nFeel free to ask if you have any questions!`;
            } else if (type === "care_greeting") {
              tpl = `Salam ${cleanName}! 🌿 Thank you for reaching out to Turkiye Jam Customer Care. How may we assist you today?`;
            } else {
              tpl = `Hi ${cleanName}, our courier attempted delivery today. Would you like a reattempt scheduled for tomorrow?`;
            }

            handleSendMessage({ content: tpl, type: "text" });
          }}
        />
      )}

      {/* Voice Call Modal */}
      {showVoiceCall && activeConversation && (
        <VoiceCallModal
          conversation={activeConversation}
          onEndCall={() => setShowVoiceCall(false)}
        />
      )}

      {/* Video Call Modal */}
      {showVideoCall && activeConversation && (
        <VideoCallModal
          conversation={activeConversation}
          onEndCall={() => setShowVideoCall(false)}
        />
      )}

      {/* Quick Canned Templates Modal */}
      {showTemplatesModal && activeConversation && (
        <QuickTemplatesModal
          conversation={activeConversation}
          onClose={() => setShowTemplatesModal(false)}
          onSendTemplate={(content) => handleSendMessage({ content, type: "template" })}
          onOpenPaymentLinkModal={() => {
            setShowTemplatesModal(false);
            setShowPaymentLinkModal(true);
          }}
        />
      )}

      {/* Custom Payment Link Modal (Settler & Cashfree UPI Link Generator) */}
      {showPaymentLinkModal && activeConversation && (
        <PaymentLinkModal
          conversation={activeConversation}
          onClose={() => setShowPaymentLinkModal(false)}
          onPasteToChat={(renderedText) => {
            setDraftMessageText(renderedText);
          }}
          onSendDirectly={(renderedText) => {
            handleSendMessage({ content: renderedText, type: "template" });
          }}
        />
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onCreateChat={handleCreateChat}
        />
      )}
    </div>
  );
}

