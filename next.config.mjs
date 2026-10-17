/** @type {import('next').NextConfig} */

/* الموقع يُقدَّم حالياً من الدومين المخصص fitbite-sudan.com على الجذر (/)،
   لذلك يُبنى بدون مسار أساس: npm run build
   لا تستخدم NEXT_PUBLIC_BASE_PATH=/fitebite (npm run build:pages) إلا إذا
   عُدت للنشر على الرابط الفرعي fitbitesud.github.io/fitebite — فهو يجعل
   ملفات CSS/JS تُطلب من /fitebite/_next/... وتعود 404 على الدومين الجذري،
   فيظهر الموقع كنصوص عارية بلا تنسيق. */
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
