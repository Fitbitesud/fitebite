'use client';

import Link from 'next/link';
import { useSite, useWhatsapp } from './SiteContext';
import {
  IconClock,
  IconFacebook,
  IconInstagram,
  IconPhone,
  IconPin,
  IconTiktok,
  IconWhatsApp,
} from './Icons';
import Logo from './Logo';

const QUICK_LINKS = [
  { href: '/#home', label: 'الرئيسية' },
  { href: '/#features', label: 'لماذا فيتبايت' },
  { href: '/menu', label: 'القائمة الكاملة' },
  { href: '/packages', label: 'الباقات الشهرية' },
  { href: '/#how', label: 'كيف تطلب' },
  { href: '/#reviews', label: 'آراء العملاء' },
];

export default function Footer() {
  const site = useSite();
  const wa = useWhatsapp();
  const SOCIALS = [
    { href: site.socials.instagram, Icon: IconInstagram, label: 'إنستغرام' },
    { href: site.socials.facebook, Icon: IconFacebook, label: 'فيسبوك' },
    { href: site.socials.tiktok, Icon: IconTiktok, label: 'تيك توك' },
  ];
  return (
    <footer id="contact" className="scroll-mt-20 bg-forest-deep pt-16 text-cream/75">
      <div className="container-x grid gap-12 lg:grid-cols-4">
        <div>
          <Logo tone="cream" withTagline />
          <p className="mt-5 text-sm leading-7">{site.description}</p>
          <div className="mt-6 flex gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="grid h-10 w-10 place-items-center rounded-full bg-cream/10 transition hover:bg-leaf hover:text-white"
              >
                <s.Icon className="h-4.5 w-4.5" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-5 text-base font-black text-cream">روابط سريعة</h4>
          <ul className="space-y-3 text-sm font-bold">
            {QUICK_LINKS.map((l) => {
              const Tag = l.href.startsWith('/') ? Link : 'a';
              return (
                <li key={l.href}>
                  <Tag href={l.href} className="transition hover:text-leaf">
                    {l.label}
                  </Tag>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-base font-black text-cream">ساعات العمل</h4>
          <ul className="space-y-2.5">
            {site.hours.map((h) => (
              <li
                key={h.days}
                className="flex items-center justify-between gap-4 rounded-xl bg-cream/5 px-4 py-3 text-sm font-bold"
              >
                <span className="flex items-center gap-2">
                  <IconClock className="h-4 w-4 text-leaf" />
                  {h.days}
                </span>
                <span className="text-cream">{h.time}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-center gap-2 text-sm font-bold">
            <IconPin className="h-4 w-4 text-leaf" />
            {site.address}
          </p>
        </div>

        <div>
          <h4 className="mb-5 text-base font-black text-cream">تواصل معنا</h4>
          <a
            href={wa(`مرحباً ${site.nameAr}! 👋`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-wa px-6 py-3.5 text-sm font-black text-white transition hover:brightness-110"
          >
            <IconWhatsApp className="h-5 w-5" />
            اطلب عبر واتساب
          </a>
          <p className="mt-4 flex items-center gap-2 text-sm font-bold">
            <IconPhone className="h-4 w-4 text-leaf" />
            <span dir="ltr">{site.whatsappDisplay}</span>
          </p>
          <p className="mt-3 text-xs leading-6 text-cream/60">
            نرد على رسائل الواتساب خلال دقائق خلال ساعات العمل — طلبك يصل المطبخ مباشرة
            كرسالة مفصّلة.
          </p>
        </div>
      </div>

      <div className="mt-14 border-t border-cream/10 py-6">
        <div className="container-x flex flex-col items-center justify-between gap-3 text-xs font-bold sm:flex-row">
          <span>© 2026 {site.nameAr} — كل الحقوق محفوظة.</span>
          <span className="flex items-center gap-1.5">
            صُنع بحب في {site.city}
            <span className="text-leaf" aria-hidden="true">
              🌿
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
