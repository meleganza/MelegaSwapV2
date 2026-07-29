/**
 * LIQUIDITY_MODULE_005 — read-only Market Snapshot data hook.
 * Does not touch mint runtime / router / factory writes.
 */
import { useMemo } from 'react'
import useSWR from 'swr'
import { WBNB } from '@pancakeswap/sdk'
import { useProtocolDataSWR } from 'state/info/hooks'
import useBUSDPrice from 'hooks/useBUSDPrice'
import { useMelegaFactoryPools } from 'views/PoolsStudio/poolsRuntime/useMelegaFactoryPools'
import { MELEGA_CHAIN_ID } from 'lib/bsc-indexer/constants'
import { buildLiquidityMarketSnapshot, type LiquidityMarketSnapshotView } from './buildLiquidityMarketSnapshot'
import { estimateReserveTvlUsd } from './liquidityPoolDiscoveryModel'

type TierMetricsResponse = {
  rows?: Array<{ volume24hQuote?: number | null }>
}

async function fetchTierMetrics(url: string): Promise<TierMetricsResponse> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`tier-metrics ${res.status}`)
  return res.json()
}

export function useLiquidityMarketSnapshot(): LiquidityMarketSnapshotView {
  const protocol = useProtocolDataSWR()
  const factory = useMelegaFactoryPools(MELEGA_CHAIN_ID)
  const wbnbPrice = useBUSDPrice(WBNB[56])
  const bnbUsd = wbnbPrice ? Number(wbnbPrice.toSignificant(6)) : undefined
  const { data: tierMetrics } = useSWR('/api/indexer/tier-metrics', fetchTierMetrics, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
  })

  const factoryTvlUsd = useMemo(() => {
    if (factory.discoveryState !== 'ready' || factory.pools.length === 0) return null
    let sum = 0
    let any = false
    for (const pool of factory.pools) {
      const tvl = estimateReserveTvlUsd(pool, bnbUsd)
      if (tvl != null && tvl > 0) {
        sum += tvl
        any = true
      }
    }
    return any ? sum : null
  }, [factory.discoveryState, factory.pools, bnbUsd])

  const indexerVolume24hUsd = useMemo(() => {
    if (!bnbUsd || !(bnbUsd > 0) || !tierMetrics?.rows?.length) return null
    let quoteSum = 0
    let any = false
    for (const row of tierMetrics.rows) {
      const q = row.volume24hQuote
      if (q != null && Number.isFinite(q) && q > 0) {
        quoteSum += q
        any = true
      }
    }
    return any ? quoteSum * bnbUsd : null
  }, [tierMetrics, bnbUsd])

  return useMemo(
    () =>
      buildLiquidityMarketSnapshot({
        protocolLoading: false,
        protocol: protocol ?? null,
        factoryLoading: factory.discoveryState === 'loading',
        factoryReady: factory.discoveryState === 'ready',
        factoryUnavailable:
          factory.discoveryState === 'unavailable' || factory.discoveryState === 'unsupported_chain',
        pools: factory.pools,
        factoryFreshness: factory.freshness,
        factoryTvlUsd,
        indexerVolume24hUsd,
      }),
    [protocol, factory.discoveryState, factory.pools, factory.freshness, factoryTvlUsd, indexerVolume24hUsd],
  )
}
