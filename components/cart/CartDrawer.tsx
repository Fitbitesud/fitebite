'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSite } from '../SiteContext';
import { fmt, price } from '@/lib/format';
import type { CustomerInfo } from '@/lib/types';
import {
  buildOrderMessage,
  computeTotals,
  makeOrderNo,
  openWhatsApp,
  whatsappLink,
} from '@/lib/whatsapp';
import { useCart } from './CartContext';
import {
  IconBank,
  IconCash,
  IconCheck,
  IconClose,
  IconMinus,
  IconPlus,
  IconTrash,
  IconWhatsApp,
} from '../Icons';

const inputCls =
  'w-full rounded-xl border border-sand bg-card px-4 py-3 text-sm font-bold text-ink placeholder:text-muted/60 transition focus:border-leaf focus:outline-none focus:ring-2 focus:ring-leaf/30';

const EMPTY_FORM: CustomerInfo = {
  name: '',
  phone: '',
  region: '',
  address: '',
  notes: '',
  payment: 'cod',
};

export default function CartDrawer() {
  const { lines, totals, isOpen, closeCart, inc, dec, remove, clear } = useCart();
  const [form, setForm] = useState<CustomerInfo>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'cart' | 'success'>('cart');
  const [lastLink, setLastLink] = useState('');
  const [orderNo, setOrderNo] = useState('');

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const set = (patch: Partial<CustomerInfo>) => setForm((f) => ({ ...f, ...patch }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = 'الرجاء كتابة الاسم الكامل';
    const digits = form.phone.replace(/[^\d+]/g, '');
    if (!/^(\+?249|0)?9\d{8}$/.test(digits)) e.phone = 'رقم جوال سوداني غير صحيح — مثال: 0912345678';
    if (!form.region) e.region = 'اختر منطقة التوصيل';
    if (form.address.trim().length < 6) e.address = 'اكتب عنواناً واضحاً (رقم المنزل/أقرب معلم)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (lines.length === 0) return;
    if (!validate()) return;
    const no = makeOrderNo();
    const msg = buildOrderMessage({ lines, customer: form, orderNo: no, totals });
    const link = whatsappLink(msg);
    setLastLink(link);
    setOrderNo(no);
    openWhatsApp(msg);
    setStep('success');
    clear();
  };

  const site = useSite();
  const remainingForFree = site.freeDeliveryAbove - totals.subtotal;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[70] bg-ink/45 backdrop-blur-sm"
          />
          <motion.aside
            key="panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 left-0 z-[80] flex w-full max-w-md flex-col bg-cream shadow-2xl"
            role="dialog"
            aria-label="سلة الطلبات"
          >
            {/* الرأس */}
            <div className="flex items-center justify-between border-b border-sand bg-card/70 px-5 py-4">
              <h3 className="flex items-center gap-2 text-lg font-black text-forest">
                {step === 'cart' ? 'سلة الطلبات' : 'تم إرسال الطلب'}
                {step === 'cart' && totals.count > 0 && (
                  <span className="rounded-full bg-forest px-2.5 py-0.5 text-xs font-black text-cream">
                    {totals.count}
                  </span>
                )}
              </h3>
              <button
                onClick={closeCart}
                aria-label="إغلاق السلة"
                className="grid h-10 w-10 place-items-center rounded-full border border-sand bg-card text-forest transition hover:bg-forest hover:text-cream"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>

            {step === 'success' ? (
              /* ── نجاح الإرسال ── */
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                  className="grid h-24 w-24 place-items-center rounded-full bg-leaf text-white shadow-lift"
                >
                  <IconCheck className="h-12 w-12" strokeWidth={2.5} />
                </motion.span>
                <h4 className="text-2xl font-black text-forest">جهّزنا رسالتك!</h4>
                <p className="text-sm leading-7 text-muted">
                  فتحنا واتساب برسالة تحتوي تفاصيل طلبك كاملة. رقم طلبك:
                  <b className="mx-1 rounded-lg bg-forest/10 px-2 py-0.5 font-black text-forest" dir="ltr">
                    {orderNo}
                  </b>
                  — إذا لم يُفتح واتساب تلقائياً اضغط الزر أدناه.
                </p>
                <a
                  href={lastLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full bg-wa px-7 py-3.5 text-sm font-black text-white transition hover:brightness-110"
                >
                  <IconWhatsApp className="h-5 w-5" />
                  إعادة فتح واتساب
                </a>
                <button
                  onClick={() => {
                    setStep('cart');
                    setForm(EMPTY_FORM);
                    closeCart();
                  }}
                  className="text-sm font-extrabold text-forest underline decoration-leaf decoration-2 underline-offset-4"
                >
                  متابعة التسوق
                </button>
              </div>
            ) : lines.length === 0 ? (
              /* ── السلة فارغة ── */
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-sand/50 text-muted">
                  <IconTrash className="h-9 w-9" />
                </span>
                <p className="text-base font-black text-forest">سلتك فارغة حالياً</p>
                <p className="text-sm leading-7 text-muted">
                  أضف وجباتك المفضلة من القائمة وستظهر هنا جاهزة للإرسال عبر واتساب.
                </p>
                <Link
                  href="/menu"
                  onClick={closeCart}
                  className="mt-2 rounded-full bg-forest px-7 py-3 text-sm font-black text-cream transition hover:bg-leaf"
                >
                  تصفح القائمة
                </Link>
              </div>
            ) : (
              /* ── محتوى السلة ── */
              <>
                <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                  <AnimatePresence initial={false}>
                    {lines.map((l) => (
                      <motion.div
                        key={l.item._id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        className="flex gap-3 rounded-2xl border border-sand bg-card p-3"
                      >
                        <img
                          src={l.item.image}
                          alt={l.item.name}
                          className="h-16 w-16 shrink-0 rounded-xl object-cover"
                        />
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <b className="text-sm font-black leading-5 text-forest">
                              {l.item.name}
                            </b>
                            <button
                              onClick={() => remove(l.item._id)}
                              aria-label={`حذف ${l.item.name}`}
                              className="text-copper transition hover:scale-110"
                            >
                              <IconTrash className="h-4 w-4" />
                            </button>
                          </div>
                          <span className="mt-0.5 text-xs font-bold text-muted">
                            {price(l.item.price, site.currency)} للوحدة
                          </span>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-2 rounded-full border border-sand bg-cream px-1.5 py-1">
                              <button
                                onClick={() => inc(l.item._id)}
                                aria-label="زيادة"
                                className="grid h-6 w-6 place-items-center rounded-full bg-forest text-cream transition hover:bg-leaf"
                              >
                                <IconPlus className="h-3.5 w-3.5" strokeWidth={2.6} />
                              </button>
                              <span className="w-5 text-center text-sm font-black text-forest">
                                {l.qty}
                              </span>
                              <button
                                onClick={() => dec(l.item._id)}
                                aria-label="إنقاص"
                                className="grid h-6 w-6 place-items-center rounded-full bg-sand text-forest transition hover:bg-copper hover:text-white"
                              >
                                <IconMinus className="h-3.5 w-3.5" strokeWidth={2.6} />
                              </button>
                            </div>
                            <b className="text-sm font-black text-forest">
                              {price(l.item.price * l.qty, site.currency)}
                            </b>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* الملخص */}
                  <div className="space-y-2.5 rounded-2xl border border-sand bg-card p-4 text-sm font-bold">
                    <div className="flex justify-between text-muted">
                      <span>المجموع الفرعي</span>
                      <span className="text-ink">{price(totals.subtotal, site.currency)}</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>التوصيل داخل {site.city}</span>
                      {totals.delivery === 0 ? (
                        <span className="font-black text-leaf">مجاني ✅</span>
                      ) : (
                        <span className="text-ink">{price(totals.delivery, site.currency)}</span>
                      )}
                    </div>
                    {totals.delivery > 0 && remainingForFree > 0 && (
                      <div className="rounded-xl bg-leaf/10 p-3">
                        <p className="text-xs font-extrabold text-forest">
                          أضف بقيمة {price(remainingForFree, site.currency)} للحصول على توصيل مجاني 🛵
                        </p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand">
                          <div
                            className="h-full rounded-full bg-leaf transition-all duration-500"
                            style={{
                              width: `${Math.min(100, (totals.subtotal / site.freeDeliveryAbove) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-sand pt-2.5 text-base font-black text-forest">
                      <span>الإجمالي</span>
                      <span>{price(totals.total, site.currency)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-muted">
                      <span>🔥 إجمالي السعرات: {fmt(totals.kcal)} سعرة</span>
                      <span>💪 بروتين: {fmt(totals.protein)} غ</span>
                    </div>
                  </div>

                  {/* بيانات العميل */}
                  <div className="space-y-3 rounded-2xl border border-sand bg-card p-4">
                    <h4 className="text-sm font-black text-forest">بيانات التوصيل</h4>
                    <div>
                      <input
                        className={inputCls}
                        placeholder="الاسم الكامل *"
                        value={form.name}
                        onChange={(e) => set({ name: e.target.value })}
                      />
                      {errors.name && <p className="mt-1 text-xs font-bold text-copper-dark">{errors.name}</p>}
                    </div>
                    <div>
                      <input
                        className={`${inputCls} text-left`}
                        dir="ltr"
                        inputMode="tel"
                        placeholder="0912345678 *"
                        value={form.phone}
                        onChange={(e) => set({ phone: e.target.value })}
                      />
                      {errors.phone && <p className="mt-1 text-xs font-bold text-copper-dark">{errors.phone}</p>}
                    </div>
                    <div>
                      <select
                        className={`${inputCls} ${form.region ? '' : 'text-muted/60'}`}
                        value={form.region}
                        onChange={(e) => set({ region: e.target.value })}
                      >
                        <option value="">اختر منطقة التوصيل *</option>
                        {site.regions.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      {errors.region && <p className="mt-1 text-xs font-bold text-copper-dark">{errors.region}</p>}
                    </div>
                    <div>
                      <input
                        className={inputCls}
                        placeholder="العنوان: رقم المنزل / أقرب معلم *"
                        value={form.address}
                        onChange={(e) => set({ address: e.target.value })}
                      />
                      {errors.address && <p className="mt-1 text-xs font-bold text-copper-dark">{errors.address}</p>}
                    </div>
                    <textarea
                      className={`${inputCls} resize-none`}
                      rows={2}
                      placeholder="ملاحظات للطلب (اختياري): بدون بصل، توصيل الساعة 3…"
                      value={form.notes}
                      onChange={(e) => set({ notes: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          { id: 'cod', label: 'كاش عند الاستلام', Icon: IconCash },
                          { id: 'bank', label: 'تحويل بنكك', Icon: IconBank },
                        ] as const
                      ).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => set({ payment: p.id })}
                          className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-extrabold transition ${
                            form.payment === p.id
                              ? 'border-forest bg-forest/10 text-forest'
                              : 'border-sand bg-card text-muted hover:border-forest/40'
                          }`}
                          aria-pressed={form.payment === p.id}
                        >
                          <p.Icon className="h-4 w-4" />
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* التذييل */}
                <div className="border-t border-sand bg-card/70 px-5 py-4">
                  <button
                    onClick={submit}
                    className="flex w-full items-center justify-center gap-2.5 rounded-full bg-wa py-4 text-base font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:brightness-110"
                  >
                    <IconWhatsApp className="h-5 w-5" />
                    إتمام الطلب عبر واتساب — {price(totals.total, site.currency)}
                  </button>
                  <p className="mt-2.5 text-center text-[11px] font-bold text-muted">
                    سيُفتح واتساب برسالة جاهزة تحتوي كل تفاصيل طلبك لإرسالها للرقم المسجّل.
                  </p>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
