"use client";

import React from "react";

interface LogisticsLogoProps {
  name: string;
  className?: string;
}

export function LogisticsLogo({ name, className = "h-5 w-auto" }: LogisticsLogoProps) {
  const norm = name.toLowerCase();

  if (norm.includes("delhivery")) {
    return (
      <svg
        viewBox="0 0 102 24"
        className={className}
        aria-label="Delhivery"
        role="img"
      >
        {/* Red Delivery Box / Arrow Cube Icon */}
        <g transform="translate(0, 2)">
          <polygon points="10,0 20,5.5 10,11 0,5.5" fill="#DC2626" />
          <polygon points="0,5.5 10,11 10,20 0,14.5" fill="#B91C1C" />
          <polygon points="10,11 20,5.5 20,14.5 10,20" fill="#EF4444" />
        </g>
        {/* DELHI VERY Typography */}
        <text
          x="26"
          y="16"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontSize="13.5"
          letterSpacing="-0.3"
          fill="#111827"
        >
          delhivery
        </text>
      </svg>
    );
  }

  if (norm.includes("blue dart")) {
    return (
      <svg
        viewBox="0 0 108 24"
        className={className}
        aria-label="Blue Dart Express"
        role="img"
      >
        {/* Dynamic Blue Dart Flight Chevrons */}
        <polygon points="0,17 5,17 9,5 4,5" fill="#003399" />
        <polygon points="6,17 11,17 15,5 10,5" fill="#0056B3" />
        <polygon points="12,17 17,17 21,5 16,5" fill="#DC2626" />
        {/* BLUE DART Bold Italic */}
        <text
          x="24"
          y="16"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="13"
          letterSpacing="-0.3"
          fill="#003399"
        >
          BLUE DART
        </text>
      </svg>
    );
  }

  if (norm.includes("dtdc")) {
    return (
      <svg
        viewBox="0 0 88 24"
        className={className}
        aria-label="DTDC Courier"
        role="img"
      >
        {/* DTDC Courier Runner Icon */}
        <circle cx="8" cy="7.5" r="4" fill="#D32F2F" />
        <path
          d="M1 19c0-3.8 3.2-6.5 7.5-6.5 3.8 0 6.8 2.2 7.5 5.5h-3.8c-.5-1.8-1.8-3-3.7-3s-3.3 1.2-3.8 3H1z"
          fill="#D32F2F"
        />
        {/* DTDC Bold Blue Typography */}
        <text
          x="22"
          y="17"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontSize="15"
          letterSpacing="0.8"
          fill="#0D47A1"
        >
          DTDC
        </text>
      </svg>
    );
  }

  if (norm.includes("shadowfax")) {
    return (
      <svg
        viewBox="0 0 108 24"
        className={className}
        aria-label="Shadowfax"
        role="img"
      >
        {/* Shadowfax Winged Speed Icon */}
        <g transform="translate(1, 2) scale(0.9)">
          <path d="M16 2L3 10l8 2-9 8 16-7-7-2 11-9z" fill="#FF6B35" />
          <path d="M12 5l-6 4 4 1-5 4 8-3.5-3.5-1 5.5-4.5z" fill="#00B4D8" />
        </g>
        {/* SHADOWFAX Typography */}
        <text
          x="25"
          y="16"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="800"
          fontSize="12.5"
          letterSpacing="0.2"
          fill="#0F172A"
        >
          shadowfax
        </text>
      </svg>
    );
  }

  if (norm.includes("xpressbees")) {
    return (
      <svg
        viewBox="0 0 106 24"
        className={className}
        aria-label="Xpressbees"
        role="img"
      >
        {/* Speed Wings Honeybee */}
        <g transform="translate(1, 2) scale(0.9)">
          <ellipse cx="12" cy="7" rx="5" ry="3" fill="#3B82F6" transform="rotate(-30 12 7)" opacity="0.85" />
          <ellipse cx="6" cy="6" rx="4" ry="2.5" fill="#60A5FA" transform="rotate(-60 6 6)" opacity="0.85" />
          <ellipse cx="10" cy="12" rx="7" ry="5.5" fill="#F59E0B" />
          <line x1="7" y1="8" x2="7" y2="16" stroke="#111827" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="11" y1="7.5" x2="11" y2="16.5" stroke="#111827" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="15.5" cy="11" r="1.5" fill="#111827" />
        </g>
        {/* xpressbees Typography */}
        <text
          x="24"
          y="16"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontSize="12.5"
          letterSpacing="-0.3"
          fill="#111827"
        >
          xpress<tspan fill="#F59E0B">bees</tspan>
        </text>
      </svg>
    );
  }

  if (norm.includes("india post") || norm.includes("speed post")) {
    return (
      <svg
        viewBox="0 0 102 24"
        className={className}
        aria-label="India Post Speed"
        role="img"
      >
        {/* India Post Iconic Red Wings Envelope Mark */}
        <g transform="translate(1, 2) scale(0.9)">
          <polygon points="10,0 20,8 14,20 0,16 6,4" fill="#D8232A" />
          <polygon points="10,4 17,9 12,17 3,14 7,7" fill="#FDB913" />
          <polygon points="10,7 15,10 11,15 5,13 8,9" fill="#D8232A" />
        </g>
        {/* India Post Wordmark */}
        <text
          x="23"
          y="12"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="900"
          fontSize="9.5"
          letterSpacing="0.3"
          fill="#D8232A"
        >
          India Post
        </text>
        <text
          x="23"
          y="20"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="700"
          fontSize="7.5"
          letterSpacing="1.2"
          fill="#111827"
        >
          SPEED POST
        </text>
      </svg>
    );
  }

  return (
    <span className="text-xs font-bold text-neutral-700">
      {name}
    </span>
  );
}
