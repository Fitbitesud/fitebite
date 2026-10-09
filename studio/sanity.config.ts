import {defineConfig} from 'sanity'
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

export default defineConfig({
  name: 'fitbite',
  title: 'فيتبايت — لوحة التحكم',
  projectId,
  dataset,
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
})
