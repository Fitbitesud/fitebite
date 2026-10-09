/**
 * هندسة شعار فيتبايت (إعادة رسم متجهية للشعار الرسمي):
 * دمبل فوق حرف F، حرف B بخط سميك، وقوس سفلي ينتهي بشوكة نحاسية وورقة خضراء.
 * بدون أي نص إنجليزي — الكلمة المرافقة تُرسم بالعربية «فيتبايت».
 */

export const MARK_VIEWBOX = '0 0 120 120';

export const STROKE_MAIN = 11;
export const STROKE_SWOOSH = 7;

export const PATHS = {
  dumbbellBar: 'M38 20 H82',
  dumbbellPlateL: 'M33 10 V30',
  dumbbellPlateR: 'M87 10 V30',
  dumbbellCapL: 'M25 14 V26',
  dumbbellCapR: 'M95 14 V26',
  fStem: 'M46 30 L38 92',
  fArm: 'M43 58 H60',
  b: 'M74 30 V92 M74 30 C96 30 96 58 74 58 C100 58 100 92 74 92',
  swoosh: 'M20 102 C44 114 84 112 102 97',
} as const;

/** ميل خفيف للحرفين (مثل الشعار الأصلي) */
export const LETTERS_TRANSFORM = 'translate(7 0) skewX(-6)';

/** مجموعة الدمبل تدور قليلاً حول مركزها */
export const DUMBBELL_TRANSFORM = 'rotate(-12 60 20)';

/** الشوكة النحاسية أفقية فوق خصرو B كما في الشعار الأصلي */
export const FORK_TRANSFORM = 'translate(70 70) rotate(90)';
export const FORK_PATHS = {
  handle: 'M0 14 V1',
  base: 'M-4.5 1 H4.5',
  tines: 'M-4.5 1 V-9 M0 1 V-10 M4.5 1 V-9',
} as const;

/** الورقة العليا فوق الشوكة */
export const LEAF_TRANSFORM = 'translate(74 52) rotate(35) scale(0.8)';
export const LEAF_PATH = 'M0 0 C9 -2 14 -11 11 -19 C2 -16 -3 -8 0 0 Z';

/** الورقة السفلية تحت القوس */
export const LEAF2_TRANSFORM = 'translate(52 106) rotate(160) scale(0.7)';
