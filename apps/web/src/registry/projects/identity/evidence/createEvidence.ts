import { isSafeHttpUrl, sanitizePlainText } from '../urlSafety'
import {
  EVIDENCE_CLAIM_TYPES,
  EVIDENCE_STATUSES,
  EVIDENCE_VERIFICATION_LEVELS,
  PROJECT_EVIDENCE_SCHEMA_VERSION,
  type EvidenceClaimType,
  type EvidenceSourceSubtype,
  type EvidenceSourceType,
  type EvidenceStatus,
  type EvidenceVerificationLevel,
  type EvidenceVisibility,
} from './schema'
import { buildEvidenceId } from './evidenceId'
import { normalizeClaimValue } from './normalizeClaim'
import type { EvidenceSubjectRef, ProjectEvidenceRecord } from './types'

const CLAIM_SET = new Set<string>(EVIDENCE_CLAIM_TYPES)
const STATUS_SET = new Set<string>(EVIDENCE_STATUSES)
const LEVEL_SET = new Set<string>(EVIDENCE_VERIFICATION_LEVELS)

export function isEvidenceClaimType(value: string): value is EvidenceClaimType {
  return CLAIM_SET.has(value)
}

export function isEvidenceStatus(value: string): value is EvidenceStatus {
  return STATUS_SET.has(value)
}

export function isEvidenceVerificationLevel(value: string): value is EvidenceVerificationLevel {
  return LEVEL_SET.has(value)
}

export function assertSafeSourceReference(raw: string): string | null {
  if (typeof raw !== 'string') return null
  // Reject unsafe protocols / markup before sanitization can strip tags.
  if (/javascript:/i.test(raw) || /data:/i.test(raw) || /vbscript:/i.test(raw) || /<script/i.test(raw)) {
    return null
  }
  const cleaned = sanitizePlainText(raw, 2000)
  if (!cleaned) return null
  if (/javascript:/i.test(cleaned) || /data:/i.test(cleaned)) return null
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    return isSafeHttpUrl(cleaned) ? cleaned : null
  }
  // Allow relative paths, UPI, CAIP, registry refs
  if (cleaned.startsWith('/') || cleaned.startsWith('upi://') || cleaned.startsWith('eip155:')) {
    return cleaned
  }
  if (/^[a-zA-Z0-9_.:/@-]+$/.test(cleaned)) return cleaned
  return cleaned.length <= 500 ? cleaned : null
}

export function createEvidenceRecord(input: {
  projectId: string
  subject: EvidenceSubjectRef
  claimType: EvidenceClaimType
  claimValue: string | null
  sourceType: EvidenceSourceType
  sourceSubtype?: EvidenceSourceSubtype | null
  sourceReference: string
  status: EvidenceStatus
  verificationLevel: EvidenceVerificationLevel
  observedAt: string | null
  updatedAt: string | null
  expiresAt?: string | null
  freshnessPolicy?: ProjectEvidenceRecord['freshnessPolicy']
  availability?: ProjectEvidenceRecord['availability']
  supersedesEvidenceId?: string | null
  derivedFromEvidenceIds?: string[]
  derivationMethod?: string | null
  notes?: string | null
  reasonCode?: string | null
  visibility?: EvidenceVisibility
}): ProjectEvidenceRecord | null {
  if (!isEvidenceClaimType(input.claimType)) return null
  if (!isEvidenceStatus(input.status)) return null
  if (!isEvidenceVerificationLevel(input.verificationLevel)) return null

  const sourceReference = assertSafeSourceReference(input.sourceReference)
  if (!sourceReference) return null

  const notes = input.notes ? sanitizePlainText(input.notes, 1000) : null
  const normalized = normalizeClaimValue(input.claimType, input.claimValue)
  const evidenceId = buildEvidenceId({
    projectId: input.projectId,
    claimType: input.claimType,
    subject: input.subject,
    sourceType: input.sourceType,
    sourceReference,
    normalizedClaimValue: normalized,
  })

  return {
    schemaVersion: PROJECT_EVIDENCE_SCHEMA_VERSION,
    evidenceId,
    projectId: input.projectId,
    subject: input.subject,
    claimType: input.claimType,
    claimValue: input.claimValue,
    sourceType: input.sourceType,
    sourceSubtype: input.sourceSubtype ?? null,
    sourceReference,
    status: input.status,
    verificationLevel: input.verificationLevel,
    observedAt: input.observedAt,
    updatedAt: input.updatedAt,
    expiresAt: input.expiresAt ?? null,
    freshnessPolicy: input.freshnessPolicy ?? null,
    freshnessState: 'NONE',
    freshnessReason: null,
    availability: input.availability ?? (input.claimValue == null ? 'UNAVAILABLE' : 'AVAILABLE'),
    conflictGroupId: null,
    supersedesEvidenceId: input.supersedesEvidenceId ?? null,
    derivedFromEvidenceIds: input.derivedFromEvidenceIds ?? [],
    derivationMethod: input.derivationMethod ?? null,
    notes,
    reasonCode: input.reasonCode ?? null,
    visibility: input.visibility ?? 'PUBLIC',
  }
}
