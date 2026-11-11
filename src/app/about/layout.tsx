import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Vittal Lifestyle — Live Better. Feel Stronger.",
  description:
    "Discover the Vittal Lifestyle story: premium gym supplements, athletic performance apparel, royal dates & nuts, and artisan dark chocolates crafted for vitality and strength.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
