import { SITE } from './config';
import { fmt, price } from './format';
import type { CartLine, CustomerInfo, OrderTotals } from './types';

export function computeTotals(lines: CartLine[]): OrderTotals {
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const kcal = lines.reduce((s, l) => s + l.item.macros.kcal * l.qty, 0);
  const protein = lines.reduce((s, l) => s + l.item.macros.protein * l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.item.price * l.qty, 0);
  const delivery = count === 0 || subtotal >= SITE.freeDeliveryAbove ? 0 : SITE.deliveryFee;
  return { count, kcal, protein, subtotal, delivery, total: subtotal + delivery };
}

export function makeOrderNo(): string {
  return `FB-${Date.now().toString().slice(-6)}`;
}

/** بناء رسالة الواتساب المفصّلة للطلب */
export function buildOrderMessage(opts: {
  lines: CartLine[];
  customer: CustomerInfo;
  orderNo: string;
  totals: OrderTotals;
}): string {
  const { lines, customer, orderNo, totals } = opts;
  const now = new Date();
  const date = now.toLocaleDateString('ar-EG-u-nu-latn', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = now.toLocaleTimeString('ar-EG-u-nu-latn', { hour: '2-digit', minute: '2-digit' });

  const L: string[] = [];
  L.push(`*🥗 طلب جديد من موقع ${SITE.nameAr}*`);
  L.push('━━━━━━━━━━━━━━━');
  L.push(`🔖 رقم الطلب: ${orderNo}`);
  L.push(`🕒 ${date} — ${time}`);
  L.push('');
  L.push('*👤 بيانات العميل*');
  L.push(`• الاسم: ${customer.name}`);
  L.push(`• الجوال: ${customer.phone}`);
  L.push(`• المنطقة: ${customer.region}`);
  L.push(`• العنوان: ${customer.address}`);
  if (customer.notes.trim()) L.push(`• ملاحظات: ${customer.notes.trim()}`);
  L.push(`• الدفع: ${customer.payment === 'cod' ? 'كاش عند الاستلام' : 'تحويل بنكي (بنكك)'}`);
  L.push('');
  L.push('*🛒 تفاصيل الطلب*');
  lines.forEach((l, i) => {
    L.push(`${i + 1}) ${l.item.name} × ${l.qty}`);
    L.push(`     سعر الوحدة: ${price(l.item.price)} | 🔥 ${l.item.macros.kcal} سعرة`);
  });
  L.push('━━━━━━━━━━━━━━━');
  L.push(`🍽 عدد الأصناف: ${fmt(totals.count)}`);
  L.push(`🔥 إجمالي السعرات: ${fmt(totals.kcal)} سعرة`);
  L.push(`💪 إجمالي البروتين: ${fmt(totals.protein)} غ`);
  L.push(`🧾 المجموع الفرعي: ${price(totals.subtotal)}`);
  L.push(`🛵 التوصيل: ${totals.delivery === 0 ? 'مجاني ✅' : price(totals.delivery)}`);
  L.push(`💰 *الإجمالي الكلي: ${price(totals.total)}*`);
  L.push('');
  L.push(`_أُرسل تلقائياً من موقع ${SITE.nameAr}_ 🌿`);
  return L.join('\n');
}

export function whatsappLink(text: string): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function openWhatsApp(text: string): void {
  if (typeof window === 'undefined') return;
  window.open(whatsappLink(text), '_blank', 'noopener,noreferrer');
}
