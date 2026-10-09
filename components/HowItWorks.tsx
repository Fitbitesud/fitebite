'use client';

import { fillTokens } from '@/lib/site-data';
import { IconBike, IconCart, IconWhatsApp } from './Icons';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { useSite } from './SiteContext';

const STEP_ICONS = {
  cart: IconCart,
  whatsapp: IconWhatsApp,
  bike: IconBike,
} as const;

export default function HowItWorks() {
  const site = useSite();
  const { howHeading: head, steps } = site.home;

  return (
    <section id="how" className="scroll-mt-20 py-24">
      <div className="container-x">
        <SectionHeading eyebrow={head.eyebrow} title={head.title} sub={head.sub} />
        <div className="relative grid gap-12 md:grid-cols-3 md:gap-8">
          <span
            className="absolute inset-x-[16%] top-10 hidden border-t-2 border-dashed border-sand md:block"
            aria-hidden="true"
          />
          {steps.map((s, i) => {
            const Icon = STEP_ICONS[(s.icon as keyof typeof STEP_ICONS) ?? 'cart'] ?? IconCart;
            return (
              <Reveal key={s.title} delay={i * 0.12}>
                <div className="relative text-center">
                  <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-forest text-cream shadow-soft">
                    <Icon className="h-9 w-9" />
                    <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-orange text-xs font-black text-white shadow">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-black text-forest">{s.title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-7 text-muted">
                    {fillTokens(s.desc ?? '', site)}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
