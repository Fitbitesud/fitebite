import { SITE } from '@/lib/config';
import { IconBike, IconCart, IconWhatsApp } from './Icons';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

const STEPS = [
  {
    Icon: IconCart,
    title: 'اختر وجباتك',
    desc: 'تصفح القائمة وأضف ما يعجبك إلى السلة — السعرات والماكروز واضحة أمامك لكل وجبة.',
  },
  {
    Icon: IconWhatsApp,
    title: 'أكّد طلبك بضغطة',
    desc: 'أكمل بياناتك واضغط «إتمام الطلب عبر واتساب» — تصلنا رسالة مفصّلة بطلبك فوراً.',
  },
  {
    Icon: IconBike,
    title: 'وجبتك توصلك طازجة',
    desc: `نجهّز طلبك بنفس اليوم داخل مطبخنا في ${SITE.city} ويوصلك حتى باب البيت.`,
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="كيف تطلب"
          title="ثلاث خطوات تفصلك عن وجبتك"
          sub="طلبك يصل مطبخنا كرسالة واتساب مرتّبة بكل التفاصيل — بدون تطبيقات وبدون تعقيد."
        />
        <div className="relative grid gap-12 md:grid-cols-3 md:gap-8">
          <span
            className="absolute inset-x-[16%] top-10 hidden border-t-2 border-dashed border-sand md:block"
            aria-hidden="true"
          />
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.12}>
              <div className="relative text-center">
                <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-forest text-cream shadow-soft">
                  <s.Icon className="h-8 w-8" />
                  <span className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full border-4 border-cream bg-copper text-sm font-black text-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-black text-forest">{s.title}</h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-muted">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
