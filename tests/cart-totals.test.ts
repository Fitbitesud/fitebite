import { describe, expect, it } from 'bun:test';
import { computeTotals } from '../lib/whatsapp';
import { fakeItem, line, menuItem } from './helpers';

describe('computeTotals — happy path', () => {
  it('empty cart is all zeros', () => {
    expect(computeTotals([])).toEqual({
      count: 0, kcal: 0, protein: 0, subtotal: 0, delivery: 0, total: 0,
    });
  });

  it('a single item is charged at its own price — with no fee the total adds nothing on top', () => {
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

  it('with no fee, total is always the sum of the lines, whatever they cost', () => {
    for (const price of [1, 999, 20000, 39999, 40000, 40001, 123456]) {
      const t = computeTotals([line(fakeItem({ price }), 1)]);
      expect(t.total).toBe(t.subtotal);
      expect(t.total).toBe(price);
    }
  });
});

describe('computeTotals — fixed delivery fee per region', () => {
  it('with no fee (the default until one is set in the dashboard) the total is the food value only', () => {
    const t = computeTotals([line(fakeItem(), 3)]);
    expect(t.delivery).toBe(0);
    expect(t.total).toBe(t.subtotal);
  });

  it('adds the fixed fee once — not per item or per unit', () => {
    const t = computeTotals([line(fakeItem({ price: 5000 }), 4)], 2500);
    expect(t.subtotal).toBe(20000);
    expect(t.delivery).toBe(2500);
    expect(t.total).toBe(22500);
  });

  it('the fee is independent of the cart size (no free-delivery threshold)', () => {
    for (const price of [500, 6500, 10000, 39999, 40000, 40001, 250000]) {
      const t = computeTotals([line(fakeItem({ price }), 1)], 2000);
      expect(Object.values(t).every((v) => Number.isFinite(v))).toBe(true);
      expect([t.subtotal, t.delivery, t.total]).toEqual([price, 2000, price + 2000]);
    }
  });

  it('total = Σ price × qty + one fixed delivery fee', () => {
    const item = fakeItem({ price: 13500 });
    for (const qty of [1, 2, 3, 9]) {
      expect(computeTotals([line(item, qty)], 3000).total).toBe(13500 * qty + 3000);
    }
  });

  it('an empty cart never pays a delivery fee', () => {
    expect(computeTotals([], 5000)).toEqual({
      count: 0, kcal: 0, protein: 0, subtotal: 0, delivery: 0, total: 0,
    });
  });

  it('a broken fee (negative / fractional / NaN / text) is cleaned instead of corrupting the total', () => {
    const lineItem = line(fakeItem({ price: 6500 }), 2);
    for (const bad of [-3000, -1, NaN, Infinity, 'abc', null, undefined, '', '2,000', 2499.6]) {
      const t = computeTotals([lineItem], bad as never);
      expect(Number.isFinite(t.delivery)).toBe(true);
      expect(Number.isInteger(t.delivery)).toBe(true);
      expect(t.delivery).toBeGreaterThanOrEqual(0);
      expect(t.total).toBe(t.subtotal + t.delivery);
    }
    expect(computeTotals([lineItem], '2,000' as never).delivery).toBe(2000);
    expect(computeTotals([lineItem], 2499.6).delivery).toBe(2500);
    expect(computeTotals([lineItem], -3000).delivery).toBe(0);
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

  it('a zero-quantity line contributes nothing (and no delivery fee)', () => {
    const t = computeTotals([line(fakeItem({ price: 5000 }), 0)], 3000);
    expect(t).toEqual({ count: 0, kcal: 0, protein: 0, subtotal: 0, delivery: 0, total: 0 });
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
