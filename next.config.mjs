/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Don't ignore build errors - fix them instead
    ignoreBuildErrors: false,
  },
  images: {
    // Enable Next.js image optimization for better performance
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabaseusercontent.com',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
  },
  reactStrictMode: true,

}

export default nextConfig
