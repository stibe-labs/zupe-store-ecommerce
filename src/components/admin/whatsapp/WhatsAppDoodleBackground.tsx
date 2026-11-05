import React from "react";

export default function WhatsAppDoodleBackground() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.04] z-0 select-none"
      style={{
        backgroundImage: `radial-gradient(circle at 10px 10px, currentColor 1px, transparent 0)`,
        backgroundSize: "24px 24px",
      }}
    >
      {/* WhatsApp Subtle Watermark Icon overlay */}
      <svg
        className="w-full h-full text-slate-900 dark:text-white"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="wa-doodles" width="200" height="200" patternUnits="userSpaceOnUse">
            {/* Chat bubble icon */}
            <path
              d="M30 40 A12 12 0 1 0 42 52 L48 56 L46 48 A12 12 0 0 0 30 40 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Coffee cup */}
            <path
              d="M120 40 L140 40 L136 60 L124 60 Z M140 44 L146 44 A3 3 0 0 1 146 50 L138 50"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Clock icon */}
            <circle cx="80" cy="120" r="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M80 112 L80 120 L86 123" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            {/* Heart */}
            <path
              d="M150 130 C150 125, 142 122, 138 128 C134 122, 126 125, 126 130 C126 138, 138 146, 138 146 C138 146, 150 138, 150 130 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            {/* Paper plane */}
            <path
              d="M30 140 L55 150 L42 153 L38 162 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Star / Sparkle */}
            <path
              d="M170 80 L172 86 L178 88 L172 90 L170 96 L168 90 L162 88 L168 86 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            {/* Music note */}
            <path
              d="M40 90 L40 76 L52 72 L52 86 M40 84 A4 4 0 1 0 36 88 M52 80 A4 4 0 1 0 48 84"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wa-doodles)" />
      </svg>
    </div>
  );
}

