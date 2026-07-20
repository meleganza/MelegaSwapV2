import type { EvidenceFreshnessPolicy, ProjectEvidenceRecord } from './types'
import type { EvidenceFreshnessState, EvidenceStatus } from './schema'

export interface FreshnessContext {
  /** ISO timestamp — must be injected for deterministic evaluation (never Date.now in serializers under test). */
  asOf: string
}

function parseTime(value: string | null | undefined): number | null {
  if (!value) return null
  const ms = Date.parse(value)
  return Number.isFinite(ms) ? ms : null
}

/**
 * Deterministic freshness evaluation.
 * Evidence without expiresAt and without maxAgeMs policy does not become stale automatically.
 */
export function evaluateFreshness(
  input: {
    status: EvidenceStatus
    observedAt: string | null
    updatedAt: string | null
    expiresAt: string | null
    freshnessPolicy: EvidenceFreshnessPolicy | null
  },
  ctx: FreshnessContext,
): { freshnessState: EvidenceFreshnessState; freshnessReason: string | null; status: EvidenceStatus } {
  const asOfMs = parseTime(ctx.asOf)
  if (asOfMs == null) {
    return {
      freshnessState: 'NONE',
      freshnessReason: 'INVALID_AS_OF',
      status: input.status,
    }
  }

  const expiresMs = parseTime(input.expiresAt)
  if (expiresMs != null && expiresMs < asOfMs) {
    return {
      freshnessState: 'EXPIRED',
      freshnessReason: 'PAST_EXPIRES_AT',
      status: input.status === 'SUPERSEDED' || input.status === 'REJECTED' ? input.status : 'EXPIRED',
    }
  }

  const policy = input.freshnessPolicy
  if (policy?.maxAgeMs != null && policy.maxAgeMs >= 0) {
    const anchor = parseTime(input.updatedAt) ?? parseTime(input.observedAt)
    if (anchor == null) {
      return {
        freshnessState: 'STALE',
        freshnessReason: 'MISSING_OBSERVATION_TIMESTAMP',
        status: input.status,
      }
    }
    if (asOfMs - anchor > policy.maxAgeMs) {
      return {
        freshnessState: 'STALE',
        freshnessReason: policy.reasonCode || 'MAX_AGE_EXCEEDED',
        status: input.status,
      }
    }
    return {
      freshnessState: 'CURRENT',
      freshnessReason: null,
      status: input.status,
    }
  }

  if (expiresMs != null) {
    return {
      freshnessState: 'CURRENT',
      freshnessReason: null,
      status: input.status,
    }
  }

  return {
    freshnessState: 'NONE',
    freshnessReason: 'NO_FRESHNESS_REQUIREMENT',
    status: input.status,
  }
}

export function applyFreshnessToRecord(record: ProjectEvidenceRecord, ctx: FreshnessContext): ProjectEvidenceRecord {
  const result = evaluateFreshness(record, ctx)
  const availability =
    result.freshnessState === 'STALE' ? 'STALE' : result.freshnessState === 'EXPIRED' ? 'STALE' : record.availability

  return {
    ...record,
    status: result.status,
    freshnessState: result.freshnessState,
    freshnessReason: result.freshnessReason,
    availability: record.availability === 'CONFLICTED' ? 'CONFLICTED' : availability,
  }
}
