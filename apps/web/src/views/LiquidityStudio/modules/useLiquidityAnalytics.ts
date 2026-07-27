/**
 * LIQUIDITY_MODULE_007 — read-only Analytics data hook.
 * Does not touch mint / positions / router / factory writes.
 */
import { useMemo } from 'react'
import { useProtocolDataSWR } from 'state/info/hooks'
import { useProtocolTransactionsIndexer } from 'lib/runtime-indexing'
import { useMelegaFactoryPools } from 'views/PoolsStudio/poolsRuntime/useMelegaFactoryPools'
import { MELEGA_CHAIN_ID } from 'lib/bsc-indexer/constants'
import { buildLiquidityAnalytics, type LiquidityAnalyticsView } from './buildLiquidityAnalytics'

export function useLiquidityAnalytics(): LiquidityAnalyticsView {
  const protocol = useProtocolDataSWR()
  const factory = useMelegaFactoryPools(MELEGA_CHAIN_ID)
  const { transactions, indexerState } = useProtocolTransactionsIndexer()

  return useMemo(() => {
    const activityLoading = indexerState.status === 'loading'
    const activityReady = indexerState.status === 'ready'
    const activityUnavailable =
      indexerState.status === 'unavailable' || indexerState.status === 'error'

    return buildLiquidityAnalytics({
      // Protocol hook returns undefined for both loading and missing — never invent.
      protocolLoading: false,
      protocol: protocol ?? null,
      factoryLoading: factory.discoveryState === 'loading',
      factoryReady: factory.discoveryState === 'ready',
      factoryUnavailable:
        factory.discoveryState === 'unavailable' || factory.discoveryState === 'unsupported_chain',
      pools: factory.pools,
      factoryFreshness: factory.freshness,
      activityLoading,
      activityReady,
      activityUnavailable,
      transactions: activityReady ? transactions ?? [] : null,
      activitySource: indexerState.source || undefined,
    })
  }, [
    protocol,
    factory.discoveryState,
    factory.pools,
    factory.freshness,
    transactions,
    indexerState.status,
    indexerState.source,
  ])
}
