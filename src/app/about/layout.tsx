import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Vittal Digital — Dubai Sourced Flagship Electronics",
  description:
    "Discover the Vittal Digital story: authentic Dubai retail electronics sourced directly, 1-year comprehensive warranty support, and express insured air cargo across India.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
