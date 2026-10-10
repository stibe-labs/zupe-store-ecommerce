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
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF7A00]" />
        <p className="text-sm font-semibold text-gray-500">Redirecting to Sign In...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF7A00]" />
        </div>
      }
    >
      <LoginRedirectContent />
    </Suspense>
  );
}
