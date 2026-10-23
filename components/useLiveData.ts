'use client';

import { useEffect, useState } from 'react';
import { getApprovedComments, type SiteComment } from '@/lib/comments';
import { getFaqs, type FaqItem } from '@/lib/faq';
import { getGalleryItems, type GalleryItem } from '@/lib/gallery';
import { getMenu } from '@/lib/menu';
import { getOffers, type Offer } from '@/lib/offers';
import { getReadyPackages, type ReadyPackage } from '@/lib/subscriptions';
import type { MenuData } from '@/lib/types';
import { getVideos, type HomeVideo } from '@/lib/videos';

/**
 * جلب حيّ من Sanity في المتصفح بعد أول رسم. نقرأ مباشرة من API بدون CDN حتى
 * لا ننتظر تأخر تحديث الكاش بعد Publish؛ تظهر التعديلات عند تحديث الصفحة بلا إعادة
 * بناء. بدون Sanity تُعاد القيم الأولية كما هي.
 */

export function useLiveMenu(initial: MenuData): MenuData {
  const [data, setData] = useState(initial);
  useEffect(() => {
    let alive = true;
    getMenu({ fresh: true })
      .then((d) => alive && d && Array.isArray(d.categories) && Array.isArray(d.items) && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return data;
}

export function useLivePackages(initial: ReadyPackage[]): ReadyPackage[] {
  const [data, setData] = useState(initial);
  useEffect(() => {
    let alive = true;
    getReadyPackages({ fresh: true })
      .then((d) => alive && Array.isArray(d) && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return data;
}

export function useLiveOffers(initial: Offer[]): Offer[] {
  const [data, setData] = useState(initial);
  useEffect(() => {
    let alive = true;
    getOffers({ fresh: true })
      .then((d) => alive && Array.isArray(d) && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return data;
}

export function useLiveComments(initial: SiteComment[]): SiteComment[] {
  const [data, setData] = useState(initial);
  useEffect(() => {
    let alive = true;
    getApprovedComments({ fresh: true })
      .then((d) => alive && Array.isArray(d) && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return data;
}

export function useLiveVideos(initial: HomeVideo[]): HomeVideo[] {
  const [data, setData] = useState(initial);
  useEffect(() => {
    let alive = true;
    getVideos({ fresh: true })
      .then((d) => alive && Array.isArray(d) && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return data;
}

export function useLiveFaqs(initial: FaqItem[]): FaqItem[] {
  const [data, setData] = useState(initial);
  useEffect(() => {
    let alive = true;
    getFaqs({ fresh: true })
      .then((d) => alive && Array.isArray(d) && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return data;
}

export function useLiveGallery(initial: GalleryItem[]): GalleryItem[] {
  const [data, setData] = useState(initial);
  useEffect(() => {
    let alive = true;
    getGalleryItems({ fresh: true })
      .then((d) => alive && Array.isArray(d) && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return data;
}
