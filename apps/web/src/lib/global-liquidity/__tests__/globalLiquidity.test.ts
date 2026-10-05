import { describe, expect, it } from 'vitest'
import {
  aggregateGlobalPricedTvl,
  dedupeGlobalPools,
  paginateGlobalPools,
  searchGlobalPools,
  sortGlobalPoolsByTvl,
} from '../model'
import { reconcileFarmLpHoldings } from '../farmReconciliation'
import type { GlobalLiquidityPool } from '../types'

function pool(input: Partial<GlobalLiquidityPool> & Pick<GlobalLiquidityPool, 'chainId' | 'pairAddress'>): GlobalLiquidityPool {
  return {
    chainName: `Chain ${input.chainId}`,
    token0: '0x0000000000000000000000000000000000000001',
    token1: '0x0000000000000000000000000000000000000002',
    symbol0: 'A',
    symbol1: 'B',
    decimals0: 18,
    decimals1: 18,
    reserve0Raw: '1',
    reserve1Raw: '1',
    tvlUsd: null,
    status: 'UNPRICED',
    ...input,
  }
}

describe('global liquidity aggregation', () => {
  const rows = [
    pool({ chainId: 56, pairAddress: '0x000000000000000000000000000000000000000a', tvlUsd: '100000', status: 'ACTIVE_WITH_LIQUIDITY' }),
    pool({ chainId: 56, pairAddress: '0x000000000000000000000000000000000000000b', tvlUsd: '50000', status: 'ACTIVE_WITH_LIQUIDITY' }),
    pool({ chainId: 56, pairAddress: '0x000000000000000000000000000000000000000c', tvlUsd: '25000', status: 'ACTIVE_WITH_LIQUIDITY' }),
  ]

  it('sums the complete universe independently of pagination, search, or wallet chain', () => {
    expect(aggregateGlobalPricedTvl(rows)).toBe('175000')
    expect(aggregateGlobalPricedTvl(rows)).toBe(aggregateGlobalPricedTvl(rows))
    expect(paginateGlobalPools(rows, 1, 1)).toHaveLength(1)
    expect(searchGlobalPools(rows, '000b')).toHaveLength(1)
  })

  it('dedupes same-chain addresses but keeps the same address on separate chains', () => {
    const duplicate = { ...rows[0] }
    const otherChain = { ...rows[0], chainId: 8453 }
    expect(dedupeGlobalPools([...rows, duplicate, otherChain])).toHaveLength(4)
    expect(aggregateGlobalPricedTvl([...rows, duplicate, otherChain])).toBe('275000')
  })

  it('does not silently turn unpriced liquidity into known zero', () => {
    const unpriced = pool({ chainId: 56, pairAddress: '0x000000000000000000000000000000000000000d' })
    const zero = pool({ chainId: 56, pairAddress: '0x000000000000000000000000000000000000000e', tvlUsd: '0', status: 'ZERO_LIQUIDITY' })
    expect(aggregateGlobalPricedTvl([...rows, unpriced, zero])).toBe('175000')
    expect(unpriced.tvlUsd).toBeNull()
    expect(zero.tvlUsd).toBe('0')
  })
})

describe('global liquidity ordering', () => {
  it('sorts known TVL descending, unknown last, with deterministic fallbacks', () => {
    const rows = [
      pool({ chainId: 56, pairAddress: '0x000000000000000000000000000000000000000a', symbol0: 'Pool A', name0: 'A+B subset', tvlUsd: '500' }),
      pool({ chainId: 56, pairAddress: '0x000000000000000000000000000000000000000b', symbol0: 'Pool B', name0: 'A+B subset', tvlUsd: '5000000' }),
      pool({ chainId: 56, pairAddress: '0x000000000000000000000000000000000000000c', symbol0: 'Pool C', tvlUsd: '50000' }),
      pool({ chainId: 56, pairAddress: '0x000000000000000000000000000000000000000d', symbol0: 'Pool D' }),
    ]
    expect(sortGlobalPoolsByTvl(rows).map((row) => row.symbol0)).toEqual(['Pool B', 'Pool C', 'Pool A', 'Pool D'])
    expect(sortGlobalPoolsByTvl(searchGlobalPools(rows, 'Pool A')).map((row) => row.symbol0)).toEqual(['Pool A'])
    expect(sortGlobalPoolsByTvl(searchGlobalPools(rows, 'A+B subset')).map((row) => row.symbol0)).toEqual(['Pool B', 'Pool A'])
    const paged = [1, 2, 3, 4].flatMap((page) => paginateGlobalPools(sortGlobalPoolsByTvl(rows), page, 1))
    expect(new Set(paged.map((row) => row.pairAddress)).size).toBe(4)
  })
})

describe('farm LP reconciliation', () => {
  it('keeps farm-held LP inside pool TVL, including multiple farms on the same pair', () => {
    const result = reconcileFarmLpHoldings('100000', [
      { chainId: 56, pairAddress: '0xpair', stakedLpRaw: '30', totalSupplyRaw: '100', poolTvlUsd: '100000' },
      { chainId: 56, pairAddress: '0xpair', stakedLpRaw: '10', totalSupplyRaw: '100', poolTvlUsd: '100000' },
    ])
    expect(result.farmLpValueUsd).toBe('40000')
    expect(result.alreadyIncludedInPoolTvlUsd).toBe('40000')
    expect(result.globalDexLiquidityUsd).toBe('100000')
  })
})
