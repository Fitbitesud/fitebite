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

    /* الشكل القديم (نص فقط) يُقرأ بلا سعر توصيل حتى يُضبط من اللوحة */
    expect(site.regions).toEqual([
      { name: 'أم درمان', fee: 0 },
      { name: 'بحري', fee: 0 },
    ]);
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
    expect(site.home.heroSentences[0]?.lead).toBe('عنوان جديد');
    expect(site.home.heroImage).toBe(DEFAULT_SITE.home.heroImage);
    expect(site.home.cta.title).toBe(DEFAULT_SITE.home.cta.title);
    expect(site.home.cta.sub).toBe('وصف جديد');
    expect(site.home.pkgBanner).toEqual(DEFAULT_SITE.home.pkgBanner);
  });

  it('hero rotating sentences, videos section, and FAQ section settings merge safely', async () => {
    setSanityDoc({
      home: {
        heroSentences: [
          { lead: 'جملة أولى', accent: 'مميزة', tail: '!' },
          { lead: '   ', accent: '' },
          { lead: 'جملة ثانية', accent: 'قوية' },
        ],
        videosHeading: { title: 'فيديوهات المطبخ' },
        videosEnabled: false,
        faqHeading: { title: 'أسئلتكم' },
        faqEnabled: false,
      },
    });
    const site = await getSite();
    expect(site.home.heroSentences).toEqual([
      { lead: 'جملة أولى', accent: 'مميزة', tail: '!' },
      { lead: 'جملة ثانية', accent: 'قوية' },
    ]);
    expect(site.home.videosHeading.title).toBe('فيديوهات المطبخ');
    expect(site.home.videosHeading.eyebrow).toBe(DEFAULT_SITE.home.videosHeading.eyebrow);
    expect(site.home.videosEnabled).toBe(false);
    expect(site.home.faqHeading.title).toBe('أسئلتكم');
    expect(site.home.faqHeading.eyebrow).toBe(DEFAULT_SITE.home.faqHeading.eyebrow);
    expect(site.home.faqEnabled).toBe(false);
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

describe('common spelling fixes in dashboard texts', () => {
  it('shows «البحر الأحمر» with the hamza even when the dashboard text lacks it', async () => {
    setSanityDoc([{ city: 'بورتسودان', address: 'بورتسودان البحر الاحمر' }]);

    const site = await getSite();

    expect(site.address).toBe('بورتسودان البحر الأحمر');
    expect(site.city).toBe('بورتسودان');
  });

  it('fixes the spelling everywhere: home texts, regions and opening hours too', async () => {
    setSanityDoc([
      {
        regions: ['البحر الاحمر'],
        hours: [{ days: 'السبت — الخميس', time: '10:00' }],
        home: {
          heroParagraph: 'توصلك حتى باب البيت في البحر الاحمر.',
          features: [{ title: 'وجبة البحر الاحمر', desc: 'سمك طازج يومياً', icon: 'cloche' }],
        },
      },
    ]);

    const site = await getSite();

    expect(site.regions).toEqual([{ name: 'البحر الأحمر', fee: 0 }]);
    expect(site.home.heroParagraph).toBe('توصلك حتى باب البيت في البحر الأحمر.');
    expect(site.home.features[0]?.title).toBe('وجبة البحر الأحمر');
  });

  it('keeps already-correct texts untouched', async () => {
    setSanityDoc([
      {
        address: 'بورتسودان — البحر الأحمر',
        city: 'بورتسودان',
        home: { heroTitleLead: 'طعام صحي يُحسب' },
      },
    ]);

    const site = await getSite();

    expect(site.address).toBe('بورتسودان — البحر الأحمر');
    expect(site.city).toBe('بورتسودان');
    expect(site.home.heroTitleLead).toBe('طعام صحي يُحسب');
  });
});

describe('delivery regions and their fixed fees (dashboard)', () => {
  it('reads a name + deliveryFee object per region from the dashboard', async () => {
    setSanityDoc({
      regions: [
        { _key: 'a', _type: 'deliveryRegion', name: 'الرياض', deliveryFee: 2000 },
        { _key: 'b', _type: 'deliveryRegion', name: 'أم درمان', deliveryFee: 3500 },
        { _key: 'c', _type: 'deliveryRegion', name: 'بحري', deliveryFee: 0 },
      ],
    });

    expect((await getSite()).regions).toEqual([
      { name: 'الرياض', fee: 2000 },
      { name: 'أم درمان', fee: 3500 },
      { name: 'بحري', fee: 0 },
    ]);
  });

  it('supports the older `fee` key and Arabic-Indic digits typed in the dashboard', async () => {
    setSanityDoc({
      regions: [
        { name: 'الطائف', fee: 2500 },
        { name: 'المنشية', deliveryFee: '٣٠٠٠' },
      ],
    });

    expect((await getSite()).regions).toEqual([
      { name: 'الطائف', fee: 2500 },
      { name: 'المنشية', fee: 3000 },
    ]);
  });

  it('mixes legacy string regions with priced ones without losing either', async () => {
    setSanityDoc({ regions: ['الخرطوم', { name: 'الرياض', deliveryFee: 2000 }, '  '] });

    expect((await getSite()).regions).toEqual([
      { name: 'الخرطوم', fee: 0 },
      { name: 'الرياض', fee: 2000 },
    ]);
  });

  it('cleans broken fees and duplicate / nameless regions instead of showing them', async () => {
    setSanityDoc({
      regions: [
        { name: 'الرياض', deliveryFee: -500 },
        { name: '  الرياض  ', deliveryFee: 9000 },
        { name: '', deliveryFee: 4000 },
        { deliveryFee: 4000 },
        { name: 'بحري', deliveryFee: 'abc' },
        { name: 'أم درمان', deliveryFee: 1999.6 },
      ],
    });

    expect((await getSite()).regions).toEqual([
      { name: 'الرياض', fee: 0 },
      { name: 'بحري', fee: 0 },
      { name: 'أم درمان', fee: 2000 },
    ]);
  });

  it('the local defaults are fee-free until the dashboard sets prices', async () => {
    setSanityDoc(null);
    const site = await getSite();
    expect(site.regions.length).toBeGreaterThan(0);
    expect(site.regions.every((r) => r.fee === 0)).toBe(true);
    expect(site.regions.map((r) => r.name)).toEqual(DEFAULT_SITE.regions.map((r) => r.name));
  });
});
