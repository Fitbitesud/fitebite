import {defineField, defineType} from 'sanity'

/**
 * تعليقات الزوار: تصل هنا بحالة «غير موافَق عليها»،
 * وعند تفعيل approved تُنشر تلقائياً في الموقع.
 */
export const comment = defineType({
  name: 'comment',
  title: 'تعليقات الزوار',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'اسم الزائر', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'role', title: 'صفة اختيارية (مثال: رياضي)', type: 'string'}),
    defineField({name: 'text', title: 'نص التعليق', type: 'text', rows: 4, validation: (r) => r.required()}),
    defineField({
      name: 'approved',
      title: 'موافَق عليه (يُنشر في الموقع)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'postedAt',
      title: 'تاريخ الإرسال',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'text', approved: 'approved'},
    prepare({title, subtitle, approved}) {
      return {
        title: `${title} ${approved ? '✅' : '⏳'}`,
        subtitle: String(subtitle ?? '').slice(0, 80),
      }
    },
  },
})
