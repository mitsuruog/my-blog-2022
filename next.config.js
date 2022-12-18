/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "s3-ap-northeast-1.amazonaws.com",
      "images-na.ssl-images-amazon.com",
      "blog-mitsuruog.s3.ap-northeast-1.amazonaws.com",
    ],
  },
  async redirects() {
    return [
      // Redirects old blog amp link
      {
        source: "/:year/:month/:slug/amp",
        destination: "/:year/:month/:slug",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
