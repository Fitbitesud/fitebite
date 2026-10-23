import type { Metadata } from 'next';
import Link from 'next/link';
import GalleryView from '@/components/GalleryView';
import { IconArrowLeft } from '@/components/Icons';
import SectionHeading from '@/components/SectionHeading';
import { getGalleryItems } from '@/lib/gallery';
import { getSite } from '@/lib/site-data';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: 'معرض الأعمال',
    description: `شاهد صور أعمال وأطباق وتجهيزات مطعم ${site.nameAr} للطعام الصحي المحسوب بالغرام.`,
  };
}

/** صفحة معرض الأعمال — تُعرض فيها صور أعمال وأطباق المطعم المضافة من لوحة التحكم */
export default async function GalleryPage() {
  const items = await getGalleryItems();

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
          eyebrow="أعمالنا عن قرب"
          title="معرض الأعمال"
          sub="جولة مصوّرة من مطبخنا: أطباقنا الصحية، تجهيز بوكسات الاشتراكات، والمشويات المحسوبة بالغرام."
        />
        <GalleryView items={items} />
      </div>
    </div>
  );
}
