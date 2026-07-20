/**
 * PP001 — Provenance & availability contract for Project Page fields.
 * Distinct from pending-registry ProvenanceField (different source taxonomy).
 */

export const PROJECT_PAGE_SCHEMA_VERSION = 'melega.project-page.v1' as const

export type ProjectFieldSourceClass =
  | 'ONCHAIN'
  | 'PROJECT_ATTESTED'
  | 'MELEGA_VERIFIED'
  | 'THIRD_PARTY'
  | 'DERIVED'
  | 'UNKNOWN'

export type ProjectFieldAvailability = 'AVAILABLE' | 'UNAVAILABLE' | 'NOT_APPLICABLE' | 'STALE' | 'CONFLICTED'

export interface ProjectFieldMeta {
  source: ProjectFieldSourceClass
  availability: ProjectFieldAvailability
  observedAt: string | null
  updatedAt: string | null
  notes: string | null
}

export interface ProjectField<T> {
  value: T | null
  meta: ProjectFieldMeta
}

export function projectFieldAvailable<T>(
  value: T,
  source: ProjectFieldSourceClass,
  timestamps?: { observedAt?: string | null; updatedAt?: string | null; notes?: string | null },
): ProjectField<T> {
  return {
    value,
    meta: {
      source,
      availability: 'AVAILABLE',
      observedAt: timestamps?.observedAt ?? null,
      updatedAt: timestamps?.updatedAt ?? null,
      notes: timestamps?.notes ?? null,
    },
  }
}

export function projectFieldUnavailable<T = never>(
  source: ProjectFieldSourceClass = 'UNKNOWN',
  notes: string | null = 'Value not present in registry — not fabricated.',
): ProjectField<T> {
  return {
    value: null,
    meta: {
      source,
      availability: 'UNAVAILABLE',
      observedAt: null,
      updatedAt: null,
      notes,
    },
  }
}

export function projectFieldNotApplicable<T = never>(
  notes: string | null = 'Not applicable for this project.',
): ProjectField<T> {
  return {
    value: null,
    meta: {
      source: 'UNKNOWN',
      availability: 'NOT_APPLICABLE',
      observedAt: null,
      updatedAt: null,
      notes,
    },
  }
}

export type DeclaredCapabilityState = 'AVAILABLE' | 'UNAVAILABLE' | 'NOT_APPLICABLE' | 'PAUSED' | 'UNKNOWN'
