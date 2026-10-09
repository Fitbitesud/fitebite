import {defineField, defineType} from 'sanity'

/** الباقات الشهرية الجاهزة — تظهر بطاقات في صفحة /packages */
export const readyPackage = defineType({
  name: 'readyPackage',
  title: 'الباقات الشهرية الجاهزة',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'اسم الباقة', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'goalId',
      title: 'الهدف',
      type: 'string',
      options: {
        list: [
          {title: 'تضخيم', value: 'bulking'},
          {title: 'تنشيف', value: 'cutting'},
          {title: 'محافظة', value: 'maintain'},
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'meals',
      title: 'عدد الوجبات يومياً',
      type: 'number',
      validation: (r) => r.required().min(1).max(4),
    }),
    defineField({
      name: 'kcal',
      title: 'السعرات اليومية',
      type: 'number',
      validation: (r) => r.required().min(0),
    }),
    defineField({name: 'desc', title: 'الوصف', type: 'text', rows: 2}),
    defineField({name: 'badge', title: 'شارة مميزة (اختياري)', type: 'string'}),
    defineField({name: 'image', title: 'صورة الباقة', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'priceMonthly',
      title: 'سعر شهري يدوي (اختياري)',
      type: 'number',
      description: 'اتركه فارغاً ليُحسب السعر تلقائياً من هدف الباقة وعدد وجباتها',
    }),
    defineField({name: 'order', title: 'ترتيب العرض', type: 'number', initialValue: 1}),
  ],
  preview: {
    select: {title: 'name', subtitle: 'goalId', media: 'image'},
  },
})
