'use client';

import { useState, type FormEvent } from 'react';
import {
  APPROVED_COMMENTS,
  commentAdminMessage,
  getPendingComments,
  savePendingComment,
  type PendingComment,
} from '@/lib/comments';
import { whatsappLink } from '@/lib/whatsapp';
import { IconCheck, IconClock, IconStar, IconWhatsApp } from './Icons';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

/** خانة تعليقات الزوار أسفل الصفحة: المعتمدة منشورة، والجديد ينتظر موافقة الإدارة */
export default function Comments() {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [pending, setPending] = useState<PendingComment[]>(() => getPendingComments());
  const [lastSent, setLastSent] = useState<PendingComment | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    const t = text.trim();
    if (!n || !t) return;
    const entry = savePendingComment(n, t);
    setPending((p) => [...p, entry]);
    setLastSent(entry);
    setName('');
    setText('');
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
          {APPROVED_COMMENTS.map((c, i) => (
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
                className="rounded-full bg-forest px-7 py-3.5 text-sm font-black text-cream shadow-soft transition hover:-translate-y-0.5 hover:bg-leaf"
              >
                أرسل التعليق
              </button>
              <p className="text-[11px] font-bold leading-6 text-muted">
                بعد الإرسال يصل تعليقك للإدارة عبر واتساب للمراجعة، ويُنشر هنا بعد الموافقة.
              </p>
            </form>
          </Reveal>

          {/* حالة التعليقات المرسلة من هذا الجهاز */}
          <Reveal delay={0.1}>
            <div className="flex h-full flex-col gap-3 rounded-3xl border border-sand bg-cream/60 p-6">
              <b className="text-sm font-black text-forest">تعليقاتك المرسلة</b>
              {pending.length === 0 ? (
                <p className="text-xs font-bold leading-7 text-muted">
                  لا توجد تعليقات مرسلة من هذا الجهاز بعد — أول تعليق لك يظهر هنا بحالته حتى
                  الموافقة عليه ونشره.
                </p>
              ) : (
                pending.map((p) => (
                  <div key={p._id} className="rounded-2xl border border-sand bg-card p-4">
                    <div className="flex items-center gap-2 text-[11px] font-black text-copper-dark">
                      <IconClock className="h-3.5 w-3.5" />
                      بانتظار موافقة الإدارة
                    </div>
                    <p className="mt-2 text-xs font-bold leading-6 text-ink/80">«{p.text}»</p>
                  </div>
                ))
              )}
              {lastSent && (
                <a
                  href={whatsappLink(commentAdminMessage(lastSent.name, lastSent.text))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto flex items-center justify-center gap-2 rounded-full bg-wa px-6 py-3 text-sm font-black text-white transition hover:brightness-110"
                >
                  <IconWhatsApp className="h-4 w-4" />
                  إرسال التعليق للإدارة عبر واتساب
                </a>
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
