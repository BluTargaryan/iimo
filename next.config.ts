import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'daulvmqewulpkwgwjlyr.supabase.co',
      },
    ],
  },
  // Remove X-Powered-By header
  poweredByHeader: false,
  // Enable modern JavaScript output (ES2020+) - reduces legacy JavaScript
  swcMinify: true,
  compiler: {
    // Remove console.logs in production (saves bytes)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Optimize package imports to reduce bundle size
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', '@supabase/ssr'],
  },
};

export default withBundleAnalyzer(nextConfig);
