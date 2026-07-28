/**
 * LIQUIDITY_MODULE_005_MARKET_SNAPSHOT — metrics, unavailable, freezes, responsive.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import {
  LIQUIDITY_MARKET_SNAPSHOT_COPY,
  LIQUIDITY_MODULE_001_004_FREEZE,
  liquidityMarketSnapshot,
} from '../modules/liquidityMarketSnapshotTokens'
import {
  buildLiquidityMarketSnapshot,
  countActivePools,
  formatSnapshotUsd,
} from '../modules/buildLiquidityMarketSnapshot'
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

const pair = (over: Partial<ClassifiedAmmPair> = {}): ClassifiedAmmPair => ({
  pairAddress: '0x7286c16c3c05d4c17b689be7948ec4fa4e861d1e',
  token0: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
  token1: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  classification: 'tradeable',
  metadataStatus: 'partial',
  active: true,
  ...over,
})

describe('LIQUIDITY_MODULE_005 Market Snapshot', () => {
  it('keeps Modules 001–004 frozen', () => {
    expect(sha256File(path.join(STUDIO, 'modules/LiquidityHeroModule.tsx'))).toBe(
      LIQUIDITY_MODULE_001_004_FREEZE.LiquidityHeroModule,
    )
    expect(sha256File(path.join(STUDIO, 'modules/LiquidityActionsModule.tsx'))).toBe(
      LIQUIDITY_MODULE_001_004_FREEZE.LiquidityActionsModule,
    )
    expect(sha256File(path.join(STUDIO, 'modules/LiquidityPoolDiscoveryModule.tsx'))).toBe(
      LIQUIDITY_MODULE_001_004_FREEZE.LiquidityPoolDiscoveryModule,
    )
    expect(sha256File(path.join(STUDIO, 'modules/LiquidityAddModule.tsx'))).toBe(
      LIQUIDITY_MODULE_001_004_FREEZE.LiquidityAddModule,
    )
  })

  it('locks geometry 1376×220 / 4×329 / gap 20', () => {
    expect(liquidityMarketSnapshot.contentMax).toBe('1376px')
    expect(liquidityMarketSnapshot.moduleH).toBe('220px')
    expect(liquidityMarketSnapshot.columnGap).toBe('20px')
    expect(liquidityMarketSnapshot.cardW).toBe('329px')
    const row =
      parseInt(liquidityMarketSnapshot.cardW, 10) * 4 + parseInt(liquidityMarketSnapshot.columnGap, 10) * 3
    expect(row).toBe(1376)

    const mod = load('modules/LiquidityMarketSnapshotModule.tsx')
    expect(mod).toContain('repeat(4, minmax(0, 1fr))')
    expect(mod).toContain('repeat(2, minmax(0, 1fr))')
    expect(mod).toContain('grid-template-columns: 1fr')
  })

  it('formats and renders factual metrics; never invents zeros as real TVL', () => {
    expect(formatSnapshotUsd(null)).toBeNull()
    expect(formatSnapshotUsd(0)).toBeNull()
    expect(formatSnapshotUsd(12500)).toBe('$12.5K')

    const ready = buildLiquidityMarketSnapshot({
      protocolLoading: false,
      protocol: { liquidityUSD: 1_250_000, volumeUSD: 42_000 },
      factoryLoading: false,
      factoryReady: true,
      factoryUnavailable: false,
      pools: [pair(), pair({ pairAddress: '0x1111111111111111111111111111111111111111', active: false, classification: 'inactive' })],
      factoryFreshness: '2026-07-27T00:00:00.000Z',
      nowIso: '2026-07-27T00:00:00.000Z',
    })
    expect(ready.phase).toBe('partial') // LP providers always unavailable
    expect(ready.cards[0].value).toBe('$1.25M')
    expect(ready.cards[0].status).toBe('ok')
    expect(ready.cards[1].value).toBe('1')
    expect(ready.cards[2].value).toBe('$42.0K')
    expect(ready.cards[3].value).toBe('—')
    expect(ready.cards[3].supporting).toMatch(/No unique liquidity-provider index/i)
    expect(countActivePools([pair(), pair({ active: false, classification: 'inactive' })])).toBe(1)
  })

  it('supports unavailable and partial states without Awaiting Indexer', () => {
    const empty = buildLiquidityMarketSnapshot({
      protocolLoading: false,
      protocol: null,
      factoryLoading: false,
      factoryReady: false,
      factoryUnavailable: true,
      pools: [],
    })
    expect(empty.phase).toBe('unavailable')
    expect(empty.cards.every((c) => c.value === '—' || c.state === 'unavailable')).toBe(true)
    expect(empty.cards[0].supporting).toBe(LIQUIDITY_MARKET_SNAPSHOT_COPY.unavailable)

    const partial = buildLiquidityMarketSnapshot({
      protocolLoading: false,
      protocol: { liquidityUSD: 1000, volumeUSD: undefined },
      factoryLoading: false,
      factoryReady: true,
      factoryUnavailable: false,
      pools: [pair()],
    })
    expect(partial.phase).toBe('partial')
    expect(partial.cards[0].state).toBe('available')
    expect(partial.cards[2].state).toBe('unavailable')

    const mod = load('modules/LiquidityMarketSnapshotModule.tsx')
    expect(mod).not.toContain('Awaiting Indexer')
    expect(mod).toContain('Source:')
    expect(mod).toContain('Status:')
  })

  it('uses read-only protocol + factory sources; does not touch mint runtime', () => {
    const hook = load('modules/useLiquidityMarketSnapshot.ts')
    expect(hook).toContain('useProtocolDataSWR')
    expect(hook).toContain('useMelegaFactoryPools')
    expect(hook).not.toContain('useLiquidityMintRuntime')
    expect(hook).not.toContain('useLiquidityRuntime')
    expect(hook).not.toContain('onPrimaryAction')

    const mod = load('modules/LiquidityMarketSnapshotModule.tsx')
    expect(mod).not.toContain('addLiquidity')
    expect(mod).not.toMatch(/\$24\.56M|fake TVL|fake volume/i)
  })

  it('mounts Module 005 inside Liquidity Insights (merged analytics)', () => {
    const page = readFileSync(path.join(WEB, 'src/pages/liquidity.tsx'), 'utf8')
    expect(page).toContain('LiquidityInsightsModule')
    expect(page).toContain('data-liquidity-legacy-body="archived"')
    expect(page).toContain('data-liquidity-module-005="mounted"')
    const insights = readFileSync(path.join(__dirname, '../modules/LiquidityInsightsModule.tsx'), 'utf8')
    expect(insights).toContain('LiquidityMarketSnapshotModule')
    expect(insights).toContain('Liquidity Insights')
  })

  it('records ownership, plan certification, and evidence', () => {
    const map = readFileSync(path.join(WEB, 'docs/runtime/LIQUIDITY_MODULE_OWNERSHIP_MAP.md'), 'utf8')
    expect(map).toContain('LiquidityMarketSnapshotModule.tsx')
    expect(map).toContain('liquidity-module-005-market-snapshot')
    expect(LIQUIDITY_MODULE_PLAN.find((m) => m.id === '005-market-snapshot')?.phase).toBe(
      'certified-by-this-mission',
    )
    const evidence = path.join(WEB, 'docs/runtime/liquidity-module-005-market-snapshot')
    expect(existsSync(evidence)).toBe(true)
    expect(existsSync(path.join(WEB, 'docs/runtime/LIQUIDITY_MODULE_005_MARKET_SNAPSHOT_REPORT.md'))).toBe(
      true,
    )
    expect(existsSync(path.join(evidence, 'test-summary.json'))).toBe(true)
  })
})
