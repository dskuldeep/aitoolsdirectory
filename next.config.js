/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Allow images from our own API
    unoptimized: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Prisma will be generated automatically during build
  eslint: {
    // Only fail on errors, not warnings during build
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Only fail on errors, not warnings during build
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig

