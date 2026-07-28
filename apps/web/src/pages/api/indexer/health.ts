import type { NextApiHandler } from 'next'
import { resolveIndexerStorage } from 'lib/bsc-indexer/storage'
import { getBlockNumber } from 'lib/bsc-indexer/rpc/chunkedLogs'
import {
  classifyLeaseHealth,
  INDEXER_LEASE_HEARTBEAT_INTERVAL_MS,
  INDEXER_LEASE_TTL_MS,
  isLeaseActive,
  readIndexerLease,
} from 'lib/bsc-indexer/indexer/indexerLease'
import { buildMarketIndexHealth } from 'lib/bsc-indexer/marketIndexHealth'
import { resolveOnchainRegistry } from 'lib/bsc-indexer/registry/store'
import { loadTierPairInventory } from 'lib/bsc-indexer/indexer/tierInventory'
import { resolveIndexerStorageForSlug } from 'lib/bsc-indexer/storage'
import { MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'
import { FEATURED_PAIR_SLUG } from 'lib/bsc-indexer/v2/paths'
import { slugFromPairAddress } from 'lib/bsc-indexer/v2/pairSlug'

const SECONDS_24H = 86_400

const handler: NextApiHandler = async (_req, res) => {
  const storage = resolveIndexerStorage()
  const [health, checkpoint, eventCounts, lease, registryBundle, inventory] = await Promise.all([
    storage.loadHealth(),
    storage.loadCheckpoint(),
    storage.countEvents(),
    readIndexerLease(),
    resolveOnchainRegistry(),
    loadTierPairInventory(),
  ])
  let chainHead: number | undefined
  try {
    chainHead = await getBlockNumber()
  } catch {
    chainHead = undefined
  }

  const cutoff = Math.floor(Date.now() / 1000) - SECONDS_24H
  const universe = [...inventory.tier1, ...inventory.tier2]
  let trailing24hSwapCount = 0
  let trailing24hActivePairs = 0
  let candleCount = 0
  let pairCountIndexed = 0

  for (const watch of universe) {
    const slug =
      watch.pairAddress.toLowerCase() === MARCO_WBNB_PAIR_BSC.toLowerCase()
        ? FEATURED_PAIR_SLUG
        : slugFromPairAddress(watch.pairAddress, watch.token0, watch.token1)
    try {
      const slugStorage = resolveIndexerStorageForSlug(slug)
      const [counts, events, candles] = await Promise.all([
        slugStorage.countEvents(),
        slugStorage.listEvents({ pairAddress: watch.pairAddress, limit: 500 }),
        slugStorage.listCandles(watch.pairAddress, '1H', 48),
      ])
      const swaps = events.filter((e) => e.eventType === 'Swap' && e.blockTimestamp >= cutoff)
      if ((counts.Swap ?? 0) > 0) pairCountIndexed += 1
      trailing24hSwapCount += swaps.length
      if (swaps.length > 0) trailing24hActivePairs += 1
      candleCount += candles.length
    } catch {
      // ignore per-slug read failures
    }
  }

  const marketIndex = buildMarketIndexHealth({
    storageBackend: storage.backend,
    storageConfigured: storage.configured,
    checkpoint,
    health,
    eventCounts,
    chainHead,
    pairCountDiscovered: registryBundle.registry?.amm?.pairs?.length ?? 0,
    pairCountIndexed,
    candleCount,
    trailing24hSwapCount,
    trailing24hActivePairs,
  })

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30')
  return res.status(200).json({
    status: health?.status ?? 'unavailable',
    indexerGeneration: health?.indexerGeneration ?? (checkpoint?.schemaVersion === 2 ? 'v2-featured-pair' : 'legacy-universal'),
    featuredPairSlug: health?.featuredPairSlug ?? checkpoint?.featuredPairSlug,
    phase: health?.phase ?? checkpoint?.phase,
    providerUsed: health?.providerUsed ?? checkpoint?.providerUsed,
    indexedBlockRange: health?.indexedBlockRange,
    bootstrapStartBlock: health?.bootstrapStartBlock ?? checkpoint?.bootstrapStartBlock,
    bootstrapDays: health?.bootstrapDays ?? checkpoint?.bootstrapDays,
    storageBackend: storage.backend,
    storageConfigured: storage.configured,
    lastIndexedBlock: checkpoint?.lastIndexedBlock ?? health?.lastIndexedBlock ?? 0,
    chainHead,
    indexingLag:
      chainHead && checkpoint?.lastIndexedBlock !== undefined
        ? Math.max(0, chainHead - checkpoint.lastIndexedBlock)
        : health?.indexingLag,
    lastSuccessfulSync: checkpoint?.lastSuccessfulSync ?? health?.lastSuccessfulSync,
    lastFailureReason: checkpoint?.lastFailureReason ?? health?.lastFailureReason,
    eventCounts,
    lastOrchestratorRun: health?.lastOrchestratorRun,
    lockState: isLeaseActive(lease) ? 'held' : 'free',
    lockOwner: lease?.ownerId ?? null,
    lockAcquiredAt: lease?.acquiredAt ?? null,
    lockExpiresAt: lease?.expiresAt ?? null,
    lockHeartbeatAt: lease?.heartbeatAt ?? null,
    lockHealth: classifyLeaseHealth(lease),
    leaseTtlMs: INDEXER_LEASE_TTL_MS,
    leaseHeartbeatIntervalMs: INDEXER_LEASE_HEARTBEAT_INTERVAL_MS,
    activeRunType: lease?.runType ?? null,
    activeDeploymentSha: lease?.deploymentSha ?? null,
    marketIndex,
  })
}

export default handler
