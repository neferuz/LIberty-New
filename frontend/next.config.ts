import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-ru.bitrix24.uz',
      },
      {
        protocol: 'https',
        hostname: 'yustex.bitrix24.uz',
      },
      {
        protocol: 'https',
        hostname: 'bitrix24.uz',
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://127.0.0.1:8000/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
