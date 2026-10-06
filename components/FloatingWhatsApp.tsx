import { SITE } from '@/lib/config';
import { whatsappLink } from '@/lib/whatsapp';
import { IconWhatsApp } from './Icons';

/** زر واتساب عائم للتواصل السريع */
export default function FloatingWhatsApp() {
  return (
    <a
      href={whatsappLink(`مرحباً ${SITE.nameAr}! 👋 أريد الاستفسار عن الوجبات.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      className="group fixed bottom-5 left-5 z-[60]"
    >
      <span className="absolute inset-0 animate-pulsering rounded-full bg-wa/60" aria-hidden="true" />
      <span className="relative grid h-14 w-14 place-items-center rounded-full bg-wa text-white shadow-lift transition group-hover:scale-105">
        <IconWhatsApp className="h-7 w-7" />
      </span>
      <span className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-cream opacity-0 transition group-hover:opacity-100">
        اسألنا على واتساب
      </span>
    </a>
  );
}
