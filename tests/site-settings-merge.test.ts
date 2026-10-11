import { beforeEach, describe, expect, it } from 'bun:test';
import { DEFAULT_SITE, getSite, mergeSettingsDocs } from '../lib/site-data';
import { setSanityDoc } from './helpers';

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

  it('missing or invalid delivery numbers fall back, but an intentional 0 is kept', async () => {
    setSanityDoc({ deliveryFee: null, freeDeliveryAbove: -5 });
    let site = await getSite();
    expect(site.deliveryFee).toBe(DEFAULT_SITE.deliveryFee);
    expect(site.freeDeliveryAbove).toBe(DEFAULT_SITE.freeDeliveryAbove);

    setSanityDoc({ deliveryFee: 0, freeDeliveryAbove: 60000 });
    site = await getSite();
    expect(site.deliveryFee).toBe(0);
    expect(site.freeDeliveryAbove).toBe(60000);
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

  it('incomplete hours rows are cleaned and a fully missing schedule falls back', async () => {
    setSanityDoc({ hours: [{ days: '  ' }, { days: 'السبت', time: ' 10:00 ' }] });
    let site = await getSite();
    expect(site.hours).toEqual([{ days: 'السبت', time: '10:00' }]);

    setSanityDoc({ hours: [] });
    site = await getSite();
    expect(site.hours).toEqual(DEFAULT_SITE.hours);
  });
});
