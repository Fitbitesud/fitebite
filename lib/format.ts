import { SITE } from './config';

/** تنسيق الأرقام بأرقام لاتينية (كما في الهوية البصرية) */
export const fmt = (n: number): string => new Intl.NumberFormat('en-US').format(n);

/** تنسيق سعر كامل مع العملة (العملة قابلة للتمرير من إعدادات لوحة التحكم) */
export const price = (n: number, currency: string = SITE.currency): string =>
  `${fmt(n)} ${currency}`;
