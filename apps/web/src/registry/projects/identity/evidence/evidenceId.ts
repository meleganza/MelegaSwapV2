import type { EvidenceSubjectRef } from './types'

/** Deterministic non-cryptographic fingerprint (Node/browser safe). */
export function fingerprint(input: string): string {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export function subjectKey(subject: EvidenceSubjectRef): string {
  return [subject.subjectType, subject.projectId, subject.subjectId, subject.fieldPath ?? ''].join('|')
}

/**
 * Stable evidence identity from claim coordinates + source + normalized value.
 * Does not use array order or display labels alone.
 */
export function buildEvidenceId(parts: {
  projectId: string
  claimType: string
  subject: EvidenceSubjectRef
  sourceType: string
  sourceReference: string
  normalizedClaimValue: string
}): string {
  const payload = [
    parts.projectId,
    parts.claimType,
    subjectKey(parts.subject),
    parts.sourceType,
    parts.sourceReference,
    parts.normalizedClaimValue,
  ].join('\u001f')
  return `ev_${fingerprint(payload)}`
}

export function buildConflictGroupId(parts: {
  projectId: string
  claimType: string
  subject: EvidenceSubjectRef
}): string {
  return `cg_${fingerprint([parts.projectId, parts.claimType, subjectKey(parts.subject)].join('\u001f'))}`
}
