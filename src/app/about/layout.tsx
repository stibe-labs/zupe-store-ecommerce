import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Zupe Store — Modern Decor & Lifestyle Innovations",
  description:
    "Discover Zupe Store's design philosophy, commitment to thoughtful engineering, and our mission to elevate everyday Indian living with modern aesthetics.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
