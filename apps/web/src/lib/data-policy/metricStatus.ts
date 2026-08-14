/**
 * Canonical user-facing metric status language (global data layer).
 * Prefer these three labels over diagnostic phrases in UI.
 */
export type MetricStatusLabel = 'Available' | 'Indexed' | 'Unavailable'

export const METRIC_STATUS = {
  AVAILABLE: 'Available',
  INDEXED: 'Indexed',
  UNAVAILABLE: 'Unavailable',
} as const satisfies Record<string, MetricStatusLabel>

/** APR-specific unavailable copy — preserve sibling metrics (TVL, rewards, chain). */
export const APR_UNAVAILABLE_LABEL = 'APR unavailable' as const

export function isAprUnavailableLabel(value?: string | null): boolean {
  if (!value) return true
  const v = value.trim()
  return v === APR_UNAVAILABLE_LABEL || v === METRIC_STATUS.UNAVAILABLE || v === '—'
}
