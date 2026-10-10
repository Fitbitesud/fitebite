/**
 * Browser tests for the real cart: CartContext + CartDrawer + Menu, rendered in headless Chromium.
 *
 * Needs `playwright` + a Chromium build. If Playwright is not installed the whole file is skipped.
 * The bundle swaps framer-motion / next/link / Sanity for tiny stubs (see build.ts and stubs/).
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, setDefaultTimeout } from 'bun:test';
import path from 'node:path';
import { MENU_SYNC } from '../../lib/menu';
import { buildHarness, OUT_DIR } from './build';

setDefaultTimeout(30_000);

let chromium: any = null;
try {
  ({ chromium } = await import('playwright'));
} catch {
  /* Playwright not installed → tests below are skipped */
}

const HTML = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head>
<body><div id="root"></div><script type="module" src="/harness.js"></script></body></html>`;

let server: ReturnType<typeof Bun.serve>;
let browser: any;
let baseUrl = '';
const contexts: any[] = [];

beforeAll(async () => {
  if (!chromium) return;
  await buildHarness();
  server = Bun.serve({
    port: 0,
    fetch(req) {
      const { pathname } = new URL(req.url);
      if (pathname === '/harness.js') return new Response(Bun.file(path.join(OUT_DIR, 'harness.js')));
      return new Response(HTML, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    },
  });
  baseUrl = `http://localhost:${server.port}/`;
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
});

afterAll(async () => {
  await browser?.close();
  server?.stop(true);
});

afterEach(async () => {
  while (contexts.length) await contexts.pop().close();
});

/* ───────────────────────── helpers ───────────────────────── */

interface Opts {
  /** raw string placed in localStorage["fitbite_cart_v1"] before the app starts */
  storage?: string;
  /** what the Sanity "siteSettings" document contains */
  sanityDoc?: unknown;
  /** what the Sanity menu query returns */
  sanityMenu?: unknown;
}

async function openPage(opts: Opts = {}) {
  const ctx = await browser.newContext({ locale: 'ar-EG', viewport: { width: 1200, height: 900 } });
  contexts.push(ctx);
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e: Error) => errors.push(e.message));
  await page.addInitScript((o: Opts) => {
    const w = window as any;
    w.__SANITY_DOC__ = o.sanityDoc;
    w.__SANITY_MENU__ = o.sanityMenu;
    w.__opened = [];
    w.open = (...args: unknown[]) => {
      w.__opened.push(args);
      return null;
    };
    // seed storage only on the first load of this tab, so reload tests see the app's own writes
    try {
      if (o.storage !== undefined && !sessionStorage.getItem('__seeded')) {
        localStorage.setItem('fitbite_cart_v1', o.storage);
        sessionStorage.setItem('__seeded', '1');
      }
    } catch {}
  }, opts);
  await page.goto(baseUrl);
  await page.waitForFunction(() => (window as any).__ready && (window as any).__cart);
  await page.waitForTimeout(150); // let the hydration / live-fetch effects settle
  return { page, errors };
}

type Page = Awaited<ReturnType<typeof openPage>>['page'];

const act = async (page: Page, fn: 'add' | 'inc' | 'dec' | 'remove' | 'clear', id = '') => {
  await page.evaluate(([f, i]: string[]) => (window as any).__cart[f](i), [fn, id]);
  await page.waitForTimeout(40);
};
const openCart = async (page: Page) => {
  await page.evaluate(() => (window as any).__cart.openCart());
  await page.waitForTimeout(40);
};
const state = (page: Page) =>
  page.evaluate(() => {
    const c = (window as any).__cart;
    return {
      lines: c.lines.map((l: any) => ({ id: l.item._id, name: l.item.name, price: l.item.price, qty: l.qty })),
      totals: c.totals,
    };
  });
const opened = (page: Page) => page.evaluate(() => (window as any).__opened as unknown[][]);
const drawerText = (page: Page) => page.locator('aside[role=dialog]').innerText();

const byPrice = (p: number) => {
  const i = MENU_SYNC.items.find((x) => x.price === p);
  if (!i) throw new Error(`no menu item priced ${p}`);
  return i;
};
const M9 = MENU_SYNC.items.find((i) => i._id === 'm9')!; // 6,500
const M10 = MENU_SYNC.items.find((i) => i._id === 'm10')!; // 7,500
const n = (s: string) => Number(s.replace(/[^\d]/g, ''));

async function fillForm(page: Page, over: Partial<Record<'name' | 'phone' | 'address' | 'notes', string>> & { region?: string } = {}) {
  const v = { name: 'أحمد محمد', phone: '0912345678', address: 'حي الملازمين، منزل 12', notes: '', region: 'أم درمان', ...over };
  await page.getByPlaceholder('الاسم الكامل *').fill(v.name);
  await page.getByPlaceholder('0912345678 *').fill(v.phone);
  if (v.region) await page.locator('aside select').selectOption(v.region);
  await page.getByPlaceholder('العنوان: رقم المنزل / أقرب معلم *').fill(v.address);
  if (v.notes) await page.getByPlaceholder(/ملاحظات للطلب/).fill(v.notes);
}
const submitBtn = (page: Page) => page.getByRole('button', { name: /إتمام الطلب عبر واتساب/ });

/** Adds m9×2 + m10×1 (subtotal 20,500 → delivery 2,000 → total 22,500), opens the drawer, fills the form. */
async function readyToOrder(opts: Opts = {}) {
  const ctx = await openPage(opts);
  await act(ctx.page, 'add', 'm9');
  await act(ctx.page, 'add', 'm9');
  await act(ctx.page, 'add', 'm10');
  await openCart(ctx.page);
  await fillForm(ctx.page);
  return ctx;
}

const d = chromium ? describe : describe.skip;

/* ───────────────────────── cart state & totals ───────────────────────── */

d('cart — state and totals', () => {
  it('starts empty with all-zero totals', async () => {
    const { page } = await openPage();
    const s = await state(page);
    expect(s.lines).toEqual([]);
    expect(s.totals).toEqual({ count: 0, kcal: 0, protein: 0, subtotal: 0, delivery: 0, total: 0 });
  });

  it('add / inc / dec / remove / clear behave and totals follow', async () => {
    const { page } = await openPage();
    await act(page, 'add', 'm9');
    await act(page, 'add', 'm9');
    await act(page, 'add', 'm10');
    let s = await state(page);
    expect(s.lines.map((l: any) => [l.id, l.qty])).toEqual([['m9', 2], ['m10', 1]]);
    expect(s.totals).toMatchObject({ count: 3, subtotal: 20500, delivery: 2000, total: 22500 });

    await act(page, 'inc', 'm10');
    expect((await state(page)).totals.subtotal).toBe(28000);

    await act(page, 'dec', 'm9');
    s = await state(page);
    expect(s.lines.find((l: any) => l.id === 'm9').qty).toBe(1);
    expect(s.totals.subtotal).toBe(6500 + 7500 * 2);

    await act(page, 'dec', 'm9'); // qty 1 → 0 removes the line
    expect((await state(page)).lines.map((l: any) => l.id)).toEqual(['m10']);

    await act(page, 'dec', 'm9'); // not in cart → must not create a negative line
    expect((await state(page)).lines.map((l: any) => l.id)).toEqual(['m10']);

    await act(page, 'remove', 'm10');
    expect((await state(page)).totals.total).toBe(0);

    await act(page, 'add', 'm13');
    await act(page, 'clear');
    expect((await state(page)).lines).toEqual([]);
  });

  it('removing a line removes every unit of it from the totals', async () => {
    const { page } = await openPage();
    for (let i = 0; i < 4; i++) await act(page, 'add', 'm9');
    await act(page, 'remove', 'm9');
    expect((await state(page)).totals.subtotal).toBe(0);
  });

  it('free-delivery boundary in the real cart: 39,500 pays delivery, 40,000 is free', async () => {
    const five = byPrice(5000);
    const { page } = await openPage();
    for (let i = 0; i < 7; i++) await act(page, 'add', five._id); // 35,000
    await act(page, 'add', byPrice(4500)._id); // 39,500
    let t = (await state(page)).totals;
    expect([t.subtotal, t.delivery, t.total]).toEqual([39500, 2000, 41500]);

    await act(page, 'remove', byPrice(4500)._id);
    await act(page, 'add', five._id); // 8 × 5,000 = 40,000 exactly
    t = (await state(page)).totals;
    expect([t.subtotal, t.delivery, t.total]).toEqual([40000, 0, 40000]);
  });

  it('the drawer shows the same numbers as the cart state', async () => {
    const { page } = await openPage();
    await act(page, 'add', 'm9');
    await act(page, 'add', 'm9');
    await act(page, 'add', 'm10');
    await openCart(page);
    const text = await drawerText(page);
    expect(text).toContain('13,000 ج.س'); // m9 line total
    expect(text).toContain('7,500 ج.س'); // m10 line total
    expect(text).toContain('20,500 ج.س'); // subtotal
    expect(text).toContain('2,000 ج.س'); // delivery
    expect(text).toContain('22,500 ج.س'); // total
    expect(text).toContain('أضف بقيمة 19,500 ج.س للحصول على توصيل مجاني'); // 40,000 − 20,500
    expect(await submitBtn(page).innerText()).toContain('22,500 ج.س');
  });

  it('shows free delivery and hides the "add more" hint once the subtotal reaches 40,000', async () => {
    const { page } = await openPage();
    for (let i = 0; i < 8; i++) await act(page, 'add', byPrice(5000)._id);
    await openCart(page);
    const text = await drawerText(page);
    expect(text).toContain('مجاني');
    expect(text).not.toContain('للحصول على توصيل مجاني');
    expect(await submitBtn(page).innerText()).toContain('40,000 ج.س');
  });

  it('survives a page reload (saved in localStorage)', async () => {
    const { page } = await openPage();
    await act(page, 'add', 'm9');
    await act(page, 'add', 'm9');
    await page.reload();
    await page.waitForFunction(() => (window as any).__cart);
    await page.waitForTimeout(150);
    const s = await state(page);
    expect(s.lines.map((l: any) => [l.id, l.qty])).toEqual([['m9', 2]]);
    expect(s.totals.subtotal).toBe(13000);
  });

  it('adding from a menu card puts that meal, at that price, in the cart', async () => {
    const { page } = await openPage();
    const card = page.locator('article').first();
    const name = (await card.locator('h3').innerText()).trim();
    const price = n(await card.locator('span.text-xl').innerText());
    await card.getByRole('button', { name: /أضف/ }).click();
    await page.waitForTimeout(60);
    const s = await state(page);
    expect(s.lines).toHaveLength(1);
    expect(s.lines[0].name).toBe(name);
    expect(s.totals.subtotal).toBe(price);
  });
});

/* ───────────────── meals managed from the Sanity dashboard ───────────────── */

d('cart — meals that come from the Sanity dashboard', () => {
  // Shape/values copied from the live dashboard: one meal, 30,000, id is a Sanity uuid.
  const dashboardMenu = {
    categories: [{ _id: 'cat1', slug: 'meals', name: 'وجبات', icon: 'flame', order: 1 }],
    items: [
      {
        _id: '27a8fe1a-bf1d-452d-a2b7-332f68153ff6',
        slug: 'rice-chicken',
        name: 'طبق ارز و فراخ',
        description: 'وصف',
        price: 30000,
        categorySlug: 'meals',
        image: '',
        macros: { kcal: 650, protein: 45, carbs: 70, fat: 15 },
        tags: [],
        popular: false,
        available: true,
      },
    ],
  };

  it('a meal added from the live menu appears in the cart with its own price', async () => {
    const { page } = await openPage({ sanityMenu: dashboardMenu });
    const card = page.locator('article').first();
    expect((await card.locator('h3').innerText()).trim()).toBe('طبق ارز و فراخ');
    await card.getByRole('button', { name: /أضف/ }).click();
    await page.waitForTimeout(60);
    const s = await state(page);
    expect(s.lines).toHaveLength(1);
    expect(s.totals.subtotal).toBe(30000);
    expect(s.totals.count).toBe(1);
  });

  it('after adding a live-menu meal, the cart drawer is not empty and shows it', async () => {
    const { page } = await openPage({ sanityMenu: dashboardMenu });
    await page.locator('article').first().getByRole('button', { name: /أضف/ }).click();
    await openCart(page);
    const text = await drawerText(page);
    expect(text).not.toContain('سلتك فارغة');
    expect(text).toContain('طبق ارز و فراخ');
    expect(text).toContain('30,000 ج.س');
  });
});

/* ───────────────── damaged / old data in localStorage ───────────────── */

d('cart — damaged saved cart', () => {
  it('invalid JSON is ignored (empty cart, no crash)', async () => {
    const { page, errors } = await openPage({ storage: '{not json' });
    expect((await state(page)).lines).toEqual([]);
    expect(errors).toEqual([]);
  });

  for (const raw of ['null', '[]', '5', '"abc"', 'true']) {
    it(`a saved value of ${raw} does not crash the app`, async () => {
      const { page, errors } = await openPage({ storage: raw });
      expect(errors).toEqual([]);
      await act(page, 'add', 'm9'); // the cart must still work
      expect((await state(page)).lines.map((l: any) => l.id)).toEqual(['m9']);
    });
  }

  it('items that no longer exist in the menu are ignored in the totals', async () => {
    const { page } = await openPage({ storage: JSON.stringify({ 'deleted-item': 3, m9: 1 }) });
    const s = await state(page);
    expect(s.lines.map((l: any) => l.id)).toEqual(['m9']);
    expect(s.totals.subtotal).toBe(6500);
  });

  const bad: Array<[string, string]> = [
    ['negative quantity', '{"m9":-3}'],
    ['zero quantity', '{"m9":0}'],
    ['quantity saved as text', '{"m9":"2"}'],
    ['non-numeric quantity', '{"m9":"abc"}'],
    ['fractional quantity', '{"m9":1.5}'],
  ];
  for (const [label, raw] of bad) {
    it(`${label} in the saved cart never corrupts the totals`, async () => {
      const { page } = await openPage({ storage: raw });
      const { lines, totals } = await state(page);
      for (const v of Object.values(totals)) {
        expect(typeof v).toBe('number');
        expect(Number.isFinite(v)).toBe(true);
        expect(v as number).toBeGreaterThanOrEqual(0);
      }
      for (const l of lines) expect(Number.isInteger(l.qty) && l.qty > 0).toBe(true);
    });
  }
});

/* ───────────────────────── checkout form ───────────────────────── */

d('checkout — validation', () => {
  it('an empty form shows every error and does not open WhatsApp', async () => {
    const { page } = await openPage();
    await act(page, 'add', 'm9');
    await openCart(page);
    await submitBtn(page).click();
    const text = await drawerText(page);
    expect(text).toContain('الرجاء كتابة الاسم الكامل');
    expect(text).toContain('رقم جوال سوداني غير صحيح');
    expect(text).toContain('اختر منطقة التوصيل');
    expect(text).toContain('اكتب عنواناً واضحاً');
    expect(await opened(page)).toHaveLength(0);
  });

  it('name needs 3+ characters and address 6+', async () => {
    const { page } = await readyToOrder();
    await fillForm(page, { name: 'ab', address: '12345' });
    await submitBtn(page).click();
    let text = await drawerText(page);
    expect(text).toContain('الرجاء كتابة الاسم الكامل');
    expect(text).toContain('اكتب عنواناً واضحاً');
    expect(await opened(page)).toHaveLength(0);

    await fillForm(page, { name: 'abc', address: '123456' });
    await submitBtn(page).click();
    expect(await opened(page)).toHaveLength(1);
  });

  const accepted = ['0912345678', '+249912345678', '249912345678', '912345678', '0912 345 678', '091-234-5678'];
  for (const phone of accepted) {
    it(`accepts the phone "${phone}"`, async () => {
      const { page } = await readyToOrder();
      await fillForm(page, { phone });
      await submitBtn(page).click();
      expect(await opened(page)).toHaveLength(1);
    });
  }

  const rejected = ['', '0112345678', '091234567', '09123456789', 'abcdefghij', '12345'];
  for (const phone of rejected) {
    it(`rejects the phone "${phone}"`, async () => {
      const { page } = await readyToOrder();
      await fillForm(page, { phone });
      await submitBtn(page).click();
      expect(await drawerText(page)).toContain('رقم جوال سوداني غير صحيح');
      expect(await opened(page)).toHaveLength(0);
    });
  }

  it('accepts a phone typed with Arabic-Indic digits (٠٩١٢٣٤٥٦٧٨)', async () => {
    const { page } = await readyToOrder();
    await fillForm(page, { phone: '٠٩١٢٣٤٥٦٧٨' });
    await submitBtn(page).click();
    expect(await opened(page)).toHaveLength(1);
  });

  it('accepts the 00249… international format', async () => {
    const { page } = await readyToOrder();
    await fillForm(page, { phone: '00249912345678' });
    await submitBtn(page).click();
    expect(await opened(page)).toHaveLength(1);
  });
});

/* ───────────────────────── sending the order ───────────────────────── */

d('checkout — the WhatsApp message and recipient', () => {
  it('opens exactly one WhatsApp link whose message has the same totals the cart showed', async () => {
    const { page } = await readyToOrder();
    const before = await state(page);
    await submitBtn(page).click();
    const calls = await opened(page);
    expect(calls).toHaveLength(1);
    const [href, target, features] = calls[0] as string[];
    expect(target).toBe('_blank');
    expect(features).toBe('noopener,noreferrer');
    const url = new URL(href);
    expect(url.host).toBe('wa.me');
    const text = url.searchParams.get('text')!;
    expect(text).toContain('الاسم: أحمد محمد');
    expect(text).toContain('الجوال: 0912345678');
    expect(text).toContain('المنطقة: أم درمان');
    expect(text).toContain('1) باول الشوفان بالتوت × 2');
    expect(text).toContain('2) بان كيك البروتين × 1');
    expect(n(/المجموع الفرعي: ([\d,]+)/.exec(text)![1])).toBe(before.totals.subtotal);
    expect(n(/التوصيل: ([\d,]+)/.exec(text)![1])).toBe(before.totals.delivery);
    expect(n(/الإجمالي الكلي: ([\d,]+)/.exec(text)![1])).toBe(before.totals.total);
    expect(before.totals.total).toBe(22500);
  });

  it('with the built-in settings, the order goes to the same number as every other WhatsApp button', async () => {
    const { page } = await readyToOrder();
    const otherButton = await page.locator('a:has-text("كلمنا على واتساب")').getAttribute('href');
    await submitBtn(page).click();
    const [href] = (await opened(page))[0] as string[];
    expect(new URL(href).pathname).toBe('/249116642510');
    expect(new URL(href).pathname).toBe(new URL(otherButton!).pathname);
  });

  it('with the number saved in the Sanity dashboard, the order goes to THAT number', async () => {
    // Live dashboard value: contact.whatsapp = "0116643520"
    const { page } = await readyToOrder({ sanityDoc: { whatsapp: '0116643520' } });
    const otherButton = await page.locator('a:has-text("كلمنا على واتساب")').getAttribute('href');
    expect(new URL(otherButton!).pathname).toBe('/249116643520'); // the rest of the site uses it
    await submitBtn(page).click();
    const [href] = (await opened(page))[0] as string[];
    expect(new URL(href).pathname).toBe('/249116643520');
  });

  it('the order message uses the currency from the dashboard', async () => {
    const { page } = await readyToOrder({ sanityDoc: { currency: 'SDG' } });
    await submitBtn(page).click();
    const [href] = (await opened(page))[0] as string[];
    expect(new URL(href).searchParams.get('text')).toContain('22,500 SDG');
  });

  it('dashboard delivery settings change both the cart and the message consistently', async () => {
    const { page } = await readyToOrder({ sanityDoc: { deliveryFee: 3000, freeDeliveryAbove: 20000 } });
    // subtotal 20,500 ≥ 20,000 → free delivery
    expect((await state(page)).totals).toMatchObject({ subtotal: 20500, delivery: 0, total: 20500 });
    await submitBtn(page).click();
    const [href] = (await opened(page))[0] as string[];
    const text = new URL(href).searchParams.get('text')!;
    expect(text).toContain('التوصيل: مجاني ✅');
    expect(text).toContain('الإجمالي الكلي: 20,500');
  });

  it('special characters in the address / notes reach WhatsApp unchanged', async () => {
    const { page } = await readyToOrder();
    await fillForm(page, { address: 'شارع #5 & 50% + "بوابة"', notes: 'سطر1 ?x=1&y=2' });
    await submitBtn(page).click();
    const [href] = (await opened(page))[0] as string[];
    const text = new URL(href).searchParams.get('text')!;
    expect(text).toContain('العنوان: شارع #5 & 50% + "بوابة"');
    expect(text).toContain('ملاحظات: سطر1 ?x=1&y=2');
  });

  it('a fast double-click sends the order only once', async () => {
    const { page } = await readyToOrder();
    await submitBtn(page).dblclick();
    await page.waitForTimeout(100);
    expect(await opened(page)).toHaveLength(1);
  });

  it('after sending: cart is emptied, storage is cleared, success screen shows the order number', async () => {
    const { page } = await readyToOrder();
    await submitBtn(page).click();
    await page.waitForTimeout(80);
    expect((await state(page)).totals.total).toBe(0);
    expect(await page.evaluate(() => localStorage.getItem('fitbite_cart_v1'))).toBe('{}');
    const text = await drawerText(page);
    expect(text).toContain('جهّزنا رسالتك!');
    expect(text).toMatch(/FB-\d{6}/);
  });

  it('the "reopen WhatsApp" button points at the same link that was opened', async () => {
    const { page } = await readyToOrder();
    await submitBtn(page).click();
    const [href] = (await opened(page))[0] as string[];
    const link = await page.locator('a:has-text("إعادة فتح واتساب")').getAttribute('href');
    expect(link).toBe(href);
  });

  it('the order number shown to the customer is the one inside the message', async () => {
    const { page } = await readyToOrder();
    await submitBtn(page).click();
    const [href] = (await opened(page))[0] as string[];
    const shown = /FB-\d{6}/.exec(await drawerText(page))![0];
    expect(new URL(href).searchParams.get('text')).toContain(`رقم الطلب: ${shown}`);
  });
});

/* ───────────────────────── after an order ───────────────────────── */

d('checkout — next order after sending one', () => {
  it('"continue shopping" resets the drawer so the next order can be placed', async () => {
    const { page } = await readyToOrder();
    await submitBtn(page).click();
    await page.getByRole('button', { name: 'متابعة التسوق' }).click();
    await act(page, 'add', 'm13');
    await openCart(page);
    const text = await drawerText(page);
    expect(text).not.toContain('جهّزنا رسالتك');
    expect(text).toContain('عجة بياض البيض بالخضار');
  });

  it('closing the drawer with ✕ after an order, then adding a meal, shows the new cart (not the old success screen)', async () => {
    const { page } = await readyToOrder();
    await submitBtn(page).click();
    await page.getByRole('button', { name: 'إغلاق السلة' }).click();
    await act(page, 'add', 'm13');
    await openCart(page);
    const text = await drawerText(page);
    expect(text).not.toContain('جهّزنا رسالتك');
    expect(text).toContain('عجة بياض البيض بالخضار');
    expect(await submitBtn(page).isVisible()).toBe(true);
  });

  it('a second order after the first has its own message and totals', async () => {
    const { page } = await readyToOrder();
    await submitBtn(page).click();
    await page.getByRole('button', { name: 'متابعة التسوق' }).click();
    await act(page, 'add', 'm13'); // 5,500 + 2,000
    await openCart(page);
    await fillForm(page);
    await submitBtn(page).click();
    const calls = await opened(page);
    expect(calls).toHaveLength(2);
    const second = new URL((calls[1] as string[])[0]).searchParams.get('text')!;
    expect(second).toContain('1) عجة بياض البيض بالخضار × 1');
    expect(second).toContain('الإجمالي الكلي: 7,500');
    expect(second).not.toContain('باول الشوفان');
  });
});
