'use client';

import { imgUrl, logoForTone } from '@/lib/site-data';
import { useSite } from './SiteContext';
import {
  DUMBBELL_TRANSFORM,
  FORK_PATHS,
  FORK_TRANSFORM,
  LEAF_PATH,
  LEAF_TRANSFORM,
  LEAF2_TRANSFORM,
  LETTERS_TRANSFORM,
  MARK_VIEWBOX,
  PATHS,
  STROKE_MAIN,
  STROKE_SWOOSH,
} from './logo-paths';

/** علامة الشعار (بدون أي نص) — اللون الرئيسي عبر currentColor */
export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox={MARK_VIEWBOX} className={className} fill="none" aria-hidden="true">
      {/* الدمبل */}
      <g
        stroke="currentColor"
        strokeWidth={STROKE_MAIN}
        strokeLinecap="round"
        transform={DUMBBELL_TRANSFORM}
      >
        <path d={PATHS.dumbbellBar} />
        <path d={PATHS.dumbbellPlateL} />
        <path d={PATHS.dumbbellPlateR} />
        <path d={PATHS.dumbbellCapL} strokeWidth={8} />
        <path d={PATHS.dumbbellCapR} strokeWidth={8} />
      </g>
      {/* حرفا F و B */}
      <g
        transform={LETTERS_TRANSFORM}
        stroke="currentColor"
        strokeWidth={STROKE_MAIN}
        strokeLinecap="round"
      >
        <path d={PATHS.fStem} />
        <path d={PATHS.fArm} />
        <path d={PATHS.b} />
      </g>
      {/* القوس السفلي */}
      <path d={PATHS.swoosh} stroke="currentColor" strokeWidth={STROKE_SWOOSH} strokeLinecap="round" />
      {/* الشوكة النحاسية */}
      <g transform={FORK_TRANSFORM} stroke="#A9743F" strokeWidth={3.2} strokeLinecap="round">
        <path d={FORK_PATHS.handle} />
        <path d={FORK_PATHS.base} />
        <path d={FORK_PATHS.tines} />
      </g>
      {/* الورقة */}
      <path d={LEAF_PATH} transform={LEAF_TRANSFORM} fill="#7E9C4E" />
      <path d={LEAF_PATH} transform={LEAF2_TRANSFORM} fill="#7E9C4E" />
    </svg>
  );
}

/** الشعار الكامل في الشريط؛ مصدر الصورة قابل للتعديل من لوحة التحكم (logo / logoDark). */
export default function Logo({
  tone = 'forest',
  className = '',
}: {
  /** forest = خلفية فاتحة (الشعار الأساسي) | cream = الخلفية الداكنة (شعار الخلفية الداكنة إن وُجد) */
  tone?: 'forest' | 'cream';
  className?: string;
}) {
  const site = useSite();
  return (
    <span className={`flex items-center ${className}`}>
      <img
        src={imgUrl(logoForTone(site, tone))}
        alt={`شعار ${site.nameAr}`}
        className={`h-14 w-auto max-w-[190px] object-contain transition ${
          tone === 'cream' ? 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]' : ''
        }`}
      />
    </span>
  );
}
