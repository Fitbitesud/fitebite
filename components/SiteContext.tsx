'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { DEFAULT_SITE, type SiteData } from '@/lib/site-data';

/** مزوّد إعدادات الموقع: تُحقن القيم من الخادم وقت البناء/التصدير لكل المكوّنات */
const SiteContext = createContext<SiteData>(DEFAULT_SITE);

export function SiteProvider({ value, children }: { value: SiteData; children: ReactNode }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export const useSite = (): SiteData => useContext(SiteContext);

/** رابط واتساب مَبني على الرقم المضبوط في لوحة التحكم */
export function useWhatsapp(): (text: string) => string {
  const site = useSite();
  return (text: string) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}
