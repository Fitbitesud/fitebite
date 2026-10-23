import { toLatinDigits } from './format';
import { getWriteClient } from './sanity/client';
import { DEFAULT_SITE, type SiteData } from './site-data';
import { openWhatsApp, whatsappLink } from './whatsapp';

/**
 * استشارات الزبائن الغذائية والصحية — صفحة `/consultations`.
 * يكتب الزبون استشارته وبياناته فتُرسل كرسالة واتساب مرتّبة إلى رقم صاحب الموقع
 * المضبوط في الإعدادات، مع حفظ نسخة في لوحة التحكم (إن ضُبط توكن الكتابة)
 * وحفظ سجل محلي على جهاز الزبون لسهولة الرجوع إليها.
 */

export const CONSULTATION_GOALS = [
  { id: 'cutting', label: 'تنشيف وخسارة وزن' },
  { id: 'bulking', label: 'ضخامة وبناء عضل' },
  { id: 'maintain', label: 'محافظة ونمط صحي' },
  { id: 'packages', label: 'اختيار الباقة المناسبة' },
  { id: 'dietary', label: 'حساسية غذائية / نظام خاص' },
  { id: 'general', label: 'استشارة عامة' },
] as const;

export type ConsultationGoalId = (typeof CONSULTATION_GOALS)[number]['id'];

export interface ConsultationInput {
  name: string;
  phone: string;
  goal: ConsultationGoalId;
  age?: string;
  weight?: string;
  height?: string;
  message: string;
}

export interface SavedConsultation extends ConsultationInput {
  id: string;
  refNo: string;
  createdAt: string;
}

const STORAGE_KEY = 'fitbite.consultations';

export function goalLabel(goalId: string): string {
  return CONSULTATION_GOALS.find((g) => g.id === goalId)?.label ?? 'استشارة عامة';
}

export function makeConsultationNo(): string {
  return `FC-${Date.now().toString().slice(-6)}`;
}

/** التحقق من حقول نموذج الاستشارة (الاسم + رقم الهاتف + نص الاستشارة مطلوبة) */
export function validateConsultation(input: ConsultationInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (input.name.trim().length < 3) {
    errors.name = 'الرجاء كتابة الاسم الكامل (3 أحرف على الأقل)';
  }
  const phoneDigits = toLatinDigits(input.phone).replace(/\D/g, '');
  if (phoneDigits.length < 7) {
    errors.phone = 'رقم الهاتف غير صحيح — اكتب الرقم كاملاً (مثال: 0912345678)';
  }
  if (input.message.trim().length < 10) {
    errors.message = 'الرجاء كتابة تفاصيل الاستشارة بوضوح (10 أحرف على الأقل)';
  }
  return errors;
}

/** بناء رسالة الواتساب المفصّلة للاستشارة الموجهة لصاحب الموقع */
export function buildConsultationMessage(
  input: ConsultationInput,
  refNo: string,
  site: SiteData = DEFAULT_SITE,
): string {
  const now = new Date();
  const date = now.toLocaleDateString('ar-EG-u-nu-latn', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = now.toLocaleTimeString('ar-EG-u-nu-latn', { hour: '2-digit', minute: '2-digit' });

  const age = toLatinDigits(String(input.age ?? '')).trim();
  const weight = toLatinDigits(String(input.weight ?? '')).trim();
  const height = toLatinDigits(String(input.height ?? '')).trim();
  const phone = toLatinDigits(input.phone).trim();

  const L: string[] = [];
  L.push(`*📋 استشارة جديدة من موقع ${site.nameAr}*`);
  L.push('━━━━━━━━━━━━━━━');
  L.push(`🔖 رقم الاستشارة: ${refNo}`);
  L.push(`🕒 ${date} — ${time}`);
  L.push('');
  L.push('*👤 بيانات المرسل*');
  L.push(`• الاسم: ${input.name.trim()}`);
  L.push(`• الهاتف: ${phone}`);
  L.push(`• الموضوع: ${goalLabel(input.goal)}`);

  const metrics: string[] = [];
  if (age) metrics.push(`العمر: ${age}`);
  if (weight) metrics.push(`الوزن: ${weight} كغ`);
  if (height) metrics.push(`الطول: ${height} سم`);
  if (metrics.length > 0) {
    L.push(`• البيانات البدنية: ${metrics.join(' | ')}`);
  }

  L.push('');
  L.push('*💬 تفاصيل الاستشارة*');
  L.push(input.message.trim());
  L.push('━━━━━━━━━━━━━━━');
  L.push(`_أُرسلت من صفحة الاستشارات في موقع ${site.nameAr}_ 🌿`);
  return L.join('\n');
}

function isSavedConsultation(v: unknown): v is SavedConsultation {
  if (!v || typeof v !== 'object') return false;
  const c = v as Partial<SavedConsultation>;
  return (
    typeof c.id === 'string' &&
    typeof c.refNo === 'string' &&
    typeof c.name === 'string' &&
    typeof c.phone === 'string' &&
    typeof c.message === 'string' &&
    typeof c.createdAt === 'string'
  );
}

export function getSavedConsultations(): SavedConsultation[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedConsultation);
  } catch {
    return [];
  }
}

function persistConsultationLocal(entry: SavedConsultation): void {
  if (typeof window === 'undefined') return;
  try {
    const next = [entry, ...getSavedConsultations()].slice(0, 10);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // تجاهل امتلاء التخزين المحلي بهدوء
  }
}

export interface SubmitConsultationResult {
  entry: SavedConsultation;
  whatsappUrl: string;
  syncedToSanity: boolean;
}

/**
 * حفظ الاستشارة وإرسالها لصاحب الموقع:
 * 1) حفظ مسودة في لوحة التحكم Sanity إن توفر توكن الكتابة.
 * 2) حفظ نسخة في سجل الجهاز المحلي.
 * 3) فتح محادثة واتساب مباشرة مع صاحب الموقع بالرسالة المنسّقة.
 */
export async function submitConsultation(
  input: ConsultationInput,
  site: SiteData = DEFAULT_SITE,
  options: { openWindow?: boolean } = { openWindow: true },
): Promise<SubmitConsultationResult> {
  const errs = validateConsultation(input);
  if (Object.keys(errs).length > 0) {
    throw new Error('Invalid consultation input');
  }

  const refNo = makeConsultationNo();
  const createdAt = new Date().toISOString();
  const cleanEntry: SavedConsultation = {
    id: `consult-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    refNo,
    createdAt,
    name: input.name.trim(),
    phone: toLatinDigits(input.phone).trim(),
    goal: input.goal,
    ...(input.age?.trim() ? { age: toLatinDigits(input.age).trim() } : {}),
    ...(input.weight?.trim() ? { weight: toLatinDigits(input.weight).trim() } : {}),
    ...(input.height?.trim() ? { height: toLatinDigits(input.height).trim() } : {}),
    message: input.message.trim(),
  };

  let syncedToSanity = false;
  const write = getWriteClient();
  if (write) {
    try {
      await write.create({
        _id: `drafts.consultation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        _type: 'consultation',
        name: cleanEntry.name,
        phone: cleanEntry.phone,
        goal: goalLabel(cleanEntry.goal),
        age: cleanEntry.age ?? '',
        weight: cleanEntry.weight ?? '',
        height: cleanEntry.height ?? '',
        message: cleanEntry.message,
        status: 'new',
        createdAt,
      });
      syncedToSanity = true;
    } catch (err) {
      console.error('Sanity consultation create failed — continuing via WhatsApp:', err);
    }
  }

  persistConsultationLocal(cleanEntry);

  const msg = buildConsultationMessage(cleanEntry, refNo, site);
  const whatsappUrl = whatsappLink(msg, site);
  if (options.openWindow !== false) {
    openWhatsApp(msg, site);
  }

  return { entry: cleanEntry, whatsappUrl, syncedToSanity };
}
