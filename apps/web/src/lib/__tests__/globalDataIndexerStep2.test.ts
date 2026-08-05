import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { buildHomeNewListings } from 'views/HomeTrade/buildHomeNewListings'
import { METRIC_STATUS } from 'lib/data-policy/metricStatus'

const ROOT = path.resolve(__dirname, '../..')
const VIEWS = path.join(ROOT, 'views')

function load(rel: string) {
  return readFileSync(path.join(VIEWS, rel), 'utf8')
}

function loadLib(rel: string) {
  return readFileSync(path.join(ROOT, 'lib', rel), 'utf8')
}

const SUPPORTED_CHAIN_IDS = [56, 8453, 137, 1, 42161, 43114]

describe('Global data indexer Step 2', () => {
  it('shared yieldMetricHelpers exist and are consumed by Home / Farms / Pools', () => {
    const helpers = loadLib('data-truth/yieldMetricHelpers.ts')
    expect(helpers).toContain('resolveFarmLiquidityUsd')
    expect(helpers).toContain('resolvePoolTvlUsd')
    expect(helpers).toContain('resolvePoolFeesDisplay')
    expect(helpers).toContain('resolvePoolVolumeDisplay')

    const home = load('HomeTrade/useHomeTradeData.ts')
    expect(home).toContain("from 'lib/data-truth/yieldMetricHelpers'")
    expect(home).toContain('resolvePoolTvlUsd')
    expect(home).toContain('resolveFarmLiquidityUsd')

    const farmsFmt = load('FarmsStudio/farmsRuntime/formatFarmsRuntime.ts')
    expect(farmsFmt).toContain('resolveFarmLiquidityUsd')

    const poolsFmt = load('PoolsStudio/poolsRuntime/formatPoolsRuntime.ts')
    expect(poolsFmt).toContain('resolvePoolTvlUsd')

    const topPools = load('Home/hooks/useGetTopPoolsByApr.tsx')
    expect(topPools).toContain('resolvePoolTvlUsd')
    expect(topPools).toContain('row.tvlUsd > 0')
  })

  it('Home Top Pools expose volume fees logos and chain badge', () => {
    const home = load('HomeTrade/DexHomeScreen.tsx')
    expect(home).toContain('Volume ${row.volume}')
    expect(home).toContain('Fees ${row.fees}')
    expect(home).toContain('MelegaExploreChainBadge')
    expect(home).toContain('tokenSymbols')
    expect(home).toContain('data-listing-timestamp')
  })

  it('Top Farms hook still attaches liquidity for shared TVL', () => {
    const hook = load('Home/hooks/useGetTopFarmsByApr.tsx')
    expect(hook).toContain('liquidity: totalLiquidity')
  })

  it('Explore farms/pools use shared liquidity TVL resolver', () => {
    const farms = load('FarmsStudio/modules/buildFarmsExploreFarms.ts')
    expect(farms).toContain('resolveFarmLiquidityUsd')
    const pools = load('PoolsStudio/modules/buildPoolsExplorePools.ts')
    expect(pools).toContain('resolvePoolTvlUsd')
  })

  it('New Listings include chain logo symbol listingTimestamp and multichain sort', () => {
    const builder = load('HomeTrade/buildHomeNewListings.ts')
    expect(builder).toContain('listingTimestamp')
    expect(builder).toContain('listedAt')
    expect(builder).toContain('sortTs')

    const rows = buildHomeNewListings(12)
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows) {
      expect(row.chainId).toBeGreaterThan(0)
      expect(row.symbol).toBeTruthy()
      expect(row.name).toBeTruthy()
      if (row.listedAt) {
        expect(row.listingTimestamp).toBe(row.listedAt)
      }
      expect(row.metric === METRIC_STATUS.INDEXED || row.metric.length > 0).toBe(true)
    }
    // Multichain expansion includes at least one of the supported LIVE chains.
    const chains = new Set(rows.map((r) => r.chainId))
    expect([...chains].some((id) => SUPPORTED_CHAIN_IDS.includes(id))).toBe(true)
  })

  it('Project directory cards keep Unavailable when metrics missing', () => {
    const card = load('ProjectsStudio/components/ProjectGridCard.tsx')
    expect(card).toContain('METRIC_STATUS.UNAVAILABLE')
    expect(card).toContain('Price')
    expect(card).toContain('Liquidity')
    expect(card).toContain('Volume')
    expect(card).toContain('Holders')
    expect(card).toContain('MelegaExploreChainBadge')
  })
})
