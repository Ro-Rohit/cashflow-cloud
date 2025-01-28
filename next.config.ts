import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {},
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: {},
  images: {
    remotePatterns: [
      {
        hostname: 'aceternity.com',
      },
    ],
  },
};

export default nextConfig;
