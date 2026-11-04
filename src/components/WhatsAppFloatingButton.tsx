"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export function WhatsAppFloatingButton() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Hide WhatsApp floating button on admin dashboard pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const phoneNumber = "916238165935";
  const defaultMessage = encodeURIComponent(
    "Hi Vittal Digital Care, I have an inquiry about my order!"
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <aside
      aria-label="WhatsApp Support"
      style={
        isMobile
          ? {
              bottom:
                "max(88px, calc(env(safe-area-inset-bottom, 12px) + 76px))",
            }
          : undefined
      }
      className="fixed z-40 right-3.5 sm:right-6 bottom-[88px] sm:bottom-6 flex items-center group select-none pointer-events-auto"
    >
      {/* Tooltip on Desktop Hover */}
      <div
        className={`hidden sm:flex items-center gap-2 mr-3 px-3.5 py-1.5 rounded-full bg-stone-950/90 backdrop-blur-md text-white text-xs font-semibold shadow-xl border border-white/10 transition-all duration-300 pointer-events-none ${
          isHovered
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-2 pointer-events-none"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
        <span>Chat on WhatsApp</span>
      </div>

      {/* Main Floating Button with Ambient Glow Rings */}
      <div className="relative flex items-center justify-center">
        {/* Radiating Ambient Pulse Wave Rings */}
        <span className="absolute -inset-1.5 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none" />
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-20 animate-pulse pointer-events-none" />

        <motion.a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Vittal Digital on WhatsApp"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_8px_25px_rgba(37,211,102,0.45)] hover:shadow-[0_12px_30px_rgba(37,211,102,0.6)] transition-shadow duration-300 focus:outline-none"
        >
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7 fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c0.971.53 1.764.813 2.8.813 3.182 0 5.768-2.587 5.768-5.766 0-3.179-2.586-5.766-5.772-5.766zm3.393 8.188c-.145.407-.84.774-1.168.825-.327.051-.724.08-2.146-.49-1.815-.729-2.986-2.584-3.076-2.705-.09-.12-1.077-1.433-1.077-2.733 0-1.301.681-1.942.923-2.203.242-.26.529-.326.705-.326.177 0 .354.002.508.01.163.008.382-.062.597.454.223.535.764 1.865.831 2.001.067.136.111.296.022.473-.088.177-.133.288-.264.441-.133.155-.28.346-.399.465-.133.133-.271.277-.117.542.155.266.689 1.135 1.479 1.838 1.019.907 1.879 1.189 2.146 1.322.267.133.423.111.579-.067.155-.178.665-.774.843-1.039.177-.266.355-.221.598-.133.244.088 1.549.73 1.815.863.266.133.444.199.51.31.066.111.066.643-.079 1.05z" />
          </svg>
        </motion.a>
      </div>
    </aside>
  );
}
