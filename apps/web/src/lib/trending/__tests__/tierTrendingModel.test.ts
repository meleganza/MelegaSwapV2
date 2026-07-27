import { describe, expect, it } from 'vitest'
import {
  compareTierRankedAssets,
  hasTrendingMarketSignal,
  isTopMoverEligible,
  isTrendingTierStatus,
  pickTrendingBaseToken,
  rankTierAssets,
  trendingTickerAccent,
  type TierRankedAsset,
} from '../tierTrendingModel'

describe('tierTrendingModel — TOP MOVERS', () => {
  it('accepts READY and EMPTY_VERIFIED tier statuses', () => {
    expect(isTrendingTierStatus('READY')).toBe(true)
    expect(isTrendingTierStatus('EMPTY_VERIFIED')).toBe(true)
    expect(isTrendingTierStatus('SYNCING')).toBe(false)
  })

  it('picks MARCO over WBNB in a pair', () => {
    expect(
      pickTrendingBaseToken(
        '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
        '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
      ).toLowerCase(),
    ).toBe('0x963556de0eb8138e97a85f0a86ee0acd159d210b')
  })

  it('rejects liquidity-only membership for TOP MOVERS', () => {
    expect(
      isTopMoverEligible({
        tradeCount24h: 0,
        volume24h: 0,
        liquidityActivity24h: 0,
      }),
    ).toBe(false)
    expect(
      hasTrendingMarketSignal({
        tradeCount24h: 0,
        volume24h: 0,
        liquidityScore: 100,
      }),
    ).toBe(true)
    expect(
      isTopMoverEligible({
        tradeCount24h: 2,
        volume24h: 0,
      }),
    ).toBe(true)
  })

  it('ranks by |price %| then swaps then volume then LP activity', () => {
    const highVol: TierRankedAsset = {
      symbol: 'TRUMPET',
      slug: 'trumpet',
      pairSlug: 'trumpet',
      address: '0xaaa',
      chainId: 56,
      displayName: 'TRUMPET',
      tierStatus: 'READY',
      volume24h: 9_000_000,
      liquidityScore: 999,
      tradeCount24h: 1,
      liquidityActivity24h: 0,
      rankingSignals: [],
    }
    const highMove: TierRankedAsset = {
      ...highVol,
      symbol: 'MARCO',
      slug: 'marco',
      address: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
      volume24h: 10,
      tradeCount24h: 2,
      change24h: { pct: 4.2, positive: true, text: '▲ 4.20%' },
    }
    expect(compareTierRankedAssets(highMove, highVol)).toBeLessThan(0)
    const ranked = rankTierAssets([highVol, highMove], 10)
    expect(ranked[0]?.symbol).toBe('MARCO')
  })

  it('formats ticker accent as ↑ / ↓ percent', () => {
    const accent = trendingTickerAccent({
      symbol: 'MARCO',
      slug: 'marco',
      pairSlug: 'marco-wbnb',
      address: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
      chainId: 56,
      displayName: 'MARCO',
      tierStatus: 'READY',
      volume24h: 1,
      liquidityScore: 1,
      tradeCount24h: 1,
      change24h: { pct: 2.4, positive: true, text: '▲ 2.40%' },
      rankingSignals: [],
    })
    expect(accent.accent).toBe('↑ 2.4%')
    expect(accent.accentPositive).toBe(true)
  })
})
