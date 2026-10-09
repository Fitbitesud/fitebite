# لوحة تحكم فيتبايت — Sanity Studio

هذه لوحة التحكم التي يدار منها الموقع: الأصناف، التصنيفات، وتعليقات الزوار (موافقة/نشر).

## خطوات الربط أول مرة

1. أنشئ حساباً ومشروعاً مجانياً على https://www.sanity.io (اختر Free plan).
2. من https://www.sanity.io/manage انسخ **Project ID**.
3. في مجلد `studio/` انسخ `.env.example` إلى `.env.local` وضع المعرّف:
   ```
   SANITY_STUDIO_PROJECT_ID=ضع_المعرّف_هنا
   SANITY_STUDIO_DATASET=production
   ```
4. ثبّت وشغّل اللوحة محلياً:
   ```
   cd studio
   npm install
   npm run dev        # تفتح على http://localhost:3333
   ```
   سجّل الدخول بحساب Sanity نفسه، وأنشئ الداتاسيت باسم `production` عند أول تشغيل.
5. انشر اللوحة مستضافةً مجاناً على Sanity:
   ```
   npm run deploy     # تصبح على https://<project-id>.sanity.studio
   ```

## إدخال البيانات

- **أصناف القائمة**: اذهب لقسم «أصناف القائمة» وأضف الأصناف (الاسم، التصنيف، السعر، الصورة، الماكروز…).
  يمكنك استيراد الأصناف الحالية دفعة واحدة لاحقاً عبر سكربت `sanity dataset import`.
- **تعليقات الزوار**: كل تعليق من الموقع يصل هنا بحالة ⏳ غير موافَق عليها؛
  فعّل مفتاح «موافَق عليه» ليُنشر التعليق تلقائياً في الموقع عند إعادة البناء/الجلب.

## ربط الموقع باللوحة

في جذر المستودع ضع متغيرات البيئة (محلياً في `.env.local`، وللنشر في GitHub → Settings → Secrets and variables → Actions):

```
NEXT_PUBLIC_SANITY_PROJECT_ID=<نفس المعرّف>
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_COMMENT_TOKEN=<توكن صلاحية إنشاء تعليق فقط>
```

إنشاء التوكن: من Sanity → API → Create token → صلاحيات مخصصة (Custom) تسمح بـ **Create** على نوع `comment` فقط.
بعد ذلك يجلب الموقع القائمة والتعليقات المعتمدة من Sanity تلقائياً، وبدونها يبقى على البيانات المحلية.
