import type { ProvenanceField, ProvenanceSource } from './types'

export const UNAVAILABLE = 'Unavailable'

export function createProvenanceField<T = string>(input: {
  value: T | null | undefined
  source: ProvenanceSource
  observed_at?: string
  confidence?: number
  notes?: string
}): ProvenanceField<T> {
  const available = input.value != null && input.value !== '' && input.value !== UNAVAILABLE
  return {
    value: available ? input.value : null,
    available,
    source: input.source,
    observed_at: input.observed_at ?? new Date().toISOString(),
    confidence: input.confidence,
    notes: available ? input.notes : input.notes ?? 'Field not discovered — no fabrication.',
  }
}

export function unavailableField(source: ProvenanceSource = 'ai_discovery'): ProvenanceField {
  return createProvenanceField({ value: null, source, notes: 'Not discovered — marked Unavailable.' })
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.trim() !== UNAVAILABLE
}
