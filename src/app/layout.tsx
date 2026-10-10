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
                </SmoothScrollProvider>
              </SearchProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
