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
  rows?: Array<{
    volume24hWbnb?: number | null
    volume24hQuote?: number | null
    volume24hBase?: number | null
    token0?: string
    token1?: string
  }>
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
    // Dynamic import avoided — inline WBNB side check matching canonical24hVolume.
    const WBNB_ADDR = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
    let wbnbSum = 0
    let any = false
    for (const row of tierMetrics.rows) {
      let wbnb = Number(row.volume24hWbnb) || 0
      if (!(wbnb > 0)) {
        const t0 = (row.token0 || '').toLowerCase()
        const t1 = (row.token1 || '').toLowerCase()
        if (t1 === WBNB_ADDR) wbnb = Number(row.volume24hQuote) || 0
        else if (t0 === WBNB_ADDR) wbnb = Number(row.volume24hBase) || 0
      }
      if (wbnb > 0) {
        wbnbSum += wbnb
        any = true
      }
    }
    const usd = any ? wbnbSum * bnbUsd : null
    // Reject implausible DEX totals (same guard as Home).
    if (usd != null && usd > 10_000_000_000) return null
    return usd
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
    [
      protocol,
      factory.discoveryState,
      factory.pools,
      factory.freshness,
      factoryTvlUsd,
      indexerVolume24hUsd,
    ],
  )
}
