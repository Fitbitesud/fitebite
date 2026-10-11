/**
 * GitHub Pages builds run with NEXT_PUBLIC_BASE_PATH=/fitebite.
 * Local menu/package data already carries that prefix (via asset()), so the
 * image resolver must NOT prefix it a second time — otherwise every image 404s
 * in production. resolveImageUrl takes the base path as an argument so the
 * behaviour is testable regardless of process env.
 */
import { describe, expect, it } from 'bun:test';
import { resolveImageUrl } from '../lib/site-data';

const BASE = '/fitebite';

describe('image resolution with a base path (GitHub Pages export)', () => {
  it('prefixes plain public paths exactly once', () => {
    expect(resolveImageUrl('/images/hero-bowl.jpg', BASE)).toBe('/fitebite/images/hero-bowl.jpg');
  });

  it('does not double-prefix paths that already carry the base path', () => {
    const already = '/fitebite/images/hero-bowl.jpg';
    expect(resolveImageUrl(already, BASE)).toBe(already);
  });

  it('absolute Sanity CDN urls are never prefixed', () => {
    const url = 'https://cdn.sanity.io/images/proj/ds/asset.jpg';
    expect(resolveImageUrl(url, BASE)).toBe(url);
  });

  it('missing/empty image falls back to the default hero image', () => {
    expect(resolveImageUrl('', BASE)).toBe('/fitebite/images/hero-bowl.jpg');
    expect(resolveImageUrl(null, BASE)).toBe('/fitebite/images/hero-bowl.jpg');
    expect(resolveImageUrl(undefined, BASE)).toBe('/fitebite/images/hero-bowl.jpg');
  });
});
