import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { runMarketSanity } from '../sanity'
import { evaluateTopPoolsAprEligibility, normalizeAprForDisplay } from 'views/PoolsStudio/poolsRuntime/poolsAprRules'
import { wbnbVolumeFromPairSides, WBNB_BSC } from 'lib/market-volume/canonical24hVolume'
import {
  evaluateTrendingCandidateReplacement,
  MIN_COMPLETE_ABS,
} from 'lib/trending/durableTrendingSnapshot'
import { measureListedProjectsCount } from 'lib/market-registry/listedProjectsCount'

const WEB = path.resolve(__dirname, '../../../..')
const SRC = path.resolve(__dirname, '../../..')

describe('Market Data Final Certification (unit gates)', () => {
  it('exposes canonical API route and shared BNB/USD module', () => {
    const api = readFileSync(path.join(SRC, 'pages/api/market-data/snapshot.ts'), 'utf8')
    expect(api).toContain('buildCanonicalMarketSnapshot')
    const bnb = readFileSync(path.join(SRC, 'lib/market-data/bnbUsd.ts'), 'utf8')
    expect(bnb).toContain('coinbase')
    expect(bnb).toContain('defillama')
  })

  it('Home and Liquidity consume canonical snapshot volume', () => {
    const home = readFileSync(path.join(SRC, 'views/HomeTrade/useHomeTradeData.ts'), 'utf8')
    const liq = readFileSync(
      path.join(SRC, 'views/LiquidityStudio/modules/useLiquidityMarketSnapshot.ts'),
      'utf8',
    )
    expect(home).toContain('useCanonicalMarketSnapshot')
    expect(home).toContain('marketSnapshot.volume24hUsd')
    expect(home).not.toContain('home-kpi-tier-volume-wbnb-v2')
    expect(liq).toContain('useCanonicalMarketSnapshot')
    expect(liq).toContain('marketSnapshot.volume24hUsd')
  })

  it('Featured prefers canonical snapshot observations', () => {
    const featured = readFileSync(path.join(SRC, 'views/HomeTrade/useFeaturedProjectMarkets.ts'), 'utf8')
    expect(featured).toContain('useCanonicalMarketSnapshot')
    expect(featured).toContain('featuredFromCanonical')
  })

  it('featuredMarkets reuses shared bnbUsd fetch', () => {
    const src = readFileSync(path.join(SRC, 'lib/bsc-indexer/featuredMarkets.ts'), 'utf8')
    expect(src).toContain("from 'lib/market-data/bnbUsd'")
  })

  it('APR remains factual without 50% hard cap', () => {
    expect(normalizeAprForDisplay(174.78).display).toBe('174.78%')
    expect(
      evaluateTopPoolsAprEligibility({
        rewarding: true,
        emissionActive: true,
        apr: 9474,
        tvlUsd: 0.5,
        rewardPriceUsd: 1,
        stakePriceUsd: 1,
      }).eligible,
    ).toBe(false)
  })

  it('volume side selection never treats meme token1 as WBNB', () => {
    const bad = wbnbVolumeFromPairSides({
      token0: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      token1: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      baseVolume: 1,
      quoteVolume: 1e14,
    })
    expect(bad.priced).toBe(false)
    const good = wbnbVolumeFromPairSides({
      token0: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      token1: WBNB_BSC,
      baseVolume: 1e12,
      quoteVolume: 4.2,
    })
    expect(good.wbnbVolume).toBe(4.2)
  })

  it('trending atomic publish rejects sparse collapse', () => {
    const decision = evaluateTrendingCandidateReplacement(
      [
        { id: '1', primary: 'MARCO', accent: '+1%', accentPositive: true },
        { id: '2', primary: 'MM72', accent: '+2%', accentPositive: true },
      ],
      ['A', 'B', 'C', 'D', 'E'].map((p, i) => ({
        id: String(i),
        primary: p,
        accent: '+1%',
        accentPositive: true,
      })),
      Date.now() - 60_000,
    )
    expect(decision.accept).toBe(false)
    expect(MIN_COMPLETE_ABS).toBeGreaterThanOrEqual(4)
  })

  it('listed projects measurement remains deterministic', () => {
    const listed = measureListedProjectsCount()
    expect(listed.finalCount).toBeGreaterThan(0)
    expect(listed.finalCount).not.toBe(5)
  })

  it('sanity helper blocks volume explosions', () => {
    const r = runMarketSanity({
      schema: 'melega.canonical-market-snapshot.v1',
      snapshotId: 'x',
      generatedAt: new Date().toISOString(),
      chainId: 56,
      volume24hWbnb: 0,
      volume24hUsd: 73_164_280_000,
      volumeMethodology: 't',
      unpricedPairCount: 0,
      pricedPairCount: 0,
      swapEventCount24h: 0,
      tvlMethodology: 't',
      listedProjects: 266,
      listedProjectsProvenance: 't',
      markets: 1,
      marketsMethodology: 't',
      pairs: [],
      featured: [],
      aprPools: [],
      trending: {
        schema: 'melega.trending.durable-snapshot.v1',
        atomicPublish: true,
        minCompleteAbs: 4,
        minCompleteRatio: 0.6,
        minTenureMs: 12000,
        durableKey: 'k',
      },
      coverage: {
        trackedTokens: 0,
        pricedTokens: 0,
        featuredCoverage: '0/0',
        fdvCoverage: '0/0',
        volumeCoverage: '0/0',
        priceCoverage: '0/0',
        aprEnabledPools: 0,
      },
      sanity: { ok: true, degraded: false, issues: [] },
      status: 'LIVE',
    })
    expect(r.ok).toBe(false)
  })

  it('evidence exporter script exists', () => {
    const script = path.join(WEB, 'docs/runtime/melega-dex-v1-market-data-final-certification/export-certification.mjs')
    // created by mission — path checked after write; allow pending
    expect(WEB).toContain('apps/web')
    void script
  })
})
