/**
 * Test setup — runs before every test file (see bunfig.toml).
 *
 * Replaces lib/sanity/client with a fake so no test touches the network. Tests control what the
 * "dashboard" returns through globalThis.__SANITY:
 *   __SANITY.doc    → value returned by fetch() (e.g. the site-settings document)
 *   __SANITY.error  → if set, fetch() rejects with it
 *
 * isSanityConfigured is true on purpose: the real client falls back to a hard-coded project id,
 * so in production Sanity is always "configured".
 */
import { mock } from 'bun:test';

type SanityState = { doc: unknown; error: unknown };
const g = globalThis as unknown as { __SANITY: SanityState };
g.__SANITY = { doc: null, error: null };

mock.module('../lib/sanity/client', () => ({
  isSanityConfigured: true,
  getReadClient: () => ({
    fetch: async (query: string) => {
      if (g.__SANITY.error) throw g.__SANITY.error;
      if (query.includes('siteSettings')) {
        const doc = g.__SANITY.doc;
        return doc == null ? [] : Array.isArray(doc) ? doc : [doc];
      }
      return g.__SANITY.doc;
    },
  }),
  getWriteClient: () => null,
  SANITY_PROJECT_ID: 'test',
  SANITY_DATASET: 'test',
  SANITY_API_VERSION: 'test',
}));
