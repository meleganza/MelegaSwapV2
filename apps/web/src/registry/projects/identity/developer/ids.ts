import { fingerprint } from '../evidence/evidenceId'

export function buildDeveloperResourceId(parts: {
  projectId: string
  stableKey: string
  category: string
  version: string
}): string {
  return `dev_${fingerprint([parts.projectId, parts.stableKey, parts.category, parts.version].join('\u001f'))}`
}

export function buildDeveloperRelationId(parts: {
  fromResourceId: string
  toResourceId: string
  relationType: string
}): string {
  return `drel_${fingerprint([parts.fromResourceId, parts.toResourceId, parts.relationType].join('\u001f'))}`
}

export function buildDeveloperResourceRevision(parts: {
  resourceId: string
  lifecycle: string
  version: string
  url: string | null
  route: string | null
  updatedAt: string
  contentFingerprint: string
}): string {
  return fingerprint(
    [
      parts.resourceId,
      parts.lifecycle,
      parts.version,
      parts.url ?? '',
      parts.route ?? '',
      parts.updatedAt,
      parts.contentFingerprint,
    ].join('|'),
  )
}
