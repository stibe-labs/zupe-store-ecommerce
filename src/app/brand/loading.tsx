import React from "react";

export default function BrandLoading() {
  return (
    <div className="min-h-dvh bg-[#090A0B] text-[#F5F5F7] px-5 py-6">
      <div className="max-w-[1480px] mx-auto space-y-6 animate-pulse">
        <div className="h-16 rounded-2xl bg-white/[0.05] border border-white/10" />
        <div className="h-60 rounded-3xl bg-white/[0.04] border border-white/10" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 w-28 rounded-full bg-white/[0.06]" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-3xl bg-white/[0.04] border border-white/10"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
