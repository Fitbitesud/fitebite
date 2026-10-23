'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import type { FaqItem } from '@/lib/faq';
import { fillTokens } from '@/lib/site-data';
import { IconChevronDown, IconConsultation, IconWhatsApp } from './Icons';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { useSite, useWhatsapp } from './SiteContext';
import { useLiveFaqs } from './useLiveData';

/**
 * قسم الأسئلة الشائعة أسفل الصفحة الرئيسية:
 * عند الضغط على أي سؤال تظهر إجابته بأنيميشن سلس، وعند الضغط مرة أخرى تُغلق.
 */
export default function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  const site = useSite();
  const wa = useWhatsapp();
  const live = useLiveFaqs(faqs);
  const [openId, setOpenId] = useState<string | null>(null);

  if (!site.home.faqEnabled || live.length === 0) return null;

  const head = site.home.faqHeading;

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="scroll-mt-20 border-t border-sand bg-cream py-24">
      <div className="container-x">
        <SectionHeading eyebrow={head.eyebrow} title={head.title} sub={head.sub} />

        <div className="mx-auto max-w-3xl space-y-3.5">
          {live.map((item, i) => {
            const isOpen = openId === item.id;
            const panelId = `faq-answer-${item.id}`;
            return (
              <Reveal key={item.id} delay={i * 0.05}>
                <div
                  className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? 'border-leaf bg-card shadow-soft'
                      : 'border-sand bg-card/75 hover:border-leaf/50 hover:bg-card'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-right"
                  >
                    <span className="text-base font-black leading-7 text-forest sm:text-lg">
                      {fillTokens(item.question, site)}
                    </span>
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                        isOpen
                          ? 'rotate-180 border-leaf bg-leaf text-white'
                          : 'border-sand bg-cream text-forest'
                      }`}
                      aria-hidden="true"
                    >
                      <IconChevronDown className="h-4 w-4" />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        role="region"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-sand/70 px-6 pb-5 pt-4 text-sm font-bold leading-8 text-ink/80">
                          {fillTokens(item.answer, site)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* دعوة لإرسال استشارة خاصة عند وجود سؤال إضافي */}
        <Reveal delay={0.15} className="mx-auto mt-10 max-w-3xl">
          <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-sand bg-card px-6 py-5 text-center sm:flex-row sm:text-right">
            <div>
              <b className="block text-sm font-black text-forest">
                عندك سؤال خاص بنظامك الغذائي أو سعراتك؟
              </b>
              <span className="text-xs font-bold text-muted">
                أرسل استشارتك مباشرة لصاحب الموقع وسنساعدك في اختيار الأنسب لهدفك.
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Link
                href="/consultations"
                className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-xs font-black text-cream transition hover:bg-forest-deep"
              >
                <IconConsultation className="h-4 w-4" />
                اطلب استشارة
              </Link>
              <a
                href={wa(`مرحباً ${site.nameAr}! 👋 لدي استفسار بخصوص الوجبات.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-wa px-5 py-2.5 text-xs font-black text-white transition hover:brightness-110"
              >
                <IconWhatsApp className="h-4 w-4" />
                تواصل عبر واتساب
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
