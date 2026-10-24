import { asset } from './config';
import { getReadClient, isSanityConfigured, type ReadClientOptions } from './sanity/client';
import { VIDEOS_QUERY } from './sanity/queries';

/**
 * فيديوهات الصفحة الرئيسية (المربعات الثلاثة المتتالية بعد الهبوط) —
 * تُدار بالكامل من لوحة التحكم (وثائق `homeVideo` في Sanity Studio).
 * بدون وثائق منشورة في اللوحة تظهر المربعات الثلاثة الافتراضية أدناه.
 */

export interface PreviewScene {
  image: string;
  caption: string;
}

export interface HomeVideo {
  id: string;
  title: string;
  badge?: string;
  desc: string;
  /** رابط ملف فيديو مرفوع مباشرة في لوحة تحكم Sanity */
  videoFileUrl?: string;
  /** رابط فيديو خارجي (يوتيوب، Shorts، Vimeo، أو ملف MP4 مباشر) */
  videoUrl?: string;
  /** صورة غلاف الفيديو قبل التشغيل */
  poster: string;
  /** مشاهد عرض متحركة افتراضية قبل رفع ملف فيديو فعلي من اللوحة */
  previewScenes?: PreviewScene[];
  active: boolean;
  order?: number;
}

export type VideoPlayback =
  | { kind: 'file'; src: string }
  | { kind: 'embed'; embedUrl: string }
  | { kind: 'external'; url: string }
  | { kind: 'preview'; scenes: PreviewScene[] };

/** استخراج معرّف فيديو يوتيوب (يدعم watch?v= و youtu.be/ و shorts/ و embed/) */
export function extractYouTubeId(rawUrl?: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?[^#]*v=)([A-Za-z0-9_-]{11})/,
    /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = re.exec(trimmed);
    if (m?.[1]) return m[1];
  }
  return null;
}

/** استخراج معرّف فيديو Vimeo */
export function extractVimeoId(rawUrl?: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const m = /(?:player\.)?vimeo\.com\/(?:video\/)?(\d{6,12})/.exec(rawUrl.trim());
  return m?.[1] ?? null;
}

/** هل الرابط يشير مباشرة إلى ملف فيديو قابل للتشغيل عبر وسم <video>؟ */
export function isDirectVideoUrl(rawUrl?: string): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const clean = rawUrl.trim().split('?')[0].split('#')[0].toLowerCase();
  return (
    /\.(mp4|webm|ogg|ogv|mov|m4v)$/.test(clean) ||
    clean.includes('cdn.sanity.io/files/')
  );
}

/** تحديد طريقة تشغيل الفيديو داخل المربع */
export function resolveVideoPlayback(video: HomeVideo): VideoPlayback {
  if (video.videoFileUrl && video.videoFileUrl.trim()) {
    return { kind: 'file', src: video.videoFileUrl.trim() };
  }
  const url = video.videoUrl?.trim();
  if (url) {
    if (isDirectVideoUrl(url)) {
      return { kind: 'file', src: url };
    }
    const yt = extractYouTubeId(url);
    if (yt) {
      // controls=0 يخفي شريط التقديم وكل أزرار المشغّل،
      // وloop=1 مع playlist بنفس المعرّف يجعل الفيديو يتكرر تلقائياً في يوتيوب.
      return {
        kind: 'embed',
        embedUrl: `https://www.youtube.com/embed/${yt}?autoplay=1&mute=1&loop=1&playlist=${yt}&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3`,
      };
    }
    const vimeo = extractVimeoId(url);
    if (vimeo) {
      // background=1 في فيميو يخفي كل أدوات التحكم ويفرض التشغيل التلقائي المكتوم المتكرر.
      return {
        kind: 'embed',
        embedUrl: `https://player.vimeo.com/video/${vimeo}?autoplay=1&muted=1&loop=1&background=1&autopause=0&dnt=1`,
      };
    }
    return { kind: 'external', url };
  }
  const scenes =
    video.previewScenes && video.previewScenes.length > 0
      ? video.previewScenes
      : [{ image: video.poster || asset('/images/hero-bowl.jpg'), caption: video.title }];
  return { kind: 'preview', scenes };
}

/** المربعات الثلاثة الافتراضية قبل رفع الفيديوهات من لوحة التحكم */
export const DEFAULT_VIDEOS: HomeVideo[] = [
  {
    id: 'video-healthy-grill',
    title: 'شواء وطهي صحي بدون زيوت ضارة',
    badge: 'الطهي الصحي',
    desc: 'نحضّر الدواجن واللحوم والأسماك بالشواء والبخار للحفاظ على القيمة الغذائية والطعم الأصلي.',
    poster: asset('/images/grill-plate.jpg'),
    previewScenes: [
      { image: asset('/images/grill-plate.jpg'), caption: 'تتبيل طازج ببهارات طبيعية مختارة' },
      { image: asset('/images/beef-bowl.jpg'), caption: 'شواء حراري متوازن بدون أي زيوت مهدرجة' },
      { image: asset('/images/salmon-bowl.jpg'), caption: 'تقديم طازج يحفظ العصارة والبروتين' },
    ],
    active: true,
    order: 1,
  },
  {
    id: 'video-macro-scale',
    title: 'حساب الماكروز والسعرات بالغرام',
    badge: 'دقة غذائية',
    desc: 'كل وجبة تُوزن بدقة لضبط البروتين والكاربوهيدرات والدهون بما يناسب التضخيم أو التنشيف.',
    poster: asset('/images/hero-bowl.jpg'),
    previewScenes: [
      { image: asset('/images/hero-bowl.jpg'), caption: 'وزن دقيق لكل حصة بروتين وكاربوهيدرات' },
      { image: asset('/images/quinoa-salad.jpg'), caption: 'خضروات وحبوب كاملة غنية بالألياف' },
      { image: asset('/images/green-salad.jpg'), caption: 'بيانات غذائية معلنة وواضحة لكل طبق' },
    ],
    active: true,
    order: 2,
  },
  {
    id: 'video-daily-prep',
    title: 'تجهيز وتغليف بوكسات الباقات يومياً',
    badge: 'تجهيز يومي',
    desc: 'نجهّز وجبات المشتركين والطلبات اليومية صباح كل يوم لتصلك طازجة وجاهزة للأكل.',
    poster: asset('/images/mealprep-week.jpg'),
    previewScenes: [
      { image: asset('/images/mealprep-week.jpg'), caption: 'تجهيز منظم لوجبات الأسبوع والاشتراكات' },
      { image: asset('/images/mealprep-box.jpg'), caption: 'عبوات صحية محكمة تحفظ الحرارة والنضارة' },
      { image: asset('/images/pb-shake.jpg'), caption: 'سناكات ومشروبات بروتين مكمّلة لنظامك' },
    ],
    active: true,
    order: 3,
  },
];

type RawVideoDoc = {
  _id: string;
  title?: string | null;
  badge?: string | null;
  desc?: string | null;
  videoFileUrl?: string | null;
  videoUrl?: string | null;
  poster?: string | null;
  active?: boolean | null;
  order?: number | null;
};

function coerceVideo(d: RawVideoDoc): HomeVideo | null {
  const title = typeof d.title === 'string' ? d.title.trim() : '';
  if (!title) return null;
  const videoFileUrl =
    typeof d.videoFileUrl === 'string' && d.videoFileUrl.trim() ? d.videoFileUrl.trim() : undefined;
  const videoUrl =
    typeof d.videoUrl === 'string' && d.videoUrl.trim() ? d.videoUrl.trim() : undefined;
  const ytId = extractYouTubeId(videoUrl);
  const autoYtPoster = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : '';
  const poster =
    typeof d.poster === 'string' && d.poster.trim()
      ? d.poster.trim()
      : autoYtPoster || '/images/hero-bowl.jpg';

  return {
    id: d._id,
    title,
    badge: typeof d.badge === 'string' && d.badge.trim() ? d.badge.trim() : undefined,
    desc: typeof d.desc === 'string' ? d.desc.trim() : '',
    ...(videoFileUrl ? { videoFileUrl } : {}),
    ...(videoUrl ? { videoUrl } : {}),
    poster,
    active: d.active !== false,
    order: typeof d.order === 'number' && Number.isFinite(d.order) ? d.order : undefined,
  };
}

const byOrder = (a: HomeVideo, b: HomeVideo): number => (a.order ?? 0) - (b.order ?? 0);

/**
 * جلب فيديوهات الصفحة الرئيسية من لوحة التحكم:
 * - وثائق منشورة ومفعّلة → تُعرض مرتبة حسب `order`.
 * - وثائق منشورة وكلها غير مفعّلة → مصفوفة فارغة لإخفاء القسم عن قصد.
 * - لا وثائق بعد في اللوحة أو فشل الشبكة → المربعات الثلاثة الافتراضية.
 */
export async function getVideos(options: ReadClientOptions = {}): Promise<HomeVideo[]> {
  if (isSanityConfigured) {
    try {
      const docs = await getReadClient(options).fetch<RawVideoDoc[]>(VIDEOS_QUERY);
      if (Array.isArray(docs)) {
        const live = docs
          .filter((d) => d && d._id)
          .map(coerceVideo)
          .filter((v): v is HomeVideo => v !== null)
          .filter((v) => v.active)
          .sort(byOrder);
        if (live.length) return live;
        if (docs.length) return [];
      }
    } catch (err) {
      console.error('Sanity videos fetch failed — falling back to local:', err);
    }
  }
  return DEFAULT_VIDEOS.filter((v) => v.active).sort(byOrder);
}
