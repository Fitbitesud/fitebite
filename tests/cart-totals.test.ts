import { describe, expect, it } from 'bun:test';
import { computeTotals } from '../lib/whatsapp';
import { fakeItem, line, menuItem, SITE } from './helpers';

describe('computeTotals — happy path', () => {
  it('empty cart is all zeros and never charges delivery', () => {
    expect(computeTotals([], SITE)).toEqual({
      count: 0, kcal: 0, protein: 0, subtotal: 0, delivery: 0, total: 0,
    });
  });

  it('single item below the free-delivery threshold pays the delivery fee', () => {
    const t = computeTotals([line(fakeItem({ price: 6500 }), 1)], SITE);
    expect(t.subtotal).toBe(6500);
    expect(t.delivery).toBe(2000);
    expect(t.total).toBe(8500);
    expect(t.count).toBe(1);
  });

  it('multiplies price by quantity', () => {
    const t = computeTotals([line(fakeItem({ price: 6500 }), 3)], SITE);
    expect(t.subtotal).toBe(19500);
    expect(t.total).toBe(21500);
  });

  it('adds several real menu items correctly (price, kcal, protein, count)', () => {
    // m9 = 6500 (340 kcal, 14 g)  ×2 ; m10 = 7500 (410 kcal, 28 g) ×1
    const t = computeTotals([line(menuItem('m9'), 2), line(menuItem('m10'), 1)], SITE);
    expect(t.count).toBe(3); // units, not lines
    expect(t.subtotal).toBe(6500 * 2 + 7500);
    expect(t.kcal).toBe(340 * 2 + 410);
    expect(t.protein).toBe(14 * 2 + 28);
    expect(t.delivery).toBe(2000);
    expect(t.total).toBe(20500 + 2000);
  });

  it('total is always subtotal + delivery', () => {
    for (const price of [1, 999, 20000, 39999, 40000, 40001, 123456]) {
      const t = computeTotals([line(fakeItem({ price }), 1)], SITE);
      expect(t.total).toBe(t.subtotal + t.delivery);
    }
  });
});

describe('computeTotals — free-delivery boundary', () => {
  it('39,999 still pays delivery', () => {
    const t = computeTotals([line(fakeItem({ price: 39999 }), 1)], SITE);
    expect(t.delivery).toBe(2000);
    expect(t.total).toBe(41999);
  });

  it('exactly 40,000 is free (threshold is inclusive)', () => {
    const t = computeTotals([line(fakeItem({ price: 20000 }), 2)], SITE);
    expect(t.delivery).toBe(0);
    expect(t.total).toBe(40000);
  });

  it('40,001 is free', () => {
    const t = computeTotals([line(fakeItem({ price: 40001 }), 1)], SITE);
    expect(t.delivery).toBe(0);
  });

  it('the delivery fee itself does not count toward the threshold', () => {
    // 38,500 + 2,000 fee = 40,500, but the subtotal is what is compared.
    const t = computeTotals([line(fakeItem({ price: 38500 }), 1)], SITE);
    expect(t.delivery).toBe(2000);
    expect(t.total).toBe(40500);
  });

  it('crossing the threshold by adding one more unit removes the fee', () => {
    const it1 = fakeItem({ price: 13500 });
    expect(computeTotals([line(it1, 2)], SITE).delivery).toBe(2000); // 27,000
    expect(computeTotals([line(it1, 3)], SITE).delivery).toBe(0); // 40,500
  });

  it('respects a custom fee and threshold (dashboard settings)', () => {
    const site = { ...SITE, deliveryFee: 3500, freeDeliveryAbove: 15000 };
    expect(computeTotals([line(fakeItem({ price: 14999 }), 1)], site).delivery).toBe(3500);
    expect(computeTotals([line(fakeItem({ price: 15000 }), 1)], site).delivery).toBe(0);
  });

  it('a threshold of 0 means delivery is always free (but never for an empty cart fee-wise)', () => {
    const site = { ...SITE, freeDeliveryAbove: 0 };
    expect(computeTotals([line(fakeItem({ price: 500 }), 1)], site).delivery).toBe(0);
    expect(computeTotals([], site).total).toBe(0);
  });
});

describe('computeTotals — edge cases', () => {
  it('treats missing macros as 0 instead of producing NaN', () => {
    const noMacros = fakeItem({ macros: undefined as any });
    const t = computeTotals([line(noMacros, 2)], SITE);
    expect(t.kcal).toBe(0);
    expect(t.protein).toBe(0);
    expect(Number.isNaN(t.total)).toBe(false);
  });

  it('a zero-quantity line contributes nothing and does not trigger delivery', () => {
    const t = computeTotals([line(fakeItem({ price: 5000 }), 0)], SITE);
    expect(t).toEqual({ count: 0, kcal: 0, protein: 0, subtotal: 0, delivery: 0, total: 0 });
  });

  it('large quantities stay exact integers', () => {
    const t = computeTotals([line(fakeItem({ price: 55000 }), 99)], SITE);
    expect(t.subtotal).toBe(5_445_000);
    expect(Number.isInteger(t.total)).toBe(true);
  });

  it('is pure: same input gives same output and the lines are not mutated', () => {
    const lines = [line(menuItem('m9'), 2)];
    const snapshot = JSON.stringify(lines);
    const a = computeTotals(lines, SITE);
    const b = computeTotals(lines, SITE);
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
