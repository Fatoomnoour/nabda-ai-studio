import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Live studio is a self-contained static page in public/studio (calls /api/generate and /api/tts).
  async rewrites() {
    return [{ source: "/studio", destination: "/studio/index.html" }];
  },
};

export default nextConfig;
