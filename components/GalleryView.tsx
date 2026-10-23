'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { GalleryItem } from '@/lib/gallery';
import { imgUrl } from '@/lib/site-data';
import { IconArrowLeft, IconClose, IconGallery, IconWhatsApp } from './Icons';
import Reveal from './Reveal';
import { useSite, useWhatsapp } from './SiteContext';
import { useLiveGallery } from './useLiveData';

const ALL_TAB = 'الكل';

export default function GalleryView({ items }: { items: GalleryItem[] }) {
  const site = useSite();
  const wa = useWhatsapp();
  const live = useLiveGallery(items);

  const [activeCategory, setActiveCategory] = useState<string>(ALL_TAB);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    for (const item of live) {
      if (item.category) seen.add(item.category);
    }
    return [ALL_TAB, ...Array.from(seen)];
  }, [live]);

  const filtered = useMemo(() => {
    if (activeCategory === ALL_TAB) return live;
    return live.filter((item) => item.category === activeCategory);
  }, [live, activeCategory]);

  /* عند تغيّر التصنيف نغلق النافذة المكبّرة إن كانت مفتوحة */
  useEffect(() => {
    setLightboxIdx(null);
  }, [activeCategory]);

  /* دعم لوحة المفاتيح ومنع تمرير الصفحة أثناء عرض الصورة المكبّرة */
  useEffect(() => {
    if (lightboxIdx === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowLeft') {
        setLightboxIdx((i) => (i === null ? null : (i + 1) % filtered.length));
      }
      if (e.key === 'ArrowRight') {
        setLightboxIdx((i) =>
          i === null ? null : (i - 1 + filtered.length) % filtered.length,
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxIdx, filtered.length]);

  const activePhoto =
    lightboxIdx !== null && filtered[lightboxIdx] ? filtered[lightboxIdx] : null;

  return (
    <div>
      {/* أزرار التصفية حسب التصنيف */}
      {categories.length > 2 && (
        <div
          className="mb-10 flex flex-wrap items-center justify-center gap-2.5"
          role="tablist"
          aria-label="تصنيفات معرض الأعمال"
        >
          {categories.map((cat) => {
            const active = activeCategory === cat;
            const count =
              cat === ALL_TAB
                ? live.length
                : live.filter((item) => item.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveCategory(cat)}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-black transition sm:text-sm ${
                  active
                    ? 'border-forest bg-forest text-cream shadow-soft'
                    : 'border-sand bg-card text-ink/80 hover:border-leaf hover:text-forest'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    active ? 'bg-cream/20 text-cream' : 'bg-cream text-muted'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* شبكة صور أعمال المطعم */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-sand bg-card p-12 text-center">
          <IconGallery className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-3 text-sm font-black text-forest">
            لا توجد صور مضافة في هذا التصنيف حالياً.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, idx) => (
            <Reveal key={item.id} delay={(idx % 3) * 0.06} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-sand bg-card shadow-soft transition duration-300 hover:-translate-y-1.5 hover:shadow-lift">
                <button
                  type="button"
                  onClick={() => setLightboxIdx(idx)}
                  aria-label={`عرض صورة: ${item.title}`}
                  className="relative aspect-[4/3] w-full overflow-hidden bg-forest-deep text-right"
                >
                  <img
                    src={imgUrl(item.image)}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/75 via-transparent to-transparent opacity-80 transition group-hover:opacity-95" />
                  <span className="absolute right-3.5 top-3.5 rounded-full bg-forest-deep/80 px-3 py-1 text-[11px] font-black text-cream backdrop-blur">
                    {item.category}
                  </span>
                  <span className="absolute bottom-3 left-3 rounded-full bg-copper/95 px-3 py-1 text-[10px] font-black text-white opacity-0 shadow transition duration-300 group-hover:opacity-100">
                    تكبير الصورة
                  </span>
                </button>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-black text-forest">{item.title}</h3>
                  {item.desc && (
                    <p className="mt-1.5 text-xs font-bold leading-6 text-muted">{item.desc}</p>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      )}

      {/* أزرار سفلية للطلب والتواصل */}
      <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/menu"
          className="rounded-full bg-copper px-8 py-3.5 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-copper-dark"
        >
          تصفح القائمة واطلب الآن
        </Link>
        <a
          href={wa(`مرحباً ${site.nameAr}! 👋 شاهدت معرض الأعمال وأود الاستفسار عن الطلبات.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-wa px-7 py-3.5 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:brightness-110"
        >
          <IconWhatsApp className="h-4 w-4" />
          تواصل معنا عبر واتساب
        </a>
      </div>

      {/* عارض الصورة المكبّرة (Lightbox) */}
      <AnimatePresence>
        {activePhoto && lightboxIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIdx(null)}
            className="fixed inset-0 z-[80] grid place-items-center bg-ink/85 p-4 backdrop-blur-sm sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={activePhoto.title}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-cream/15 bg-forest-deep text-cream shadow-2xl"
            >
              {/* الشريط العلوي */}
              <div className="flex items-center justify-between border-b border-cream/10 px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-full bg-copper px-3 py-0.5 text-[11px] font-black text-white">
                    {activePhoto.category}
                  </span>
                  <span className="text-xs font-extrabold text-cream/70" dir="ltr">
                    {lightboxIdx + 1} / {filtered.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxIdx(null)}
                  aria-label="إغلاق العرض المكبّر"
                  className="grid h-9 w-9 place-items-center rounded-full bg-cream/10 text-cream transition hover:bg-copper"
                >
                  <IconClose className="h-4 w-4" />
                </button>
              </div>

              {/* الصورة + أسهم التنقل */}
              <div className="relative bg-black/40">
                <img
                  src={imgUrl(activePhoto.image)}
                  alt={activePhoto.title}
                  className="max-h-[68vh] w-full object-contain"
                />
                {filtered.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setLightboxIdx((lightboxIdx - 1 + filtered.length) % filtered.length)
                      }
                      aria-label="الصورة السابقة"
                      className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-forest-deep/80 text-cream backdrop-blur transition hover:bg-copper"
                    >
                      <IconArrowLeft className="h-5 w-5 rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setLightboxIdx((lightboxIdx + 1) % filtered.length)}
                      aria-label="الصورة التالية"
                      className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-forest-deep/80 text-cream backdrop-blur transition hover:bg-copper"
                    >
                      <IconArrowLeft className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* تفاصيل الصورة */}
              <div className="px-6 py-4">
                <h3 className="text-lg font-black text-cream">{activePhoto.title}</h3>
                {activePhoto.desc && (
                  <p className="mt-1 text-xs font-bold leading-6 text-cream/75">
                    {activePhoto.desc}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
