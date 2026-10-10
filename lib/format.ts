import { SITE } from './config';

/** تنسيق الأرقام بأرقام لاتينية (كما في الهوية البصرية) */
export const fmt = (n: number): string => new Intl.NumberFormat('en-US').format(n);

/** تحويل الأرقام العربية-الهندية (٠١٢…) والفارسية (۰۱۲…) إلى لاتينية */
export const toLatinDigits = (s: string): string =>
  s
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));

/** تنسيق سعر كامل مع العملة (العملة قابلة للتمرير من إعدادات لوحة التحكم) */
export const price = (n: number, currency: string = SITE.currency): string =>
  `${fmt(n)} ${currency}`;
