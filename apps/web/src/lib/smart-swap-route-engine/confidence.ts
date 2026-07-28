import type { SmartSwapRoute } from './types'

/** Factual confidence 0–100 from completeness + impact severity. Never a guarantee. */
export function scoreRouteConfidence(input: {
  hasPath: boolean
  hasOutput: boolean
  impactAvailable: boolean
  impactPercent: number | null
  gasAvailable: boolean
  feeAvailable: boolean
  freshness: string | null
  unsupported: boolean
}): number {
  if (input.unsupported || !input.hasPath || !input.hasOutput) return 0

  let score = 40
  if (input.hasPath) score += 15
  if (input.hasOutput) score += 15
  if (input.impactAvailable) score += 15
  if (input.feeAvailable) score += 5
  if (input.gasAvailable) score += 5
  if (input.freshness) score += 5

  if (input.impactAvailable && input.impactPercent != null) {
    if (input.impactPercent >= 15) score -= 25
    else if (input.impactPercent >= 5) score -= 12
    else if (input.impactPercent >= 2) score -= 5
  }

  return Math.max(0, Math.min(100, score))
}

export function highImpactWarning(impactPercent: number | null, available: boolean): string | null {
  if (!available || impactPercent == null) return null
  if (impactPercent >= 15) return 'High price impact — review carefully before execution.'
  if (impactPercent >= 5) return 'Elevated price impact.'
  return null
}

export function assertConfidenceNotGuarantee(route: SmartSwapRoute): boolean {
  return !/guaranteed|best route guaranteed/i.test(route.explanation)
}
