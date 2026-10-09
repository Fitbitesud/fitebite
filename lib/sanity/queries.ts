/** استعلامات GROQ — مطابقة لأنواع السكيما في studio/schemaTypes */

export const MENU_QUERY = `{
  "categories": *[_type == "category"] | order(order asc) {
    _id, slug, name, icon, order
  },
  "items": *[_type == "menuItem" && available] | order(order asc) {
    _id, slug, name, description, price,
    "categorySlug": category->slug,
    "image": image.asset->url,
    macros { kcal, protein, carbs, fat },
    tags, popular, available
  }
}`;

export const APPROVED_COMMENTS_QUERY = `*[_type == "comment" && approved] | order(postedAt desc) {
  _id, name, role, text, postedAt
}`;

/** إعدادات الموقع الكاملة (وثيقة singleton من نوع siteSettings) */
export const SETTINGS_QUERY = `*[_type == "siteSettings"][0] {
  "nameAr": identity.nameAr,
  "nameEn": identity.nameEn,
  "taglineAr": identity.taglineAr,
  "description": identity.description,
  "whatsapp": contact.whatsapp,
  "whatsappDisplay": contact.whatsappDisplay,
  "currency": contact.currency,
  "deliveryFee": contact.deliveryFee,
  "freeDeliveryAbove": contact.freeDeliveryAbove,
  "city": contact.city,
  "address": contact.address,
  socials,
  hours,
  regions,
  "home": {
    heroBadge, heroTitleLead, heroAccent, heroTitleTail, heroParagraph,
    heroPrimaryLabel, heroSecondaryLabel,
    "heroImage": heroImage.asset->url,
    heroCardTitle,
    strip[] { title, sub, icon },
    featuresHeading { eyebrow, title, sub },
    features[] { title, desc, icon },
    howHeading { eyebrow, title, sub },
    steps[] { title, desc, icon },
    cta { title, sub, primaryLabel, secondaryLabel },
    pkgBanner { title, sub, button }
  }
}`;

/** الباقات الشهرية الجاهزة من لوحة التحكم */
export const PACKAGES_QUERY = `*[_type == "readyPackage"] | order(order asc) {
  _id, name, goalId, meals, kcal, desc, badge,
  "image": image.asset->url,
  priceMonthly, order
}`;
