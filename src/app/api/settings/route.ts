import { NextResponse } from "next/server";
import { getSettings } from "@/lib/erpStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getSettings();
    const profile: any = settings?.storeProfile || {};
    return NextResponse.json({
      success: true,
      storeProfile: {
        storeName: profile.storeName || "Turkiye Jam",
        supportEmail: profile.supportEmail || "support@turkiyejam.com",
        supportPhone: profile.supportPhone || "+91 62381 65935",
        currency: profile.currency || "INR (₹)",
        freeShippingThreshold: Number(profile.freeShippingThreshold ?? 499),
        standardShippingFee: Number(profile.standardShippingFee ?? 49),
        codFee: Number(profile.codFee ?? 49),
      },
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      storeProfile: {
        storeName: "Turkiye Jam",
        supportEmail: "support@turkiyejam.com",
        supportPhone: "+91 62381 65935",
        currency: "INR (₹)",
        freeShippingThreshold: 499,
        standardShippingFee: 49,
        codFee: 49,
      },
    });
  }
}

