'use client';

import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { SITE } from '@/lib/config';
import type { MenuData } from '@/lib/types';
import { whatsappLink } from '@/lib/whatsapp';
import {
  IconBox,
  IconBowl,
  IconCup,
  IconFlame,
  IconLeaf,
  IconSandwich,
  IconSnack,
  IconSun,
  IconWhatsApp,
} from './Icons';
import MenuCard from './MenuCard';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

const CATEGORY_ICONS = {
  bowl: IconBowl,
  leaf: IconLeaf,
  flame: IconFlame,
  sun: IconSun,
  cup: IconCup,
  box: IconBox,
  sandwich: IconSandwich,
  snack: IconSnack,
} as const;

export default function Menu({ menu }: { menu: MenuData }) {
  const [active, setActive] = useState(menu.categories[0]?.slug ?? '');
  const items = menu.items.filter((i) => i.categorySlug === active && i.available);

  return (
    <section id="menu" className="scroll-mt-20 border-y border-sand bg-card/50 py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="قائمة الوجبات"
          title="وجبتك القادمة تختارها اليوم"
          sub="كل وجبة موثّقة بالسعرات والماكروز قبل أن تضيفها للسلة — اضغط على التصنيف للتنقل."
        />

        <Reveal className="mb-12 flex flex-wrap justify-center gap-2.5">
          {menu.categories.map((c) => {
            const Icon = CATEGORY_ICONS[c.icon];
            const isActive = c.slug === active;
            return (
              <button
                key={c.slug}
                onClick={() => setActive(c.slug)}
                className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-extrabold transition-all duration-300 ${
                  isActive
                    ? 'border-forest bg-forest text-cream shadow-soft'
                    : 'border-sand bg-card text-ink/70 hover:border-forest/40 hover:text-forest'
                }`}
                aria-pressed={isActive}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-leaf' : 'text-copper'}`} />
                {c.name}
              </button>
            );
          })}
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => (
              <MenuCard key={item._id} item={item} index={i} />
            ))}
          </AnimatePresence>
        </div>

        <Reveal className="mt-12 text-center">
          <p className="text-sm font-bold text-muted">
            ما لقيت وجبة تناسب ماكروزك بالضبط؟ نجهّزها لك حسب طلبك —{' '}
            <a
              href={whatsappLink(`مرحباً ${SITE.nameAr}، أريد وجبة مخصصة حسب ماكروز معين.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-black text-forest underline decoration-leaf decoration-2 underline-offset-4 hover:text-copper"
            >
              <IconWhatsApp className="h-4 w-4 text-wa" />
              كلمنا على واتساب
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
