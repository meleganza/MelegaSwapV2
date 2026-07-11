import { resolveIndexerStorage, isProductionDurableStorageConfigured, verifyBlobRoundTrip } from './storage'
import { getBlockNumber } from './rpc/chunkedLogs'
import { loadRegistryFromDisk, loadRegistryMeta, resolveOnchainRegistry } from './registry/store'
import { INDEXER_SCHEMA_VERSION, FEATURED_PAIR_SLUG } from './constants'
import { LEGACY_INDEXER_NOTE } from './v2/paths'
import { MELEGA_SUBGRAPH_URL } from 'config/constants/endpoints'

export type ReadinessComponentStatus =
  | 'READY'
  | 'BLOCKED'
  | 'DEFERRED'
  | 'OPTIONAL_UNAVAILABLE'
  | 'NOT_CONFIGURED'
  | 'SYNCING'

export interface ReadinessCheck {
  name: string
  configured: boolean
  status: 'ready' | 'unavailable' | 'blocked'
  reason?: string
}

export interface ProductionReadinessReport {
  timestamp: string
  verdict: 'ready' | 'partial' | 'blocked'
  components: {
    registryDiscovery: ReadinessComponentStatus
    featuredPairIndexer: ReadinessComponentStatus
    multiPairHistoricalIndexer: ReadinessComponentStatus
    holderProvider: ReadinessComponentStatus
    subgraph: ReadinessComponentStatus
  }
  checks: ReadinessCheck[]
  indexer: {
    storageBackend: string
    storageConfigured: boolean
    durableProductionStorage: boolean
    indexerGeneration: 'v2-featured-pair' | 'legacy-universal'
    legacyNote: string
    blobRoundTrip?: { ok: boolean; reason?: string }
    rpcPrimary?: { ok: boolean; chainHead?: number; reason?: string }
    rpcFallback?: { ok: boolean; chainHead?: number; reason?: string }
    lastIndexedBlock?: number
    chainHead?: number
    indexingLag?: number
    eventCounts?: Record<string, number>
    lastSuccessfulSync?: string
    lastFailureReason?: string
    featuredPairSlug?: string
    phase?: string
    bootstrapStartBlock?: number
    bootstrapDays?: number
    providerUsed?: string
    registrySource?: string
    registryPairCount?: number
    registryRefreshedAt?: string
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

  const { registry, source: registrySource } = await resolveOnchainRegistry()
  const diskRegistry = loadRegistryFromDisk()
  const registryMeta = await loadRegistryMeta()
  const registryPairCount = registry?.amm?.count ?? diskRegistry?.amm?.count ?? 0

  const eventCounts = health?.eventCounts ?? (await storage.countEvents())
  const hasEvents = Object.values(eventCounts).some((n) => n > 0)
  const isV2 = checkpoint?.schemaVersion === INDEXER_SCHEMA_VERSION || storage.backend.includes('v2')

  const subgraphStatus: ReadinessComponentStatus = MELEGA_SUBGRAPH_URL ? 'READY' : 'NOT_CONFIGURED'

  const registryDiscovery: ReadinessComponentStatus =
    registryPairCount >= 500 ? 'READY' : registryPairCount > 0 ? 'READY' : 'BLOCKED'

  let featuredPairIndexer: ReadinessComponentStatus = 'BLOCKED'
  if (!durable || !rpcPrimary.ok) {
    featuredPairIndexer = 'BLOCKED'
  } else if (hasEvents && !health?.lastFailureReason && !checkpoint?.lastFailureReason) {
    featuredPairIndexer = 'READY'
  } else if (health?.status === 'syncing' || checkpoint?.phase === 'bootstrap') {
    featuredPairIndexer = 'SYNCING'
  } else if (health?.lastFailureReason) {
    featuredPairIndexer = 'BLOCKED'
  } else {
    featuredPairIndexer = 'SYNCING'
  }

  const holderProvider: ReadinessComponentStatus = hasEnv('BSCSCAN_API_KEY') ? 'READY' : 'OPTIONAL_UNAVAILABLE'

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
      reason: hasEnv('BSCSCAN_API_KEY') ? undefined : 'Server-side BscScan key not configured (holders optional)',
    },
    {
      name: 'BLOB_READ_WRITE_TOKEN',
      configured: isProductionDurableStorageConfigured(),
      status: isProductionDurableStorageConfigured() ? 'ready' : 'blocked',
      reason: isProductionDurableStorageConfigured()
        ? undefined
        : 'Durable featured-pair cache requires Vercel Blob token in production',
    },
    {
      name: 'INDEXER_CRON_SECRET',
      configured: hasEnv('INDEXER_CRON_SECRET'),
      status: hasEnv('INDEXER_CRON_SECRET') ? 'ready' : 'unavailable',
      reason: hasEnv('INDEXER_CRON_SECRET') ? undefined : 'Protect /api/indexer/run cron endpoint',
    },
  ]

  const coreIndexerReady = featuredPairIndexer === 'READY'
  const registryReady = registryDiscovery === 'READY'
  const verdict =
    registryReady && coreIndexerReady && durable && blobRoundTrip.ok && rpcPrimary.ok
      ? 'ready'
      : registryReady && durable && rpcPrimary.ok
        ? 'partial'
        : 'blocked'

  return {
    timestamp: new Date().toISOString(),
    verdict,
    components: {
      registryDiscovery,
      featuredPairIndexer,
      multiPairHistoricalIndexer: 'DEFERRED',
      holderProvider,
      subgraph: subgraphStatus,
    },
    checks,
    indexer: {
      storageBackend: storage.backend,
      storageConfigured: storage.configured,
      durableProductionStorage: durable,
      indexerGeneration: isV2 ? 'v2-featured-pair' : 'legacy-universal',
      legacyNote: LEGACY_INDEXER_NOTE,
      blobRoundTrip,
      rpcPrimary,
      rpcFallback,
      lastIndexedBlock: checkpoint?.lastIndexedBlock ?? health?.lastIndexedBlock,
      chainHead,
      indexingLag:
        chainHead && checkpoint?.lastIndexedBlock !== undefined
          ? Math.max(0, chainHead - checkpoint.lastIndexedBlock)
          : health?.indexingLag,
      eventCounts,
      lastSuccessfulSync: checkpoint?.lastSuccessfulSync ?? health?.lastSuccessfulSync,
      lastFailureReason: checkpoint?.lastFailureReason ?? health?.lastFailureReason,
      featuredPairSlug: checkpoint?.featuredPairSlug ?? FEATURED_PAIR_SLUG,
      phase: checkpoint?.phase ?? health?.phase,
      bootstrapStartBlock: checkpoint?.bootstrapStartBlock ?? health?.bootstrapStartBlock,
      bootstrapDays: checkpoint?.bootstrapDays ?? health?.bootstrapDays,
      providerUsed: checkpoint?.providerUsed ?? health?.providerUsed,
      registrySource,
      registryPairCount,
      registryRefreshedAt: registryMeta?.refreshedAt ?? registry?.generatedAt,
    },
    vercelSecretsChecklist: [
      'BSC_RPC_URL',
      'BSC_RPC_FALLBACK_URL (optional)',
      'BSCSCAN_API_KEY (optional — holders)',
      'BLOB_READ_WRITE_TOKEN',
      'INDEXER_CRON_SECRET',
      'CRON_SECRET (Vercel cron auth header)',
    ],
  }
}
