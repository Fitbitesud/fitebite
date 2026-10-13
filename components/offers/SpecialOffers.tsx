'use client';

import { fmt } from '@/lib/format';
import { buildOfferMessage, type Offer } from '@/lib/offers';
import { imgUrl } from '@/lib/site-data';
import { useSite, useWhatsapp } from '../SiteContext';
import { useLiveOffers } from '../useLiveData';
import { IconWhatsApp } from '../Icons';
import Reveal from '../Reveal';
import SectionHeading from '../SectionHeading';

/** عرض تاريخ «ساري حتى» بصيغة عربية بأرقام لاتينية (2026-12-31 → 31 ديسمبر 2026) */
function formatValidUntil(iso: string): string {
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('ar-EG-u-nu-latn', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/** بطاقة عرض خاص — صورة + شارة + سعر قبل/بعد + زر طلب مباشر عبر واتساب */
function OfferCard({ offer }: { offer: Offer }) {
  const site = useSite();
  const wa = useWhatsapp();
  const hasPrices = offer.priceOld !== undefined || offer.priceNew !== undefined;

  return (
    <div className="relative flex h-full flex-col gap-3.5 rounded-3xl border border-sand bg-card p-5 shadow-soft transition duration-300 hover:-translate-y-1.5 hover:shadow-lift">
      {offer.badge && (
        <span className="absolute -top-3 right-5 z-10 rounded-full bg-orange px-3 py-1 text-[10px] font-black text-white shadow">
          {offer.badge}
        </span>
      )}
      <div className="relative">
        <img
          src={imgUrl(offer.image)}
          alt={offer.title}
          loading="lazy"
          className="h-40 w-full rounded-2xl object-cover"
        />
        {offer.validUntil && (
          <span className="absolute bottom-2 right-2 rounded-full bg-forest-deep/85 px-3 py-1 text-[10px] font-black text-cream backdrop-blur">
            ساري حتى {formatValidUntil(offer.validUntil)}
          </span>
        )}
      </div>
      <div>
        <b className="block text-lg font-black text-forest">{offer.title}</b>
        {offer.desc && <p className="mt-1 text-xs font-bold leading-6 text-muted">{offer.desc}</p>}
      </div>
      {hasPrices && (
        <div className="flex items-end gap-2 leading-none">
          {offer.priceNew !== undefined && (
            <span className="text-2xl font-black text-copper-dark">{fmt(offer.priceNew)}</span>
          )}
          {offer.priceOld !== undefined && (
            <span className="text-sm font-black text-muted line-through">{fmt(offer.priceOld)}</span>
          )}
          <span className="text-[10px] font-bold text-muted">{site.currency}</span>
        </div>
      )}
      <a
        href={wa(buildOfferMessage(offer, site))}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-copper py-3 text-center text-sm font-black text-white transition hover:bg-copper-dark"
      >
        <IconWhatsApp className="h-4 w-4" />
        اطلب العرض
      </a>
    </div>
  );
}

/**
 * قسم العروض الخاصة في الصفحة الرئيسية — يُدار من لوحة التحكم.
 * يختفي بالكامل إذا أُوقف من إعدادات الموقع أو إذا لم توجد عروض سارية.
 */
export default function SpecialOffers({ offers }: { offers: Offer[] }) {
  const site = useSite();
  const live = useLiveOffers(offers);

  if (!site.home.offersEnabled || live.length === 0) return null;

  const head = site.home.offersHeading;

  return (
    <section id="offers" className="scroll-mt-20 py-24">
      <div className="container-x">
        <SectionHeading eyebrow={head.eyebrow} title={head.title} sub={head.sub} />
        <div className="grid gap-6 pt-2 sm:grid-cols-2 lg:grid-cols-3">
          {live.map((offer, i) => (
            <Reveal key={offer.id} delay={(i % 3) * 0.08} className="h-full">
              <OfferCard offer={offer} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
