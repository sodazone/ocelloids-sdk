import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: [
    './packages/core/src/index.ts'
  ],
  bundle: true,
  minify: true,
  //sourcemap: true,
  outfile: './packages/core/lib/browser.js',
  target: 'es2021'
});
await esbuild.build({
  entryPoints: [
    './packages/core/src/index.ts'
  ],
  bundle: true,
  platform: 'node',
  packages: 'external',
  outfile: './packages/core/lib/index.js',
  target: 'es2021'
});