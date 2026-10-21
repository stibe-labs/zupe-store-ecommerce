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
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { WhatsAppFloatingButton } from "@/components/WhatsAppFloatingButton";
import { AbandonedCartAutoChecker } from "@/components/AbandonedCartAutoChecker";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zupe Store | Modern Decor, Accessories & Everyday Essentials",
  description:
    "Discover beautifully curated decor, modern accessories, and everyday essentials designed to elevate your space and simplify your life.",
  icons: {
    icon: [
      { url: "/favicon.ico?v=20261008-6" },
      { url: "/favicon.png?v=20261008-6", type: "image/png" },
      { url: "/icon.png?v=20261008-6", type: "image/png" },
    ],
    shortcut: ["/favicon.ico?v=20261008-6"],
    apple: [{ url: "/apple-touch-icon.png?v=20261008-6" }],
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
        <link rel="icon" href="/favicon.ico?v=20261008-6" sizes="any" />
        <link rel="icon" href="/favicon.png?v=20261008-6" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=20261008-6" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body
        className="antialiased font-sans bg-[#F3F4F6] text-[#0F172A]"
        suppressHydrationWarning
      >
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
                  <MobileBottomNav />
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
