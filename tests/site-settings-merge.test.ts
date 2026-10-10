import { beforeEach, describe, expect, it } from 'bun:test';
import { getSite, mergeSettingsDocs } from '../lib/site-data';
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
