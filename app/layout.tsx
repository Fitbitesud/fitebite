import type { Metadata } from 'next';
import '@fontsource/cairo/400.css';
import '@fontsource/cairo/500.css';
import '@fontsource/cairo/700.css';
import '@fontsource/cairo/800.css';
import '@fontsource/cairo/900.css';
import './globals.css';
import CartDrawer from '@/components/cart/CartDrawer';
import { CartProvider } from '@/components/cart/CartContext';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Loader from '@/components/Loader';
import { SiteProvider } from '@/components/SiteContext';
import { asset } from '@/lib/config';
import { getSite } from '@/lib/site-data';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    metadataBase: new URL(process.env.SITE_URL ?? 'https://fitbitesud.github.io/fitebite/'),
    title: {
      default: `${site.nameAr} | ${site.taglineAr}`,
      template: `%s | ${site.nameAr}`,
    },
    description: site.description,
    keywords: ['طعام صحي', 'دايت', 'ماكروز', 'وجبات صحية', site.city, site.nameAr],
    openGraph: {
      title: `${site.nameAr} | ${site.taglineAr}`,
      description: site.description,
      locale: 'ar_SD',
      type: 'website',
      images: [asset('/images/hero-bowl.jpg')],
    },
    icons: { icon: asset('/logo-mark.svg') },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // تُجلب الإعدادات وقت البناء/التصدير: من Sanity إن ضُبط، وإلا القيم المحلية
  const site = await getSite();

  return (
    <html lang="ar" dir="rtl" className="scroll-smooth">
      <body className="bg-cream font-sans text-ink antialiased">
        <SiteProvider value={site}>
          <CartProvider>
            <Loader />
            <Header />
            <main>{children}</main>
            <Footer />
            <CartDrawer />
            <FloatingWhatsApp />
          </CartProvider>
        </SiteProvider>
      </body>
    </html>
  );
}
