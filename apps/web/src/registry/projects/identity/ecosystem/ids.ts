import { fingerprint } from '../evidence/evidenceId'

export function buildServiceId(parts: {
  projectId: string
  stableKey: string
  category: string
  type: string
}): string {
  return `svc_${fingerprint([parts.projectId, parts.stableKey, parts.category, parts.type].join('\u001f'))}`
}

export function buildRelationId(parts: { fromServiceId: string; toServiceId: string; relationType: string }): string {
  return `rel_${fingerprint([parts.fromServiceId, parts.toServiceId, parts.relationType].join('\u001f'))}`
}

export function buildServiceRevision(parts: {
  serviceId: string
  lifecycle: string
  route: string | null
  externalUrl: string | null
  updatedAt: string
  contentFingerprint: string
}): string {
  return fingerprint(
    [
      parts.serviceId,
      parts.lifecycle,
      parts.route ?? '',
      parts.externalUrl ?? '',
      parts.updatedAt,
      parts.contentFingerprint,
    ].join('|'),
  )
}
