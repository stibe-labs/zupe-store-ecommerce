"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Client route error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center border border-gray-100 shadow-xl">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-orange-50 text-[#FF7A00] flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-gray-900 mb-2">
          Unable to Load Page
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mb-6">
          {error?.message || "A temporary error occurred while rendering this view."}
        </p>
        <div className="flex items-center gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF7A00] text-white text-xs font-bold hover:bg-[#E66E00] shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
