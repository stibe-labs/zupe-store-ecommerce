import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { SearchProvider } from "@/context/SearchContext";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { AuthModal } from "@/components/AuthModal";
import { SearchModal } from "@/components/SearchModal";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Logo80MotionStyles } from "@/components/Logo80AnimatedMark";
import { WhatsAppFloatingButton } from "@/components/WhatsAppFloatingButton";
import { AbandonedCartAutoChecker } from "@/components/AbandonedCartAutoChecker";
import { MetaPixelTracker } from "@/components/MetaPixelTracker";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { siteConfig } from "@/config/siteConfig";
import React, { Suspense } from "react";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B5D44",
};

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Antonio:wght@400;600;700;800&family=Barlow+Condensed:ital,wght@0,600;0,700;0,800;0,900;1,700&family=Bebas+Neue&family=Cormorant+Garamond:wght@600;700&family=IBM+Plex+Mono:wght@500;600&family=Manrope:wght@500;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&family=Urbanist:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&display=swap"
        />
        {/* Shiprocket Fastrr Smart 1-Click Checkout */}
        <link rel="stylesheet" href="https://checkout-ui.shiprocket.com/assets/styles/shopify.css" />
        <script src="https://checkout-ui.shiprocket.com/assets/js/channels/shopify.js" defer />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #initial-splash-screen {
                position: fixed;
                inset: 0;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background-color: #FFFFFF;
                pointer-events: auto;
                transition: opacity 0.4s ease-in-out, visibility 0.4s ease-in-out;
              }
              html.splash-hidden #initial-splash-screen,
              body.splash-hidden #initial-splash-screen,
              #initial-splash-screen.splash-hidden {
                display: none !important;
              }
              #initial-splash-screen.splash-fade-out {
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
              }
              @keyframes vl-splash-handle {
                0% { stroke-dashoffset: 100; opacity: 0; }
                20% { opacity: 1; }
                100% { stroke-dashoffset: 0; opacity: 1; }
              }
              @keyframes vl-splash-bag {
                0% { opacity: 0; transform: translateY(6px) scale(0.92); }
                70% { opacity: 1; transform: translateY(-1px) scale(1.02); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
              }
              @keyframes vl-splash-check {
                0% { opacity: 0; transform: scale(0.25) translate(-3px, 4px); }
                100% { opacity: 1; transform: scale(1) translate(0, 0); }
              }
              @keyframes vl-splash-sparkle {
                0% { opacity: 0; transform: scale(0.2) rotate(-45deg); }
                70% { opacity: 1; transform: scale(1.15) rotate(8deg); }
                100% { opacity: 1; transform: scale(1) rotate(0deg); }
              }
              @keyframes vl-splash-word {
                0% { opacity: 0; transform: translateY(5px); }
                100% { opacity: 1; transform: translateY(0); }
              }
              @keyframes splash-bounce {
                0%, 100% { transform: translateY(0); opacity: 0.45; }
                50% { transform: translateY(-6px); opacity: 1; }
              }
              .vl-sp-handle { stroke-dasharray: 100; stroke-dashoffset: 100; animation: vl-splash-handle 320ms cubic-bezier(0.32, 0.72, 0, 1) 40ms forwards; }
              .vl-sp-bag { transform-origin: 32px 55px; opacity: 0; animation: vl-splash-bag 360ms cubic-bezier(0.32, 0.72, 0, 1) 120ms forwards; }
              .vl-sp-check { transform-origin: 30px 46px; opacity: 0; animation: vl-splash-check 300ms cubic-bezier(0.34, 1.56, 0.64, 1) 300ms forwards; }
              .vl-sp-sparkle { transform-origin: 53.8px 10.6px; opacity: 0; animation: vl-splash-sparkle 320ms cubic-bezier(0.34, 1.56, 0.64, 1) 440ms forwards; }
              .vl-sp-word { opacity: 0; animation: vl-splash-word 320ms cubic-bezier(0.32, 0.72, 0, 1) 420ms forwards; }
              .splash-dot {
                width: 7px;
                height: 7px;
                border-radius: 9999px;
                background-color: #0B5D44;
                animation: splash-bounce 0.9s infinite ease-in-out;
              }
              .splash-dot-2 { background-color: #C59B27; animation-delay: -0.15s; }
              .splash-dot-1 { animation-delay: -0.3s; }
              .splash-dot-3 { animation-delay: 0s; }
              @media (prefers-reduced-motion: reduce) {
                .vl-sp-handle, .vl-sp-bag, .vl-sp-check, .vl-sp-sparkle, .vl-sp-word {
                  animation: none !important;
                  opacity: 1 !important;
                  stroke-dashoffset: 0 !important;
                }
              }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var p = window.location.pathname;
                  var isExcluded = p === '/signin' || p === '/login' || p.indexOf('/brand') === 0 || p.indexOf('/checkout') === 0 || p.indexOf('/orders') === 0 || p.indexOf('/order-tracking') === 0 || p.indexOf('/admin') === 0;
                  if (isExcluded || sessionStorage.getItem('zp_splash_shown')) {
                    document.documentElement.classList.add('splash-hidden');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className="antialiased font-mograph bg-white text-[#0C1412] selection:bg-[#E6F4EF] selection:text-[#0C1412]"
        suppressHydrationWarning
      >
        <div id="initial-splash-screen" aria-hidden="true">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <svg width="84" height="84" viewBox="-4 -4 72 72" fill="none">
              <path className="vl-sp-handle" pathLength={100} d="M22.5 23.5 V15.5 A9.5 9.5 0 0 1 41.5 15.5 V23.5" stroke="#C59B27" strokeWidth="4.1" strokeLinecap="round" />
              <path className="vl-sp-bag" d="M16.5 21.5 H47.5 C51.8 21.5 54.4 24.4 54.7 28.6 L55.8 46.2 C56.2 52.0 52.0 56.0 46.2 56.0 H17.8 C12.0 56.0 7.8 52.0 8.2 46.2 L9.3 28.6 C9.6 24.4 12.2 21.5 16.5 21.5 Z" fill="#0B5D44" />
              <circle className="vl-sp-bag" cx="22.5" cy="25.8" r="1.55" fill="#E5C469" />
              <circle className="vl-sp-bag" cx="41.5" cy="25.8" r="1.55" fill="#E5C469" />
              <path className="vl-sp-check" d="M18.8 34.8 C19.8 39.2 23.2 43.9 28.9 46.5 C29.5 46.8 30.1 46.6 30.3 46.0 C30.6 45.2 30.5 44.3 30.1 43.5 C27.8 39.1 24.9 35.3 21.3 32.9 C20.1 32.1 18.4 33.3 18.8 34.8 Z" fill="#86EFAC" />
              <path className="vl-sp-check" d="M28.6 46.2 C28.4 46.9 29.2 47.4 29.9 47.0 C36.6 43.2 42.6 36.2 46.2 28.4 C46.7 27.3 45.4 26.3 44.5 27.0 C38.9 31.2 33.3 37.5 28.6 46.2 Z" fill="#FFFFFF" />
              <path className="vl-sp-sparkle" d="M53.8 4.0 C54.7 8.4 56.0 9.7 60.4 10.6 C56.0 11.5 54.7 12.8 53.8 17.2 C52.9 12.8 51.6 11.5 47.2 10.6 C51.6 9.7 52.9 8.4 53.8 4.0 Z" fill="#C59B27" />
            </svg>
            <div className="vl-sp-word" style={{ textAlign: "center", fontFamily: "'Manrope', sans-serif" }}>
              <div style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em", color: "#0C1412", lineHeight: 1.1 }}>
                vittal <span style={{ fontWeight: 400, color: "#0B5D44" }}>lifestyle</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "20px" }}>
            <span className="splash-dot splash-dot-1" />
            <span className="splash-dot splash-dot-2" />
            <span className="splash-dot splash-dot-3" />
          </div>
        </div>
        <Logo80MotionStyles />
        <LoadingScreen />
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <SearchProvider>
                <SmoothScrollProvider>
                  {children}
                  <AuthModal />
                  <SearchModal />
                  <WhatsAppFloatingButton />
                  <AbandonedCartAutoChecker />
                  <Suspense fallback={null}>
                    <MetaPixelTracker />
                  </Suspense>
                  <MobileBottomNav />
                </SmoothScrollProvider>
              </SearchProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
