/** استعلامات GROQ — مطابقة لأنواع السكيما في studio/schemaTypes */

export const MENU_QUERY = `{
  "categories": *[_type == "category" && defined(slug.current)] | order(order asc) {
    _id, "slug": slug.current, name, icon, order
  },
  "items": *[_type == "menuItem" && available != false] | order(order asc) {
    _id, slug, name, description, price,
    "categorySlug": category->slug.current,
    "image": image.asset->url,
    macros { kcal, protein, carbs, fat },
    tags, popular, available
  }
}`;

export const APPROVED_COMMENTS_QUERY = `*[_type == "comment" && approved] | order(postedAt desc) {
  _id, name, role, text, postedAt
}`;

/**
 * إعدادات الموقع — كل وثائق siteSettings مرتبة من الأقدم للأحدث (تُدمج في الكود والأحدث يحسم كل حقل).
 *
 * كل حقل يُقرأ بـ coalesce(المسار المؤهل, الحقل العلوي) ليتحمّل شكلَي الوثيقة معاً:
 *   • الشكل المتداخل الحالي في السكيما: identity / contact / home
 *   • الشكل القديم المسطّح: الحقول نفسها في جذر الوثيقة (مثل heroImage و strip)
 * فيعمل الموقع مع الوثائق القديمة والجديدة بلا تعديل في الكود — والخروج دائماً بالشكل
 * الذي يتوقعه lib/site-data.ts مهما كان شكل الوثيقة.
 * ملاحظة: socials و hours و regions في الجذر في الشكلين، فتُقرأ مباشرة بلا coalesce.
 */
export const SETTINGS_QUERY = `*[_type == "siteSettings"] | order(_updatedAt asc) {
  "nameAr": coalesce(identity.nameAr, nameAr),
  "nameEn": coalesce(identity.nameEn, nameEn),
  "logo": coalesce(identity.logo.asset->url, logo.asset->url),
  "taglineAr": coalesce(identity.taglineAr, taglineAr),
  "description": coalesce(identity.description, description),
  "whatsapp": coalesce(contact.whatsapp, whatsapp),
  "whatsappDisplay": coalesce(contact.whatsappDisplay, whatsappDisplay),
  "currency": coalesce(contact.currency, currency),
  "deliveryFee": coalesce(contact.deliveryFee, deliveryFee),
  "freeDeliveryAbove": coalesce(contact.freeDeliveryAbove, freeDeliveryAbove),
  "city": coalesce(contact.city, city),
  "address": coalesce(contact.address, address),
  socials,
  hours,
  regions,
  "home": {
    "heroBadge": coalesce(home.heroBadge, heroBadge),
    "heroTitleLead": coalesce(home.heroTitleLead, heroTitleLead),
    "heroAccent": coalesce(home.heroAccent, heroAccent),
    "heroTitleTail": coalesce(home.heroTitleTail, heroTitleTail),
    "heroParagraph": coalesce(home.heroParagraph, heroParagraph),
    "heroPrimaryLabel": coalesce(home.heroPrimaryLabel, heroPrimaryLabel),
    "heroSecondaryLabel": coalesce(home.heroSecondaryLabel, heroSecondaryLabel),
    "heroImage": coalesce(home.heroImage.asset->url, heroImage.asset->url),
    "heroCardTitle": coalesce(home.heroCardTitle, heroCardTitle),
    "strip": coalesce(home.strip[]{title, sub, icon}, strip[]{title, sub, icon}),
    "featuresHeading": coalesce(home.featuresHeading{eyebrow, title, sub}, featuresHeading{eyebrow, title, sub}),
    "features": coalesce(home.features[]{title, desc, icon}, features[]{title, desc, icon}),
    "howHeading": coalesce(home.howHeading{eyebrow, title, sub}, howHeading{eyebrow, title, sub}),
    "steps": coalesce(home.steps[]{title, desc, icon}, steps[]{title, desc, icon}),
    "cta": coalesce(home.cta{title, sub, primaryLabel, secondaryLabel}, cta{title, sub, primaryLabel, secondaryLabel}),
    "pkgBanner": coalesce(home.pkgBanner{title, sub, button}, pkgBanner{title, sub, button})
  }
}`;

/** الباقات الشهرية الجاهزة من لوحة التحكم */
export const PACKAGES_QUERY = `*[_type == "readyPackage"] | order(order asc) {
  _id, name, goalId, meals, kcal, desc, badge,
  "image": image.asset->url,
  priceMonthly, order
}`;
