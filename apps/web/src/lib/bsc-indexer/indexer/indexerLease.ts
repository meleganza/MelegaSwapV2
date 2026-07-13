import { head, put } from '@vercel/blob'
import { INDEXER_V2_ROOT } from '../v2/paths'
import { SAFE_EXECUTION_BUDGET_MS } from './indexerDeadline'
import {
  INDEXER_LEASE_HEARTBEAT_INTERVAL_MS,
  classifyLeaseHealth,
  isLeaseActive,
  isLeaseHealthy,
} from './indexerLeaseUtils'

export {
  INDEXER_LEASE_HEARTBEAT_INTERVAL_MS,
  INDEXER_LEASE_STALE_GRACE_MS,
  classifyLeaseHealth,
  isLeaseActive,
  isLeaseHealthy,
  isLeaseStale,
} from './indexerLeaseUtils'
export type { LeaseHealth } from './indexerLeaseUtils'

const LEASE_KEY = `${INDEXER_V2_ROOT}/orchestrator-lease.json`
/** Must cover full orchestrator budget; renewed on heartbeat during long runs. */
export const INDEXER_LEASE_TTL_MS = SAFE_EXECUTION_BUDGET_MS + 30_000

export interface IndexerLease {
  ownerId: string
  acquiredAt: string
  expiresAt: string
  heartbeatAt: string
  runType: string
  deploymentSha: string
  released?: boolean
}

function leaseToken(): string | null {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || null
}

export async function readIndexerLease(): Promise<IndexerLease | null> {
  const token = leaseToken()
  if (!token) return null
  try {
    const meta = await head(LEASE_KEY, { token })
    const res = await fetch(meta.url, { headers: { authorization: `Bearer ${token}` } })
    if (!res.ok) return null
    return (await res.json()) as IndexerLease
  } catch {
    return null
  }
}

async function writeIndexerLease(lease: IndexerLease | null): Promise<void> {
  const token = leaseToken()
  if (!token) return
  if (!lease) {
    await put(LEASE_KEY, JSON.stringify({ released: true, releasedAt: new Date().toISOString() }), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      token,
    })
    return
  }
  await put(LEASE_KEY, JSON.stringify(lease), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    token,
  })
}

export function buildLeaseOwnerId(runType: string): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local'
  const region = process.env.VERCEL_REGION ?? 'unknown'
  return `${runType}:${sha}:${region}:${Date.now()}`
}

export async function tryAcquireIndexerLease(params: {
  ownerId: string
  runType: string
  deploymentSha: string
  ttlMs?: number
}): Promise<{
  acquired: boolean
  lease: IndexerLease | null
  reason?: string
  recoveredFromStale?: boolean
}> {
  const existing = await readIndexerLease()
  const now = Date.now()
  const health = classifyLeaseHealth(existing, now)

  if (health === 'healthy' && existing!.ownerId !== params.ownerId) {
    return {
      acquired: false,
      lease: existing,
      reason: 'LEASE_ACTIVE_BY_OTHER_WORKER',
    }
  }

  const recoveredFromStale = health === 'stale'
  const ttl = params.ttlMs ?? INDEXER_LEASE_TTL_MS
  const lease: IndexerLease = {
    ownerId: params.ownerId,
    acquiredAt: new Date(now).toISOString(),
    expiresAt: new Date(now + ttl).toISOString(),
    heartbeatAt: new Date(now).toISOString(),
    runType: params.runType,
    deploymentSha: params.deploymentSha,
  }
  await writeIndexerLease(lease)
  return { acquired: true, lease, recoveredFromStale }
}

export async function heartbeatIndexerLease(ownerId: string): Promise<IndexerLease | null> {
  const existing = await readIndexerLease()
  if (!existing || existing.ownerId !== ownerId || !isLeaseHealthy(existing)) return existing
  const now = Date.now()
  const lease: IndexerLease = {
    ...existing,
    heartbeatAt: new Date(now).toISOString(),
    expiresAt: new Date(now + INDEXER_LEASE_TTL_MS).toISOString(),
  }
  await writeIndexerLease(lease)
  return lease
}

export async function releaseIndexerLease(ownerId: string): Promise<void> {
  const existing = await readIndexerLease()
  if (existing?.ownerId === ownerId) {
    await writeIndexerLease(null)
  }
}
