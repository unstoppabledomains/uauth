import {defineConfig} from 'tsup'

import {dependencies} from './package.json'

export default defineConfig({
  entry: ['src/UAuthWagmiConnector.ts', 'src/index.ts', 'src/version.ts'],
  external: [...Object.keys(dependencies)],
  splitting: false,
  sourcemap: true,
  clean: true,
  bundle: true,
  dts: true,
  target: 'es6',
})
