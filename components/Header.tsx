'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from './cart/CartContext';
import { IconCart, IconClose, IconMenuBars } from './Icons';
import Logo from './Logo';

const LINKS = [
  { href: '#home', label: 'الرئيسية' },
  { href: '#features', label: 'لماذا فيتبايت' },
  { href: '/menu', label: 'القائمة' },
  { href: '/packages', label: 'الباقات' },
  { href: '#how', label: 'كيف تطلب' },
  { href: '#reviews', label: 'آراء العملاء' },
  { href: '#contact', label: 'تواصل معنا' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { totals, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* أعلى الصفحة: الهيدر فوق الهبوط الداكن → ألوان فاتحة */
  const dark = !scrolled && !open;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled || open
            ? 'bg-cream/90 py-2 shadow-soft backdrop-blur-md'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="container-x flex items-center justify-between">
          <Link href="/#home" aria-label="فيتبايت — الصفحة الرئيسية">
            <Logo tone={dark ? 'cream' : 'forest'} withTagline={!scrolled} />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="التنقل الرئيسي">
            {LINKS.map((l) => {
              const Tag = l.href.startsWith('/') ? Link : 'a';
              return (
                <Tag
                  key={l.href}
                  href={l.href}
                  className={`group relative text-sm font-extrabold transition ${
                    dark ? 'text-cream/85 hover:text-cream' : 'text-ink/75 hover:text-forest'
                  }`}
                >
                  {l.label}
                  <span className="absolute -bottom-1.5 right-0 h-0.5 w-0 rounded-full bg-copper transition-all duration-300 group-hover:w-full" />
                </Tag>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={openCart}
              className={`relative grid h-11 w-11 place-items-center rounded-full transition hover:shadow-lift ${
                dark
                  ? 'bg-cream text-forest hover:bg-card'
                  : 'bg-forest text-cream hover:bg-forest-deep'
              }`}
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
              className={`grid h-11 w-11 place-items-center rounded-full border transition lg:hidden ${
                dark
                  ? 'border-cream/25 bg-cream/10 text-cream'
                  : 'border-sand bg-card text-forest'
              }`}
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
            {LINKS.map((l) => {
              const Tag = l.href.startsWith('/') ? Link : 'a';
              return (
                <Tag
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-sand/60 py-3.5 text-base font-extrabold text-ink/80 last:border-0 hover:text-forest"
                >
                  {l.label}
                </Tag>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
