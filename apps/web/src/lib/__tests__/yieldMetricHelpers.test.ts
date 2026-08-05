import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import {
  formatFarmTvlDisplay,
  formatPoolTvlDisplay,
  resolveFarmLiquidityUsd,
  resolvePoolFeesDisplay,
  resolvePoolTvlUsd,
  resolvePoolVolumeDisplay,
} from 'lib/data-truth/yieldMetricHelpers'
import { METRIC_STATUS } from 'lib/data-policy/metricStatus'

describe('yieldMetricHelpers — shared TVL formulas', () => {
  it('farm liquidity prefers attached liquidity BigNumber', () => {
    const farm = {
      liquidity: new BigNumber(12_500),
      lpTotalInQuoteToken: new BigNumber(100),
      quoteTokenPriceBusd: new BigNumber(2),
    } as any
    expect(resolveFarmLiquidityUsd(farm)).toBe(12_500)
    expect(formatFarmTvlDisplay(farm)).toBe('$12.5K')
  })

  it('farm liquidity falls back to reserve × quote price', () => {
    const farm = {
      lpTotalInQuoteToken: new BigNumber(100),
      quoteTokenPriceBusd: new BigNumber(2.5),
    } as any
    expect(resolveFarmLiquidityUsd(farm)).toBe(250)
  })

  it('pool TVL = totalStaked × stakingTokenPrice', () => {
    const pool = {
      totalStaked: new BigNumber('1000000000000000000000'),
      stakingToken: { decimals: 18, symbol: 'MARCO', chainId: 56 },
      stakingTokenPrice: 0.05,
      poolCategory: 'CORE',
    } as any
    expect(resolvePoolTvlUsd(pool)).toBe(50)
    expect(formatPoolTvlDisplay(pool)).toBe('$50.00')
  })

  it('pool TVL uses MARCO price hint when stakingTokenPrice missing', () => {
    const pool = {
      totalStaked: new BigNumber('1000000000000000000000'),
      stakingToken: { decimals: 18, symbol: 'MARCO', chainId: 56 },
      stakingTokenPrice: 0,
      poolCategory: 'CORE',
    } as any
    expect(resolvePoolTvlUsd(pool, { marcoUsd: 0.1 })).toBe(100)
  })

  it('pool volume is Unavailable; fees are 0% when category known', () => {
    const pool = { poolCategory: 'CORE' } as any
    expect(resolvePoolVolumeDisplay(pool)).toBe(METRIC_STATUS.UNAVAILABLE)
    expect(resolvePoolFeesDisplay(pool)).toBe('0%')
  })
})
