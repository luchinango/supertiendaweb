/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://206.183.128.36:5500/api';
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;