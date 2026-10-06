'use client';

import { motion } from 'framer-motion';
import { SITE } from '@/lib/config';
import { whatsappLink } from '@/lib/whatsapp';
import { IconFlame, IconStar, IconWhatsApp } from './Icons';
import { LogoMark } from './Logo';

const STATS = [
  { value: '+500', label: 'وجبة تُسلّم أسبوعياً', star: false },
  { value: '4.9', label: 'تقييم عملائنا', star: true },
  { value: '45 د', label: 'متوسط زمن التوصيل', star: false },
];

const MACROS = [
  { v: '520', l: 'سعرة' },
  { v: '45غ', l: 'بروتين' },
  { v: '58غ', l: 'كاربوهيدرات' },
];

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pb-28 pt-36 scroll-mt-20">
      {/* خلفية الهبوط: شعار المطعم كخلفية + لون أخضر خفيف فوقه */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* علامة الشعار خلفيةً بأكمل الهبوط */}
        <LogoMark className="absolute left-1/2 top-1/2 h-[135vmin] w-[135vmin] -translate-x-1/2 -translate-y-1/2 text-forest opacity-[0.07]" />
        {/* عمق لوني */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-olive/20 blur-3xl" />
        <div className="absolute -left-24 top-40 h-72 w-72 rounded-full bg-leaf/20 blur-3xl" />
        {/* اللون الأخضر الخفيف فوق الشعار */}
        <div className="absolute inset-0 bg-gradient-to-b from-leaf/20 via-leaf/10 to-cream/70" />
      </div>

      <div className="container-x grid items-center gap-16 lg:grid-cols-2">
        {/* النص */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-leaf/15 px-4 py-2 text-xs font-extrabold text-forest"
          >
            <IconFlame className="h-4 w-4 text-copper" />
            وجبات طازجة تُطهى يومياً بدون زيوت مضافة
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-6 text-4xl font-black leading-[1.2] text-forest sm:text-5xl lg:text-[3.4rem]"
          >
            طعام صحي يُحسب{' '}
            <span className="relative inline-block text-copper">
              بالغرام
              <svg viewBox="0 0 120 14" className="absolute -bottom-2 right-0 w-full" fill="none" aria-hidden="true">
                <path d="M4 10 C30 4 90 4 116 8" stroke="#7E9C4E" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>
            ،
            <br />
            لا بالتقريب.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.6 }}
            className="mt-6 max-w-lg text-base leading-8 text-muted sm:text-lg"
          >
            وجبات محسوبة السعرات والماكروز، مشوية ومطهوة على البخار — حسب هدفك ضخامة أو
            تنشيف — وتوصلك حتى باب البيت في {SITE.city}.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44, duration: 0.6 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <a
              href="#menu"
              className="rounded-full bg-forest px-8 py-4 text-base font-black text-cream shadow-soft transition hover:-translate-y-0.5 hover:bg-forest-deep hover:shadow-lift"
            >
              تصفح القائمة
            </a>
            <a
              href={whatsappLink(`مرحباً ${SITE.nameAr}! 👋 أريد الاستفسار عن الوجبات.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-wa px-7 py-4 text-base font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:brightness-110"
            >
              <IconWhatsApp className="h-5 w-5" />
              اطلب عبر واتساب
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="mt-12 flex items-center gap-5 sm:gap-7"
          >
            {STATS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-5 sm:gap-7">
                {i > 0 && <span className="h-10 w-px bg-sand" aria-hidden="true" />}
                <div>
                  <div className="flex items-center gap-1 text-2xl font-black text-forest">
                    {s.value}
                    {s.star && <IconStar className="h-5 w-5 text-copper" />}
                  </div>
                  <div className="mt-1 text-xs font-bold text-muted">{s.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* الصورة */}
        <div className="relative">
          <div className="absolute -inset-6 rotate-3 rounded-[3rem] bg-olive/15 sm:-inset-8" aria-hidden="true" />
          <div className="absolute -inset-6 -rotate-2 rounded-[3rem] border-2 border-dashed border-leaf/40 sm:-inset-8" aria-hidden="true" />
          <motion.img
            src="/images/hero-bowl.jpg"
            alt="باول الدجاج المشوي من فيتبايت"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.8 }}
            className="relative aspect-[4/3] w-full rounded-[2.5rem] border-4 border-card object-cover shadow-lift"
          />
          <motion.span
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: -3 }}
            transition={{ delay: 0.9, type: 'spring', stiffness: 200, damping: 14 }}
            className="absolute -top-5 left-6 rounded-full bg-copper px-4 py-2 text-xs font-black text-white shadow-lift"
          >
            100% بدون زيوت مضافة
          </motion.span>
          <div className="absolute -bottom-12 right-4 animate-float sm:right-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="rounded-2xl border border-sand bg-card/95 p-4 shadow-soft backdrop-blur"
            >
              <div className="flex items-center gap-2 text-xs font-black text-forest">
                <IconFlame className="h-4 w-4 text-copper" />
                باول الدجاج المشوي
              </div>
              <div className="mt-2.5 flex gap-2 text-center">
                {MACROS.map((m) => (
                  <div key={m.l} className="rounded-lg border border-sand bg-cream px-2.5 py-1.5">
                    <b className="block text-sm font-black text-forest">{m.v}</b>
                    <span className="text-[9px] font-bold text-muted">{m.l}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
