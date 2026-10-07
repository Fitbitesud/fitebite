import { asset } from './config';
import type { MenuData } from './types';

/**
 * مصدر بيانات القائمة حالياً: بيانات محلية.
 * ─────────────────────────────────────────────────────────────
 * للربط مع Sanity لاحقاً: استبدل جسم getMenu() بـ:
 *
 *   import { createClient } from 'next-sanity';
 *   const client = createClient({ projectId, dataset, apiVersion: '2026-01-01', useCdn: true });
 *
 *   const items = await client.fetch<MenuData>(`
 *     {
 *       "categories": *[_type == "category"] | order(order asc) { _id, slug, name, icon, order },
 *       "items": *[_type == "menuItem" && available] | order(order asc) {
 *          _id, slug, name, description, price,
 *          "categorySlug": category->slug,
 *          "image": image.asset->url,
 *          macros { kcal, protein, carbs, fat },
 *          tags, popular, available
 *       }
 *     }
 *   `);
 *
 * أنواع lib/types.ts مطابقة للحقول أعلاه — لا حاجة لتغيير أي مكوّن واجهة.
 */

const MENU: MenuData = {
  categories: [
    { _id: 'c1', slug: 'bowls', name: 'باولز صحية', icon: 'bowl', order: 1 },
    { _id: 'c2', slug: 'salads', name: 'سلطات', icon: 'leaf', order: 2 },
    { _id: 'c3', slug: 'grill', name: 'مشويات وبوكسات', icon: 'flame', order: 3 },
    { _id: 'c4', slug: 'breakfast', name: 'فطور صحي', icon: 'sun', order: 4 },
    { _id: 'c5', slug: 'drinks', name: 'مشروبات صحية', icon: 'cup', order: 5 },
  ],
  items: [
    {
      _id: 'm1',
      slug: 'grilled-chicken-bowl',
      name: 'باول الدجاج المشوي',
      description: 'صدر دجاج مشوي متبل فوق كينوا وأرز بني، مع تشكيلة خضار مشوية على البخار.',
      price: 12500,
      categorySlug: 'bowls',
      image: asset('/images/hero-bowl.jpg'),
      macros: { kcal: 520, protein: 45, carbs: 58, fat: 12 },
      tags: ['عالٍ بالبروتين', 'بدون زيوت مضافة'],
      popular: true,
      available: true,
    },
    {
      _id: 'm2',
      slug: 'grilled-salmon-bowl',
      name: 'باول السلمون المشوي',
      description: 'فيليه سلمون مشوي بقشرة ذهبية فوق أرز وكينوا، مع هليون وطماطم مشوية.',
      price: 16500,
      categorySlug: 'bowls',
      image: asset('/images/salmon-bowl.jpg'),
      macros: { kcal: 610, protein: 42, carbs: 60, fat: 22 },
      tags: ['أوميغا 3', 'للضخامة'],
      available: true,
    },
    {
      _id: 'm3',
      slug: 'beef-sweet-potato-bowl',
      name: 'باول اللحم والبطاطا الحلوة',
      description: 'شرائح لحم بقري مشوي قليلة الدهن فوق مهروس البطاطا الحلوة، مع خضار الموسم.',
      price: 14500,
      categorySlug: 'bowls',
      image: asset('/images/beef-bowl.jpg'),
      macros: { kcal: 640, protein: 48, carbs: 62, fat: 18 },
      tags: ['للضخامة', 'عالٍ بالبروتين'],
      available: true,
    },
    {
      _id: 'm4',
      slug: 'fitbite-green-salad',
      name: 'سلطة فيتبايت الخضراء بالدجاج',
      description: 'سبانخ صغيرة، جرجير، طماطم شيري وخيار مع شرائح صدر دجاج مشوي وتتبيلة ليمون.',
      price: 9500,
      categorySlug: 'salads',
      image: asset('/images/green-salad.jpg'),
      macros: { kcal: 380, protein: 35, carbs: 22, fat: 14 },
      tags: ['منخفض الكاربوهيدرات', 'للتنشيف'],
      popular: true,
      available: true,
    },
    {
      _id: 'm5',
      slug: 'quinoa-chickpea-salad',
      name: 'سلطة الكينوا والحمص المشوي',
      description: 'كينوا ملونة، حمص محمص، خضار ملونة وبقدونس مع صلصة ليمون — نباتية 100%.',
      price: 8500,
      categorySlug: 'salads',
      image: asset('/images/quinoa-salad.jpg'),
      macros: { kcal: 420, protein: 18, carbs: 55, fat: 12 },
      tags: ['نباتي', 'غني بالألياف'],
      available: true,
    },
    {
      _id: 'm6',
      slug: 'fitbite-mixed-grill',
      name: 'مشويات فيتبايت المشكلة',
      description: 'أسياخ دجاج وكفتة لحم بقري قليلة الدهن مع خضار مشوية — تُشوى بدون زيوت مضافة.',
      price: 18000,
      categorySlug: 'grill',
      image: asset('/images/grill-plate.jpg'),
      macros: { kcal: 720, protein: 58, carbs: 24, fat: 28 },
      tags: ['عالٍ بالبروتين', 'بدون زيوت مضافة'],
      popular: true,
      available: true,
    },
    {
      _id: 'm7',
      slug: 'chicken-protein-box',
      name: 'بوكس الدجاج الجاهز',
      description: 'صدر دجاج مشوي، أرز بني بالأعشاب وخضار على البخار — بوكس عملي ليومك الدراسي أو المكتبي.',
      price: 11500,
      categorySlug: 'grill',
      image: asset('/images/mealprep-box.jpg'),
      macros: { kcal: 480, protein: 42, carbs: 52, fat: 10 },
      tags: ['وجبة عمل', 'عالٍ بالبروتين'],
      available: true,
    },
    {
      _id: 'm8',
      slug: 'weekly-meal-prep',
      name: 'نظام وجبات الأسبوع (5 وجبات)',
      description: 'خمس وجبات محسوبة الماكروز حسب هدفك (ضخامة/تنشيف)، تُسلّم طازجة بداية الأسبوع.',
      price: 55000,
      categorySlug: 'grill',
      image: asset('/images/mealprep-week.jpg'),
      macros: { kcal: 550, protein: 45, carbs: 55, fat: 14 },
      tags: ['ميال بريب'],
      available: true,
    },
    {
      _id: 'm9',
      slug: 'berry-oat-bowl',
      name: 'باول الشوفان بالتوت',
      description: 'شوفان كريمي بالحليب قليل الدسم مع توت أزرق، موز، لوز وبذور الشيا.',
      price: 6500,
      categorySlug: 'breakfast',
      image: asset('/images/breakfast-bowl.jpg'),
      macros: { kcal: 340, protein: 14, carbs: 52, fat: 9 },
      tags: ['غني بالألياف'],
      available: true,
    },
    {
      _id: 'm10',
      slug: 'protein-pancakes',
      name: 'بان كيك البروتين',
      description: 'بان كيك شوفان كامل الحبة بزبدة الفول السوداني، موز وتوت — بدون سكر مضاف.',
      price: 7500,
      categorySlug: 'breakfast',
      image: asset('/images/protein-pancakes.jpg'),
      macros: { kcal: 410, protein: 28, carbs: 44, fat: 12 },
      tags: ['بدون سكر مضاف', 'عالٍ بالبروتين'],
      available: true,
    },
    {
      _id: 'm11',
      slug: 'green-detox-smoothie',
      name: 'سموذي أخضر ديتوكس',
      description: 'سبانخ، أناناس، تفاح أخضر، زنجبيل وليمون — طاقة نظيفة لبداية اليوم.',
      price: 4500,
      categorySlug: 'drinks',
      image: asset('/images/smoothies.jpg'),
      macros: { kcal: 180, protein: 4, carbs: 40, fat: 1 },
      tags: ['نباتي'],
      available: true,
    },
    {
      _id: 'm12',
      slug: 'peanut-banana-shake',
      name: 'شيك زبدة الفول السوداني والموز',
      description: 'حليب قليل الدسم، موز، زبدة فول سوداني وشوفان — 30غ بروتين للتعافي بعد التمرين.',
      price: 5000,
      categorySlug: 'drinks',
      image: asset('/images/pb-shake.jpg'),
      macros: { kcal: 380, protein: 30, carbs: 42, fat: 11 },
      tags: ['تعافي عضلي'],
      available: true,
    },
  ],
};

/** جلب القائمة — حالياً محلي، ولاحقاً من Sanity (انظر التعليق أعلى الملف) */
export async function getMenu(): Promise<MenuData> {
  return MENU;
}

export const MENU_SYNC = MENU;
