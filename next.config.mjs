/** @type {import('next').NextConfig} */
const nextConfig = {
  // صور الموقع محلية مولّدة مسبقاً — لا نحتاج sharp في النشر
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
