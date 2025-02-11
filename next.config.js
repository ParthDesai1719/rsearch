/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY,
    SERPER_API_KEY: process.env.SERPER_API_KEY,
    FIRECRAWL_BASE_URL: process.env.FIRECRAWL_BASE_URL,
  },
  devIndicators: {
    appIsrStatus: false,
  },
}

module.exports = nextConfig;
