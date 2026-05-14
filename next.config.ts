import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ac.goit.global" },
      { protocol: "https", hostname: "aliiev-lomach.com" },
      { protocol: "https", hostname: "notehub-api.goit.study" },
    ],
  },
};

export default nextConfig;
