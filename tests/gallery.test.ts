import { beforeEach, describe, expect, it } from 'bun:test';
import { DEFAULT_GALLERY, getGalleryItems } from '../lib/gallery';
import { setSanityDoc, setSanityError } from './helpers';

beforeEach(() => setSanityDoc(null));

describe('portfolio gallery (معرض الأعمال)', () => {
  it('ships rich default restaurant work items with categories and valid images', async () => {
    expect(DEFAULT_GALLERY.length).toBeGreaterThanOrEqual(6);
    const ids = new Set(DEFAULT_GALLERY.map((g) => g.id));
    expect(ids.size).toBe(DEFAULT_GALLERY.length);
    expect(await getGalleryItems()).toEqual(DEFAULT_GALLERY);
  });

  it('reads Sanity gallery items sorted by order and assigns a default category if omitted', async () => {
    setSanityDoc([
      {
        _id: 'g2',
        title: 'صورة ثانية',
        category: 'من داخل المطبخ',
        desc: 'تحضير يومي',
        image: 'https://cdn.sanity.io/images/zes52trp/production/work2.jpg',
        active: true,
        order: 2,
      },
      {
        _id: 'g1',
        title: 'صورة أولى',
        image: 'https://cdn.sanity.io/images/zes52trp/production/work1.jpg',
        active: true,
        order: 1,
      },
      {
        _id: 'g-no-img',
        title: 'بلا صورة',
        image: '',
        active: true,
        order: 0,
      },
    ]);

    const items = await getGalleryItems();
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      id: 'g1',
      title: 'صورة أولى',
      category: 'الأطباق والباولز',
    });
    expect(items[1].category).toBe('من داخل المطبخ');
  });

  it('falls back to local gallery on network failure', async () => {
    setSanityError(new Error('timeout'));
    expect(await getGalleryItems()).toEqual(DEFAULT_GALLERY);
  });
});
