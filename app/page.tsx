import CtaBanner from '@/components/CtaBanner';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Hero from '@/components/Hero';
import Menu from '@/components/Menu';
import Testimonials from '@/components/Testimonials';
import { getMenu } from '@/lib/menu';

export default async function HomePage() {
  // مصدر البيانات حالياً محلي — لاحقاً يُجلب من Sanity بدون تغيير أي مكوّن
  const menu = await getMenu();

  return (
    <>
      <Hero />
      <Features />
      <Menu menu={menu} />
      <HowItWorks />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
