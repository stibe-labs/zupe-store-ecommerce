import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Vittal Digital — Authentic & Verified Delights",
  description:
    "Discover Vittal Digital's heritage, commitment to premium authentic quality, and our mission to bring premium wellness delicacies to Indian homes.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
