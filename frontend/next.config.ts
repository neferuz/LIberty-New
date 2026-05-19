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
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.payme.uz',
      },
      {
        protocol: 'https',
        hostname: 'payme.uz',
      },
      {
        protocol: 'https',
        hostname: 'click.uz',
      },
      {
        protocol: 'https',
        hostname: 'm.click.uz',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
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
