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
