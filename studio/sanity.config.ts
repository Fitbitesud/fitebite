import {defineConfig, type StructureResolver} from 'sanity'
import {structureTool} from 'sanity/structure'
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
        .title('إعدادات الموقع (كل النصوص والأرقام)')
        .child(S.editor().id('siteSettings').schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      S.listItem().title('أصناف القائمة').child(S.documentTypeList('menuItem')),
      S.listItem().title('تصنيفات القائمة').child(S.documentTypeList('category')),
      S.listItem().title('الباقات الشهرية').child(S.documentTypeList('readyPackage')),
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
