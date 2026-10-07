import Link from 'next/link';
import { fmt, price } from '@/lib/format';
import {
  GOALS,
  GUARANTEE,
  READY_PACKAGES,
  computeDailyMacros,
  computeQuote,
  mealsLabel,
  type ReadyPackage,
} from '@/lib/subscriptions';
import { IconShield } from '../Icons';
import Reveal from '../Reveal';

/** بطاقة باقة جاهزة — زرّها ينقل للرئيسية مع شحن المُخصّص بإعداداتها */
function ReadyPackageCard({ pkg }: { pkg: ReadyPackage }) {
  const goal = GOALS.find((g) => g.id === pkg.goalId)!;
  const macros = computeDailyMacros(goal, pkg.kcal);
  const quote = computeQuote(goal, pkg.meals);
  const tiles = [
    { v: fmt(macros.kcal), l: 'سعرة' },
    { v: `${fmt(macros.protein)}غ`, l: 'بروتين' },
    { v: `${fmt(macros.carbs)}غ`, l: 'كارب' },
    { v: `${fmt(macros.fat)}غ`, l: 'دهون' },
  ];

  return (
    <div className="relative flex h-full flex-col gap-3.5 rounded-3xl border border-sand bg-card p-5 shadow-soft transition duration-300 hover:-translate-y-1.5 hover:shadow-lift">
      {pkg.badge && (
        <span className="absolute -top-3 right-5 rounded-full bg-copper px-3 py-1 text-[10px] font-black text-white shadow">
          {pkg.badge}
        </span>
      )}
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
        <span className="text-2xl font-black text-forest">{fmt(quote.monthly)}</span>
        <span className="mr-1 text-[10px] font-bold text-muted">ج.س / شهرياً</span>
        <span className="mt-1 block text-[11px] font-bold text-muted">
          {price(quote.daily)} يومياً
          {quote.discount > 0 && <span className="text-leaf"> (خصم {quote.discount * 100}%)</span>}
        </span>
      </div>
      <span className="flex items-center gap-1.5 text-[10px] font-black text-leaf">
        <IconShield className="h-3.5 w-3.5" />
        مشمولة بضمان فيتبايت
      </span>
      <Link
        href={`/?pkg=${pkg.id}#subs`}
        className="w-full rounded-full bg-forest py-3 text-center text-sm font-black text-cream transition hover:bg-leaf"
      >
        اخترها وأكمل الاشتراك
      </Link>
    </div>
  );
}

/** شبكة الباقات الشهرية الجاهزة + بانر الضمان (صفحة /packages) */
export default function ReadyPackages() {
  return (
    <>
      <div className="grid gap-5 pt-3 sm:grid-cols-2 lg:grid-cols-3">
        {READY_PACKAGES.map((p, i) => (
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
