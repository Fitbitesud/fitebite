import {defineField, defineType} from 'sanity'

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
 * الهوية، الأرقام، الروابط، الدوام والمناطق، وكل نصوص صفحة الهبوط.
 */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'إعدادات الموقع (كل النصوص والأرقام)',
  type: 'document',
  fields: [
    defineField({
      name: 'identity',
      title: 'الهوية',
      type: 'object',
      fields: [
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
        defineField({name: 'deliveryFee', title: 'رسوم التوصيل', type: 'number'}),
        defineField({name: 'freeDeliveryAbove', title: 'توصيل مجاني فوق مجموع', type: 'number'}),
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
    defineField({name: 'regions', title: 'مناطق التوصيل', type: 'array', of: [{type: 'string'}]}),
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
      ],
      options: {collapsed: false},
    }),
  ],
})
