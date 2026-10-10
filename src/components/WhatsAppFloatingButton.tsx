"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";

export function WhatsAppFloatingButton() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  // Hide WhatsApp floating button on admin dashboard pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const phoneNumber = "919744122854";
  const defaultMessage = encodeURIComponent("Hi Zupe Store, I have an inquiry about your products!");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <aside
      aria-label="WhatsApp Support"
      className="fixed z-40 right-4 sm:right-6 bottom-20 sm:bottom-6 flex items-center group select-none pointer-events-auto"
    >
      {/* Tooltip on Desktop Hover */}
      <div
        className={`hidden sm:flex items-center gap-2 mr-3 px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold shadow-xl border border-white/10 transition-all duration-300 pointer-events-none ${
          isHovered
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-2 pointer-events-none"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
        <span>Chat with us on WhatsApp</span>
      </div>

      {/* Main Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Zupe Store on WhatsApp"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-[0_8px_25px_rgba(37,211,102,0.45)] hover:shadow-[0_12px_32px_rgba(37,211,102,0.65)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
      >
        {/* Active Online Pulse Indicator */}
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white" />
        </span>

        {/* Official WhatsApp SVG Vector Icon */}
        <svg
          viewBox="0 0 32 32"
          className="w-6 h-6 sm:w-7 sm:h-7 fill-white drop-shadow-xs"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16 0c-8.837 0-16 7.163-16 16 0 2.825 0.737 5.607 2.137 8.048l-2.137 7.952 8.135-2.133c2.378 1.3 5.068 1.985 7.865 1.985 8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 29.333c-2.483 0-4.912-0.669-7.042-1.938l-0.505-0.3-5.235 1.373 1.398-5.105-0.329-0.523c-1.391-2.213-2.128-4.779-2.128-7.407 0-7.352 5.981-13.333 13.333-13.333s13.333 5.981 13.333 13.333c0 7.352-5.981 13.333-13.333 13.333zM23.307 19.349c-0.4-0.2-2.368-1.168-2.735-1.301s-0.633-0.2-0.9 0.2c-0.267 0.4-1.033 1.301-1.267 1.568s-0.467 0.3-0.867 0.1c-0.4-0.2-1.689-0.623-3.217-1.985-1.189-1.060-1.992-2.369-2.225-2.769s-0.025-0.616 0.175-0.815c0.18-0.179 0.4-0.467 0.6-0.7s0.267-0.4 0.4-0.667c0.133-0.267 0.067-0.5-0.033-0.7s-0.9-2.169-1.233-2.969c-0.325-0.78-0.655-0.674-0.9-0.686s-0.5-0.013-0.767-0.013c-0.267 0-0.7 0.1-1.067 0.5s-1.4 1.368-1.4 3.335c0 1.967 1.433 3.868 1.633 4.135s2.822 4.309 6.837 6.042c0.955 0.413 1.701 0.659 2.283 0.844 0.96 0.305 1.833 0.262 2.523 0.159 0.77-0.115 2.368-0.968 2.701-1.901s0.333-1.734 0.233-1.901c-0.1-0.167-0.367-0.267-0.767-0.467z" />
        </svg>
      </a>
    </aside>
  );
}
