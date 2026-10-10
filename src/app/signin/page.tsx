"use client";

import React, { useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthCard } from "@/components/AuthCard";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const redirectUrl = searchParams.get("redirect") || searchParams.get("returnUrl") || "/";
  const urlNotice = searchParams.get("notice") || searchParams.get("msg");
  const modeParam = searchParams.get("mode") === "signup" ? "signup" : "login";

  // If already logged in, redirect immediately
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, authLoading, user, redirectUrl, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF7A00]" />
          <p className="text-sm font-semibold text-gray-500">Loading your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col justify-between selection:bg-[#FF7A00]/20 selection:text-[#FF7A00]">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-gray-100 py-3 sm:py-4">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <Image
                src="/zupe-logo.png"
                alt="Zupe Store"
                width={36}
                height={36}
                className="object-contain group-hover:scale-105 transition-transform"
              />
            </div>
            <Image
              src="/zupe-label.png"
              alt="Zupestore"
              width={110}
              height={28}
              className="h-6 w-auto object-contain group-hover:opacity-90 transition-opacity"
            />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#FF7A00] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
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
            showBadges={true}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-gray-400 border-t border-gray-100 bg-white">
        © {new Date().getFullYear()} Zupe Store. Modern Decor & Everyday Essentials.
      </footer>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF7A00]" />
            <p className="text-sm font-semibold text-gray-500">Loading sign in...</p>
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
