'use client';

import { useEffect, useState, type FormEvent } from 'react';
import {
  buildConsultationMessage,
  CONSULTATION_GOALS,
  getSavedConsultations,
  goalLabel,
  submitConsultation,
  validateConsultation,
  type ConsultationGoalId,
  type ConsultationInput,
  type SavedConsultation,
} from '@/lib/consultations';
import {
  IconCheck,
  IconClipboard,
  IconClock,
  IconConsultation,
  IconFlame,
  IconShield,
  IconWhatsApp,
} from './Icons';
import Reveal from './Reveal';
import { useSite, useWhatsapp } from './SiteContext';

const inputCls =
  'w-full rounded-xl border border-sand bg-cream px-4 py-3 text-sm font-bold text-ink placeholder:text-muted/65 outline-none transition focus:border-leaf focus:bg-card focus:ring-2 focus:ring-leaf/25';

const EMPTY_FORM: ConsultationInput = {
  name: '',
  phone: '',
  goal: 'cutting',
  age: '',
  weight: '',
  height: '',
  message: '',
};

const HIGHLIGHTS = [
  {
    Icon: IconFlame,
    title: 'تحديد السعرات والهدف',
    desc: 'نساعدك على معرفة احتياجك اليومي سواء كان هدفك التنشيف، الضخامة، أو المحافظة.',
  },
  {
    Icon: IconClipboard,
    title: 'ترشيح الوجبات والباقات',
    desc: 'نرشّح لك الأطباق أو الباقة الشهرية الأنسب لجدول يومك وميزانيتك.',
  },
  {
    Icon: IconShield,
    title: 'مراعاة الحساسيات والأنظمة الخاصة',
    desc: 'أخبرنا بأي حساسية غذائية أو تفضيل خاص ليأخذه مطبخنا في الحسبان.',
  },
];

export default function ConsultationsForm() {
  const site = useSite();
  const wa = useWhatsapp();

  const [form, setForm] = useState<ConsultationInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sentResult, setSentResult] = useState<{
    refNo: string;
    whatsappUrl: string;
    syncedToSanity: boolean;
  } | null>(null);
  const [history, setHistory] = useState<SavedConsultation[]>([]);

  useEffect(() => {
    setHistory(getSavedConsultations());
  }, []);

  const update = (patch: Partial<ConsultationInput>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;

    const validationErrors = validateConsultation(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSending(true);
    try {
      const res = await submitConsultation(form, site);
      setSentResult({
        refNo: res.entry.refNo,
        whatsappUrl: res.whatsappUrl,
        syncedToSanity: res.syncedToSanity,
      });
      setHistory(getSavedConsultations());
      setForm(EMPTY_FORM);
      setErrors({});
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.25fr_0.85fr]">
      {/* نموذج كتابة الاستشارة */}
      <Reveal>
        <div className="rounded-3xl border border-sand bg-card p-6 shadow-soft sm:p-8">
          {sentResult ? (
            <div className="py-6 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-leaf/15 text-leaf">
                <IconCheck className="h-8 w-8" />
              </span>
              <h3 className="mt-5 text-2xl font-black text-forest">
                تم تجهيز وإرسال استشارتك بنجاح!
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm font-bold leading-7 text-muted">
                رقم الاستشارة المرجعي:{' '}
                <b className="font-black text-forest" dir="ltr">
                  {sentResult.refNo}
                </b>
                . فُتحت محادثة واتساب مباشرة مع إدارة {site.nameAr} لإتمام الإرسال.
              </p>
              {sentResult.syncedToSanity && (
                <p className="mx-auto mt-2 inline-flex items-center gap-1.5 rounded-full bg-leaf/10 px-3.5 py-1 text-xs font-black text-forest">
                  <IconCheck className="h-3.5 w-3.5 text-leaf" />
                  تم حفظ نسخة في لوحة تحكم الموقع أيضاً
                </p>
              )}

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={sentResult.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-wa px-7 py-3.5 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:brightness-110"
                >
                  <IconWhatsApp className="h-5 w-5" />
                  إعادة فتح الاستشارة في واتساب
                </a>
                <button
                  type="button"
                  onClick={() => setSentResult(null)}
                  className="rounded-full border border-sand bg-cream px-6 py-3.5 text-sm font-black text-forest transition hover:border-leaf hover:bg-card"
                >
                  كتابة استشارة جديدة
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="flex items-center gap-3 border-b border-sand pb-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-forest text-cream">
                  <IconConsultation className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-forest">اكتب استشارتك</h3>
                  <p className="text-xs font-bold text-muted">
                    املأ بياناتك واكتب استشارتك لتصل مباشرة إلى صاحب موقع {site.nameAr}
                  </p>
                </div>
              </div>

              {/* الاسم ورقم الهاتف */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="consult-name" className="mb-1.5 block text-xs font-black text-forest">
                    الاسم الكامل <span className="text-orange">*</span>
                  </label>
                  <input
                    id="consult-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => update({ name: e.target.value })}
                    placeholder="مثال: أحمد محمد"
                    maxLength={60}
                    className={inputCls}
                  />
                  {errors.name && (
                    <p role="alert" className="mt-1 text-xs font-extrabold text-red-700">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="consult-phone" className="mb-1.5 block text-xs font-black text-forest">
                    رقم الهاتف / الواتساب <span className="text-orange">*</span>
                  </label>
                  <input
                    id="consult-phone"
                    type="tel"
                    dir="ltr"
                    value={form.phone}
                    onChange={(e) => update({ phone: e.target.value })}
                    placeholder="0912345678"
                    maxLength={20}
                    className={`${inputCls} text-right`}
                  />
                  {errors.phone && (
                    <p role="alert" className="mt-1 text-xs font-extrabold text-red-700">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* موضوع الاستشارة */}
              <div>
                <span className="mb-2 block text-xs font-black text-forest">
                  موضوع الاستشارة / هدفك الصحي
                </span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {CONSULTATION_GOALS.map((g) => {
                    const active = form.goal === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => update({ goal: g.id as ConsultationGoalId })}
                        className={`rounded-xl border px-3 py-2.5 text-xs font-extrabold transition ${
                          active
                            ? 'border-forest bg-forest text-cream shadow-sm'
                            : 'border-sand bg-cream text-ink/80 hover:border-leaf'
                        }`}
                      >
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* بيانات بدنية اختيارية */}
              <div>
                <span className="mb-2 block text-xs font-black text-forest">
                  بيانات إضافية مساعدة{' '}
                  <span className="font-bold text-muted">(اختياري)</span>
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.age ?? ''}
                    onChange={(e) => update({ age: e.target.value })}
                    placeholder="العمر"
                    maxLength={4}
                    aria-label="العمر"
                    className={inputCls}
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.weight ?? ''}
                    onChange={(e) => update({ weight: e.target.value })}
                    placeholder="الوزن (كغ)"
                    maxLength={6}
                    aria-label="الوزن بالكيلوغرام"
                    className={inputCls}
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.height ?? ''}
                    onChange={(e) => update({ height: e.target.value })}
                    placeholder="الطول (سم)"
                    maxLength={6}
                    aria-label="الطول بالسنتيمتر"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* نص الاستشارة */}
              <div>
                <label htmlFor="consult-message" className="mb-1.5 block text-xs font-black text-forest">
                  نص الاستشارة بالتفصيل <span className="text-orange">*</span>
                </label>
                <textarea
                  id="consult-message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => update({ message: e.target.value })}
                  maxLength={1000}
                  placeholder="اكتب هنا سؤالك أو هدفك، طبيعة نشاطك اليومي، أو أي تفاصيل تود استشارة صاحب المطعم فيها…"
                  className={`${inputCls} resize-none leading-7`}
                />
                {errors.message && (
                  <p role="alert" className="mt-1 text-xs font-extrabold text-red-700">
                    {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={sending}
                className="flex w-full items-center justify-center gap-2.5 rounded-full bg-copper px-8 py-4 text-base font-black text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-copper-dark disabled:opacity-60"
              >
                <IconWhatsApp className="h-5 w-5" />
                {sending ? 'جارٍ إرسال الاستشارة…' : 'إرسال الاستشارة لصاحب الموقع'}
              </button>
            </form>
          )}
        </div>
      </Reveal>

      {/* العمود الجانبي: مميزات الاستشارة + سجل الاستشارات المحفوظة */}
      <div className="space-y-5">
        <Reveal delay={0.08}>
          <div className="rounded-3xl border border-sand bg-forest p-6 text-cream shadow-soft">
            <b className="block text-lg font-black">بماذا تفيدك الاستشارة؟</b>
            <p className="mt-1.5 text-xs font-bold leading-6 text-cream/75">
              فريق {site.nameAr} يراجع استشارتك ويرشدك للنظام الغذائي والوجبات الأنسب لك.
            </p>
            <div className="mt-5 space-y-4">
              {HIGHLIGHTS.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cream/10 text-orange-soft">
                    <item.Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <b className="block text-sm font-black text-cream">{item.title}</b>
                    <p className="mt-0.5 text-xs font-bold leading-6 text-cream/70">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="rounded-3xl border border-sand bg-card/80 p-6">
            <b className="block text-sm font-black text-forest">استشاراتك السابقة من هذا الجهاز</b>
            {history.length === 0 ? (
              <p className="mt-2 text-xs font-bold leading-6 text-muted">
                لم ترسل أي استشارة بعد. عند إرسال استشارتك ستُحفظ نسخة هنا لسهولة الرجوع إليها في أي وقت.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {history.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-sand bg-cream/70 p-4"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] font-black text-copper-dark">
                      <span className="inline-flex items-center gap-1">
                        <IconClock className="h-3.5 w-3.5" />
                        {goalLabel(item.goal)}
                      </span>
                      <span dir="ltr">{item.refNo}</span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs font-bold leading-6 text-ink/80">
                      {item.message}
                    </p>
                    <a
                      href={wa(buildConsultationMessage(item, item.refNo, site))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-black text-wa hover:underline"
                    >
                      <IconWhatsApp className="h-3.5 w-3.5" />
                      إعادة إرسال عبر واتساب
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
