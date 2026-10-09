import {defineField, defineType} from 'sanity'

/** أصناف القائمة — الحقول مطابقة لنوع MenuItemData في الموقع */
export const menuItem = defineType({
  name: 'menuItem',
  title: 'أصناف القائمة',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'اسم الصنف', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      title: 'المعرّف (slug)',
      type: 'slug',
      options: {source: 'name', maxLength: 60},
      validation: (r) => r.required(),
    }),
    defineField({name: 'description', title: 'الوصف', type: 'text', rows: 3}),
    defineField({
      name: 'category',
      title: 'التصنيف',
      type: 'reference',
      to: [{type: 'category'}],
      validation: (r) => r.required(),
    }),
    defineField({name: 'price', title: 'السعر (ج.س)', type: 'number', validation: (r) => r.required().min(0)}),
    defineField({name: 'image', title: 'صورة الصنف', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'macros',
      title: 'الماكروز',
      type: 'object',
      fields: [
        defineField({name: 'kcal', title: 'سعرات', type: 'number'}),
        defineField({name: 'protein', title: 'بروتين (غ)', type: 'number'}),
        defineField({name: 'carbs', title: 'كاربوهيدرات (غ)', type: 'number'}),
        defineField({name: 'fat', title: 'دهون (غ)', type: 'number'}),
      ],
    }),
    defineField({name: 'tags', title: 'وسوم', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'popular', title: 'صنف مميز؟', type: 'boolean', initialValue: false}),
    defineField({name: 'available', title: 'متاح للطلب؟', type: 'boolean', initialValue: true}),
    defineField({name: 'order', title: 'ترتيب العرض', type: 'number', initialValue: 1}),
  ],
  preview: {
    select: {title: 'name', subtitle: 'category.name', media: 'image'},
  },
})
