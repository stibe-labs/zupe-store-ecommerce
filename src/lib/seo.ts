import { Product } from "@/types/product";

export const SITE_URL = "https://zupestore.in";
export const STORE_NAME = "Zupe Store";
export const STORE_LEGAL_NAME = "Zupe Store Online";
export const STORE_DESCRIPTION =
  "Discover beautifully curated modern home decor, ambient lighting, lifestyle gadgets, and car accessories at Zupe Store. Enjoy Free Express Shipping across India and Cash on Delivery.";
export const STORE_PHONE = "+919744122853";
export const STORE_EMAIL = "zupestoreonline@gmail.com";

export function toAbsoluteUrl(url?: string): string {
  if (!url || typeof url !== "string") return `${SITE_URL}/favicon.png`;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const clean = url.startsWith("/") ? url : `/${url}`;
  return `${SITE_URL}${clean}`;
}

/**
 * Organization Schema (JSON-LD)
 * Business identity for Google Knowledge Graph
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: STORE_NAME,
    legalName: STORE_LEGAL_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#logo`,
      url: `${SITE_URL}/favicon.png`,
      caption: STORE_NAME,
      width: 512,
      height: 512,
    },
    image: `${SITE_URL}/favicon.png`,
    description: STORE_DESCRIPTION,
    email: STORE_EMAIL,
    telephone: STORE_PHONE,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Maradu, Kochi",
      addressLocality: "Kochi",
      addressRegion: "Kerala",
      postalCode: "682048",
      addressCountry: "IN",
    },
    sameAs: [
      "https://www.instagram.com/zupe.store?xtok=MWx5eDZvaHVvdHBwcA%3D%3D&utm_source=qr",
      "https://www.facebook.com/share/18f1rncQ7r/?mibextid=wwXIfr",
      "https://wa.me/919744122853",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: STORE_PHONE,
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi", "Malayalam"],
      },
    ],
  };
}

/**
 * WebSite Schema (JSON-LD)
 * Enables Sitelinks Searchbox in Google Search
 */
export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: STORE_NAME,
    description: STORE_DESCRIPTION,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * BreadcrumbList Schema (JSON-LD)
 * Hierarchical navigation for rich breadcrumbs in SERP
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.url),
    })),
  };
}

/**
 * Product Schema (JSON-LD)
 * Powers Google Rich Results (Price, InStock, Rating, Reviews, Delivery, Return Policy)
 */
export function getProductSchema(product: Product) {
  const productUrl = `${SITE_URL}/products/${product.slug || product.id}`;
  const images = (
    product.images && product.images.length > 0
      ? product.images
      : [product.poster_image || "/favicon.png"]
  ).map((img) => toAbsoluteUrl(img));

  const ratingValue = Number(product.rating) > 0 ? Number(product.rating) : 4.8;
  const reviewCount = Number(product.review_count) > 0 ? Number(product.review_count) : 24;
  const inStock = product.in_stock !== 0 && (product.stock_count === undefined || product.stock_count > 0);

  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  const priceValidUntil = oneYearFromNow.toISOString().split("T")[0];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    image: images,
    description:
      product.description ||
      product.tagline ||
      product.subtitle ||
      `${product.name} available at best price on Zupe Store with Free Shipping across India.`,
    sku: product.id,
    mpn: product.id,
    category: product.category,
    brand: {
      "@type": "Brand",
      name: STORE_NAME,
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "INR",
      price: product.price,
      priceValidUntil,
      itemCondition: "https://schema.org/NewCondition",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: STORE_NAME,
        url: SITE_URL,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "INR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "d",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 5,
            unitCode: "d",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 5,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
        returnLabelSource: "https://schema.org/ReturnLabelCustomerResponsibility",
        refundType: "https://schema.org/FullRefund",
        restockingFee: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "INR",
        },
        returnShippingFeesAmount: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "INR",
        },
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
  };
}

/**
 * ItemList Schema for Featured Products on Homepage or Collections
 */
export function getProductItemListSchema(products: Product[], listName = "Featured Products") {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    itemListElement: products.slice(0, 12).map((product, index) => {
      const productUrl = `${SITE_URL}/products/${product.slug || product.id}`;
      return {
        "@type": "ListItem",
        position: index + 1,
        url: productUrl,
        item: getProductSchema(product),
      };
    }),
  };
}

