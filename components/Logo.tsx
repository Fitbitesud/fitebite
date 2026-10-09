import { SITE } from '@/lib/config';
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

/** الشعار الكامل: العلامة + الكلمة (عربية افتراضياً، أو إنجليزية عبر wordmark) */
export default function Logo({
  withWordmark = true,
  withTagline = false,
  tone = 'forest',
  wordmark,
  className = '',
}: {
  withWordmark?: boolean;
  withTagline?: boolean;
  tone?: 'forest' | 'cream';
  wordmark?: string;
  className?: string;
}) {
  const main = tone === 'cream' ? 'text-cream' : 'text-forest';
  const word = tone === 'cream' ? 'text-cream' : 'text-forest';
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <LogoMark className={`h-11 w-11 shrink-0 ${main}`} />
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={`text-2xl font-black tracking-tight ${word}`}
            dir={wordmark ? 'ltr' : undefined}
          >
            {wordmark ?? SITE.nameAr}
          </span>
          {withTagline && (
            <span
              className={`mt-1.5 flex items-center gap-1.5 text-[11px] font-bold ${
                tone === 'cream' ? 'text-cream/70' : 'text-muted'
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="#7E9C4E" strokeWidth="2">
                <path d="M5 19C5 10 10 5 20 4c-.5 10-5.5 15-15 15z" />
              </svg>
              {SITE.taglineAr}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
