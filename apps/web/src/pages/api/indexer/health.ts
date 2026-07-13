import type { NextApiHandler } from 'next'
import { resolveIndexerStorage } from 'lib/bsc-indexer/storage'
import { getBlockNumber } from 'lib/bsc-indexer/rpc/chunkedLogs'
import { isLeaseActive, readIndexerLease } from 'lib/bsc-indexer/indexer/indexerLease'

const handler: NextApiHandler = async (_req, res) => {
  const storage = resolveIndexerStorage()
  const [health, checkpoint, eventCounts, lease] = await Promise.all([
    storage.loadHealth(),
    storage.loadCheckpoint(),
    storage.countEvents(),
    readIndexerLease(),
  ])
  let chainHead: number | undefined
  try {
    chainHead = await getBlockNumber()
  } catch {
    chainHead = undefined
  }

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
    activeRunType: lease?.runType ?? null,
    activeDeploymentSha: lease?.deploymentSha ?? null,
  })
}

export default handler
