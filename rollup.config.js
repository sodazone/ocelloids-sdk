import pluginTypescript from '@rollup/plugin-typescript';
import pluginCommonjs from '@rollup/plugin-commonjs';
import pluginDynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import { nodeResolve as pluginResolve } from '@rollup/plugin-node-resolve';
import pluginTerser from '@rollup/plugin-terser';

export default [
  {
    input: 'packages/core/src/index.ts',
    output: {
      name: 'ocelloids',
      dir: 'dist/core/',
      format: 'umd',
      generatedCode: {
        constBindings: true
      },
      inlineDynamicImports: true,
      sourcemap: true
    },
    plugins: [
      pluginTypescript({ compilerOptions: {
        outDir: 'dist/core/types'
      } }),
      pluginCommonjs(),
      pluginDynamicImportVars(),
      pluginResolve({ browser: true }),
      pluginTerser()
    ]
  }
];