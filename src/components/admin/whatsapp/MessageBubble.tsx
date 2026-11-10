"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Check,
  CheckCheck,
  Clock,
  Play,
  Pause,
  Download,
  FileText,
  ExternalLink,
  ShoppingBag,
  Truck,
  Sparkles,
  Smile,
  Reply,
  Copy,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  MicOff,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { WhatsAppMessage, WhatsAppReaction } from "@/lib/whatsappStore";
import { waAudio } from "@/lib/whatsappAudio";

interface MessageBubbleProps {
  message: WhatsAppMessage;
  onReact: (messageId: string, emoji: string) => void;
  onReply: (message: WhatsAppMessage) => void;
  onDelete: (messageId: string) => void;
  onUpdateOrderStatus?: (orderId: string, status: string) => void;
  onImageZoom?: (url: string) => void;
}

const QUICK_REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

function formatWhatsAppText(text: string): React.ReactNode {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, lineIdx) => {
    const tokens = line.split(/(\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~|`[^`\n]+`|https?:\/\/[^\s]+)/g);
    return (
      <React.Fragment key={lineIdx}>
        {tokens.map((token, tokenIdx) => {
          if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
            return (
              <strong key={tokenIdx} className="font-semibold text-slate-900 dark:text-white">
                {token.slice(1, -1)}
              </strong>
            );
          }
          if (token.startsWith("_") && token.endsWith("_") && token.length > 2) {
            return (
              <em key={tokenIdx} className="italic opacity-90">
                {token.slice(1, -1)}
              </em>
            );
          }
          if (token.startsWith("~") && token.endsWith("~") && token.length > 2) {
            return (
              <del key={tokenIdx} className="line-through opacity-70">
                {token.slice(1, -1)}
              </del>
            );
          }
          if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
            return (
              <code key={tokenIdx} className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-xs font-mono">
                {token.slice(1, -1)}
              </code>
            );
          }
          if (token.startsWith("http://") || token.startsWith("https://")) {
            return (
              <a
                key={tokenIdx}
                href={token}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 dark:text-emerald-300 underline font-medium hover:opacity-80 break-all"
              >
                {token}
              </a>
            );
          }
          return token;
        })}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

export default function MessageBubble({
  message,
  onReact,
  onReply,
  onDelete,
  onUpdateOrderStatus,
  onImageZoom,
}: MessageBubbleProps) {
  const isAgent = message.sender === "agent";
  const isSystem = message.sender === "system";

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showHoverToolbar, setShowHoverToolbar] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [voiceDuration, setVoiceDuration] = useState<number>(message.mediaDuration || 0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [audioError, setAudioError] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [orderActionDone, setOrderActionDone] = useState<string | null>(null);

  const hasAudioUrl = Boolean(message.mediaUrl);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // System notification pill
  if (isSystem) {
    return (
      <div className="flex justify-center my-3 px-4">
        <div className="bg-[#FFEECD] dark:bg-[#1f2c34] text-[#54656f] dark:text-[#8696a0] text-xs px-3.5 py-1.5 rounded-lg shadow-xs max-w-md text-center leading-relaxed border border-amber-200/50 dark:border-white/5">
          {message.content}
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleVoice = async () => {
    if (!hasAudioUrl) return;
    if (!audioRef.current) return;

    try {
      if (isPlayingVoice) {
        audioRef.current.pause();
        waAudio.playVoiceNoteBeep("stop");
      } else {
        setAudioError(false);
        setIsLoadingAudio(true);
        waAudio.playVoiceNoteBeep("start");
        await audioRef.current.play();
        setIsLoadingAudio(false);
      }
    } catch (err) {
      console.warn("Audio playback error:", err);
      setIsLoadingAudio(false);
      setIsPlayingVoice(false);
      setAudioError(true);
    }
  };

  const cycleSpeed = () => {
    const nextSpeed = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleSeek = (index: number, total: number) => {
    const totalDuration = voiceDuration || audioRef.current?.duration || 30;
    if (audioRef.current && totalDuration > 0) {
      const targetTime = (index / total) * totalDuration;
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const formatVoiceTime = (secs: number) => {
    if (!secs || isNaN(secs) || secs < 0) return "0s";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    if (m > 0) {
      return `${m}:${s < 10 ? "0" : ""}${s}`;
    }
    return `${s}s`;
  };

  const renderStatusTicks = () => {
    if (!isAgent) return null;
    switch (message.status) {
      case "sending":
        return <Clock className="w-3.5 h-3.5 text-slate-400 inline ml-1" />;
      case "sent":
        return <Check className="w-3.5 h-3.5 text-slate-400 inline ml-1" />;
      case "delivered":
        return <CheckCheck className="w-3.5 h-3.5 text-slate-400 inline ml-1" />;
      case "read":
      default:
        return <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] inline ml-1" />;
    }
  };

  return (
    <div
      className={`group relative flex my-2 px-4 ${isAgent ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setShowHoverToolbar(true)}
      onMouseLeave={() => setShowHoverToolbar(false)}
    >
      {/* Floating Hover Toolbar (WhatsApp Quick Reactions & Actions) */}
      {showHoverToolbar && (
        <div
          className={`absolute -top-9 z-30 flex items-center gap-1 bg-white dark:bg-[#202c33] shadow-lg border border-slate-200 dark:border-white/10 rounded-full px-2.5 py-1 text-sm transition-all animate-in fade-in zoom-in-95 ${
            isAgent ? "right-6" : "left-6"
          }`}
        >
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onReact(message.id, emoji)}
              className="hover:scale-125 transition-transform p-1 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
          <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-white/10 mx-0.5" />
          <button
            onClick={() => onReply(message)}
            title="Reply"
            className="p-1 text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 cursor-pointer"
          >
            <Reply className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            title={copied ? "Copied!" : "Copy"}
            className="p-1 text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(message.id)}
            title="Delete message"
            className="p-1 text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:rose-400 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={`relative max-w-[85%] md:max-w-[70%] rounded-2xl px-3.5 py-2 shadow-xs text-sm select-text ${
          isAgent
            ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-white rounded-tr-xs"
            : "bg-white dark:bg-[#202c33] text-slate-900 dark:text-white rounded-tl-xs border border-slate-100 dark:border-white/[0.04]"
        }`}
      >
        {/* Reply Quote Banner if present */}
        {message.replyTo && (
          <div
            className={`mb-2 pl-2.5 py-1 text-xs rounded-md border-l-4 ${
              isAgent
                ? "bg-emerald-100/60 dark:bg-emerald-950/40 border-emerald-600 text-slate-700 dark:text-emerald-200"
                : "bg-slate-100 dark:bg-slate-800 border-emerald-500 text-slate-600 dark:text-slate-300"
            }`}
          >
            <div className="font-semibold text-[11px] text-emerald-700 dark:text-emerald-400">
              {message.replyTo.sender}
            </div>
            <div className="line-clamp-2 truncate">{message.replyTo.snippet}</div>
          </div>
        )}

        {/* 1. Voice Note Bubble */}
        {message.type === "voice" && (
          <div className="py-1 min-w-[240px] sm:min-w-[280px]">
            {hasAudioUrl ? (
              <>
                {/* HTML5 Native Audio element */}
                <audio
                  ref={audioRef}
                  src={message.mediaUrl}
                  preload="metadata"
                  onPlay={() => {
                    setIsPlayingVoice(true);
                    setIsLoadingAudio(false);
                  }}
                  onPause={() => setIsPlayingVoice(false)}
                  onTimeUpdate={() => {
                    if (audioRef.current) {
                      setCurrentTime(audioRef.current.currentTime);
                    }
                  }}
                  onLoadedMetadata={() => {
                    if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration)) {
                      setVoiceDuration(audioRef.current.duration);
                    }
                    setIsLoadingAudio(false);
                  }}
                  onEnded={() => {
                    setIsPlayingVoice(false);
                    setCurrentTime(0);
                    waAudio.playVoiceNoteBeep("stop");
                  }}
                  onError={() => {
                    setIsLoadingAudio(false);
                    setIsPlayingVoice(false);
                    setAudioError(true);
                  }}
                />

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleVoice}
                    disabled={isLoadingAudio}
                    title={isPlayingVoice ? "Pause voice note" : "Play voice note"}
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                      isPlayingVoice
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30 scale-105"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white"
                    }`}
                  >
                    {isLoadingAudio ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isPlayingVoice ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </button>

                  {/* Waveform Visualization Bars with Interactive Seeking */}
                  <div className="flex-1">
                    <div
                      className="flex items-center gap-[3px] h-7 cursor-pointer group/wave"
                      title="Click to seek"
                    >
                      {[12, 24, 18, 30, 22, 14, 28, 20, 10, 26, 32, 18, 14, 22, 28, 16, 20, 12].map(
                        (height, i) => {
                          const totalDuration = voiceDuration || 30;
                          const currentFraction = totalDuration > 0 ? currentTime / totalDuration : 0;
                          const isPlayed = i / 18 <= currentFraction;
                          return (
                            <div
                              key={i}
                              onClick={() => handleSeek(i, 18)}
                              className={`w-1 rounded-full transition-all duration-100 group-hover/wave:scale-y-110 ${
                                isPlayed
                                  ? "bg-emerald-600 dark:bg-emerald-400"
                                  : "bg-slate-300 dark:bg-white/20"
                              } ${isPlayingVoice && isPlayed ? "animate-pulse" : ""}`}
                              style={{ height: `${height}px` }}
                            />
                          );
                        }
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-300 mt-1">
                      <span>
                        {formatVoiceTime(currentTime)} / {formatVoiceTime(voiceDuration || 30)}
                      </span>
                      <button
                        onClick={cycleSpeed}
                        className="px-1.5 py-0.5 rounded-sm bg-black/5 dark:bg-white/10 text-[10px] font-semibold hover:bg-black/10 cursor-pointer"
                      >
                        {playbackSpeed}x
                      </button>
                    </div>
                  </div>
                </div>

                {audioError && (
                  <div className="flex items-center gap-1.5 text-[10px] text-rose-500 mt-2 bg-rose-50 dark:bg-rose-950/30 p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="flex-1">Audio playback issue in browser.</span>
                    <a
                      href={message.mediaUrl}
                      download="whatsapp-voice-note.ogg"
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-semibold hover:text-rose-600 flex items-center gap-0.5"
                    >
                      <Download className="w-3 h-3" /> Download
                    </a>
                  </div>
                )}
              </>
            ) : (
              /* Fallback UI for Historical Messages Without Media URL */
              <div className="flex items-center gap-3 py-1">
                <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <MicOff className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                    Voice Note
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-300/90 leading-tight mt-0.5">
                    Audio uncaptured (received prior to media update)
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Media / Photo Bubble */}
        {message.type === "image" && message.mediaUrl && (
          <div className="mb-2 overflow-hidden rounded-xl">
            <div
              className="relative aspect-video max-h-60 w-full cursor-pointer group/img"
              onClick={() => onImageZoom && onImageZoom(message.mediaUrl!)}
            >
              <Image
                src={message.mediaUrl}
                alt={message.mediaCaption || "WhatsApp Image"}
                fill
                className="object-cover rounded-xl group-hover/img:scale-102 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-black/60 text-white px-2.5 py-1 rounded-full text-xs flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> View Photo
                </span>
              </div>
            </div>
            {message.mediaCaption && (
              <p className="mt-2 text-sm leading-relaxed">{message.mediaCaption}</p>
            )}
          </div>
        )}

        {/* 3. Interactive Order Confirmation Card */}
        {message.type === "order_card" && message.orderData && (
          <div className="my-1.5 p-3 rounded-xl bg-white/80 dark:bg-black/20 border border-emerald-500/30 text-xs">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2 mb-2">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4" /> Order #{message.orderData.orderId}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                {message.orderData.paymentMethod}
              </span>
            </div>

            <div className="space-y-1.5 text-slate-700 dark:text-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Total Amount:</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  ₹{message.orderData.totalAmount}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Items:</span>{" "}
                <span className="font-medium text-slate-900 dark:text-white">
                  {message.orderData.itemsSummary}
                </span>
              </div>
              {message.orderData.shippingAddress && (
                <div className="line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                  📍 {message.orderData.shippingAddress}
                </div>
              )}
            </div>

            {/* Quick Agent Actions inside chat bubble */}
            <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/10 flex items-center gap-2">
              {orderActionDone ? (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {orderActionDone}
                </span>
              ) : (
                <>
                  <button
                    onClick={() => {
                      if (onUpdateOrderStatus && message.orderData) {
                        onUpdateOrderStatus(message.orderData.orderId, "Processing");
                        setOrderActionDone("Confirmed & Approved");
                      }
                    }}
                    className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-[11px] flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Approve COD
                  </button>
                  <button
                    onClick={() => {
                      if (onUpdateOrderStatus && message.orderData) {
                        onUpdateOrderStatus(message.orderData.orderId, "Shipped");
                        setOrderActionDone("Marked as Shipped");
                      }
                    }}
                    className="py-1.5 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Truck className="w-3 h-3" /> Mark Shipped
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* 4. Live AWB Tracking Card */}
        {message.type === "tracking_card" && message.orderData && (
          <div className="my-1.5 p-3 rounded-xl bg-blue-50/90 dark:bg-blue-950/40 border border-blue-500/30 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400 mb-1.5">
              <Truck className="w-4 h-4" /> Live Courier Dispatch Notice
            </div>
            <div className="space-y-1 text-slate-700 dark:text-slate-200 text-[11px]">
              <div>
                Carrier: <strong>{message.orderData.courier || "DTDC / BlueDart"}</strong>
              </div>
              <div>
                AWB Tracking No:{" "}
                <strong className="font-mono">{message.orderData.awb || "VD188920489IN"}</strong>
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                Status: {message.orderData.status || "In Transit"}
              </div>
            </div>
            <a
              href={`https://vittaldigital.com/order-tracking?query=${message.orderData.awb || "VD188920489IN"}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2.5 block text-center py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Track Live Milestone ➔
            </a>
          </div>
        )}

        {/* 5. Product Catalog Card */}
        {message.type === "product_card" && message.productData && (
          <div className="my-1.5 p-3 rounded-xl bg-white/90 dark:bg-black/20 border border-amber-500/30 text-xs">
            <div className="flex gap-3">
              <div className="relative w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden">
                <Image
                  src={message.productData.image || "/vittal-digital-logo.png"}
                  alt={message.productData.name}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                  {message.productData.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {message.productData.badge || "100% Genuine • 1-Year Warranty"}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    ₹{message.productData.price}
                  </span>
                  {message.productData.mrp && (
                    <span className="text-[11px] text-slate-400 line-through">
                      ₹{message.productData.mrp}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {message.productData.description}
            </p>
            <a
              href="https://vittaldigital.com/products"
              target="_blank"
              rel="noreferrer"
              className="mt-2.5 block text-center py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
            >
              Order on Vittal Digital Website
            </a>
          </div>
        )}

        {/* 6. Document / PDF Invoice */}
        {message.type === "document" && (
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/60 dark:bg-black/20 border border-black/5 dark:border-white/10 my-1">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs truncate">
                {message.content || "VittalDigital_Invoice.pdf"}
              </div>
              <div className="text-[10px] text-slate-500">PDF Document • GST Invoice</div>
            </div>
            <button className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-500 cursor-pointer">
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Standard Text Content (for text and template types) */}
        {message.type !== "image" && message.type !== "voice" && (
          message.content?.trim().toLowerCase() === "[unsupported]" ||
          message.content?.includes("not supported on WhatsApp Cloud API") ? (
            <div className="flex items-center gap-3 py-1.5 px-0.5 min-w-[220px]">
              <div className="w-9 h-9 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                  Unsupported Attachment
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                  Format (sticker, contact card, or live location) not supported on Cloud API
                </div>
              </div>
            </div>
          ) : (
            <div className="leading-relaxed text-sm break-words select-text">
              {formatWhatsAppText(message.content)}
            </div>
          )
        )}

        {/* Timestamp and Delivery Ticks */}
        <div className="flex items-center justify-end gap-1 mt-1 text-[11px] text-slate-500 dark:text-white/60 float-right ml-3 select-none">
          <span>{message.timestamp}</span>
          {renderStatusTicks()}
        </div>

        {/* Reaction badge pills on bubble corner */}
        {message.reactions && message.reactions.length > 0 && (
          <div
            className={`absolute -bottom-2 flex items-center gap-0.5 bg-white dark:bg-[#202c33] shadow-xs border border-slate-200 dark:border-white/10 rounded-full px-1.5 py-0.5 text-xs ${
              isAgent ? "right-2" : "left-2"
            }`}
          >
            {message.reactions.map((r, i) => (
              <span key={i} title={`Reacted by ${r.by}`}>
                {r.emoji}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

