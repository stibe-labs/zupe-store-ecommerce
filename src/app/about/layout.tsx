import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Turkiye Jam — Authentic Turkish & Global Delights",
  description:
    "Discover Turkiye Jam's heritage, commitment to premium authentic quality, and our mission to bring authentic Turkish and global delicacies to Indian homes.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
