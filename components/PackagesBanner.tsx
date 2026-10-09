'use client';

import Link from 'next/link';
import { IconCloche } from './Icons';
import Reveal from './Reveal';
import { useSite } from './SiteContext';

/** لافتة الدخول إلى صفحة الباقات الجاهزة */
export default function PackagesBanner() {
  const site = useSite();
  const b = site.home.pkgBanner;

  return (
    <section className="border-y border-sand bg-card/60 py-14">
      <div className="container-x">
        <Reveal>
          <div className="flex flex-col items-center justify-between gap-5 rounded-3xl border border-leaf/25 bg-leaf/10 px-7 py-6 text-center sm:flex-row sm:text-right">
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-leaf text-white">
                <IconCloche className="h-6 w-6" />
              </span>
              <div>
                <b className="block text-lg font-black text-forest">{b.title}</b>
                <p className="mt-1 text-xs font-bold leading-6 text-muted">{b.sub}</p>
              </div>
            </div>
            <Link
              href="/packages"
              className="shrink-0 rounded-full bg-forest px-7 py-3.5 text-sm font-black text-cream shadow-soft transition hover:-translate-y-0.5 hover:bg-forest-deep"
            >
              {b.button}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
