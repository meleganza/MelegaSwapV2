import { fingerprint } from '../evidence/evidenceId'

export function buildGrowthProgramId(parts: {
  projectId: string
  stableKey: string
  category: string
  type: string
}): string {
  return `grp_${fingerprint([parts.projectId, parts.stableKey, parts.category, parts.type].join('\u001f'))}`
}

export function buildGrowthRelationId(parts: { fromProgramId: string; toId: string; relationType: string }): string {
  return `grel_${fingerprint([parts.fromProgramId, parts.toId, parts.relationType].join('\u001f'))}`
}

export function buildGrowthProgramRevision(parts: {
  programId: string
  status: string
  route: string | null
  externalUrl: string | null
  updatedAt: string
  contentFingerprint: string
}): string {
  return fingerprint(
    [
      parts.programId,
      parts.status,
      parts.route ?? '',
      parts.externalUrl ?? '',
      parts.updatedAt,
      parts.contentFingerprint,
    ].join('|'),
  )
}
