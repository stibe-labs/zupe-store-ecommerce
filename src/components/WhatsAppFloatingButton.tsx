"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function WhatsAppFloatingButton() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdminState, setIsAdminState] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      const isSub =
        host.startsWith("admin.") ||
        host.includes("admin.localhost") ||
        document.documentElement.getAttribute("data-is-admin") === "true" ||
        Boolean(document.getElementById("admin-root"));

      if (isSub) {
        setIsAdminState(true);
      }
    }
  }, []);

  const isClientAdmin =
    typeof window !== "undefined" &&
    (window.location.hostname.toLowerCase().startsWith("admin.") ||
      window.location.hostname.toLowerCase().includes("admin.localhost") ||
      document.documentElement.getAttribute("data-is-admin") === "true" ||
      Boolean(document.getElementById("admin-root")));

  // Hide WhatsApp floating button on admin dashboard pages and admin subdomain
  if (isClientAdmin || isAdminState || pathname?.startsWith("/admin")) {
    return null;
  }

  const phoneNumber = "919744122853";
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

        {/* WhatsApp Official Vector Logo SVG */}
        <svg
          viewBox="0 0 32 32"
          fill="currentColor"
          className="w-6 h-6 sm:w-7 sm:h-7"
          aria-hidden="true"
        >
          <path d="M16 2a13.9 13.9 0 0 0-12 20.9L2 30l7.3-1.9A13.9 13.9 0 1 0 16 2zm0 25.5a11.5 11.5 0 0 1-5.9-1.6l-.4-.3-4.4 1.1 1.2-4.3-.3-.5A11.6 11.6 0 1 1 16 27.5zm6.4-8.6c-.3-.2-2-.1-2.3-1.1-.3-.2-.5-.3-.7.1-.2.3-.8 1.1-1 1.3-.2.2-.4.2-.7.1a9.2 9.2 0 0 1-2.7-1.7 10.2 10.2 0 0 1-1.9-2.3c-.2-.3 0-.5.1-.7.2-.2.3-.4.5-.6.2-.2.2-.4.3-.6.1-.2 0-.4 0-.6-.1-.2-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.8 1.2 3.3 1.4 3.5c.2.2 2.4 3.6 5.7 5.1 3.4 1.4 3.4 1 4 1s2-.8 2.2-1.6c.3-.8.3-1.5.2-1.6-.1-.1-.3-.2-.6-.4z" />
        </svg>
      </a>
    </aside>
  );
}
