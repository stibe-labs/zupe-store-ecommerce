import type { Metadata, Viewport } from "next";
import React from "react";
import { BrandIdentity80System } from "@/components/BrandIdentity80System";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#090B0A",
};

export const metadata: Metadata = {
  title: "Vittal Lifestyle — Logo #80 Complete Brand Identity & Motion System",
  description:
    "Official brand identity manual and interactive 10-animation motion system for Logo #80 (Vittal Sovereign Marketplace Master) in Imperial Emerald & Champagne Gold.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  openGraph: {
    title: "Vittal Lifestyle — Logo #80 Complete Brand Identity & Motion Lab",
    description:
      "Interactive brand book, 60-30-10 color theory system, lockup SVG kit, and all 10 marketplace animations.",
    type: "website",
  },
};

export default function BrandIdentity80Page() {
  return <BrandIdentity80System initialThemeId="imperial-emerald" />;
}
