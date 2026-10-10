/**
 * Which number do orders / buttons go to?
 *
 * site.whatsapp comes from lib/config.ts (default) and is overridden by the Sanity dashboard
 * (contact.whatsapp) after normalisation in lib/site-data.ts (mergeSite, exercised via getSite()).
 */
import { beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { DEFAULT_SITE, getSite } from '../lib/site-data';
import { SITE as CONFIG } from '../lib/config';
import { setSanityDoc, setSanityError } from './helpers';

beforeEach(() => setSanityDoc(null));

describe('default number', () => {
  it('DEFAULT_SITE uses the number from lib/config.ts', () => {
    expect(DEFAULT_SITE.whatsapp).toBe(CONFIG.whatsapp);
  });

  it('the default number is international format: digits only, Sudan code 249', () => {
    expect(DEFAULT_SITE.whatsapp).toMatch(/^249\d{9}$/);
  });

  it('the displayed number and the linked number are the same number', () => {
    const asInternational = '249' + CONFIG.whatsappDisplay.replace(/\D/g, '').replace(/^0/, '');
    expect(DEFAULT_SITE.whatsapp).toBe(asInternational);
  });
});

describe('getSite() — number normalisation from the dashboard', () => {
  const cases: Array<[string, string]> = [
    ['249116642510', '249116642510'],
    ['+249116642510', '249116642510'],
    ['+249 11 664 2510', '249116642510'],
    ['(249) 116-642-510', '249116642510'],
    ['0116642510', '249116642510'], // local format → international
    ['00249116642510', '249116642510'], // 00 prefix
  ];
  for (const [input, expected] of cases) {
    it(`"${input}" → ${expected}`, async () => {
      setSanityDoc({ whatsapp: input });
      expect((await getSite()).whatsapp).toBe(expected);
    });
  }

  it('Arabic-Indic digits typed in the Arabic Studio are converted too', async () => {
    setSanityDoc({ whatsapp: '٠١١٦٦٤٢٥١٠' }); // 0116642510
    expect((await getSite()).whatsapp).toBe('249116642510');
  });

  it('an empty dashboard field falls back to the default number (not an empty one)', async () => {
    setSanityDoc({ whatsapp: '' });
    expect((await getSite()).whatsapp).toBe(DEFAULT_SITE.whatsapp);
  });

  it('a whitespace-only dashboard field falls back to the default number', async () => {
    setSanityDoc({ whatsapp: '   ' });
    expect((await getSite()).whatsapp).toBe(DEFAULT_SITE.whatsapp);
  });

  it('a missing / null dashboard field keeps the default number', async () => {
    setSanityDoc({ whatsapp: null });
    expect((await getSite()).whatsapp).toBe(DEFAULT_SITE.whatsapp);
    setSanityDoc({});
    expect((await getSite()).whatsapp).toBe(DEFAULT_SITE.whatsapp);
  });

  it('the result is always digits only (what wa.me requires)', async () => {
    for (const input of ['+249 11 664 2510', '0116642510', '00249116642510', '(249)116-642-510']) {
      setSanityDoc({ whatsapp: input });
      expect((await getSite()).whatsapp).toMatch(/^\d+$/);
    }
  });
});

describe('getSite() — display number vs linked number', () => {
  it('when the dashboard changes the number but not the display text, the displayed number must follow', async () => {
    // Exactly the shape of the live dashboard document: only `whatsapp` is filled in.
    setSanityDoc({ whatsapp: '0116643520' });
    const site = await getSite();
    expect(site.whatsapp).toBe('249116643520');
    const displayAsInternational = '249' + site.whatsappDisplay.replace(/\D/g, '').replace(/^0/, '');
    expect(displayAsInternational).toBe(site.whatsapp);
  });

  it('an explicit display value from the dashboard is kept as typed', async () => {
    setSanityDoc({ whatsapp: '0116643520', whatsappDisplay: '011 664 3520' });
    expect((await getSite()).whatsappDisplay).toBe('011 664 3520');
  });
});

describe('getSite() — partial documents and failures', () => {
  it('a partial dashboard document keeps every other default', async () => {
    setSanityDoc({ whatsapp: '0116643520' });
    const site = await getSite();
    expect(site.deliveryFee).toBe(DEFAULT_SITE.deliveryFee);
    expect(site.freeDeliveryAbove).toBe(DEFAULT_SITE.freeDeliveryAbove);
    expect(site.currency).toBe(DEFAULT_SITE.currency);
    expect(site.regions.length).toBeGreaterThan(0);
  });

  it('a delivery fee / threshold of 0 from the dashboard is respected, not replaced by the default', async () => {
    setSanityDoc({ deliveryFee: 0, freeDeliveryAbove: 0 });
    const site = await getSite();
    expect(site.deliveryFee).toBe(0);
    expect(site.freeDeliveryAbove).toBe(0);
  });

  it('dashboard delivery settings override the defaults', async () => {
    setSanityDoc({ deliveryFee: 3000, freeDeliveryAbove: 50000, currency: 'SDG' });
    const site = await getSite();
    expect([site.deliveryFee, site.freeDeliveryAbove, site.currency]).toEqual([3000, 50000, 'SDG']);
  });

  it('when the dashboard request fails, the default number is used', async () => {
    const err = spyOn(console, 'error').mockImplementation(() => {});
    setSanityError(new Error('network down'));
    const site = await getSite();
    expect(site.whatsapp).toBe(DEFAULT_SITE.whatsapp);
    expect(err).toHaveBeenCalled();
    err.mockRestore();
  });

  it('when there is no settings document at all, the defaults are used', async () => {
    setSanityDoc(null);
    expect((await getSite()).whatsapp).toBe(DEFAULT_SITE.whatsapp);
  });
});
