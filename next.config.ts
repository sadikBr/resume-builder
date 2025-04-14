import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allows all domains
      },
      {
        protocol: 'http',
        hostname: '**', // Allows HTTP too (not recommended)
      },
    ],
  },
};

export default nextConfig;
