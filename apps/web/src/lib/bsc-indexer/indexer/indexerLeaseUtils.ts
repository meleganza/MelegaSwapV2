import type { IndexerLease } from './indexerLease'

/** Renew lease heartbeat at most this often during long orchestrator runs. */
export const INDEXER_LEASE_HEARTBEAT_INTERVAL_MS = 30_000

/** Grace after TTL expiry before treating heartbeat as definitively dead. */
export const INDEXER_LEASE_STALE_GRACE_MS = 5_000

export type LeaseHealth = 'free' | 'healthy' | 'stale'

export function isLeaseActive(lease: IndexerLease | null, now = Date.now()): boolean {
  return classifyLeaseHealth(lease, now) === 'healthy'
}

export function classifyLeaseHealth(lease: IndexerLease | null, now = Date.now()): LeaseHealth {
  if (!lease || lease.released || !lease.ownerId || !lease.expiresAt) return 'free'
  const expiresAt = new Date(lease.expiresAt).getTime()
  if (expiresAt > now) return 'healthy'
  return 'stale'
}

export function isLeaseStale(lease: IndexerLease | null, now = Date.now()): boolean {
  return classifyLeaseHealth(lease, now) === 'stale'
}

/** True when TTL is still valid and heartbeat is recent enough for an active worker. */
export function isLeaseHealthy(lease: IndexerLease | null, now = Date.now()): boolean {
  return classifyLeaseHealth(lease, now) === 'healthy'
}
