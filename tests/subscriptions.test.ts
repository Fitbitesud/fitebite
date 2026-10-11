import { describe, expect, it } from 'bun:test';
import { fmt } from '../lib/format';
import {
  GOALS,
  MEAL_OPTIONS,
  READY_PACKAGES,
  SUBSCRIPTION_DAYS,
  buildPackageOrderMessage,
  buildSubscriptionMessage,
  computeDailyMacros,
  computeQuote,
  type ReadyPackage,
} from '../lib/subscriptions';
import { SITE } from './helpers';

const goal = (id: string) => GOALS.find((g) => g.id === id)!;

// Independent integer arithmetic (no floats) for the expected values.
const DISCOUNT_PCT: Record<number, number> = { 1: 0, 2: 5, 3: 10, 4: 15 };
const expectedDaily = (perMeal: number, meals: number) =>
  Math.round((perMeal * meals * (100 - DISCOUNT_PCT[meals])) / 100);

describe('computeQuote — subscription pricing', () => {
  for (const g of GOALS) {
    for (const meals of MEAL_OPTIONS) {
      it(`${g.id} × ${meals} meals`, () => {
        const q = computeQuote(g, meals);
        const before = g.pricePerMeal * meals;
        const daily = expectedDaily(g.pricePerMeal, meals);
        expect(q.dailyBefore).toBe(before);
        expect(q.daily).toBe(daily);
        expect(q.monthly).toBe(daily * SUBSCRIPTION_DAYS);
        expect(q.savings).toBe((before - daily) * SUBSCRIPTION_DAYS);
        expect(q.discount * 100).toBeCloseTo(DISCOUNT_PCT[meals], 10);
        expect(Number.isInteger(q.monthly)).toBe(true);
      });
    }
  }

  it('known values: bulking 4 meals = 1,224,000 / month, saving 216,000', () => {
    const q = computeQuote(goal('bulking'), 4);
    expect(q.daily).toBe(40800);
    expect(q.monthly).toBe(1_224_000);
    expect(q.savings).toBe(216_000);
  });

  it('a single meal has no discount', () => {
    const q = computeQuote(goal('maintain'), 1);
    expect(q.discount).toBe(0);
    expect(q.monthly).toBe(300_000);
    expect(q.savings).toBe(0);
  });

  it('more meals per day is never more expensive per meal', () => {
    for (const g of GOALS) {
      const perMeal = MEAL_OPTIONS.map((m) => computeQuote(g, m).daily / m);
      for (let i = 1; i < perMeal.length; i++) expect(perMeal[i]).toBeLessThanOrEqual(perMeal[i - 1]);
    }
  });

  it('an unknown meal count gets no discount instead of NaN', () => {
    const q = computeQuote(goal('cutting'), 7);
    expect(q.discount).toBe(0);
    expect(q.monthly).toBe(11000 * 7 * SUBSCRIPTION_DAYS);
  });
});

describe('computeDailyMacros', () => {
  it('bulking 3,400 kcal → 255 g protein / 425 g carbs / 75 g fat', () => {
    expect(computeDailyMacros(goal('bulking'), 3400)).toEqual({ kcal: 3400, protein: 255, carbs: 425, fat: 75 });
  });

  it('macros re-add to the calories within rounding error (±45 kcal)', () => {
    for (const g of GOALS) {
      for (const kcal of [1800, 2200, 2600, 3200, 4000]) {
        const m = computeDailyMacros(g, kcal);
        expect(Math.abs(m.protein * 4 + m.carbs * 4 + m.fat * 9 - kcal)).toBeLessThanOrEqual(45);
      }
    }
  });

  it('every macro is a multiple of 5', () => {
    const m = computeDailyMacros(goal('cutting'), 2350);
    for (const v of [m.protein, m.carbs, m.fat]) expect(v % 5).toBe(0);
  });

  it('each goal’s split adds up to 100 %', () => {
    for (const g of GOALS) expect(g.split.protein + g.split.carbs + g.split.fat).toBeCloseTo(1, 10);
  });
});

describe('buildSubscriptionMessage', () => {
  const g = goal('bulking');
  const quote = computeQuote(g, 4);
  const macros = computeDailyMacros(g, 3400);
  const msg = buildSubscriptionMessage({ goal: g, meals: 4, macros, quote, name: 'سارة', phone: '0912345678' }, SITE);

  it('carries the quote figures', () => {
    expect(msg).toContain(`السعر اليومي: ${fmt(40800)} ج.س`);
    expect(msg).toContain(`الإجمالي الشهري: ${fmt(1_224_000)} ج.س`);
    expect(msg).toContain('الجوال: 0912345678');
  });

  it('prints the discount as a clean whole number for every meal count', () => {
    for (const meals of MEAL_OPTIONS) {
      const m = buildSubscriptionMessage(
        { goal: g, meals, macros, quote: computeQuote(g, meals), name: 'x', phone: '0' },
        SITE,
      );
      const found = /خصم ([^%]+)%/.exec(m);
      if (DISCOUNT_PCT[meals] === 0) expect(found).toBeNull();
      else expect(found![1]).toBe(String(DISCOUNT_PCT[meals]));
    }
  });
});

describe('buildPackageOrderMessage — ready packages', () => {
  it('every built-in package has an explicit monthly price used in its order message', () => {
    for (const p of READY_PACKAGES) {
      const msg = buildPackageOrderMessage(p, SITE);
      expect(p.priceMonthly).toBeGreaterThan(0);
      expect(msg).toContain(`الباقة: ${p.name}`);
      expect(msg).toContain(`السعر الشهري: ${fmt(p.priceMonthly)} ج.س`);
      expect(msg).not.toContain('خصم');
    }
  });

  it('a dashboard monthly price is preserved exactly as entered', () => {
    const customPrice = { ...READY_PACKAGES[0], priceMonthly: 999_123 };
    expect(buildPackageOrderMessage(customPrice, SITE)).toContain('السعر الشهري: 999,123 ج.س');
  });

  it('an unknown goalId (bad dashboard data) does not crash the page', () => {
    const bad = { ...READY_PACKAGES[0], goalId: 'strength' } as unknown as ReadyPackage;
    expect(() => buildPackageOrderMessage(bad, SITE)).not.toThrow();
  });

  it('package ids are unique (they are used as React keys)', () => {
    const ids = READY_PACKAGES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
