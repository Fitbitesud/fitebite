'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { BASE_PATH } from '@/lib/config';
import { useCart } from './cart/CartContext';
import { IconCart, IconClose, IconMenuBars } from './Icons';
import Logo from './Logo';
import { useSite } from './SiteContext';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { totals, openCart } = useCart();
  const site = useSite();

  /* روابط كاملة للتصدير الثابت: لا نعتمد على توجيه Next للـ hash في GitHub Pages.
     trailingSlash يطابق إعداد next.config.mjs لصفحات القائمة والباقات. */
  const LINKS = [
    { href: `${BASE_PATH}/#home`, label: 'الرئيسية' },
    { href: `${BASE_PATH}/#features`, label: site.home.featuresHeading.eyebrow },
    { href: `${BASE_PATH}/menu/`, label: 'القائمة' },
    { href: `${BASE_PATH}/packages/`, label: 'الباقات' },
    { href: `${BASE_PATH}/#how`, label: site.home.howHeading.eyebrow },
    { href: `${BASE_PATH}/#comments`, label: 'آراء الزوار' },
    { href: `${BASE_PATH}/#contact`, label: 'تواصل معنا' },
  ];

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-sand bg-cream py-2 shadow-soft">
        <div className="container-x flex items-center justify-between">
          <a href={`${BASE_PATH}/#home`} aria-label={`${site.nameAr} — الصفحة الرئيسية`}>
            <Logo tone="forest" />
          </a>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="التنقل الرئيسي">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="group relative text-sm font-extrabold text-ink/75 transition hover:text-forest"
              >
                {l.label}
                <span className="absolute -bottom-1.5 right-0 h-0.5 w-0 rounded-full bg-copper transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={openCart}
              className="relative grid h-11 w-11 place-items-center rounded-full bg-forest text-cream transition hover:bg-forest-deep hover:shadow-lift"
              aria-label={`فتح سلة الطلبات (${totals.count} صنف)`}
            >
              <IconCart className="h-5 w-5" />
              <AnimatePresence>
                {totals.count > 0 && (
                  <motion.span
                    key={totals.count}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -left-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-orange px-1 text-[10px] font-black text-white"
                  >
                    {totals.count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              onClick={() => setOpen((o) => !o)}
              className="grid h-11 w-11 place-items-center rounded-full border border-sand bg-card text-forest transition lg:hidden"
              aria-label="فتح القائمة"
            >
              {open ? <IconClose className="h-5 w-5" /> : <IconMenuBars className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed inset-x-0 top-[68px] z-40 border-b border-sand bg-cream/95 px-6 pb-4 pt-2 shadow-soft backdrop-blur-md lg:hidden"
            aria-label="قائمة الجوال"
          >
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block border-b border-sand/60 py-3.5 text-base font-extrabold text-ink/80 last:border-0 hover:text-forest"
              >
                {l.label}
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
