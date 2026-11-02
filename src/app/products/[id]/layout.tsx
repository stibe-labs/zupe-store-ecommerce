import React from "react";
import type { Metadata, ResolvingMetadata } from "next";
import { getProductByIdOrSlug } from "@/lib/productService";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getProductSchema,
  getBreadcrumbSchema,
  toAbsoluteUrl,
  SITE_URL,
  STORE_NAME,
} from "@/lib/seo";

type PageProps = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata(
  props: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await props.params;
  const idOrSlug = resolvedParams?.id;
  const product = await getProductByIdOrSlug(idOrSlug);

  if (!product) {
    return {
      title: `Product | ${STORE_NAME}`,
      description: "Explore our collection of modern decor and lifestyle essentials.",
    };
  }

  const title = `${product.name} | ${STORE_NAME}`;
  const rawDesc =
    product.description ||
    product.tagline ||
    product.subtitle ||
    `Buy ${product.name} online at best price in India on Zupe Store. Free Express Shipping & Cash on Delivery.`;
  const description = rawDesc.length > 160 ? `${rawDesc.slice(0, 157)}...` : rawDesc;
  const imageUrl = toAbsoluteUrl(product.poster_image || product.images?.[0]);
  const canonicalUrl = `${SITE_URL}/products/${product.slug || product.id}`;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.category,
      "buy online India",
      "best price",
      "cash on delivery",
      STORE_NAME,
    ].filter(Boolean) as string[],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: STORE_NAME,
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },
  };
}

export default async function ProductLayout(props: PageProps) {
  const resolvedParams = await props.params;
  const idOrSlug = resolvedParams?.id;
  const product = await getProductByIdOrSlug(idOrSlug);

  if (!product) {
    return <>{props.children}</>;
  }

  const productSchema = getProductSchema(product);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    {
      name: product.category || "Products",
      url: `${SITE_URL}/products?category=${encodeURIComponent(product.category || "All")}`,
    },
    {
      name: product.name,
      url: `${SITE_URL}/products/${product.slug || product.id}`,
    },
  ]);

  return (
    <>
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      {props.children}
    </>
  );
}

