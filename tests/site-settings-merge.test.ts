import { beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { DEFAULT_SITE, getSite, mergeSettingsDocs } from '../lib/site-data';
import { setSanityDoc, setSanityError } from './helpers';

/** يلتقط ما يُطبع على وحدة تحكم المتصفح أثناء التنفيذ (للفحص ثم الإعادة) */
async function capturingConsole<T>(method: 'warn' | 'error', run: () => Promise<T>) {
  const calls: unknown[][] = [];
  const spy = spyOn(console, method).mockImplementation((...args: unknown[]) => {
    calls.push(args);
  });
  try {
    const result = await run();
    return { result, calls };
  } finally {
    spy.mockRestore();
  }
}

beforeEach(() => setSanityDoc(null));

describe('multiple siteSettings documents', () => {
  it('applies newer values while preserving older fields that were not edited', async () => {
    setSanityDoc([
      {
        nameAr: 'الاسم القديم',
        socials: { instagram: 'https://instagram.com/old', facebook: 'https://facebook.com/page' },
        home: { featuresHeading: { eyebrow: 'وسم قديم', title: 'عنوان قديم' } },
      },
      {
        nameAr: 'الاسم الأحدث',
        socials: { instagram: 'https://instagram.com/new' },
        home: { featuresHeading: { title: 'عنوان أحدث' } },
      },
    ]);

    const site = await getSite();

    expect(site.nameAr).toBe('الاسم الأحدث');
    expect(site.socials.instagram).toBe('https://instagram.com/new');
    expect(site.socials.facebook).toBe('https://facebook.com/page');
    expect(site.home.featuresHeading.eyebrow).toBe('وسم قديم');
    expect(site.home.featuresHeading.title).toBe('عنوان أحدث');
  });

  it('uses the latest array as a whole and trims blank delivery regions', async () => {
    setSanityDoc([
      {
        regions: ['الخرطوم', 'بحري'],
        hours: [{ days: 'قديم', time: '10:00' }],
        home: { strip: [{ title: 'قديم', icon: 'leaf' }] },
      },
      {
        regions: [' أم درمان ', '   ', ' بحري '],
        hours: [{ days: 'اليوم', time: '12:00' }],
        home: { strip: [{ title: 'أحدث', icon: 'flame' }] },
      },
    ]);

    const site = await getSite();

    expect(site.regions).toEqual(['أم درمان', 'بحري']);
    expect(site.hours).toEqual([{ days: 'اليوم', time: '12:00' }]);
    expect(site.home.strip).toEqual([{ title: 'أحدث', icon: 'flame' }]);
  });

  it('ignores null values in later documents instead of erasing earlier values', async () => {
    setSanityDoc([{ city: 'الخرطوم' }, { city: null }]);

    expect((await getSite()).city).toBe('الخرطوم');
  });

  it('returns null when the query result contains no settings documents', () => {
    expect(mergeSettingsDocs(null)).toBeNull();
    expect(mergeSettingsDocs([])).toBeNull();
  });
});

describe('empty or invalid dashboard values fall back to defaults', () => {
  it('empty strings for identity/contact fields fall back to the local defaults', async () => {
    setSanityDoc({
      nameAr: '',
      taglineAr: '   ',
      currency: '',
      city: '',
      address: '',
      description: '',
    });

    const site = await getSite();

    expect(site.nameAr).toBe(DEFAULT_SITE.nameAr);
    expect(site.taglineAr).toBe(DEFAULT_SITE.taglineAr);
    expect(site.currency).toBe(DEFAULT_SITE.currency);
    expect(site.city).toBe(DEFAULT_SITE.city);
    expect(site.address).toBe(DEFAULT_SITE.address);
    expect(site.description).toBe(DEFAULT_SITE.description);
  });

  it('an empty or whitespace-only delivery note falls back to the default wording', async () => {
    setSanityDoc({ deliveryNote: '' });
    expect((await getSite()).deliveryNote).toBe(DEFAULT_SITE.deliveryNote);

    setSanityDoc({ deliveryNote: '   ' });
    expect((await getSite()).deliveryNote).toBe(DEFAULT_SITE.deliveryNote);
  });

  it('a delivery note typed in the dashboard wins, and it does not affect any other field', async () => {
    setSanityDoc({ deliveryNote: 'مع مندوب التوصيل داخل الخرطوم' });
    const site = await getSite();
    expect(site.deliveryNote).toBe('مع مندوب التوصيل داخل الخرطوم');
    expect(site.currency).toBe(DEFAULT_SITE.currency);
    expect(site.city).toBe(DEFAULT_SITE.city);
  });

  it('legacy fee/threshold fields left in a published document are ignored (no fee anywhere)', async () => {
    setSanityDoc({ deliveryFee: 3000, freeDeliveryAbove: 20000 });
    const site = await getSite();
    expect(site).not.toHaveProperty('deliveryFee');
    expect(site).not.toHaveProperty('freeDeliveryAbove');
    expect(site.deliveryNote).toBe(DEFAULT_SITE.deliveryNote);
  });

  it('empty social links fall back to the default links one by one', async () => {
    setSanityDoc({ socials: { instagram: 'https://instagram.com/new', facebook: '' } });

    const site = await getSite();

    expect(site.socials.instagram).toBe('https://instagram.com/new');
    expect(site.socials.facebook).toBe(DEFAULT_SITE.socials.facebook);
    expect(site.socials.tiktok).toBe(DEFAULT_SITE.socials.tiktok);
  });

  it('empty home texts fall back to the defaults (hero, buttons, headings, CTA)', async () => {
    setSanityDoc({
      home: {
        heroBadge: '',
        heroTitleLead: 'عنوان جديد',
        heroImage: '',
        cta: { title: '', sub: 'وصف جديد' },
        pkgBanner: {},
      },
    });

    const site = await getSite();

    expect(site.home.heroBadge).toBe(DEFAULT_SITE.home.heroBadge);
    expect(site.home.heroTitleLead).toBe('عنوان جديد');
    expect(site.home.heroImage).toBe(DEFAULT_SITE.home.heroImage);
    expect(site.home.cta.title).toBe(DEFAULT_SITE.home.cta.title);
    expect(site.home.cta.sub).toBe('وصف جديد');
    expect(site.home.pkgBanner).toEqual(DEFAULT_SITE.home.pkgBanner);
  });

  it('offers section: heading is completed from defaults and the toggle is honoured', async () => {
    setSanityDoc({ home: { offersHeading: { title: 'عروضنا' } } });
    let site = await getSite();
    expect(site.home.offersHeading.title).toBe('عروضنا');
    expect(site.home.offersHeading.eyebrow).toBe(DEFAULT_SITE.home.offersHeading.eyebrow);
    expect(site.home.offersEnabled).toBe(true);

    setSanityDoc({ home: { offersEnabled: false } });
    site = await getSite();
    expect(site.home.offersEnabled).toBe(false);

    /* قيمة غير منطقية من لوحة التحكم تعود للافتراضي (مفعّل) */
    setSanityDoc({ home: { offersEnabled: 'نعم' as unknown as boolean } });
    site = await getSite();
    expect(site.home.offersEnabled).toBe(true);
  });

  it('incomplete hours rows are cleaned and a fully missing schedule falls back', async () => {
    setSanityDoc({ hours: [{ days: '  ' }, { days: 'السبت', time: ' 10:00 ' }] });
    let site = await getSite();
    expect(site.hours).toEqual([{ days: 'السبت', time: '10:00' }]);

    setSanityDoc({ hours: [] });
    site = await getSite();
    expect(site.hours).toEqual(DEFAULT_SITE.hours);
  });
});

describe('getSite() — [site-settings] diagnostics', () => {
  it('warns with the [site-settings] tag when the dashboard returns no usable settings', async () => {
    setSanityDoc(null); // no siteSettings document published at all

    const { result, calls } = await capturingConsole('warn', () => getSite());

    expect(result).toEqual(DEFAULT_SITE);
    expect(calls.length).toBe(1);
    expect(String(calls[0][0])).toContain('[site-settings]');
    expect(String(calls[0][0])).toContain('no siteSettings values');
  });

  it('warns the same way for a published document with no filled-in fields', async () => {
    setSanityDoc({}); // the query projects every field → an empty result object

    const { result, calls } = await capturingConsole('warn', () => getSite());

    expect(result).toEqual(DEFAULT_SITE);
    expect(calls.some((args) => String(args[0]).startsWith('[site-settings]'))).toBe(true);
  });

  it('tags a failed Sanity fetch with [site-settings] and still serves the defaults', async () => {
    setSanityError(new Error('cdn unreachable'));

    const { result, calls } = await capturingConsole('error', () => getSite());

    expect(result).toEqual(DEFAULT_SITE);
    expect(calls.some((args) => String(args[0]).startsWith('[site-settings]'))).toBe(true);
  });

  it('stays silent when the dashboard returns usable values', async () => {
    setSanityDoc({ nameAr: 'فيتبايت الجديدة' });

    const warn = await capturingConsole('warn', () => getSite());
    const error = await capturingConsole('error', () => getSite());

    expect(warn.result.nameAr).toBe('فيتبايت الجديدة');
    expect(warn.calls).toEqual([]);
    expect(error.calls).toEqual([]);
  });
});
