'use client';

import { useEffect, useState } from 'react';
import { getApprovedComments, type SiteComment } from '@/lib/comments';
import { getMenu } from '@/lib/menu';
import { getReadyPackages, type ReadyPackage } from '@/lib/subscriptions';
import type { MenuData } from '@/lib/types';

/**
 * جلب حيّ من Sanity في المتصفح بعد أول رسم — بحيث أي Publish من لوحة التحكم
 * يظهر في الموقع بمجرد تحديث الصفحة (وبدون إعادة بناء)، لأن Sanity CDN يُحدَّث
 * خلال ثوانٍ من النشر. بدون Sanity تُعاد القيم الأولية كما هي.
 */

export function useLiveMenu(initial: MenuData): MenuData {
  const [data, setData] = useState(initial);
  useEffect(() => {
    let alive = true;
    getMenu()
      .then((d) => alive && setData(d))
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
    getReadyPackages()
      .then((d) => alive && setData(d))
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
    getApprovedComments()
      .then((d) => alive && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return data;
}
