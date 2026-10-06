import { IconStar } from './Icons';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

const REVIEWS = [
  {
    name: 'أحمد مبارك',
    role: 'رياضي — نظام ضخامة',
    initial: 'أ',
    text: 'أول مرة آكل صحي بدون ما أحسب بنفسي — الماكروز مظبوطة بالضبط مثل ما مكتوب، والطعم أقوى من مطاعم عادية.',
  },
  {
    name: 'سارة عبد الله',
    role: 'موظفة — نظام تنشيف',
    initial: 'س',
    text: 'بوكسات الغداء توصلني كل يوم للشغل طازجة وباردة، ووفرت عليّ تفكير الدايت كله. الطلب عبر واتساب سريع ومرتب.',
  },
  {
    name: 'محمد عثمان',
    role: 'مشترك نظام الأسبوع',
    initial: 'م',
    text: 'نظام الأسبوع غيّر روتيني كلياً: وجبات محسوبة لهدفي للتنشيف، ونزلت 6 كيلو في شهرين بدون ما أحس بجوع.',
  },
];

export default function Testimonials() {
  return (
    <section id="reviews" className="scroll-mt-20 border-t border-sand bg-card/50 py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="آراء العملاء"
          title="عملاؤنا يحكون التجربة"
          sub="ثقة تُبنى وجبة بعد وجبة — هذه بعض أصواتهم."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.name} delay={i * 0.1} className="h-full">
              <figure className="flex h-full flex-col gap-4 rounded-3xl border border-sand bg-card p-6 shadow-soft transition duration-300 hover:-translate-y-1.5 hover:shadow-lift">
                <div className="flex gap-1" aria-label="تقييم 5 من 5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <IconStar key={s} className="h-4 w-4 text-copper" />
                  ))}
                </div>
                <blockquote className="text-sm leading-8 text-ink/80">«{r.text}»</blockquote>
                <figcaption className="mt-auto flex items-center gap-3 pt-2">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-olive text-lg font-black text-cream">
                    {r.initial}
                  </span>
                  <span>
                    <b className="block text-sm font-black text-forest">{r.name}</b>
                    <span className="text-xs font-bold text-muted">{r.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
