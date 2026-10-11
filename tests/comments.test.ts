import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import {
  APPROVED_COMMENTS,
  getApprovedComments,
  getPendingComments,
  submitComment,
} from '../lib/comments';
import { APPROVED_COMMENTS_QUERY } from '../lib/sanity/queries';
import {
  enableSanityCommentWrites,
  getSanityCreatedComments,
  setSanityDoc,
  setSanityError,
} from './helpers';

const originalWindow = (globalThis as any).window;
const storage = new Map<string, string>();

function installLocalStorage() {
  storage.clear();
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
      },
    },
  });
}

function restoreWindow() {
  if (originalWindow === undefined) {
    Reflect.deleteProperty(globalThis, 'window');
  } else {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
  }
}

beforeEach(() => {
  setSanityDoc(null);
  installLocalStorage();
});

afterEach(restoreWindow);

describe('visitor comments', () => {
  it('queries only published, approved comments', async () => {
    const comments = [{ _id: 'c1', name: 'سارة', text: 'تعليق منشور', approved: true }];
    setSanityDoc(comments);

    expect(APPROVED_COMMENTS_QUERY).toContain('_type == "comment" && approved');
    expect(await getApprovedComments()).toEqual(comments);
  });

  it('keeps an intentionally empty Sanity result empty instead of showing seed comments', async () => {
    setSanityDoc([]);

    expect(await getApprovedComments()).toEqual([]);
  });

  it('uses local seed comments only when Sanity cannot be reached', async () => {
    setSanityError(new Error('offline'));

    expect(await getApprovedComments()).toEqual(APPROVED_COMMENTS);
  });

  it('creates an unapproved Sanity draft with trimmed values', async () => {
    enableSanityCommentWrites();

    const result = await submitComment('  سارة  ', '  وجبة ممتازة  ');

    expect(result).toEqual({ mode: 'sanity' });
    const [created] = getSanityCreatedComments() as Array<Record<string, unknown>>;
    expect(created._id).toMatch(/^drafts\.comment-/);
    expect(created).toMatchObject({
      _type: 'comment',
      name: 'سارة',
      text: 'وجبة ممتازة',
      approved: false,
    });
    expect(Date.parse(String(created.postedAt))).not.toBeNaN();
    expect(getPendingComments()).toEqual([]);
  });

  it('saves a single local pending entry when no write token is configured', async () => {
    const result = await submitComment('  أحمد  ', '  تعليق تجريبي  ');

    expect(result.mode).toBe('local');
    expect(getPendingComments()).toHaveLength(1);
    expect(getPendingComments()[0]).toMatchObject({ name: 'أحمد', text: 'تعليق تجريبي' });
    if (result.mode === 'local') expect(result.pending).toEqual(getPendingComments()[0]);
  });

  it('falls back to one local pending entry when Sanity rejects a write', async () => {
    enableSanityCommentWrites(new Error('permission denied'));

    const result = await submitComment('أحمد', 'تعليق تجريبي');

    expect(result.mode).toBe('local');
    expect(getPendingComments()).toHaveLength(1);
  });

  it('ignores malformed pending-comment storage instead of breaking the comments section', () => {
    storage.set('fitbite.pendingComments', '{"not":"a list"}');

    expect(getPendingComments()).toEqual([]);
  });

  it('removes duplicate local entries left by an earlier double-save bug', () => {
    const entry = {
      _id: 'pending-123',
      name: 'سارة',
      text: 'تعليق',
      sentAt: '2026-10-11T00:00:00.000Z',
    };
    storage.set('fitbite.pendingComments', JSON.stringify([entry, entry]));

    expect(getPendingComments()).toEqual([entry]);
  });

  it('rejects blank or overlong submissions before writing', async () => {
    await expect(submitComment('   ', 'نص')).rejects.toThrow('Invalid comment');
    await expect(submitComment('اسم', 'ن'.repeat(401))).rejects.toThrow('Invalid comment');
    expect(getSanityCreatedComments()).toEqual([]);
  });
});
