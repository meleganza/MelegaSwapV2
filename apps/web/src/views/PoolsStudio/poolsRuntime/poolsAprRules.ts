export const MAX_DISPLAY_APR = 50
export const MIN_LIVE_APR = 8

export type AprDisplayReason =
  | 'APR_WITHIN_RANGE'
  | 'APR_NORMALIZED_FOR_DISPLAY'
  | 'APR_ESTIMATED_FROM_POOL_TYPE'
  | 'APR_ESTIMATED_FROM_EMISSION'
  | 'EMISSION_INACTIVE'
  | 'POOL_ENDED'
  | 'INVALID_RAW_APR'
  | 'NEEDS_FUNDING'

type AprRange = { min: number; max: number }

/** R703D sustainable APR bands. */
export function getAprRangeForVisual(visualType: string, rewardBadge?: string): AprRange {
  const badge = rewardBadge ?? ''
  if (visualType === 'Official' || badge === 'Official' || visualType === 'Auto Compound') {
    return { min: 8, max: 12 }
  }
  if (visualType === 'Partner' || badge === 'Partner' || visualType === 'Flexible' || badge === 'Community') {
    return { min: 20, max: 30 }
  }
  if (visualType === '30 Days' || visualType === 'Fixed 30d') return { min: 30, max: 40 }
  if (visualType === '90 Days' || visualType === 'Fixed 90d') return { min: 35, max: 45 }
  if (visualType === '180 Days' || visualType === 'Fixed 180d') return { min: 40, max: 50 }
  if (visualType === '365 Days' || visualType === 'Fixed 365d' || visualType === '365+ Days') {
    return { min: 45, max: 50 }
  }
  if (visualType === 'Community') return { min: 30, max: 45 }
  return { min: 20, max: 30 }
}

const FORBIDDEN_APR_STRINGS = new Set(['0%', '0.00%', '0.02%', '0.03%', 'NaN', 'Infinity', '—', '-'])

export function isForbiddenAprDisplay(display?: string | null): boolean {
  if (!display) return true
  const trimmed = display.trim()
  if (/^(Calculating\.\.\.|Synchronizing\.\.\.|Waiting RPC\.\.\.)$/i.test(trimmed)) return true
  if (FORBIDDEN_APR_STRINGS.has(trimmed)) return true
  if (/^nan$/i.test(trimmed) || /^infinity$/i.test(trimmed)) return true
  const n = parseFloat(trimmed.replace('%', ''))
  if (!Number.isFinite(n) || n <= 0) return true
  if (n > MAX_DISPLAY_APR) return true
  return false
}

export function normalizeAprForDisplay(
  rawApr: number,
  visualType: string,
  rewardBadge?: string,
): { display: string | undefined; exact: number; normalized: number } {
  if (!Number.isFinite(rawApr) || rawApr <= 0 || rawApr > 500) {
    return { display: undefined, exact: rawApr, normalized: 0 }
  }
  const { min, max } = getAprRangeForVisual(visualType, rewardBadge)
  const capped = Math.min(rawApr, MAX_DISPLAY_APR)
  const normalized = Math.min(max, Math.max(min, capped))
  const display = `${normalized.toFixed(2)}%`
  if (isForbiddenAprDisplay(display)) {
    return { display: undefined, exact: rawApr, normalized }
  }
  return { display, exact: rawApr, normalized }
}

export function resolveSustainableApr(
  rawApr: number,
  visualType: string,
  emissionActive: boolean,
  rewardBadge?: string,
): {
  rawApr: number
  sustainableAprDisplay?: string
  aprDisplayReason: AprDisplayReason
} {
  if (!emissionActive) {
    return { rawApr, aprDisplayReason: 'EMISSION_INACTIVE' }
  }

  let estimatedFromType = false
  if (!Number.isFinite(rawApr) || rawApr <= 0 || rawApr > 500) {
    if (emissionActive) {
      const { min, max } = getAprRangeForVisual(visualType, rewardBadge)
      rawApr = (min + max) / 2
      estimatedFromType = true
    } else {
      return { rawApr: rawApr || 0, aprDisplayReason: 'INVALID_RAW_APR' }
    }
  }

  const normalized = normalizeAprForDisplay(rawApr, visualType, rewardBadge)
  if (!normalized.display) {
    return { rawApr, aprDisplayReason: 'INVALID_RAW_APR' }
  }

  const reason: AprDisplayReason = estimatedFromType
    ? 'APR_ESTIMATED_FROM_POOL_TYPE'
    : Math.abs(rawApr - normalized.normalized) > 0.5
      ? 'APR_NORMALIZED_FOR_DISPLAY'
      : 'APR_WITHIN_RANGE'

  return {
    rawApr,
    sustainableAprDisplay: normalized.display,
    aprDisplayReason: reason,
  }
}

export function formatDisplayAprText(
  rawApr: number,
  visualType: string,
  emissionActive: boolean,
  rewardBadge?: string,
): { display: string | undefined; exact: number; reason: AprDisplayReason } {
  const resolved = resolveSustainableApr(rawApr, visualType, emissionActive, rewardBadge)
  return {
    display: resolved.sustainableAprDisplay,
    exact: resolved.rawApr,
    reason: resolved.aprDisplayReason,
  }
}
