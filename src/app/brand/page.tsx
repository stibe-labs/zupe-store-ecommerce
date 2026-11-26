import type { Metadata, Viewport } from "next";
import React, { Suspense } from "react";
import { BrandSelectionStudio } from "@/components/BrandSelectionStudio";
import BrandLoading from "./loading";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#090B0A",
};

export const metadata: Metadata = {
  title: "Vittal Lifestyle — Authentic Marketplace Brand Studio (80 Concepts)",
  description:
    "Private client presentation showcasing 80 authentic multi-brand marketplace logos for Vittal Lifestyle across 8 commerce archetypes. Test live on Search Headers, Mobile App Icons, Unboxing Boxes, Shopping Totes, and 100% Original Seals.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  openGraph: {
    title: "Vittal Lifestyle — 80 Authentic Marketplace Brand Identities",
    description:
      "Interactive client logo review & selection studio for Vittal Lifestyle Multi-Brand Marketplace.",
    type: "website",
  },
};

export default function BrandReviewPage() {
  return (
    <Suspense fallback={<BrandLoading />}>
      <BrandSelectionStudio />
    </Suspense>
  );
}
