import { fingerprint } from '../evidence/evidenceId'

/**
 * Deterministic update identity from immutable coordinates.
 * Does not use mutable display labels alone.
 */
export function buildUpdateId(parts: {
  projectId: string
  stableKey: string
  version: string
  publishedAt: string
  category: string
}): string {
  const payload = [parts.projectId, parts.stableKey, parts.version, parts.publishedAt, parts.category].join('\u001f')
  return `upd_${fingerprint(payload)}`
}

export function buildUpdateRevision(parts: {
  updateId: string
  status: string
  updatedAt: string | null
  contentFingerprint: string
  supersedesUpdate: string | null
}): string {
  return fingerprint(
    [parts.updateId, parts.status, parts.updatedAt ?? '', parts.contentFingerprint, parts.supersedesUpdate ?? ''].join(
      '|',
    ),
  )
}
