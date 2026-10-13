/**
 * العروض الخاصة — سلوك الجلب من لوحة التحكم، تصفية المنتهي/الموقوف،
 * والرسالة المرسلة عبر واتساب.
 */
import { beforeEach, describe, expect, it } from 'bun:test';
import { fmt } from '../lib/format';
import {
  DEFAULT_OFFERS,
  buildOfferMessage,
  getOffers,
  isOfferLive,
  todayStr,
  type Offer,
} from '../lib/offers';
import { SITE, setSanityDoc, setSanityError } from './helpers';

const dayShift = (days: number): string =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

beforeEach(() => setSanityDoc(null));

describe('getOffers — local fallback', () => {
  it('no dashboard data → local defaults (all live, in order)', async () => {
    expect(await getOffers()).toEqual(DEFAULT_OFFERS);
  });

  it('network failure → local defaults', async () => {
    setSanityError(new Error('cdn unreachable'));
    expect(await getOffers()).toEqual(DEFAULT_OFFERS);
  });

  it('default offers are all live today (no silent disappearance out of the box)', () => {
    for (const o of DEFAULT_OFFERS) expect(isOfferLive(o)).toBe(true);
  });

  it('default offers have unique ids (React keys)', () => {
    const ids = DEFAULT_OFFERS.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every default offer with two prices is actually discounted', () => {
    for (const o of DEFAULT_OFFERS) {
      if (o.priceOld !== undefined && o.priceNew !== undefined) {
        expect(o.priceNew).toBeLessThan(o.priceOld);
      }
    }
  });
});

describe('getOffers — dashboard documents', () => {
  it('valid published offers are kept and the date is normalised to YYYY-MM-DD', async () => {
    setSanityDoc([
      {
        _id: 'o1',
        title: 'عرض جديد',
        desc: 'وصف',
        badge: 'خصم 20%',
        image: 'https://cdn.sanity.io/images/a/b/c.jpg',
        priceOld: 30000,
        priceNew: 24000,
        validUntil: '2027-12-31T00:00:00Z',
        order: 5,
      },
    ]);
    const offers = await getOffers();
    expect(offers).toHaveLength(1);
    expect(offers[0]).toMatchObject({
      id: 'o1',
      title: 'عرض جديد',
      badge: 'خصم 20%',
      priceOld: 30000,
      priceNew: 24000,
      validUntil: '2027-12-31',
      active: true,
      order: 5,
    });
  });

  it('offers without a title, inactive offers, and expired offers are dropped', async () => {
    setSanityDoc([
      { _id: 'o0', title: '', priceNew: 100 },
      { _id: 'o1', title: 'عرض ساري', desc: 'وصف', priceNew: 100 },
      { _id: 'o2', title: 'عرض موقوف', active: false },
      { _id: 'o3', title: 'عرض منتهي', validUntil: '2020-01-01T00:00:00Z' },
      { _id: 'o4', title: 'عرض ينتهي غداً', validUntil: dayShift(1) },
    ]);
    const offers = await getOffers();
    expect(offers.map((o) => o.id)).toEqual(['o1', 'o4']);
  });

  it('published but all inactive/expired → empty section (intentional)', async () => {
    setSanityDoc([
      { _id: 'o5', title: 'موقوف', active: false },
      { _id: 'o6', title: 'منتهي', validUntil: dayShift(-1) },
    ]);
    expect(await getOffers()).toEqual([]);
  });

  it('no published documents at all → local defaults', async () => {
    setSanityDoc([]);
    expect(await getOffers()).toEqual(DEFAULT_OFFERS);
  });

  it('offers are sorted by the order field', async () => {
    setSanityDoc([
      { _id: 'b', title: 'ثاني', order: 2 },
      { _id: 'c', title: 'ثالث', order: 3 },
      { _id: 'a', title: 'أول', order: 1 },
    ]);
    expect((await getOffers()).map((o) => o.id)).toEqual(['a', 'b', 'c']);
  });

  it('invalid prices and malformed dates are dropped, not shown as NaN', async () => {
    setSanityDoc([
      {
        _id: 'o7',
        title: 'عرض',
        priceOld: -5,
        priceNew: '12000' as unknown as number,
        validUntil: 'ليس تاريخاً',
      },
    ]);
    const offers = await getOffers();
    expect(offers[0].priceOld).toBeUndefined();
    expect(offers[0].priceNew).toBeUndefined();
    expect(offers[0].validUntil).toBeUndefined();
  });
});

describe('isOfferLive — expiry boundary', () => {
  const base: Offer = { id: 'x', title: 'عرض', desc: '', active: true };

  it('an active offer without a deadline is always live', () => {
    expect(isOfferLive(base)).toBe(true);
  });

  it('an inactive offer is never live, even without a deadline', () => {
    expect(isOfferLive({ ...base, active: false })).toBe(false);
  });

  it('an offer expiring today is still live', () => {
    expect(isOfferLive({ ...base, validUntil: todayStr() })).toBe(true);
  });

  it('an offer that expired yesterday is not live', () => {
    expect(isOfferLive({ ...base, validUntil: dayShift(-1) })).toBe(false);
  });

  it('an offer expiring tomorrow is live', () => {
    expect(isOfferLive({ ...base, validUntil: dayShift(1) })).toBe(true);
  });
});

describe('buildOfferMessage — whatsapp order message', () => {
  const offer: Offer = {
    id: 'm1',
    title: 'صينية العشاء العائلي',
    desc: 'أربع وجبات مشوية مشكّلة',
    badge: 'وفّر 20%',
    priceOld: 30000,
    priceNew: 24000,
    validUntil: '2026-12-31',
    active: true,
  };
  const msg = buildOfferMessage(offer, SITE);

  it('carries the offer identity and the discounted price pair', () => {
    expect(msg).toContain(`العرض: ${offer.title}`);
    expect(msg).toContain(`السعر قبل العرض: ${fmt(30000)} ج.س`);
    expect(msg).toContain(`سعر العرض: ${fmt(24000)} ج.س`);
  });

  it('carries the deadline when set, and leaves the customer fields blank', () => {
    expect(msg).toContain('العرض ساري حتى: 2026-12-31');
    expect(msg).toContain('الاسم: ');
    expect(msg).toContain('المنطقة: ');
  });

  it('an offer without an old price shows only the offer price', () => {
    const m = buildOfferMessage({ ...offer, priceOld: undefined }, SITE);
    expect(m).not.toContain('السعر قبل العرض');
    expect(m).toContain(`سعر العرض: ${fmt(24000)} ج.س`);
  });

  it('an offer without prices and without a deadline prints neither line', () => {
    const m = buildOfferMessage(
      { id: 'm2', title: 'هدية', desc: 'هدية مع أول طلب', active: true },
      SITE,
    );
    expect(m).not.toContain('سعر العرض');
    expect(m).not.toContain('ساري حتى');
    expect(m).toContain('هدية مع أول طلب');
  });

  it('a dashboard offer with only an old price (missing new price) prints neither price line', () => {
    const m = buildOfferMessage({ ...offer, priceNew: undefined }, SITE);
    expect(m).not.toContain('السعر');
  });
});
