/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  experimental: {
    swcTraceProfiling: false,
    cpus: 1,
  },
  // Tắt source map production để giảm RAM build
  productionBrowserSourceMaps: false,
};

export default nextConfig;
