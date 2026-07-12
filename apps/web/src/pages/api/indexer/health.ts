import type { NextApiHandler } from 'next'
import { resolveIndexerStorage } from 'lib/bsc-indexer/storage'
import { getBlockNumber } from 'lib/bsc-indexer/rpc/chunkedLogs'

const handler: NextApiHandler = async (_req, res) => {
  const storage = resolveIndexerStorage()
  const [health, checkpoint, eventCounts] = await Promise.all([
    storage.loadHealth(),
    storage.loadCheckpoint(),
    storage.countEvents(),
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
  })
}

export default handler
