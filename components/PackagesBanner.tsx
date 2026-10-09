import Link from 'next/link';
import { IconCloche } from './Icons';
import Reveal from './Reveal';

/** لافتة الدخول إلى صفحة الباقات الجاهزة (بدل المُخصّص المحذوف) */
export default function PackagesBanner() {
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
                <b className="block text-lg font-black text-forest">تفضّل الجاهز؟</b>
                <p className="mt-1 text-xs font-bold leading-6 text-muted">
                  ست باقات شهرية بأسعار وماكروز معلنة — اختر باقتك ويبدأ اشتراكك من اليوم.
                </p>
              </div>
            </div>
            <Link
              href="/packages"
              className="shrink-0 rounded-full bg-forest px-7 py-3.5 text-sm font-black text-cream shadow-soft transition hover:-translate-y-0.5 hover:bg-forest-deep"
            >
              تصفح الباقات الجاهزة
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
