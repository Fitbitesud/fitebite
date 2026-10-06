import { IconChart, IconCloche, IconDumbbell, IconFlame, IconLeaf } from './Icons';

const BADGES = [
  { Icon: IconCloche, text: 'طعم شهي وجودة عالية' },
  { Icon: IconChart, text: 'ماكروز محسوبة بدقة' },
  { Icon: IconFlame, text: 'سعرات حرارية دقيقة' },
  { Icon: IconLeaf, text: 'بدون زيوت مضافة — أكل صحي 100%' },
  { Icon: IconDumbbell, text: 'خيارات للضخامة والتنشيف' },
];

/** شريط متحرك بوعود الهوية (مثل الشريط السفلي في البوستر) */
export default function Marquee() {
  return (
    <section className="overflow-hidden bg-forest py-4" aria-label="مميزات فيتبايت">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {[...BADGES, ...BADGES].map((b, i) => (
          <span
            key={i}
            className="mx-5 flex items-center gap-3 whitespace-nowrap text-sm font-extrabold text-cream/90"
          >
            <b.Icon className="h-5 w-5 text-leaf" />
            {b.text}
            <span className="mr-5 text-leaf" aria-hidden="true">
              ✦
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
