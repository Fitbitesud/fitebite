'use client';

import { IconClipboard, IconLeafSprig, IconPeople, IconPot } from './Icons';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { useSite } from './SiteContext';

const FEATURE_ICONS = {
  clipboard: IconClipboard,
  pot: IconPot,
  people: IconPeople,
  leafsprig: IconLeafSprig,
} as const;

export default function Features() {
  const site = useSite();
  const { featuresHeading: head, features } = site.home;

  return (
    <section id="features" className="scroll-mt-20 py-24">
      <div className="container-x">
        <SectionHeading eyebrow={head.eyebrow} title={head.title} sub={head.sub} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Icon = FEATURE_ICONS[(f.icon as keyof typeof FEATURE_ICONS) ?? 'clipboard'] ?? IconClipboard;
            return (
              <Reveal key={f.title} delay={i * 0.1} className="h-full">
                <div className="flex h-full items-start gap-5 rounded-3xl border border-sand bg-card p-6 shadow-soft transition duration-300 hover:-translate-y-1.5 hover:shadow-lift">
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-forest">{f.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted">{f.desc}</p>
                  </div>
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-forest text-cream shadow-soft">
                    <Icon className="h-7 w-7" />
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
