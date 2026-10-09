/** @type {import('next').NextConfig} */

/* عند النشر على GitHub Pages يُبنى الموقع بمسار أساس مثل /fitebite:
   NEXT_PUBLIC_BASE_PATH=/fitebite npm run build   (أو npm run build:pages) */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  // تصدير ثابت (HTML/CSS/JS) — مطلوب للاستضافة على GitHub Pages
  output: 'export',
  // مفيد لـ Pages حتى تعمل المجلدات بدون 404
  trailingSlash: true,
  // صور الموقع محلية — لا نحتاج sharp أو خادم صور
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  ...(basePath ? { basePath } : {}),
};

export default nextConfig;
