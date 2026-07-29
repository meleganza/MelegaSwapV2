/**
 * LIQUIDITY_MODULE_003_POOL_DISCOVERY — discovery, search, filters, logos, freezes.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import {
  LIQUIDITY_MODULE_001_002_FREEZE,
  LIQUIDITY_POOL_DISCOVERY_COPY,
  liquidityPoolDiscovery,
} from '../modules/liquidityPoolDiscoveryTokens'
import {
  buildAddLiquidityHref,
  factualFilters,
  factualSorts,
  filterDiscoveryCards,
  formatDiscoveryUsd,
  searchDiscoveryPairs,
  sortDiscoveryCards,
  toDiscoveryCard,
  type DiscoveryPoolCardModel,
} from '../modules/liquidityPoolDiscoveryModel'
import { LIQUIDITY_MODULE_PLAN } from '../liquidityArchitecture000Contracts'
import type { ClassifiedAmmPair } from 'lib/bsc-indexer/types'

const WEB = path.resolve(__dirname, '../../../../')
const STUDIO = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(STUDIO, rel), 'utf8')
}

function sha256File(filePath: string) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex')
}

const samplePair = (over: Partial<ClassifiedAmmPair> = {}): ClassifiedAmmPair => ({
  pairAddress: '0x7286c16c3c05d4c17b689be7948ec4fa4e861d1e',
  token0: '0x963556de33fc3786d1345968398639507f1a900e',
  token1: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  symbol0: 'MARCO',
  symbol1: 'WBNB',
  classification: 'tradeable',
  metadataStatus: 'partial',
  active: true,
  lastVerified: '2026-07-01T00:00:00.000Z',
  ...over,
})

describe('LIQUIDITY_MODULE_003 Pool Discovery', () => {
  it('keeps Module 001 Hero and Module 002 Actions frozen', () => {
    expect(sha256File(path.join(STUDIO, 'modules/LiquidityHeroModule.tsx'))).toBe(
      LIQUIDITY_MODULE_001_002_FREEZE.LiquidityHeroModule,
    )
    expect(sha256File(path.join(STUDIO, 'modules/LiquidityActionsModule.tsx'))).toBe(
      LIQUIDITY_MODULE_001_002_FREEZE.LiquidityActionsModule,
    )
    expect(sha256File(path.join(STUDIO, 'modules/liquidityActionsTokens.ts'))).toBe(
      LIQUIDITY_MODULE_001_002_FREEZE.liquidityActionsTokens,
    )
  })

  it('locks dense discovery geometry (5 cols desktop / 6 @1920 / gap 12)', () => {
    expect(liquidityPoolDiscovery.contentMax).toBe('1376px')
    expect(liquidityPoolDiscovery.headerH).toBe('48px')
    expect(liquidityPoolDiscovery.columnGap).toBe('12px')
    expect(liquidityPoolDiscovery.cardMinH).toBe('188px')
    expect(liquidityPoolDiscovery.cardPad).toBe('14px')
    expect(liquidityPoolDiscovery.ctaH).toBe('40px')
    expect(liquidityPoolDiscovery.desktopColumns).toBe(5)
    expect(liquidityPoolDiscovery.wideColumns).toBe(6)

    const mod = load('modules/LiquidityPoolDiscoveryModule.tsx')
    expect(mod).toContain('grid-template-columns: repeat(5, minmax(0, 1fr))')
    expect(mod).toContain('min-width: 1920px')
    expect(mod).toContain('repeat(3, minmax(0, 1fr))')
    expect(mod).toContain('repeat(2, minmax(0, 1fr))')
  })

  it('ships locked Explore Pools copy and empty / unavailable honesty', () => {
    expect(LIQUIDITY_POOL_DISCOVERY_COPY.title).toBe('Explore Pools')
    expect(LIQUIDITY_POOL_DISCOVERY_COPY.description).toBe(
      'Find liquidity pools available on Melega DEX.',
    )
    expect(LIQUIDITY_POOL_DISCOVERY_COPY.searchPlaceholder).toBe('Search token, pair or address')
    expect(LIQUIDITY_POOL_DISCOVERY_COPY.empty).toBe('No liquidity pools available.')
    expect(formatDiscoveryUsd(null)).toBe('—')
    expect(formatDiscoveryUsd(0)).toBe('—')
    expect(formatDiscoveryUsd(undefined)).toBe('—')
  })

  it('builds cards with factual metrics and Active/Empty status (not address-only titles)', () => {
    const live = toDiscoveryCard(samplePair(), { tvlUsd: 12000, volumeUsd: 500, feesUsd: 12 })
    expect(live?.pairName).toBe('MARCO / WBNB')
    expect(live?.status).toBe('Active')
    expect(live?.tvlLabel).toBe('$12.0K')
    expect(live?.addHref).toContain('/add/')
    expect(live?.qualityScore).toBeGreaterThan(0)

    const dead = toDiscoveryCard(
      samplePair({ active: false, classification: 'inactive', lastVerified: undefined }),
      {},
    )
    expect(dead?.status).toBe('Empty')
    expect(dead?.tvlLabel).toBe('—')
    expect(dead?.volumeLabel).toBe('—')
    expect(dead?.feesLabel).toBe('—')

    expect(toDiscoveryCard(samplePair({ classification: 'invalid_contract', token0: undefined }))).toBeNull()
  })

  it('supports search, factual filters, and factual sorts', () => {
    const pairs = [
      samplePair(),
      samplePair({
        pairAddress: '0x1111111111111111111111111111111111111111',
        symbol0: 'AAA',
        symbol1: 'BNB',
        token0: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        classification: 'inactive',
        active: false,
        lastVerified: undefined,
      }),
    ]
    expect(searchDiscoveryPairs(pairs, 'marco')).toHaveLength(1)
    expect(searchDiscoveryPairs(pairs, '0x7286')).toHaveLength(1)

    const cards = pairs
      .map((p) => toDiscoveryCard(p, p.symbol0 === 'MARCO' ? { tvlUsd: 100, volumeUsd: 50 } : {}))
      .filter(Boolean) as DiscoveryPoolCardModel[]

    expect(factualFilters(cards, false)).toEqual(['all', 'popular', 'newest'])
    expect(factualFilters(cards, true)).toContain('my-tokens')
    expect(factualSorts(cards)).toEqual(expect.arrayContaining(['market', 'tvl', 'volume', 'newest']))

    const popular = filterDiscoveryCards(cards, 'popular', new Set())
    expect(popular.every((c) => c.classification === 'tradeable')).toBe(true)

    const mine = filterDiscoveryCards(
      cards,
      'my-tokens',
      new Set([samplePair().token0!.toLowerCase()]),
    )
    expect(mine.length).toBeGreaterThanOrEqual(1)

    const byTvl = sortDiscoveryCards(
      [
        { ...cards[0], tvlUsd: 10, volumeUsd: 1 },
        { ...cards[0], id: 'b', pairName: 'B / C', tvlUsd: 99, volumeUsd: 2 },
      ],
      'tvl',
    )
    expect(byTvl[0].tvlUsd).toBe(99)
  })

  it('uses address-based logo resolver and /add CTA without execution', () => {
    expect(buildAddLiquidityHref('0xaaa', '0xbbb')).toBe('/add')
    const t0 = '0x963556de33fc3786d1345968398639507f1a900e'
    const t1 = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
    expect(t0).toHaveLength(42)
    expect(t1).toHaveLength(42)
    expect(buildAddLiquidityHref(t0, t1)).toBe(`/add/${t0}/${t1}`)

    const card = load('modules/LiquidityPoolDiscoveryCard.tsx')
    expect(card).toContain('MelegaTokenAvatar')
    expect(card).toContain('address={card.token0}')
    expect(card).toContain('address={card.token1}')
    expect(card).toContain('chainId={liquidityPoolDiscovery.chainId}')
    expect(card).not.toContain('getTokenLogoURL(')

    const hook = load('modules/useLiquidityPoolDiscovery.ts')
    expect(hook).toContain('useMelegaFactoryPools')
    expect(hook).toContain('usePoolDatasSWR')
    expect(hook).not.toContain('approve')
    expect(hook).not.toContain('addLiquidity')
    expect(hook).not.toContain('useLiquidityMintRuntime')
  })

  it('mounts Module 003 (Explore) at the bottom after Insights', () => {
    const page = readFileSync(path.join(WEB, 'src/pages/liquidity.tsx'), 'utf8')
    expect(page).toContain('LiquidityPoolDiscoveryModule')
    expect(page).toContain('data-liquidity-legacy-body="archived"')
    expect(page).toContain('data-liquidity-module-003="mounted"')
    const hero = page.indexOf('<LiquidityHeroModule')
    const actions = page.indexOf('<LiquidityActionsModule')
    const insights = page.indexOf('<LiquidityInsightsModule')
    const discovery = page.indexOf('<LiquidityPoolDiscoveryModule')
    expect(hero).toBeLessThan(actions)
    expect(actions).toBeLessThan(insights)
    expect(insights).toBeLessThan(discovery)
  })

  it('does not invent pool databases or fake metric literals in module sources', () => {
    const bundle = [
      load('modules/LiquidityPoolDiscoveryModule.tsx'),
      load('modules/LiquidityPoolDiscoveryCard.tsx'),
      load('modules/useLiquidityPoolDiscovery.ts'),
      load('modules/liquidityPoolDiscoveryModel.ts'),
      load('modules/liquidityPoolDiscoveryTokens.ts'),
    ].join('\n')
    expect(bundle).not.toMatch(/\$24\.56M|\$1\.2B|fake TVL/i)
    expect(bundle).not.toContain('new pool database')
    expect(bundle).toContain('factory')
  })

  it('records ownership, plan certification, and evidence artifacts', () => {
    const map = readFileSync(path.join(WEB, 'docs/runtime/LIQUIDITY_MODULE_OWNERSHIP_MAP.md'), 'utf8')
    expect(map).toContain('LiquidityPoolDiscoveryModule.tsx')
    expect(map).toContain('liquidity-module-003-pool-discovery')
    expect(LIQUIDITY_MODULE_PLAN.find((m) => m.id === '003-pool-discovery')?.phase).toBe(
      'certified-by-this-mission',
    )

    const evidence = path.join(WEB, 'docs/runtime/liquidity-module-003-pool-discovery')
    expect(existsSync(evidence)).toBe(true)
    expect(existsSync(path.join(WEB, 'docs/runtime/LIQUIDITY_MODULE_003_POOL_DISCOVERY_REPORT.md'))).toBe(
      true,
    )
    expect(existsSync(path.join(evidence, 'test-summary.json'))).toBe(true)
    expect(existsSync(path.join(evidence, 'geometry-evidence.json'))).toBe(true)
  })
})
