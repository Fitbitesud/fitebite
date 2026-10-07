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
import Hero from '@/components/Hero';
import Loader from '@/components/Loader';
import { asset, SITE } from '@/lib/config';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'https://fitbitesud.github.io/fitebite/'),
  title: {
    default: `${SITE.nameAr} | ${SITE.taglineAr}`,
    template: `%s | ${SITE.nameAr}`,
  },
  description: SITE.description,
  keywords: ['طعام صحي', 'دايت', 'ماكروز', 'وجبات صحية', SITE.city, SITE.nameAr],
  openGraph: {
    title: `${SITE.nameAr} | ${SITE.taglineAr}`,
    description: SITE.description,
    locale: 'ar_SD',
    type: 'website',
    images: [asset('/images/hero-bowl.jpg')],
  },
  icons: { icon: asset('/logo-mark.svg') },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth">
      <body className="bg-cream font-sans text-ink antialiased">
        <CartProvider>
          <Loader />
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <FloatingWhatsApp />
        </CartProvider>
      </body>
    </html>
  );
}
