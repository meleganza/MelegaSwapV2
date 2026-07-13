import type { IndexerLease } from './indexerLease'

export function isLeaseActive(lease: IndexerLease | null, now = Date.now()): boolean {
  if (!lease || lease.released || !lease.ownerId) return false
  if (!lease.expiresAt) return false
  return new Date(lease.expiresAt).getTime() > now
}
