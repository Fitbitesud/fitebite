import { IconClipboard, IconLeafSprig, IconPeople, IconPot } from './Icons';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

const FEATURES = [
  {
    Icon: IconClipboard,
    title: 'الدقة الغذائية',
    desc: 'نحرص على تقديم بيانات غذائية دقيقة لكل وجبة، تشمل البروتين والكربوهيدرات والدهون والسعرات الحرارية، لمساعدتك على متابعة نظامك الغذائي بثقة.',
  },
  {
    Icon: IconPot,
    title: 'طهي صحي',
    desc: 'وجباتنا تُحضّر بدون زيوت مضافة، باستخدام طرق طهي صحية مثل الشواء والبخار والقلي الهوائي.',
  },
  {
    Icon: IconPeople,
    title: 'وجبات تناسب الجميع',
    desc: 'خيارات متنوعة تناسب الرياضيين، ومن يتبعون أنظمة للتخسيس، والموظفين، وكافة الباحثين عن نمط حياة أكثر صحة.',
  },
  {
    Icon: IconLeafSprig,
    title: 'جودة المكونات',
    desc: 'نختار مكوناتنا بعناية، من اللحوم والدواجن والخضروات إلى البهارات والمكونات المستخدمة، لضمان جودة وطعم مميز في كل طبق.',
  },
];

export default function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="لماذا فيتبايت"
          title="ما يميز فيتبايت"
          sub="أربعة وعود نلتزم بها في كل وجبة تخرج من مطبخنا — نفس وعود هويتنا الرسمية."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.1} className="h-full">
              <div className="flex h-full items-start gap-5 rounded-3xl border border-sand bg-card p-6 shadow-soft transition duration-300 hover:-translate-y-1.5 hover:shadow-lift">
                <div className="flex-1">
                  <h3 className="text-xl font-black text-forest">{f.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{f.desc}</p>
                </div>
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-forest text-cream shadow-soft">
                  <f.Icon className="h-7 w-7" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
