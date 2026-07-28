/**
 * LIQUIDITY_MODULE_007_ANALYTICS — metrics, unavailable, freezes, responsive.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import {
  LIQUIDITY_ANALYTICS_COPY,
  LIQUIDITY_MODULE_001_006_FREEZE,
  liquidityAnalytics,
} from '../modules/liquidityAnalyticsTokens'
import {
  buildLiquidityAnalytics,
  countMintBurnActivity,
  countPoolDistribution,
  formatAnalyticsUsd,
  formatLiquidityChange,
} from '../modules/buildLiquidityAnalytics'
import { LIQUIDITY_MODULE_PLAN } from '../liquidityArchitecture000Contracts'
import { TransactionType, type Transaction } from 'state/info/types'
import type { ClassifiedAmmPair } from 'lib/bsc-indexer/types'

const WEB = path.resolve(__dirname, '../../../../')
const STUDIO = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(STUDIO, rel), 'utf8')
}

function sha256File(filePath: string) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex')
}

const pair = (over: Partial<ClassifiedAmmPair> = {}): ClassifiedAmmPair => ({
  pairAddress: '0x7286c16c3c05d4c17b689be7948ec4fa4e861d1e',
  token0: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
  token1: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  classification: 'tradeable',
  metadataStatus: 'partial',
  active: true,
  ...over,
})

const tx = (type: TransactionType, hash: string): Transaction =>
  ({
    type,
    hash,
    timestamp: '1700000000',
    sender: '0x1',
    token0Symbol: 'MARCO',
    token1Symbol: 'BNB',
    token0Address: '0xa',
    token1Address: '0xb',
    amountUSD: 100,
    amountToken0: 1,
    amountToken1: 2,
  } as Transaction)

describe('LIQUIDITY_MODULE_007 Analytics', () => {
  it('keeps Modules 001–006 frozen', () => {
    expect(sha256File(path.join(STUDIO, 'modules/LiquidityHeroModule.tsx'))).toBe(
      LIQUIDITY_MODULE_001_006_FREEZE.LiquidityHeroModule,
    )
    expect(sha256File(path.join(STUDIO, 'modules/LiquidityActionsModule.tsx'))).toBe(
      LIQUIDITY_MODULE_001_006_FREEZE.LiquidityActionsModule,
    )
    expect(sha256File(path.join(STUDIO, 'modules/LiquidityPoolDiscoveryModule.tsx'))).toBe(
      LIQUIDITY_MODULE_001_006_FREEZE.LiquidityPoolDiscoveryModule,
    )
    expect(sha256File(path.join(STUDIO, 'modules/LiquidityAddModule.tsx'))).toBe(
      LIQUIDITY_MODULE_001_006_FREEZE.LiquidityAddModule,
    )
    expect(sha256File(path.join(STUDIO, 'modules/LiquidityMarketSnapshotModule.tsx'))).toBe(
      LIQUIDITY_MODULE_001_006_FREEZE.LiquidityMarketSnapshotModule,
    )
    expect(sha256File(path.join(STUDIO, 'modules/LiquidityMyPositionsModule.tsx'))).toBe(
      LIQUIDITY_MODULE_001_006_FREEZE.LiquidityMyPositionsModule,
    )
  })

  it('locks geometry 1376×240 / 4×329 / gap 20', () => {
    expect(liquidityAnalytics.contentMax).toBe('1376px')
    expect(liquidityAnalytics.moduleH).toBe('240px')
    expect(liquidityAnalytics.columnGap).toBe('20px')
    expect(liquidityAnalytics.cardW).toBe('329px')
    const row =
      parseInt(liquidityAnalytics.cardW, 10) * 4 + parseInt(liquidityAnalytics.columnGap, 10) * 3
    expect(row).toBe(1376)

    const mod = load('modules/LiquidityAnalyticsModule.tsx')
    expect(mod).toContain('repeat(4, minmax(0, 1fr))')
    expect(mod).toContain('repeat(2, minmax(0, 1fr))')
    expect(mod).toContain('grid-template-columns: 1fr')
    expect(mod).toContain('data-liquidity-analytics-geometry="1376x240"')
  })

  it('formats factual metrics; never invents zeros as real liquidity', () => {
    expect(formatAnalyticsUsd(null)).toBeNull()
    expect(formatAnalyticsUsd(0)).toBeNull()
    expect(formatAnalyticsUsd(12500)).toBe('$12.5K')
    expect(formatLiquidityChange(null)).toBeNull()
    expect(formatLiquidityChange(2.5)).toBe('+2.50% 24H')
    expect(formatLiquidityChange(-1.25)).toBe('-1.25% 24H')

    const ready = buildLiquidityAnalytics({
      protocolLoading: false,
      protocol: { liquidityUSD: 1_250_000, liquidityUSDChange: 3.1 },
      factoryLoading: false,
      factoryReady: true,
      factoryUnavailable: false,
      pools: [
        pair({ classification: 'tradeable' }),
        pair({ pairAddress: '0x2', classification: 'liquidity_present' }),
        pair({ pairAddress: '0x3', classification: 'inactive', active: false }),
      ],
      activityLoading: false,
      activityReady: true,
      activityUnavailable: false,
      transactions: [tx(TransactionType.MINT, '0xm'), tx(TransactionType.BURN, '0xb'), tx(TransactionType.SWAP, '0xs')],
      nowIso: '2026-07-27T00:00:00.000Z',
    })

    expect(ready.phase).toBe('partial') // providers always unavailable
    const byId = Object.fromEntries(ready.cards.map((c) => [c.id, c]))
    expect(byId.growth.value).toBe('$1.25M')
    expect(byId.growth.supporting).toBe('+3.10% 24H')
    expect(byId.growth.status).toBe('ok')
    expect(byId.distribution.value).toBe('2')
    expect(byId.distribution.supporting).toContain('Tradeable 1')
    expect(byId.distribution.supporting).toContain('Funded 1')
    expect(byId.distribution.supporting).not.toMatch(/%/)
    expect(byId.activity.value).toBe('2')
    expect(byId.activity.supporting).toBe('1 adds · 1 removes')
    expect(byId.providers.value).toBe('—')
    expect(byId.providers.supporting).toBe(LIQUIDITY_ANALYTICS_COPY.cards.providers.unavailableExplain)
  })

  it('marks unavailable / partial honestly and never uses Awaiting Indexer', () => {
    const unavailable = buildLiquidityAnalytics({
      protocolLoading: false,
      protocol: null,
      factoryLoading: false,
      factoryReady: false,
      factoryUnavailable: true,
      pools: [],
      activityLoading: false,
      activityReady: false,
      activityUnavailable: true,
      transactions: null,
    })
    expect(unavailable.phase).toBe('unavailable')
    for (const card of unavailable.cards) {
      expect(card.value === '—' || card.state === 'unavailable').toBe(true)
      expect(card.supporting).not.toMatch(/Awaiting Indexer/i)
    }

    const partial = buildLiquidityAnalytics({
      protocolLoading: false,
      protocol: { liquidityUSD: 5000 },
      factoryLoading: false,
      factoryReady: false,
      factoryUnavailable: true,
      pools: [],
      activityLoading: false,
      activityReady: false,
      activityUnavailable: true,
      transactions: null,
    })
    expect(partial.phase).toBe('partial')

    const mod = load('modules/LiquidityAnalyticsModule.tsx')
    const tokens = load('modules/liquidityAnalyticsTokens.ts')
    expect(mod).not.toMatch(/Awaiting Indexer/i)
    expect(tokens).toContain("unavailable: 'Data unavailable'")
    expect(tokens).not.toMatch(/Awaiting Indexer/i)
  })

  it('counts pool distribution and mint/burn only (no swaps)', () => {
    const dist = countPoolDistribution([
      pair({ classification: 'tradeable' }),
      pair({ pairAddress: '0x2', classification: 'liquidity_present' }),
      pair({ pairAddress: '0x3', classification: 'tradeable', active: false }),
    ])
    expect(dist).toEqual({ total: 3, active: 2, tradeable: 2, funded: 1 })

    const activity = countMintBurnActivity([
      tx(TransactionType.MINT, '1'),
      tx(TransactionType.SWAP, '2'),
      tx(TransactionType.BURN, '3'),
      tx(TransactionType.SWAP, '4'),
    ])
    expect(activity).toEqual({ adds: 1, removes: 1, total: 2 })
    expect(countMintBurnActivity(null)).toBeNull()
  })

  it('mounts Module 007 after My Positions and above legacy Pool', () => {
    const page = readFileSync(path.join(WEB, 'src/pages/liquidity.tsx'), 'utf8')
    expect(page).toContain('data-liquidity-legacy-body="archived"')
    expect(page).toContain('data-liquidity-module-007="mounted"')
    expect(page).toContain('LiquidityAnalyticsModule')
    const positions = page.indexOf('<LiquidityMyPositionsModule')
    const analytics = page.indexOf('<LiquidityAnalyticsModule')
    expect(positions).toBeGreaterThan(-1)
    expect(analytics).toBeGreaterThan(positions)
    // Read-only: outside LiquidityRuntimeProvider (does not nest mint/positions host)
    const providerClose = page.indexOf('</LiquidityRuntimeProvider>')
    expect(providerClose).toBeGreaterThan(-1)
    expect(analytics).toBeGreaterThan(providerClose)
  })

  it('certifies Module 007 in architecture plan and ships evidence paths', () => {
    const plan = LIQUIDITY_MODULE_PLAN.find((m) => m.id === '007-analytics')
    expect(plan?.phase).toBe('certified-by-this-mission')
    expect(existsSync(path.join(WEB, 'docs/runtime/LIQUIDITY_MODULE_007_ANALYTICS_REPORT.md'))).toBe(true)
    expect(existsSync(path.join(WEB, 'docs/runtime/liquidity-module-007-analytics'))).toBe(true)
  })

  it('does not invent fake earnings / projections / swap dashboards', () => {
    const mod = load('modules/LiquidityAnalyticsModule.tsx')
    const builder = load('modules/buildLiquidityAnalytics.ts')
    expect(mod + builder).not.toMatch(/fake TVL|projected APR|guaranteed|yield optimizer/i)
    expect(builder).not.toContain('TransactionType.SWAP')
    expect(builder).toContain('TransactionType.MINT')
    expect(builder).toContain('TransactionType.BURN')
  })
})
