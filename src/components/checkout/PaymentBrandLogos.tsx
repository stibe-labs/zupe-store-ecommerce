"use client";

import React from "react";

/**
 * Authentic inline vector brand marks for UPI apps, Indian banks, and card networks.
 * Zero external CDN image trackers, zero text overflow, CLS = 0, crisp at 1x–3x DPR.
 */

export function formatBankDisplayName(rawName: string): string {
  return rawName
    .replace(/\s*-\s*Retail Banking/gi, "")
    .replace(/\s*-\s*Corporate Banking/gi, " (Corporate)")
    .replace(/\(Erstwhile[- ]+/gi, "(")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function UpiMark({ className = "h-4 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 68 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5.2 5.5h3.6l-1.9 8.7c-.4 1.7.3 2.5 1.8 2.5s2.5-.8 2.9-2.5l1.9-8.7h3.6l-1.9 8.9c-.8 3.6-3.1 5.4-6.9 5.4-3.7 0-5.4-1.8-4.7-5.4l1.6-8.9Z"
        fill="#374151"
      />
      <path
        d="M21 5.5h6.7c3.2 0 5 1.7 4.4 4.7-.6 3-3 4.8-6.3 4.8h-2.9l-.9 4.4h-3.6L21 5.5Zm3.3 6.5h2c1.4 0 2.3-.6 2.5-1.8.2-1.1-.4-1.7-1.8-1.7h-2l-.7 3.5Z"
        fill="#374151"
      />
      <path d="M35.4 5.5H39l-2.9 13.9h-3.6l2.9-13.9Z" fill="#374151" />
      <path d="M46.5 4.5 54 12l-9.5 7.5 3.6-15Z" fill="#097939" />
      <path d="M42.8 4.5 50.3 12l-9.5 7.5 2-15Z" fill="#ED752E" />
    </svg>
  );
}

export function GooglePayLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
      <rect x="0.5" y="0.5" width="31" height="31" rx="8" fill="#FFFFFF" stroke="#E5E7EB" />
      <path
        d="M24.2 16.2c0-.6-.1-1.2-.2-1.8H16v3.4h4.6c-.2 1.1-.8 2-1.8 2.6v2.2h2.9c1.7-1.6 2.5-3.9 2.5-6.4Z"
        fill="#4285F4"
      />
      <path
        d="M16 24.5c2.3 0 4.2-.8 5.6-2.1l-2.9-2.2c-.8.5-1.7.8-2.7.8-2.1 0-3.9-1.4-4.5-3.3h-3v2.3c1.5 2.9 4.4 4.5 7.5 4.5Z"
        fill="#34A853"
      />
      <path
        d="M11.5 17.7c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V12h-3c-.6 1.2-1 2.6-1 4s.4 2.8 1 4l3-2.3Z"
        fill="#FBBC05"
      />
      <path
        d="M16 11c1.2 0 2.3.4 3.2 1.2l2.4-2.4C20.2 8.4 18.2 7.5 16 7.5c-3.1 0-6 1.7-7.5 4.5l3 2.3c.6-1.9 2.4-3.3 4.5-3.3Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function PhonePeLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
      <rect width="32" height="32" rx="8" fill="#5F259F" />
      <path
        d="M9.5 10.6h12.2v2h-2.1v9.1h-2.3v-3.8c-.7.4-1.6.7-2.7.7-2.2 0-3.7-1.4-3.7-3.7v-2.3H9.5v-2Zm3.7 2v2.1c0 1.2.7 1.9 1.9 1.9 1 0 1.7-.4 2.2-1v-3h-4.1Z"
        fill="#FFFFFF"
      />
      <path
        d="M18.9 10.6c-.4-1.4-1.7-2.4-3.3-2.4-.7 0-1.3.2-1.8.5l.8 1.5c.3-.2.6-.3 1-.3.8 0 1.4.4 1.6 1h1.7v-.3Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function PaytmLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
      <rect x="0.5" y="0.5" width="31" height="31" rx="8" fill="#FFFFFF" stroke="#E5E7EB" />
      <rect x="3" y="10.5" width="13.2" height="11" rx="3" fill="#002970" />
      <text
        x="9.6"
        y="18.2"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="6.7"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        Pay
      </text>
      <rect x="16.8" y="10.5" width="12.2" height="11" rx="3" fill="#00BAF2" />
      <text
        x="22.9"
        y="18.2"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="6.7"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        tm
      </text>
    </svg>
  );
}

export function BhimLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
      <rect x="0.5" y="0.5" width="31" height="31" rx="8" fill="#FFFFFF" stroke="#E5E7EB" />
      <path d="M16.4 6.5 24 16l-11.2 9.5 3.6-19Z" fill="#008B47" />
      <path d="M12.2 6.5 19.8 16 8.6 25.5l3.6-19Z" fill="#F47920" />
    </svg>
  );
}

export function UpiAppBrandIcon({
  appId,
  name,
  accentHex = "#374151",
  size = 28,
}: {
  appId: string;
  name: string;
  accentHex?: string;
  size?: number;
}) {
  switch (appId) {
    case "gpay":
      return <GooglePayLogo size={size} />;
    case "phonepe":
      return <PhonePeLogo size={size} />;
    case "paytm":
      return <PaytmLogo size={size} />;
    case "bhim":
      return <BhimLogo size={size} />;
    case "amazonpay":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
          <rect width="32" height="32" rx="8" fill="#232F3E" />
          <text x="16" y="17.5" textAnchor="middle" fill="#FFFFFF" fontSize="11.5" fontWeight="800" fontFamily="system-ui, sans-serif">
            a
          </text>
          <path d="M9.5 21.5c3.7 2.2 9.1 2.3 13 .2" stroke="#FF9900" strokeWidth="2.1" strokeLinecap="round" />
          <path d="M21 20.6l2.3.7-.7 2.1" stroke="#FF9900" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
          <rect width="32" height="32" rx="8" fill="#25D366" />
          <path
            d="M16 7.8a8.1 8.1 0 0 0-7 12.1L8 24.2l4.4-1.1A8.1 8.1 0 1 0 16 7.8Z"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <text x="16" y="19.3" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="700" fontFamily="system-ui, sans-serif">
            ₹
          </text>
        </svg>
      );
    case "cred":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
          <rect width="32" height="32" rx="8" fill="#111827" />
          <path d="M10.5 8.5h11v10.2L16 23.5l-5.5-4.8V8.5Z" stroke="#FFFFFF" strokeWidth="1.9" strokeLinejoin="round" />
          <path d="M13.5 12h5v4.8L16 19l-2.5-2.2V12Z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case "supermoney":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
          <rect width="32" height="32" rx="8" fill="#4F46E5" />
          <path d="M18.6 7.5 10.5 17h5.2l-2.3 7.5L21.5 15h-5.2l2.3-7.5Z" fill="#FFFFFF" />
        </svg>
      );
    case "navi":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
          <rect width="32" height="32" rx="8" fill="#0F9D58" />
          <path d="M10 22.5V9.5h3.1l5.8 8.3V9.5H22v13h-3.1l-5.8-8.3v8.3H10Z" fill="#FFFFFF" />
        </svg>
      );
    case "payzapp":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
          <rect width="32" height="32" rx="8" fill="#004C8F" />
          <rect x="7" y="7" width="18" height="18" rx="3" stroke="#ED232A" strokeWidth="2.5" />
          <rect x="13" y="13" width="6" height="6" fill="#FFFFFF" />
        </svg>
      );
    case "mobikwik":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
          <rect width="32" height="32" rx="8" fill="#0066CC" />
          <path d="M8 22V10.5l4.8 6.4 3.2-4.2 3.2 4.2 4.8-6.4V22h-2.8v-6.2L16 21l-5.2-5.2V22H8Z" fill="#FFFFFF" />
        </svg>
      );
    case "airtel":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
          <rect width="32" height="32" rx="8" fill="#E40000" />
          <path
            d="M19.8 10.2c-4.8-.8-8.8 3.6-8.6 8.3.1 2.2 1.6 3.5 3.6 3.4 2.5-.2 4.6-2.5 5.4-5.2.3 1.7.8 3.2 1.7 4.4"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "bharatpe":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
          <rect width="32" height="32" rx="8" fill="#00A8E8" />
          <path d="M11 9.5h6.6c2.5 0 4 1.3 4 3.3 0 1.4-.8 2.4-2 2.8 1.5.4 2.4 1.6 2.4 3.2 0 2.3-1.7 3.7-4.4 3.7H11v-13Zm3 5.2h3c1.1 0 1.7-.5 1.7-1.4s-.6-1.4-1.7-1.4h-3v2.8Zm0 5.3h3.4c1.2 0 1.9-.6 1.9-1.5s-.7-1.5-1.9-1.5H14v3Z" fill="#FFFFFF" />
        </svg>
      );
    case "fampay":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
          <rect width="32" height="32" rx="8" fill="#18181B" />
          <path d="M11 9.5h10.5v2.8h-7.3v3h6.2V18h-6.2v4.5H11v-13Z" fill="#F59E0B" />
        </svg>
      );
    case "pop":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
          <rect width="32" height="32" rx="8" fill="#DB2777" />
          <circle cx="16" cy="16" r="7" stroke="#FFFFFF" strokeWidth="2.4" />
          <circle cx="16" cy="16" r="2.6" fill="#FDE047" />
        </svg>
      );
    case "imobile":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
          <rect width="32" height="32" rx="8" fill="#B02A30" />
          <circle cx="16.4" cy="10.2" r="2" fill="#F37E20" />
          <path d="M14.2 14.2h4v8.3h-3.6v-6.1h-1.6v-2.2h1.2Z" fill="#FFFFFF" />
        </svg>
      );
    case "kiwi":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
          <rect width="32" height="32" rx="8" fill="#15803D" />
          <path d="M11 9.5h3v5.7l5.3-5.7h3.7l-5.6 5.8 6 7.2h-3.8l-4.4-5.4-1.2 1.2v4.2h-3v-13Z" fill="#FFFFFF" />
        </svg>
      );
    case "tataneu":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
          <rect width="32" height="32" rx="8" fill="#6D28D9" />
          <path d="M9.5 21.5V10.5h3l7 7.6v-7.6h3v11h-3l-7-7.6v7.6h-3Z" fill="#FFFFFF" />
          <circle cx="21" cy="10.5" r="2" fill="#EC4899" />
        </svg>
      );
    case "any_upi":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
          <rect x="0.5" y="0.5" width="31" height="31" rx="8" fill="#FFFFFF" stroke="#E5E7EB" />
          <path d="M16.4 8 23 16l-9.5 8 2.9-16Z" fill="#097939" />
          <path d="M12.6 8 19.2 16l-9.5 8 2.9-16Z" fill="#ED752E" />
        </svg>
      );
    default: {
      const letters =
        name
          .replace(/[^a-zA-Z0-9\s]/g, "")
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0]?.toUpperCase() ?? "")
          .join("") || "U";
      return (
        <span
          style={{ width: size, height: size, backgroundColor: accentHex }}
          className="inline-flex shrink-0 items-center justify-center rounded-[8px] text-[10px] font-bold tracking-tight text-white"
          aria-hidden="true"
        >
          {letters}
        </span>
      );
    }
  }
}

/**
 * Authentic inline SVG emblems for 33+ Indian NetBanking banks.
 * Zero broken external images, zero third-party trackers, instant crisp paint.
 */
export function BankBrandIcon({
  code,
  name,
  size = 28,
}: {
  code: string;
  name?: string;
  size?: number;
}) {
  const norm = code.trim().toUpperCase();

  // HDFC Bank — classic blue/red 4-quadrant square mark
  if (norm === "HDFC") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect x="0.5" y="0.5" width="31" height="31" rx="8" fill="#FFFFFF" stroke="#E5E7EB" />
        <rect x="7" y="7" width="18" height="18" rx="2" fill="#ED232A" />
        <rect x="11" y="11" width="10" height="10" fill="#FFFFFF" />
        <rect x="14.5" y="7" width="3" height="18" fill="#FFFFFF" />
        <rect x="7" y="14.5" width="18" height="3" fill="#FFFFFF" />
        <rect x="13" y="13" width="6" height="6" fill="#004C8F" />
      </svg>
    );
  }

  // ICICI Bank — orange/maroon emblem
  if (norm === "ICIC") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#B02A30" />
        <circle cx="16.6" cy="9.6" r="2.2" fill="#F37E20" />
        <path d="M12.5 14h6.2v8.8h-3.2v-6.1h-3V14Z" fill="#FFFFFF" />
        <path d="M11 23.2c3.2-1.2 6.8-1.2 10 0" stroke="#F37E20" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  // State Bank of India — iconic royal blue keyhole circle
  if (norm === "SBIN") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect x="0.5" y="0.5" width="31" height="31" rx="8" fill="#FFFFFF" stroke="#E5E7EB" />
        <circle cx="16" cy="16" r="9.5" fill="#22409A" />
        <circle cx="16" cy="16" r="2.8" fill="#FFFFFF" />
        <rect x="14.7" y="18" width="2.6" height="7.6" fill="#FFFFFF" />
      </svg>
    );
  }

  // Axis Bank — burgundy geometric 'A' triangle
  if (norm === "UTIB") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect x="0.5" y="0.5" width="31" height="31" rx="8" fill="#FFFFFF" stroke="#E5E7EB" />
        <path d="M16 7.5 24.5 23h-4.4L16 15.2 11.9 23H7.5L16 7.5Z" fill="#97144D" />
        <path d="M15.8 18.2h5.2L22.5 23h-5.3l-1.4-4.8Z" fill="#AE275F" />
      </svg>
    );
  }

  // Kotak Mahindra Bank — red/navy infinity loop
  if (norm === "KKBK") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#ED1C24" />
        <path
          d="M11.8 12.2c-2.2 0-3.8 1.6-3.8 3.8s1.6 3.8 3.8 3.8c2.6 0 4.2-3.8 4.2-3.8s1.6-3.8 4.2-3.8c2.2 0 3.8 1.6 3.8 3.8s-1.6 3.8-3.8 3.8c-2.6 0-4.2-3.8-4.2-3.8s-1.6-3.8-4.2-3.8Z"
          stroke="#FFFFFF"
          strokeWidth="2.3"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Federal Bank — navy & gold crest
  if (norm === "FDRL") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#004B8D" />
        <path d="M9.5 9h13v3.2h-9.2v2.8h7.5v3h-7.5V23H9.5V9Z" fill="#FFFFFF" />
        <rect x="9.5" y="21.5" width="13" height="2.4" rx="1" fill="#FDB913" />
      </svg>
    );
  }

  // Bank of Baroda (+ Erstwhile Vijaya) — iconic orange rising-sun 'B'
  if (norm === "BARB_R" || norm === "BARB_C" || norm === "VIJB") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#F26522" />
        <path
          d="M11 9.5h6.3c2.4 0 3.9 1.2 3.9 3.1 0 1.4-.8 2.4-2.1 2.8 1.7.4 2.6 1.5 2.6 3.2 0 2.3-1.7 3.9-4.5 3.9H11V9.5Zm3 5.1h2.8c1.1 0 1.7-.5 1.7-1.4s-.6-1.4-1.7-1.4H14v2.8Zm0 5.4h3.2c1.2 0 1.9-.6 1.9-1.6 0-.9-.7-1.5-1.9-1.5H14V20Z"
          fill="#FFFFFF"
        />
        <path d="M8.5 16h2M21.5 16h2" stroke="#FDE68A" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  // Punjab National Bank (+ OBC / United Bank) — maroon & gold emblem
  if (norm === "PUNB_R" || norm === "PUNB_C" || norm === "ORBC" || norm === "UTBI") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#A20A3A" />
        <rect x="7" y="7" width="18" height="18" rx="4" stroke="#F5B700" strokeWidth="1.8" />
        <path d="M12.2 21V11h4.6c2.2 0 3.5 1.2 3.5 3.2s-1.3 3.2-3.5 3.2h-2.1V21h-2.5Zm2.5-5.6h1.8c.9 0 1.4-.4 1.4-1.2s-.5-1.2-1.4-1.2h-1.8v2.4Z" fill="#F5B700" />
      </svg>
    );
  }

  // Union Bank of India (+ Corporation Bank) — crimson & blue interlocking U
  if (norm === "UBIN" || norm === "CORP") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect x="0.5" y="0.5" width="31" height="31" rx="8" fill="#FFFFFF" stroke="#E5E7EB" />
        <path d="M9.5 9v8.5a6.5 6.5 0 0 0 13 0V9h-3.2v8.3a3.3 3.3 0 0 1-6.6 0V9H9.5Z" fill="#D91E2A" />
        <path d="M13 13.5v4a3 3 0 0 0 6 0v-4h-2.2v3.8a.8.8 0 0 1-1.6 0v-3.8H13Z" fill="#00529B" />
      </svg>
    );
  }

  // IDFC FIRST Bank — crimson stacked architectural bars
  if (norm === "IDFB") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#9C1D26" />
        <rect x="8.5" y="9" width="15" height="3.2" rx="1" fill="#FFFFFF" />
        <rect x="8.5" y="14.4" width="11.5" height="3.2" rx="1" fill="#FFFFFF" />
        <rect x="8.5" y="19.8" width="7.5" height="3.2" rx="1" fill="#FFFFFF" />
      </svg>
    );
  }

  // IndusInd Bank — heritage deep maroon crest
  if (norm === "INDB") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#8C1D24" />
        <path d="M10.5 22.5V11.5h3v11h-3Zm8 0V11.5h3v11h-3Z" fill="#FFFFFF" />
        <path d="M9 9.5h14" stroke="#F5C451" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M13.5 16.8h5" stroke="#F5C451" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }

  // Yes Bank — cobalt & red checkmark tick
  if (norm === "YESB") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#0051A2" />
        <path d="M8.5 16.8 13.5 21.8 24 10.5" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.5 16.4 24 10.5" stroke="#ED1C24" strokeWidth="3.2" strokeLinecap="round" />
      </svg>
    );
  }

  // South Indian Bank — crimson flame crest
  if (norm === "SIBL") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#C8102E" />
        <path
          d="M19.8 11.4c-.9-.9-2.2-1.4-3.7-1.4-2.4 0-4.1 1.3-4.1 3.2 0 1.8 1.3 2.7 3.7 3.2l1.2.3c1.3.3 2 .8 2 1.7 0 1-.9 1.7-2.5 1.7-1.5 0-2.7-.6-3.5-1.5l-1.7 1.8c1.1 1.3 2.9 2.1 5.1 2.1 3.1 0 5.2-1.6 5.2-4.1 0-2.1-1.3-3.3-4.1-3.9l-1.1-.2c-1.1-.2-1.7-.6-1.7-1.3 0-.8.7-1.3 1.7-1.3 1 0 1.9.4 2.5 1l1.1-1.3Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // CSB Bank (Catholic Syrian Bank) — royal blue & gold crest
  if (norm === "CSBK") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#004C97" />
        <path d="M21 12.2A6.5 6.5 0 1 0 21 19.8" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
        <circle cx="20.5" cy="16" r="2.2" fill="#F59E0B" />
      </svg>
    );
  }

  // Canara Bank — cyan & yellow twin triangles
  if (norm === "CNRB") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#0093D0" />
        <path d="M16 7.5 24 22H8l8-14.5Z" fill="#FFD200" />
        <path d="M16 12.2 20.5 20H11.5L16 12.2Z" fill="#0093D0" />
      </svg>
    );
  }

  // Indian Bank (+ Allahabad Bank) — navy & gold starburst
  if (norm === "IDIB" || norm === "ALLA") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#003A8F" />
        <circle cx="16" cy="16" r="7" stroke="#FDB913" strokeWidth="2.2" />
        <circle cx="16" cy="16" r="2.6" fill="#FFFFFF" />
      </svg>
    );
  }

  // Indian Overseas Bank — cobalt wave emblem
  if (norm === "IOBA") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#005BAC" />
        <circle cx="16" cy="16" r="7.5" stroke="#FFFFFF" strokeWidth="2.2" />
        <path d="M10.5 16h11M16 10.5v11" stroke="#93C5FD" strokeWidth="1.8" />
      </svg>
    );
  }

  // IDBI Bank — emerald & orange geometric cube
  if (norm === "IBKL") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#007A53" />
        <rect x="9" y="9" width="6.5" height="6.5" rx="1.2" fill="#FFFFFF" />
        <rect x="16.5" y="9" width="6.5" height="6.5" rx="1.2" fill="#F58220" />
        <rect x="9" y="16.5" width="6.5" height="6.5" rx="1.2" fill="#F58220" />
        <rect x="16.5" y="16.5" width="6.5" height="6.5" rx="1.2" fill="#FFFFFF" />
      </svg>
    );
  }

  // Bank of India — blue & gold 5-point star
  if (norm === "BKID" || norm === "BKID_C") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#0054A6" />
        <path d="M16 7.5 18.4 13.2 24.5 13.7 19.8 17.7 21.2 23.8 16 20.5 10.8 23.8 12.2 17.7 7.5 13.7 13.6 13.2 16 7.5Z" fill="#F58220" />
      </svg>
    );
  }

  // Bank of Maharashtra — azure flame drop
  if (norm === "MAHB") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#0072BC" />
        <path d="M16 7.5c3.5 4.2 6 7.4 6 10.7a6 6 0 1 1-12 0c0-3.3 2.5-6.5 6-10.7Z" fill="#FFFFFF" />
        <circle cx="16" cy="18.2" r="2.5" fill="#F59E0B" />
      </svg>
    );
  }

  // Central Bank of India — crimson & blue concentric ring
  if (norm === "CBIN") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#0054A6" />
        <circle cx="16" cy="16" r="8" fill="#E31837" />
        <circle cx="16" cy="16" r="4" fill="#FFFFFF" />
      </svg>
    );
  }

  // AU Small Finance Bank — purple & amber diamond prism
  if (norm === "AUBL") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#682B86" />
        <path d="M16 8 24 16 16 24 8 16 16 8Z" fill="#F47920" />
        <path d="M16 11.8 20.2 16 16 20.2 11.8 16 16 11.8Z" fill="#FFFFFF" />
      </svg>
    );
  }

  // Airtel Payments Bank — signature red ribbon wave
  if (norm === "AIRP") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#E40000" />
        <path
          d="M19.8 10.2c-4.8-.8-8.8 3.6-8.6 8.3.1 2.2 1.6 3.5 3.6 3.4 2.5-.2 4.6-2.5 5.4-5.2.3 1.7.8 3.2 1.7 4.4"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // RBL Bank — navy & crimson shield arrow
  if (norm === "RATN") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#1E3577" />
        <path d="M10 22V10h6.8c2.6 0 4.2 1.4 4.2 3.7 0 1.8-1 3-2.6 3.5L21.5 22h-3.4l-2.7-4.3H13V22h-3Zm3-6.8h3.4c1 0 1.6-.6 1.6-1.4s-.6-1.4-1.6-1.4H13v2.8Z" fill="#FFFFFF" />
        <rect x="20" y="9" width="3" height="3" rx="0.8" fill="#E31E24" />
      </svg>
    );
  }

  // Deutsche Bank — iconic blue framed diagonal slash
  if (norm === "DEUT") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#0018A8" />
        <rect x="8.5" y="8.5" width="15" height="15" stroke="#FFFFFF" strokeWidth="2.2" />
        <path d="M12.5 20.5 19.5 11.5" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }

  // Karnataka Bank / Karur Vysya / DCB / Equitas / UCO / Ujjivan / J&K / Punjab & Sind
  const PALETTE_BY_CODE: Record<string, { bg: string; accent: string }> = {
    KARB: { bg: "#6B2C91", accent: "#F5B700" },
    KVBL: { bg: "#007F4E", accent: "#FDE047" },
    DCBL: { bg: "#004B8D", accent: "#38BDF8" },
    ESFB: { bg: "#1B365D", accent: "#F58220" },
    FSFB: { bg: "#0F766E", accent: "#FDE047" },
    JSFB: { bg: "#1D4ED8", accent: "#F59E0B" },
    UCBA: { bg: "#0066B3", accent: "#FDB913" },
    UJVN: { bg: "#008080", accent: "#A7F3D0" },
    JAKA: { bg: "#007A3D", accent: "#F47920" },
    PSIB: { bg: "#006B3F", accent: "#F5B700" },
    DLXB: { bg: "#7C2D12", accent: "#FDBA74" },
    TMBL: { bg: "#991B1B", accent: "#FDE68A" },
    SVCB: { bg: "#1E40AF", accent: "#93C5FD" },
    SRCB: { bg: "#B45309", accent: "#FEF08A" },
    NSPB: { bg: "#1E293B", accent: "#38BDF8" },
    LAVB_R: { bg: "#9D174D", accent: "#FBCFE8" },
  };

  const palette = PALETTE_BY_CODE[norm] ?? { bg: "#334155", accent: "#CBD5E1" };
  const label = (name || code).slice(0, 1).toUpperCase();

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
      <rect width="32" height="32" rx="8" fill={palette.bg} />
      {/* Clean classical bank pediment + pillars silhouette */}
      <path d="M16 7.5 24 11.8H8L16 7.5Z" fill={palette.accent} />
      <rect x="8.5" y="21.2" width="15" height="2.2" rx="1" fill="#FFFFFF" opacity="0.92" />
      <text
        x="16"
        y="19.6"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="8.8"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {label}
      </text>
    </svg>
  );
}

export function VisaLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 24" fill="none" className={className} aria-label="Visa">
      <rect x="0.5" y="0.5" width="47" height="23" rx="4" fill="#FFFFFF" stroke="#E5E7EB" />
      <text
        x="24"
        y="16.2"
        textAnchor="middle"
        fill="#1A1F71"
        fontSize="12.5"
        fontWeight="900"
        fontStyle="italic"
        letterSpacing="0.02em"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        VISA
      </text>
    </svg>
  );
}

export function MastercardLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 24" fill="none" className={className} aria-label="Mastercard">
      <rect x="0.5" y="0.5" width="43" height="23" rx="4" fill="#FFFFFF" stroke="#E5E7EB" />
      <circle cx="17.8" cy="12" r="6.2" fill="#EB001B" />
      <circle cx="26.2" cy="12" r="6.2" fill="#F79E1B" />
      <path d="M22 7.2a6.2 6.2 0 0 0 0 9.6 6.2 6.2 0 0 0 0-9.6Z" fill="#FF5F00" />
    </svg>
  );
}

export function RuPayLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 24" fill="none" className={className} aria-label="RuPay">
      <rect x="0.5" y="0.5" width="55" height="23" rx="4" fill="#FFFFFF" stroke="#E5E7EB" />
      <text
        x="22.5"
        y="15.8"
        textAnchor="middle"
        fill="#1D3268"
        fontSize="10.2"
        fontWeight="800"
        fontStyle="italic"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        RuPay
      </text>
      <path d="M44.2 6.5 49 12l-6.2 5.5 1.4-11Z" fill="#097939" />
      <path d="M41.5 6.5 46.3 12 40.1 17.5l1.4-11Z" fill="#ED752E" />
    </svg>
  );
}

export function AmexLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 46 24" fill="none" className={className} aria-label="American Express">
      <rect x="0.5" y="0.5" width="45" height="23" rx="4" fill="#006FCF" />
      <text
        x="23"
        y="15.5"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="9.2"
        fontWeight="800"
        letterSpacing="0.04em"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        AMEX
      </text>
    </svg>
  );
}
