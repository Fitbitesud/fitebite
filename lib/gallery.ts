import { asset } from './config';
import { getReadClient, isSanityConfigured, type ReadClientOptions } from './sanity/client';
import { GALLERY_QUERY } from './sanity/queries';

/**
 * معرض الأعمال — صور أطباق وأعمال وتجهيزات المطعم في صفحة `/gallery`.
 * تُدار من قائمة «معرض الأعمال» (`galleryItem`) في لوحة تحكم Sanity.
 */
export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  desc: string;
  image: string;
  active: boolean;
  order?: number;
}

export const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: 'gal-hero-bowl',
    title: 'باول الدجاج المشوي المتوازن',
    category: 'الأطباق والباولز',
    desc: 'صدر دجاج مشوي متبّل مع أرز بسمتي وخضار مطهوة على البخار محسوبة بالغرام.',
    image: asset('/images/hero-bowl.jpg'),
    active: true,
    order: 1,
  },
  {
    id: 'gal-mealprep-week',
    title: 'تجهيز باقات الأسبوع للمشتركين',
    category: 'تجهيز البوكسات',
    desc: 'تحضير وتغليف يومي منظم لوجبات المشتركين في أنظمة التضخيم والتنشيف.',
    image: asset('/images/mealprep-week.jpg'),
    active: true,
    order: 2,
  },
  {
    id: 'gal-grill-plate',
    title: 'طبق المشويات المشكّلة الصحية',
    category: 'المشويات والسلطات',
    desc: 'تشكيلة مشويات طازجة مطهوة بدون زيوت ضارة وغنية بالبروتين الصافي.',
    image: asset('/images/grill-plate.jpg'),
    active: true,
    order: 3,
  },
  {
    id: 'gal-salmon-bowl',
    title: 'باول السلمون بالأوميغا 3',
    category: 'الأطباق والباولز',
    desc: 'فيليه سلمون مشوي مع الكينوا والأفوكادو والخضار الطازجة.',
    image: asset('/images/salmon-bowl.jpg'),
    active: true,
    order: 4,
  },
  {
    id: 'gal-mealprep-box',
    title: 'بوكس الغداء اليومي المحسوب',
    category: 'تجهيز البوكسات',
    desc: 'عبوات حفظ صحية تحافظ على جودة الوجبة وطراوتها حتى وصولها إليك.',
    image: asset('/images/mealprep-box.jpg'),
    active: true,
    order: 5,
  },
  {
    id: 'gal-beef-bowl',
    title: 'باول اللحم الصافي للضخامة',
    category: 'الأطباق والباولز',
    desc: 'شرائح لحم بقري صافي قليل الدهون مع حصة مدروسة من الكاربوهيدرات المعقدة.',
    image: asset('/images/beef-bowl.jpg'),
    active: true,
    order: 6,
  },
  {
    id: 'gal-quinoa-salad',
    title: 'سلطة الكينوا والخضار الطازجة',
    category: 'المشويات والسلطات',
    desc: 'طبق منعش عالي الألياف والفيتامينات مثالي لأنظمة التنشيف والخفة.',
    image: asset('/images/quinoa-salad.jpg'),
    active: true,
    order: 7,
  },
  {
    id: 'gal-protein-pancakes',
    title: 'بانكيك الشوفان عالي البروتين',
    category: 'الفطور والمشروبات',
    desc: 'فطور رياضي مشبع بدون سكر مكرر يمنحك طاقة متوازنة لبداية اليوم.',
    image: asset('/images/protein-pancakes.jpg'),
    active: true,
    order: 8,
  },
  {
    id: 'gal-smoothies',
    title: 'سموذي ومشروبات الطاقة الطبيعية',
    category: 'الفطور والمشروبات',
    desc: 'مشروبات فواكه وبروتين طبيعية تُحضّر طازجة عند الطلب.',
    image: asset('/images/smoothies.jpg'),
    active: true,
    order: 9,
  },
];

type RawGalleryDoc = {
  _id: string;
  title?: string | null;
  category?: string | null;
  desc?: string | null;
  image?: string | null;
  active?: boolean | null;
  order?: number | null;
};

function coerceGalleryItem(d: RawGalleryDoc): GalleryItem | null {
  const title = typeof d.title === 'string' ? d.title.trim() : '';
  const image = typeof d.image === 'string' ? d.image.trim() : '';
  if (!title || !image) return null;
  return {
    id: d._id,
    title,
    category:
      typeof d.category === 'string' && d.category.trim()
        ? d.category.trim()
        : 'الأطباق والباولز',
    desc: typeof d.desc === 'string' ? d.desc.trim() : '',
    image,
    active: d.active !== false,
    order: typeof d.order === 'number' && Number.isFinite(d.order) ? d.order : undefined,
  };
}

const byOrder = (a: GalleryItem, b: GalleryItem): number => (a.order ?? 0) - (b.order ?? 0);

/** جلب أعمال وصور المطعم من لوحة التحكم مع رجوع تلقائي للمعرض المحلي */
export async function getGalleryItems(options: ReadClientOptions = {}): Promise<GalleryItem[]> {
  if (isSanityConfigured) {
    try {
      const docs = await getReadClient(options).fetch<RawGalleryDoc[]>(GALLERY_QUERY);
      if (Array.isArray(docs)) {
        const live = docs
          .filter((d) => d && d._id)
          .map(coerceGalleryItem)
          .filter((g): g is GalleryItem => g !== null)
          .filter((g) => g.active)
          .sort(byOrder);
        if (live.length) return live;
        if (docs.length) return [];
      }
    } catch (err) {
      console.error('Sanity gallery fetch failed — falling back to local:', err);
    }
  }
  return DEFAULT_GALLERY.filter((g) => g.active).sort(byOrder);
}
