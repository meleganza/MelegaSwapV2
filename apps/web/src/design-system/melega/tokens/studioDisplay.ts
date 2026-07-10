import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import { PREMIUM_EMPTY } from './premiumStudio'

/** R764 — unified studio live badge copy (Title Case). */
export const STUDIO_LIVE_RUNTIME_LABEL = 'Live Runtime'

/** R764 — institutional KPI value rhythm (aligned with Trade `statValue`). */
export const STUDIO_KPI_VALUE = {
  size: '22px',
  weight: 700,
  lineHeight: '1.15',
  fontVariantNumeric: 'tabular-nums',
} as const

const UNAVAILABLE_MARKERS = new Set(['—', '-', PREMIUM_EMPTY, RUNTIME_UNAVAILABLE_LABEL, 'Unavailable'])

export const isStudioMetricUnavailable = (value?: string | null): boolean => {
  if (value === undefined || value === null) return true
  const trimmed = value.trim()
  if (!trimmed) return true
  if (UNAVAILABLE_MARKERS.has(trimmed)) return true
  if (trimmed.startsWith('Unavailable')) return true
  if (/^0(\.0+)?\s*marco$/i.test(trimmed)) return true
  return false
}

/** Map legacy em-dash / empty runtime strings to institutional unavailable label. */
export const displayStudioMetric = (value?: string | null): string => {
  if (isStudioMetricUnavailable(value)) return RUNTIME_UNAVAILABLE_LABEL
  return value!.trim()
}
