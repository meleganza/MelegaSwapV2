import { fingerprint } from '../evidence/evidenceId'

export function buildGovernanceId(parts: { projectId: string; stableKey: string; governanceModel: string }): string {
  return `gov_${fingerprint([parts.projectId, parts.stableKey, parts.governanceModel].join('\u001f'))}`
}

export function buildTreasuryId(parts: {
  projectId: string
  stableKey: string
  treasuryType: string
  chainId: number | null
}): string {
  return `tre_${fingerprint(
    [parts.projectId, parts.stableKey, parts.treasuryType, String(parts.chainId ?? '')].join('\u001f'),
  )}`
}

export function buildOwnershipId(parts: { projectId: string; stableKey: string; ownerModel: string }): string {
  return `own_${fingerprint([parts.projectId, parts.stableKey, parts.ownerModel].join('\u001f'))}`
}

export function buildUpgradeabilityId(parts: { projectId: string; stableKey: string; upgradeability: string }): string {
  return `upg_${fingerprint([parts.projectId, parts.stableKey, parts.upgradeability].join('\u001f'))}`
}

export function buildGovernanceResourceId(parts: { projectId: string; stableKey: string; kind: string }): string {
  return `gres_${fingerprint([parts.projectId, parts.stableKey, parts.kind].join('\u001f'))}`
}

export function buildGovernanceRelationId(parts: { fromId: string; toId: string; relationType: string }): string {
  return `grel_${fingerprint([parts.fromId, parts.toId, parts.relationType].join('\u001f'))}`
}

export function buildGovernanceEntityRevision(parts: {
  entityId: string
  lifecycle: string
  updatedAt: string
  contentFingerprint: string
}): string {
  return fingerprint([parts.entityId, parts.lifecycle, parts.updatedAt, parts.contentFingerprint].join('|'))
}
