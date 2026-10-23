'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { imgUrl } from '@/lib/site-data';
import {
  resolveVideoPlayback,
  type HomeVideo,
  type PreviewScene,
} from '@/lib/videos';
import { IconClose, IconPause, IconPlay } from './Icons';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { useSite } from './SiteContext';
import { useLiveVideos } from './useLiveData';

/** عارض حركي تفاعلي للمربعات الافتراضية قبل رفع ملفات الفيديو من لوحة التحكم */
function MotionPreviewPlayer({
  scenes,
  onClose,
}: {
  scenes: PreviewScene[];
  onClose: () => void;
}) {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || scenes.length <= 1) return;
    const t = window.setInterval(() => {
      setSceneIdx((i) => (i + 1) % scenes.length);
    }, 2800);
    return () => window.clearInterval(t);
  }, [paused, scenes.length]);

  const current = scenes[sceneIdx % scenes.length] ?? scenes[0];

  return (
    <div className="relative h-full w-full overflow-hidden bg-forest-deep">
      <AnimatePresence mode="wait">
        <motion.img
          key={`${sceneIdx}-${current.image}`}
          src={imgUrl(current.image)}
          alt={current.caption}
          initial={{ opacity: 0.4, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1.1 }}
          exit={{ opacity: 0.3 }}
          transition={{ duration: 2.6, ease: 'easeOut' }}
          className="h-full w-full object-cover"
        />
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-deep/90 via-forest-deep/20 to-forest-deep/40" />

      {/* شريط التقدم العلوي */}
      <div className="absolute inset-x-3 top-3 flex items-center gap-1.5">
        {scenes.map((_, idx) => (
          <div
            key={idx}
            className="h-1 flex-1 overflow-hidden rounded-full bg-cream/25"
          >
            <div
              className={`h-full rounded-full bg-orange-soft transition-all duration-500 ${
                idx <= sceneIdx ? 'w-full' : 'w-0'
              }`}
            />
          </div>
        ))}
      </div>

      {/* أزرار التحكم */}
      <div className="absolute left-3 top-7 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? 'استئناف العرض' : 'إيقاف مؤقت'}
          className="grid h-8 w-8 place-items-center rounded-full bg-forest-deep/80 text-cream backdrop-blur transition hover:bg-copper"
        >
          {paused ? <IconPlay className="h-3.5 w-3.5" /> : <IconPause className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق المشغل"
          className="grid h-8 w-8 place-items-center rounded-full bg-forest-deep/80 text-cream backdrop-blur transition hover:bg-copper"
        >
          <IconClose className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* نص المشهد الحالي */}
      <div className="absolute inset-x-4 bottom-3">
        <p className="rounded-xl bg-forest-deep/80 px-3 py-2 text-xs font-extrabold text-cream backdrop-blur">
          {current.caption}
        </p>
      </div>
    </div>
  );
}

/** بطاقة فيديو واحدة ضمن المربعات الثلاثة المتتالية */
function VideoBox({ video, index }: { video: HomeVideo; index: number }) {
  const [playing, setPlaying] = useState(false);
  const playback = resolveVideoPlayback(video);

  const handleActivate = () => {
    if (playback.kind === 'external') {
      window.open(playback.url, '_blank', 'noopener,noreferrer');
      return;
    }
    setPlaying(true);
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-sand bg-card p-4 shadow-soft transition duration-300 hover:-translate-y-1.5 hover:shadow-lift">
      {/* إطار الفيديو */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-forest-deep">
        {playing ? (
          playback.kind === 'file' ? (
            <div className="relative h-full w-full">
              <video
                src={playback.src}
                poster={imgUrl(video.poster)}
                controls
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              >
                متصفحك لا يدعم تشغيل الفيديو.
              </video>
              <button
                type="button"
                onClick={() => setPlaying(false)}
                aria-label="إغلاق الفيديو"
                className="absolute left-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-forest-deep/80 text-cream backdrop-blur transition hover:bg-copper"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>
          ) : playback.kind === 'embed' ? (
            <div className="relative h-full w-full">
              <iframe
                src={playback.embedUrl}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
              <button
                type="button"
                onClick={() => setPlaying(false)}
                aria-label="إغلاق الفيديو"
                className="absolute left-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-forest-deep/80 text-cream backdrop-blur transition hover:bg-copper"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>
          ) : playback.kind === 'preview' ? (
            <MotionPreviewPlayer
              scenes={playback.scenes}
              onClose={() => setPlaying(false)}
            />
          ) : null
        ) : (
          <button
            type="button"
            onClick={handleActivate}
            aria-label={`تشغيل فيديو: ${video.title}`}
            className="relative block h-full w-full text-right"
          >
            <img
              src={imgUrl(video.poster)}
              alt={video.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/80 via-forest-deep/25 to-transparent" />

            {/* رقم المربع + الشارة */}
            <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
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
            <span className="absolute inset-0 grid place-items-center">
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
