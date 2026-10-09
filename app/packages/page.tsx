import type { Metadata } from 'next';
import Link from 'next/link';
import { IconArrowLeft, IconWhatsApp } from '@/components/Icons';
import SectionHeading from '@/components/SectionHeading';
import ReadyPackages from '@/components/subscriptions/ReadyPackages';
import { SITE } from '@/lib/config';
import { whatsappLink } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'الباقات الشهرية',
  description: 'باقات فيتبايت الشهرية الجاهزة: تضخيم، تنشيف، ومحافظة — بأسعار وماكروز معلنة وضمان فيتبايت.',
};

/** صفحة الباقات الشهرية الجاهزة — يُدخل إليها من الهيدر والرئيسية */
export default function PackagesPage() {
  return (
    <div className="pb-24 pt-28">
      <div className="container-x mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-extrabold text-muted transition hover:text-forest"
        >
          <IconArrowLeft className="h-4 w-4 rotate-180" />
          العودة للرئيسية
        </Link>
      </div>

      <div className="container-x">
        <SectionHeading
          eyebrow="الاشتراكات الشهرية"
          title="باقات جاهزة بأسعار معلنة"
          sub="ست باقات تغطي أهداف التضخيم والتنشيف والمحافظة — اختر باقتك ويكتمل اشتراكك من الرئيسية في ثوانٍ."
        />
        <ReadyPackages />

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <a
            href={whatsappLink(`مرحباً ${SITE.nameAr}! 👋 أريد استفساراً عن الباقات الشهرية.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-wa px-7 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:brightness-110"
          >
            <IconWhatsApp className="h-4 w-4" />
            استفسر عبر واتساب
          </a>
        </div>
      </div>
    </div>
  );
}
