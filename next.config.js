/** @type {import('next').NextConfig} */
const webpackLib = require('webpack');

const nextConfig = {
  // External packages for server components
  serverExternalPackages: ['mongoose'],

  // Image optimization (no external Builder.io patterns)
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    // Keep a minimal CSP for the images loader context; full CSP set in middleware
    contentSecurityPolicy: "default-src 'self';",
    domains: ['picsum.photos'],
    // Allow external images (fixes next/image unconfigured host error)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },

  // Compression and optimization
  compress: true,
  poweredByHeader: false,

  // Performance headers
  async headers() {
    return [
      // Static assets - long cache
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|webp|avif|ico|woff|woff2|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      // Next.js static files
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Next.js images
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // API routes - use stale-while-revalidate
      {
        source: '/api/categories/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      {
        source: '/api/offers/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      {
        source: '/api/signature-drinks/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=600, stale-while-revalidate=1200',
          },
        ],
      },
      {
        source: '/api/homepage/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=600, stale-while-revalidate=1200',
          },
        ],
      },
      // Images API - longer cache
      {
        source: '/api/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=172800',
          },
        ],
      },
      // Admin API - no cache
      {
        source: '/api/admin/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Output configuration for Vercel
  output: 'standalone',

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },

  // Minimal webpack customization
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = config.plugins || [];
      config.plugins.push(new webpackLib.DefinePlugin({ self: 'globalThis' }));
    }
    return config;
  },

  // Enable SWC minification (enabled by default in Next.js 15)

  // Experimental features for better optimization
  experimental: {},

  // Production source maps (disable to reduce bundle size)
  productionBrowserSourceMaps: false,

  // Reduce JavaScript sent to client
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Optimize redirects and rewrites
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/menu',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig
