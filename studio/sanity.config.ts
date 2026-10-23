import {defineConfig} from 'sanity'
import {structureTool, type StructureResolver} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

if (!projectId) {
  throw new Error(
    'ضع معرّف مشروعك في studio/.env.local كالتالي: SANITY_STUDIO_PROJECT_ID=xxxxx — انظر studio/README.md',
  )
}

/** هيكل القائمة الجانبية: إعدادات الموقع وثيقة واحدة في الأعلى */
const structure: StructureResolver = (S) =>
  S.list()
    .title('فيتبايت')
    .items([
      S.listItem()
        .title('إعدادات الموقع (الشعار والنصوص والأرقام)')
        .child(
          S.editor()
            .id('siteSettings')
            .schemaType('siteSettings')
            .documentId('siteSettings')
            /* عنوان بشري واضح للوثيقة (بدونه يعرض Studio تسلسل الحقول كنص تقني) */
            .title('إعدادات الموقع'),
        ),
      S.divider(),
      S.listItem().title('أصناف القائمة').child(S.documentTypeList('menuItem')),
      S.listItem().title('تصنيفات القائمة').child(S.documentTypeList('category')),
      S.listItem().title('الباقات الشهرية').child(S.documentTypeList('readyPackage')),
      S.listItem().title('العروض الخاصة').child(S.documentTypeList('offer')),
      S.listItem()
        .title('فيديوهات الصفحة الرئيسية (المربعات الثلاثة)')
        .child(S.documentTypeList('homeVideo')),
      S.listItem().title('معرض الأعمال').child(S.documentTypeList('galleryItem')),
      S.listItem().title('الأسئلة الشائعة').child(S.documentTypeList('faqItem')),
      S.listItem().title('الاستشارات الواردة').child(S.documentTypeList('consultation')),
      S.listItem().title('تعليقات الزوار (موافقة/نشر)').child(S.documentTypeList('comment')),
    ])

export default defineConfig({
  name: 'fitbite',
  title: 'فيتبايت — لوحة التحكم',
  projectId,
  dataset,
  plugins: [structureTool({structure}), visionTool()],
  schema: {
    types: schemaTypes,
  },
})
