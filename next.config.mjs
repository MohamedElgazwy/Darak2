/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
    return [
      {
        source: '/API/:path*', // When our frontend requests /API/...
        destination: 'https://darak.runasp.net/API/:path*', // Next.js will secretly fetch from here
      },
    ]
  },
};

export default nextConfig;
