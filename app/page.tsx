import CtaBanner from '@/components/CtaBanner';
import Comments from '@/components/Comments';
import FaqSection from '@/components/FaqSection';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Hero from '@/components/Hero';
import MenuPreviewStrip from '@/components/MenuPreviewStrip';
import PackagesBanner from '@/components/PackagesBanner';
import SpecialOffers from '@/components/offers/SpecialOffers';
import VideoShowcase from '@/components/VideoShowcase';
import { getApprovedComments } from '@/lib/comments';
import { getFaqs } from '@/lib/faq';
import { getMenu } from '@/lib/menu';
import { getOffers } from '@/lib/offers';
import { getVideos } from '@/lib/videos';

export default async function HomePage() {
  // مصدر البيانات محلي افتراضياً، ومع ربط Sanity يُجلب من لوحة التحكم بدون تغيير أي مكوّن
  const [menu, approvedComments, offers, videos, faqs] = await Promise.all([
    getMenu(),
    getApprovedComments(),
    getOffers(),
    getVideos(),
    getFaqs(),
  ]);

  return (
    <>
      <Hero />
      <VideoShowcase videos={videos} />
      <Features />
      <MenuPreviewStrip menu={menu} />
      <SpecialOffers offers={offers} />
      <PackagesBanner />
      <HowItWorks />
      <CtaBanner />
      <Comments approved={approvedComments} />
      <FaqSection faqs={faqs} />
    </>
  );
}
