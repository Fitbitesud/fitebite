'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fmt, price } from '@/lib/format';
import {
  GOALS,
  KCAL_RANGE,
  MEAL_DISCOUNT,
  MEAL_OPTIONS,
  READY_PACKAGES,
  SUBSCRIPTION_DAYS,
  buildSubscriptionMessage,
  computeDailyMacros,
  computeQuote,
  mealsLabel,
  type SubscriptionGoalId,
} from '@/lib/subscriptions';
import { openWhatsApp } from '@/lib/whatsapp';
import {
  IconCheck,
  IconDumbbell,
  IconFlame,
  IconLeafSprig,
  IconShield,
  IconWhatsApp,
} from '../Icons';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';

const GOAL_ICONS = {
  dumbbell: IconDumbbell,
  flame: IconFlame,
  leaf: IconLeafSprig,
} as const;

const KCAL_CHIPS = [2200, 2600, 3000, 3400];

const darkInput =
  'w-full rounded-xl border border-cream/15 bg-cream/10 px-4 py-3 text-sm font-bold text-cream placeholder:text-cream/40 transition focus:border-leaf focus:outline-none focus:ring-2 focus:ring-leaf/40';

function StepTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-3 text-lg font-black text-forest">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-forest text-sm font-black text-cream">
        {n}
      </span>
      {children}
    </h3>
  );
}

/** مُخصّص الاشتراكات في الرئيسية — الباقات الجاهزة في صفحة /packages */
export default function SubscriptionBuilder() {
  const [goalId, setGoalId] = useState<SubscriptionGoalId>('cutting');
  const [meals, setMeals] = useState(3);
  const [kcal, setKcal] = useState(
    GOALS.find((g) => g.id === 'cutting')?.recommendedKcal ?? 2200,
  );
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const goal = GOALS.find((g) => g.id === goalId) ?? GOALS[0];
  const macros = useMemo(() => computeDailyMacros(goal, kcal), [goal, kcal]);
  const quote = useMemo(() => computeQuote(goal, meals), [goal, meals]);

  const goToSummary = () => {
    setTimeout(
      () =>
        document
          .getElementById('subs-summary')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      80,
    );
  };

  /* الوصول من صفحة الباقات عبر /?pkg=id#subs → شحن المُخصّص تلقائياً */
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('pkg');
    const pkg = READY_PACKAGES.find((p) => p.id === id);
    if (pkg) {
      setGoalId(pkg.goalId);
      setMeals(pkg.meals);
      setKcal(pkg.kcal);
      goToSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectGoal = (id: SubscriptionGoalId) => {
    const g = GOALS.find((x) => x.id === id);
    setGoalId(id);
    if (g) setKcal(g.recommendedKcal);
    setSent(false);
  };

  const submit = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 3) e.name = 'الرجاء كتابة الاسم الكامل';
    const digits = phone.replace(/[^\d+]/g, '');
    if (!/^(\+?249|0)?9\d{8}$/.test(digits)) e.phone = 'رقم جوال غير صحيح — مثال: 0912345678';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    openWhatsApp(buildSubscriptionMessage({ goal, meals, macros, quote, name, phone }));
    setSent(true);
  };

  const macroTiles = [
    { v: fmt(macros.kcal), l: 'سعرة حرارية' },
    { v: `${fmt(macros.protein)} غ`, l: 'بروتين' },
    { v: `${fmt(macros.carbs)} غ`, l: 'كاربوهيدرات' },
    { v: `${fmt(macros.fat)} غ`, l: 'دهون' },
  ];

  return (
    <section id="subs" className="scroll-mt-20 border-t border-sand bg-card/50 py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="الاشتراكات الشهرية"
          title="خصّص باقتك كما يناسب هدفك"
          sub="ابنِ باقتك خطوة بخطوة — هدفك، عدد وجباتك، وحصة سعراتك — والماكروز والسعر يُحسبان فوراً."
        />

        {/* مدخل الباقات الجاهزة */}
        <Reveal className="mb-12">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-copper/30 bg-copper/10 p-5">
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-copper text-white">
                <IconShield className="h-5 w-5" />
              </span>
              <div>
                <b className="block text-sm font-black text-forest">تفضّل الجاهز؟</b>
                <p className="mt-1 text-xs font-bold leading-6 text-muted">
                  6 باقات شهرية بأسعار وماكروز معلنة، كلها مشمولة بضمان فيتبايت.
                </p>
              </div>
            </div>
            <Link
              href="/packages"
              className="rounded-full bg-copper px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-copper-dark"
            >
              شاهد الباقات الجاهزة
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* أدوات التخصيص */}
          <div className="space-y-9 lg:col-span-2">
            <Reveal>
              <StepTitle n={1}>اختر هدفك</StepTitle>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {GOALS.map((g) => {
                  const Icon = GOAL_ICONS[g.icon];
                  const active = g.id === goalId;
                  return (
                    <button
                      key={g.id}
                      onClick={() => selectGoal(g.id)}
                      aria-pressed={active}
                      className={`relative flex flex-col items-start gap-3 rounded-3xl border p-5 text-right transition-all duration-300 ${
                        active
                          ? 'border-forest bg-forest text-cream shadow-soft'
                          : 'border-sand bg-card hover:-translate-y-1 hover:border-forest/40 hover:shadow-soft'
                      }`}
                    >
                      {active && (
                        <span className="absolute left-4 top-4 grid h-6 w-6 place-items-center rounded-full bg-leaf text-white">
                          <IconCheck className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                      )}
                      <span
                        className={`grid h-12 w-12 place-items-center rounded-full ${
                          active ? 'bg-cream/15 text-leaf' : 'bg-forest/10 text-forest'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </span>
                      <span>
                        <b className="block text-base font-black">{g.name}</b>
                        <span className={`text-[10px] font-bold ${active ? 'text-cream/60' : 'text-muted'}`}>
                          {g.en}
                        </span>
                      </span>
                      <span className={`text-xs leading-6 ${active ? 'text-cream/75' : 'text-muted'}`}>
                        {g.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <StepTitle n={2}>كم وجبة في اليوم؟</StepTitle>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {MEAL_OPTIONS.map((m) => {
                  const active = m === meals;
                  const disc = MEAL_DISCOUNT[m] ?? 0;
                  return (
                    <button
                      key={m}
                      onClick={() => {
                        setMeals(m);
                        setSent(false);
                      }}
                      aria-pressed={active}
                      className={`flex flex-col items-center gap-1 rounded-2xl border px-4 py-4 transition-all duration-300 ${
                        active
                          ? 'border-forest bg-forest text-cream shadow-soft'
                          : 'border-sand bg-card hover:-translate-y-1 hover:border-forest/40'
                      }`}
                    >
                      <b className="text-xl font-black">{mealsLabel(m)}</b>
                      <span
                        className={`text-[10px] font-black ${
                          disc > 0 ? 'text-leaf' : active ? 'text-cream/50' : 'text-muted/60'
                        }`}
                      >
                        {disc > 0 ? `خصم ${disc * 100}%` : 'بدون خصم'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <StepTitle n={3}>حصة السعرات اليومية</StepTitle>
              <div className="mt-5 rounded-3xl border border-sand bg-card p-6">
                <div className="flex items-center gap-5">
                  <input
                    type="range"
                    min={KCAL_RANGE.min}
                    max={KCAL_RANGE.max}
                    step={KCAL_RANGE.step}
                    value={kcal}
                    onChange={(e) => {
                      setKcal(Number(e.target.value));
                      setSent(false);
                    }}
                    className="flex-1 accent-leaf"
                    aria-label="السعرات الحرارية اليومية"
                  />
                  <span className="min-w-[7.5rem] rounded-xl bg-forest px-4 py-2.5 text-center text-sm font-black text-cream">
                    {fmt(kcal)} سعرة
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {KCAL_CHIPS.map((k) => (
                    <button
                      key={k}
                      onClick={() => {
                        setKcal(k);
                        setSent(false);
                      }}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-extrabold transition ${
                        k === kcal
                          ? 'border-forest bg-forest text-cream'
                          : 'border-sand bg-cream text-ink/70 hover:border-forest/40'
                      }`}
                    >
                      {fmt(k)}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs font-bold leading-6 text-muted">
                  غير متأكد؟ نوصي لهدف «{goal.name}» بـ {fmt(goal.recommendedKcal)} سعرة يومياً —
                  ويؤكد أخصائي التغذية ماكروزك النهائي قبل بدء الاشتراك.
                </p>
              </div>
            </Reveal>
          </div>

          {/* ملخص الباقة */}
          <Reveal delay={0.15}>
            <aside
              id="subs-summary"
              className="scroll-mt-24 rounded-3xl bg-forest p-6 text-cream shadow-lift lg:sticky lg:top-24"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black">ملخص باقتك</h3>
                <span className="rounded-full bg-cream/10 px-3 py-1 text-[11px] font-black">
                  {SUBSCRIPTION_DAYS} يوم
                </span>
              </div>
              <p className="mt-1.5 text-sm font-bold text-cream/70">
                {goal.name} • {mealsLabel(meals)} يومياً
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {macroTiles.map((t) => (
                  <div key={t.l} className="rounded-xl bg-cream/10 p-3 text-center">
                    <b className="block text-lg font-black">{t.v}</b>
                    <span className="text-[10px] font-bold text-cream/60">{t.l}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex h-3 overflow-hidden rounded-full" aria-hidden="true">
                <span style={{ width: `${goal.split.protein * 100}%` }} className="bg-leaf" />
                <span style={{ width: `${goal.split.carbs * 100}%` }} className="bg-[#D9A05B]" />
                <span style={{ width: `${goal.split.fat * 100}%` }} className="bg-cream/50" />
              </div>
              <div className="mt-2 flex justify-between text-[10px] font-bold text-cream/60">
                <span>بروتين {goal.split.protein * 100}%</span>
                <span>كارب {goal.split.carbs * 100}%</span>
                <span>دهون {goal.split.fat * 100}%</span>
              </div>

              <div className="mt-5 space-y-2 text-sm font-bold">
                <div className="flex justify-between text-cream/70">
                  <span>سعر الوجبة</span>
                  <span className="text-cream">{price(goal.pricePerMeal)}</span>
                </div>
                <div className="flex justify-between text-cream/70">
                  <span>السعر اليومي</span>
                  <span className="flex items-center gap-1.5 text-cream">
                    {price(quote.daily)}
                    {quote.discount > 0 && (
                      <span className="rounded-full bg-leaf/20 px-2 py-0.5 text-[10px] font-black text-leaf">
                        −{quote.discount * 100}%
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t border-cream/15 pt-3 text-base font-black">
                  <span>الإجمالي الشهري</span>
                  <span>{price(quote.monthly)}</span>
                </div>
                {quote.savings > 0 && (
                  <p className="text-[11px] font-black text-leaf">
                    توفّر {price(quote.savings)} شهرياً بخصم الباقة ✅
                  </p>
                )}
              </div>

              <div className="mt-5 space-y-2.5">
                <div>
                  <input
                    className={darkInput}
                    placeholder="الاسم الكامل *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs font-bold text-orange-soft">{errors.name}</p>
                  )}
                </div>
                <div>
                  <input
                    className={`${darkInput} text-left`}
                    dir="ltr"
                    inputMode="tel"
                    placeholder="0912345678 *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs font-bold text-orange-soft">{errors.phone}</p>
                  )}
                </div>
              </div>

              <button
                onClick={submit}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-wa py-4 text-base font-black text-white transition hover:-translate-y-0.5 hover:brightness-110"
              >
                <IconWhatsApp className="h-5 w-5" />
                اشترك عبر واتساب — {price(quote.monthly)}
              </button>
              {sent && (
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-black text-leaf">
                  <IconCheck className="h-4 w-4" strokeWidth={3} />
                  فتحنا واتساب برسالة اشتراكك المفصّلة
                </p>
              )}
              <p className="mt-3 text-center text-[10px] font-bold leading-5 text-cream/50">
                يبدأ الاشتراك بعد تأكيد الماكروز والدفع مع فريق فيتبايت على واتساب.
              </p>
            </aside>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
