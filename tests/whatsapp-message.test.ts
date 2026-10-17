import { afterEach, describe, expect, it, mock } from 'bun:test';
import { fmt } from '../lib/format';
import {
  buildOrderMessage,
  computeTotals,
  FULFILLMENT_LABEL,
  makeOrderNo,
  normalizeFulfillment,
  openWhatsApp,
  whatsappLink,
} from '../lib/whatsapp';
import type { CustomerInfo } from '../lib/types';
import { fakeItem, line, menuItem, SITE } from './helpers';

/** طلب توصيل مكتمل البيانات (المنطقة والعنوان اختياريان لكنهما مكتوبان هنا) */
const customer: CustomerInfo = {
  name: 'أحمد محمد',
  phone: '0912345678',
  region: 'أم درمان',
  address: 'حي الملازمين، منزل 12',
  notes: '',
  payment: 'cod',
  fulfillment: 'delivery',
};

const lines = [line(menuItem('m9'), 2), line(menuItem('m10'), 1)];
const totals = computeTotals(lines);
const build = (over: Partial<CustomerInfo> = {}, l = lines, t = totals) =>
  buildOrderMessage({ lines: l, customer: { ...customer, ...over }, orderNo: 'FB-123456', totals: t }, SITE);

describe('buildOrderMessage — content', () => {
  const msg = build();

  it('has the order number, customer details and payment method', () => {
    expect(msg).toContain('رقم الطلب: FB-123456');
    expect(msg).toContain('الاسم: أحمد محمد');
    expect(msg).toContain('الجوال: 0912345678');
    expect(msg).toContain('المنطقة: أم درمان');
    expect(msg).toContain('العنوان: حي الملازمين، منزل 12');
    expect(msg).toContain('كاش عند الاستلام');
  });

  it('lists every line with quantity, unit price and kcal', () => {
    expect(msg).toContain('1) باول الشوفان بالتوت × 2');
    expect(msg).toContain('سعر الوحدة: 6,500 ج.س | 🔥 340 سعرة');
    expect(msg).toContain('2) بان كيك البروتين × 1');
    expect(msg).toContain('سعر الوحدة: 7,500 ج.س | 🔥 410 سعرة');
  });

  it('prints the same money totals the cart shows — but no kcal/protein totals', () => {
    expect(msg).toContain('عدد الأصناف: 3');
    expect(msg).not.toContain('إجمالي السعرات');
    expect(msg).not.toContain('إجمالي البروتين');
    expect(msg).toContain('المجموع الفرعي: 20,500 ج.س');
    expect(msg).toContain('الإجمالي الكلي: 20,500 ج.س'); // no delivery fee on top
  });

  it('writes the delivery note instead of a fee: «التوصيل: مع مندوب التوصيل»', () => {
    expect(msg).toContain('🛵 التوصيل: مع مندوب التوصيل');
    expect(msg).not.toContain('مجاني');
    expect(msg).not.toContain('2,000 ج.س');
  });

  it('keeps the money story food-only at any cart size (even past the old 40,000 threshold)', () => {
    const big = [line(fakeItem({ price: 40000 }), 1)];
    const m = build({}, big, computeTotals(big));
    expect(m).toContain('الإجمالي الكلي: 40,000 ج.س');
    expect(m).toContain('🛵 التوصيل: مع مندوب التوصيل');
    expect(m).not.toContain('مجاني ✅');
    expect(m).not.toContain('45,000'); // the old +2,000 fee must not come back
  });

  it('uses the delivery wording saved in the dashboard', () => {
    const m = buildOrderMessage(
      { lines, customer, orderNo: 'FB-1', totals },
      { ...SITE, deliveryNote: 'مع مندوبنا داخل أم درمان' },
    );
    expect(m).toContain('🛵 التوصيل: مع مندوبنا داخل أم درمان');
  });

  it('bank transfer label for payment=bank', () => {
    expect(build({ payment: 'bank' })).toContain('تحويل بنكي (بنكك)');
  });

  it('numbers inside the message add up (unit prices × qty = grand total, with no fee added)', () => {
    const text = build();
    const re = /(\d+)\) .+ × (\d+)\n\s+سعر الوحدة: ([\d,]+) /g;
    let sub = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) sub += Number(m[2]) * Number(m[3].replace(/,/g, ''));
    const grand = /الإجمالي الكلي: ([\d,]+) /.exec(text)!;
    expect(Number(grand[1].replace(/,/g, ''))).toBe(sub);
  });

  it('uses the grand total passed in — message total equals computeTotals().total for many carts', () => {
    for (const qty of [1, 2, 5, 9]) {
      const l = [line(menuItem('m13'), qty)];
      const t = computeTotals(l);
      expect(build({}, l, t)).toContain(`الإجمالي الكلي: ${fmt(t.total)} ج.س`);
    }
  });

  it('uses the currency and name from the site settings', () => {
    const m = buildOrderMessage(
      { lines, customer, orderNo: 'FB-1', totals },
      { ...SITE, currency: 'SDG', nameAr: 'اسم آخر' },
    );
    expect(m).toContain('20,500 SDG');
    expect(m).toContain('اسم آخر');
    expect(m).not.toContain('ج.س');
  });
});

describe('buildOrderMessage — notes', () => {
  it('omits the notes line when blank or whitespace-only', () => {
    expect(build({ notes: '' })).not.toContain('ملاحظات');
    expect(build({ notes: '   \n  ' })).not.toContain('ملاحظات');
  });
  it('includes trimmed notes', () => {
    expect(build({ notes: '  بدون بصل  ' })).toContain('• ملاحظات: بدون بصل\n');
  });
});

describe('buildOrderMessage — pickup location is optional (only name + phone are required)', () => {
  it('omits the region and address lines when the customer left them empty', () => {
    const m = build({ region: '', address: '' });
    expect(m).not.toContain('المنطقة');
    expect(m).not.toContain('العنوان');
    expect(m).toContain('الاسم: أحمد محمد');
    expect(m).toContain('الجوال: 0912345678');
    expect(m).toContain('الإجمالي الكلي: 20,500 ج.س');
  });

  it('treats whitespace-only region/address as empty', () => {
    const m = build({ region: '   ', address: ' \n ' });
    expect(m).not.toContain('• المنطقة');
    expect(m).not.toContain('• العنوان');
  });

  it('writes whichever one the customer did fill, on its own', () => {
    expect(build({ address: '' })).toContain('• المنطقة: أم درمان');
    expect(build({ region: '' })).toContain('• العنوان: حي الملازمين، منزل 12');
  });

  it('trims the values it does write', () => {
    expect(build({ region: '  بحري  ' })).toContain('• المنطقة: بحري\n');
  });
});

describe('buildOrderMessage — place of collection: توصيل / استلام من المحل', () => {
  it('delivery is the default: «طريقة الاستلام: 🛵 توصيل» plus the courier note', () => {
    const m = build();
    expect(m).toContain('• طريقة الاستلام: 🛵 توصيل');
    expect(m).not.toContain('استلام من المحل');
    expect(m).not.toContain('مكان الاستلام:');
    expect(m).toContain('🛵 التوصيل: مع مندوب التوصيل');
  });

  it('pickup names the store from the settings and replaces the courier line', () => {
    const m = build({ fulfillment: 'pickup', region: '', address: '' });
    expect(m).toContain(`• طريقة الاستلام: 🏪 ${FULFILLMENT_LABEL.pickup}`);
    expect(m).toContain(`• مكان الاستلام: ${SITE.address}`);
    expect(m).toContain('🏪 الاستلام: من المحل');
    expect(m).not.toContain('🛵 التوصيل');
  });

  it('pickup ignores a region/address left over from delivery mode', () => {
    const m = build({ fulfillment: 'pickup' }); // region + address are still filled
    expect(m).not.toContain('• المنطقة');
    expect(m).not.toContain('• العنوان');
    expect(m).toContain(`• مكان الاستلام: ${SITE.address}`);
  });

  it('pickup uses the store address saved in the dashboard', () => {
    const m = buildOrderMessage(
      { lines, customer: { ...customer, fulfillment: 'pickup' }, orderNo: 'FB-1', totals },
      { ...SITE, address: 'الرياض — شارع 15' },
    );
    expect(m).toContain('• مكان الاستلام: الرياض — شارع 15');
    expect(m).toContain('🏪 الاستلام: من المحل');
  });

  it('a missing or unknown fulfillment value falls back to delivery', () => {
    const partial = { ...customer } as unknown as Record<string, unknown>;
    delete partial.fulfillment;
    expect(
      buildOrderMessage({ lines, customer: partial as CustomerInfo, orderNo: 'FB-1', totals }, SITE),
    ).toContain('• طريقة الاستلام: 🛵 توصيل');
    expect(
      buildOrderMessage(
        { lines, customer: { ...customer, fulfillment: 'anything' as never }, orderNo: 'FB-1', totals },
        SITE,
      ),
    ).toContain('• طريقة الاستلام: 🛵 توصيل');
  });

  it('normalizeFulfillment maps any input onto the two known options', () => {
    expect(normalizeFulfillment('pickup')).toBe('pickup');
    expect(normalizeFulfillment('delivery')).toBe('delivery');
    expect(normalizeFulfillment(undefined)).toBe('delivery');
    expect(normalizeFulfillment('')).toBe('delivery');
    expect(normalizeFulfillment(null)).toBe('delivery');
  });

  it('both options keep the money story unchanged (no fee is added for either)', () => {
    for (const fulfillment of ['delivery', 'pickup'] as const) {
      const m = build({ fulfillment });
      expect(m).toContain('المجموع الفرعي: 20,500 ج.س');
      expect(m).toContain('الإجمالي الكلي: 20,500 ج.س');
    }
  });
});

describe('whatsappLink — recipient number', () => {
  it('goes to the configured number and nothing else', () => {
    const url = new URL(whatsappLink('hi', { ...SITE, whatsapp: '249116642510' }));
    expect(url.host).toBe('wa.me');
    expect(url.pathname).toBe('/249116642510');
  });

  it('uses whichever site object is passed', () => {
    const url = new URL(whatsappLink('hi', { ...SITE, whatsapp: '249912345678' }));
    expect(url.pathname).toBe('/249912345678');
  });

  it('message survives URL encoding exactly (emoji, newlines, & # % + quotes)', () => {
    const tricky = build({
      name: 'علي & فاطمة',
      address: 'شارع #5 — 50% خصم + "بوابة" <زرقاء>',
      notes: 'سطر1\nسطر2 ?x=1&y=2',
    });
    const url = new URL(whatsappLink(tricky, SITE));
    expect(url.searchParams.get('text')).toBe(tricky);
  });
});

describe('openWhatsApp', () => {
  const g = globalThis as any;
  afterEach(() => delete g.window);

  it('opens the link in a new tab without leaking the opener', () => {
    const open = mock(() => null);
    g.window = { open };
    openWhatsApp('hello', { ...SITE, whatsapp: '249116642510' });
    expect(open).toHaveBeenCalledTimes(1);
    const [href, target, features] = open.mock.calls[0] as unknown as string[];
    expect(new URL(href).pathname).toBe('/249116642510');
    expect(new URL(href).searchParams.get('text')).toBe('hello');
    expect(target).toBe('_blank');
    expect(features).toBe('noopener,noreferrer');
  });

  it('does nothing (no crash) when there is no window, e.g. during SSR', () => {
    delete g.window;
    expect(() => openWhatsApp('x', SITE)).not.toThrow();
  });
});

describe('makeOrderNo', () => {
  it('has the FB-###### format', () => {
    expect(makeOrderNo()).toMatch(/^FB-\d{6}$/);
  });
  it('keeps leading zeros (always 6 digits)', () => {
    const real = Date.now;
    Date.now = () => 1_700_000_000_042; // last six digits = 000042
    try {
      expect(makeOrderNo()).toBe('FB-000042');
    } finally {
      Date.now = real;
    }
  });
});
