import {defineField, defineType} from 'sanity'

/**
 * الاستشارات الواردة من الزوار عبر صفحة «الاستشارات».
 * تُرسل الاستشارة مباشرة لواتساب صاحب الموقع، وتُحفظ هنا أيضاً عند ضبط توكن الكتابة.
 */
export const consultation = defineType({
  name: 'consultation',
  title: 'الاستشارات الواردة',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'اسم العميل', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'phone', title: 'رقم الهاتف / الواتساب', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'goal', title: 'موضوع الاستشارة / الهدف', type: 'string'}),
    defineField({name: 'age', title: 'العمر (اختياري)', type: 'string'}),
    defineField({name: 'weight', title: 'الوزن كغ (اختياري)', type: 'string'}),
    defineField({name: 'height', title: 'الطول سم (اختياري)', type: 'string'}),
    defineField({
      name: 'message',
      title: 'نص الاستشارة',
      type: 'text',
      rows: 5,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'status',
      title: 'حالة المتابعة',
      type: 'string',
      options: {
        list: [
          {title: 'جديدة', value: 'new'},
          {title: 'تم الرد', value: 'replied'},
        ],
      },
      initialValue: 'new',
    }),
    defineField({
      name: 'createdAt',
      title: 'تاريخ الإرسال',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      name: 'name',
      goal: 'goal',
      phone: 'phone',
    },
    prepare({name, goal, phone}) {
      return {
        title: name || 'استشارة جديدة',
        subtitle: [goal, phone].filter(Boolean).join(' — '),
      }
    },
  },
})
