import {defineField, defineType} from 'sanity'

/**
 * فيديوهات الصفحة الرئيسية — المربعات الثلاثة المتتالية بعد قسم الهبوط.
 * يدعم رفع ملف فيديو مباشرة (MP4 / WebM / MOV) أو وضع رابط فيديو (يوتيوب / Shorts / Vimeo / رابط مباشر).
 */
export const homeVideo = defineType({
  name: 'homeVideo',
  title: 'فيديوهات الصفحة الرئيسية',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'عنوان الفيديو',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'badge',
      title: 'شارة مختصرة أعلى الفيديو (اختياري)',
      type: 'string',
      description: 'مثال: من داخل المطبخ، الطهي الصحي، تجهيز يومي.',
    }),
    defineField({
      name: 'desc',
      title: 'وصف مختصر (اختياري)',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'videoFile',
      title: 'رفع ملف فيديو من جهازك (MP4 / WebM / MOV)',
      type: 'file',
      options: {
        accept: 'video/*',
      },
      description:
        'ارفع الفيديو مباشرة هنا، أو اتركه فارغاً وضع رابط الفيديو في الحقل التالي.',
    }),
    defineField({
      name: 'videoUrl',
      title: 'أو رابط فيديو خارجي (يوتيوب / Shorts / Vimeo / MP4)',
      type: 'url',
      description:
        'يُستخدم إذا لم ترفع ملف فيديو أعلاه. يقبل روابط يوتيوب العادية أو القصيرة (Shorts) أو Vimeo أو رابط ملف فيديو مباشر.',
    }),
    defineField({
      name: 'poster',
      title: 'صورة غلاف الفيديو (اختياري)',
      type: 'image',
      options: {hotspot: true},
      description: 'تظهر قبل الضغط على زر التشغيل. في روابط يوتيوب تُجلب صورة الغلاف تلقائياً إن تُركت فارغة.',
    }),
    defineField({
      name: 'active',
      title: 'مفعّل (يظهر في الموقع)',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'order',
      title: 'ترتيب المربع (1، 2، 3…)',
      type: 'number',
      initialValue: 1,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      badge: 'badge',
      active: 'active',
      media: 'poster',
    },
    prepare({title, badge, active, media}) {
      return {
        title: title || 'فيديو بدون عنوان',
        subtitle: [badge, active === false ? 'مخفي' : 'مفعّل'].filter(Boolean).join(' — '),
        media,
      }
    },
  },
})
