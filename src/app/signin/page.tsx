"use client";

import React, { useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthCard } from "@/components/AuthCard";
import { siteConfig } from "@/config/siteConfig";

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
      <div className="min-h-screen flex items-center justify-center bg-[#FAFCF6] text-neutral-900 font-mograph">
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border border-neutral-200 shadow-xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#6B9E3A]" />
          <p className="text-sm font-bold text-neutral-800">Loading your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFCF6] text-neutral-900 flex flex-col justify-between font-mograph selection:bg-[#E2F5B4] selection:text-[#2E4D12]">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-neutral-200/90 py-3 sm:py-3.5 shadow-xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src={siteConfig.logoUrl}
              alt={siteConfig.name}
              width={140}
              height={42}
              className="h-8 sm:h-9 w-auto object-contain group-hover:scale-105 transition-transform"
              priority
            />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold bg-[#95CF42] hover:bg-[#85BE33] text-black px-5 py-2 rounded-full shadow-xs hover:shadow-md transition-all cursor-pointer font-movault uppercase tracking-wider"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to Store</span>
          </Link>
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
        <div className="min-h-screen flex items-center justify-center bg-[#FAFCF6]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#6B9E3A]" />
            <p className="text-sm font-semibold text-neutral-500">Loading sign in...</p>
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}