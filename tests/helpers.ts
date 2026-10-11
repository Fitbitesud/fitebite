import { DEFAULT_SITE, type SiteData } from '../lib/site-data';
import { MENU_SYNC } from '../lib/menu';
import type { CartLine, MenuItem } from '../lib/types';

/** Real menu item by id (prices/macros come from lib/menu.ts, so tests track the real data). */
export function menuItem(id: string): MenuItem {
  const found = MENU_SYNC.items.find((i) => i._id === id);
  if (!found) throw new Error(`menu item ${id} not found`);
  return found;
}

/** Synthetic menu item with a chosen price — handy for boundary tests. */
export function fakeItem(over: Partial<MenuItem> = {}): MenuItem {
  return {
    _id: 'test-item',
    slug: 'test-item',
    name: 'وجبة اختبار',
    description: '',
    price: 1000,
    categorySlug: 'meals',
    image: '',
    macros: { kcal: 100, protein: 10, carbs: 10, fat: 5 },
    tags: [],
    available: true,
    ...over,
  };
}

export const line = (item: MenuItem, qty: number): CartLine => ({ item, qty });

/** Site with known delivery rules, independent of whatever config.ts currently says. */
export const SITE: SiteData = { ...DEFAULT_SITE, deliveryFee: 2000, freeDeliveryAbove: 40000 };

export const setSanityDoc = (doc: unknown) => {
  (globalThis as any).__SANITY = {
    doc,
    error: null,
    readModes: [],
    writeEnabled: false,
    writeError: null,
    createdComments: [],
  };
};
export const setSanityError = (error: unknown) => {
  (globalThis as any).__SANITY = {
    doc: null,
    error,
    readModes: [],
    writeEnabled: false,
    writeError: null,
    createdComments: [],
  };
};
export const getSanityReadModes = (): boolean[] => (globalThis as any).__SANITY.readModes;
export const enableSanityCommentWrites = (error: unknown = null) => {
  const sanity = (globalThis as any).__SANITY;
  sanity.writeEnabled = true;
  sanity.writeError = error;
};
export const getSanityCreatedComments = (): unknown[] => (globalThis as any).__SANITY.createdComments;
