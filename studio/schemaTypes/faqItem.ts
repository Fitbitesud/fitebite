import {defineField, defineType} from 'sanity'

/** الأسئلة الشائعة — تظهر أسفل الصفحة الرئيسية وتُفتح الإجابة عند الضغط على السؤال */
export const faqItem = defineType({
  name: 'faqItem',
  title: 'الأسئلة الشائعة',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'السؤال',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'answer',
      title: 'الإجابة',
      type: 'text',
      rows: 4,
      description: 'يمكنك استخدام {city} ليُستبدل تلقائياً باسم المدينة و{name} باسم المطعم.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'active',
      title: 'مفعّل (يظهر في الموقع)',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'order',
      title: 'ترتيب السؤال',
      type: 'number',
      initialValue: 1,
    }),
  ],
  preview: {
    select: {
      title: 'question',
      active: 'active',
    },
    prepare({title, active}) {
      return {
        title: title || 'سؤال جديد',
        subtitle: active === false ? 'مخفي' : 'مفعّل',
      }
    },
  },
})
