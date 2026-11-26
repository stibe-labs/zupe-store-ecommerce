"use client";

import React from "react";

export default function BrandError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-dvh bg-[#090A0B] text-[#F5F5F7] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-3xl bg-[#121316] border border-white/15 p-8 text-center space-y-4">
        <p className="font-mono text-xs tracking-widest text-[#E4C56A] uppercase">
          Vittal Lifestyle · Brand Studio
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          Unable to load brand presentation
        </h1>
        <p className="text-sm text-neutral-400">
          {error?.message || "A temporary display issue interrupted the studio."}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-full bg-white text-[#0A0A0B] font-bold text-sm hover:bg-neutral-200 transition-colors"
        >
          Reload Brand Studio
        </button>
      </div>
    </div>
  );
}
