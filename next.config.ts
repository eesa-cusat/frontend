import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'ui-avatars.com',
      'via.placeholder.com',
      'res.cloudinary.com', // Add Cloudinary domain
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-backend-domain.com',
        pathname: '/media/**',
      },
      // Keep localhost for development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      // Add Cloudinary patterns
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
