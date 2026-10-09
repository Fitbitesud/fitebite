/**
 * إعدادات الموقع المركزية — كل الأرقام والنصوص القابلة للتغيير موجودة هنا فقط.
 */
export const SITE = {
  /** اسم العلامة بالعربية (الشعار بدون أي نص إنجليزي) */
  nameAr: 'فيتبايت',
  /** سطر العلامة المترجم عن الهوية (بدل النص الإنجليزي المحذوف) */
  taglineAr: 'طعام صحي',
  description:
    'فيتبايت — مطعم متخصص في إعداد الطعام الصحي: وجبات محسوبة السعرات والماكروز، تُطهى بدون زيوت مضافة وتصلك حتى باب البيت.',

  /** رقم الواتساب المستقبِل للطلبات — بصيغة دولية بدون + أو مسافات (غيّره هنا فقط) */
  whatsapp: '249116642510',
  whatsappDisplay: '0116642510',

  /** العملة المعروضة في الموقع */
  currency: 'ج.س',

  /** رسوم التوصيل، ومجاني فوق هذا المجموع */
  deliveryFee: 2000,
  freeDeliveryAbove: 40000,

  city: 'الخرطوم',
  address: 'الخرطوم — السودان',
  hours: [
    { days: 'السبت — الخميس', time: '10:00 ص — 11:00 م' },
    { days: 'الجمعة', time: '2:00 م — 11:00 م' },
  ],
  regions: [
    'وسط الخرطوم',
    'الرياض',
    'المعمورة',
    'امتداد ناصر',
    'المنشية',
    'الطائف',
    'بحري',
    'أم درمان',
  ],
  socials: {
    instagram: 'https://instagram.com/fitbite.sd',
    facebook: 'https://facebook.com/fitbite.sd',
    tiktok: 'https://tiktok.com/@fitbite.sd',
  },
} as const;

export type SiteConfig = typeof SITE;

/** مسار الأساس عند النشر على GitHub Pages (يُحقن من بيئة البناء) */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** إلحاق مسار الأساس بأي ملف داخل public/ (ضروري للصور في التصدير الثابت) */
export const asset = (path: string): string => `${BASE_PATH}${path}`;
