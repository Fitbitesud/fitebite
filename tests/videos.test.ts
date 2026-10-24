import { beforeEach, describe, expect, it } from 'bun:test';
import {
  DEFAULT_VIDEOS,
  extractVimeoId,
  extractYouTubeId,
  getVideos,
  isDirectVideoUrl,
  resolveVideoPlayback,
} from '../lib/videos';
import { setSanityDoc, setSanityError } from './helpers';

beforeEach(() => setSanityDoc(null));

describe('home videos — three consecutive boxes after hero', () => {
  it('provides three active default video boxes out of the box with unique ids', async () => {
    expect(DEFAULT_VIDEOS).toHaveLength(3);
    const ids = new Set(DEFAULT_VIDEOS.map((v) => v.id));
    expect(ids.size).toBe(3);
    expect(await getVideos()).toEqual(DEFAULT_VIDEOS);
  });

  it('falls back to local videos when Sanity returns empty list or errors', async () => {
    setSanityDoc([]);
    expect(await getVideos()).toEqual(DEFAULT_VIDEOS);

    setSanityError(new Error('network down'));
    expect(await getVideos()).toEqual(DEFAULT_VIDEOS);
  });

  it('reads published videos from Sanity sorted by order and filters inactive ones', async () => {
    setSanityDoc([
      {
        _id: 'v-2',
        title: 'فيديو التغليف',
        badge: 'تجهيز',
        desc: 'وصف',
        videoFileUrl: 'https://cdn.sanity.io/files/zes52trp/production/clip2.mp4',
        poster: 'https://cdn.sanity.io/images/zes52trp/production/p2.jpg',
        active: true,
        order: 2,
      },
      {
        _id: 'v-1',
        title: 'فيديو الشواء',
        videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
        active: true,
        order: 1,
      },
      {
        _id: 'v-hidden',
        title: 'فيديو مخفي',
        active: false,
        order: 0,
      },
    ]);

    const videos = await getVideos();
    expect(videos).toHaveLength(2);
    expect(videos.map((v) => v.id)).toEqual(['v-1', 'v-2']);
    // YouTube video without uploaded poster receives automatic thumbnail
    expect(videos[0].poster).toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
    expect(videos[1].videoFileUrl).toContain('clip2.mp4');
  });

  it('returns an intentionally empty array when published videos are all deactivated', async () => {
    setSanityDoc([{ _id: 'v-off', title: 'موقوف', active: false }]);
    expect(await getVideos()).toEqual([]);
  });

  it('resolves uploaded Sanity files, direct MP4 links, YouTube/Shorts, Vimeo, and preview scenes', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=abc123DEF_-')).toBe('abc123DEF_-');
    expect(extractYouTubeId('https://www.youtube.com/shorts/xyz987UVW_1')).toBe('xyz987UVW_1');
    expect(extractYouTubeId('https://youtu.be/abc123DEF_-')).toBe('abc123DEF_-');
    expect(extractVimeoId('https://vimeo.com/123456789')).toBe('123456789');
    expect(isDirectVideoUrl('https://example.com/kitchen.mp4')).toBe(true);
    expect(isDirectVideoUrl('https://cdn.sanity.io/files/proj/prod/abc.mov')).toBe(true);

    expect(
      resolveVideoPlayback({
        id: '1',
        title: 'ملف مرفوع',
        desc: '',
        videoFileUrl: 'https://cdn.sanity.io/files/p/d/v.mp4',
        poster: '/images/hero-bowl.jpg',
        active: true,
      }),
    ).toEqual({ kind: 'file', src: 'https://cdn.sanity.io/files/p/d/v.mp4' });

    expect(
      resolveVideoPlayback({
        id: '2',
        title: 'يوتيوب',
        desc: '',
        videoUrl: 'https://youtube.com/shorts/abc123DEF_-',
        poster: '/images/hero-bowl.jpg',
        active: true,
      }),
    ).toEqual({
      kind: 'embed',
      embedUrl:
        'https://www.youtube.com/embed/abc123DEF_-?autoplay=1&mute=1&loop=1&playlist=abc123DEF_-&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3',
    });

    const vimeo = resolveVideoPlayback({
      id: '3',
      title: 'فيميو',
      desc: '',
      videoUrl: 'https://vimeo.com/123456789',
      poster: '/images/hero-bowl.jpg',
      active: true,
    });
    expect(vimeo.kind).toBe('embed');
    if (vimeo.kind === 'embed') {
      expect(vimeo.embedUrl).toContain('autoplay=1');
      expect(vimeo.embedUrl).toContain('loop=1');
      expect(vimeo.embedUrl).toContain('background=1');
    }

    const preview = resolveVideoPlayback(DEFAULT_VIDEOS[0]);
    expect(preview.kind).toBe('preview');
  });

  it('روابط التضمين تُخفي أدوات التحكم وتعمل تلقائياً وتتكرر', () => {
    const yt = resolveVideoPlayback({
      id: 'yt',
      title: 'شورت',
      desc: '',
      videoUrl: 'https://www.youtube.com/shorts/abc123DEF_-',
      poster: '/images/hero-bowl.jpg',
      active: true,
    });
    expect(yt.kind).toBe('embed');
    if (yt.kind !== 'embed') return;
    for (const param of [
      'autoplay=1',
      'mute=1',
      'controls=0',
      'disablekb=1',
      'fs=0',
      'loop=1',
      'playlist=abc123DEF_-',
      'playsinline=1',
    ]) {
      expect(yt.embedUrl).toContain(param);
    }
  });
});
