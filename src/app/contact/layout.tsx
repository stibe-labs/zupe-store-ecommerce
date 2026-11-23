import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Vittal Lifestyle — Customer Support & Help Desk",
  description:
    "Get in touch with Vittal Lifestyle customer support at support@vittallifestyle.com or via WhatsApp. Fast assistance for orders, support, and replacements.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

