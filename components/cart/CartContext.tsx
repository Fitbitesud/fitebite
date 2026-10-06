'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { MENU_SYNC } from '@/lib/menu';
import type { CartLine, OrderTotals } from '@/lib/types';
import { computeTotals } from '@/lib/whatsapp';
import { IconCheck } from '../Icons';

const STORAGE_KEY = 'fitbite_cart_v1';

interface CartContextValue {
  lines: CartLine[];
  qtyOf: (id: string) => number;
  add: (id: string) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  totals: OrderTotals;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCart(JSON.parse(raw) as Record<string, number>);
    } catch {
      /* تجاهل سلة تالفة */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const add = useCallback(
    (id: string) => {
      setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
      const item = MENU_SYNC.items.find((i) => i._id === id);
      if (item) showToast(`تمت إضافة «${item.name}» إلى السلة`);
    },
    [showToast],
  );

  const inc = useCallback((id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 })), []);
  const dec = useCallback(
    (id: string) =>
      setCart((c) => {
        const q = (c[id] ?? 0) - 1;
        const next = { ...c };
        if (q <= 0) delete next[id];
        else next[id] = q;
        return next;
      }),
    [],
  );
  const remove = useCallback(
    (id: string) =>
      setCart((c) => {
        const next = { ...c };
        delete next[id];
        return next;
      }),
    [],
  );
  const clear = useCallback(() => setCart({}), []);

  const lines = useMemo<CartLine[]>(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({ item: MENU_SYNC.items.find((i) => i._id === id), qty }))
        .filter((l): l is CartLine => Boolean(l.item)),
    [cart],
  );

  const totals = useMemo(() => computeTotals(lines), [lines]);
  const qtyOf = useCallback((id: string) => cart[id] ?? 0, [cart]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      qtyOf,
      add,
      inc,
      dec,
      remove,
      clear,
      totals,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }),
    [lines, qtyOf, add, inc, dec, remove, clear, totals, isOpen],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* توست الإضافة للسلة */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            className="fixed bottom-6 left-1/2 z-[95] flex -translate-x-1/2 items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-extrabold text-cream shadow-lift"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-leaf text-white">
              <IconCheck className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
