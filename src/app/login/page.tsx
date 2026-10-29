"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function LoginRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    const dest = qs ? `/signin?${qs}` : "/signin";
    router.replace(dest);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center tj-diamonds-cream">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#5b1420]" />
        <p className="text-sm font-bold text-stone-700">Redirecting to Sign In...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center tj-diamonds-cream">
          <Loader2 className="w-8 h-8 animate-spin text-[#5b1420]" />
        </div>
      }
    >
      <LoginRedirectContent />
    </Suspense>
  );
}
