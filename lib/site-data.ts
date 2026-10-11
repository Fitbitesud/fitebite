import { BASE_PATH, SITE } from './config';
import { toLatinDigits } from './format';
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
  /** شعار الشريط العلوي (والخلفية الفاتحة عموماً) — يُضبط من لوحة التحكم */
  logo: string;
  /** نسخة الشعار للخلفية الداكنة (اختيارية) — فارغة تعني استخدام logo في كل المواضع */
  logoDark: string;
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
  logo: '/logo.png',
  /* بلا صورة للخلفية الداكنة يستخدم الشريط الشعار الأساسي (انظر logoForTone) */
  logoDark: '',
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

/* ── دمج عدة وثائق إعدادات (الأقدم ← الأحدث): أحدث قيمة تحسم كل حقلاً ── */
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
}
function deepMergeDocs(
  base: Record<string, unknown>,
  over: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(over)) {
    if (v === undefined || v === null) continue;
    if (isPlainObject(v) && isPlainObject(out[k])) {
      out[k] = deepMergeDocs(out[k] as Record<string, unknown>, v);
    } else {
      out[k] = v;
    }
  }
  return out;
}
/** يدمج قائمة وثائق siteSettings (نتيجة SETTINGS_QUERY) في وثيقة واحدة نظيفة */
export function mergeSettingsDocs(
  docs: unknown,
): (Partial<SiteData> & { home?: Partial<HomeContent> }) | null {
  if (!Array.isArray(docs)) return null;
  const cleaned = docs.map((d) => cleanNulls(d)).filter(isPlainObject);
  if (!cleaned.length) return null;
  return cleaned.reduce<Record<string, unknown>>((acc, d) => deepMergeDocs(acc, d), {}) as Partial<
    SiteData
  > & { home?: Partial<HomeContent> };
}

/** رقم صالح غير سالب من لوحة التحكم، وإلا القيمة الافتراضية */
const toSafeNumber = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : fallback;

/** نص غير فارغ من لوحة التحكم، وإلا القيمة الافتراضية (حقل ممسوح/فارغ لا يُفرغ الموقع) */
const toSafeString = (v: unknown, fallback: string): string =>
  typeof v === 'string' && v.trim() ? v : fallback;

/** استكمال النصوص الفارغة في كائنات العناوين (مثل cta وpkgBanner) من الافتراضية */
function fillObjectStrings<T extends object>(current: T, def: T): T {
  const out = { ...current } as Record<string, unknown>;
  for (const [k, v] of Object.entries(def)) {
    if (typeof v === 'string' && !(typeof out[k] === 'string' && out[k].trim())) out[k] = v;
  }
  return out as T;
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
  const h = merged.home;
  /* أي نص هبوط تُرك فارغاً في لوحة التحكم يعود للافتراضي بدل نصوص ناقصة */
  const hRec = h as unknown as Record<string, unknown>;
  for (const [k, v] of Object.entries(DEFAULT_SITE.home)) {
    const cur = hRec[k];
    if (typeof v === 'string' && !(typeof cur === 'string' && cur.trim())) hRec[k] = v;
  }
  h.featuresHeading = fillObjectStrings(h.featuresHeading, DEFAULT_SITE.home.featuresHeading);
  h.howHeading = fillObjectStrings(h.howHeading, DEFAULT_SITE.home.howHeading);
  h.cta = fillObjectStrings(h.cta, DEFAULT_SITE.home.cta);
  h.pkgBanner = fillObjectStrings(h.pkgBanner, DEFAULT_SITE.home.pkgBanner);
  if (!Array.isArray(h.strip) || !h.strip.length) h.strip = DEFAULT_SITE.home.strip;
  if (!Array.isArray(h.features) || !h.features.length) h.features = DEFAULT_SITE.home.features;
  if (!Array.isArray(h.steps) || !h.steps.length) h.steps = DEFAULT_SITE.home.steps;
  /* المناطق: قصّ المسافات الزائدة (مثل "شارع المطار ") وحذف الفارغ */
  merged.regions = Array.isArray(merged.regions)
    ? merged.regions.map((r) => (typeof r === 'string' ? r.trim() : '')).filter(Boolean)
    : [];
  if (!merged.regions.length) merged.regions = DEFAULT_SITE.regions;
  /* الهوية والأرقام: قيم فارغة أو غير صالحة تسقط على الافتراضية */
  merged.nameAr = toSafeString(merged.nameAr, DEFAULT_SITE.nameAr);
  merged.nameEn = toSafeString(merged.nameEn, DEFAULT_SITE.nameEn);
  merged.logo = toSafeString(merged.logo, DEFAULT_SITE.logo);
  merged.logoDark = toSafeString(merged.logoDark, DEFAULT_SITE.logoDark);
  merged.taglineAr = toSafeString(merged.taglineAr, DEFAULT_SITE.taglineAr);
  merged.description = toSafeString(merged.description, DEFAULT_SITE.description);
  merged.currency = toSafeString(merged.currency, DEFAULT_SITE.currency);
  merged.city = toSafeString(merged.city, DEFAULT_SITE.city);
  merged.address = toSafeString(merged.address, DEFAULT_SITE.address);
  merged.deliveryFee = toSafeNumber(merged.deliveryFee, DEFAULT_SITE.deliveryFee);
  merged.freeDeliveryAbove = toSafeNumber(merged.freeDeliveryAbove, DEFAULT_SITE.freeDeliveryAbove);
  /* ساعات العمل: تنظيف صفوف ناقصة، والغياب الكامل يعود للدوام الافتراضي */
  merged.hours = (Array.isArray(merged.hours) ? merged.hours : [])
    .map((row) => ({
      days: typeof row?.days === 'string' ? row.days.trim() : '',
      time: typeof row?.time === 'string' ? row.time.trim() : '',
    }))
    .filter((row) => row.days || row.time);
  if (!merged.hours.length) merged.hours = DEFAULT_SITE.hours;
  /* روابط السوشيال: أي رابط تُرك فارغاً يعود للرابط الافتراضي */
  merged.socials = {
    instagram: toSafeString(merged.socials.instagram, DEFAULT_SITE.socials.instagram),
    facebook: toSafeString(merged.socials.facebook, DEFAULT_SITE.socials.facebook),
    tiktok: toSafeString(merged.socials.tiktok, DEFAULT_SITE.socials.tiktok),
  };
  /* تطبيع رقم الواتساب: أرقام فقط، وبادئة محلية 0 تتحول للصيغة الدولية 249 */
  const digits = toLatinDigits(String(merged.whatsapp ?? '')).replace(/\D/g, '');
  if (digits) {
    merged.whatsapp = digits.startsWith('00')
      ? digits.slice(2)
      : digits.startsWith('0')
        ? `249${digits.slice(1)}`
        : digits;
  } else {
    /* حقل فارغ في لوحة التحكم → نبقي الرقم الافتراضي بدل رابط wa.me/ فارغ */
    merged.whatsapp = DEFAULT_SITE.whatsapp;
  }
  /* الرقم المعروض يتبع الرقم المربوط ما لم يُكتب نص عرض صريح من لوحة التحكم */
  const display = String(doc.whatsappDisplay ?? '').trim();
  merged.whatsappDisplay = display
    ? display
    : merged.whatsapp === DEFAULT_SITE.whatsapp
      ? DEFAULT_SITE.whatsappDisplay
      : merged.whatsapp.startsWith('249')
        ? `0${merged.whatsapp.slice(3)}`
        : merged.whatsapp;
  return merged;
}

/**
 * جلب إعدادات الموقع كاملة — من Sanity إذا ضُبط، وإلا الافتراضية.
 * كل رسائل الإعدادات موسومة بـ [site-settings] لتُصفّى بسهولة في وحدة تحكم المتصفح.
 */
export async function getSite(): Promise<SiteData> {
  if (isSanityConfigured) {
    try {
      const docs = await getReadClient().fetch<unknown[]>(SETTINGS_QUERY);
      const doc = mergeSettingsDocs(docs);
      if (doc && Object.keys(doc).length) return mergeSite(doc);
      /* وصل الاستعلام بلا أي قيمة قابلة للاستخدام: وثيقة غير منشورة، أو فارغة، أو بشكل غير معروف */
      console.warn(
        '[site-settings] no siteSettings values came back from Sanity — showing the local defaults. ' +
          'Check that the document is published (drafts are never read) and its fields are filled in; ' +
          'SETTINGS_QUERY accepts both the nested (identity/contact/home) and the flat root-level shape.',
      );
    } catch (err) {
      console.error(
        '[site-settings] Sanity settings fetch failed — showing the local defaults:',
        err,
      );
    }
  }
  return DEFAULT_SITE;
}

/**
 * صورة من Sanity (رابط مطلق يبدأ بـ http) أو من مجلد public (مسار نسبي).
 * - مسار فارغ/مفقود → صورة الهبوط الافتراضية حتى لا تنكسر الواجهة.
 * - مسار مبدوء بمسار الأساس (من استدعاء asset() سابقاً) يُعاد كما هو
 *   حتى لا يُضاف مسار الأساس مرتين في بناء GitHub Pages (basePath=/fitebite).
 */
export function resolveImageUrl(path: string | null | undefined, basePath: string): string {
  const p = path || '/images/hero-bowl.jpg';
  if (p.startsWith('http')) return p;
  if (basePath && p.startsWith(`${basePath}/`)) return p;
  return `${basePath}${p}`;
}

export const imgUrl = (path?: string | null): string => resolveImageUrl(path, BASE_PATH);

/**
 * صورة الشعار المناسبة للخلفية — الحقلان المضبوطان في لوحة التحكم (identity.logo / identity.logoDark):
 *  - `cream`  → الشريط فوق خلفية داكنة (أعلى الصفحة الرئيسية، والتذييل):
 *               يستخدم شعار الخلفية الداكنة إن رُفع، وإلا الشعار الأساسي.
 *  - `forest` → خلفية فاتحة (بقية الصفحات، وبعد التمرير): الشعار الأساسي دائماً.
 */
export const logoForTone = (
  site: Pick<SiteData, 'logo' | 'logoDark'>,
  tone: 'forest' | 'cream',
): string => (tone === 'cream' && site.logoDark ? site.logoDark : site.logo);

/** استبدال رموز مثل {city} بقيم الإعدادات */
export const fillTokens = (text: string, site: SiteData): string =>
  text.replaceAll('{city}', site.city).replaceAll('{name}', site.nameAr);
