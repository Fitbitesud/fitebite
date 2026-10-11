'use client';

import { useState, type FormEvent } from 'react';
import {
  commentAdminMessage,
  getPendingComments,
  submitComment,
  type PendingComment,
  type SiteComment,
  type SubmitMode,
} from '@/lib/comments';
import { IconCheck, IconClock, IconStar, IconWhatsApp } from './Icons';
import { useWhatsapp } from './SiteContext';
import { useLiveComments } from './useLiveData';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

/** خانة تعليقات الزوار أسفل الصفحة: المعتمدة منشورة، والجديد ينتظر موافقة الإدارة */
export default function Comments({ approved }: { approved: SiteComment[] }) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const wa = useWhatsapp();
  const liveApproved = useLiveComments(approved);
  const [sending, setSending] = useState(false);
  const [pending, setPending] = useState<PendingComment[]>(() => getPendingComments());
  const [submissionMode, setSubmissionMode] = useState<SubmitMode | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    const t = text.trim();
    if (!n || !t || sending) return;
    setSending(true);
    setSubmissionMode(null);
    setSubmitError(null);
    try {
      const result = await submitComment(n, t);
      setSubmissionMode(result.mode);
      if (result.mode === 'local') setPending((p) => [...p, result.pending]);
      setName('');
      setText('');
    } catch {
      setSubmitError('تعذّر حفظ التعليق. حاول مرة أخرى.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="comments" className="scroll-mt-20 border-t border-sand bg-card/50 py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="آراء الزوار"
          title="كلمتك تُنشر بعد موافقتنا"
          sub="كل تعليق يمرّ على الإدارة أولاً للتأكد من جديته، ثم يُنشر هنا في الصفحة ليقرأه الجميع."
        />

        {/* التعليقات المعتمدة المنشورة */}
        <div className="grid gap-5 md:grid-cols-3">
          {liveApproved.map((c, i) => (
            <Reveal key={c._id} delay={i * 0.08} className="h-full">
              <figure className="flex h-full flex-col gap-3 rounded-3xl border border-sand bg-card p-6 shadow-soft">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <IconStar key={s} className="h-4 w-4 text-copper" />
                  ))}
                </div>
                <blockquote className="text-sm leading-8 text-ink/80">«{c.text}»</blockquote>
                <figcaption className="mt-auto pt-2">
                  <b className="block text-sm font-black text-forest">{c.name}</b>
                  {c.role && <span className="text-[11px] font-bold text-muted">{c.role}</span>}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* نموذج التعليق */}
          <Reveal>
            <form
              onSubmit={submit}
              className="flex h-full flex-col gap-4 rounded-3xl border border-sand bg-card p-6 shadow-soft"
            >
              <b className="text-lg font-black text-forest">أضف تعليقك</b>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={40}
                placeholder="اسمك"
                className="rounded-xl border border-sand bg-cream px-4 py-3 text-sm font-bold text-ink outline-none transition focus:border-leaf"
              />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                maxLength={400}
                rows={4}
                placeholder="اكتب رأيك في الوجبات أو الخدمة…"
                className="resize-none rounded-xl border border-sand bg-cream px-4 py-3 text-sm font-bold leading-7 text-ink outline-none transition focus:border-leaf"
              />
              <button
                type="submit"
                disabled={sending}
                className="rounded-full bg-forest px-7 py-3.5 text-sm font-black text-cream shadow-soft transition hover:-translate-y-0.5 hover:bg-leaf disabled:opacity-60"
              >
                {sending ? 'جارٍ الإرسال…' : 'أرسل التعليق'}
              </button>
              {submissionMode === 'sanity' && (
                <p className="flex items-center gap-2 rounded-xl border border-leaf/30 bg-leaf/10 px-4 py-3 text-[11px] font-black text-forest">
                  <IconCheck className="h-4 w-4 text-leaf" />
                  وصل تعليقك إلى لوحة التحكم، وسيظهر هنا بعد موافقة الإدارة.
                </p>
              )}
              {submissionMode === 'local' && (
                <p className="flex items-center gap-2 rounded-xl border border-copper/30 bg-copper/10 px-4 py-3 text-[11px] font-black text-copper-dark">
                  <IconCheck className="h-4 w-4" />
                  تعذّر إرساله إلى لوحة التحكم. أرسله للإدارة عبر رابط واتساب أدناه للمراجعة.
                </p>
              )}
              {submitError && (
                <p role="alert" className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-[11px] font-black text-red-800">
                  {submitError}
                </p>
              )}
              <p className="text-[11px] font-bold leading-6 text-muted">
                لا يظهر أي تعليق للزوار إلا بعد موافقة الإدارة عليه.
              </p>
            </form>
          </Reveal>

          {/* التعليقات المحفوظة محلياً عند تعذّر الإرسال المباشر */}
          <Reveal delay={0.1}>
            <div className="flex h-full flex-col gap-3 rounded-3xl border border-sand bg-cream/60 p-6">
              <b className="text-sm font-black text-forest">تعليقاتك المحفوظة على هذا الجهاز</b>
              {pending.length === 0 ? (
                <p className="text-xs font-bold leading-7 text-muted">
                  لا توجد تعليقات محفوظة محلياً من هذا الجهاز. إذا تعذّر الإرسال المباشر، سيظهر
                  تعليقك هنا مع رابط لإرساله للإدارة عبر واتساب.
                </p>
              ) : (
                pending.map((p) => (
                  <div key={p._id} className="rounded-2xl border border-sand bg-card p-4">
                    <div className="flex items-center gap-2 text-[11px] font-black text-copper-dark">
                      <IconClock className="h-3.5 w-3.5" />
                      محفوظ على هذا الجهاز
                    </div>
                    <p className="mt-2 text-xs font-bold leading-6 text-ink/80">«{p.text}»</p>
                    <a
                      href={wa(commentAdminMessage(p.name, p.text))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-black text-wa hover:underline"
                    >
                      <IconWhatsApp className="h-3.5 w-3.5" />
                      إرسال هذا التعليق للإدارة عبر واتساب
                    </a>
                  </div>
                ))
              )}
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted">
                <IconCheck className="h-3.5 w-3.5 text-leaf" />
                لا يُنشر أي تعليق قبل موافقة الإدارة عليه.
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
