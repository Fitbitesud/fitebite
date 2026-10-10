/**
 * Browser-side fake of lib/sanity/client. The page controls what the "dashboard" returns:
 *   window.__SANITY_DOC__   → the siteSettings document
 *   window.__SANITY_MENU__  → the {categories, items} menu
 * Like the real module, isSanityConfigured is true.
 */
export const isSanityConfigured = true;
export const getWriteClient = () => null;
export const getReadClient = () => ({
  fetch: async (query: string) => {
    const w = window as any;
    if (query.includes('siteSettings')) return w.__SANITY_DOC__ ?? null;
    if (query.includes('menuItem')) return w.__SANITY_MENU__ ?? null;
    return null;
  },
});
