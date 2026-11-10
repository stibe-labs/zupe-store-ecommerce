"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { PhoneOff, Mic, MicOff, Video, VideoOff, ShieldCheck } from "lucide-react";
import { WhatsAppConversation } from "@/lib/whatsappStore";
import { waAudio } from "@/lib/whatsappAudio";

interface VideoCallModalProps {
  conversation: WhatsAppConversation;
  onEndCall: () => void;
}

export default function VideoCallModal({ conversation, onEndCall }: VideoCallModalProps) {
  const [callStatus, setCallStatus] = useState<"connecting" | "connected">("connecting");
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const durationTimerRef = useRef<any>(null);

  useEffect(() => {
    const stopRinging = waAudio.startCallRinging();

    const connectTimer = setTimeout(() => {
      stopRinging();
      setCallStatus("connected");
      durationTimerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }, 3500);

    return () => {
      stopRinging();
      clearTimeout(connectTimer);
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, []);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg aspect-4/5 sm:aspect-16/10 rounded-3xl bg-[#0b141a] text-white overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-between p-6">
        {/* Top bar */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold overflow-hidden border border-white/20">
              {conversation.avatarUrl ? (
                <Image
                  src={conversation.avatarUrl}
                  alt={conversation.customerName}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                conversation.customerName.charAt(0)
              )}
            </div>
            <div>
              <div className="font-bold text-sm">{conversation.customerName}</div>
              <div className="text-[11px] text-emerald-400 font-medium">
                {callStatus === "connecting"
                  ? "Connecting WhatsApp Video..."
                  : formatDuration(duration)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-black/40 px-3 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" /> End-to-end encrypted
          </div>
        </div>

        {/* Center Video Canvas */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {callStatus === "connecting" ? (
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-full bg-emerald-600/30 border border-emerald-500 flex items-center justify-center mb-4 animate-pulse">
                <Video className="w-10 h-10 text-emerald-400" />
              </div>
              <p className="text-sm text-slate-300">Requesting Video Call...</p>
            </div>
          ) : (
            <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
              {/* Remote participant preview */}
              <div className="text-center p-6">
                <div className="w-28 h-28 mx-auto rounded-full bg-emerald-600/20 border-2 border-emerald-500 flex items-center justify-center text-4xl font-bold mb-4 overflow-hidden">
                  {conversation.avatarUrl ? (
                    <Image
                      src={conversation.avatarUrl}
                      alt={conversation.customerName}
                      width={112}
                      height={112}
                      className="object-cover"
                    />
                  ) : (
                    conversation.customerName.charAt(0)
                  )}
                </div>
                <div className="text-sm font-semibold">{conversation.customerName}</div>
                <div className="text-xs text-slate-400">Vittal Digital Customer Video Stream</div>
              </div>

              {/* Local agent picture-in-picture */}
              <div className="absolute bottom-20 right-4 w-28 h-36 rounded-2xl bg-black border-2 border-white/20 shadow-xl overflow-hidden flex flex-col items-center justify-center text-center p-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center mb-1 text-xs font-bold">
                  VD
                </div>
                <span className="text-[10px] text-slate-300 font-medium">Vittal Digital Desk</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Call Controls */}
        <div className="flex items-center justify-center gap-5 z-10 pt-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isMuted ? "bg-white text-slate-900" : "bg-black/50 text-white hover:bg-black/70 border border-white/10"
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isVideoOff ? "bg-white text-slate-900" : "bg-black/50 text-white hover:bg-black/70 border border-white/10"
            }`}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            onClick={onEndCall}
            className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-transform active:scale-95"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

