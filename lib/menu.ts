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
    { _id: 'c1', slug: 'breakfast', name: 'فطور', icon: 'sun', order: 1 },
    { _id: 'c2', slug: 'sandwiches', name: 'سندوتشات', icon: 'sandwich', order: 2 },
    { _id: 'c3', slug: 'meals', name: 'وجبات', icon: 'flame', order: 3 },
    { _id: 'c4', slug: 'snacks', name: 'سناكس', icon: 'snack', order: 4 },
    { _id: 'c5', slug: 'drinks', name: 'مشروبات صحية', icon: 'cup', order: 5 },
    { _id: 'c6', slug: 'salads', name: 'سلطات', icon: 'leaf', order: 6 },
  ],
  items: [
    /* ── فطور ── */
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
      _id: 'm13',
      slug: 'egg-white-veggie-omelette',
      name: 'عجة بياض البيض بالخضار',
      description: 'بياض ست بيضات مخفوق مع سبانخ وطماطم ومشروم، يُطهى بدون زيت على مقلاة غير لاصقة.',
      price: 5500,
      categorySlug: 'breakfast',
      image: asset('/images/breakfast-omelette.jpg'),
      macros: { kcal: 260, protein: 26, carbs: 8, fat: 6 },
      tags: ['عالٍ بالبروتين', 'بدون زيوت مضافة'],
      popular: true,
      available: true,
    },
    {
      _id: 'm14',
      slug: 'greek-yogurt-parfait',
      name: 'بارفيه الزبادي اليوناني بالجرانولا',
      description: 'طبقات زبادي يوناني قليل الدسم مع جرانولا الشوفان بالعسل وتوت وفراولة طازجة.',
      price: 6000,
      categorySlug: 'breakfast',
      image: asset('/images/breakfast-parfait.jpg'),
      macros: { kcal: 320, protein: 20, carbs: 42, fat: 8 },
      tags: ['غني بالبروتين'],
      available: true,
    },

    /* ── سندوتشات ── */
    {
      _id: 'm15',
      slug: 'grilled-chicken-sandwich',
      name: 'سندوتش الدجاج المشوي الأسمر',
      description: 'شرائح صدر دجاج مشوي متبل مع خس وطماطم وصلصة زبادي بالثوم داخل خبز أسمر كامل الحبة.',
      price: 8500,
      categorySlug: 'sandwiches',
      image: asset('/images/sandwich-chicken.jpg'),
      macros: { kcal: 420, protein: 38, carbs: 45, fat: 10 },
      tags: ['عالٍ بالبروتين'],
      popular: true,
      available: true,
    },
    {
      _id: 'm16',
      slug: 'tuna-protein-wrap',
      name: 'راب التونا الدايت',
      description: 'تونا مصفاة بزبادي يوناني وخضار مقرمشة داخل تورتيلا قمح كامل — خفيف ومنعش.',
      price: 7500,
      categorySlug: 'sandwiches',
      image: asset('/images/wrap-tuna.jpg'),
      macros: { kcal: 380, protein: 32, carbs: 40, fat: 9 },
      tags: ['خفيف', 'عالٍ بالبروتين'],
      available: true,
    },
    {
      _id: 'm17',
      slug: 'whole-wheat-grilled-cheese',
      name: 'سندوتش الجبن المشوي الأسمر',
      description: 'موزاريلا قليلة الدسم وطماطم مشوية بين شريحتي خبز أسمر محمّص — بدون زبدة.',
      price: 6500,
      categorySlug: 'sandwiches',
      image: asset('/images/sandwich-cheese.jpg'),
      macros: { kcal: 350, protein: 18, carbs: 38, fat: 12 },
      tags: ['نباتي'],
      available: true,
    },

    /* ── وجبات ── */
    {
      _id: 'm1',
      slug: 'grilled-chicken-bowl',
      name: 'باول الدجاج المشوي',
      description: 'صدر دجاج مشوي متبل فوق كينوا وأرز بني، مع تشكيلة خضار مشوية على البخار.',
      price: 12500,
      categorySlug: 'meals',
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
      categorySlug: 'meals',
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
      categorySlug: 'meals',
      image: asset('/images/beef-bowl.jpg'),
      macros: { kcal: 640, protein: 48, carbs: 62, fat: 18 },
      tags: ['للضخامة', 'عالٍ بالبروتين'],
      available: true,
    },
    {
      _id: 'm6',
      slug: 'fitbite-mixed-grill',
      name: 'مشويات فيتبايت المشكلة',
      description: 'أسياخ دجاج وكفتة لحم بقري قليلة الدهن مع خضار مشوية — تُشوى بدون زيوت مضافة.',
      price: 18000,
      categorySlug: 'meals',
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
      categorySlug: 'meals',
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
      categorySlug: 'meals',
      image: asset('/images/mealprep-week.jpg'),
      macros: { kcal: 550, protein: 45, carbs: 55, fat: 14 },
      tags: ['ميل بريب'],
      available: true,
    },

    /* ── سناكس ── */
    {
      _id: 'm18',
      slug: 'date-cocoa-energy-balls',
      name: 'كرات الطاقة بالتمر والكاكاو',
      description: 'تمر مجدول وشوفان وكاكاو خام وبذور شيا — ثلاث كرات تكفي طاقة ما قبل التمرين.',
      price: 3500,
      categorySlug: 'snacks',
      image: asset('/images/snack-energyballs.jpg'),
      macros: { kcal: 210, protein: 6, carbs: 32, fat: 7 },
      tags: ['بدون سكر مضاف', 'نباتي'],
      popular: true,
      available: true,
    },
    {
      _id: 'm19',
      slug: 'crispy-roasted-chickpeas',
      name: 'حمص محمص مقرمش بالتوابل',
      description: 'حمص مسلوق يُحمّص بالفرن مع بابريكا وكمون بدون زيوت — قرمشة مالحة بدون ذنب.',
      price: 3000,
      categorySlug: 'snacks',
      image: asset('/images/snack-chickpeas.jpg'),
      macros: { kcal: 180, protein: 10, carbs: 24, fat: 4 },
      tags: ['بدون زيوت مضافة', 'غني بالألياف'],
      available: true,
    },

    /* ── مشروبات صحية ── */
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

    /* ── سلطات ── */
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
  ],
};

/** جلب القائمة — حالياً محلي، ولاحقاً من Sanity (انظر التعليق أعلى الملف) */
export async function getMenu(): Promise<MenuData> {
  return MENU;
}

export const MENU_SYNC = MENU;
