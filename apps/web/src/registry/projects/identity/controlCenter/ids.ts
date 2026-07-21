import { fingerprint } from '../evidence/evidenceId'

export function buildOwnerId(parts: { projectId: string; stableKey: string; identityType: string }): string {
  return `ownr_${fingerprint([parts.projectId, parts.stableKey, parts.identityType].join('\u001f'))}`
}

export function buildOwnerRevision(parts: {
  ownerId: string
  verificationState: string
  roles: string[]
  updatedAt: string
}): string {
  return fingerprint(
    [parts.ownerId, parts.verificationState, [...parts.roles].sort().join(','), parts.updatedAt].join('|'),
  )
}

export function buildAuditId(parts: {
  projectId: string
  actorOwnerId: string
  action: string
  createdAt: string
  changeFingerprint: string
}): string {
  return `aud_${fingerprint(
    [parts.projectId, parts.actorOwnerId, parts.action, parts.createdAt, parts.changeFingerprint].join('\u001f'),
  )}`
}

export function buildStagingRevision(parts: string[]): string {
  return fingerprint(parts.slice().sort().join('|'))
}

export function buildControlCenterRevision(parts: string[]): string {
  return fingerprint(parts.slice().sort().join('|'))
}
