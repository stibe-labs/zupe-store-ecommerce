"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { formatToIST } from "@/lib/istTime";
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
  Reply,
  Copy,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  MicOff,
  AlertCircle,
  Loader2,
  MapPin,
  User,
  Phone,
  Mail,
  Building2,
  Forward,
  Megaphone,
  Film,
  ImageOff,
  Send,
  ListChecks,
  Tag,
} from "lucide-react";
import { WhatsAppMessage } from "@/lib/whatsappStore";
import { waAudio } from "@/lib/whatsappAudio";

interface MessageBubbleProps {
  message: WhatsAppMessage;
  onReact: (messageId: string, emoji: string) => void;
  onReply: (message: WhatsAppMessage) => void;
  onDelete: (messageId: string) => void;
  onUpdateOrderStatus?: (orderId: string, status: string) => void;
  onImageZoom?: (url: string) => void;
  onQuickReply?: (text: string) => void;
}

const QUICK_REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

const RESEND_PROMPT_TEMPLATE =
  "Hi! We received a WhatsApp attachment format (such as View-Once media, Poll, or Live Location) that WhatsApp Business Cloud API doesn't show on our support desk. Could you please resend it as a regular photo, video, voice note, or text message? Thank you! 🍯";

function buildMediaDownloadUrl(mediaUrl?: string, filename?: string): string | undefined {
  if (!mediaUrl) return undefined;
  if (!mediaUrl.startsWith("/api/admin/whatsapp/media")) return mediaUrl;
  const sep = mediaUrl.includes("?") ? "&" : "?";
  const fnPart = filename ? `&filename=${encodeURIComponent(filename)}` : "";
  return `${mediaUrl}${sep}download=1${fnPart}`;
}

function formatDocumentTypeLabel(mimeType?: string, filename?: string): string {
  const ext = filename?.includes(".") ? filename.split(".").pop()?.toUpperCase() : "";
  if (mimeType) {
    const clean = mimeType.toLowerCase();
    if (clean.includes("pdf")) return "PDF Document";
    if (clean.includes("word") || clean.includes("officedocument.word")) return "Word Document";
    if (clean.includes("excel") || clean.includes("spreadsheet") || clean.includes("csv")) return "Spreadsheet";
    if (clean.includes("powerpoint") || clean.includes("presentation")) return "Presentation";
    if (clean.includes("zip") || clean.includes("rar") || clean.includes("tar")) return "Archive";
    if (clean.startsWith("image/")) return `${clean.split("/")[1]?.toUpperCase() || "Image"} File`;
    if (clean.startsWith("video/")) return `${clean.split("/")[1]?.toUpperCase() || "Video"} File`;
    if (clean.startsWith("audio/")) return "Audio File";
    if (clean.includes("text/plain")) return "Text File";
  }
  if (ext && ext.length <= 6) return `${ext} File`;
  return "Document Attachment";
}

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
                rel="noopener noreferrer"
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
  onQuickReply,
}: MessageBubbleProps) {
  const isAgent = message.sender === "agent";
  const isSystem = message.sender === "system" || message.type === "system";

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showHoverToolbar, setShowHoverToolbar] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [voiceDuration, setVoiceDuration] = useState<number>(message.mediaDuration || 0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [audioError, setAudioError] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [mediaLoadError, setMediaLoadError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [orderActionDone, setOrderActionDone] = useState<string | null>(null);

  const hasAudioUrl = Boolean(message.mediaUrl);
  const meta = message.metadata;

  // Reset media error state if message URL updates
  useEffect(() => {
    setMediaLoadError(false);
  }, [message.mediaUrl]);

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
        <div className="bg-[#FFEECD] dark:bg-[#1f2c34] text-[#54656f] dark:text-[#aebac1] text-xs px-3.5 py-1.5 rounded-lg shadow-xs max-w-md text-center leading-relaxed border border-amber-200/50 dark:border-white/5">
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

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard?.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 1800);
  };

  const handleToggleVoice = async () => {
    if (!hasAudioUrl || !audioRef.current) return;

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

  const isLegacyUnsupportedText =
    message.content?.trim().toLowerCase() === "[unsupported]" ||
    message.content?.includes("not supported on WhatsApp Cloud API");
  const isUnsupportedBubble = message.type === "unsupported" || isLegacyUnsupportedText;

  // Derived captions for image & video so legacy captions stored in content also display
  const imageCaption =
    message.mediaCaption ||
    (message.type === "image" &&
    message.content &&
    !["📷 Photo", "📷 Image"].includes(message.content.trim())
      ? message.content
      : "");

  const videoCaption =
    message.mediaCaption ||
    (message.type === "video" &&
    message.content &&
    message.content.trim() !== "🎥 Video"
      ? message.content
      : "");

  const hasDedicatedRenderer =
    isUnsupportedBubble ||
    message.type === "image" ||
    message.type === "video" ||
    message.type === "sticker" ||
    message.type === "voice" ||
    message.type === "document" ||
    (message.type === "location" && Boolean(meta?.location)) ||
    (message.type === "contacts" && Boolean(meta?.contacts && meta.contacts.length > 0)) ||
    (message.type === "order" && Boolean(meta?.catalogOrder)) ||
    (message.type === "interactive" && Boolean(meta?.interactive)) ||
    message.type === "reaction" ||
    (message.type === "order_card" && Boolean(message.orderData)) ||
    (message.type === "tracking_card" && Boolean(message.orderData)) ||
    (message.type === "product_card" && Boolean(message.productData));

  const documentFilename = meta?.filename || message.content || "TurkiyeJam_Attachment";
  const documentDownloadUrl = buildMediaDownloadUrl(message.mediaUrl, documentFilename);

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
              type="button"
              onClick={() => onReact(message.id, emoji)}
              aria-label={`React with ${emoji}`}
              className="hover:scale-125 transition-transform p-1 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
          <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-white/10 mx-0.5" />
          <button
            type="button"
            onClick={() => onReply(message)}
            title="Reply"
            aria-label="Reply to message"
            className="p-1 text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 cursor-pointer"
          >
            <Reply className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            title={copied ? "Copied!" : "Copy"}
            aria-label="Copy message text"
            className="p-1 text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(message.id)}
            title="Delete message"
            aria-label="Delete message"
            className="p-1 text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={`relative max-w-[85%] md:max-w-[70%] rounded-2xl px-3.5 py-2 shadow-xs text-sm select-text ${
          message.type === "sticker" && !mediaLoadError && message.mediaUrl
            ? "bg-transparent shadow-none border-none px-1 py-1"
            : isAgent
            ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-white rounded-tr-xs"
            : "bg-white dark:bg-[#202c33] text-slate-900 dark:text-white rounded-tl-xs border border-slate-100 dark:border-white/[0.04]"
        }`}
      >
        {/* Forwarded Label */}
        {meta?.forwarded && (
          <div className="flex items-center gap-1 text-[11px] italic text-slate-500 dark:text-slate-400 mb-1">
            <Forward className="w-3.5 h-3.5" />
            <span>{meta.frequentlyForwarded ? "Forwarded many times" : "Forwarded"}</span>
          </div>
        )}

        {/* Click-to-WhatsApp Meta Ad Referral Header */}
        {meta?.referral && (
          <div className="mb-2 p-2.5 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-500/30 text-xs">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                <Megaphone className="w-3 h-3" />
                {meta.referral.sourceType === "ad" ? "Came from Meta Ad" : "WhatsApp Referral"}
              </span>
              {meta.referral.sourceUrl && (
                <a
                  href={meta.referral.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-300 hover:underline inline-flex items-center gap-0.5"
                >
                  View Ad <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
            <div className="flex gap-2.5 items-start">
              {(meta.referral.thumbnailUrl || meta.referral.imageUrl) && (
                <img
                  src={meta.referral.thumbnailUrl || meta.referral.imageUrl}
                  alt={meta.referral.headline || "Meta Ad Preview"}
                  loading="lazy"
                  decoding="async"
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-indigo-200/60 dark:border-white/10"
                />
              )}
              <div className="min-w-0 flex-1">
                {meta.referral.headline && (
                  <div className="font-semibold text-slate-900 dark:text-white line-clamp-2">
                    {meta.referral.headline}
                  </div>
                )}
                {meta.referral.body && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                    {meta.referral.body}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Referred Product Inquiry Context */}
        {meta?.referredProduct?.productRetailerId && (
          <div className="mb-2 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-500/30 text-[11px] flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
            <Tag className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              Inquiring about catalog item:{" "}
              <strong className="font-mono">{meta.referredProduct.productRetailerId}</strong>
            </span>
          </div>
        )}

        {/* Reply Quote Banner if present */}
        {message.replyTo && (
          <div
            className={`mb-2 pl-2.5 py-1 pr-2 text-xs rounded-md border-l-4 ${
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

        {/* 1. Voice Note / Audio Bubble */}
        {message.type === "voice" && (
          <div className="py-1 min-w-[240px] sm:min-w-[280px]">
            {hasAudioUrl ? (
              <>
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
                    type="button"
                    onClick={handleToggleVoice}
                    disabled={isLoadingAudio}
                    title={isPlayingVoice ? "Pause voice note" : "Play voice note"}
                    aria-label={isPlayingVoice ? "Pause voice note" : "Play voice note"}
                    className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
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
                      <div className="flex items-center gap-1.5">
                        <a
                          href={buildMediaDownloadUrl(message.mediaUrl, "whatsapp-voice.ogg")}
                          download="whatsapp-voice.ogg"
                          title="Download audio"
                          aria-label="Download audio"
                          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={cycleSpeed}
                          className="px-1.5 py-0.5 rounded-sm bg-black/5 dark:bg-white/10 text-[10px] font-semibold hover:bg-black/10 cursor-pointer"
                        >
                          {playbackSpeed}x
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {audioError && (
                  <div className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-300 mt-2 bg-rose-50 dark:bg-rose-950/30 p-2 rounded-lg border border-rose-200 dark:border-rose-900/50">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="flex-1">Browser could not stream audio.</span>
                    <a
                      href={buildMediaDownloadUrl(message.mediaUrl, "whatsapp-voice.ogg")}
                      download="whatsapp-voice.ogg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold flex items-center gap-0.5"
                    >
                      <Download className="w-3 h-3" /> Download
                    </a>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3 py-1">
                <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <MicOff className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                    Voice Note
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-300/90 leading-tight mt-0.5">
                    Audio file unavailable (received prior to media capture or expired on Meta)
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Photo / Image Bubble */}
        {message.type === "image" && (
          <div className="mb-1.5">
            {message.mediaUrl && !mediaLoadError ? (
              <div className="overflow-hidden rounded-xl bg-black/5 dark:bg-black/30">
                <button
                  type="button"
                  onClick={() => onImageZoom && onImageZoom(message.mediaUrl!)}
                  className="relative block w-full max-w-[320px] cursor-zoom-in group/img focus:outline-none"
                  aria-label="View photo full size"
                >
                  <img
                    src={message.mediaUrl}
                    alt={imageCaption || "WhatsApp Photo"}
                    loading="lazy"
                    decoding="async"
                    onError={() => setMediaLoadError(true)}
                    className="w-full max-h-72 object-cover rounded-xl group-hover/img:brightness-95 transition-all duration-200"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <span className="bg-black/70 text-white px-2.5 py-1 rounded-full text-xs flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> View Photo
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-100 dark:bg-black/25 border border-slate-200/70 dark:border-white/10 min-w-[220px]">
                <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <ImageOff className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                    Photo Unavailable
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    WhatsApp media may have expired (30-day Meta retention).
                  </div>
                </div>
                {message.mediaUrl && (
                  <a
                    href={buildMediaDownloadUrl(message.mediaUrl, "whatsapp-photo.jpg")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-emerald-600 dark:text-emerald-400 hover:underline text-xs font-semibold"
                    title="Try downloading directly"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
            {imageCaption && (
              <div className="mt-2 text-sm leading-relaxed break-words">
                {formatWhatsAppText(imageCaption)}
              </div>
            )}
          </div>
        )}

        {/* 3. Video Bubble (Inline HTML5 Player + Download + Caption) */}
        {message.type === "video" && (
          <div className="mb-1.5 min-w-[240px] max-w-[340px]">
            {message.mediaUrl && !mediaLoadError ? (
              <div className="overflow-hidden rounded-xl bg-black border border-black/10 dark:border-white/10">
                <video
                  src={message.mediaUrl}
                  controls
                  playsInline
                  preload="metadata"
                  onError={() => setMediaLoadError(true)}
                  className="w-full max-h-72 rounded-t-xl bg-black"
                />
                <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-900/90 text-slate-200 text-[11px]">
                  <span className="inline-flex items-center gap-1">
                    <Film className="w-3.5 h-3.5 text-emerald-400" />
                    {meta?.mimeType ? meta.mimeType.split("/")[1]?.toUpperCase() : "VIDEO"}
                  </span>
                  <a
                    href={buildMediaDownloadUrl(message.mediaUrl, "whatsapp-video.mp4")}
                    download="whatsapp-video.mp4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200 font-medium"
                  >
                    <Download className="w-3 h-3" /> Download
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-100 dark:bg-black/25 border border-slate-200/70 dark:border-white/10">
                <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Film className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                    Video Unavailable
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Video could not stream or expired on Meta servers.
                  </div>
                </div>
                {message.mediaUrl && (
                  <a
                    href={buildMediaDownloadUrl(message.mediaUrl, "whatsapp-video.mp4")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-emerald-600 dark:text-emerald-400"
                    title="Download video"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
            {videoCaption && (
              <div className="mt-2 text-sm leading-relaxed break-words">
                {formatWhatsAppText(videoCaption)}
              </div>
            )}
          </div>
        )}

        {/* 4. Sticker Bubble (Transparent WebP, Uncropped) */}
        {message.type === "sticker" && (
          <div className="py-1">
            {message.mediaUrl && !mediaLoadError ? (
              <button
                type="button"
                onClick={() => onImageZoom && onImageZoom(message.mediaUrl!)}
                className="block cursor-zoom-in focus:outline-none"
                aria-label="View sticker"
              >
                <img
                  src={message.mediaUrl}
                  alt={meta?.animated ? "Animated WhatsApp Sticker" : "WhatsApp Sticker"}
                  loading="lazy"
                  decoding="async"
                  onError={() => setMediaLoadError(true)}
                  className="w-36 h-36 object-contain drop-shadow-sm"
                />
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-black/25 text-xs text-slate-600 dark:text-slate-300">
                <span>🎨</span>
                <span>{message.content || "WhatsApp Sticker"}</span>
              </div>
            )}
          </div>
        )}

        {/* 5. Location Pin Card */}
        {message.type === "location" && meta?.location && (
          <div className="my-1 p-3 rounded-xl bg-white/80 dark:bg-black/25 border border-emerald-500/25 min-w-[230px] max-w-[320px] text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900 dark:text-white leading-snug">
                  {meta.location.name || "Shared Location"}
                </div>
                {meta.location.address && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                    {meta.location.address}
                  </div>
                )}
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                  {meta.location.latitude.toFixed(5)}, {meta.location.longitude.toFixed(5)}
                </div>
              </div>
            </div>
            <a
              href={meta.location.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 flex items-center justify-center gap-1.5 w-full min-h-[38px] py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              Open in Google Maps
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* 6. Shared Contacts (vCard) */}
        {message.type === "contacts" && meta?.contacts && meta.contacts.length > 0 && (
          <div className="my-1 space-y-2 min-w-[240px] max-w-[340px]">
            {meta.contacts.map((contact, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white/80 dark:bg-black/25 border border-slate-200/80 dark:border-white/10 text-xs space-y-2"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {contact.formattedName}
                    </div>
                    {(contact.title || contact.company) && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                        <Building2 className="w-3 h-3 flex-shrink-0" />
                        <span>{[contact.title, contact.company].filter(Boolean).join(" • ")}</span>
                      </div>
                    )}
                  </div>
                </div>

                {contact.phones.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-black/5 dark:border-white/10">
                    {contact.phones.map((p, pIdx) => (
                      <div key={pIdx} className="flex items-center justify-between gap-2">
                        <a
                          href={`tel:${p.phone.replace(/[^\d+]/g, "")}`}
                          className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-mono font-medium hover:underline truncate"
                        >
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span>{p.phone}</span>
                          {p.type && (
                            <span className="text-[10px] font-sans text-slate-400 uppercase">
                              ({p.type})
                            </span>
                          )}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyPhone(p.phone)}
                          className="text-[10px] px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 hover:bg-black/10 text-slate-600 dark:text-slate-200 cursor-pointer flex-shrink-0"
                        >
                          {copiedPhone === p.phone ? "Copied" : "Copy"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {contact.emails.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-black/5 dark:border-white/10">
                    {contact.emails.map((em, eIdx) => (
                      <a
                        key={eIdx}
                        href={`mailto:${em.email}`}
                        className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 hover:underline break-all"
                      >
                        <Mail className="w-3 h-3 flex-shrink-0 text-slate-400" />
                        <span>{em.email}</span>
                      </a>
                    ))}
                  </div>
                )}

                {contact.addresses && contact.addresses.length > 0 && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-black/5 dark:border-white/10">
                    📍 {contact.addresses.join(" | ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 7. WhatsApp Native Catalog Cart / Order */}
        {message.type === "order" && meta?.catalogOrder && (
          <div className="my-1 p-3 rounded-xl bg-white/85 dark:bg-black/25 border border-emerald-500/30 min-w-[240px] max-w-[340px] text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4" /> WhatsApp Catalog Cart
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {meta.catalogOrder.currency} {meta.catalogOrder.totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="space-y-1">
              {meta.catalogOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-700 dark:text-slate-200 truncate">
                    • {item.productRetailerId} × {item.quantity}
                  </span>
                  <span className="font-mono text-slate-600 dark:text-slate-300 flex-shrink-0">
                    {item.currency} {(item.itemPrice * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
            {meta.catalogOrder.text && (
              <div className="pt-1.5 border-t border-black/5 dark:border-white/10 text-slate-700 dark:text-slate-200">
                {formatWhatsAppText(meta.catalogOrder.text)}
              </div>
            )}
          </div>
        )}

        {/* 8. Interactive Button / List / Flow Reply */}
        {message.type === "interactive" && meta?.interactive && (
          <div className="my-1 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/12 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
              <ListChecks className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{meta.interactive.title || message.content}</span>
            </div>
            {meta.interactive.description && (
              <div className="text-xs text-slate-600 dark:text-slate-300">
                {meta.interactive.description}
              </div>
            )}
            {meta.interactive.flowFields && meta.interactive.flowFields.length > 0 && (
              <div className="mt-1.5 p-2.5 rounded-xl bg-black/5 dark:bg-black/25 space-y-1 text-xs">
                {meta.interactive.flowFields.map((field, idx) => (
                  <div key={idx} className="flex justify-between gap-3">
                    <span className="text-slate-500 dark:text-slate-400">{field.key}:</span>
                    <span className="font-medium text-slate-900 dark:text-white text-right break-all">
                      {field.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 9. Standalone Reaction Event (when target predated inbox history) */}
        {message.type === "reaction" && (
          <div className="flex items-center gap-2 py-0.5 text-xs text-slate-700 dark:text-slate-200">
            <span className="text-lg leading-none">{meta?.reaction?.emoji || "👍"}</span>
            <span>{message.content || "Reacted to an earlier message"}</span>
          </div>
        )}

        {/* 10. Interactive Order Confirmation Card (ERP Outbound) */}
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
                <span className="font-medium">{message.orderData.itemsSummary}</span>
              </div>
              {message.orderData.shippingAddress && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 line-clamp-2">
                  📍 {message.orderData.shippingAddress}
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/10 flex items-center gap-2">
              {orderActionDone ? (
                <div className="w-full text-center py-1.5 font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> {orderActionDone}
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderActionDone("Order Confirmed via WhatsApp");
                      if (onUpdateOrderStatus && message.orderData?.orderId) {
                        onUpdateOrderStatus(message.orderData.orderId, "Confirmed");
                      }
                    }}
                    className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-center flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Order
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderActionDone("Order Cancelled by Customer");
                      if (onUpdateOrderStatus && message.orderData?.orderId) {
                        onUpdateOrderStatus(message.orderData.orderId, "Cancelled");
                      }
                    }}
                    className="py-1.5 px-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* 11. Shipment Tracking Card */}
        {message.type === "tracking_card" && message.orderData && (
          <div className="my-1.5 p-3 rounded-xl bg-white/80 dark:bg-black/20 border border-blue-500/30 text-xs">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2 mb-2">
              <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Truck className="w-4 h-4" /> {message.orderData.courier || "Shiprocket Air"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-300">
                In Transit
              </span>
            </div>

            <div className="space-y-1.5 text-slate-700 dark:text-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">AWB Number:</span>
                <span className="font-mono font-semibold">{message.orderData.awb || "SR188920489IN"}</span>
              </div>
              <div className="pt-2">
                <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-2/3 rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  <span>Picked Up</span>
                  <span className="text-blue-600 font-semibold">In Transit</span>
                  <span>Out for Delivery</span>
                </div>
              </div>
            </div>

            <a
              href={`https://turkiyejam.com/track-order?awb=${encodeURIComponent(message.orderData.awb || "SR188920489IN")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-center py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Track Live Package <ExternalLink className="w-3 h-3 inline ml-1" />
            </a>
          </div>
        )}

        {/* 12. Turkiye Jam Product Catalog Card */}
        {message.type === "product_card" && message.productData && (
          <div className="my-1.5 p-3 rounded-xl bg-white/80 dark:bg-black/20 border border-amber-500/30 text-xs">
            <div className="flex gap-3 items-center">
              <div className="relative w-14 h-14 rounded-lg bg-amber-500/10 border border-amber-500/20 flex-shrink-0 flex items-center justify-center overflow-hidden">
                <Image
                  src="/turkiye-jam-logo.svg"
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
                  {message.productData.badge || "100% Herbal • Anatolian Formula"}
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
              href="https://turkiyejam.com/products"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 block text-center py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
            >
              Order on Turkiye Jam Website
            </a>
          </div>
        )}

        {/* 13. Document / File Attachment (Real Filename, Real MIME, Working Preview & Download) */}
        {message.type === "document" && (
          <div className="my-1 min-w-[240px]">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/70 dark:bg-black/25 border border-black/5 dark:border-white/10">
              <div className="w-10 h-10 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs text-slate-900 dark:text-white truncate" title={documentFilename}>
                  {documentFilename}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {formatDocumentTypeLabel(meta?.mimeType, documentFilename)}
                </div>
              </div>
              {message.mediaUrl ? (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <a
                    href={message.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Preview file"
                    aria-label={`Preview ${documentFilename}`}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 hover:text-emerald-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <a
                    href={documentDownloadUrl}
                    download={documentFilename}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Download file"
                    aria-label={`Download ${documentFilename}`}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 hover:text-emerald-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <span className="text-[10px] text-slate-400 px-1.5">No file link</span>
              )}
            </div>
            {message.mediaCaption && (
              <div className="mt-2 text-sm leading-relaxed break-words">
                {formatWhatsAppText(message.mediaCaption)}
              </div>
            )}
          </div>
        )}

        {/* 14. Meta Cloud API Restricted / Unsupported Format Card */}
        {isUnsupportedBubble && (
          <div className="py-1.5 px-0.5 min-w-[240px] max-w-[340px] space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                  {meta?.unsupported?.title || "WhatsApp Cloud API Restricted Format"}
                </div>
                {meta?.unsupported?.code && (
                  <div className="text-[10px] font-mono text-amber-700 dark:text-amber-300 mt-0.5">
                    Meta Error {meta.unsupported.code}
                    {meta.unsupported.details ? ` — ${meta.unsupported.details}` : ""}
                  </div>
                )}
                <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug mt-1">
                  Meta does not deliver media bytes for client-only formats (View-Once photos/videos, Polls, Live Location streams, Events, or Deleted messages).
                </div>
              </div>
            </div>
            {onQuickReply && (
              <button
                type="button"
                onClick={() => onQuickReply(RESEND_PROMPT_TEMPLATE)}
                className="w-full min-h-[36px] px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-200 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Ask customer to resend as photo/text
              </button>
            )}
          </div>
        )}

        {/* 15. Standard Text Content (text, template, or legacy text-only order/tracking/product cards) */}
        {!hasDedicatedRenderer && (
          <div className="leading-relaxed text-sm break-words select-text">
            {formatWhatsAppText(message.content)}
          </div>
        )}

        {/* Timestamp and Delivery Ticks */}
        <div
          className={`flex items-center justify-end gap-1 mt-1 text-[11px] float-right ml-3 select-none ${
            message.type === "sticker" && !mediaLoadError && message.mediaUrl
              ? "bg-black/45 text-white px-2 py-0.5 rounded-full"
              : "text-slate-500 dark:text-white/60"
          }`}
        >
          <span>{formatToIST(message.createdAt || message.timestamp)}</span>
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
