import { beforeEach, describe, expect, it } from 'bun:test';
import {
  buildConsultationMessage,
  submitConsultation,
  validateConsultation,
} from '../lib/consultations';
import { DEFAULT_SITE } from '../lib/site-data';
import {
  enableSanityCommentWrites,
  getSanityCreatedComments,
  setSanityDoc,
} from './helpers';

beforeEach(() => setSanityDoc(null));

describe('consultations page logic (الاستشارات)', () => {
  it('validates required name, phone (including Arabic-Indic digits), and message', () => {
    const emptyErrs = validateConsultation({
      name: 'أح',
      phone: '123',
      goal: 'cutting',
      message: 'قصير',
    });
    expect(emptyErrs.name).toBeDefined();
    expect(emptyErrs.phone).toBeDefined();
    expect(emptyErrs.message).toBeDefined();

    const validArabicDigits = validateConsultation({
      name: 'أحمد عثمان',
      phone: '٠٩١٢٣٤٥٦٧٨',
      goal: 'bulking',
      message: 'أحتاج معرفة الباقة المناسبة لزيادة الوزن العضلي مع التمرين ٤ أيام.',
    });
    expect(validArabicDigits).toEqual({});
  });

  it('builds a clean WhatsApp message addressed to the site owner with optional metrics only when set', () => {
    const msg = buildConsultationMessage(
      {
        name: 'سارة علي',
        phone: '0912345678',
        goal: 'cutting',
        age: '27',
        weight: '74',
        message: 'أريد نظام تنشيف صحي بدون حرمان يناسب دوامي الصباحي.',
      },
      'FC-123456',
      DEFAULT_SITE,
    );

    expect(msg).toContain('استشارة جديدة من موقع فيتبايت');
    expect(msg).toContain('FC-123456');
    expect(msg).toContain('سارة علي');
    expect(msg).toContain('0912345678');
    expect(msg).toContain('تنشيف وخسارة وزن');
    expect(msg).toContain('العمر: 27');
    expect(msg).toContain('الوزن: 74 كغ');
    expect(msg).not.toContain('الطول:');
    expect(msg).toContain('أريد نظام تنشيف صحي بدون حرمان يناسب دوامي الصباحي.');
  });

  it('submits consultation to WhatsApp link and creates a Sanity draft when write token is enabled', async () => {
    enableSanityCommentWrites();
    const res = await submitConsultation(
      {
        name: 'خالد حسن',
        phone: '0116642510',
        goal: 'packages',
        message: 'ما أفضل باقة شهرية لشخص يتمرن مساءً ويرغب في وجبتين يومياً؟',
      },
      { ...DEFAULT_SITE, whatsapp: '249999888777' },
      { openWindow: false },
    );

    expect(res.syncedToSanity).toBe(true);
    expect(res.whatsappUrl).toStartWith('https://wa.me/249999888777?text=');
    const created = getSanityCreatedComments() as Array<Record<string, unknown>>;
    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({
      _type: 'consultation',
      name: 'خالد حسن',
      phone: '0116642510',
      status: 'new',
    });
  });
});
