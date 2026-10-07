'use client';

import { motion } from 'framer-motion';
import { SITE } from '@/lib/config';
import { fmt } from '@/lib/format';
import type { MenuItem } from '@/lib/types';
import { useCart } from './cart/CartContext';
import { IconFlame, IconMinus, IconPlus } from './Icons';

export default function MenuCard({ item, index }: { item: MenuItem; index: number }) {
  const { qtyOf, add, inc, dec } = useCart();
  const qty = qtyOf(item._id);

  const macros = [
    { v: item.macros.kcal, l: 'سعرة' },
    { v: item.macros.protein, l: 'بروتين غ' },
    { v: item.macros.carbs, l: 'كارب غ' },
    { v: item.macros.fat, l: 'دهون غ' },
  ];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.06 }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-sand bg-card shadow-soft transition-shadow duration-300 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        {item.popular && (
          <span className="absolute right-3 top-3 rounded-full bg-orange px-3 py-1 text-[11px] font-black text-white shadow">
            الأكثر طلباً
          </span>
        )}
        <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-forest/85 px-3 py-1 text-[11px] font-bold text-cream backdrop-blur">
          <IconFlame className="h-3.5 w-3.5 text-leaf" />
          {item.macros.kcal} سعرة
        </span>
      </div>

      <div className="flex grow flex-col gap-3 p-5">
        <h3 className="text-lg font-black text-forest">{item.name}</h3>
        <p className="line-clamp-2 text-sm leading-6 text-muted">{item.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-leaf/10 px-2.5 py-1 text-[10px] font-extrabold text-forest"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-center">
          {macros.map((m) => (
            <div key={m.l} className="rounded-xl border border-sand bg-cream py-1.5">
              <b className="block text-sm font-black text-forest">{m.v}</b>
              <span className="text-[9px] font-bold text-muted">{m.l}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="leading-none">
            <span className="text-xl font-black text-forest">{fmt(item.price)}</span>{' '}
            <span className="text-[11px] font-bold text-muted">{SITE.currency}</span>
          </div>
          {qty === 0 ? (
            <button
              onClick={() => add(item._id)}
              className="flex items-center gap-1.5 rounded-full bg-forest px-5 py-2.5 text-sm font-extrabold text-cream transition hover:bg-leaf"
            >
              <IconPlus className="h-4 w-4" strokeWidth={2.6} />
              أضف
            </button>
          ) : (
            <div className="flex items-center gap-2.5 rounded-full bg-forest px-2.5 py-1.5 text-cream">
              <button
                onClick={() => inc(item._id)}
                aria-label={`زيادة كمية ${item.name}`}
                className="grid h-7 w-7 place-items-center rounded-full bg-cream/15 transition hover:bg-leaf"
              >
                <IconPlus className="h-4 w-4" strokeWidth={2.6} />
              </button>
              <span className="w-5 text-center text-sm font-black">{qty}</span>
              <button
                onClick={() => dec(item._id)}
                aria-label={`إنقاص كمية ${item.name}`}
                className="grid h-7 w-7 place-items-center rounded-full bg-cream/15 transition hover:bg-copper"
              >
                <IconMinus className="h-4 w-4" strokeWidth={2.6} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
