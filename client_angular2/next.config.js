/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add other configurations here if needed
};
module.exports = {
  images: {
    remotePatterns: [new URL('https://assets.example.com/account123/**')],
  },
};

module.exports = nextConfig;
