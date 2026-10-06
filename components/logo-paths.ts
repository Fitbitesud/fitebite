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

/** الشوكة النحاسية عند طرف القوس */
export const FORK_TRANSFORM = 'translate(101 92) rotate(40)';
export const FORK_PATHS = {
  handle: 'M0 12 V1',
  base: 'M-4 1 H4',
  tines: 'M-4 1 V-8 M0 1 V-9 M4 1 V-8',
} as const;

/** الورقة الخضراء بجانب الشوكة */
export const LEAF_TRANSFORM = 'translate(104 84) rotate(24) scale(0.85)';
export const LEAF_PATH = 'M0 0 C9 -2 14 -11 11 -19 C2 -16 -3 -8 0 0 Z';
