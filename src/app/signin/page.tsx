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
      const target = redirectUrl && !redirectUrl.startsWith("/admin") && redirectUrl !== "/signin" && redirectUrl !== "/login"
        ? redirectUrl
        : "/";
      router.replace(target);
    }
  }, [isAuthenticated, authLoading, user, redirectUrl, router, urlNotice]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 font-sans">
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border border-slate-200 shadow-xl">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-bold text-slate-700">Loading your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
      {/* Top Header */}
      <header className="w-full bg-[#0A2540] border-b border-slate-800 py-3 sm:py-3.5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src={siteConfig.logoUrl}
              alt={siteConfig.name}
              width={140}
              height={42}
              className="h-8 sm:h-9 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-md brightness-105"
              priority
            />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black bg-[#FFBE00] hover:bg-[#E5AA00] text-slate-950 px-4 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer"
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
      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-800 bg-[#0A2540] font-medium">
        © {new Date().getFullYear()} {siteConfig.name} • All Rights Reserved
      </footer>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-semibold text-slate-500">Loading sign in...</p>
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
