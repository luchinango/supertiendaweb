/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${API_URL}/:path*`,
        },
      ],
    }
  }
};

module.exports = nextConfig;