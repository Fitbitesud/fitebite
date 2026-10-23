import {defineField, defineType} from 'sanity'

const GALLERY_CATEGORIES = [
  {title: 'الأطباق والباولز', value: 'الأطباق والباولز'},
  {title: 'تجهيز البوكسات', value: 'تجهيز البوكسات'},
  {title: 'المشويات والسلطات', value: 'المشويات والسلطات'},
  {title: 'الفطور والمشروبات', value: 'الفطور والمشروبات'},
  {title: 'من داخل المطبخ', value: 'من داخل المطبخ'},
  {title: 'مناسبات وطلبات خاصة', value: 'مناسبات وطلبات خاصة'},
]

/** معرض الأعمال — صور أطباق وأعمال وتجهيزات المطعم في صفحة «معرض الأعمال» */
export const galleryItem = defineType({
  name: 'galleryItem',
  title: 'معرض الأعمال',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'عنوان الصورة / العمل',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'category',
      title: 'التصنيف',
      type: 'string',
      options: {list: GALLERY_CATEGORIES},
      initialValue: 'الأطباق والباولز',
    }),
    defineField({
      name: 'desc',
      title: 'وصف مختصر (اختياري)',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'image',
      title: 'صورة العمل',
      type: 'image',
      options: {hotspot: true},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'active',
      title: 'مفعّل (يظهر في المعرض)',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'order',
      title: 'ترتيب العرض',
      type: 'number',
      initialValue: 1,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      active: 'active',
      media: 'image',
    },
    prepare({title, category, active, media}) {
      return {
        title: title || 'عمل بدون عنوان',
        subtitle: [category, active === false ? 'مخفي' : 'مفعّل'].filter(Boolean).join(' — '),
        media,
      }
    },
  },
})
