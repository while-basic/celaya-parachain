/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds for development
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during builds for development
    ignoreBuildErrors: true,
  },
  experimental: {
    // Optimize font loading
    optimizeFonts: true,
  },
  // Reduce font preloading warnings
  async headers() {
    return [
      {
        source: '/_next/static/media/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 