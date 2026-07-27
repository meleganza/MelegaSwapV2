/**
 * LIQUIDITY_MODULE_005 — read-only Market Snapshot data hook.
 * Does not touch mint runtime / router / factory writes.
 */
import { useMemo } from 'react'
import { useProtocolDataSWR } from 'state/info/hooks'
import { useMelegaFactoryPools } from 'views/PoolsStudio/poolsRuntime/useMelegaFactoryPools'
import { MELEGA_CHAIN_ID } from 'lib/bsc-indexer/constants'
import { buildLiquidityMarketSnapshot, type LiquidityMarketSnapshotView } from './buildLiquidityMarketSnapshot'

export function useLiquidityMarketSnapshot(): LiquidityMarketSnapshotView {
  const protocol = useProtocolDataSWR()
  const factory = useMelegaFactoryPools(MELEGA_CHAIN_ID)

  return useMemo(
    () =>
      buildLiquidityMarketSnapshot({
        // Protocol hook returns undefined for both loading and missing — never invent.
        // Show unavailable (—) until a positive factual value arrives.
        protocolLoading: false,
        protocol: protocol ?? null,
        factoryLoading: factory.discoveryState === 'loading',
        factoryReady: factory.discoveryState === 'ready',
        factoryUnavailable:
          factory.discoveryState === 'unavailable' || factory.discoveryState === 'unsupported_chain',
        pools: factory.pools,
        factoryFreshness: factory.freshness,
      }),
    [protocol, factory.discoveryState, factory.pools, factory.freshness],
  )
}
