import {defineField, defineType} from 'sanity'

/**
 * منطقة توصيل واحدة: الاسم + سعر التوصيل الثابت لها.
 * يُحفظ العنصر داخل `siteSettings.regions` ككائن، ويُقرأ في الموقع عبر lib/delivery.ts.
 */
export const deliveryRegion = defineType({
  name: 'deliveryRegion',
  title: 'منطقة توصيل',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'اسم المنطقة',
      type: 'string',
      description: 'يظهر للعميل في قائمة «موقع الاستلام» داخل السلة — مثال: الرياض.',
      validation: (rule) => rule.required().error('اكتب اسم المنطقة (مثال: الرياض).'),
    }),
    defineField({
      name: 'deliveryFee',
      title: 'سعر التوصيل الثابت (بالعملة المعروضة)',
      type: 'number',
      description:
        'سعر ثابت يُضاف مرة واحدة إلى إجمالي الطلب عند اختيار العميل هذه المنطقة. اكتب 0 أو اتركه فارغاً لتوصيل بدون رسوم. عدّل رقم العملة من «الأرقام والتواصل».',
      initialValue: 0,
      validation: (rule) =>
        rule
          .min(0)
          .integer()
          .error('اكتب سعراً صحيحاً غير سالب (0 يعني بدون رسوم توصيل).'),
    }),
  ],
  preview: {
    select: {name: 'name', fee: 'deliveryFee'},
    prepare({name, fee}) {
      const amount = typeof fee === 'number' && Number.isFinite(fee) ? Math.max(0, fee) : 0
      return {
        title: name || 'منطقة بدون اسم',
        subtitle: amount > 0 ? `سعر التوصيل الثابت: ${amount}` : 'بدون رسوم توصيل',
      }
    },
  },
})
