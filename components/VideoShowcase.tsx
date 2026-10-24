'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { imgUrl } from '@/lib/site-data';
import {
  resolveVideoPlayback,
  type HomeVideo,
  type PreviewScene,
} from '@/lib/videos';
import { IconPlay } from './Icons';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { useSite } from './SiteContext';
import { useLiveVideos } from './useLiveData';

/**
 * عارض حركي للمربعات الافتراضية قبل رفع ملفات الفيديو من لوحة التحكم.
 * يعمل تلقائياً ويتكرر بلا أي أدوات تحكم (لا شريط تقدّم ولا أزرار إيقاف/إغلاق)،
 * وتظهر الصورة كاملة داخل المربع دون قص أي جزء منها.
 */
function MotionPreviewPlayer({ scenes }: { scenes: PreviewScene[] }) {
  const [sceneIdx, setSceneIdx] = useState(0);

  useEffect(() => {
    if (scenes.length <= 1) return;
    const t = window.setInterval(() => {
      setSceneIdx((i) => (i + 1) % scenes.length);
    }, 2800);
    return () => window.clearInterval(t);
  }, [scenes.length]);

  const current = scenes[sceneIdx % scenes.length] ?? scenes[0];

  return (
    <div className="absolute inset-0 overflow-hidden bg-forest-deep">
      {/* خلفية ضبابية من المشهد الحالي تملأ الفراغ حول الصورة دون قصّها */}
      <img
        src={imgUrl(current.image)}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-2xl"
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.img
          key={`${sceneIdx}-${current.image}`}
          src={imgUrl(current.image)}
          alt={current.caption}
          initial={{ opacity: 0.35 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.35 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 h-full w-full object-contain"
        />
      </AnimatePresence>
      <p className="pointer-events-none absolute inset-x-3 bottom-2.5 mx-auto w-fit max-w-[90%] rounded-lg bg-forest-deep/75 px-2.5 py-1 text-center text-[10px] font-extrabold leading-5 text-cream backdrop-blur">
        {current.caption}
      </p>
    </div>
  );
}

/**
 * مشغّل ملفات الفيديو المرفوعة: يعمل تلقائياً بصوت مكتوم، يتكرر إلى ما لا نهاية،
 * بلا أدوات تحكم نهائياً، ويُظهر كامل إطار الفيديو (object-contain) دون قصّ.
 */
function SilentLoopVideo({ src, poster, title }: { src: string; poster: string; title: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // بعض المتصفحات تمنع autoplay إذا لم يكن الصوت مكتوماً أو قبل تجهيز الملف،
    // لذا نُعيد محاولة التشغيل عند تجهيز البيانات لضمان العمل التلقائي دائماً.
    const start = () => {
      el.muted = true;
      const attempt = el.play();
      if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
    };
    start();
    el.addEventListener('loadeddata', start);
    el.addEventListener('canplay', start);
    return () => {
      el.removeEventListener('loadeddata', start);
      el.removeEventListener('canplay', start);
    };
  }, [src]);

  // حذف خاصية controls كلياً: لا شريط تقديم ولا زر تنزيل،
  // مع منع قائمة التنزيل بزر الفأرة الأيمن والتشغيل في نافذة صغيرة.
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      aria-label={title}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      controlsList="nodownload"
      disablePictureInPicture
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      className="absolute inset-0 h-full w-full object-contain"
    >
      متصفحك لا يدعم تشغيل الفيديو.
    </video>
  );
}

/** بطاقة فيديو واحدة ضمن المربعات الثلاثة المتتالية */
function VideoBox({ video, index }: { video: HomeVideo; index: number }) {
  const playback = resolveVideoPlayback(video);
  // المشغلات المدعومة تعمل تلقائياً؛ الروابط الخارجية وحدها تحتاج نقرة
  // لأن المتصفح يمنع فتح النوافذ المنبثقة دون تفاعل من المستخدم.
  // روابط يوتيوب/فيميو المضمّنة تحمل controls=0 وloop، وpointer-events-none
  // يمنع إيقافها بالنقر أو عبر لوحة المفاتيح.
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-sand bg-card p-4 shadow-soft transition duration-300 hover:-translate-y-1.5 hover:shadow-lift">
      {/* إطار الفيديو: الفيديو كاملاً بلا قص، وبلا أي أدوات تحكم */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-forest-deep">
        {/* خلفية ضبابية تملأ الحواشي حول الفيديو الكامل (العرض الافتراضي له خلفيته الخاصة) */}
        {playback.kind === 'file' && (
          <img
            src={imgUrl(video.poster)}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-2xl"
          />
        )}

        {playback.kind === 'file' ? (
          <SilentLoopVideo
            src={playback.src}
            poster={imgUrl(video.poster)}
            title={video.title}
          />
        ) : playback.kind === 'embed' ? (
          <iframe
            src={playback.embedUrl}
            title={video.title}
            allow="autoplay; encrypted-media"
            className="pointer-events-none absolute inset-0 h-full w-full border-0"
          />
        ) : playback.kind === 'preview' ? (
          <MotionPreviewPlayer scenes={playback.scenes} />
        ) : (
          <button
            type="button"
            onClick={() => window.open(playback.url, '_blank', 'noopener,noreferrer')}
            aria-label={`تشغيل فيديو: ${video.title}`}
            className="absolute inset-0 block h-full w-full text-right"
          >
            <img
              src={imgUrl(video.poster)}
              alt={video.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-deep/80 via-forest-deep/25 to-transparent" />

            {/* رقم المربع + الشارة */}
            <div className="pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between gap-2">
              {video.badge ? (
                <span className="rounded-full bg-copper px-3 py-1 text-[11px] font-black text-white shadow">
                  {video.badge}
                </span>
              ) : (
                <span />
              )}
              <span className="grid h-7 w-7 place-items-center rounded-full border border-cream/25 bg-forest-deep/75 text-xs font-black text-cream backdrop-blur">
                {index + 1}
              </span>
            </div>

            {/* زر التشغيل في المنتصف */}
            <span className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className="relative grid h-14 w-14 place-items-center">
                <span
                  className="absolute inset-0 animate-pulsering rounded-full bg-copper/60"
                  aria-hidden="true"
                />
                <span className="relative grid h-14 w-14 place-items-center rounded-full bg-copper text-white shadow-lift transition duration-300 group-hover:scale-110 group-hover:bg-orange">
                  <IconPlay className="h-6 w-6 translate-x-[-1px]" />
                </span>
              </span>
            </span>
          </button>
        )}
      </div>

      {/* عنوان ووصف الفيديو */}
      <div className="mt-4 flex flex-1 flex-col px-1">
        <h3 className="text-lg font-black text-forest">{video.title}</h3>
        {video.desc && (
          <p className="mt-1.5 text-xs font-bold leading-6 text-muted">{video.desc}</p>
        )}
      </div>
    </article>
  );
}

/**
 * قسم المربعات الثلاثة المتتالية للفيديوهات بعد صفحة الهبوط مباشرة.
 * الفيديوهات تُضاف وتُعدّل من قائمة «فيديوهات الصفحة الرئيسية» في لوحة تحكم Sanity.
 * كل فيديو يعمل تلقائياً ويتكرر بلا أدوات تحكم ويظهر كاملاً داخل مربعه دون قص.
 */
export default function VideoShowcase({ videos }: { videos: HomeVideo[] }) {
  const site = useSite();
  const live = useLiveVideos(videos);

  if (!site.home.videosEnabled || live.length === 0) return null;

  const head = site.home.videosHeading;

  return (
    <section id="videos" className="scroll-mt-20 border-b border-sand bg-card/50 py-20">
      <div className="container-x">
        <SectionHeading eyebrow={head.eyebrow} title={head.title} sub={head.sub} />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {live.map((video, i) => (
            <Reveal key={video.id} delay={(i % 3) * 0.08} className="h-full">
              <VideoBox video={video} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
