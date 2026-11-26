"use client";

import React, { useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthCard } from "@/components/AuthCard";
import { siteConfig } from "@/config/siteConfig";
import { BRAND_80_THEMES, Logo80AnimatedMark } from "@/components/Logo80AnimatedMark";
import { VittalBrandLoader } from "@/components/VittalBrandLoader";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const redirectUrl = searchParams.get("redirect") || searchParams.get("returnUrl") || "/";
  const urlNotice = searchParams.get("notice") || searchParams.get("msg");
  const modeParam = searchParams.get("mode") === "signup" ? "signup" : "login";

  // If authenticated customer, redirect to return URL
  useEffect(() => {
    if (urlNotice) {
      return;
    }

    if (!authLoading && isAuthenticated && user && user.role !== "admin") {
      const target =
        redirectUrl &&
        !redirectUrl.startsWith("/admin") &&
        redirectUrl !== "/signin" &&
        redirectUrl !== "/login"
          ? redirectUrl
          : "/";
      router.replace(target);
    }
  }, [isAuthenticated, authLoading, user, redirectUrl, router, urlNotice]);

  if (authLoading) {
    return (
      <VittalBrandLoader
        fullScreen
        label="Loading your session…"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F3FAF7] text-neutral-900 flex flex-col justify-between font-mograph selection:bg-[#E6F4EF] selection:text-[#0C1412]">
      {/* Minimal Flagship Auth Header */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-[0_1px_12px_rgba(7,20,16,0.03)]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-[#0B5D44] transition-colors py-2 pr-2"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Back to Store</span>
            <span className="sm:hidden">Store</span>
          </Link>

          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="inline-flex items-center gap-2 group" aria-label={siteConfig.name}>
              <Logo80AnimatedMark
                theme={BRAND_80_THEMES[0]}
                surface="light"
                mode="hover-press"
                size={34}
                withWordmark
              />
            </Link>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#F3FAF7] border border-[#B8DFD1]/90 text-[10.5px] sm:text-[11px] font-bold text-[#074230]">
            <Lock className="w-3 h-3 text-[#0B5D44] shrink-0" />
            <span className="hidden xs:inline">Secure Sign-In</span>
            <span className="xs:hidden">Secure</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-[460px]">
          <AuthCard
            isModal={false}
            initialMode={modeParam}
            notice={urlNotice}
            redirectUrl={redirectUrl}
            showBadges={false}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-neutral-500 border-t border-neutral-200 bg-white font-medium">
        © {new Date().getFullYear()} {siteConfig.name} • All Rights Reserved
      </footer>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <VittalBrandLoader
          fullScreen
          label="Loading sign in…"
        />
      }
    >
      <SignInContent />
    </Suspense>
  );
}