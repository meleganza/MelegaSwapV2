import type { SmartSwapMetricAvailability } from 'lib/smart-swap-route-engine'
import type { SmartSwapImpactSeverity } from './types'

export function classifyImpactSeverity(
  percent: number | null | undefined,
  availability: SmartSwapMetricAvailability,
): SmartSwapImpactSeverity {
  if (availability !== 'available' || percent == null || !Number.isFinite(percent)) {
    return 'UNAVAILABLE'
  }
  if (percent >= 5) return 'HIGH'
  if (percent >= 1) return 'MEDIUM'
  return 'LOW'
}

export function formatImpactLabel(
  percent: number | null,
  severity: SmartSwapImpactSeverity,
): string {
  if (severity === 'UNAVAILABLE' || percent == null) return '—'
  return `${severity.charAt(0)}${severity.slice(1).toLowerCase()} (${percent.toFixed(2)}%)`
}
