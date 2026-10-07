import type { Metadata } from 'next';
import Link from 'next/link';
import { IconArrowLeft } from '@/components/Icons';
import Menu from '@/components/Menu';
import { getMenu } from '@/lib/menu';

export const metadata: Metadata = {
  title: 'القائمة الكاملة',
  description: 'كل وجبات فيتبايت الصحية مصنّفة وموثّقة بالسعرات والماكروز.',
};

/** صفحة القائمة الكاملة — يُدخل إليها من زر «القائمة» في الرئيسية */
export default async function MenuPage() {
  const menu = await getMenu();

  return (
    <div className="pt-28">
      <div className="container-x mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-extrabold text-muted transition hover:text-forest"
        >
          <IconArrowLeft className="h-4 w-4 rotate-180" />
          العودة للرئيسية
        </Link>
      </div>
      <Menu menu={menu} />
    </div>
  );
}
