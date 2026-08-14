/**
 * LIQUIDITY_MODULE_005 — read-only Market Snapshot data hook.
 * Does not touch mint runtime / router / factory writes.
 * 24H volume comes from the certified canonical market snapshot (same as Home).
 */
import { useMemo } from 'react'
import { WBNB } from '@pancakeswap/sdk'
import { useProtocolDataSWR } from 'state/info/hooks'
import useBUSDPrice from 'hooks/useBUSDPrice'
import { useMelegaFactoryPools } from 'views/PoolsStudio/poolsRuntime/useMelegaFactoryPools'
import { MELEGA_CHAIN_ID } from 'lib/bsc-indexer/constants'
import { useCanonicalMarketSnapshot } from 'lib/market-data'
import { buildLiquidityMarketSnapshot, type LiquidityMarketSnapshotView } from './buildLiquidityMarketSnapshot'
import { estimateReserveTvlUsd } from './liquidityPoolDiscoveryModel'

export function useLiquidityMarketSnapshot(): LiquidityMarketSnapshotView {
  const protocol = useProtocolDataSWR()
  const factory = useMelegaFactoryPools(MELEGA_CHAIN_ID)
  const wbnbPrice = useBUSDPrice(WBNB[56])
  const bnbUsd = wbnbPrice ? Number(wbnbPrice.toSignificant(6)) : undefined
  const marketSnapshot = useCanonicalMarketSnapshot()

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

  const indexerVolume24hUsd =
    marketSnapshot.volume24hUsd != null && marketSnapshot.volume24hUsd > 0
      ? marketSnapshot.volume24hUsd
      : null

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
