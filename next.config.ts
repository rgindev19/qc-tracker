import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

// Set up the PWA to generate the service worker in the public folder
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Keeps it disabled locally so it doesn't cache while you are actively coding
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
};

// Wrap both Payload and PWA around your Next.js config
export default withPayload(withPWA(nextConfig));
