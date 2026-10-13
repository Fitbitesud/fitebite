import { asset } from './config';
import { price } from './format';
import { getReadClient, isSanityConfigured, type ReadClientOptions } from './sanity/client';
import { OFFERS_QUERY } from './sanity/queries';
import { DEFAULT_SITE, type SiteData } from './site-data';

/**
 * العروض الخاصة — قسم في الصفحة الرئيسية يُدار بالكامل من لوحة التحكم
 * (وثائق `offer` في Sanity Studio). بدون Sanity تظهر العروض المحلية أدناه.
 */
export interface Offer {
  id: string;
  title: string;
  desc: string;
  /** شارة مختصرة أعلى البطاقة (مثال: خصم 20%) */
  badge?: string;
  image: string;
  /** السعر قبل العرض — يُعرض مشطوباً بجانب سعر العرض */
  priceOld?: number;
  /** سعر العرض */
  priceNew?: number;
  /** آخر تاريخ ساري للعرض (YYYY-MM-DD) — بعد هذا التاريخ يختفي العرض تلقائياً */
  validUntil?: string;
  active: boolean;
  order?: number;
}

/** عروض محلية افتراضية (بدون لوحة التحكم) */
export const DEFAULT_OFFERS: Offer[] = [
  {
    id: 'offer-family-tray',
    title: 'صينية العشاء العائلي',
    badge: 'وفّر 20%',
    desc: 'أربع وجبات مشوية مشكّلة (دجاج ولحم وخضار) بعشاء واحد على نظامكم — بسعر أصح من 20%.',
    image: asset('/images/grill-plate.jpg'),
    priceOld: 30000,
    priceNew: 24000,
    active: true,
    order: 1,
  },
  {
    id: 'offer-cut-combo',
    title: 'عرض التنشيف المزدوج',
    badge: '2 بسعر 1.5',
    desc: 'وجبتا تنشيف في نفس اليوم بسعر واحدة ونصف فقط — تغطية كاملة لتمرين الصباح والمساء.',
    image: asset('/images/green-salad.jpg'),
    priceOld: 16000,
    priceNew: 12000,
    active: true,
    order: 2,
  },
  {
    id: 'offer-first-taste',
    title: 'هدية مع أول طلب',
    badge: 'هدية مجانية',
    desc: 'مع أول طلب بـ 30,000 ج.س فأكثر: بروتين شייك على حسابنا — جرّب دقتنا أول مرة.',
    image: asset('/images/pb-shake.jpg'),
    active: true,
    order: 3,
  },
];

/** تاريخ اليوم بصيغة YYYY-MM-DD (للمقارنة القاموسية) */
export const todayStr = (now: Date = new Date()): string => now.toISOString().slice(0, 10);

/** هل العرض ساري الآن؟ (مفعّل ولم تنتهِ مدته — العرض المنتهي اليوم لا يزال سارياً) */
export function isOfferLive(offer: Offer, now: Date = new Date()): boolean {
  if (!offer.active) return false;
  if (offer.validUntil && offer.validUntil < todayStr(now)) return false;
  return true;
}

const validPrice = (v: unknown): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : undefined;

/**
 * تهيئة عرض قادم من لوحة التحكم حتى يظهر بدل إسقاطه:
 * العنوان مطلوب، وكل حقل ناقص أو غير صالح يحصل على قيمة افتراضية آمنة.
 */
function coerceOffer(d: Partial<Offer> & { _id: string }): Offer | null {
  const title = typeof d.title === 'string' ? d.title.trim() : '';
  if (!title) return null;
  const validUntil =
    typeof d.validUntil === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d.validUntil)
      ? d.validUntil.slice(0, 10)
      : undefined;
  return {
    id: d.id ?? d._id,
    title,
    desc: typeof d.desc === 'string' ? d.desc : '',
    badge: typeof d.badge === 'string' && d.badge.trim() ? d.badge.trim() : undefined,
    image: typeof d.image === 'string' ? d.image : '',
    priceOld: validPrice(d.priceOld),
    priceNew: validPrice(d.priceNew),
    validUntil,
    active: d.active !== false,
    order: typeof d.order === 'number' && Number.isFinite(d.order) ? d.order : undefined,
  };
}

const byOrder = (a: Offer, b: Offer): number => (a.order ?? 0) - (b.order ?? 0);

/**
 * جلب العروض — من Sanity إذا ضُبطت الوثائق، وإلا القائمة المحلية.
 * نفس نمط الباقات: وثائق منشورة كلها غير مفعّلة/منتهية → قسم فارغ مقصود،
 * ولا وثائق إطلاقاً أو خطأ شبكة → العروض المحلية.
 */
export async function getOffers(options: ReadClientOptions = {}): Promise<Offer[]> {
  if (isSanityConfigured) {
    try {
      const docs = await getReadClient(options).fetch<Array<Partial<Offer> & { _id: string }>>(
        OFFERS_QUERY
      );
      if (Array.isArray(docs)) {
        const live = docs
          .filter((d) => d && d._id)
          .map(coerceOffer)
          .filter((o): o is Offer => o !== null)
          .filter((o) => isOfferLive(o))
          .sort(byOrder);
        if (live.length) return live;
        if (docs.length) return [];
      }
    } catch (err) {
      console.error('Sanity offers fetch failed — falling back to local:', err);
    }
  }
  return DEFAULT_OFFERS.filter((o) => isOfferLive(o)).sort(byOrder);
}

/** رسالة واتساب جاهزة لطلب عرض خاص */
export function buildOfferMessage(offer: Offer, site: SiteData = DEFAULT_SITE): string {
  const L: string[] = [];
  L.push(`طلب عرض خاص من ${site.nameAr} 🔥`);
  L.push('━━━━━━━━━━━━━━━');
  L.push(`العرض: ${offer.title}`);
  if (offer.desc) L.push(offer.desc);
  if (offer.priceOld !== undefined && offer.priceNew !== undefined) {
    L.push(`السعر قبل العرض: ${price(offer.priceOld, site.currency)}`);
    L.push(`*سعر العرض: ${price(offer.priceNew, site.currency)}*`);
  } else if (offer.priceNew !== undefined) {
    L.push(`سعر العرض: ${price(offer.priceNew, site.currency)}`);
  }
  if (offer.validUntil) L.push(`العرض ساري حتى: ${offer.validUntil}`);
  L.push('──────────');
  L.push('الاسم: ');
  L.push('المنطقة: ');
  L.push('');
  L.push(`_أُرسل تلقائياً من موقع ${site.nameAr}_ 🌿`);
  return L.join('\n');
}
