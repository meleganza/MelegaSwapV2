import type { DataReasonCode } from 'lib/data-policy/dataReasonCodes'
import { DATA_REASON_LABELS } from 'lib/data-policy/dataReasonCodes'

export type RuntimeTruthStatus = 'READY' | 'UNAVAILABLE' | 'LOADING'

export interface RuntimeTruthField<T = string> {
  status: RuntimeTruthStatus
  display: string
  reason?: string
  value?: T
}

export const RUNTIME_UNAVAILABLE_LABEL = 'Unavailable' as const

export const RUNTIME_LOADING_LABEL = 'Loading' as const

/** Maps data reason codes to explicit user-facing unavailable reasons. */
export function runtimeReasonFromCode(code?: DataReasonCode): string {
  if (!code) return 'Data source not configured'
  return DATA_REASON_LABELS[code] ?? 'Data source not configured'
}

export function resolveRuntimeMetric(
  value: string | number | undefined | null,
  options: {
    loading?: boolean
    reasonCode?: DataReasonCode
    reason?: string
    format?: (value: number) => string
  } = {},
): RuntimeTruthField {
  if (options.loading) {
    return {
      status: 'LOADING',
      display: RUNTIME_LOADING_LABEL,
      reason: options.reason ?? 'Subgraph or RPC request in progress',
    }
  }

  const numeric =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value.replace(/[^0-9.-]/g, ''))
        : NaN

  if (value != null && value !== '' && (typeof value === 'string' || Number.isFinite(numeric))) {
    if (typeof value === 'string' && value !== RUNTIME_UNAVAILABLE_LABEL && !value.startsWith('Unavailable')) {
      return { status: 'READY', display: value, value }
    }
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      const display = options.format ? options.format(value) : String(value)
      return { status: 'READY', display, value: display }
    }
  }

  const reason = options.reason ?? runtimeReasonFromCode(options.reasonCode)
  return {
    status: 'UNAVAILABLE',
    display: RUNTIME_UNAVAILABLE_LABEL,
    reason,
  }
}

export function isRuntimeUnavailableDisplay(display?: string | null): boolean {
  return !display || display === '—' || display === RUNTIME_UNAVAILABLE_LABEL || display.startsWith('Unavailable')
}
