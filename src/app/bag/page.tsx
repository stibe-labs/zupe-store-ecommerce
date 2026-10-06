"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BagPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/cart");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-[#FA521C]/20 border-t-[#FA521C] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-gray-500">Redirecting to shopping cart...</p>
      </div>
    </div>
  );
}
