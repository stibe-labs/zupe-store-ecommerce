import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Vittal Digital — Genuine Flagship Electronics",
  description:
    "Discover the Vittal Digital story: authentic flagship electronics sourced directly, 1-year comprehensive warranty support, and express delivery across India.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
