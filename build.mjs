import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: [
    './packages/core/src/index.ts'
  ],
  bundle: true,
  minify: true,
  format: 'cjs',
  outfile: './packages/core/lib/index.js',
  target: 'es2021'
});
await esbuild.build({
  entryPoints: [
    './packages/core/src/index.ts'
  ],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: './packages/core/lib/index.mjs',
  target: 'es2021'
});