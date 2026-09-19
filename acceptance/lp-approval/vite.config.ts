import { defineConfig } from 'vite'
import { resolve } from 'path'
const repo = resolve(__dirname, '../..')
const mocked =
  /^(wagmi|@pancakeswap\/localization|@pancakeswap\/uikit|next\/router|hooks\/(useActiveChainId|useSwitchNetwork|Tokens|usePairs)|state\/(mint\/hooks|burn\/hooks|user\/hooks|swap\/useLPApr)|utils\/transactionErrorToUserReadableMessage)$/
const endings =
  /(^|\/)(useContract|useCallWithGasPrice|useLiquidityPositions|buildLiquidityWalletPortfolio|LiquidityRuntimeContext|ChainSwitchConfirmDialog)$/
export default defineConfig({
  root: __dirname,
  publicDir: resolve(repo, 'apps/web/public'),
  plugins: [
    {
      name: 'local-wallet-fixture',
      enforce: 'pre',
      resolveId(id) {
        id = id.replace(resolve(repo, 'apps/web/src') + '/', '')
        if (
          mocked.test(id) ||
          endings.test(id) ||
          /state\/(transactions|multicall)\/hooks$/.test(id) ||
          /utils\/(exchange|sentry)$/.test(id) ||
          id === 'utils' ||
          id === '../utils' ||
          id === 'lib/routing-layer/facade'
        )
          return resolve(__dirname, 'mocks.tsx')
        if (/useNativeCurrency$/.test(id)) return resolve(__dirname, 'native.ts')
        if (/useTransactionDeadline$/.test(id)) return resolve(__dirname, 'deadline.ts')
        if (/useLiquidityTerminalData$/.test(id)) return resolve(__dirname, 'terminal.ts')
        if (/SettingsModal$|LiquidityAddConfirmModal$/.test(id)) return resolve(__dirname, 'empty.tsx')
        if (id === 'design-system/melega')
          return resolve(repo, 'apps/web/src/design-system/melega/components/Modal/index.ts')
      },
    },
  ],
  resolve: {
    alias: [
      'hooks',
      'config',
      'utils',
      'state',
      'views',
      'lib',
      'design-system',
      'components',
      'registry',
      'contexts',
    ].map((x) => ({ find: x, replacement: resolve(repo, 'apps/web/src', x) })),
  },
  define: { 'process.env': {} },
  server: { host: '127.0.0.1', port: 4180, strictPort: true, fs: { allow: [repo] } },
})
