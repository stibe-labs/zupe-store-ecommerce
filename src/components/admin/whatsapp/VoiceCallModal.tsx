"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, ShieldCheck } from "lucide-react";
import { WhatsAppConversation } from "@/lib/whatsappStore";
import { waAudio } from "@/lib/whatsappAudio";

interface VoiceCallModalProps {
  conversation: WhatsAppConversation;
  onEndCall: () => void;
}

export default function VoiceCallModal({ conversation, onEndCall }: VoiceCallModalProps) {
  const [callStatus, setCallStatus] = useState<"ringing" | "connected">("ringing");
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);

  const durationTimerRef = useRef<any>(null);

  useEffect(() => {
    // Start authentic WhatsApp ringing sound
    const stopRinging = waAudio.startCallRinging();

    // Auto connect after 4 seconds for simulation
    const connectTimer = setTimeout(() => {
      stopRinging();
      setCallStatus("connected");
      durationTimerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }, 4000);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#111b21] text-white p-6 shadow-2xl border border-white/10 flex flex-col items-center">
        {/* Security badge */}
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/20 mb-6">
          <ShieldCheck className="w-3.5 h-3.5" /> End-to-end encrypted
        </div>

        {/* Avatar with pulsing ring */}
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-emerald-600 flex items-center justify-center text-3xl font-bold shadow-lg overflow-hidden border-2 border-emerald-500">
            {conversation.avatarUrl ? (
              <Image
                src={conversation.avatarUrl}
                alt={conversation.customerName}
                fill
                className="object-cover"
              />
            ) : (
              conversation.customerName.charAt(0)
            )}
          </div>
          {callStatus === "ringing" && (
            <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-60" />
          )}
        </div>

        {/* Contact info */}
        <h3 className="text-xl font-bold mb-1 text-center">{conversation.customerName}</h3>
        <p className="text-sm text-slate-400 mb-2">{conversation.customerPhone}</p>

        {/* Call Status / Timer */}
        <div className="text-xs font-semibold text-emerald-400 mb-8">
          {callStatus === "ringing" ? (
            <span className="animate-pulse">WhatsApp Audio Calling...</span>
          ) : (
            <span>Connected • {formatDuration(duration)}</span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isMuted ? "bg-white text-slate-900" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setSpeakerOn(!speakerOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              !speakerOn ? "bg-white text-slate-900" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {!speakerOn ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
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

