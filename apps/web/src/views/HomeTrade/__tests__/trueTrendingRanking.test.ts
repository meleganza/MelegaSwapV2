import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import {
  hasTrendingSwapActivity,
  rankTierAssets,
  type TierRankedAsset,
} from 'lib/trending/tierTrendingModel'

const trendingSrc = readFileSync(join(__dirname, '../useDexTrendingRankings.ts'), 'utf8')

describe('WAVE_04A_TOP_MOVERS_MULTI_SOURCE', () => {
  it('ranks from pair index + external tracked prices + CoinGecko — not swap-only', () => {
    expect(trendingSrc).toMatch(/fetchCoinGeckoTokenQuotes/)
    expect(trendingSrc).toMatch(/pairIndex/)
    expect(trendingSrc).toMatch(/externalTrackedPrice/)
    expect(trendingSrc).toMatch(/coingecko/)
    expect(trendingSrc).toMatch(/TRENDING_DEX_FACTORY/)
    expect(trendingSrc).toMatch(/MELEGA_FACTORY_BSC/)
    expect(trendingSrc).not.toMatch(/toPrecision\(/)
    expect(trendingSrc).toMatch(/formatTickerPriceUsd/)
    expect(trendingSrc).toMatch(/Never fabricate/)
    expect(trendingSrc).toMatch(/hasExternalChange/)
  })

  it('still ranks swap-active assets ahead when comparing volumes', () => {
    const assets: TierRankedAsset[] = [
      {
        symbol: 'TRUMPET',
        slug: 'trumpet',
        pairSlug: 'trumpet',
        address: '0xaaa',
        chainId: 56,
        displayName: 'TRUMPET',
        tierStatus: 'READY',
        volume24h: 0,
        liquidityScore: 999,
        tradeCount24h: 0,
        lastActivityTs: 1_700_000_000,
        rankingSignals: ['pairIndex'],
      },
      {
        symbol: 'MARCO',
        slug: 'marco',
        pairSlug: 'marco-wbnb',
        address: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
        chainId: 56,
        displayName: 'MARCO',
        tierStatus: 'READY',
        volume24h: 500,
        liquidityScore: 10,
        tradeCount24h: 12,
        uniqueTraders: 4,
        lastActivityTs: 1_700_000_100,
        rankingSignals: ['recentSwaps'],
      },
      {
        symbol: 'CAKE',
        slug: 'cake',
        pairSlug: 'cake',
        address: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
        chainId: 56,
        displayName: 'CAKE',
        tierStatus: 'READY',
        volume24h: 200,
        liquidityScore: 10,
        tradeCount24h: 5,
        uniqueTraders: 2,
        rankingSignals: ['recentSwaps'],
      },
    ]
    const active = assets.filter((a) =>
      hasTrendingSwapActivity({ tradeCount24h: a.tradeCount24h, volume24h: a.volume24h }),
    )
    const ranked = rankTierAssets(active, 10)
    expect(ranked.map((r) => r.symbol)).toEqual(['MARCO', 'CAKE'])
    expect(ranked.every((r) => r.symbol !== 'TRUMPET')).toBe(true)
  })
})
