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
  title: "Turkiye Jam | 100% Original Turkish Epimedium Macun - തുർക്കി ജാം",
  description:
    "സ്ത്രീകൾക്കും പുരുഷന്മാർക്കും അത്ഭുത പ്രകൃതിദത്ത ഉൽപ്പന്നം തുർക്കി ജാം (Themra Epimedium Herbal Macun). കേരളത്തിൽ 1 ദിവസം കൊണ്ട് അതിവേഗ ഡെലിവറി, 100% സുരക്ഷിത പാക്കിങ്, റീഫണ്ട് ഗ്യാരണ്ടി.",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
        />
      </head>
      <body
        className="antialiased font-sans bg-[#FAF7F2] text-[#1A1A1A]"
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
