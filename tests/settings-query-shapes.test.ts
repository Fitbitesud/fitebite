/**
 * SETTINGS_QUERY must tolerate both shapes of the siteSettings document:
 *   • the nested schema in studio/schemaTypes/siteSettings.ts (identity / contact / home)
 *   • the legacy flat document (the very same field names at the root)
 * The query is parsed and evaluated with the real GROQ engine (groq-js) against a fake
 * dataset, so a syntax error — or a field left on a single path — fails this test.
 */
import { describe, expect, it } from 'bun:test';
import { evaluate, parse } from 'groq-js';
import { SETTINGS_QUERY } from '../lib/sanity/queries';

const ASSET = {
  _id: 'image-hero',
  _type: 'sanity.imageAsset',
  url: 'https://cdn.sanity.io/images/zes52trp/production/hero-bowl.jpg',
};

/** الشعاران المضبوطان من لوحة التحكم: الأساسي وشعار الخلفية الداكنة */
const LOGO_ASSET = {
  _id: 'image-logo',
  _type: 'sanity.imageAsset',
  url: 'https://cdn.sanity.io/images/zes52trp/production/logo-480x480.png',
};
const LOGO_DARK_ASSET = {
  _id: 'image-logo-dark',
  _type: 'sanity.imageAsset',
  url: 'https://cdn.sanity.io/images/zes52trp/production/logo-dark-480x480.png',
};

/** كل وثائق الصور التي تُحل إليها مراجع الحقول (asset->url) */
const IMAGE_ASSETS = [ASSET, LOGO_ASSET, LOGO_DARK_ASSET];

const IDENTITY = {
  nameAr: 'فيتبايت',
  nameEn: 'FITBITE',
  logo: { asset: { _type: 'reference', _ref: 'image-logo' } },
  logoDark: { asset: { _type: 'reference', _ref: 'image-logo-dark' } },
  taglineAr: 'طعام صحي للضخامة والتنشيف',
  description: 'وصف الموقع للمحركات',
};

const CONTACT = {
  whatsapp: '249116642510',
  whatsappDisplay: '0116642510',
  currency: 'ج.س',
  deliveryFee: 2000,
  freeDeliveryAbove: 40000,
  city: 'الخرطوم',
  address: 'شارع المطار',
};

/** Root-level in both shapes, so they are read directly (no coalesce). */
const ROOT = {
  socials: { instagram: 'https://instagram.com/fitbite', facebook: 'https://facebook.com/fitbite' },
  hours: [{ days: 'السبت — الخميس', time: '10:00 — 23:00' }],
  regions: ['الخرطوم', 'بحري'],
};

const HOME = {
  heroBadge: 'وجبات طازجة',
  heroTitleLead: 'طعام صحي يُحسب',
  heroAccent: 'بالغرام',
  heroTitleTail: '، لا بالتقريب.',
  heroParagraph: 'وجبات محسوبة السعرات.',
  heroPrimaryLabel: 'تصفح القائمة',
  heroSecondaryLabel: 'اطلب عبر واتساب',
  heroImage: { asset: { _type: 'reference', _ref: 'image-hero' } },
  heroCardTitle: 'باول الدجاج المشوي',
  strip: [{ title: 'طعم شهي', sub: 'وجودة عالية', icon: 'cloche' }],
  featuresHeading: { eyebrow: 'لماذا فيتبايت', title: 'ما يميز فيتبايت', sub: 'أربعة وعود' },
  features: [{ title: 'الدقة الغذائية', desc: 'بيانات دقيقة', icon: 'clipboard' }],
  howHeading: { eyebrow: 'كيف تطلب', title: 'ثلاث خطوات', sub: 'بدون تعقيد' },
  steps: [{ title: 'اختر وجباتك', desc: 'تصفح القائمة', icon: 'cart' }],
  cta: { title: 'جاهز تبدأ؟', sub: 'اطلب الآن', primaryLabel: 'اطلب عبر واتساب', secondaryLabel: 'تصفح القائمة' },
  pkgBanner: { title: 'تفضّل الجاهز؟', sub: 'ست باقات شهرية', button: 'تصفح الباقات الجاهزة' },
};

/** نفس الهوية كما يعيدها الاستعلام: مرجعا الشعارين يتحولان إلى رابطَي CDN */
const IDENTITY_QUERY_SHAPE = {
  ...IDENTITY,
  logo: LOGO_ASSET.url,
  logoDark: LOGO_DARK_ASSET.url,
};

const HEAD = { _id: 'site-settings', _type: 'siteSettings', _updatedAt: '2026-10-11T00:00:00Z' };

/** Spread identity/contact/home at the root — how the legacy dashboard stored them. */
const flatten = (groups: { identity?: object; contact?: object; home?: object }) => ({
  ...(groups.identity ?? {}),
  ...(groups.contact ?? {}),
  ...(groups.home ?? {}),
});

/** The document as the current Studio schema saves it. */
const NESTED_DOC = { ...HEAD, identity: IDENTITY, contact: CONTACT, ...ROOT, home: HOME };

/** The legacy document: the same values written at the root instead. */
const FLAT_DOC = { ...HEAD, ...flatten({ identity: IDENTITY, contact: CONTACT, home: HOME }), ...ROOT };

/** Half-migrated document: identity nested, while contact/home are still at the root. */
const MIXED_DOC = { ...HEAD, identity: IDENTITY, ...flatten({ contact: CONTACT, home: HOME }), ...ROOT };

async function runQuery(docs: unknown[]) {
  const tree = parse(SETTINGS_QUERY);
  const value = await evaluate(tree, { dataset: docs as never });
  return (await value.get()) as Array<Record<string, any>>;
}

/** Top-level field names projected by the query, in order (quoted or bare attributes). */
const projectedKeys = (query: string) =>
  query
    .slice(0, query.indexOf('"home": {'))
    .split('\n')
    .map((line) => /^\s*(?:"(\w+)"|(\w+))\s*[,:]/.exec(line))
    .filter(Boolean)
    .map((m) => (m as RegExpExecArray)[1] ?? (m as RegExpExecArray)[2]);

/** Field names projected inside the "home" block, in order. */
const projectedHomeKeys = (query: string) => {
  const marker = '"home": {';
  const block = query.slice(query.indexOf(marker) + marker.length);
  return [...block.matchAll(/"(\w+)":/g)].map((m) => m[1]);
};

const TOP_LEVEL_KEYS = [...Object.keys(IDENTITY), ...Object.keys(CONTACT), 'socials', 'hours', 'regions'];
const HOME_KEYS = Object.keys(HOME);

describe('SETTINGS_QUERY tolerates both document shapes', () => {
  it('projects every settings field (guard against a field being dropped)', () => {
    expect(projectedKeys(SETTINGS_QUERY)).toEqual(TOP_LEVEL_KEYS);
    expect(projectedHomeKeys(SETTINGS_QUERY)).toEqual(HOME_KEYS);
  });

  it('reads the nested shape (identity / contact / home) in full', async () => {
    const [doc] = await runQuery([NESTED_DOC, ...IMAGE_ASSETS]);

    expect(doc.nameAr).toBe(IDENTITY.nameAr);
    expect(doc.logo).toBe(LOGO_ASSET.url);
    expect(doc.logoDark).toBe(LOGO_DARK_ASSET.url);
    expect(doc.whatsapp).toBe(CONTACT.whatsapp);
    expect(doc.deliveryFee).toBe(CONTACT.deliveryFee);
    expect(doc.socials).toEqual(ROOT.socials);
    expect(doc.regions).toEqual(ROOT.regions);
    expect(doc.home.heroImage).toBe(ASSET.url);
    expect(doc.home.strip).toEqual(HOME.strip);
    expect(doc.home.cta).toEqual(HOME.cta);
    expect(doc.home.pkgBanner).toEqual(HOME.pkgBanner);
  });

  it('reads the legacy flat shape (fields at the document root) in full', async () => {
    const [doc] = await runQuery([FLAT_DOC, ...IMAGE_ASSETS]);

    expect(doc.nameAr).toBe(IDENTITY.nameAr);
    expect(doc.logo).toBe(LOGO_ASSET.url);
    expect(doc.logoDark).toBe(LOGO_DARK_ASSET.url);
    expect(doc.whatsapp).toBe(CONTACT.whatsapp);
    expect(doc.city).toBe(CONTACT.city);
    expect(doc.home.heroBadge).toBe(HOME.heroBadge);
    expect(doc.home.heroImage).toBe(ASSET.url);
    expect(doc.home.strip).toEqual(HOME.strip);
    expect(doc.home.features).toEqual(HOME.features);
    expect(doc.home.steps).toEqual(HOME.steps);
    expect(doc.home.pkgBanner).toEqual(HOME.pkgBanner);
  });

  it('normalises both shapes into the exact same document (the shape the site expects)', async () => {
    const [nested] = await runQuery([NESTED_DOC, ...IMAGE_ASSETS]);
    const [flat] = await runQuery([FLAT_DOC, ...IMAGE_ASSETS]);

    expect(flat).toEqual(nested);
    /* No field may leak a null from the shape it does not live in */
    for (const key of TOP_LEVEL_KEYS) expect(nested[key]).toBeDefined();
    for (const key of HOME_KEYS) expect(nested.home[key]).toBeDefined();
  });

  it('reads a half-migrated document (nested identity + root-level home) without losing values', async () => {
    const [doc] = await runQuery([MIXED_DOC, ...IMAGE_ASSETS]);

    /* The query always answers in one shape: flat scalars + a nested `home` block */
    expect(doc).toEqual({
      ...IDENTITY_QUERY_SHAPE,
      ...CONTACT,
      ...ROOT,
      home: { ...HOME, heroImage: ASSET.url },
    });
    expect(doc.home.steps).toEqual(HOME.steps);
  });

  it('leaves the dark-background logo null when only the main logo is uploaded', async () => {
    const { logoDark: _omitted, ...identityWithoutDark } = IDENTITY;
    const [doc] = await runQuery([{ ...HEAD, identity: identityWithoutDark }, ...IMAGE_ASSETS]);

    expect(doc.logo).toBe(LOGO_ASSET.url);
    /* null (not an empty string) → lib/site-data.ts keeps the main logo for every background */
    expect(doc.logoDark).toBeNull();
  });

  it('keeps documents sorted oldest → newest so lib/site-data.ts can merge them', async () => {
    const older = { ...HEAD, _updatedAt: '2026-10-01T00:00:00Z', ...flatten({ identity: IDENTITY }), city: 'بحري' };
    const newer = { ...HEAD, _updatedAt: '2026-10-10T00:00:00Z', city: 'أم درمان' };
    const docs = await runQuery([newer, older, ...IMAGE_ASSETS]);

    expect(docs.map((d) => d.city)).toEqual(['بحري', 'أم درمان']);
  });
});
