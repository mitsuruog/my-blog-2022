/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "s3-ap-northeast-1.amazonaws.com",
      "images-na.ssl-images-amazon.com",
    ],
  },
};

module.exports = nextConfig;
