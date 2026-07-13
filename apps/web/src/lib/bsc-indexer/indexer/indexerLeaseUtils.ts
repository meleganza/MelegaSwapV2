import type { IndexerLease } from './indexerLease'

export function isLeaseActive(lease: IndexerLease | null, now = Date.now()): boolean {
  if (!lease?.expiresAt || !lease.ownerId) return false
  return new Date(lease.expiresAt).getTime() > now
}
