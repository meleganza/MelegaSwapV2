import { defineConfig } from 'vitest/config'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'

const r = (p: string) => resolve(__dirname, p)

export default defineConfig({
  // @ts-ignore
  plugins: [tsconfigPaths(), react(), vanillaExtractPlugin()],
  resolve: {
    alias: {
      'react-dom/client': r('node_modules/react-dom/client.js'),
      '@pancakeswap/wagmi/connectors/binanceWallet': r('../../packages/wagmi/connectors/binanceWallet/index.ts'),
      '@pancakeswap/wagmi/connectors/blocto': r('../../packages/wagmi/connectors/blocto/index.ts'),
      '@pancakeswap/wagmi/connectors/miniProgram': r('../../packages/wagmi/connectors/miniProgram/index.ts'),
      '@pancakeswap/wagmi/connectors/trustWallet': r('../../packages/wagmi/connectors/trustWallet/index.ts'),
      // Worktree + symlinked node_modules: vite-tsconfig-paths intermittently drops baseUrl maps.
      hooks: r('src/hooks'),
      config: r('src/config'),
      components: r('src/components'),
      utils: r('src/utils'),
      state: r('src/state'),
      views: r('src/views'),
      lib: r('src/lib'),
      registry: r('src/registry'),
      contexts: r('src/contexts'),
      'design-system': r('src/design-system'),
      'app-shell': r('src/app-shell'),
    },
  },
  test: {
    setupFiles: ['./vitest.setup.js'],
    environment: 'jsdom',
    globals: true,
    exclude: ['src/config/__tests__'],
    deps: {
      inline: ['@testing-library/react', 'react-dom'],
    },
  },
})
