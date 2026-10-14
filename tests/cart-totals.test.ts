import { describe, expect, it } from 'bun:test';
import { computeTotals } from '../lib/whatsapp';
import { fakeItem, line, menuItem } from './helpers';

describe('computeTotals — happy path', () => {
  it('empty cart is all zeros', () => {
    expect(computeTotals([])).toEqual({
      count: 0, kcal: 0, protein: 0, subtotal: 0, total: 0,
    });
  });

  it('a single item is charged at its own price — the total adds nothing on top', () => {
    const t = computeTotals([line(fakeItem({ price: 6500 }), 1)]);
    expect(t.subtotal).toBe(6500);
    expect(t.total).toBe(6500);
    expect(t.count).toBe(1);
  });

  it('multiplies price by quantity', () => {
    const t = computeTotals([line(fakeItem({ price: 6500 }), 3)]);
    expect(t.subtotal).toBe(19500);
    expect(t.total).toBe(19500);
  });

  it('adds several real menu items correctly (price, kcal, protein, count)', () => {
    // m9 = 6500 (340 kcal, 14 g)  ×2 ; m10 = 7500 (410 kcal, 28 g) ×1
    const t = computeTotals([line(menuItem('m9'), 2), line(menuItem('m10'), 1)]);
    expect(t.count).toBe(3); // units, not lines
    expect(t.subtotal).toBe(6500 * 2 + 7500);
    expect(t.kcal).toBe(340 * 2 + 410);
    expect(t.protein).toBe(14 * 2 + 28);
    expect(t.total).toBe(20500);
  });

  it('total is always the sum of the lines, whatever they cost', () => {
    for (const price of [1, 999, 20000, 39999, 40000, 40001, 123456]) {
      const t = computeTotals([line(fakeItem({ price }), 1)]);
      expect(t.total).toBe(t.subtotal);
      expect(t.total).toBe(price);
    }
  });
});

describe('computeTotals — no delivery fee at all', () => {
  it('the totals carry no delivery field (التوصيل مع مندوب التوصيل، لا رسوم على الموقع)', () => {
    expect(computeTotals([line(fakeItem(), 3)])).not.toHaveProperty('delivery');
  });

  it('a large cart is charged for the food only — nothing is added at any total', () => {
    for (const price of [500, 6500, 10000, 39999, 40000, 40001, 250000]) {
      const t = computeTotals([line(fakeItem({ price }), 1)]);
      expect(Object.values(t).every((v) => Number.isFinite(v))).toBe(true);
      expect(t.total).toBe(price);
    }
  });

  it('adding to the cart never changes the money story: total = Σ price × qty', () => {
    const item = fakeItem({ price: 13500 });
    for (const qty of [1, 2, 3, 9]) {
      expect(computeTotals([line(item, qty)]).total).toBe(13500 * qty);
    }
  });

  it('the old free-delivery threshold (40,000) means nothing now — same rule above and below it', () => {
    const below = computeTotals([line(fakeItem({ price: 39999 }), 1)]);
    const exact = computeTotals([line(fakeItem({ price: 40000 }), 1)]);
    const above = computeTotals([line(fakeItem({ price: 40001 }), 1)]);
    expect([below.total, exact.total, above.total]).toEqual([39999, 40000, 40001]);
  });
});

describe('computeTotals — edge cases', () => {
  it('treats missing macros as 0 instead of producing NaN', () => {
    const noMacros = fakeItem({ macros: undefined as any });
    const t = computeTotals([line(noMacros, 2)]);
    expect(t.kcal).toBe(0);
    expect(t.protein).toBe(0);
    expect(Number.isNaN(t.total)).toBe(false);
  });

  it('a zero-quantity line contributes nothing', () => {
    const t = computeTotals([line(fakeItem({ price: 5000 }), 0)]);
    expect(t).toEqual({ count: 0, kcal: 0, protein: 0, subtotal: 0, total: 0 });
  });

  it('large quantities stay exact integers', () => {
    const t = computeTotals([line(fakeItem({ price: 55000 }), 99)]);
    expect(t.subtotal).toBe(5_445_000);
    expect(t.total).toBe(5_445_000);
    expect(Number.isInteger(t.total)).toBe(true);
  });

  it('is pure: same input gives same output and the lines are not mutated', () => {
    const lines = [line(menuItem('m9'), 2)];
    const snapshot = JSON.stringify(lines);
    const a = computeTotals(lines);
    const b = computeTotals(lines);
    expect(a).toEqual(b);
    expect(JSON.stringify(lines)).toBe(snapshot);
  });

  it('every real menu item has a positive integer price and complete macros', () => {
    // Guards the data feeding the cart: a 0 / fractional / missing price would corrupt totals.
    const { MENU_SYNC } = require('../lib/menu');
    for (const i of MENU_SYNC.items) {
      expect(Number.isInteger(i.price) && i.price > 0).toBe(true);
      for (const k of ['kcal', 'protein', 'carbs', 'fat'] as const) {
        expect(Number.isFinite(i.macros?.[k])).toBe(true);
      }
    }
  });

  it('every real menu item has a unique _id (the cart is keyed by _id)', () => {
    const { MENU_SYNC } = require('../lib/menu');
    const ids = MENU_SYNC.items.map((i: { _id: string }) => i._id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
