import type { IndexerCheckpoint, IndexerHealthSnapshot } from './types'
import { MELEGA_FACTORY_BSC, MELEGA_CHAIN_ID } from './constants'
import { bootstrapWindowSummary } from './indexer/coverageRanges'
import { REORG_SAFETY_BLOCKS } from './constants'

export type MarketIndexCanonicalStatus =
  | 'CONNECTED'
  | 'BACKFILLING'
  | 'PARTIAL'
  | 'UNAVAILABLE'
  | 'MISCONFIGURED'

export type MarketIndexHealth = {
  schemaVersion: 'melega.market-index-health.v1'
  chainId: number
  factoryAddress: string
  pairCountDiscovered: number
  pairCountIndexed: number
  lastIndexedBlock: number
  currentChainHead: number | null
  blockLag: number | null
  backfillStatus: 'complete' | 'in_progress' | 'not_started' | 'unknown'
  lastSuccessfulRunAt: string | null
  lastError: string | null
  swapEventCount: number
  mintEventCount: number
  burnEventCount: number
  candleCount: number
  trailing24hSwapCount: number
  trailing24hActivePairs: number
  status: MarketIndexCanonicalStatus
  readiness: {
    indexServiceReachable: boolean
    recentIndexingProgressing: boolean
    trailing24hWindowReady: boolean
    productMetricsReady: boolean
  }
  storageBackend: string
  storageConfigured: boolean
  phase?: string
  resetReason?: string
}

export function classifyMarketIndexStatus(input: {
  storageConfigured: boolean
  lastIndexedBlock: number
  swapEventCount: number
  phase?: string
  coveragePercent?: number
  trailing24hSwapCount: number
  blockLag: number | null
}): MarketIndexCanonicalStatus {
  if (!input.storageConfigured && input.lastIndexedBlock <= 0 && input.swapEventCount <= 0) {
    return 'MISCONFIGURED'
  }
  if (input.lastIndexedBlock <= 0 && input.swapEventCount <= 0) {
    return 'UNAVAILABLE'
  }
  if (input.phase === 'bootstrap' || (input.coveragePercent != null && input.coveragePercent < 95)) {
    return 'BACKFILLING'
  }
  if (input.swapEventCount > 0 && input.trailing24hSwapCount === 0) {
    return 'PARTIAL'
  }
  if (input.blockLag != null && input.blockLag > 5_000) {
    return 'PARTIAL'
  }
  if (input.swapEventCount > 0 && input.lastIndexedBlock > 0) {
    return 'CONNECTED'
  }
  return 'PARTIAL'
}

export function buildMarketIndexHealth(params: {
  storageBackend: string
  storageConfigured: boolean
  checkpoint: IndexerCheckpoint | null
  health: IndexerHealthSnapshot | null
  eventCounts: Record<string, number>
  chainHead?: number
  pairCountDiscovered: number
  pairCountIndexed: number
  candleCount: number
  trailing24hSwapCount: number
  trailing24hActivePairs: number
}): MarketIndexHealth {
  const lastIndexedBlock = params.checkpoint?.lastIndexedBlock ?? params.health?.lastIndexedBlock ?? 0
  const blockLag =
    params.chainHead != null && lastIndexedBlock > 0
      ? Math.max(0, params.chainHead - lastIndexedBlock)
      : params.health?.indexingLag ?? null

  const floor = params.checkpoint?.bootstrapStartBlock ?? 0
  const high = Math.max(0, (params.checkpoint?.chainHeadAtSync ?? params.chainHead ?? 0) - REORG_SAFETY_BLOCKS)
  const coverage = bootstrapWindowSummary(params.checkpoint?.coverageRanges ?? [], floor, high)
  const swapEventCount = params.eventCounts.Swap ?? 0
  const status = classifyMarketIndexStatus({
    storageConfigured: params.storageConfigured,
    lastIndexedBlock,
    swapEventCount,
    phase: params.checkpoint?.phase ?? params.health?.phase,
    coveragePercent: coverage.coveragePercent,
    trailing24hSwapCount: params.trailing24hSwapCount,
    blockLag,
  })

  const backfillStatus =
    params.checkpoint?.phase === 'bootstrap'
      ? coverage.coveragePercent > 0
        ? 'in_progress'
        : 'not_started'
      : coverage.coveragePercent >= 95
        ? 'complete'
        : params.checkpoint
          ? 'in_progress'
          : 'unknown'

  const recentIndexingProgressing = Boolean(
    params.health?.lastOrchestratorRun?.ok ||
      (params.checkpoint?.lastSuccessfulSync &&
        Date.now() - Date.parse(params.checkpoint.lastSuccessfulSync) < 30 * 60_000),
  )

  return {
    schemaVersion: 'melega.market-index-health.v1',
    chainId: MELEGA_CHAIN_ID,
    factoryAddress: MELEGA_FACTORY_BSC,
    pairCountDiscovered: params.pairCountDiscovered,
    pairCountIndexed: params.pairCountIndexed,
    lastIndexedBlock,
    currentChainHead: params.chainHead ?? null,
    blockLag,
    backfillStatus,
    lastSuccessfulRunAt: params.checkpoint?.lastSuccessfulSync ?? params.health?.lastSuccessfulSync ?? null,
    lastError: params.checkpoint?.lastFailureReason ?? params.health?.lastFailureReason ?? null,
    swapEventCount,
    mintEventCount: params.eventCounts.Mint ?? 0,
    burnEventCount: params.eventCounts.Burn ?? 0,
    candleCount: params.candleCount,
    trailing24hSwapCount: params.trailing24hSwapCount,
    trailing24hActivePairs: params.trailing24hActivePairs,
    status,
    readiness: {
      indexServiceReachable: params.storageConfigured || lastIndexedBlock > 0,
      recentIndexingProgressing,
      trailing24hWindowReady: params.trailing24hSwapCount > 0,
      productMetricsReady: params.trailing24hSwapCount > 0 && status === 'CONNECTED',
    },
    storageBackend: params.storageBackend,
    storageConfigured: params.storageConfigured,
    phase: params.checkpoint?.phase ?? params.health?.phase,
    resetReason: params.checkpoint?.resetReason,
  }
}
