import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Lock, ShieldCheck } from "lucide-react";
import { PyDartNativeCheckout } from "@/components/checkout/PyDartNativeCheckout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Secure Payment · Turkiye Jam",
  description: "Complete your Turkiye Jam order via UPI, NetBanking, or Credit/Debit Card.",
  robots: { index: false, follow: false },
};

export default async function FirstPartyPaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ auth_status?: string }>;
}) {
  const [{ orderId }, query] = await Promise.all([params, searchParams]);

  return (
    <main className="min-h-dvh bg-[#FBF8F3] px-3 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-10 flex flex-col items-center justify-center">
      <div className="w-full max-w-[480px] overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_16px_48px_-20px_rgba(27,23,20,0.18)]">
        <header className="flex items-center justify-between gap-3 border-b border-stone-200/80 bg-[#FBF8F3] px-5 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/apple-touch-icon.png"
              alt="Turkiye Jam"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg border border-stone-200 object-cover"
            />
            <div>
              <p className="text-sm font-bold text-[#1B1714] leading-tight">Turkiye Jam</p>
              <p className="text-[11px] text-[#655B53]">Secure Order Payment</p>
            </div>
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#116A4B]">
            <Lock className="h-3.5 w-3.5" />
            <span>Encrypted</span>
          </span>
        </header>

        <PyDartNativeCheckout
          pydartOrderId={orderId}
          variant="standalone"
          initialAuthFailed={query.auth_status === "failed"}
        />

        <footer className="flex items-center justify-between border-t border-stone-100 bg-white px-5 py-3 text-[11px] text-[#655B53]">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[#116A4B]" />
            <span>Powered by PyDart Pay</span>
          </span>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="hover:text-[#1B1714] hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#1B1714] hover:underline">
              Terms
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
