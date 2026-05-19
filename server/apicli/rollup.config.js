import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

//const isProduction = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/main.ts',
  output: [
    {
      file: 'dist/api.es.js',
      format: 'esm'
    },
    {
      file: 'dist/api.min.js',
      format: 'iife',
      name: '$agentbrain',
      plugins: [terser()]
    }],
  plugins: [
    typescript(),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
  ],
};