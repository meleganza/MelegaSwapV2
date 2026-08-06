/**
 * MELEGASWAP_V2_GLOBAL_DATA_INDEXER_FINALIZATION — structural contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import {
  truthDash,
  compareYieldTruthDesc,
  GLOBAL_DATA_TRUTH_PIPELINE,
  buildProjectTruthMarketFromFeatured,
} from 'lib/data-truth'

const SRC = path.resolve(process.cwd(), 'src')
const load = (rel: string) => readFileSync(path.join(SRC, rel), 'utf8')

describe('MELEGASWAP_V2_GLOBAL_DATA_INDEXER_FINALIZATION', () => {
  it('exposes a single Global Data Truth barrel + pipeline id', () => {
    expect(existsSync(path.join(SRC, 'lib/data-truth/index.ts'))).toBe(true)
    expect(existsSync(path.join(SRC, 'lib/data-truth/globalDataTruthLayer.ts'))).toBe(true)
    expect(existsSync(path.join(SRC, 'lib/data-truth/useGlobalDataTruth.ts'))).toBe(true)
    expect(GLOBAL_DATA_TRUTH_PIPELINE).toBe('melega-global-data-truth-v1')
    const barrel = load('lib/data-truth/index.ts')
    expect(barrel).toContain('truthDash')
    expect(barrel).toContain('compareYieldTruthDesc')
    expect(load('lib/data-truth/useGlobalDataTruth.ts')).toContain('useCanonicalMarketSnapshot')
    expect(load('lib/data-truth/useGlobalDataTruth.ts')).toContain('useFeaturedProjectMarkets')
    expect(load('lib/data-truth/useGlobalDataTruth.ts')).toContain('useTopMoversSnapshotOptional')
  })

  it('truthDash never invents and maps Unavailable / diagnostics to —', () => {
    expect(truthDash(undefined)).toBe('—')
    expect(truthDash('Unavailable')).toBe('—')
    expect(truthDash('Waiting for explorer')).toBe('—')
    expect(truthDash('Source not configured')).toBe('—')
    expect(truthDash('$1.23')).toBe('$1.23')
  })

  it('yield ranking is shared (TVL → APR → volume → activity)', () => {
    const rows = [
      { sortTvl: 10, sortApr: 1, sortVolume: 0, sortActivity: 0, id: 'a' },
      { sortTvl: 50, sortApr: 0, sortVolume: 0, sortActivity: 0, id: 'b' },
      { sortTvl: 50, sortApr: 9, sortVolume: 0, sortActivity: 0, id: 'c' },
    ].sort(compareYieldTruthDesc)
    expect(rows.map((r) => r.id)).toEqual(['c', 'b', 'a'])
  })

  it('Project truth market builder uses featured SSOT and dashes missing fields', () => {
    const empty = buildProjectTruthMarketFromFeatured(undefined)
    expect(empty.price).toBe('—')
    expect(empty.pipeline).toBe(GLOBAL_DATA_TRUTH_PIPELINE)
    const row = buildProjectTruthMarketFromFeatured({
      slug: 'marco',
      symbol: 'MARCO',
      tokenAddress: '0x1',
      pairAddress: '0x2',
      status: 'LIVE',
      latestPriceUsd: 0.001,
      changePct: 1.5,
      volume24hUsd: 100,
      liquidityUsd: 1000,
      marketCapUsd: 5000,
      tradeCount24h: 12,
      source: 'melega-factory-reserves',
    } as any)
    expect(row.transactions).toBe('12')
    expect(row.liquidity).not.toBe('—')
    expect(row.pipeline).toBe(GLOBAL_DATA_TRUTH_PIPELINE)
  })

  it('Projects directory uses shared TopMovers snapshot (no duplicate rankings hook)', () => {
    const runtime = load('views/ProjectsStudio/projectsRuntime/useProjectsIntelligenceRuntime.ts')
    expect(runtime).toContain('useTopMoversSnapshot')
    expect(runtime).not.toContain('useDexTrendingRankings')
    expect(runtime).toContain('truthDash')
    expect(runtime).not.toContain('Waiting for explorer')
  })

  it('Project Page live market reads Global Data Truth pipeline', () => {
    const market = load('views/ProjectPage/v1/useProjectLiveMarket.ts')
    expect(market).toContain('GLOBAL_DATA_TRUTH_PIPELINE')
    expect(market).toContain('buildProjectTruthMarketFromFeatured')
    expect(market).toContain("priceUsd: '—'")
    expect(market).not.toContain("priceUsd: 'Unavailable'")
  })

  it('Home Top Farms/Pools use shared compareYieldTruthDesc', () => {
    const home = load('views/HomeTrade/useHomeTradeData.ts')
    expect(home).toContain('compareYieldTruthDesc')
    expect(home).toContain("from 'lib/data-truth/yieldMetricHelpers'")
  })

  it('Project Page V4 economy uses shared inventory counts', () => {
    const shell = load('views/ProjectPage/v4/ProjectPageV4Shell.tsx')
    expect(shell).toContain('countNormalizedFarmsByChain')
    expect(shell).toContain('poolInventoryCount')
    expect(shell).toContain('truthDash')
  })

  it('Audit Center tags the same data-truth pipeline', () => {
    const audit = load('views/AuditStudio/AuditCenterV2.tsx')
    expect(audit).toContain('GLOBAL_DATA_TRUTH_PIPELINE')
    expect(audit).toContain('data-data-truth-pipeline')
  })

  it('Liquidity Studio and Featured markets still consume canonical snapshot', () => {
    expect(load('views/LiquidityStudio/onePage/DexLiquiditySnapshot.tsx')).toContain('useCanonicalMarketSnapshot')
    expect(load('views/HomeTrade/useFeaturedProjectMarkets.ts')).toContain('useCanonicalMarketSnapshot')
  })
})
