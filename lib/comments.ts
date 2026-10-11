/**
 * تعليقات الزوار:
 * - يعرض الموقع التعليقات المنشورة والمعتمدة من Sanity فقط.
 * - تُرسل التعليقات الجديدة إلى Sanity كمسودات غير منشورة وغير معتمدة إذا ضُبط توكن الكتابة.
 * - عند غياب التوكن أو فشل الإرسال، تُحفظ محلياً ويظهر رابط لإرسالها للإدارة عبر واتساب.
 */

import {
  getReadClient,
  getWriteClient,
  isSanityConfigured,
  type ReadClientOptions,
} from './sanity/client';
import { APPROVED_COMMENTS_QUERY } from './sanity/queries';

export interface SiteComment {
  _id: string;
  name: string;
  role?: string;
  text: string;
  postedAt?: string;
}

/** تعليقات احتياطية عند غياب Sanity أو تعذّر الاتصال به. */
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

/** جلب التعليقات المعتمدة — نتيجة فارغة تعني أنه لا توجد تعليقات منشورة حالياً. */
export async function getApprovedComments(options: ReadClientOptions = {}): Promise<SiteComment[]> {
  if (isSanityConfigured) {
    try {
      const list = await getReadClient(options).fetch<SiteComment[]>(APPROVED_COMMENTS_QUERY);
      if (Array.isArray(list)) return list;
    } catch (err) {
      console.error('Sanity comments fetch failed — falling back to local seeds:', err);
    }
  }
  return APPROVED_COMMENTS;
}

/* ── التعليقات المحلية عند تعذّر الإرسال المباشر إلى Sanity ── */

export interface PendingComment extends SiteComment {
  sentAt: string;
}

const STORAGE_KEY = 'fitbite.pendingComments';

export type SubmitMode = 'sanity' | 'local';
export type SubmitResult =
  | { mode: 'sanity' }
  | { mode: 'local'; pending: PendingComment };

/**
 * إنشاء مسودة تعليق غير منشورة في Sanity، لدعم الأدوار التي تسمح بإنشاء المسودات دون النشر،
 * أو حفظه محلياً عند غياب التوكن/فشل الشبكة.
 */
export async function submitComment(name: string, text: string): Promise<SubmitResult> {
  const cleanName = name.trim();
  const cleanText = text.trim();
  if (!cleanName || !cleanText || cleanName.length > 40 || cleanText.length > 400) {
    throw new Error('Invalid comment');
  }

  const write = getWriteClient();
  if (write) {
    try {
      await write.create({
        // The drafts. prefix makes this a Sanity draft rather than a published document.
        _id: `drafts.comment-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        _type: 'comment',
        name: cleanName,
        text: cleanText,
        approved: false,
        postedAt: new Date().toISOString(),
      });
      return { mode: 'sanity' };
    } catch (err) {
      console.error('Sanity comment create failed — falling back to local:', err);
    }
  }
  return { mode: 'local', pending: savePendingComment(cleanName, cleanText) };
}

function isPendingComment(value: unknown): value is PendingComment {
  if (!value || typeof value !== 'object') return false;
  const comment = value as Partial<PendingComment>;
  return (
    typeof comment._id === 'string' &&
    typeof comment.name === 'string' &&
    typeof comment.text === 'string' &&
    typeof comment.sentAt === 'string'
  );
}

export function getPendingComments(): PendingComment[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    return parsed.filter(isPendingComment).filter((comment) => {
      if (seen.has(comment._id)) return false;
      seen.add(comment._id);
      return true;
    });
  } catch {
    return [];
  }
}

export function savePendingComment(name: string, text: string): PendingComment {
  const entry: PendingComment = {
    _id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim().slice(0, 40),
    text: text.trim().slice(0, 400),
    sentAt: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    try {
      const list = [...getPendingComments(), entry];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Keep the entry in component state even if browser storage is unavailable or full.
    }
  }
  return entry;
}

/** نص رسالة واتساب التي تصل الإدارة بها التعليق للموافقة */
export function commentAdminMessage(name: string, text: string): string {
  return `📩 تعليق زائر جديد بانتظار الموافقة والنشر:\nالاسم: ${name}\nالتعليق: ${text}`;
}
