import stringify from 'fast-json-stable-stringify'
import type { ProjectEvidencePack, ProjectEvidenceRecord } from './types'

/** Public evidence serialization — PRIVATE records must never appear. */
export function toPublicEvidenceJson(pack: ProjectEvidencePack): Record<string, unknown> {
  const evidence = pack.evidence.filter((record) => record.visibility === 'PUBLIC').map(serializePublicEvidenceRecord)

  return {
    schemaVersion: pack.schemaVersion,
    projectId: pack.projectId,
    slug: pack.slug,
    canonicalUrl: pack.canonicalUrl,
    projectRevision: pack.projectRevision,
    generatedAt: pack.generatedAt,
    asOf: pack.asOf,
    summary: pack.summary,
    claims: pack.claims,
    evidence,
    conflicts: pack.conflicts,
    freshness: pack.freshness,
    availability: pack.availability,
    provenance: pack.provenance,
  }
}

export function serializePublicEvidenceRecord(record: ProjectEvidenceRecord): Record<string, unknown> {
  if (record.visibility !== 'PUBLIC') {
    throw new Error('Attempted to serialize PRIVATE evidence')
  }
  return {
    schemaVersion: record.schemaVersion,
    evidenceId: record.evidenceId,
    projectId: record.projectId,
    subject: record.subject,
    claimType: record.claimType,
    claimValue: record.claimValue,
    sourceType: record.sourceType,
    sourceSubtype: record.sourceSubtype,
    sourceReference: record.sourceReference,
    status: record.status,
    verificationLevel: record.verificationLevel,
    observedAt: record.observedAt,
    updatedAt: record.updatedAt,
    expiresAt: record.expiresAt,
    freshnessPolicy: record.freshnessPolicy,
    freshnessState: record.freshnessState,
    freshnessReason: record.freshnessReason,
    availability: record.availability,
    conflictGroupId: record.conflictGroupId,
    supersedesEvidenceId: record.supersedesEvidenceId,
    derivedFromEvidenceIds: record.derivedFromEvidenceIds,
    derivationMethod: record.derivationMethod,
    notes: record.notes,
    reasonCode: record.reasonCode,
    visibility: record.visibility,
  }
}

export function stableEvidencePayload(pack: ProjectEvidencePack): string {
  return stringify(toPublicEvidenceJson(pack))
}
