import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Products | Vittal Lifestyle — Live Better. Feel Stronger.",
  description:
    "Explore our complete collection of lab-tested gym supplements, active performance wear, royal dates & nuts, and handcrafted artisan chocolates.",
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

