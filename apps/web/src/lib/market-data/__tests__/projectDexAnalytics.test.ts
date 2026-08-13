import { describe, expect, it } from 'vitest'
import { aggregateProjectDexPairs } from '../projectDexAnalytics'

describe('project multi-DEX analytics', () => {
  it('aggregates liquidity, volume, and transactions by real venue observations', () => {
    const result = aggregateProjectDexPairs([
      {
        dexId: 'melegaswap',
        pairAddress: '0x1',
        liquidity: { usd: 100 },
        volume: { h24: 20 },
        txns: { h24: { buys: 2, sells: 3 } },
      },
      {
        dexId: 'pancakeswap',
        pairAddress: '0x2',
        liquidity: { usd: 250 },
        volume: { h24: 75 },
        txns: { h24: { buys: 4, sells: 1 } },
        priceUsd: '0.25',
        priceChange: { h24: 4.2 },
        marketCap: 250000,
        fdv: 300000,
      },
    ])
    expect(result).toMatchObject({
      pairCount: 2,
      dexCount: 2,
      liquidityUsd: 350,
      volume24hUsd: 95,
      transactions24h: 10,
      priceUsd: 0.25,
      priceChange24h: 4.2,
      marketCapUsd: 250000,
      fdvUsd: 300000,
      primaryPairAddress: '0x2',
    })
    expect(result.venues[0].dexId).toBe('pancakeswap')
  })

  it('preserves unknown metrics as null instead of rendering fake zeroes', () => {
    const result = aggregateProjectDexPairs([{ dexId: 'unknown-dex', pairAddress: '0x1' }])
    expect(result).toMatchObject({
      pairCount: 1,
      liquidityUsd: null,
      volume24hUsd: null,
      transactions24h: null,
      priceUsd: null,
      marketCapUsd: null,
      fdvUsd: null,
    })
  })
})
