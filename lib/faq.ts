import { getReadClient, isSanityConfigured, type ReadClientOptions } from './sanity/client';
import { FAQS_QUERY } from './sanity/queries';

/**
 * الأسئلة الشائعة — تُعرض أسفل الصفحة الرئيسية في قائمة تفاعلية (Accordion)
 * وتُدار أيضاً من لوحة تحكم Sanity (`faqItem`).
 */
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  active: boolean;
  order?: number;
}

export const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 'faq-macros',
    question: 'كيف تحسبون السعرات الحرارية والماكروز في كل وجبة؟',
    answer:
      'نزن كل مكوّن من مكونات الوجبة بالغرام (البروتين الصافي، مصادر الكاربوهيدرات، والدهون الصحية) ونحسب القيم الغذائية بدقة قبل التقديم، لتجد السعرات والبروتين والكارب والدهون معلنة بوضوح تحت كل طبق.',
    active: true,
    order: 1,
  },
  {
    id: 'faq-cooking',
    question: 'هل تُستخدم أي زيوت مهدرجة أو قلي تقليدي في التحضير؟',
    answer:
      'إطلاقاً. جميع وجبات {name} تُحضَّر بدون زيوت ضارة، ونعتمد على الشواء، الطهي بالبخار، والقلي الهوائي للحفاظ على القيمة الغذائية الكاملة والطعم الشهي.',
    active: true,
    order: 2,
  },
  {
    id: 'faq-order-how',
    question: 'كيف أطلب وجبة أو أشترك في باقة شهرية؟',
    answer:
      'اختر أصنافك من القائمة وأضفها إلى السلة ثم اضغط «إتمام الطلب عبر واتساب» لتصلنا رسالة مفصّلة بطلبك فوراً. وللباقات الشهرية يمكنك تصفح صفحة «الباقات» واختيار الباقة المناسبة لهدفك (ضخامة، تنشيف، أو محافظة).',
    active: true,
    order: 3,
  },
  {
    id: 'faq-delivery',
    question: 'ما خيارات التوصيل والاستلام المتاحة؟',
    answer:
      'يمكنك اختيار «توصيل» ليصلك الطلب عبر مندوب التوصيل داخل {city}، أو اختيار «استلام في المحل» من فرعنا مباشرة بدون أي رسوم إضافية على الموقع.',
    active: true,
    order: 4,
  },
  {
    id: 'faq-payment',
    question: 'ما طرق الدفع المتوفرة لديكم؟',
    answer:
      'نوفر الدفع نقداً عند الاستلام (كاش) أو عبر التحويل البنكي (تطبيق بنكك)، ويمكنك تحديد طريقة الدفع المفضلة لديك مباشرة أثناء إتمام الطلب في السلة.',
    active: true,
    order: 5,
  },
  {
    id: 'faq-consultation',
    question: 'لست متأكداً من الوجبات أو السعرات المناسبة لهدفي، هل يمكنني طلب استشارة؟',
    answer:
      'بالتأكيد! خصصنا صفحة «الاستشارات» في أقسام الموقع لتكتب فيها هدفك واستفسارك الصحي، وتصل رسالتك مباشرة لإدارة {name} لمساعدتك في اختيار النظام والوجبات الأنسب لك.',
    active: true,
    order: 6,
  },
];

type RawFaqDoc = {
  _id: string;
  question?: string | null;
  answer?: string | null;
  active?: boolean | null;
  order?: number | null;
};

function coerceFaq(d: RawFaqDoc): FaqItem | null {
  const question = typeof d.question === 'string' ? d.question.trim() : '';
  const answer = typeof d.answer === 'string' ? d.answer.trim() : '';
  if (!question || !answer) return null;
  return {
    id: d._id,
    question,
    answer,
    active: d.active !== false,
    order: typeof d.order === 'number' && Number.isFinite(d.order) ? d.order : undefined,
  };
}

const byOrder = (a: FaqItem, b: FaqItem): number => (a.order ?? 0) - (b.order ?? 0);

/** جلب الأسئلة الشائعة من لوحة التحكم مع رجوع تلقائي للأسئلة المحلية */
export async function getFaqs(options: ReadClientOptions = {}): Promise<FaqItem[]> {
  if (isSanityConfigured) {
    try {
      const docs = await getReadClient(options).fetch<RawFaqDoc[]>(FAQS_QUERY);
      if (Array.isArray(docs)) {
        const live = docs
          .filter((d) => d && d._id)
          .map(coerceFaq)
          .filter((f): f is FaqItem => f !== null)
          .filter((f) => f.active)
          .sort(byOrder);
        if (live.length) return live;
        if (docs.length) return [];
      }
    } catch (err) {
      console.error('Sanity FAQs fetch failed — falling back to local:', err);
    }
  }
  return DEFAULT_FAQS.filter((f) => f.active).sort(byOrder);
}
