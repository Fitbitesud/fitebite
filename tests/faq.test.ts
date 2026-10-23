import { beforeEach, describe, expect, it } from 'bun:test';
import { DEFAULT_FAQS, getFaqs } from '../lib/faq';
import { setSanityDoc, setSanityError } from './helpers';

beforeEach(() => setSanityDoc(null));

describe('FAQ section data', () => {
  it('provides non-empty default questions and answers with unique ids', async () => {
    expect(DEFAULT_FAQS.length).toBeGreaterThanOrEqual(5);
    const ids = new Set(DEFAULT_FAQS.map((f) => f.id));
    expect(ids.size).toBe(DEFAULT_FAQS.length);
    for (const item of DEFAULT_FAQS) {
      expect(item.question.trim().length).toBeGreaterThan(5);
      expect(item.answer.trim().length).toBeGreaterThan(10);
    }
    expect(await getFaqs()).toEqual(DEFAULT_FAQS);
  });

  it('uses Sanity FAQs sorted by order and drops blank or inactive entries', async () => {
    setSanityDoc([
      { _id: 'f2', question: 'السؤال الثاني؟', answer: 'الإجابة الثانية.', active: true, order: 2 },
      { _id: 'f1', question: 'السؤال الأول؟', answer: 'الإجابة الأولى.', active: true, order: 1 },
      { _id: 'f-inactive', question: 'مخفي؟', answer: 'نص', active: false, order: 0 },
      { _id: 'f-blank', question: '   ', answer: 'نص', active: true, order: 0 },
    ]);

    const faqs = await getFaqs();
    expect(faqs.map((f) => f.id)).toEqual(['f1', 'f2']);
  });

  it('returns empty array when all Sanity FAQs are disabled, and defaults on error', async () => {
    setSanityDoc([{ _id: 'f-off', question: 'سؤال', answer: 'جواب', active: false }]);
    expect(await getFaqs()).toEqual([]);

    setSanityError(new Error('offline'));
    expect(await getFaqs()).toEqual(DEFAULT_FAQS);
  });
});
