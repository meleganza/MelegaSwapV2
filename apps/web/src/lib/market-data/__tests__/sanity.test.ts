import { describe, expect, it } from 'vitest'
import { runMarketSanity } from '../sanity'
import type { CanonicalMarketSnapshot } from '../types'

function base(): CanonicalMarketSnapshot {
  return {
    schema: 'melega.canonical-market-snapshot.v1',
    snapshotId: 'test',
    generatedAt: new Date().toISOString(),
    chainId: 56,
    bnbUsd: 570,
    volume24hWbnb: 10,
    volume24hUsd: 5700,
    volumeMethodology: 'test',
    unpricedPairCount: 0,
    pricedPairCount: 1,
    swapEventCount24h: 3,
    tvlMethodology: 'test',
    listedProjects: 266,
    listedProjectsProvenance: 'test',
    markets: 12,
    marketsMethodology: 'test',
    pairs: [
      {
        pairAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        token0: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        token1: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
        slug: 'a',
        baseVolume24h: 1,
        quoteVolume24h: 10,
        volume24hWbnb: 10,
        volume24hUsd: 5700,
        tradeCount24h: 3,
        priced: true,
        priceSource: 'bnb-usd',
        status: 'LIVE',
        confidence: 'high',
        freshness: 'fresh',
      },
    ],
    featured: [],
    aprPools: [],
    trending: {
      schema: 'melega.trending.durable-snapshot.v1',
      atomicPublish: true,
      minCompleteAbs: 4,
      minCompleteRatio: 0.6,
      minTenureMs: 12000,
      durableKey: 'melega.trending.durable-snapshot.v1',
    },
    coverage: {
      trackedTokens: 2,
      pricedTokens: 0,
      featuredCoverage: '0/0',
      fdvCoverage: '0/0',
      volumeCoverage: '0/0',
      priceCoverage: '0/0',
      aprEnabledPools: 0,
    },
    sanity: { ok: true, degraded: false, issues: [] },
    status: 'LIVE',
  }
}

describe('market-data sanity', () => {
  it('accepts a clean snapshot', () => {
    const r = runMarketSanity(base())
    expect(r.ok).toBe(true)
  })

  it('blocks volume explosions', () => {
    const snap = base()
    snap.volume24hUsd = 73_164_280_000
    const r = runMarketSanity(snap)
    expect(r.ok).toBe(false)
    expect(r.issues.some((i) => i.code === 'VOLUME_EXPLOSION')).toBe(true)
  })

  it('blocks negative liquidity', () => {
    const snap = base()
    snap.pairs[0].liquidityUsd = -1
    const r = runMarketSanity(snap)
    expect(r.ok).toBe(false)
  })

  it('blocks duplicate pair ids', () => {
    const snap = base()
    snap.pairs.push({ ...snap.pairs[0] })
    const r = runMarketSanity(snap)
    expect(r.ok).toBe(false)
    expect(r.issues.some((i) => i.code === 'DUPLICATE_PAIR')).toBe(true)
  })
})
