import { asset, SITE } from './config';
import { getReadClient, isSanityConfigured } from './sanity/client';
import { SETTINGS_QUERY } from './sanity/queries';

/**
 * كل نصوص وأرقام وروابط الموقع في مكان واحد (SiteData).
 * الافتراضي = القيم المحلية الحالية؛ وبعد ضبط Sanity تُدمج قيم لوحة التحكم فوقها.
 */

export interface HoursRow {
  days: string;
  time: string;
}
export interface TitledIcon {
  title: string;
  sub?: string;
  desc?: string;
  icon: string;
}
export interface Heading {
  eyebrow: string;
  title: string;
  sub: string;
}

export interface HomeContent {
  heroBadge: string;
  heroTitleLead: string;
  heroAccent: string;
  heroTitleTail: string;
  heroParagraph: string;
  heroPrimaryLabel: string;
  heroSecondaryLabel: string;
  heroImage: string;
  heroCardTitle: string;
  strip: TitledIcon[];
  featuresHeading: Heading;
  features: TitledIcon[];
  howHeading: Heading;
  steps: TitledIcon[];
  cta: { title: string; sub: string; primaryLabel: string; secondaryLabel: string };
  pkgBanner: { title: string; sub: string; button: string };
}

export interface SiteData {
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  description: string;
  whatsapp: string;
  whatsappDisplay: string;
  currency: string;
  deliveryFee: number;
  freeDeliveryAbove: number;
  city: string;
  address: string;
  hours: HoursRow[];
  regions: string[];
  socials: { instagram: string; facebook: string; tiktok: string };
  home: HomeContent;
}

/** القيم الافتراضية = النصوص الحالية للموقع (تُستبدل جزئياً أو كلياً من لوحة التحكم) */
export const DEFAULT_SITE: SiteData = {
  nameAr: SITE.nameAr,
  nameEn: 'FITBITE',
  taglineAr: SITE.taglineAr,
  description: SITE.description,
  whatsapp: SITE.whatsapp,
  whatsappDisplay: SITE.whatsappDisplay,
  currency: SITE.currency,
  deliveryFee: SITE.deliveryFee,
  freeDeliveryAbove: SITE.freeDeliveryAbove,
  city: SITE.city,
  address: SITE.address,
  hours: SITE.hours as unknown as HoursRow[],
  regions: SITE.regions as unknown as string[],
  socials: SITE.socials as unknown as { instagram: string; facebook: string; tiktok: string },
  home: {
    heroBadge: 'وجبات طازجة تُطهى يومياً بدون زيوت مضافة',
    heroTitleLead: 'طعام صحي يُحسب',
    heroAccent: 'بالغرام',
    heroTitleTail: '، لا بالتقريب.',
    heroParagraph:
      'وجبات محسوبة السعرات والماكروز، مشوية ومطهوة على البخار — حسب هدفك ضخامة أو تنشيف — وتوصلك حتى باب البيت في {city}.',
    heroPrimaryLabel: 'تصفح القائمة',
    heroSecondaryLabel: 'اطلب عبر واتساب',
    heroImage: '/images/hero-bowl.jpg',
    heroCardTitle: 'باول الدجاج المشوي',
    strip: [
      { title: 'طعم شهي', sub: 'وجودة عالية', icon: 'cloche' },
      { title: 'ماكروز', sub: 'محسوبة بدقة', icon: 'chart' },
      { title: 'سعرات حرارية', sub: 'دقيقة', icon: 'flame' },
      { title: 'بدون زيوت', sub: 'أكل صحي 100%', icon: 'leaf' },
    ],
    featuresHeading: {
      eyebrow: 'لماذا فيتبايت',
      title: 'ما يميز فيتبايت',
      sub: 'أربعة وعود نلتزم بها في كل وجبة تخرج من مطبخنا — نفس وعود هويتنا الرسمية.',
    },
    features: [
      {
        title: 'الدقة الغذائية',
        desc: 'نحرص على تقديم بيانات غذائية دقيقة لكل وجبة، تشمل البروتين والكربوهيدرات والدهون والسعرات الحرارية، لمساعدتك على متابعة نظامك الغذائي بثقة.',
        icon: 'clipboard',
      },
      {
        title: 'طهي صحي',
        desc: 'وجباتنا تُحضّر بدون زيوت مضافة، باستخدام طرق طهي صحية مثل الشواء والبخار والقلي الهوائي.',
        icon: 'pot',
      },
      {
        title: 'وجبات تناسب الجميع',
        desc: 'خيارات متنوعة تناسب الرياضيين، ومن يتبعون أنظمة للتخسيس، والموظفين، وكافة الباحثين عن نمط حياة أكثر صحة.',
        icon: 'people',
      },
      {
        title: 'جودة المكونات',
        desc: 'نختار مكوناتنا بعناية، من اللحوم والدواجن والخضروات إلى البهارات والمكونات المستخدمة، لضمان جودة وطعم مميز في كل طبق.',
        icon: 'leafsprig',
      },
    ],
    howHeading: {
      eyebrow: 'كيف تطلب',
      title: 'ثلاث خطوات تفصلك عن وجبتك',
      sub: 'طلبك يصل مطبخنا كرسالة واتساب مرتّبة بكل التفاصيل — بدون تطبيقات وبدون تعقيد.',
    },
    steps: [
      {
        title: 'اختر وجباتك',
        desc: 'تصفح القائمة وأضف ما يعجبك إلى السلة — السعرات والماكروز واضحة أمامك لكل وجبة.',
        icon: 'cart',
      },
      {
        title: 'أكّد طلبك بضغطة',
        desc: 'أكمل بياناتك واضغط «إتمام الطلب عبر واتساب» — تصلنا رسالة مفصّلة بطلبك فوراً.',
        icon: 'whatsapp',
      },
      {
        title: 'وجبتك توصلك طازجة',
        desc: 'نجهّز طلبك بنفس اليوم داخل مطبخنا في {city} ويوصلك حتى باب البيت.',
        icon: 'bike',
      },
    ],
    cta: {
      title: 'جاهز تبدأ رحلتك الصحية؟',
      sub: 'اطلب الآن وخلّي حساب الماكروز علينا — نحن نحسب بالدقة، وأنت تركّز على تمرينك ويومك.',
      primaryLabel: 'اطلب عبر واتساب',
      secondaryLabel: 'تصفح القائمة',
    },
    pkgBanner: {
      title: 'تفضّل الجاهز؟',
      sub: 'ست باقات شهرية بأسعار وماكروز معلنة — اختر باقتك ويبدأ اشتراكك من اليوم.',
      button: 'تصفح الباقات الجاهزة',
    },
  },
};

/** حذف القيم null/undefined القادمة من Sanity حتى لا تدهس الافتراضية */
function cleanNulls<T>(v: T): T {
  if (Array.isArray(v)) {
    return v
      .map((x) => cleanNulls(x))
      .filter((x) => x !== null && x !== undefined) as unknown as T;
  }
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      const c = cleanNulls(val);
      if (c !== null && c !== undefined) out[k] = c;
    }
    return out as unknown as T;
  }
  return v;
}

/** دمج سطحي عميق بسيط: قيم لوحة التحكم فوق الافتراضية، مع ضمان المصفوفات والكائنات */
function mergeSite(raw: Partial<SiteData> & { home?: Partial<HomeContent> }): SiteData {
  const doc = cleanNulls(raw);
  const { home, ...rest } = doc;
  const dh: Partial<HomeContent> = home ?? {};
  const merged: SiteData = {
    ...DEFAULT_SITE,
    ...rest,
    socials: { ...DEFAULT_SITE.socials, ...(doc.socials ?? {}) },
    home: {
      ...DEFAULT_SITE.home,
      ...dh,
      featuresHeading: { ...DEFAULT_SITE.home.featuresHeading, ...(dh.featuresHeading ?? {}) },
      howHeading: { ...DEFAULT_SITE.home.howHeading, ...(dh.howHeading ?? {}) },
      cta: { ...DEFAULT_SITE.home.cta, ...(dh.cta ?? {}) },
      pkgBanner: { ...DEFAULT_SITE.home.pkgBanner, ...(dh.pkgBanner ?? {}) },
    },
  };
  if (!Array.isArray(merged.hours) || !merged.hours.length) merged.hours = DEFAULT_SITE.hours;
  if (!Array.isArray(merged.regions) || !merged.regions.length) merged.regions = DEFAULT_SITE.regions;
  const h = merged.home;
  if (!Array.isArray(h.strip) || !h.strip.length) h.strip = DEFAULT_SITE.home.strip;
  if (!Array.isArray(h.features) || !h.features.length) h.features = DEFAULT_SITE.home.features;
  if (!Array.isArray(h.steps) || !h.steps.length) h.steps = DEFAULT_SITE.home.steps;
  return merged;
}

/** جلب إعدادات الموقع كاملة — من Sanity إذا ضُبط، وإلا الافتراضية */
export async function getSite(): Promise<SiteData> {
  if (isSanityConfigured) {
    try {
      const doc = await getReadClient().fetch<Partial<SiteData> & { home?: Partial<HomeContent> } | null>(
        SETTINGS_QUERY
      );
      if (doc) return mergeSite(doc);
    } catch (err) {
      console.error('Sanity settings fetch failed — falling back to local defaults:', err);
    }
  }
  return DEFAULT_SITE;
}

/** صورة من Sanity (رابط مطلق) أو من مجلد public (مسار نسبي) */
export const imgUrl = (path: string): string =>
  path && path.startsWith('http') ? path : asset(path || '/images/hero-bowl.jpg');

/** استبدال رموز مثل {city} بقيم الإعدادات */
export const fillTokens = (text: string, site: SiteData): string =>
  text.replaceAll('{city}', site.city).replaceAll('{name}', site.nameAr);
