import { createElement, type ReactNode } from 'react';
export default function Link({ href, children, ...rest }: { href: string; children?: ReactNode }) {
  return createElement('a', { href, ...rest }, children);
}
