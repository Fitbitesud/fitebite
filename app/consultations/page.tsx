import type { Metadata } from 'next';
import Link from 'next/link';
import ConsultationsForm from '@/components/ConsultationsForm';
import { IconArrowLeft } from '@/components/Icons';
import SectionHeading from '@/components/SectionHeading';
import { getSite } from '@/lib/site-data';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: 'الاستشارات الغذائية',
    description: `أرسل استشارتك الغذائية والصحية مباشرة إلى إدارة ${site.nameAr} لمساعدتك في اختيار الوجبات والباقات المناسبة لهدفك.`,
  };
}

/** صفحة الاستشارات — يكتب فيها الزبون استشارته لإرسالها لصاحب الموقع */
export default async function ConsultationsPage() {
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
          eyebrow="الاستشارات الغذائية"
          title="أرسل استشارتك لصاحب الموقع"
          sub="اكتب هدفك الصحي أو سؤالك الغذائي وسنساعدك في اختيار الوجبات، السعرات، أو الباقة الشهرية الأنسب لك."
        />
        <ConsultationsForm />
      </div>
    </div>
  );
}
