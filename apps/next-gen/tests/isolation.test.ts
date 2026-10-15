import assert from 'assert'
import { readdirSync, readFileSync, statSync } from 'fs'
import path from 'path'
import { test } from 'node:test'

const root = process.cwd()

const SOURCE_DIRS = ['pages', 'components', 'modules', 'lib', 'styles']

const FORBIDDEN = [
  /@pancakeswap/,
  /\bwagmi\b/,
  /\bethers\b/,
  /\bswr\b/,
  /setInterval\s*\(/,
  /setTimeout\s*\(/,
  /\bfetch\s*\(/,
  /WebSocket/,
  /eth_call/,
  /eth_chainId/,
  /\/api\/indexer/,
  /masterchef/i,
  /sendTransaction/,
  /window\.ethereum/,
  /styled-components/,
  /react-redux/,
]

function filesIn(dir: string): string[] {
  const absolute = path.join(root, dir)
  return readdirSync(absolute).flatMap((entry: string) => {
    const full = path.join(absolute, entry)
    if (statSync(full).isDirectory()) return filesIn(path.relative(root, full))
    return [full]
  })
}

const QUOTE_EXCEPTIONS = new Set([
  path.join(root, 'lib/bscQuoteRpc.ts'),
  path.join(root, 'modules/trade/BnbQuotePreview.tsx'),
  path.join(root, 'lib/portfolioRpc.ts'),
  path.join(root, 'modules/portfolio/PortfolioLookup.tsx'),
  path.join(root, 'lib/earnRpc.ts'),
  path.join(root, 'modules/earn/EarnRead.tsx'),
  path.join(root, 'lib/earnCatalogRpc.ts'),
  path.join(root, 'modules/earn/EarnCatalog.tsx'),
  path.join(root, 'lib/earnPositionsRpc.ts'),
  path.join(root, 'modules/earn/EarnPositions.tsx'),
  path.join(root, 'pages/api/trend-boost-active.ts'),
  path.join(root, 'lib/shadowReadinessRpc.ts'),
  path.join(root, 'modules/trade/ShadowReadiness.tsx'),
  path.join(root, 'modules/trade/BnbWalletPrepare.tsx'),
  path.join(root, 'lib/sealedPrepare.ts'),
])

test('beta source does not import the live DEX stack or open a network client', () => {
  const files = [
    ...SOURCE_DIRS.flatMap((dir) => filesIn(dir)),
    path.join(root, 'middleware.ts'),
    path.join(root, 'next.config.mjs'),
  ]
  files.forEach((file) => {
    const source = readFileSync(file, 'utf8')
    const patterns = (QUOTE_EXCEPTIONS.has(file)
      ? FORBIDDEN.filter((pattern) => pattern.source !== '\\bfetch\\s*\\(' && pattern.source !== 'eth_call' && pattern.source !== 'eth_chainId')
      : FORBIDDEN
    ).filter((pattern) => file !== path.join(root, 'modules/trade/BnbWalletPrepare.tsx') || pattern.source !== 'window\\.ethereum')
    patterns.forEach((pattern) => {
      assert.equal(pattern.test(source), false, `${path.relative(root, file)} matched ${pattern}`)
    })
  })
  const preview = readFileSync(path.join(root, 'modules/trade/BnbQuotePreview.tsx'), 'utf8')
  assert.match(preview, /fetch\('\/api\/quote'/)
  const rpc = readFileSync(path.join(root, 'lib/bscQuoteRpc.ts'), 'utf8')
  assert.equal(rpc.includes('eth_getLogs'), false)
  assert.equal(rpc.includes('eth_sendRawTransaction'), false)
  assert.equal(rpc.includes('sendTransaction'), false)
  const shadowRpc = readFileSync(path.join(root, 'lib/shadowReadinessRpc.ts'), 'utf8')
  assert.equal(shadowRpc.includes('eth_sendRawTransaction'), false)
  assert.equal(shadowRpc.includes('eth_estimateGas'), false)
  assert.equal(shadowRpc.includes('sendTransaction'), false)
  assert.equal(shadowRpc.includes('@ethersproject'), false)
  assert.match(readFileSync(path.join(root, 'modules/trade/ShadowReadiness.tsx'), 'utf8'), /fetch\('\/api\/shadow-readiness'/)
  const wallet = readFileSync(path.join(root, 'modules/trade/BnbWalletPrepare.tsx'), 'utf8')
  assert.equal(wallet.includes('eth_sendRawTransaction'), false)
  assert.equal(wallet.includes('eth_sign'), false)
  assert.equal(wallet.includes('personal_sign'), false)
  assert.match(wallet, /eth_requestAccounts/)
  assert.match(wallet, /eth_chainId/)
  const home = readFileSync(path.join(root, 'pages/index.tsx'), 'utf8')
  assert.equal(home.includes('modules/tools'), false)
  assert.equal(home.includes('modules/portfolio'), false)
  assert.equal(home.includes('modules/earn'), false)
  assert.equal(home.includes('/api/earn'), false)
  assert.equal(home.includes('/api/earn-catalog'), false)
  assert.equal(home.includes('apps/web'), false)
  const lookup = readFileSync(path.join(root, 'modules/portfolio/PortfolioLookup.tsx'), 'utf8')
  assert.match(lookup, /fetch\('\/api\/portfolio'/)
  assert.equal(lookup.includes('window.ethereum'), false)
  const shellSource = readFileSync(path.join(root, 'components/BetaShell.tsx'), 'utf8')
  assert.equal(shellSource.includes('TrendBoostStrip'), false)
  assert.equal(shellSource.includes('/api/trend-boost-active'), false)
  assert.equal(shellSource.includes('useEffect'), false)
  const boostApi = readFileSync(path.join(root, 'pages/api/trend-boost-active.ts'), 'utf8')
  assert.match(boostApi, /\/api\/trend-boost\/active/)
  assert.equal(boostApi.includes('POST'), false)
})

test('beta host has no cron and production indexer crons stay on the live config', () => {
  const beta = JSON.parse(readFileSync(path.join(root, 'vercel.json'), 'utf8')) as { crons?: unknown }
  assert.equal(beta.crons, undefined)
  assert.equal(JSON.stringify(beta).includes('indexer'), false)

  const liveCronPaths = ['/api/indexer/run/', '/api/indexer/registry/refresh/']
  const rootVercel = JSON.parse(readFileSync(path.resolve(root, '../../vercel.json'), 'utf8')) as {
    crons: Array<{ path: string }>
  }
  const webVercel = JSON.parse(readFileSync(path.resolve(root, '../web/vercel.json'), 'utf8')) as {
    crons: Array<{ path: string }>
  }
  assert.deepEqual(
    rootVercel.crons.map((cron) => cron.path),
    liveCronPaths,
  )
  assert.deepEqual(
    webVercel.crons.map((cron) => cron.path),
    liveCronPaths,
  )
})

test('the example env does not carry a secret', () => {
  const example = readFileSync(path.join(root, '.env.example'), 'utf8')
  assert.equal(example.includes('BETA_ACCESS_TOKEN'), false)
  assert.equal(example.includes('NEXT_PUBLIC_'), false)
})
