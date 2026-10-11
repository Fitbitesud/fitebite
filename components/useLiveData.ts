'use client';

import { useEffect, useState } from 'react';
import { getApprovedComments, type SiteComment } from '@/lib/comments';
import { getMenu } from '@/lib/menu';
import { getReadyPackages, type ReadyPackage } from '@/lib/subscriptions';
import type { MenuData } from '@/lib/types';

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
