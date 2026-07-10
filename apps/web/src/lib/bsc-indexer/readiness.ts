import { resolveIndexerStorage, isProductionDurableStorageConfigured, verifyBlobRoundTrip } from './storage'
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
    blobRoundTrip?: { ok: boolean; reason?: string }
    rpcPrimary?: { ok: boolean; chainHead?: number; reason?: string }
    rpcFallback?: { ok: boolean; chainHead?: number; reason?: string }
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
  const durable = isProductionDurableStorageConfigured()
  let chainHead: number | undefined
  let rpcPrimary: { ok: boolean; chainHead?: number; reason?: string } = { ok: false }
  let rpcFallback: { ok: boolean; chainHead?: number; reason?: string } = { ok: false }
  const blobRoundTrip = durable ? await verifyBlobRoundTrip() : { ok: false, reason: 'Blob token not configured' }

  try {
    const primaryUrl = process.env.BSC_RPC_URL?.trim()
    if (primaryUrl) {
      chainHead = await getBlockNumber([primaryUrl])
      rpcPrimary = { ok: true, chainHead }
    } else {
      rpcPrimary = { ok: false, reason: 'BSC_RPC_URL missing' }
    }
  } catch (e) {
    rpcPrimary = { ok: false, reason: e instanceof Error ? e.message : 'Primary RPC failed' }
  }

  const fallbackUrl = process.env.BSC_RPC_FALLBACK_URL?.trim()
  if (fallbackUrl) {
    try {
      const fbHead = await getBlockNumber([fallbackUrl])
      rpcFallback = { ok: true, chainHead: fbHead }
      if (!chainHead) chainHead = fbHead
    } catch (e) {
      rpcFallback = { ok: false, reason: e instanceof Error ? e.message : 'Fallback RPC failed' }
    }
  } else {
    rpcFallback = { ok: false, reason: 'BSC_RPC_FALLBACK_URL not configured' }
  }

  if (!chainHead) {
    try {
      chainHead = await getBlockNumber()
    } catch {
      chainHead = undefined
    }
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

  const hasEvents = Object.values(health?.eventCounts ?? {}).some((n) => n > 0)
  const verdict =
    durable && hasEnv('BSC_RPC_URL') && blobRoundTrip.ok && rpcPrimary.ok && hasEvents
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
      blobRoundTrip,
      rpcPrimary,
      rpcFallback,
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
