import {defineField, defineType} from 'sanity'

/** العروض الخاصة — بطاقات في قسم «العروض الخاصة» في الصفحة الرئيسية */
export const offer = defineType({
  name: 'offer',
  title: 'العروض الخاصة',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'عنوان العرض', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'badge',
      title: 'شارة مختصرة (اختياري، مثال: خصم 20%)',
      type: 'string',
      description: 'تظهر كوسم ملون أعلى صورة العرض.',
    }),
    defineField({name: 'desc', title: 'وصف العرض', type: 'text', rows: 3}),
    defineField({name: 'image', title: 'صورة العرض', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'priceOld',
      title: 'السعر قبل العرض (اختياري)',
      type: 'number',
      description: 'يُعرض مشطوباً بجانب سعر العرض لإظهار قيمة الخصم.',
    }),
    defineField({name: 'priceNew', title: 'سعر العرض (اختياري)', type: 'number'}),
    defineField({
      name: 'validUntil',
      title: 'آخر تاريخ للعرض (اختياري)',
      type: 'date',
      description:
        'يختفي العرض تلقائياً من الموقع بعد هذا التاريخ. اتركه فارغاً ليكون العرض دائماً.',
    }),
    defineField({
      name: 'active',
      title: 'مفعّل (يظهر في الموقع)',
      type: 'boolean',
      initialValue: true,
      description: 'أوقفه لإخفاء العرض مؤقتاً دون حذفه من اللوحة.',
    }),
    defineField({name: 'order', title: 'ترتيب العرض', type: 'number', initialValue: 1}),
  ],
})
