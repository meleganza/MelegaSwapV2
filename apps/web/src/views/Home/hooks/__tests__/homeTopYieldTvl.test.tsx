import { renderHook, waitFor } from '@testing-library/react'
import BigNumber from 'bignumber.js'
import { describe, expect, it, vi } from 'vitest'
import { meetsHomeTopYieldTvl } from '../homeTopYieldEligibility'
import useGetTopFarmsByApr from '../useGetTopFarmsByApr'
import useGetTopPoolsByApr from '../useGetTopPoolsByApr'

const state = { chainId: 1, farms: [] as any[], pools: [] as any[], dispatch: vi.fn(async () => ({})) }
const price = new BigNumber(1)
vi.mock('hooks/useActiveChainId', () => ({ useActiveChainId: () => ({ chainId: state.chainId }) }))
vi.mock('state', () => ({ useAppDispatch: () => state.dispatch }))
vi.mock('state/farms/hooks', () => ({
  useFarms: () => ({ data: state.farms, regularCakePerBlock: 1 }),
  usePriceCakeBusd: () => price,
  usePollFarmsWithUserData: () => {},
}))
vi.mock('state/farms', () => ({ fetchFarmsPublicDataAsync: vi.fn() }))
vi.mock('state/pools/hooks', () => ({ usePoolsWithVault: () => ({ pools: state.pools }) }))
vi.mock('state/pools', () => ({ fetchCakeVaultFees: vi.fn(), fetchCakeVaultPublicData: vi.fn(), fetchPoolsPublicDataAsync: vi.fn() }))
vi.mock('state/block/hooks', () => ({ useInitialBlock: () => 100, useCurrentBlock: () => 100 }))
vi.mock('@pancakeswap/farms/constants', () => ({ getFarmConfig: async () => state.farms }))
vi.mock('config/constants/pools', () => ({ livePools1: [], livePools56: [], livePools137: [], livePools42161: [], livePools8453: [] }))
vi.mock('utils/addressHelpers', () => ({ getMasterChefAddress: () => '0xchef' }))
vi.mock('utils/farmHelpers', () => ({ default: () => false }))
vi.mock('utils/apr', () => ({ getFarmApr: (_chain: number, weight: BigNumber) => ({ cakeRewardsApr: weight.toNumber(), lpRewardsApr: 0 }) }))
vi.mock('lib/data-truth/poolLifecycle', () => ({ derivePoolLifecycle: () => ({ rewarding: true }) }))
vi.mock('lib/data-truth/yieldMetricHelpers', () => ({ resolvePoolAprPercent: (p: any) => p.apr, resolvePoolTvlUsd: (p: any) => p.tvl }))

const tvls = [0.45, 0.7, 0.8, 1.48, 2.65, 231.5, 249.999, 250, 623.94, 1000]
const fixtures = () => {
  state.farms = tvls.map((tvl, i) => ({ pid: i + 1, lpTotalInQuoteToken: new BigNumber(tvl), quoteTokenPriceBusd: '1', poolWeight: new BigNumber(1000 - i), multiplier: '1X', token: { symbol: 'MARCO' }, quoteToken: { symbol: 'WETH' } }))
  state.pools = tvls.map((tvl, i) => ({ sousId: i + 1, tvl, apr: 1000 - i, isFinished: false }))
}

describe('Home Top Farms / Top Pools minimum TVL', () => {
  it.each([undefined, null, NaN, Infinity, -Infinity, -1, 0, 0.45, 231.5, 249.999])('excludes unknown, invalid or sub-$250 TVL: %s', (value) => {
    expect(meetsHomeTopYieldTvl(value)).toBe(false)
  })
  it.each([250, 250.001, 623.94, 1000000])('includes TVL at or above the exact $250 boundary: %s', (value) => {
    expect(meetsHomeTopYieldTvl(value)).toBe(true)
  })
  it.each([1, 56, 137, 42161, 43114, 8453])('filters before top-N selection on chain %s, retaining lower-APR eligible rows', async (chainId) => {
    state.chainId = chainId
    fixtures()
    const farms = renderHook(() => useGetTopFarmsByApr(true))
    const pools = renderHook(() => useGetTopPoolsByApr(false))
    await waitFor(() => expect(farms.result.current.fetchStatus).toBe('success'))
    expect(farms.result.current.topFarms.map((f) => f.pid)).toEqual([8, 9, 10])
    expect(pools.result.current.topPools.map((p) => p.sousId)).toEqual([8, 9, 10])
    // No padding with dust positions when every remaining position drops below $250.
    state.farms = state.farms.slice(0, 7)
    state.pools = state.pools.slice(0, 7)
    farms.rerender()
    pools.rerender()
    await waitFor(() => expect(farms.result.current.topFarms).toEqual([]))
    expect(pools.result.current.topPools).toEqual([])
    farms.unmount()
    pools.unmount()
  })
})
