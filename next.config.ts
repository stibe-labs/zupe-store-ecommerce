import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["worker-mailer"],
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      { source: "/Privacy", destination: "/privacy" },
      { source: "/Return", destination: "/return" },
      { source: "/Terms-and-Conditions", destination: "/terms-and-conditions" },
      { source: "/terms", destination: "/terms-and-conditions" },
      { source: "/Shipping-and-Delivery", destination: "/shipping-and-delivery" },
    ];
  },
};

export default nextConfig;
