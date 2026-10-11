import { beforeEach, describe, expect, it } from 'bun:test';
import { getApprovedComments } from '../lib/comments';
import { getMenu } from '../lib/menu';
import { getReadClient } from '../lib/sanity/client';
import { getReadyPackages } from '../lib/subscriptions';
import { getSite } from '../lib/site-data';
import { getSanityReadModes, setSanityDoc } from './helpers';

beforeEach(() => setSanityDoc({ nameAr: 'فيتبايت' }));

describe('Sanity read freshness', () => {
  it('uses direct, fresh reads for live dashboard data', async () => {
    await Promise.all([
      getSite({ fresh: true }),
      getMenu({ fresh: true }),
      getReadyPackages({ fresh: true }),
      getApprovedComments({ fresh: true }),
    ]);

    expect(getSanityReadModes()).toEqual([true, true, true, true]);
  });

  it('keeps the CDN-backed read as the default for static builds', async () => {
    await getReadClient().fetch('static build query');

    expect(getSanityReadModes()).toEqual([false]);
  });
});
