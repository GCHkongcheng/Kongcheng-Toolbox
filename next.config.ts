import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  outputFileTracingIncludes: {
    "/api/tools/ai-rich-export": [
      "./public/fonts/NotoSansSC-Regular.ttf",
      "./src/assets/fonts/NotoSansSC-Regular.ttf",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.google.com",
      },
      {
        protocol: "https",
        hostname: "icons.duckduckgo.com",
      },
    ],
  },
};

export default nextConfig;
