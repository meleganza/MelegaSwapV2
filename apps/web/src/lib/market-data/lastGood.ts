/**
 * Server-process last-good retention for canonical market snapshot.
 * Never fabricates values — only retains the last sanity-passing publish.
 */

import type { CanonicalMarketSnapshot } from './types'

let lastGood: CanonicalMarketSnapshot | null = null

const MAX_AGE_MS = 6 * 60 * 60 * 1000

export function readLastGoodMarketSnapshot(): CanonicalMarketSnapshot | null {
  if (!lastGood) return null
  const age = Date.now() - Date.parse(lastGood.generatedAt)
  if (!Number.isFinite(age) || age > MAX_AGE_MS) return null
  return lastGood
}

export function writeLastGoodMarketSnapshot(snapshot: CanonicalMarketSnapshot): void {
  if (!snapshot.sanity.ok) return
  lastGood = { ...snapshot, fromLastGood: false, status: 'LIVE' }
}

export function publishOrRetain(
  candidate: CanonicalMarketSnapshot,
): CanonicalMarketSnapshot {
  if (candidate.sanity.ok) {
    writeLastGoodMarketSnapshot(candidate)
    return { ...candidate, status: candidate.sanity.degraded ? 'DEGRADED' : 'LIVE' }
  }
  const prior = readLastGoodMarketSnapshot()
  if (prior) {
    return {
      ...prior,
      fromLastGood: true,
      status: 'LAST_GOOD',
      sanity: {
        ok: true,
        degraded: true,
        issues: [
          ...candidate.sanity.issues,
          { code: 'RETAINED_LAST_GOOD', detail: prior.snapshotId, severity: 'warn' },
        ],
      },
    }
  }
  return { ...candidate, status: 'UNAVAILABLE' }
}
