'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { asset, SITE } from '@/lib/config';
import { whatsappLink } from '@/lib/whatsapp';
import {
  IconChart,
  IconCloche,
  IconFlame,
  IconLeaf,
  IconStar,
  IconWhatsApp,
} from './Icons';

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

/** شريط وعود الهوية — مثل الشريط السفلي في البوستر الرسمي */
const STRIP = [
  { Icon: IconCloche, t: 'طعم شهي', s: 'وجودة عالية' },
  { Icon: IconChart, t: 'ماكروز', s: 'محسوبة بدقة' },
  { Icon: IconFlame, t: 'سعرات حرارية', s: 'دقيقة' },
  { Icon: IconLeaf, t: 'بدون زيوت', s: 'أكل صحي 100%' },
];

export default function Hero() {
  return (
    <section id="home" className="relative scroll-mt-20 overflow-hidden bg-forest pt-32 text-cream">
      {/* خلفية بسيطة: لون أخضر داكن مسطّح + إضاءة علوية خفيفة واحدة */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(126,156,78,0.14),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="container-x relative grid items-center gap-16 pb-24 pt-10 lg:grid-cols-2 lg:pb-28">
        {/* النص */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/10 px-4 py-2 text-xs font-extrabold text-cream backdrop-blur"
          >
            <IconFlame className="h-4 w-4 text-[#D9A05B]" />
            وجبات طازجة تُطهى يومياً بدون زيوت مضافة
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-6 text-4xl font-black leading-[1.25] text-cream sm:text-5xl lg:text-[3.4rem]"
          >
            طعام صحي يُحسب{' '}
            <span className="relative inline-block text-[#D9A05B]">
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
            className="mt-6 max-w-lg text-base leading-8 text-cream/70 sm:text-lg"
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
            <Link
              href="/menu"
              className="rounded-full bg-copper px-8 py-4 text-base font-black text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-copper-dark"
            >
              تصفح القائمة
            </Link>
            <a
              href={whatsappLink(`مرحباً ${SITE.nameAr}! 👋 أريد الاستفسار عن الوجبات.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-wa px-7 py-4 text-base font-black text-white shadow-lift transition hover:-translate-y-0.5 hover:brightness-110"
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
                {i > 0 && <span className="h-10 w-px bg-cream/15" aria-hidden="true" />}
                <div>
                  <div className="flex items-center gap-1 text-2xl font-black text-cream">
                    {s.value}
                    {s.star && <IconStar className="h-5 w-5 text-[#D9A05B]" />}
                  </div>
                  <div className="mt-1 text-xs font-bold text-cream/60">{s.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* الصورة بإطار نظيف بسيط */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <motion.img
            src={asset('/images/hero-bowl.jpg')}
            alt="باول الدجاج المشوي من فيتبايت"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.8 }}
            className="relative aspect-[4/5] w-full rounded-[2.5rem] border border-cream/10 object-cover shadow-2xl"
          />
          <motion.span
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: -3 }}
            transition={{ delay: 0.9, type: 'spring', stiffness: 200, damping: 14 }}
            className="absolute -top-4 left-8 rounded-full bg-copper px-4 py-2 text-xs font-black text-white shadow-lift"
          >
            100% بدون زيوت مضافة
          </motion.span>
          <div className="absolute -bottom-10 right-4 animate-float sm:right-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="rounded-2xl border border-cream/10 bg-forest-deep/85 p-4 shadow-lift backdrop-blur"
            >
              <div className="flex items-center gap-2 text-xs font-black text-cream">
                <IconFlame className="h-4 w-4 text-[#D9A05B]" />
                باول الدجاج المشوي
              </div>
              <div className="mt-2.5 flex gap-2 text-center">
                {MACROS.map((m) => (
                  <div key={m.l} className="rounded-lg border border-cream/10 bg-cream/10 px-2.5 py-1.5">
                    <b className="block text-sm font-black text-cream">{m.v}</b>
                    <span className="text-[9px] font-bold text-cream/60">{m.l}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* شريط وعود الهوية أسفل الهبوط */}
      <div className="relative grid grid-cols-2 divide-x divide-x-reverse divide-y divide-cream/10 border-t border-cream/10 bg-forest-deep/70 backdrop-blur lg:grid-cols-4 lg:divide-y-0">
        {STRIP.map((s, i) => (
          <motion.div
            key={s.t}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="flex items-center gap-3.5 px-6 py-5"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-cream/20 bg-cream/5 text-leaf">
              <s.Icon className="h-5 w-5" />
            </span>
            <span>
              <b className="block text-sm font-black text-cream">{s.t}</b>
              <span className="text-[11px] font-bold text-cream/60">{s.s}</span>
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
