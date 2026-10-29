"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function BagPage() {
  const router = useRouter();
  const { openCart } = useCart();

  useEffect(() => {
    openCart();
    router.replace("/products");
  }, [router, openCart]);

  return (
    <div className="min-h-screen tj-diamonds-cream flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-[#5b1420]/20 border-t-[#5b1420] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold text-stone-700">Opening shopping bag...</p>
      </div>
    </div>
  );
}
