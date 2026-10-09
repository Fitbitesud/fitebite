import {defineField, defineType} from 'sanity'

/** تصنيفات القائمة — مطابقة لحقل icon في الموقع */
export const category = defineType({
  name: 'category',
  title: 'تصنيفات القائمة',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'اسم التصنيف', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      title: 'المعرّف (slug)',
      type: 'slug',
      options: {source: 'name', maxLength: 40},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'icon',
      title: 'الأيقونة',
      type: 'string',
      options: {
        list: [
          {title: 'فطور (شمس)', value: 'sun'},
          {title: 'سندوتشات', value: 'sandwich'},
          {title: 'وجبات (لهب)', value: 'flame'},
          {title: 'سناكس', value: 'snack'},
          {title: 'مشروبات (كوب)', value: 'cup'},
          {title: 'سلطات (ورقة)', value: 'leaf'},
          {title: 'باول', value: 'bowl'},
          {title: 'بوكس', value: 'box'},
        ],
      },
      initialValue: 'bowl',
    }),
    defineField({name: 'order', title: 'ترتيب العرض', type: 'number', initialValue: 1}),
  ],
  preview: {select: {title: 'name', subtitle: 'slug'}},
})
