'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getSite, DEFAULT_SITE, type SiteData } from '@/lib/site-data';

/**
 * مزوّد إعدادات الموقع:
 *  - القيمة الأولية تُحقن من الخادم وقت البناء (أول رسم + SEO).
 *  - ثم يُعاد الجلب من Sanity في المتصفح فوراً — أي Publish من لوحة التحكم
 *    ينعكس على النصوص والأرقام والروابط بمجرد تحديث الصفحة بدون إعادة بناء.
 */
const SiteContext = createContext<SiteData>(DEFAULT_SITE);

export function SiteProvider({ value, children }: { value: SiteData; children: ReactNode }) {
  const [site, setSite] = useState<SiteData>(value);

  useEffect(() => {
    let alive = true;
    getSite()
      .then((s) => alive && setSite(s))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>;
}

export const useSite = (): SiteData => useContext(SiteContext);

/** رابط واتساب مَبني على الرقم المضبوط في لوحة التحكم */
export function useWhatsapp(): (text: string) => string {
  const site = useSite();
  return (text: string) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}
