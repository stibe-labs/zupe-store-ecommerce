import React from "react";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL, STORE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `All Products | Modern Decor & Gadgets | ${STORE_NAME}`,
  description:
    "Explore our complete collection of modern home decor, ambient lighting, lifestyle accessories, and smart everyday gadgets with Free Express Shipping across India.",
  alternates: {
    canonical: `${SITE_URL}/products`,
  },
  openGraph: {
    title: `All Products | ${STORE_NAME}`,
    description:
      "Shop trending home decor, ambient crystal lamps, car accessories and gadgets at Zupe Store. Free Express Shipping across India.",
    url: `${SITE_URL}/products`,
    siteName: STORE_NAME,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/favicon.png`,
        width: 512,
        height: 512,
        alt: STORE_NAME,
      },
    ],
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "All Products", url: `${SITE_URL}/products` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      {children}
    </>
  );
}

