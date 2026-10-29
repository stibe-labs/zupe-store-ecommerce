import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { SearchProvider } from "@/context/SearchContext";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { CartDrawer } from "@/components/CartDrawer";
import { AuthModal } from "@/components/AuthModal";
import { SearchModal } from "@/components/SearchModal";
import { LoadingScreen } from "@/components/LoadingScreen";
import { WhatsAppFloatingButton } from "@/components/WhatsAppFloatingButton";
import { AbandonedCartAutoChecker } from "@/components/AbandonedCartAutoChecker";
import "./globals.css";

export const metadata: Metadata = {
  title: "Turkiye Jam | 100% Authentic Turkish Epimedium Herbal Macun",
  description:
    "Experience 100% original Themra Epimedium Turkish Herbal Macun for men and women. Enhance physical stamina, natural vitality, and intimacy. Express 1–2 day discreet delivery with unused strip refund guarantee.",
  icons: {
    icon: [
      { url: "/favicon.png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.png",
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
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;0,900;1,500;1,600;1,700;1,800&family=Bricolage+Grotesque:opsz,wght@12..96,400;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400;1,700&family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
        />
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
                background-color: #ffffff;
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
              @keyframes splash-pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.88; transform: scale(0.97); }
              }
              @keyframes splash-bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-7px); }
              }
              .splash-logo-pulse {
                animation: splash-pulse 2s infinite ease-in-out;
              }
              .splash-dot {
                width: 8px;
                height: 8px;
                border-radius: 9999px;
                background-color: rgba(0, 0, 0, 0.85);
                animation: splash-bounce 1s infinite ease-in-out;
              }
              .splash-dot-1 { animation-delay: -0.3s; }
              .splash-dot-2 { animation-delay: -0.15s; }
              .splash-dot-3 { animation-delay: 0s; }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var p = window.location.pathname;
                  var isExcluded = p === '/signin' || p === '/login' || p.indexOf('/checkout') === 0 || p.indexOf('/orders') === 0 || p.indexOf('/order-tracking') === 0 || p.indexOf('/admin') === 0;
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
        className="antialiased font-sans bg-[#FCFBF8] text-[#1A1A1A]"
        suppressHydrationWarning
      >
        <div id="initial-splash-screen" aria-hidden="true">
          <div
            className="splash-logo-pulse select-none"
            style={{ position: "relative", width: "140px", height: "90px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <img
              src="/turkiye-jam-logo.svg"
              alt="Turkiye Jam"
              width={140}
              height={90}
              style={{ objectFit: "contain", width: "100%", height: "100%", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.08))" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "18px" }}>
            <span className="splash-dot splash-dot-1" />
            <span className="splash-dot splash-dot-2" />
            <span className="splash-dot splash-dot-3" />
          </div>
        </div>
        <LoadingScreen />
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <SearchProvider>
                <SmoothScrollProvider>
                  {children}
                  <CartDrawer />
                  <AuthModal />
                  <SearchModal />
                  <WhatsAppFloatingButton />
                  <AbandonedCartAutoChecker />
                </SmoothScrollProvider>
              </SearchProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
