import path from 'node:path';

const here = import.meta.dir;
export const OUT_DIR = path.join(here, '.out');

/** Bundles the harness for the browser, swapping framer-motion / next/link / Sanity for local stubs. */
export async function buildHarness(): Promise<void> {
  const result = await Bun.build({
    entrypoints: [path.join(here, 'harness.tsx')],
    outdir: OUT_DIR,
    target: 'browser',
    format: 'esm',
    jsx: { runtime: 'automatic' },
    define: {
      'process.env.NEXT_PUBLIC_BASE_PATH': '""',
      'process.env.NODE_ENV': '"development"',
    },
    plugins: [
      {
        name: 'stubs',
        setup(build) {
          build.onResolve({ filter: /^framer-motion$/ }, () => ({ path: path.join(here, 'stubs/framer-motion.tsx') }));
          build.onResolve({ filter: /^next\/link$/ }, () => ({ path: path.join(here, 'stubs/next-link.tsx') }));
          build.onResolve({ filter: /sanity\/client$/ }, () => ({ path: path.join(here, 'stubs/sanity-client.ts') }));
        },
      },
    ],
  });
  if (!result.success) throw new Error('harness build failed:\n' + result.logs.map(String).join('\n'));
}
