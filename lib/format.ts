import { SITE } from './config';

/** تنسيق الأرقام بأرقام لاتينية (كما في الهوية البصرية) */
export const fmt = (n: number): string => new Intl.NumberFormat('en-US').format(n);

/** تنسيق سعر كامل مع العملة */
export const price = (n: number): string => `${fmt(n)} ${SITE.currency}`;
