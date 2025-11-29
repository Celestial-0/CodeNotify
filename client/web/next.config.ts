import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.iconscout.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'cdn.codechef.com',
      },
      {
        protocol: 'https',
        hostname: 'img.atcoder.jp',
      },
    ],
  },
};

export default nextConfig;
