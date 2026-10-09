import { createClient, type SanityClient } from '@sanity/client';

/**
 * إعداد عميل Sanity المركزي.
 * الموقع يعمل بدون Sanity (بيانات محلية) حتى تُضبط متغيرات البيئة أدناه —
 * وبعدها يتحوّل تلقائياً للجلب من لوحة التحكم بدون تغيير أي مكوّن واجهة.
 *
 * متغيرات البيئة (انظر .env.example):
 *  NEXT_PUBLIC_SANITY_PROJECT_ID      — معرّف المشروع من sanity.io/manage
 *  NEXT_PUBLIC_SANITY_DATASET         — اسمDataset (افتراضياً production)
 *  NEXT_PUBLIC_SANITY_API_VERSION     — إصدار API (افتراضياً 2026-01-01)
 *  NEXT_PUBLIC_SANITY_COMMENT_TOKEN   — توكن دقيق الصلاحية (إنشاء تعليق فقط) لنشر تعليقات الزوار
 */
export const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'zes52trp';
export const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const SANITY_API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-01-01';
const SANITY_COMMENT_TOKEN = process.env.NEXT_PUBLIC_SANITY_COMMENT_TOKEN ?? '';

/** هل تم ربط Sanity؟ (وجود معرّف المشروع يكفي للقراءة) */
export const isSanityConfigured = Boolean(SANITY_PROJECT_ID);

let readClient: SanityClient | null = null;

/** عميل القراءة (CDN) — يُستخدم وقت البناء للقائمة والتعليقات المعتمدة */
export function getReadClient(): SanityClient {
  if (!readClient) {
    readClient = createClient({
      projectId: SANITY_PROJECT_ID,
      dataset: SANITY_DATASET,
      apiVersion: SANITY_API_VERSION,
      useCdn: true,
    });
  }
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
