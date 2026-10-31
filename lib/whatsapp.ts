import { DEFAULT_SITE, type SiteData } from './site-data';
import { normalizeDeliveryFee } from './delivery';
import { fmt, price } from './format';
import type { CartLine, CustomerInfo, FulfillmentMethod, OrderTotals } from './types';

/** نص طريقة الاستلام كما يصل في رسالة الواتساب */
export const FULFILLMENT_LABEL: Record<FulfillmentMethod, string> = {
  delivery: 'توصيل',
  pickup: 'استلام من المحل',
};

/** أي قيمة غير معروفة (أو مفقودة) تُعامل كتوصيل حتى لا تتعطل الرسالة */
export const normalizeFulfillment = (v: unknown): FulfillmentMethod =>
  v === 'pickup' ? 'pickup' : 'delivery';

/**
 * إجماليات السلة: قيمة الأكل + سعر التوصيل الثابت للمنطقة المختارة.
 * - `deliveryFee` يُمرَّر من السلة بعد معرفة المنطقة (0 في الاستلام من المحل أو قبل الاختيار).
 * - سلة فارغة لا تُضاف عليها أي رسوم، وأي قيمة تالفة أو سالبة تُعامل كـ 0.
 */
export function computeTotals(lines: CartLine[], deliveryFee = 0): OrderTotals {
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const kcal = lines.reduce((s, l) => s + (l.item.macros?.kcal ?? 0) * l.qty, 0);
  const protein = lines.reduce((s, l) => s + (l.item.macros?.protein ?? 0) * l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.item.price * l.qty, 0);
  const delivery = subtotal > 0 ? normalizeDeliveryFee(deliveryFee) : 0;
  return { count, kcal, protein, subtotal, delivery, total: subtotal + delivery };
}

export function makeOrderNo(): string {
  return `FB-${Date.now().toString().slice(-6)}`;
}

/** بناء رسالة الواتساب المفصّلة للطلب */
export function buildOrderMessage(
  opts: {
    lines: CartLine[];
    customer: CustomerInfo;
    orderNo: string;
    totals: OrderTotals;
  },
  site: SiteData = DEFAULT_SITE
): string {
  const { lines, customer, orderNo, totals } = opts;
  const cur = site.currency;
  /* المنطقة والعنوان اختياريان: سطر يُكتب فقط إذا كتب العميل شيئاً */
  const region = String(customer.region ?? '').trim();
  const address = String(customer.address ?? '').trim();
  const isPickup = normalizeFulfillment(customer.fulfillment) === 'pickup';
  const fulfillmentLabel = isPickup ? FULFILLMENT_LABEL.pickup : FULFILLMENT_LABEL.delivery;
  const now = new Date();
  const date = now.toLocaleDateString('ar-EG-u-nu-latn', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = now.toLocaleTimeString('ar-EG-u-nu-latn', { hour: '2-digit', minute: '2-digit' });

  const L: string[] = [];
  L.push(`*🥗 طلب جديد من موقع ${site.nameAr}*`);
  L.push('━━━━━━━━━━━━━━━');
  L.push(`🔖 رقم الطلب: ${orderNo}`);
  L.push(`🕒 ${date} — ${time}`);
  L.push('');
  L.push('*👤 بيانات العميل*');
  L.push(`• الاسم: ${customer.name}`);
  L.push(`• الجوال: ${customer.phone}`);
  L.push(`• طريقة الاستلام: ${isPickup ? '🏪' : '🛵'} ${fulfillmentLabel}`);
  /* في الاستلام من المحل نكتب عنوان المحل المضبوط في الإعدادات حتى يعرفه العميل */
  if (isPickup) L.push(`• مكان الاستلام: ${site.address}`);
  /* موقع الاستلام وتفاصيله اختياريان: يظهران فقط في التوصيل وإذا كتب العميل شيئاً */
  if (!isPickup && region) L.push(`• المنطقة: ${region}`);
  if (!isPickup && address) L.push(`• العنوان: ${address}`);
  if (customer.notes.trim()) L.push(`• ملاحظات: ${customer.notes.trim()}`);
  L.push(`• الدفع: ${customer.payment === 'cod' ? 'كاش عند الاستلام' : 'تحويل بنكي (بنكك)'}`);
  L.push('');
  L.push('*🛒 تفاصيل الطلب*');
  lines.forEach((l, i) => {
    L.push(`${i + 1}) ${l.item.name} × ${l.qty}`);
    L.push(`     سعر الوحدة: ${price(l.item.price, cur)} | 🔥 ${l.item.macros?.kcal ?? 0} سعرة`);
  });
  L.push('━━━━━━━━━━━━━━━');
  L.push(`🍽 عدد الأصناف: ${fmt(totals.count)}`);
  L.push(`🧾 المجموع الفرعي: ${price(totals.subtotal, cur)}`);
  /* سطر التوصيل:
     - استلام من المحل → يُستلم من المحل بلا رسوم.
     - توصيل مع منطقة → سعر التوصيل الثابت للمنطقة (أو «بدون رسوم» إذا كان 0).
     - توصيل بلا منطقة → نص التوصيل الاحتياطي من الإعدادات مع تنبيه أن السعر يُحدَّد حسب المنطقة. */
  const deliveryFee = normalizeDeliveryFee(totals.delivery);
  if (isPickup) {
    L.push('🏪 الاستلام: من المحل');
  } else if (region) {
    L.push(
      `🛵 التوصيل (${region}): ${deliveryFee > 0 ? price(deliveryFee, cur) : 'بدون رسوم'}`,
    );
  } else {
    L.push(`🛵 التوصيل: ${site.deliveryNote} — تُحدَّد حسب المنطقة`);
  }
  L.push(`💰 *الإجمالي الكلي: ${price(totals.total, cur)}*`);
  L.push('');
  L.push(`_أُرسل تلقائياً من موقع ${site.nameAr}_ 🌿`);
  return L.join('\n');
}

export function whatsappLink(text: string, site: SiteData = DEFAULT_SITE): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function openWhatsApp(text: string, site: SiteData = DEFAULT_SITE): void {
  if (typeof window === 'undefined') return;
  window.open(whatsappLink(text, site), '_blank', 'noopener,noreferrer');
}
