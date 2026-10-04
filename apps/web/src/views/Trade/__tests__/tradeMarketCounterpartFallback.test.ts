import { describe, expect, it } from 'vitest'
import type { ProjectDexAnalytics, ProjectDexPairBreakdown } from 'lib/market-data/projectDexAnalytics'
import { buildPublicTradePricePoints, resolveExactTradeDexPair } from '../useTradeTerminalData'

const MARCO_AARON_PAIR = '0xc6f6F0A9525d43D68Ab3FC27a731c01b10F320FA'

function pair(pairAddress: string, label: string): ProjectDexPairBreakdown {
  return {
    pairAddress,
    dexId: 'melegaswap',
    label,
    baseTokenAddress: '0x31b5be085af875b675392f5b37a1d0b8c3860222',
    quoteTokenAddress: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
    baseTokenSymbol: 'AARON',
    quoteTokenSymbol: 'MARCO',
    counterpartAddress: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
    liquidityUsd: 1063.6,
    volume24hUsd: 77.76,
    transactions24h: 25,
    priceUsd: 1.146e-7,
    priceChange24h: 7.49,
    marketCapUsd: 2178,
    fdvUsd: 2178,
    liquiditySharePct: 31.1,
  }
}

function analytics(pairs: ProjectDexPairBreakdown[]): ProjectDexAnalytics {
  return {
    pairCount: pairs.length,
    dexCount: 1,
    liquidityUsd: null,
    volume24hUsd: null,
    transactions24h: null,
    priceUsd: null,
    priceChange24h: null,
    marketCapUsd: null,
    fdvUsd: null,
    primaryPairAddress: pairs[0]?.pairAddress ?? null,
    venues: [],
    pairs,
  }
}

describe('trade market counterpart fallback', () => {
  it('derives factual MARCO prices from exact-pool USD trades without inventing candles', () => {
    const prices = buildPublicTradePricePoints([
      {
        id: 'later',
        timestamp: 2,
        txHash: `0x${'1'.repeat(64)}`,
        wallet: `0x${'2'.repeat(40)}`,
        direction: 'buy',
        amountUsd: 2.11633724535958,
        selectedTokenAmount: '7717.39197075973',
        selectedTokenAddress: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
        selectedTokenSymbol: 'MARCO',
        baseTokenAddress: '0x31b5be085af875b675392f5b37a1d0b8c3860222',
        baseTokenSymbol: 'AARON',
        quoteTokenAddress: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
        quoteTokenSymbol: 'MARCO',
      },
      {
        id: 'missing-usd',
        timestamp: 1,
        txHash: `0x${'3'.repeat(64)}`,
        wallet: `0x${'4'.repeat(40)}`,
        direction: 'sell',
        amountUsd: null,
        selectedTokenAmount: '1000',
        selectedTokenAddress: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
        selectedTokenSymbol: 'MARCO',
        baseTokenAddress: '0x31B5BE085aF875B675392f5B37a1d0B8c3860222',
        baseTokenSymbol: 'AARON',
        quoteTokenAddress: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
        quoteTokenSymbol: 'MARCO',
      },
    ])

    expect(prices).toHaveLength(1)
    expect(prices[0]?.time).toBe('2')
    expect(prices[0]?.value).toBeCloseTo(0.00027423, 8)
  })

  it('recovers the exact MARCO/AARON pool when the bounded MARCO response omits it', () => {
    const busyMarcoResponse = analytics([pair('0x0000000000000000000000000000000000000001', 'MARCO / OTHER')])
    const aaronResponse = analytics([pair(MARCO_AARON_PAIR, 'AARON / MARCO')])

    const resolved = resolveExactTradeDexPair(busyMarcoResponse, aaronResponse, MARCO_AARON_PAIR.toLowerCase())

    expect(resolved?.pairAddress).toBe(MARCO_AARON_PAIR)
    expect(resolved?.liquidityUsd).toBe(1063.6)
    expect(resolved?.volume24hUsd).toBe(77.76)
    expect(resolved?.transactions24h).toBe(25)
  })

  it('never substitutes a different pool from the counterpart response', () => {
    const wrongPool = analytics([pair('0x0000000000000000000000000000000000000002', 'AARON / WBNB')])

    expect(resolveExactTradeDexPair(undefined, wrongPool, MARCO_AARON_PAIR)).toBeUndefined()
  })

  it('recovers the canonical Melega pool by both token addresses when RPC pair discovery is temporarily unavailable', () => {
    const canonical = pair(MARCO_AARON_PAIR, 'AARON / MARCO')
    canonical.dexId = '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C'
    const pancake = pair('0x660303F6242ae67E9C0acDBA7f42cb8c14e92292', 'AARON / MARCO')
    pancake.dexId = 'pancakeswap'

    const resolved = resolveExactTradeDexPair(
      undefined,
      analytics([pancake, canonical]),
      undefined,
      '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
      '0x31B5BE085aF875B675392f5B37a1d0B8c3860222',
    )

    expect(resolved?.pairAddress).toBe(MARCO_AARON_PAIR)
    expect(resolved?.dexId).not.toBe('pancakeswap')
  })
})
