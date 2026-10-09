/**
 * طبقة تعليقات الزوار — مصممة للاستبدال بـ Sanity لاحقاً بدون تغيير الواجهة.
 * ─────────────────────────────────────────────────────────────
 * الوضع الحالي (قبل ربط Sanity):
 *  - التعليقات المعتمدة المنشورة = بذور محلية (البذور أدناه).
 *  - تعليق الزائر الجديد يُحفظ في متصفحه بحالة «بانتظار الموافقة»،
 *    ويُرسَل نصّه للإدارة عبر واتساب للمراجعة.
 *
 * للربط مع Sanity:
 *  1) أنشئ نوع محتوى باسم comment بحقول: name (string)، text (text)،
 *     postedAt (datetime)، approved (boolean، افتراضي false).
 *  2) استبدل جسم getApprovedComments بـ:
 *       client.fetch(`*[_type == "comment" && approved] | order(postedAt desc){ _id, name, text, postedAt }`)
 *  3) استبدل جسم submitComment بـ:
 *       client.create({ _type: 'comment', name, text, approved: false, postedAt: new Date().toISOString() })
 *     → يظهر التعليق عندك في Sanity بحالة غير موافَق عليها، وبعد تفعيل approved يُنشر هنا تلقائياً.
 */

export interface SiteComment {
  _id: string;
  name: string;
  role?: string;
  text: string;
  postedAt?: string;
}

/** التعليقات المعتمدة المنشورة حالياً (ستُستبدل باستعلام Sanity) */
export const APPROVED_COMMENTS: SiteComment[] = [
  {
    _id: 'seed-1',
    name: 'أحمد مبارك',
    role: 'رياضي — نظام ضخامة',
    text: 'أول مرة آكل صحي بدون ما أحسب بنفسي — الماكروز مظبوطة بالضبط مثل ما مكتوب، والطعم أقوى من مطاعم عادية.',
  },
  {
    _id: 'seed-2',
    name: 'سارة عبد الله',
    role: 'موظفة — نظام تنشيف',
    text: 'بوكسات الغداء توصلني كل يوم للشغل طازجة وباردة، ووفرت عليّ تفكير الدايت كله. الطلب عبر واتساب سريع ومرتب.',
  },
  {
    _id: 'seed-3',
    name: 'محمد عثمان',
    role: 'مشترك نظام الأسبوع',
    text: 'نظام الأسبوع غيّر روتيني كلياً: وجبات محسوبة لهدفي للتنشيف، ونزلت 6 كيلو في شهرين بدون ما أحس بجوع.',
  },
];

/** جلب التعليقات المعتمدة — حالياً محلي، ولاحقاً من Sanity (انظر أعلى الملف) */
export async function getApprovedComments(): Promise<SiteComment[]> {
  return APPROVED_COMMENTS;
}

/* ── التعليقات المعلقة (جهاز الزائر فقط، حتى ربط Sanity) ── */

export interface PendingComment extends SiteComment {
  sentAt: string;
}

const STORAGE_KEY = 'fitbite.pendingComments';

export function getPendingComments(): PendingComment[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]') as PendingComment[];
  } catch {
    return [];
  }
}

export function savePendingComment(name: string, text: string): PendingComment {
  const entry: PendingComment = {
    _id: `pending-${Date.now()}`,
    name,
    text,
    sentAt: new Date().toISOString(),
  };
  const list = [...getPendingComments(), entry];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return entry;
}

/** نص رسالة واتساب التي تصل الإدارة بها التعليق للموافقة */
export function commentAdminMessage(name: string, text: string): string {
  return `📩 تعليق زائر جديد بانتظار الموافقة والنشر:\nالاسم: ${name}\nالتعليق: ${text}`;
}
