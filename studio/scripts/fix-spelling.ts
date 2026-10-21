/**
 * تصحيح الأخطاء الإملائية الشائعة في بيانات لوحة التحكم — أهمها همزة «الأحمر»
 * (تُكتب أحياناً «الاحمر»، مثل «بورتسودان البحر الاحمر» ← «بورتسودان البحر الأحمر»).
 *
 * يُشغَّل من داخل مجلد studio بعد تسجيل الدخول إلى Sanity (sanity login):
 *
 *   npx sanity exec scripts/fix-spelling.ts --with-user-token
 *
 * يعدّل الوثائق المنشورة والمسودات معاً، ويطبع ما الذي صححه. لنفس الغرض يصحح
 * الموقع الكتابة لحظة العرض أيضاً عبر حارس مؤقت في lib/site-data.ts — لكن تشغيل
 * هذا السكربت يجعل لوحة التحكم نفسها تعرض الكتابة الصحيحة من المصدر.
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-02-19'})

/** جدول التصحيح — نفس الجدول المستخدم في lib/site-data.ts (حارس العرض) */
const SPELL_FIXES: Array<[RegExp, string]> = [[/الاحمر/g, 'الأحمر']]

/** يصحح الأخطاء الإملائية الشائعة في كل سلسلة نصية داخل بنية بيانات (كائن/مصفوفة/نص) */
function fixTypos(value: unknown): unknown {
  if (typeof value === 'string') {
    let out = value
    for (const [pattern, replacement] of SPELL_FIXES) out = out.replace(pattern, replacement)
    return out
  }
  if (Array.isArray(value)) return value.map(fixTypos)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value)) out[key] = fixTypos(val)
    return out
  }
  return value
}

async function main() {
  /* كل وثائق الإعدادات — المنشورة والمسودات (معرّفات drafts.*) */
  const docs: Array<Record<string, unknown>> = await client.fetch(`*[_type == "siteSettings"]`)
  let changed = 0
  for (const doc of docs) {
    const id = String(doc._id)
    /* نصلح محتوى الوثيقة فقط؛ حقول النظام (_id و_rev و…) لا تُلمس */
    const body: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(doc)) {
      if (!key.startsWith('_')) body[key] = val
    }
    const fixed = fixTypos(body) as Record<string, unknown>
    /* نحدّث الحقول المتغيّرة وحدها حتى لا نغيّر شيئاً آخر في الوثيقة */
    const set: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(fixed)) {
      if (JSON.stringify(val) !== JSON.stringify(body[key])) set[key] = val
    }
    const keys = Object.keys(set)
    if (!keys.length) continue
    await client.patch(id).set(set).commit()
    changed++
    console.log(`✔︎ صُحّحت الوثيقة ${id}: ${keys.join('، ')}`)
  }
  console.log(changed ? `تم تصحيح ${changed} وثيقة.` : 'لا توجد أخطاء إملائية — كل النصوص سليمة.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
