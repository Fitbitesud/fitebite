'use client';

import Link from 'next/link';
import { useSite, useWhatsapp } from './SiteContext';
import { IconWhatsApp } from './Icons';
import Reveal from './Reveal';

export default function CtaBanner() {
  const site = useSite();
  const wa = useWhatsapp();
  const cta = site.home.cta;

  return (
    <section className="pb-24">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-forest px-6 py-16 text-center shadow-lift sm:px-12">
            <span className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cream/5" aria-hidden="true" />
            <span className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-cream/5" aria-hidden="true" />
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute -bottom-10 right-10 h-44 w-44 rotate-45 text-leaf opacity-10" fill="currentColor" aria-hidden="true">
              <path d="M5 19C5 10 10 5 20 4c-.5 10-5.5 15-15 15z" />
            </svg>

            <h2 className="relative text-3xl font-black text-cream sm:text-4xl">{cta.title}</h2>
            <p className="relative mx-auto mt-4 max-w-xl leading-8 text-cream/75">{cta.sub}</p>
            <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
              <a
                href={wa(`مرحباً ${site.nameAr}! 👋 أريد أطلب وجبات.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-wa px-8 py-4 text-base font-black text-white transition hover:-translate-y-0.5 hover:brightness-110"
              >
                <IconWhatsApp className="h-5 w-5" />
                {cta.primaryLabel}
              </a>
              <Link
                href="/menu"
                className="rounded-full bg-cream px-8 py-4 text-base font-black text-forest transition hover:-translate-y-0.5 hover:bg-card"
              >
                {cta.secondaryLabel}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
