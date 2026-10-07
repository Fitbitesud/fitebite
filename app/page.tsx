import CtaBanner from '@/components/CtaBanner';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Hero from '@/components/Hero';
import MenuPreviewStrip from '@/components/MenuPreviewStrip';
import SubscriptionBuilder from '@/components/subscriptions/SubscriptionBuilder';
import Testimonials from '@/components/Testimonials';
import { getMenu } from '@/lib/menu';

export default async function HomePage() {
  // مصدر البيانات حالياً محلي — لاحقاً يُجلب من Sanity بدون تغيير أي مكوّن
  const menu = await getMenu();

  return (
    <>
      <Hero />
      <Features />
      <MenuPreviewStrip menu={menu} />
      <SubscriptionBuilder />
      <HowItWorks />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
