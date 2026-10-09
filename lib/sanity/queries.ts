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
