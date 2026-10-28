/**
 * The local catalogue is preview-only. Once the dashboard has published menu
 * content, its data is the only data shown; images must still resolve safely
 * through imgUrl.
 */
import { beforeEach, describe, expect, it } from 'bun:test';
import { getMenu, MENU_SYNC } from '../lib/menu';
import { getReadyPackages, READY_PACKAGES } from '../lib/subscriptions';
import { imgUrl } from '../lib/site-data';
import { setSanityDoc, setSanityError } from './helpers';

beforeEach(() => setSanityDoc(null));

describe('getMenu — dashboard content replaces the preview catalogue', () => {
  const sanityCategories = [{ _id: 'sc1', slug: 'bowls', name: 'باولز', icon: 'bowl', order: 1 }];
  const sanityItems = [
    {
      _id: 'si1',
      slug: 'test-bowl',
      name: 'باول اختبار',
      description: '',
      price: 9000,
      categorySlug: 'bowls',
      image: 'https://cdn.sanity.io/images/x/y/z.jpg',
      macros: { kcal: 400, protein: 30, carbs: 40, fat: 10 },
      tags: [],
      available: true,
    },
  ];

  it('dashboard categories + no items → no local preview items are mixed in', async () => {
    setSanityDoc({ categories: sanityCategories, items: [] });
    expect(await getMenu()).toEqual({ categories: sanityCategories, items: [] });
  });

  it('dashboard items + no categories → no local preview categories are mixed in', async () => {
    setSanityDoc({ categories: [], items: sanityItems });
    expect(await getMenu()).toEqual({ categories: [], items: sanityItems });
  });

  it('fully published menu is used as-is', async () => {
    setSanityDoc({ categories: sanityCategories, items: sanityItems });
    const menu = await getMenu();
    expect(menu).toEqual({ categories: sanityCategories, items: sanityItems });
  });

  it('no dashboard data or a network failure → full local preview menu', async () => {
    setSanityDoc({ categories: [], items: [] });
    expect(await getMenu()).toBe(MENU_SYNC);

    setSanityError(new Error('cdn unreachable'));
    expect(await getMenu()).toBe(MENU_SYNC);
  });
});

describe('getReadyPackages — partial dashboard documents are normalised, not dropped', () => {
  it('a package without a manually entered monthly price is not shown', async () => {
    setSanityDoc([{ _id: 'p1', name: 'باقة جديدة' }]);

    expect(await getReadyPackages()).toEqual([]);
  });

  it('an unknown goal id does not hide the package', async () => {
    setSanityDoc([
      { _id: 'p2', name: 'باقة', goalId: 'not-a-goal', meals: 2, kcal: 2000, priceMonthly: 250000 },
    ]);
    const packages = await getReadyPackages();
    expect(packages).toHaveLength(1);
    expect(packages[0].meals).toBe(2);
    expect(packages[0].kcal).toBe(2000);
  });

  it('valid dashboard values are kept untouched', async () => {
    setSanityDoc([
      {
        _id: 'p3',
        name: 'باقة التضخيم',
        goalId: 'bulking',
        meals: 4,
        kcal: 3200,
        desc: 'وصف',
        badge: 'مميزة',
        image: 'https://cdn.sanity.io/images/a/b/c.jpg',
        priceMonthly: 300000,
      },
    ]);
    const packages = await getReadyPackages();
    expect(packages[0]).toMatchObject({
      name: 'باقة التضخيم',
      goalId: 'bulking',
      meals: 4,
      kcal: 3200,
      badge: 'مميزة',
      priceMonthly: 300000,
    });
  });

  it('لوحة التحكم بها باقات صالحة → تستبدل الباقات المحلية الجاهزة بالكامل ولا تختلط بها', async () => {
    setSanityDoc([
      {
        _id: 'p-dash-1',
        name: 'باقة من لوحة التحكم',
        goalId: 'cutting',
        meals: 2,
        kcal: 2200,
        priceMonthly: 150000,
      },
      {
        _id: 'p-dash-2',
        name: 'باقة ثانية من لوحة التحكم',
        goalId: 'bulking',
        meals: 4,
        kcal: 3400,
        priceMonthly: 400000,
      },
    ]);
    const packages = await getReadyPackages();
    expect(packages).toHaveLength(2);
    expect(packages.map((p) => p.id)).toEqual(['p-dash-1', 'p-dash-2']);
    expect(packages.map((p) => p.name)).toEqual([
      'باقة من لوحة التحكم',
      'باقة ثانية من لوحة التحكم',
    ]);
    // الباقات المضمنة في الكود (التجريبية الأولية) لا تظهر عند وجود باقات من لوحة التحكم
    expect(packages.map((p) => p.id)).not.toContain('bulk-pro');
    expect(packages.map((p) => p.id)).not.toContain('maintain-light');
  });

  it('no dashboard packages or a network failure → local packages', async () => {
    setSanityDoc([]);
    expect(await getReadyPackages()).toEqual(READY_PACKAGES);

    setSanityError(new Error('cdn unreachable'));
    expect(await getReadyPackages()).toEqual(READY_PACKAGES);
  });
});

describe('imgUrl — dashboard and local images resolve safely', () => {
  it('absolute Sanity CDN urls pass through unchanged', () => {
    const url = 'https://cdn.sanity.io/images/proj/ds/asset.jpg';
    expect(imgUrl(url)).toBe(url);
  });

  it('relative public paths get the base path (if any) prefixed once', () => {
    expect(imgUrl('/images/hero-bowl.jpg')).toContain('/images/hero-bowl.jpg');
  });

  it('missing/empty image falls back to the default hero image', () => {
    expect(imgUrl('')).toContain('/images/hero-bowl.jpg');
    expect(imgUrl(undefined)).toContain('/images/hero-bowl.jpg');
    expect(imgUrl(null)).toContain('/images/hero-bowl.jpg');
  });
});
