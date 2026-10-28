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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap"
        />
      </head>
      <body
        className="antialiased font-sans bg-[#FCFBF8] text-[#1A1A1A]"
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
