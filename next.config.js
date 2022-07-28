/** @type {import('next').NextConfig} */
const nextConfig = {
  // assetPrefix: "./",
  reactStrictMode: true,
  images: {
    domains: [
      "s3-ap-northeast-1.amazonaws.com",
      "images-na.ssl-images-amazon.com",
    ],
  },
  // experimental: {
  //   images: {
  //     unoptimized: true,
  //   },
  // },
  // async redirects() {
  //   return [
  //     // Redirects old blog amp link
  //     {
  //       source: "/:year/:month/:slug/amp",
  //       destination: "/:year/:month/:slug",
  //       permanent: true,
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
