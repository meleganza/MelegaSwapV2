import { ACTIVE_EVIDENCE_STATUSES, type EvidenceClaimType, type EvidenceStatus } from './schema'
import { buildConflictGroupId, subjectKey } from './evidenceId'
import { normalizeClaimValue } from './normalizeClaim'
import type { EvidenceConflictSummary, EvidenceSubjectRef, ProjectEvidenceRecord } from './types'

const CONFLICT_ELIGIBLE: ReadonlySet<EvidenceClaimType> = new Set([
  'PROJECT_IDENTITY',
  'PROJECT_NAME',
  'PROJECT_PURPOSE',
  'PROJECT_TYPE',
  'PROJECT_LIFECYCLE_STATUS',
  'OFFICIAL_WEBSITE',
  'SUPPORTED_CHAIN',
  'ASSET_IDENTITY',
  'CONTRACT_IDENTITY',
  'CONTRACT_CLASSIFICATION',
  'MELEGA_VERIFICATION',
])

function isActive(status: EvidenceStatus): boolean {
  return (ACTIVE_EVIDENCE_STATUSES as readonly string[]).includes(status)
}

/**
 * Detect conflicts among active public evidence for supported claim types.
 * Does not silently select a winner. Assigns deterministic conflictGroupId.
 */
export function detectEvidenceConflicts(records: ProjectEvidenceRecord[]): {
  records: ProjectEvidenceRecord[]
  conflicts: EvidenceConflictSummary[]
} {
  const groups = new Map<string, ProjectEvidenceRecord[]>()

  for (const record of records) {
    if (record.visibility !== 'PUBLIC') continue
    if (!isActive(record.status) && record.status !== 'EXPIRED') continue
    if (record.status === 'REJECTED' || record.status === 'SUPERSEDED') continue
    if (!CONFLICT_ELIGIBLE.has(record.claimType)) continue
    // Expired evidence is inspectable but not an active conflicting assertion
    if (record.status === 'EXPIRED' || record.freshnessState === 'EXPIRED') continue

    const key = `${record.projectId}\u001f${record.claimType}\u001f${subjectKey(record.subject)}`
    const list = groups.get(key) ?? []
    list.push(record)
    groups.set(key, list)
  }

  const conflicts: EvidenceConflictSummary[] = []
  const conflictedIds = new Set<string>()

  for (const [, group] of groups) {
    const valueMap = new Map<string, ProjectEvidenceRecord[]>()
    for (const item of group) {
      const normalized = normalizeClaimValue(item.claimType, item.claimValue)
      if (!normalized) continue
      const bucket = valueMap.get(normalized) ?? []
      bucket.push(item)
      valueMap.set(normalized, bucket)
    }
    if (valueMap.size < 2) continue

    const subject: EvidenceSubjectRef = group[0].subject
    const claimType = group[0].claimType
    const conflictGroupId = buildConflictGroupId({
      projectId: group[0].projectId,
      claimType,
      subject,
    })
    const evidenceIds = group.map((g) => g.evidenceId).sort()
    conflicts.push({
      conflictGroupId,
      claimType,
      subject,
      reasonCode: 'INCOMPATIBLE_CLAIM_VALUES',
      evidenceIds,
      normalizedValues: Array.from(valueMap.keys()).sort(),
    })
    for (const id of evidenceIds) conflictedIds.add(id)
  }

  const updated = records.map((record) => {
    if (!conflictedIds.has(record.evidenceId)) return record
    const conflict = conflicts.find((c) => c.evidenceIds.includes(record.evidenceId))
    return {
      ...record,
      status: 'CONFLICTED' as const,
      availability: 'CONFLICTED' as const,
      conflictGroupId: conflict?.conflictGroupId ?? record.conflictGroupId,
      reasonCode: 'INCOMPATIBLE_CLAIM_VALUES',
    }
  })

  conflicts.sort((a, b) => a.conflictGroupId.localeCompare(b.conflictGroupId))
  return { records: updated, conflicts }
}
