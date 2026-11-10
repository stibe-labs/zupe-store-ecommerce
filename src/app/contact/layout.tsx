import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Vittal Digital — Customer Support & Help Desk",
  description:
    "Get in touch with Vittal Digital customer support at support@vittaldigital.com or via WhatsApp. Fast assistance for orders, hardware support, replacements, and 1-year warranty coverage.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

