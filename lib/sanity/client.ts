import { createClient, type SanityClient } from '@sanity/client';

/**
 * إعداد عميل Sanity المركزي.
 * الموقع يعمل بدون Sanity (بيانات محلية) حتى تُضبط متغيرات البيئة أدناه —
 * وبعدها يتحوّل تلقائياً للجلب من لوحة التحكم بدون تغيير أي مكوّن واجهة.
 *
 * متغيرات البيئة (انظر .env.example):
 *  NEXT_PUBLIC_SANITY_PROJECT_ID      — معرّف المشروع من sanity.io/manage
 *  NEXT_PUBLIC_SANITY_DATASET         — اسمDataset (افتراضياً production)
 *  NEXT_PUBLIC_SANITY_API_VERSION     — إصدار API ثابت (افتراضياً 2025-02-19)
 *  NEXT_PUBLIC_SANITY_COMMENT_TOKEN   — توكن API يسمح بإنشاء مستندات التعليقات في الداتاسيت
 */
export const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'zes52trp';
export const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const SANITY_API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-19';
/** This NEXT_PUBLIC token is embedded in the static bundle; it must never be an admin token. */
const SANITY_COMMENT_TOKEN = process.env.NEXT_PUBLIC_SANITY_COMMENT_TOKEN ?? '';

/** هل تم ربط Sanity؟ (وجود معرّف المشروع يكفي للقراءة) */
export const isSanityConfigured = Boolean(SANITY_PROJECT_ID);

let readClient: SanityClient | null = null;
let freshReadClient: SanityClient | null = null;

export type ReadClientOptions = {
  /** تجاوز CDN في جلب المتصفح بعد النشر لتفادي تأخر تحديث الكاش. */
  fresh?: boolean;
};

function createReadClient(useCdn: boolean): SanityClient {
  return createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
    useCdn,
  });
}

/**
 * عميل القراءة:
 * - الوضع الافتراضي يستخدم CDN السريع لبيانات البناء الأولية.
 * - fresh يقرأ مباشرة من Sanity API (بدون CDN) لتظهر تعديلات لوحة التحكم فوراً
 *   عند تحديث الصفحة، بدلاً من انتظار تحديث نسخة CDN.
 */
export function getReadClient(options: ReadClientOptions = {}): SanityClient {
  if (options.fresh) {
    if (!freshReadClient) freshReadClient = createReadClient(false);
    return freshReadClient;
  }

  if (!readClient) readClient = createReadClient(true);
  return readClient;
}

/** عميل الكتابة لتعليقات الزوار — يعود null إذا لم يُضبط توكن التعليقات */
export function getWriteClient(): SanityClient | null {
  if (!isSanityConfigured || !SANITY_COMMENT_TOKEN) return null;
  return createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
    useCdn: false,
    token: SANITY_COMMENT_TOKEN,
  });
}
