import base from '../../apps/web/vitest.config'
import { resolve } from 'path'
export default {
  ...base,
  root: resolve(__dirname, '../..'),
  resolve: {
    ...base.resolve,
    alias: [
      { find: /^@pancakeswap\/uikit$/, replacement: resolve(__dirname, '../../packages/uikit/src/index.ts') },
      { find: '@pancakeswap/uikit/src', replacement: resolve(__dirname, '../../packages/uikit/src') },
      ...Object.entries(base.resolve.alias).map(([find, replacement]) => ({ find, replacement })),
    ],
  },
  test: {
    ...base.test,
    setupFiles: [resolve(__dirname, '../../apps/web/vitest.polyfill.js'), resolve(__dirname, '../../apps/web/vitest.setup.js')],
    cache: false,
  },
}
