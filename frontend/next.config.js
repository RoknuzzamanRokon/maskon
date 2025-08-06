/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["example.com", "localhost", "images.pexels.com", "pexels.com"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/photos/**',
      },
      {
        protocol: 'https',
        hostname: 'pexels.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
