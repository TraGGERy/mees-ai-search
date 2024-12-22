const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  onError: (err) => {
    console.error('Next.js build error:', err);
  },
  webpack: (config, { isServer }) => {
    // Add source maps for better debugging
    if (!isServer) {
      config.devtool = 'source-map';
    }
    return config;
  },
}

module.exports = withPWA(nextConfig) 