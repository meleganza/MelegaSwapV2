import { describe, expect, it } from 'vitest'
import {
  compareTierRankedAssets,
  hasTrendingActivitySignal,
  hasTrendingMarketSignal,
  hasTrendingSwapActivity,
  isTrendingTierStatus,
  pickTrendingBaseToken,
  rankTierAssets,
  trendingTickerAccent,
  type TierRankedAsset,
} from '../tierTrendingModel'

describe('tierTrendingModel', () => {
  it('accepts READY and EMPTY_VERIFIED tier statuses', () => {
    expect(isTrendingTierStatus('READY')).toBe(true)
    expect(isTrendingTierStatus('EMPTY_VERIFIED')).toBe(true)
    expect(isTrendingTierStatus('SYNCING')).toBe(false)
    expect(isTrendingTierStatus('NOT_STARTED')).toBe(false)
  })

  it('picks MARCO over WBNB in a pair', () => {
    expect(
      pickTrendingBaseToken(
        '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
        '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
      ).toLowerCase(),
    ).toBe('0x963556de0eb8138e97a85f0a86ee0acd159d210b')
  })

  it('requires at least one market signal', () => {
    expect(
      hasTrendingMarketSignal({
        tradeCount24h: 0,
        volume24h: 0,
        liquidityScore: 0,
      }),
    ).toBe(false)
    expect(
      hasTrendingMarketSignal({
        tradeCount24h: 0,
        volume24h: 0,
        liquidityScore: 100,
      }),
    ).toBe(true)
  })

  it('activity signal rejects liquidity-only idle tokens', () => {
    expect(
      hasTrendingActivitySignal({
        tradeCount24h: 0,
        volume24h: 0,
      }),
    ).toBe(false)
    expect(
      hasTrendingActivitySignal({
        tradeCount24h: 2,
        volume24h: 0,
      }),
    ).toBe(true)
  })

  it('swap activity membership ignores lastVerified-only / discovery timestamps', () => {
    expect(
      hasTrendingSwapActivity({
        tradeCount24h: 0,
        volume24h: 0,
      }),
    ).toBe(false)
    expect(
      hasTrendingActivitySignal({
        tradeCount24h: 0,
        volume24h: 0,
        lastActivityTs: 1_700_000_000,
      }),
    ).toBe(true)
    expect(
      hasTrendingSwapActivity({
        tradeCount24h: 3,
        volume24h: 0,
      }),
    ).toBe(true)
  })

  it('ranks by swap count then volume then unique traders then recency', () => {
    const lowTrades: TierRankedAsset = {
      symbol: 'A',
      slug: 'a',
      pairSlug: 'a',
      address: '0x1',
      chainId: 56,
      displayName: 'A',
      tierStatus: 'READY',
      volume24h: 1000,
      liquidityScore: 1,
      tradeCount24h: 1,
      uniqueTraders: 1,
      lastActivityTs: 100,
      rankingSignals: [],
    }
    const highTrades: TierRankedAsset = {
      ...lowTrades,
      symbol: 'B',
      slug: 'b',
      address: '0x2',
      volume24h: 10,
      tradeCount24h: 50,
      uniqueTraders: 2,
      lastActivityTs: 50,
    }
    expect(compareTierRankedAssets(highTrades, lowTrades)).toBeLessThan(0)

    const moreTraders: TierRankedAsset = {
      ...lowTrades,
      symbol: 'C',
      address: '0x3',
      tradeCount24h: 1,
      volume24h: 1000,
      uniqueTraders: 9,
      lastActivityTs: 10,
    }
    expect(compareTierRankedAssets(moreTraders, lowTrades)).toBeLessThan(0)
  })

  it('formats ticker accent as ↑ 2.4% without Price unavailable', () => {
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
    expect(JSON.stringify(accent)).not.toMatch(/Price unavailable/i)
  })

  it('ranks by volume and dedupes symbols', () => {
    const assets: TierRankedAsset[] = [
      {
        symbol: 'MARCO',
        slug: 'marco',
        pairSlug: 'marco-wbnb',
        address: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
        chainId: 56,
        displayName: 'MARCO',
        tierStatus: 'READY',
        volume24h: 10,
        liquidityScore: 1,
        tradeCount24h: 1,
        rankingSignals: ['volume24h'],
      },
      {
        symbol: 'MARCO',
        slug: 'marco-dup',
        pairSlug: 'marco-wbnb',
        address: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
        chainId: 56,
        displayName: 'MARCO',
        tierStatus: 'READY',
        volume24h: 5,
        liquidityScore: 1,
        tradeCount24h: 0,
        rankingSignals: [],
      },
    ]
    const ranked = rankTierAssets(assets)
    expect(ranked).toHaveLength(1)
    expect(ranked[0]?.volume24h).toBe(10)
  })
})
