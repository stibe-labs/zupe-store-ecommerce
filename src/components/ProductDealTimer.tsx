"use client";

import React, { useState, useEffect } from "react";
import { Flame } from "lucide-react";

interface ProductDealTimerProps {
  className?: string;
  discountPercent?: number;
}

export function ProductDealTimer({
  className = "",
  discountPercent = 50,
}: ProductDealTimerProps) {
  // Target: 2 days, 23 hours, 59 mins from now
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 2,
    hours: 23,
    minutes: 59,
    seconds: 28,
  });

  useEffect(() => {
    // Check localStorage to keep persistent countdown across page refreshes
    const storageKey = "zupe_deal_end_time_v1";
    let targetTime = 0;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        targetTime = parseInt(saved, 10);
      }
    } catch {}

    const now = Date.now();
    // If expired or not set, set to 2 days, 23 hours, 59 minutes from now
    if (!targetTime || targetTime <= now) {
      targetTime = now + (2 * 24 * 60 * 60 + 23 * 60 * 60 + 59 * 60 + 28) * 1000;
      try {
        localStorage.setItem(storageKey, String(targetTime));
      } catch {}
    }

    const updateTimer = () => {
      const remainingMs = Math.max(0, targetTime - Date.now());
      const totalSeconds = Math.floor(remainingMs / 1000);

      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className={`w-full py-1.5 px-3 sm:px-4 mb-0 sm:mb-3 rounded-none sm:rounded-2xl bg-[#5b1420] border-b-2 sm:border-2 border-stone-800 text-white flex items-center justify-between sm:shadow-[0_3px_0_0_#2b2b2b] select-none ${className}`}
    >
      {/* Left: Deal Badge */}
      <div className="flex items-center gap-1.5 min-w-0">
        <Flame className="w-3.5 h-3.5 text-[#fed000] fill-[#fed000] animate-pulse shrink-0" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5 truncate">
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#fed000] truncate">
            DEAL UP TO {discountPercent}% OFF
          </span>
          <span className="text-[10px] font-medium text-stone-300 hidden sm:inline">
            • Limited-time imported batch
          </span>
        </div>
      </div>

      {/* Right: Small Stacked Countdown Timer */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] font-medium text-stone-300 hidden md:inline">
          Ends in:
        </span>
        <div className="flex items-center gap-1 text-center font-mono">
          {/* Days */}
          <div className="flex flex-col items-center">
            <span className="px-1.5 py-0.5 rounded bg-black/40 text-white font-extrabold text-[11px] sm:text-xs leading-none shadow-2xs">
              {pad(timeLeft.days)}
            </span>
            <span className="text-[7.5px] sm:text-[8px] font-sans font-semibold text-stone-300 uppercase mt-0.5 leading-none">
              days
            </span>
          </div>
          <span className="text-[#fed000] font-bold text-xs pb-2">:</span>

          {/* Hours */}
          <div className="flex flex-col items-center">
            <span className="px-1.5 py-0.5 rounded bg-black/40 text-white font-extrabold text-[11px] sm:text-xs leading-none shadow-2xs">
              {pad(timeLeft.hours)}
            </span>
            <span className="text-[7.5px] sm:text-[8px] font-sans font-semibold text-stone-300 uppercase mt-0.5 leading-none">
              hours
            </span>
          </div>
          <span className="text-[#fed000] font-bold text-xs pb-2">:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <span className="px-1.5 py-0.5 rounded bg-black/40 text-white font-extrabold text-[11px] sm:text-xs leading-none shadow-2xs">
              {pad(timeLeft.minutes)}
            </span>
            <span className="text-[7.5px] sm:text-[8px] font-sans font-semibold text-stone-300 uppercase mt-0.5 leading-none">
              mins
            </span>
          </div>
          <span className="text-[#fed000] font-bold text-xs pb-2">:</span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <span className="px-1.5 py-0.5 rounded bg-black/40 text-[#fed000] font-extrabold text-[11px] sm:text-xs leading-none shadow-2xs">
              {pad(timeLeft.seconds)}
            </span>
            <span className="text-[7.5px] sm:text-[8px] font-sans font-semibold text-[#fed000] uppercase mt-0.5 leading-none">
              secs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
