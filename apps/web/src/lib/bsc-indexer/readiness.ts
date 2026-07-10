import { resolveIndexerStorage, isProductionDurableStorageConfigured } from './storage'
import { getBlockNumber } from './rpc/chunkedLogs'

export interface ReadinessCheck {
  name: string
  configured: boolean
  status: 'ready' | 'unavailable' | 'blocked'
  reason?: string
}

export interface ProductionReadinessReport {
  timestamp: string
  verdict: 'ready' | 'partial' | 'blocked'
  checks: ReadinessCheck[]
  indexer: {
    storageBackend: string
    storageConfigured: boolean
    durableProductionStorage: boolean
    lastIndexedBlock?: number
    chainHead?: number
    indexingLag?: number
    eventCounts?: Record<string, number>
    lastSuccessfulSync?: string
    lastFailureReason?: string
  }
  vercelSecretsChecklist: string[]
}

function hasEnv(name: string): boolean {
  return Boolean(process.env[name]?.trim())
}

export async function buildProductionReadinessReport(): Promise<ProductionReadinessReport> {
  const storage = resolveIndexerStorage()
  const health = await storage.loadHealth()
  const checkpoint = await storage.loadCheckpoint()
  let chainHead: number | undefined
  try {
    chainHead = await getBlockNumber()
  } catch {
    chainHead = undefined
  }

  const checks: ReadinessCheck[] = [
    {
      name: 'BSC_RPC_URL',
      configured: hasEnv('BSC_RPC_URL'),
      status: hasEnv('BSC_RPC_URL') ? 'ready' : 'unavailable',
      reason: hasEnv('BSC_RPC_URL') ? undefined : 'Dedicated BSC RPC URL not configured',
    },
    {
      name: 'BSC_RPC_FALLBACK_URL',
      configured: hasEnv('BSC_RPC_FALLBACK_URL'),
      status: hasEnv('BSC_RPC_FALLBACK_URL') ? 'ready' : 'unavailable',
      reason: hasEnv('BSC_RPC_FALLBACK_URL') ? undefined : 'Optional RPC fallback not configured',
    },
    {
      name: 'BSCSCAN_API_KEY',
      configured: hasEnv('BSCSCAN_API_KEY'),
      status: hasEnv('BSCSCAN_API_KEY') ? 'ready' : 'unavailable',
      reason: hasEnv('BSCSCAN_API_KEY') ? undefined : 'Server-side BscScan key not configured',
    },
    {
      name: 'BLOB_READ_WRITE_TOKEN',
      configured: isProductionDurableStorageConfigured(),
      status: isProductionDurableStorageConfigured() ? 'ready' : 'blocked',
      reason: isProductionDurableStorageConfigured()
        ? undefined
        : 'Durable indexer storage requires Vercel Blob token in production',
    },
    {
      name: 'INDEXER_CRON_SECRET',
      configured: hasEnv('INDEXER_CRON_SECRET'),
      status: hasEnv('INDEXER_CRON_SECRET') ? 'ready' : 'unavailable',
      reason: hasEnv('INDEXER_CRON_SECRET') ? undefined : 'Protect /api/indexer/run cron endpoint',
    },
  ]

  const durable = isProductionDurableStorageConfigured()
  const hasEvents = Object.values(health?.eventCounts ?? {}).some((n) => n > 0)
  const verdict =
    durable && hasEnv('BSC_RPC_URL') && hasEvents
      ? 'ready'
      : durable || hasEnv('BSC_RPC_URL')
        ? 'partial'
        : 'blocked'

  return {
    timestamp: new Date().toISOString(),
    verdict,
    checks,
    indexer: {
      storageBackend: storage.backend,
      storageConfigured: storage.configured,
      durableProductionStorage: durable,
      lastIndexedBlock: checkpoint?.lastIndexedBlock ?? health?.lastIndexedBlock,
      chainHead,
      indexingLag:
        chainHead && checkpoint?.lastIndexedBlock !== undefined
          ? Math.max(0, chainHead - checkpoint.lastIndexedBlock)
          : health?.indexingLag,
      eventCounts: health?.eventCounts ?? (await storage.countEvents()),
      lastSuccessfulSync: checkpoint?.lastSuccessfulSync ?? health?.lastSuccessfulSync,
      lastFailureReason: checkpoint?.lastFailureReason ?? health?.lastFailureReason,
    },
    vercelSecretsChecklist: [
      'BSC_RPC_URL',
      'BSC_RPC_FALLBACK_URL (optional)',
      'BSCSCAN_API_KEY',
      'BLOB_READ_WRITE_TOKEN',
      'INDEXER_CRON_SECRET',
      'CRON_SECRET (Vercel cron auth header)',
    ],
  }
}
