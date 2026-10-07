import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

const base: P = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const IconCart = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 4h2l2.6 12h10.6l2.2-8H7.2" />
    <circle cx="9.5" cy="20" r="1.6" />
    <circle cx="17" cy="20" r="1.6" />
  </svg>
);

export const IconPlus = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconMinus = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 12h14" />
  </svg>
);

export const IconTrash = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </svg>
);

export const IconClose = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const IconMenuBars = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);

export const IconStar = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.2-5.9 3.2 1.2-6.5L2.5 9.4l6.6-.9z" />
  </svg>
);

export const IconClock = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconPin = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 21s-7-5.4-7-11a7 7 0 0114 0c0 5.6-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const IconPhone = (p: P) => (
  <svg {...base} {...p}>
    <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.9a2 2 0 01-.5 2.1L8 10a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.9.6 2.9.7a2 2 0 011.7 2z" />
  </svg>
);

export const IconWhatsApp = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export const IconInstagram = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M17.2 6.8v.01" />
  </svg>
);

export const IconFacebook = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M14 8h3V4h-3a5 5 0 00-5 5v3H6v4h3v8h4v-8h3l1-4h-4V9a1 1 0 011-1z" />
  </svg>
);

export const IconTiktok = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M16.5 3c.4 2.4 1.9 3.9 4.5 4.2v3.3c-1.8 0-3.3-.5-4.5-1.4v6.4a6.2 6.2 0 11-6.2-6.2c.3 0 .7 0 1 .1v3.5a2.8 2.8 0 102.8 2.8V3z" />
  </svg>
);

/* ── أيقونات الميزات (مستوحاة من بوستر الهوية) ── */

export const IconClipboard = (p: P) => (
  <svg {...base} {...p}>
    <rect x="5.5" y="4" width="13" height="17" rx="2.5" />
    <path d="M9 4a3 3 0 016 0" />
    <path d="M9.3 11l1.4 1.4 2.8-2.8M9.3 16l1.4 1.4 2.8-2.8" />
  </svg>
);

export const IconPot = (p: P) => (
  <svg {...base} {...p}>
    <path d="M9 3c0 1.4-1 1.6-1 3M13 3c0 1.4-1 1.6-1 3M17 3c0 1.4-1 1.6-1 3" />
    <path d="M5 10h14v3.5a5.5 5.5 0 01-5.5 5.5h-3A5.5 5.5 0 015 13.5z" />
    <path d="M3 12.5h2M19 12.5h2" />
  </svg>
);

export const IconPeople = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <circle cx="16.5" cy="9.5" r="2.4" />
    <path d="M3.5 19c.5-3.6 2.7-5.6 5.5-5.6s5 2 5.5 5.6M14.8 14.2c2.4.3 4.2 2 4.7 4.8" />
  </svg>
);

export const IconLeafSprig = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 21V9" />
    <path d="M12 13C7.5 13 4.5 10.5 4 6c4.5.3 7.5 2.6 8 7z" />
    <path d="M12 10c.6-3.6 3.2-5.7 7.5-6-.4 4.3-3.2 6.6-7.5 6z" />
  </svg>
);

export const IconFlame = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 22c4 0 7-2.7 7-6.5 0-4.5-4-6.5-4.5-10.5-2.5 1.5-3.5 4-3.5 6-1.5-1-2-2.5-2-4-2 2-4 4.8-4 8.5C5 19.3 8 22 12 22z" />
  </svg>
);

export const IconChart = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 20h18M7 20v-6M12 20V10M17 20V5" />
  </svg>
);

export const IconCloche = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4.5 17a7.5 7.5 0 0115 0z" />
    <path d="M12 9.5V8" />
    <circle cx="12" cy="6.8" r="1.2" />
    <path d="M3 20h18" />
  </svg>
);

export const IconDumbbell = (p: P) => (
  <svg {...base} {...p}>
    <path d="M8 12h8M5 8v8M19 8v8M2.5 10v4M21.5 10v4" />
  </svg>
);

export const IconBike = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="5.5" cy="17.5" r="3" />
    <circle cx="18.5" cy="17.5" r="3" />
    <path d="M5.5 17.5L9 9.5h4.5l3 8M9 9.5L7.5 6.5H10" />
  </svg>
);

export const IconBank = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" />
  </svg>
);

export const IconCash = (p: P) => (
  <svg {...base} {...p}>
    <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
    <circle cx="12" cy="12" r="2.8" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

/* ── أيقونات التصنيفات ── */

export const IconBowl = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 12h16c0 4.4-3.6 8-8 8s-8-3.6-8-8z" />
    <path d="M9 20.5v1M15 20.5v1M8 8c0-1.5 1-1.5 1-3M13 8c0-1.5 1-1.5 1-3" />
  </svg>
);

export const IconLeaf = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 19C5 10 10 5 20 4c-.5 10-5.5 15-15 15z" />
    <path d="M5 19c3-5 7-9 11-11" />
  </svg>
);

export const IconSun = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
  </svg>
);

export const IconCup = (p: P) => (
  <svg {...base} {...p}>
    <path d="M7 5h10l-1.3 15H8.3z" />
    <path d="M12.5 5l3-3M7.6 11h8.8" />
  </svg>
);

export const IconBox = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="8" width="18" height="12" rx="2" />
    <path d="M3 12h18M9 8V5.5h6V8M12 12v8" />
  </svg>
);

export const IconArrowLeft = (p: P) => (
  <svg {...base} {...p}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const IconShield = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 2l8 3.5v5.5c0 5-3.4 9.3-8 10.5-4.6-1.2-8-5.5-8-10.5V5.5z" />
    <path d="M9 11.5l2 2 4-4" />
  </svg>
);
