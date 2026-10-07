'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
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

const RUN_MS = 3200;
const EXIT_MS = 800;

/**
 * شاشة التحميل: أنيميشن مبني على الشعار نفسه —
 * القوس يُرسم، الدمبل يهبط «ويرفع»، الحرفان يُرسمان، الشوكة والورقة تقفزان،
 * ثم الكلمة العربية وشريط التقدم قبل ستارة صاعدة تكشف الموقع.
 */
export default function Loader() {
  const [stage, setStage] = useState<'run' | 'exit' | 'done'>('run');
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage((s) => (s === 'run' ? 'exit' : s)), RUN_MS);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (stage === 'exit') {
      const t = setTimeout(() => setStage('done'), EXIT_MS);
      return () => clearTimeout(t);
    }
  }, [stage]);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(100, Math.round(((t - start) / 2500) * 100));
      setPct(p);
      if (p < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence>
      {stage !== 'done' && (
        <motion.div
          key="loader"
          onClick={() => setStage((s) => (s === 'run' ? 'exit' : s))}
          className="fixed inset-0 z-[100] flex cursor-pointer select-none flex-col items-center justify-center overflow-hidden bg-cream"
          exit={{ y: '-100%', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
          aria-label="جارٍ تحميل فيتبايت"
        >
          {/* زخرفة أوراق باهتة */}
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rotate-12 text-forest opacity-[0.06]"
            fill="currentColor"
          >
            <path d="M5 19C5 10 10 5 20 4c-.5 10-5.5 15-15 15z" />
          </svg>
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute -bottom-20 -right-16 h-80 w-80 -rotate-45 text-leaf opacity-[0.07]"
            fill="currentColor"
          >
            <path d="M5 19C5 10 10 5 20 4c-.5 10-5.5 15-15 15z" />
          </svg>

          {/* الشعار المتحرك */}
          <motion.svg viewBox={MARK_VIEWBOX} className="h-44 w-44 text-forest" fill="none">
            {/* القوس يُرسم أولاً */}
            <motion.path
              d={PATHS.swoosh}
              stroke="currentColor"
              strokeWidth={STROKE_SWOOSH}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            {/* الدمبل يهبط ثم «يرفع» تكراراً */}
            <motion.g
              initial={{ y: -80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 160, damping: 13 }}
            >
              <motion.g
                transform={DUMBBELL_TRANSFORM}
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, -8, 8, -5, 0] }}
                transition={{ delay: 1.0, duration: 0.9, ease: 'easeInOut' }}
                style={{ originX: '60px', originY: '20px' }}
              >
                <g stroke="currentColor" strokeWidth={STROKE_MAIN} strokeLinecap="round">
                  <path d={PATHS.dumbbellBar} />
                  <path d={PATHS.dumbbellPlateL} />
                  <path d={PATHS.dumbbellPlateR} />
                  <path d={PATHS.dumbbellCapL} strokeWidth={8} />
                  <path d={PATHS.dumbbellCapR} strokeWidth={8} />
                </g>
              </motion.g>
            </motion.g>
            {/* الحرفان يُرسمان */}
            <g transform={LETTERS_TRANSFORM}>
              <motion.path
                d={PATHS.fStem}
                stroke="currentColor"
                strokeWidth={STROKE_MAIN}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.65, duration: 0.45, ease: 'easeOut' }}
              />
              <motion.path
                d={PATHS.fArm}
                stroke="currentColor"
                strokeWidth={STROKE_MAIN}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.9, duration: 0.3, ease: 'easeOut' }}
              />
              <motion.path
                d={PATHS.b}
                stroke="currentColor"
                strokeWidth={STROKE_MAIN}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.8, duration: 0.7, ease: 'easeOut' }}
              />
            </g>
            {/* الشوكة النحاسية تقفز */}
            <motion.g
              transform={FORK_TRANSFORM}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.35, type: 'spring', stiffness: 260, damping: 12 }}
              style={{ originX: '0px', originY: '6px' }}
            >
              <g stroke="#A9743F" strokeWidth={3.2} strokeLinecap="round">
                <path d={FORK_PATHS.handle} />
                <path d={FORK_PATHS.base} />
                <path d={FORK_PATHS.tines} />
              </g>
            </motion.g>
            {/* الورقة تنبت */}
            <motion.path
              d={LEAF_PATH}
              transform={LEAF_TRANSFORM}
              fill="#7E9C4E"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.55, type: 'spring', stiffness: 220, damping: 14 }}
              style={{ originX: '0px', originY: '0px' }}
            />
            <motion.path
              d={LEAF_PATH}
              transform={LEAF2_TRANSFORM}
              fill="#7E9C4E"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.7, type: 'spring', stiffness: 220, damping: 14 }}
              style={{ originX: '0px', originY: '0px' }}
            />
          </motion.svg>

          {/* الكلمة العربية تظهر بستارة */}
          <div className="mt-2 overflow-hidden">
            <motion.span
              className="block text-5xl font-black tracking-tight text-forest"
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ delay: 1.75, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {SITE.nameAr}
            </motion.span>
          </div>
          <motion.p
            className="mt-3 text-sm font-bold text-muted"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.15, duration: 0.5 }}
          >
            {SITE.taglineAr}
          </motion.p>

          {/* شريط التقدم */}
          <div className="mt-8 h-1.5 w-60 overflow-hidden rounded-full bg-sand">
            <motion.div
              className="h-full rounded-full bg-gradient-to-l from-leaf to-orange"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.5, ease: 'easeInOut' }}
            />
          </div>
          <span className="mt-2 text-xs font-black text-muted" dir="ltr">
            {pct}%
          </span>
          <motion.span
            className="mt-4 text-[10px] font-bold text-muted/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.6 }}
          >
            انقر للتخطي
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
