'use client';

import { fmt, price } from '@/lib/format';
import {
  GOALS,
  GUARANTEE,
  buildPackageOrderMessage,
  computeDailyMacros,
  computeQuote,
  mealsLabel,
  type ReadyPackage,
} from '@/lib/subscriptions';
import { useSite, useWhatsapp } from '../SiteContext';
import { IconShield, IconWhatsApp } from '../Icons';
import Reveal from '../Reveal';

/** بطاقة باقة جاهزة — صورة + ماكروز + سعر، وزر طلب مباشر عبر واتساب */
function ReadyPackageCard({ pkg }: { pkg: ReadyPackage }) {
  const site = useSite();
  const wa = useWhatsapp();
  const goal = GOALS.find((g) => g.id === pkg.goalId)!;
  const macros = computeDailyMacros(goal, pkg.kcal);
  const quote = computeQuote(goal, pkg.meals);
  const monthly = pkg.priceMonthly ?? quote.monthly;
  const tiles = [
    { v: fmt(macros.kcal), l: 'سعرة' },
    { v: `${fmt(macros.protein)}غ`, l: 'بروتين' },
    { v: `${fmt(macros.carbs)}غ`, l: 'كارب' },
    { v: `${fmt(macros.fat)}غ`, l: 'دهون' },
  ];

  return (
    <div className="relative flex h-full flex-col gap-3.5 rounded-3xl border border-sand bg-card p-5 shadow-soft transition duration-300 hover:-translate-y-1.5 hover:shadow-lift">
      {pkg.badge && (
        <span className="absolute -top-3 right-5 z-10 rounded-full bg-orange px-3 py-1 text-[10px] font-black text-white shadow">
          {pkg.badge}
        </span>
      )}
      <img src={pkg.image} alt={pkg.name} loading="lazy" className="h-40 w-full rounded-2xl object-cover" />
      <div>
        <b className="block text-lg font-black text-forest">{pkg.name}</b>
        <p className="mt-1 text-xs font-bold leading-6 text-muted">{pkg.desc}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full bg-forest/10 px-2.5 py-1 text-[10px] font-extrabold text-forest">
          {goal.name}
        </span>
        <span className="rounded-full bg-leaf/10 px-2.5 py-1 text-[10px] font-extrabold text-forest">
          {mealsLabel(pkg.meals)} يومياً
        </span>
        <span className="rounded-full bg-copper/10 px-2.5 py-1 text-[10px] font-extrabold text-copper-dark">
          {fmt(pkg.kcal)} سعرة/يوم
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 text-center">
        {tiles.map((t) => (
          <div key={t.l} className="rounded-lg border border-sand bg-cream py-1.5">
            <b className="block text-xs font-black text-forest">{t.v}</b>
            <span className="text-[9px] font-bold text-muted">{t.l}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto leading-none pt-1">
        <span className="text-2xl font-black text-forest">{fmt(monthly)}</span>
        <span className="mr-1 text-[10px] font-bold text-muted">{site.currency} / شهرياً</span>
        <span className="mt-1 block text-[11px] font-bold text-muted">
          {price(Math.round(monthly / 30), site.currency)} يومياً
          {quote.discount > 0 && <span className="text-leaf"> (خصم {quote.discount * 100}%)</span>}
        </span>
      </div>
      <span className="flex items-center gap-1.5 text-[10px] font-black text-leaf">
        <IconShield className="h-3.5 w-3.5" />
        مشمولة بضمان فيتبايت
      </span>
      <a
        href={wa(buildPackageOrderMessage(pkg, site, monthly))}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-3 text-center text-sm font-black text-cream transition hover:bg-leaf"
      >
        <IconWhatsApp className="h-4 w-4" />
        اطلبها عبر واتساب
      </a>
    </div>
  );
}

/** شبكة الباقات الشهرية الجاهزة + بانر الضمان (صفحة /packages) */
export default function ReadyPackages({ packages }: { packages: ReadyPackage[] }) {
  return (
    <>
      <div className="grid gap-5 pt-3 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 0.08} className="h-full">
            <ReadyPackageCard pkg={p} />
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="mt-10 flex items-start gap-4 rounded-2xl border border-leaf/30 bg-leaf/10 p-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-leaf text-white">
            <IconShield className="h-5 w-5" />
          </span>
          <div>
            <b className="block text-sm font-black text-forest">ضمان فيتبايت للاشتراكات</b>
            <p className="mt-1 text-xs font-bold leading-6 text-muted">{GUARANTEE}</p>
          </div>
        </div>
      </Reveal>
    </>
  );
}
