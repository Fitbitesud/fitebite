import { toLatinDigits } from './format';
import type { DeliveryRegion } from './types';

/**
 * سعر التوصيل الثابت لكل منطقة.
 *
 * المنطقة تُحفظ في لوحة التحكم ككائن `{ name, deliveryFee }`، ويُقبل أيضاً الشكل القديم
 * (نص فقط بدون سعر) حتى تعمل الوثائق المنشورة قبل هذا التحديث بلا أي تعديل يدوي؛
 * وفي هذه الحالة يكون سعر التوصيل 0 حتى يُكتب من اللوحة.
 */

/** أي قيمة سعر تالفة (نص، كسر، سالب، فارغ، NaN…) → 0، والقيم الصحيحة تبقى كما هي */
export function normalizeDeliveryFee(value: unknown): number {
  const raw =
    typeof value === 'number'
      ? value
      : Number(toLatinDigits(String(value ?? '')).replace(/[^\d.-]/g, ''));
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return Math.round(raw);
}

/** اسم المنطقة من عنصر لوحة التحكم: نص قديم أو كائن { name } */
function regionNameOf(item: unknown): string {
  if (typeof item === 'string') return item;
  if (!item || typeof item !== 'object' || Array.isArray(item)) return '';
  const rec = item as Record<string, unknown>;
  for (const key of ['name', 'title', 'region', 'label']) {
    const v = rec[key];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return '';
}

/** سعر التوصيل من عنصر لوحة التحكم — يقبل fee أو deliveryFee أو deliveryPrice */
function regionFeeOf(item: unknown): number {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return 0;
  const rec = item as Record<string, unknown>;
  for (const key of ['fee', 'deliveryFee', 'deliveryPrice', 'price']) {
    if (rec[key] !== undefined && rec[key] !== null) return normalizeDeliveryFee(rec[key]);
  }
  return 0;
}

/**
 * تطبيع مناطق التوصيل القادمة من الإعدادات المحلية أو لوحة التحكم:
 * يقبل `['بحري']` و`[{ name: 'بحري', deliveryFee: 2000 }]` معاً،
 * ويزيل المسافات الزائدة والمناطق الفارغة والمكرّرة (اسم المنطقة هو المفتاح).
 */
export function normalizeRegions(raw: unknown): DeliveryRegion[] {
  if (!Array.isArray(raw)) return [];
  const out: DeliveryRegion[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const name = regionNameOf(item).trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push({ name, fee: regionFeeOf(item) });
  }
  return out;
}

/** المنطقة المختارة بالاسم (أو undefined إن لم تُختر / لم تعد موجودة في الإعدادات) */
export function findDeliveryRegion(
  regions: readonly DeliveryRegion[],
  name: string,
): DeliveryRegion | undefined {
  const wanted = String(name ?? '').trim();
  if (!wanted) return undefined;
  return regions.find((r) => r.name === wanted);
}

/** سعر التوصيل الثابت للمنطقة المختارة — 0 إذا لم تُختر منطقة أو لم تُضبط رسوم لها */
export function deliveryFeeFor(regions: readonly DeliveryRegion[], name: string): number {
  return findDeliveryRegion(regions, name)?.fee ?? 0;
}
