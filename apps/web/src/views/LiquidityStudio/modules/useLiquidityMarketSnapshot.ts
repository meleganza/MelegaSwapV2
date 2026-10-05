/**
 * LIQUIDITY_MODULE_005 — read-only Market Snapshot data hook.
 * Does not touch mint runtime / router / factory writes.
 * 24H volume comes from the certified canonical market snapshot (same as Home).
 */
import { useMemo } from 'react'
import { useProtocolDataSWR } from 'state/info/hooks'
import { useCanonicalMarketSnapshot } from 'lib/market-data'
import { useGlobalLiquiditySnapshot } from 'lib/global-liquidity/useGlobalLiquiditySnapshot'
import { buildLiquidityMarketSnapshot, type LiquidityMarketSnapshotView } from './buildLiquidityMarketSnapshot'

export function useLiquidityMarketSnapshot(): LiquidityMarketSnapshotView {
  const protocol = useProtocolDataSWR()
  const { data: globalLiquidity, error: globalError, isLoading: globalLoading } = useGlobalLiquiditySnapshot()
  const marketSnapshot = useCanonicalMarketSnapshot()

  const indexerVolume24hUsd =
    marketSnapshot.volume24hUsd != null && marketSnapshot.volume24hUsd > 0
      ? marketSnapshot.volume24hUsd
      : null

  return useMemo(
    () =>
      buildLiquidityMarketSnapshot({
        protocolLoading: globalLoading,
        protocol: protocol ?? null,
        factoryLoading: globalLoading,
        factoryReady: globalLiquidity?.status === 'complete',
        factoryUnavailable: Boolean(globalError) || globalLiquidity?.status !== 'complete',
        pools: [],
        factoryFreshness: globalLiquidity?.sourceTimestamp,
        factoryTvlUsd:
          globalLiquidity?.status === 'complete' ? Number(globalLiquidity.totalPricedTvlUsd) : null,
        factoryPoolCount: globalLiquidity?.status === 'complete' ? globalLiquidity.uniquePairCount : null,
        unpricedPoolCount: globalLiquidity?.unpricedPairCount ?? null,
        chainCount: globalLiquidity?.status === 'complete' ? globalLiquidity.chains.length : null,
        indexerVolume24hUsd,
      }),
    [
      protocol,
      globalLoading,
      globalError,
      globalLiquidity,
      indexerVolume24hUsd,
    ],
  )
}
