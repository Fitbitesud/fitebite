'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fillTokens, imgUrl, type HeroSentence } from '@/lib/site-data';
import { useSite, useWhatsapp } from './SiteContext';
import {
  IconChart,
  IconCloche,
  IconFlame,
  IconLeaf,
  IconWhatsApp,
} from './Icons';

const STRIP_ICONS = {
  cloche: IconCloche,
  chart: IconChart,
  flame: IconFlame,
  leaf: IconLeaf,
} as const;

const MACROS = [
  { v: '520', l: 'سعرة' },
  { v: '45غ', l: 'بروتين' },
  { v: '58غ', l: 'كاربوهيدرات' },
];

const ROTATE_INTERVAL_MS = 3800;

export default function Hero() {
  const site = useSite();
  const wa = useWhatsapp();
  const h = site.home;

  const sentences: HeroSentence[] =
    Array.isArray(h.heroSentences) && h.heroSentences.length > 0
      ? h.heroSentences
      : [{ lead: h.heroTitleLead, accent: h.heroAccent, tail: h.heroTitleTail }];

  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setActiveIdx(0);
  }, [sentences.length]);

  useEffect(() => {
    if (sentences.length <= 1 || paused) return;
    const timer = window.setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % sentences.length);
    }, ROTATE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [sentences.length, paused]);

  const current = sentences[activeIdx % sentences.length] ?? sentences[0];

  return (
    <section id="home" className="relative scroll-mt-20 overflow-hidden bg-forest pt-32 text-cream">
      {/* خلفية بسيطة: لون أخضر داكن مسطّح + إضاءة علوية خفيفة واحدة + توهج برتقالي متناسق */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(126,156,78,0.14),transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_12%_88%,rgba(224,123,46,0.12),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="container-x relative grid items-center gap-16 pb-24 pt-10 lg:grid-cols-2 lg:pb-28">
        {/* النص الرئيسي المتحرك */}
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/10 px-4 py-2 text-xs font-extrabold text-cream backdrop-blur"
          >
            <IconFlame className="h-4 w-4 text-orange-soft" />
            {h.heroBadge}
          </motion.span>

          <div className="mt-6 min-h-[7.5rem] sm:min-h-[8.5rem] lg:min-h-[9.5rem]">
            <AnimatePresence mode="wait">
              <motion.h1
                key={`${activeIdx}-${current.lead}-${current.accent ?? ''}`}
                initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -18, filter: 'blur(4px)' }}
                transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl font-black leading-[1.28] text-cream sm:text-5xl lg:text-[3.35rem]"
                aria-live="polite"
              >
                {fillTokens(current.lead, site)}
                {current.accent ? (
                  <>
                    {' '}
                    <span className="relative inline-block bg-gradient-to-l from-orange-soft via-orange to-copper bg-clip-text pb-1 text-transparent">
                      {fillTokens(current.accent, site)}
                      <svg
                        viewBox="0 0 120 14"
                        className="absolute -bottom-1.5 right-0 w-full"
                        fill="none"
                        aria-hidden="true"
                      >
                        <motion.path
                          d="M4 10 C30 4 90 4 116 8"
                          stroke="#7E9C4E"
                          strokeWidth="5"
                          strokeLinecap="round"
                          initial={{ pathLength: 0, opacity: 0.4 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 0.55, delay: 0.12, ease: 'easeOut' }}
                        />
                      </svg>
                    </span>
                  </>
                ) : null}
                {current.tail ? fillTokens(current.tail, site) : null}
              </motion.h1>
            </AnimatePresence>
          </div>

          {sentences.length > 1 && (
            <div className="mt-3 flex items-center gap-2" role="tablist" aria-label="جمل العنوان المتحركة">
              {sentences.map((s, idx) => {
                const isActive = idx === activeIdx % sentences.length;
                return (
                  <button
                    key={`${idx}-${s.lead}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`الجملة ${idx + 1}`}
                    onClick={() => setActiveIdx(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isActive ? 'w-8 bg-orange-soft' : 'w-2 bg-cream/25 hover:bg-cream/45'
                    }`}
                  />
                );
              })}
            </div>
          )}

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.6 }}
            className="mt-5 max-w-lg text-base leading-8 text-cream/70 sm:text-lg"
          >
            {fillTokens(h.heroParagraph, site)}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44, duration: 0.6 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/menu"
              className="rounded-full bg-copper px-8 py-4 text-base font-black text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-copper-dark"
            >
              {h.heroPrimaryLabel}
            </Link>
            <a
              href={wa(`مرحباً ${site.nameAr}! 👋 أريد الاستفسار عن الوجبات.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-wa px-7 py-4 text-base font-black text-white shadow-lift transition hover:-translate-y-0.5 hover:brightness-110"
            >
              <IconWhatsApp className="h-5 w-5" />
              {h.heroSecondaryLabel}
            </a>
          </motion.div>
        </div>

        {/* الصورة بإطار نظيف بسيط */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <motion.img
            src={imgUrl(h.heroImage)}
            alt={`${site.nameAr} — ${h.heroCardTitle}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.8 }}
            className="relative aspect-[4/5] w-full rounded-[2.5rem] border border-cream/10 object-cover shadow-2xl"
          />
          <motion.span
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: -3 }}
            transition={{ delay: 0.9, type: 'spring', stiffness: 200, damping: 14 }}
            className="absolute -top-4 left-8 rounded-full bg-copper px-4 py-2 text-xs font-black text-white shadow-lift"
          >
            100% بدون زيوت ضارة
          </motion.span>
          <div className="absolute -bottom-10 right-4 animate-float sm:right-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="rounded-2xl border border-cream/10 bg-forest-deep/85 p-4 shadow-lift backdrop-blur"
            >
              <div className="flex items-center gap-2 text-xs font-black text-cream">
                <IconFlame className="h-4 w-4 text-orange-soft" />
                {h.heroCardTitle}
              </div>
              <div className="mt-2.5 flex gap-2 text-center">
                {MACROS.map((m) => (
                  <div key={m.l} className="rounded-lg border border-cream/10 bg-cream/10 px-2.5 py-1.5">
                    <b className="block text-sm font-black text-cream">{m.v}</b>
                    <span className="text-[9px] font-bold text-cream/60">{m.l}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* شريط وعود الهوية أسفل الهبوط */}
      <div className="relative grid grid-cols-2 divide-x divide-x-reverse divide-y divide-cream/10 border-t border-cream/10 bg-forest-deep/70 backdrop-blur lg:grid-cols-4 lg:divide-y-0">
        {h.strip.map((s, i) => {
          const Icon = STRIP_ICONS[(s.icon as keyof typeof STRIP_ICONS) ?? 'leaf'] ?? IconLeaf;
          return (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="flex items-center gap-3.5 px-6 py-5"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-cream/20 bg-cream/5 text-leaf">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <b className="block text-sm font-black text-cream">{s.title}</b>
                <span className="text-[11px] font-bold text-cream/60">{s.sub}</span>
              </span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
