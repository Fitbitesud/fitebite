import { SITE } from './config';
import { fmt, price } from './format';

/** أهداف الاشتراكات */
export type SubscriptionGoalId = 'bulking' | 'cutting' | 'maintain';

export interface GoalInfo {
  id: SubscriptionGoalId;
  name: string;
  en: string;
  desc: string;
  icon: 'dumbbell' | 'flame' | 'leaf';
  /** توزيع السعرات على الماكروز */
  split: { protein: number; carbs: number; fat: number };
  recommendedKcal: number;
  pricePerMeal: number;
}

export const GOALS: GoalInfo[] = [
  {
    id: 'bulking',
    name: 'تضخيم',
    en: 'Bulking',
    desc: 'فائض سعرات محسوب لبناء العضل بقوة',
    icon: 'dumbbell',
    split: { protein: 0.3, carbs: 0.5, fat: 0.2 },
    recommendedKcal: 3200,
    pricePerMeal: 12000,
  },
  {
    id: 'cutting',
    name: 'تنشيف / تخسيس',
    en: 'Cutting',
    desc: 'عجز سعرات مع بروتين عالٍ يحفظ العضل',
    icon: 'flame',
    split: { protein: 0.4, carbs: 0.3, fat: 0.3 },
    recommendedKcal: 2200,
    pricePerMeal: 11000,
  },
  {
    id: 'maintain',
    name: 'محافظة / أسلوب صحي',
    en: 'Maintenance',
    desc: 'توازن سعرات لنمط حياة صحي ومستقر',
    icon: 'leaf',
    split: { protein: 0.3, carbs: 0.4, fat: 0.3 },
    recommendedKcal: 2600,
    pricePerMeal: 10000,
  },
];

export const MEAL_OPTIONS = [1, 2, 3, 4];

/** خصم الباقة حسب عدد الوجبات اليومية */
export const MEAL_DISCOUNT: Record<number, number> = { 1: 0, 2: 0.05, 3: 0.1, 4: 0.15 };

/** مدة الاشتراك القياسية بالأيام */
export const SUBSCRIPTION_DAYS = 30;

export const KCAL_RANGE = { min: 1800, max: 4000, step: 50 };

export interface DailyMacros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** حساب الماكروز اليومية من السعرات وتوزيع الهدف */
export function computeDailyMacros(goal: GoalInfo, kcal: number): DailyMacros {
  const round5 = (n: number) => Math.round(n / 5) * 5;
  return {
    kcal,
    protein: round5((kcal * goal.split.protein) / 4),
    carbs: round5((kcal * goal.split.carbs) / 4),
    fat: round5((kcal * goal.split.fat) / 9),
  };
}

export interface SubscriptionQuote {
  dailyBefore: number;
  daily: number;
  monthly: number;
  discount: number;
  savings: number;
}

/** تسعير الباقة: سعر الوجبة × العدد − خصم الباقة × 30 يوم */
export function computeQuote(goal: GoalInfo, meals: number): SubscriptionQuote {
  const discount = MEAL_DISCOUNT[meals] ?? 0;
  const dailyBefore = goal.pricePerMeal * meals;
  const daily = Math.round(dailyBefore * (1 - discount));
  const monthly = daily * SUBSCRIPTION_DAYS;
  return { dailyBefore, daily, monthly, discount, savings: (dailyBefore - daily) * SUBSCRIPTION_DAYS };
}

export const mealsLabel = (m: number): string =>
  m === 1 ? 'وجبة واحدة' : m === 2 ? 'وجبتان' : `${m} وجبات`;

/** رسالة واتساب لطلب الاشتراك المخصص */
export function buildSubscriptionMessage(opts: {
  goal: GoalInfo;
  meals: number;
  macros: DailyMacros;
  quote: SubscriptionQuote;
  name: string;
  phone: string;
}): string {
  const { goal, meals, macros, quote, name, phone } = opts;
  const L: string[] = [];
  L.push(`*📋 طلب اشتراك جديد من موقع ${SITE.nameAr}*`);
  L.push('━━━━━━━━━━━━━━━');
  L.push(`🎯 الهدف: ${goal.name} (${goal.en})`);
  L.push(`🍽 عدد الوجبات: ${mealsLabel(meals)} يومياً`);
  L.push(`📅 مدة الاشتراك: ${SUBSCRIPTION_DAYS} يوم`);
  L.push('');
  L.push('*🥗 القيم الغذائية اليومية*');
  L.push(`🔥 السعرات: ${fmt(macros.kcal)} سعرة`);
  L.push(`💪 بروتين: ${fmt(macros.protein)} غ`);
  L.push(`🌾 كاربوهيدرات: ${fmt(macros.carbs)} غ`);
  L.push(`🥑 دهون: ${fmt(macros.fat)} غ`);
  L.push('');
  L.push('*👤 بيانات المشترك*');
  L.push(`• الاسم: ${name}`);
  L.push(`• الجوال: ${phone}`);
  L.push('');
  L.push('*💰 التسعير*');
  L.push(`🍽 سعر الوجبة: ${price(goal.pricePerMeal)}`);
  L.push(
    `🧾 السعر اليومي: ${price(quote.daily)}${
      quote.discount > 0 ? ` (خصم ${quote.discount * 100}%)` : ''
    }`,
  );
  L.push(`💰 *الإجمالي الشهري: ${price(quote.monthly)}*`);
  L.push('');
  L.push(`_أُرسل تلقائياً من موقع ${SITE.nameAr}_ 🌿`);
  return L.join('\n');
}
