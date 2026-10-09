import Link from 'next/link';
import { fmt } from '@/lib/format';
import type { MenuData } from '@/lib/types';
import { IconArrowLeft } from './Icons';
import MenuCard from './MenuCard';
import Reveal from './Reveal';

/**
 * عيّنة قليلة من القائمة كشريط أفقي قابل للسحب في الصفحة الرئيسية،
 * ينتهي ببطاقة تدعو لدخول صفحة القائمة الكاملة /menu.
 */
export default function MenuPreviewStrip({ menu }: { menu: MenuData }) {
  const sample = [
    ...menu.items.filter((i) => i.popular && i.available),
    ...menu.items.filter((i) => !i.popular && i.available),
  ].slice(0, 8);

  return (
    <section className="py-24">
      <div className="container-x">
        <Reveal className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-forest/10 px-4 py-1.5 text-xs font-extrabold text-forest">
              من مطبخنا
            </span>
            <h2 className="mt-3 text-3xl font-black text-forest sm:text-4xl">عيّنة من القائمة</h2>
            <p className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-muted">
              <IconArrowLeft className="h-3.5 w-3.5" />
              اسحب الشريط جانبياً لتقليب الوجبات
            </p>
          </div>
          <Link
            href="/menu"
            className="rounded-full bg-forest px-6 py-3.5 text-sm font-black text-cream shadow-soft transition hover:-translate-y-0.5 hover:bg-forest-deep"
          >
            القائمة الكاملة
          </Link>
        </Reveal>
      </div>

      <div className="relative">
        {/* تلاشٍ عند الطرفين لإيحاء السحب */}
        <span
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-cream to-transparent sm:w-20"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-cream to-transparent sm:w-20"
          aria-hidden="true"
        />
        <div className="no-scrollbar container-x flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 pt-2">
          {sample.map((item, i) => (
            <div key={item._id} className="w-[19rem] shrink-0 snap-start">
              <MenuCard item={item} index={i} />
            </div>
          ))}

          {/* بطاقة نهاية الشريط: تصفح باقي القائمة */}
          <div className="flex w-[19rem] shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-forest/30 bg-forest/5 p-6 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-forest text-cream">
              <IconArrowLeft className="h-5 w-5" />
            </span>
            <b className="text-lg font-black text-forest">عيّنة شهية… لكن</b>
            <p className="text-sm font-bold leading-6 text-muted">
              في القائمة الكاملة {fmt(menu.items.length)} وجبة عبر {fmt(menu.categories.length)}{' '}
              تصنيفات تنتظرك.
            </p>
            <Link
              href="/menu"
              className="mt-1 rounded-full bg-copper px-6 py-3 text-sm font-black text-white transition hover:bg-copper-dark"
            >
              تصفح باقي القائمة
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
