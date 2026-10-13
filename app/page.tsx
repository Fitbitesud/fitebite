import CtaBanner from '@/components/CtaBanner';
import Comments from '@/components/Comments';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Hero from '@/components/Hero';
import MenuPreviewStrip from '@/components/MenuPreviewStrip';
import PackagesBanner from '@/components/PackagesBanner';
import SpecialOffers from '@/components/offers/SpecialOffers';
import { getApprovedComments } from '@/lib/comments';
import { getMenu } from '@/lib/menu';
import { getOffers } from '@/lib/offers';

export default async function HomePage() {
  // مصدر البيانات حالياً محلي — وبعد ضبط متغيرات البيئة يُجلب من Sanity بدون تغيير أي مكوّن
  const [menu, approvedComments, offers] = await Promise.all([
    getMenu(),
    getApprovedComments(),
    getOffers(),
  ]);

  return (
    <>
      <Hero />
      <Features />
      <MenuPreviewStrip menu={menu} />
      <SpecialOffers offers={offers} />
      <PackagesBanner />
      <HowItWorks />
      <CtaBanner />
      <Comments approved={approvedComments} />
    </>
  );
}
