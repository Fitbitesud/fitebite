/** Minimal stand-in for framer-motion: renders plain elements, no animation. */
import { createElement, forwardRef, Fragment, type ReactNode } from 'react';

export const AnimatePresence = ({ children }: { children?: ReactNode }) =>
  createElement(Fragment, null, children);

const ANIMATION_PROPS = [
  'initial', 'animate', 'exit', 'transition', 'layout', 'layoutId', 'whileHover',
  'whileTap', 'whileInView', 'whileFocus', 'viewport', 'variants', 'custom',
];

export const motion: any = new Proxy(
  {},
  {
    get: (_t, tag: string) =>
      forwardRef((props: Record<string, unknown>, ref) => {
        const clean: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(props)) if (!ANIMATION_PROPS.includes(k)) clean[k] = v;
        return createElement(tag, { ...clean, ref });
      }),
  },
);
