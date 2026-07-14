import { describe, expect, it } from 'vitest'
import {
  hasTrendingMarketSignal,
  isTrendingTierStatus,
  pickTrendingBaseToken,
  rankTierAssets,
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
