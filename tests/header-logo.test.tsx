/**
 * شعار الشريط العلوي — الصورة تأتي من لوحة التحكم:
 *   identity.logo      → الخلفية الفاتحة (شريط صفحتي القائمة/الباقات، وبعد التمرير)
 *   identity.logoDark  → الخلفية الداكنة (أعلى الصفحة الرئيسية قبل التمرير، والتذييل)
 * يتحقق الملف من طبقة البيانات (getSite + logoForTone) ومن الصورة التي يُصدرها
 * مكوّن الشعار فعلاً في HTML — أي أن تعديل الحقل في اللوحة يغيّر صورة الشريط.
 */
import { beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import Logo from '../components/Logo';
import { SiteProvider } from '../components/SiteContext';
import { DEFAULT_SITE, getSite, logoForTone, type SiteData } from '../lib/site-data';
import { setSanityDoc } from './helpers';

const CDN = 'https://cdn.sanity.io/images/zes52trp/production/';
const MAIN_LOGO = `${CDN}logo-480x480.png`;
const DARK_LOGO = `${CDN}logo-cream-480x480.png`;

const renderLogo = (site: SiteData, tone: 'forest' | 'cream') =>
  renderToStaticMarkup(
    <SiteProvider value={site}>
      <Logo tone={tone} />
    </SiteProvider>,
  );

const srcOf = (html: string) => /src="([^"]+)"/.exec(html)?.[1] ?? '';

beforeEach(() => setSanityDoc(null));

/** بدون وثيقة إعدادات يُطبع تحذير [site-settings] — نخفيه حتى لا يشوّش مخرجات الاختبار */
const quietly = async <T,>(run: () => Promise<T>) => {
  const warn = spyOn(console, 'warn').mockImplementation(() => {});
  try {
    return await run();
  } finally {
    warn.mockRestore();
  }
};

describe('صورة الشعار مأخوذة من حقول اللوحة', () => {
  it('الخلفية الفاتحة: تُعرض الصورة المرفوعة في حقل «شعار الشريط (خلفية فاتحة)»', async () => {
    setSanityDoc({ logo: MAIN_LOGO });

    const site = await getSite();

    expect(site.logo).toBe(MAIN_LOGO);
    expect(srcOf(renderLogo(site, 'forest'))).toBe(MAIN_LOGO);
  });

  it('الخلفية الداكنة: شعار الخلفية الداكنة عند رفعه، مع بقاء الأساسي للخلفية الفاتحة', async () => {
    setSanityDoc({ logo: MAIN_LOGO, logoDark: DARK_LOGO });

    const site = await getSite();

    expect(site.logo).toBe(MAIN_LOGO);
    expect(site.logoDark).toBe(DARK_LOGO);
    expect(srcOf(renderLogo(site, 'cream'))).toBe(DARK_LOGO);
    expect(srcOf(renderLogo(site, 'forest'))).toBe(MAIN_LOGO);
  });

  it('بلا شعار للخلفية الداكنة: يُستخدم الشعار الأساسي في كل المواضع', async () => {
    setSanityDoc({ logo: MAIN_LOGO });

    const site = await getSite();

    expect(srcOf(renderLogo(site, 'cream'))).toBe(MAIN_LOGO);
    expect(srcOf(renderLogo(site, 'forest'))).toBe(MAIN_LOGO);
  });

  it('حقل فارغ أو مسافات فقط: يرجع للشعار الأساسي (ولا يكسر صورة الشريط)', async () => {
    setSanityDoc({ logo: MAIN_LOGO, logoDark: '   ' });

    const site = await getSite();

    expect(site.logoDark).toBe('');
    expect(logoForTone(site, 'cream')).toBe(MAIN_LOGO);
  });

  it('بلا أي شعار في اللوحة: يبقى شعار الموقع الافتراضي public/logo.png', async () => {
    const site = await quietly(() => getSite());

    expect(site.logo).toBe(DEFAULT_SITE.logo);
    expect(srcOf(renderLogo(site, 'cream'))).toBe('/logo.png');
    expect(srcOf(renderLogo(site, 'forest'))).toBe('/logo.png');
  });

  it('نص alt يحمل اسم الموقع المضبوط في اللوحة', async () => {
    setSanityDoc({ nameAr: 'فيتبايت — فرع بحري' });

    const site = await getSite();

    expect(renderLogo(site, 'forest')).toContain('alt="شعار فيتبايت — فرع بحري"');
  });
});
