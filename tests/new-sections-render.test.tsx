import { describe, expect, it } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import ConsultationsForm from '../components/ConsultationsForm';
import FaqSection from '../components/FaqSection';
import GalleryView from '../components/GalleryView';
import Hero from '../components/Hero';
import { SiteProvider } from '../components/SiteContext';
import VideoShowcase from '../components/VideoShowcase';
import { DEFAULT_FAQS } from '../lib/faq';
import { DEFAULT_GALLERY } from '../lib/gallery';
import { DEFAULT_SITE } from '../lib/site-data';
import { DEFAULT_VIDEOS } from '../lib/videos';

describe('المزايا الجديدة — رسم الواجهة', () => {
  it('النص الرئيسي في Hero يعرض الجملة المتحركة ومؤشرات التبديل بين الجمل', () => {
    const html = renderToStaticMarkup(
      <SiteProvider value={DEFAULT_SITE}>
        <Hero />
      </SiteProvider>,
    );
    expect(html).toContain('طعام صحي يُحسب');
    expect(html).toContain('بالغرام');
    expect(html).toContain('جمل العنوان المتحركة');
    expect(html).toContain('الجملة 1');
    expect(html).toContain('الجملة 2');
  });

  it('قسم الفيديوهات بعد الهبوط يعرض ثلاثة مربعات متتالية قابلة للإخفاء من الإعدادات', () => {
    const html = renderToStaticMarkup(
      <SiteProvider value={DEFAULT_SITE}>
        <VideoShowcase videos={DEFAULT_VIDEOS} />
      </SiteProvider>,
    );
    for (const v of DEFAULT_VIDEOS) {
      expect(html).toContain(v.title);
    }
    // العروض الافتراضية مفتوحة وتعمل دون انتظار الضغط على صورة الغلاف،
    // وتعرض الصورة كاملة بلا قص وبلا أي أدوات تحكم.
    expect(html).toContain(DEFAULT_VIDEOS[0].previewScenes?.[0]?.caption ?? '');
    expect(html).toContain('object-contain');
    expect(html).not.toContain('scale(1.1)');
    expect(html).not.toContain('bg-cream/25'); // شريط التقدم العلوي
    expect(html).not.toContain('إغلاق المشغل');
    expect(html).not.toContain('إغلاق الفيديو');
    expect(html).not.toContain('إيقاف مؤقت');
    expect(html).not.toContain('استئناف العرض');
    expect(html).not.toContain('تشغيل فيديو:');

    const disabledSite = {
      ...DEFAULT_SITE,
      home: { ...DEFAULT_SITE.home, videosEnabled: false },
    };
    const hiddenHtml = renderToStaticMarkup(
      <SiteProvider value={disabledSite}>
        <VideoShowcase videos={DEFAULT_VIDEOS} />
      </SiteProvider>,
    );
    expect(hiddenHtml).toBe('');
  });

  it('ملفات الفيديو والمقاطع المضمنة تُفتح تلقائياً بصوت مكتوم', () => {
    const html = renderToStaticMarkup(
      <SiteProvider value={DEFAULT_SITE}>
        <VideoShowcase
          videos={[
            {
              id: 'uploaded-video',
              title: 'ملف مرفوع',
              desc: '',
              videoFileUrl: '/videos/kitchen.mp4',
              poster: '/images/hero-bowl.jpg',
              active: true,
            },
            {
              id: 'youtube-video',
              title: 'مقطع يوتيوب',
              desc: '',
              videoUrl: 'https://youtu.be/abc123DEF_-',
              poster: '/images/hero-bowl.jpg',
              active: true,
            },
          ]}
        />
      </SiteProvider>,
    );

    expect(html).toContain('<video');
    expect(html).toMatch(/autoplay=""/i);
    expect(html).toContain('muted=""');
    expect(html).toMatch(/playsinline=""/i);
    expect(html).toMatch(/loop=""/i); // تكرار تلقائي
    expect(html).toContain('autoplay=1&amp;mute=1');
    expect(html).not.toContain('تشغيل فيديو:');

    // لا توجد أدوات تحكم: لا خاصية controls ولا شريط تقديم ولا تنزيل ولا أزرار إغلاق
    expect(html).not.toMatch(/<video[^>]*\scontrols(?=[\s\/>])/i);
    expect(html).toContain('nodownload');
    expect(html).toMatch(/disablepictureinpicture/i);
    expect(html).not.toContain('إغلاق الفيديو');
    expect(html).not.toContain('allowfullscreen');
    expect(html).not.toContain('picture-in-picture');

    // الفيديو يظهر كاملاً داخل المربع دون قصّ، والمقطع المضمّن بلا أدوات تحكم ويتكرر
    expect(html).toMatch(/<video[^>]*object-contain/i);
    expect(html).not.toMatch(/<video[^>]*object-cover/i);
    expect(html).toContain('controls=0');
    expect(html).toContain('loop=1');
    expect(html).toContain('playlist=abc123DEF_-');
    expect(html).toContain('pointer-events-none');
  });

  it('قسم الأسئلة الشائعة يعرض الأسئلة مطوية افتراضياً لتظهر الإجابة عند الضغط', () => {
    const html = renderToStaticMarkup(
      <SiteProvider value={DEFAULT_SITE}>
        <FaqSection faqs={DEFAULT_FAQS} />
      </SiteProvider>,
    );
    expect(html).toContain(DEFAULT_FAQS[0].question);
    expect(html).toContain('aria-expanded="false"');
    // الإجابات مطوية قبل الضغط على السؤال
    expect(html).not.toContain(DEFAULT_FAQS[0].answer);
  });

  it('صفحة معرض الأعمال تعرض التصنيفات وصور أعمال المطعم', () => {
    const html = renderToStaticMarkup(
      <SiteProvider value={DEFAULT_SITE}>
        <GalleryView items={DEFAULT_GALLERY} />
      </SiteProvider>,
    );
    expect(html).toContain('تصنيفات معرض الأعمال');
    expect(html).toContain(DEFAULT_GALLERY[0].title);
  });

  it('صفحة الاستشارات تعرض حقول كتابة الاستشارة وإرسالها لصاحب الموقع', () => {
    const html = renderToStaticMarkup(
      <SiteProvider value={DEFAULT_SITE}>
        <ConsultationsForm />
      </SiteProvider>,
    );
    expect(html).toContain('اكتب استشارتك');
    expect(html).toContain('نص الاستشارة بالتفصيل');
    expect(html).toContain('إرسال الاستشارة لصاحب الموقع');
  });
});
