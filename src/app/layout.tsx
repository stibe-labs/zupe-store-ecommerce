import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { CartDrawer } from "@/components/CartDrawer";
import { AuthModal } from "@/components/AuthModal";
import { LoadingScreen } from "@/components/LoadingScreen";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zupe Store | Modern Decor, Accessories & Everyday Essentials",
  description:
    "Discover beautifully curated decor, modern accessories, and everyday essentials designed to elevate your space and simplify your life.",
  icons: {
    icon: [
      { url: "/zupe-logo.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: ["/zupe-logo.png"],
    apple: [{ url: "/zupe-logo.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased font-sans bg-[#F8F9FA] text-[#2D3436]"
        suppressHydrationWarning
      >
        <LoadingScreen />
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <SmoothScrollProvider>
                {children}
                <CartDrawer />
                <AuthModal />
                <MobileBottomNav />
              </SmoothScrollProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
