import {defineField, defineType} from 'sanity'

/* ── شعار الشريط العلوي: الصيغ المقبولة وفحص ملف الصورة ── */

/** صيغ مقبولة في شعار الشريط (كلها مدعومة في تصدير الموقع الثابت) */
const LOGO_FORMATS = ['png', 'svg', 'webp', 'jpg', 'jpeg']

/** صيغ صور لا ندعمها في الشريط (الرفع ينجح لكن الصورة لا تظهر بعد التصدير) */
const UNSUPPORTED_LOGO_FORMATS = [
  'gif',
  'bmp',
  'tif',
  'tiff',
  'heic',
  'heif',
  'avif',
  'ico',
  'psd',
  'eps',
]

const LOGO_FORMAT_ERROR =
  'الصيغة غير مدعومة في الشريط. ارفع الشعار بصيغة PNG أو SVG أو WebP أو JPG.'

type LogoImageValue = {
  asset?: {_ref?: string; originalFilename?: string; url?: string} | null
} | null

/** امتداد الملف من نص: آخر مقطع بعد نقطة أو بعد شرطة (مثال: image-abc-480x480-png) */
const trailingExtension = (raw?: string): string | null => {
  if (typeof raw !== 'string' || !raw) return null
  const clean = raw.split('?')[0].split('#')[0]
  const token = /[.-]([a-z0-9]{2,5})$/i.exec(clean)?.[1]
  return token ? token.toLowerCase() : null
}

/**
 * تحقق حقل الشعار: يقبل PNG/SVG/WebP/JPG بأي أبعاد، ويرفض الصيغ غير المدعومة.
 * نقرأ الصيغة من معرّف الأصل (asset) ثم من اسم الملف الأصلي ثم من الرابط، لأن معرّف
 * Sanity للصور ينتهي بصيغة الملف المرفوع (image-<hash>-<width>x<height>-<format>).
 * ملاحظة: هذا التحقق يعمل لحظة الحفظ في اللوحة؛ الملفات المرفوعة سابقاً لا تُعاد
 * مراجعتها، فإن غُيّر الشرط لاحقاً أعد رفع الصورة.
 */
const validLogoAsset = (value: unknown) => {
  const asset = (value as LogoImageValue)?.asset
  if (!asset) return true // الحقل اختياري: بلا صورة يستخدم الموقع الشعار الافتراضي
  const candidates = [asset._ref, asset.originalFilename, asset.url]
    .map(trailingExtension)
    .filter((ext): ext is string => Boolean(ext))
  const format = candidates.find((ext) => /[a-z]/.test(ext)) // تجاهل مقاطع رقمية مثل 480x480
  if (!format) return true // صيغة غير معروفة → نسمح (لا نعطّل الحفظ بسبب تخمين)
  if (LOGO_FORMATS.includes(format)) return true
  return UNSUPPORTED_LOGO_FORMATS.includes(format) ? LOGO_FORMAT_ERROR : true
}

/** خيارات مشتركة لحقلي شعار الشريط (فتح ملفات الصور المقبولة فقط في المنتقي) */
const LOGO_IMAGE_OPTIONS = {
  hotspot: true,
  accept: 'image/png,image/svg+xml,image/webp,image/jpeg',
}

const ICON_LIST = [
  {title: 'غطاء طبق (cloche)', value: 'cloche'},
  {title: 'رسم بياني (chart)', value: 'chart'},
  {title: 'لهب (flame)', value: 'flame'},
  {title: 'ورقة (leaf)', value: 'leaf'},
  {title: 'لوحة معلومات (clipboard)', value: 'clipboard'},
  {title: 'قدر (pot)', value: 'pot'},
  {title: 'أشخاص (people)', value: 'people'},
  {title: 'غصن ورقة (leafsprig)', value: 'leafsprig'},
  {title: 'سلة (cart)', value: 'cart'},
  {title: 'واتساب (whatsapp)', value: 'whatsapp'},
  {title: 'دراجة توصيل (bike)', value: 'bike'},
]

/**
 * إعدادات الموقع الكاملة — وثيقة واحدة تتحكم في:
 * شعار الشريط العلوي وصورته للخلفية الداكنة، الهوية، الأرقام، الروابط،
 * الدوام والمناطق، وكل نصوص صفحة الهبوط.
 */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'إعدادات الموقع (الشعار والنصوص والأرقام)',
  type: 'document',
  fields: [
    defineField({
      name: 'identity',
      title: 'الهوية والشعار',
      type: 'object',
      fields: [
        defineField({
          name: 'logo',
          title: 'شعار الشريط العلوي (خلفية فاتحة)',
          type: 'image',
          description:
            'الصورة الأساسية للشعار: تظهر في الشريط العلوي على الخلفية الفاتحة (بعد التمرير، وفي صفحتي القائمة والباقات). الأفضل ملف بخلفية شفافة — PNG أو SVG أو WebP أو JPG.',
          options: LOGO_IMAGE_OPTIONS,
          validation: (rule) => rule.custom(validLogoAsset),
        }),
        defineField({
          name: 'logoDark',
          title: 'شعار الشريط العلوي (خلفية داكنة) — اختياري',
          type: 'image',
          description:
            'نسخة الشعار بالألوان الفاتحة تُستخدم فوق الخلفية الداكنة (أعلى الصفحة الرئيسية قبل التمرير، والتذييل). اتركه فارغاً ليُستخدم الشعار الأساسي في كل المواضع.',
          options: LOGO_IMAGE_OPTIONS,
          validation: (rule) => rule.custom(validLogoAsset),
        }),
        defineField({name: 'nameAr', title: 'الاسم بالعربية', type: 'string'}),
        defineField({name: 'nameEn', title: 'الاسم بالإنجليزية (الشريط)', type: 'string'}),
        defineField({name: 'taglineAr', title: 'السطر التعريفي', type: 'string'}),
        defineField({name: 'description', title: 'وصف الموقع (SEO والتذييل)', type: 'text', rows: 3}),
      ],
      options: {collapsed: false},
    }),
    defineField({
      name: 'contact',
      title: 'الأرقام والتواصل',
      type: 'object',
      fields: [
        defineField({
          name: 'whatsapp',
          title: 'رقم واتساب للطلبات (صيغة دولية بدون +)',
          type: 'string',
          description: 'مثال: 249116642510',
        }),
        defineField({name: 'whatsappDisplay', title: 'الرقم كما يُعرض للزوار', type: 'string'}),
        defineField({name: 'currency', title: 'رمز العملة', type: 'string'}),
        defineField({
          name: 'deliveryNote',
          title: 'نص التوصيل الاحتياطي (قبل اختيار المنطقة)',
          type: 'string',
          description:
            'يظهر بجانب «التوصيل» في السلة ورسالة واتساب عندما يطلب العميل توصيلاً قبل أن يختار المنطقة. بعد اختيار المنطقة يُستبدل تلقائياً بسعر التوصيل الثابت المضبوط لها في «مناطق التوصيل وأسعارها». اتركه فارغاً للإبقاء على: مع مندوب التوصيل.',
        }),
        defineField({name: 'city', title: 'المدينة', type: 'string'}),
        defineField({name: 'address', title: 'العنوان', type: 'string'}),
      ],
      options: {collapsed: true},
    }),
    defineField({
      name: 'socials',
      title: 'روابط التواصل الاجتماعي',
      type: 'object',
      fields: [
        defineField({name: 'instagram', title: 'إنستغرام', type: 'url'}),
        defineField({name: 'facebook', title: 'فيسبوك', type: 'url'}),
        defineField({name: 'tiktok', title: 'تيك توك', type: 'url'}),
      ],
      options: {collapsed: true},
    }),
    defineField({
      name: 'hours',
      title: 'ساعات العمل',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'days', title: 'الأيام', type: 'string'},
            {name: 'time', title: 'الوقت', type: 'string'},
          ],
        },
      ],
    }),
    defineField({
      name: 'regions',
      title: 'مناطق التوصيل وأسعارها',
      type: 'array',
      description:
        'لكل منطقة سعر توصيل ثابت يُضاف تلقائياً إلى إجمالي الطلب عند اختيارها (0 = بدون رسوم). ترتيب المناطق هنا هو نفسه في قائمة السلة. المناطق القديمة المحفوظة كنص فقط تبقى موجودة بسعر 0 حتى تكتب سعرها.',
      of: [
        {type: 'deliveryRegion'},
        /* شكل قديم محفوظ في وثائق سابقة: اسم منطقة فقط (سعر التوصيل 0) */
        {type: 'string'},
      ],
    }),
    defineField({
      name: 'home',
      title: 'نصوص صفحة الهبوط',
      type: 'object',
      fields: [
        defineField({name: 'heroBadge', title: 'شارة الهبوط العليا', type: 'string'}),
        defineField({name: 'heroTitleLead', title: 'بداية العنوان الرئيسي', type: 'string'}),
        defineField({name: 'heroAccent', title: 'الكلمة الملوّنة في العنوان', type: 'string'}),
        defineField({name: 'heroTitleTail', title: 'نهاية العنوان الرئيسي', type: 'string'}),
        defineField({
          name: 'heroSentences',
          title: 'الجمل المتحركة في العنوان الرئيسي (اختياري)',
          type: 'array',
          description:
            'يتبدّل العنوان الرئيسي تلقائياً بأنيميشن سلس بين هذه الجمل. اتركها فارغة لاستخدام الجمل المتحركة الافتراضية.',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'lead', title: 'بداية الجملة', type: 'string'},
                {name: 'accent', title: 'الجزء الملوّن (اختياري)', type: 'string'},
                {name: 'tail', title: 'تتمة الجملة (اختياري)', type: 'string'},
              ],
            },
          ],
        }),
        defineField({
          name: 'heroParagraph',
          title: 'فقرة الهبوط',
          type: 'text',
          rows: 3,
          description: 'استخدم {city} ليُستبدل تلقائياً باسم المدينة',
        }),
        defineField({name: 'heroPrimaryLabel', title: 'نص زر القائمة', type: 'string'}),
        defineField({name: 'heroSecondaryLabel', title: 'نص زر واتساب', type: 'string'}),
        defineField({name: 'heroImage', title: 'صورة الهبوط', type: 'image', options: {hotspot: true}}),
        defineField({name: 'heroCardTitle', title: 'عنوان بطاقة الماكروز العائمة', type: 'string'}),
        defineField({
          name: 'strip',
          title: 'شريط الوعود أسفل الهبوط',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'title', title: 'العنوان', type: 'string'},
                {name: 'sub', title: 'السطر الثاني', type: 'string'},
                {name: 'icon', title: 'الأيقونة', type: 'string', options: {list: ICON_LIST}},
              ],
            },
          ],
        }),
        defineField({
          name: 'featuresHeading',
          title: 'عنوان قسم المميزات',
          type: 'object',
          fields: [
            {name: 'eyebrow', title: 'السطر الصغير', type: 'string'},
            {name: 'title', title: 'العنوان', type: 'string'},
            {name: 'sub', title: 'الوصف', type: 'text', rows: 2},
          ],
        }),
        defineField({
          name: 'features',
          title: 'بطاقات المميزات',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'title', title: 'العنوان', type: 'string'},
                {name: 'desc', title: 'الوصف', type: 'text', rows: 3},
                {name: 'icon', title: 'الأيقونة', type: 'string', options: {list: ICON_LIST}},
              ],
            },
          ],
        }),
        defineField({
          name: 'howHeading',
          title: 'عنوان قسم كيف تطلب',
          type: 'object',
          fields: [
            {name: 'eyebrow', title: 'السطر الصغير', type: 'string'},
            {name: 'title', title: 'العنوان', type: 'string'},
            {name: 'sub', title: 'الوصف', type: 'text', rows: 2},
          ],
        }),
        defineField({
          name: 'steps',
          title: 'خطوات الطلب',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'title', title: 'العنوان', type: 'string'},
                {name: 'desc', title: 'الوصف', type: 'text', rows: 2},
                {name: 'icon', title: 'الأيقونة', type: 'string', options: {list: ICON_LIST}},
              ],
            },
          ],
        }),
        defineField({
          name: 'cta',
          title: 'بانر الدعوة الأخير',
          type: 'object',
          fields: [
            {name: 'title', title: 'العنوان', type: 'string'},
            {name: 'sub', title: 'الوصف', type: 'text', rows: 2},
            {name: 'primaryLabel', title: 'نص زر واتساب', type: 'string'},
            {name: 'secondaryLabel', title: 'نص زر القائمة', type: 'string'},
          ],
        }),
        defineField({
          name: 'pkgBanner',
          title: 'لافتة الباقات الجاهزة',
          type: 'object',
          fields: [
            {name: 'title', title: 'العنوان', type: 'string'},
            {name: 'sub', title: 'الوصف', type: 'text', rows: 2},
            {name: 'button', title: 'نص الزر', type: 'string'},
          ],
        }),
        defineField({
          name: 'offersHeading',
          title: 'عنوان قسم العروض الخاصة',
          type: 'object',
          fields: [
            {name: 'eyebrow', title: 'السطر الصغير', type: 'string'},
            {name: 'title', title: 'العنوان', type: 'string'},
            {name: 'sub', title: 'الوصف', type: 'text', rows: 2},
          ],
        }),
        defineField({
          name: 'offersEnabled',
          title: 'إظهار قسم العروض الخاصة في الصفحة الرئيسية',
          type: 'boolean',
          initialValue: true,
          description:
            'أوقفه لإخفاء القسم بالكامل حتى لو وُجدت عروض منشورة. العروض نفسها تُدار من قائمة «العروض الخاصة».',
        }),
        defineField({
          name: 'videosHeading',
          title: 'عنوان قسم الفيديوهات (بعد الهبوط)',
          type: 'object',
          fields: [
            {name: 'eyebrow', title: 'السطر الصغير', type: 'string'},
            {name: 'title', title: 'العنوان', type: 'string'},
            {name: 'sub', title: 'الوصف', type: 'text', rows: 2},
          ],
        }),
        defineField({
          name: 'videosEnabled',
          title: 'إظهار مربعات الفيديوهات الثلاثة بعد قسم الهبوط',
          type: 'boolean',
          initialValue: true,
          description:
            'الفيديوهات نفسها تُضاف وتُرتّب من قائمة «فيديوهات الصفحة الرئيسية» في الشريط الجانبي.',
        }),
        defineField({
          name: 'faqHeading',
          title: 'عنوان قسم الأسئلة الشائعة',
          type: 'object',
          fields: [
            {name: 'eyebrow', title: 'السطر الصغير', type: 'string'},
            {name: 'title', title: 'العنوان', type: 'string'},
            {name: 'sub', title: 'الوصف', type: 'text', rows: 2},
          ],
        }),
        defineField({
          name: 'faqEnabled',
          title: 'إظهار قسم الأسئلة الشائعة أسفل الصفحة الرئيسية',
          type: 'boolean',
          initialValue: true,
          description:
            'الأسئلة والأجوبة تُدار من قائمة «الأسئلة الشائعة» في الشريط الجانبي.',
        }),
      ],
      options: {collapsed: false},
    }),
  ],
  /**
   * عنوان الوثيقة في اللوحة. بدون preview يعتمد Sanity عنواناً افتراضياً يسلسل
   * كل الحقول كنص تقني غريب (مثل identity: {description: …, logo: {asset: …}}).
   * هنا نعرض اسماً بشرياً واضحاً مع اسم الموقع والمدينة وشعاره.
   */
  preview: {
    select: {
      name: 'identity.nameAr',
      city: 'contact.city',
      media: 'identity.logo',
    },
    prepare({name, city, media}) {
      return {
        title: 'إعدادات الموقع',
        subtitle: [name, city].filter(Boolean).join(' — '),
        media,
      }
    },
  },
})
