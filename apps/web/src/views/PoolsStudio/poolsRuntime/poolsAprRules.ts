/**
 * Canonical pool APR presentation — factual annualized reward / TVL.
 * Never hard-cap live APR to an arbitrary percentage (e.g. 50%).
 */

export const MIN_TVL_USD_FOR_RANKING = 1
/** Near-zero TVL produces structurally unreliable APR for ranking. */
export const MIN_TVL_USD_FOR_TRUSTED_APR = 10
/** Extreme but factual APR — preserve with provenance; exclude from Top Pools ranking. */
export const EXTREME_APR_FOR_RANKING = 50_000

export type AprDisplayReason =
  | 'APR_FACTUAL'
  | 'APR_EXTREME_FACTUAL'
  | 'APR_UNAVAILABLE'
  | 'APR_PRICING_PENDING'
  | 'EMISSION_INACTIVE'
  | 'POOL_ENDED'
  | 'INVALID_RAW_APR'
  | 'NEAR_ZERO_TVL'
  | 'NEEDS_FUNDING'

/** @deprecated legacy band helper — not used for runtime display */
export const MAX_DISPLAY_APR = Number.POSITIVE_INFINITY
export const MIN_LIVE_APR = 0

type AprRange = { min: number; max: number }

/** R703D sustainable APR bands — retained for legacy references only. */
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

const FORBIDDEN_APR_STRINGS = new Set(['0%', '0.00%', 'NaN', 'Infinity', '—', '-', 'Unavailable', 'APR unavailable', 'Pricing pending'])

export function isForbiddenAprDisplay(display?: string | null): boolean {
  if (!display) return true
  const trimmed = display.trim()
  if (/^(Calculating\.\.\.|Synchronizing\.\.\.|Waiting RPC\.\.\.|APR unavailable|Pricing pending)$/i.test(trimmed)) {
    return true
  }
  if (FORBIDDEN_APR_STRINGS.has(trimmed)) return true
  if (/^nan$/i.test(trimmed) || /^infinity$/i.test(trimmed)) return true
  const n = parseFloat(trimmed.replace('%', ''))
  if (!Number.isFinite(n) || n <= 0) return true
  return false
}

export function formatFactualAprPercent(rawApr: number): string {
  if (!Number.isFinite(rawApr) || rawApr <= 0) return ''
  if (rawApr >= 1000) return `${rawApr.toFixed(2)}%`
  if (rawApr >= 100) return `${rawApr.toFixed(2)}%`
  return `${rawApr.toFixed(2)}%`
}

/** Runtime APR display: factual value only — never clamp to 50%. */
export function normalizeAprForDisplay(
  rawApr: number,
  _visualType?: string,
  _rewardBadge?: string,
): { display: string | undefined; exact: number; normalized: number; quality: 'factual' | 'extreme' | 'unavailable' } {
  if (!Number.isFinite(rawApr) || rawApr <= 0) {
    return { display: undefined, exact: rawApr, normalized: 0, quality: 'unavailable' }
  }
  const display = formatFactualAprPercent(rawApr)
  if (!display || isForbiddenAprDisplay(display)) {
    return { display: undefined, exact: rawApr, normalized: 0, quality: 'unavailable' }
  }
  const quality = rawApr >= EXTREME_APR_FOR_RANKING ? 'extreme' : 'factual'
  return { display, exact: rawApr, normalized: rawApr, quality }
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
  unavailableLabel?: string
} {
  if (!emissionActive) {
    return { rawApr, aprDisplayReason: 'EMISSION_INACTIVE', unavailableLabel: 'APR unavailable' }
  }

  if (!Number.isFinite(rawApr) || rawApr <= 0) {
    return {
      rawApr: rawApr || 0,
      aprDisplayReason: 'INVALID_RAW_APR',
      unavailableLabel: 'Pricing pending',
    }
  }

  const normalized = normalizeAprForDisplay(rawApr, visualType, rewardBadge)
  if (!normalized.display) {
    return { rawApr, aprDisplayReason: 'INVALID_RAW_APR', unavailableLabel: 'APR unavailable' }
  }

  return {
    rawApr,
    sustainableAprDisplay: normalized.display,
    aprDisplayReason: normalized.quality === 'extreme' ? 'APR_EXTREME_FACTUAL' : 'APR_FACTUAL',
  }
}

export function formatDisplayAprText(
  rawApr: number,
  visualType: string,
  emissionActive: boolean,
  rewardBadge?: string,
): { display: string | undefined; exact: number; reason: AprDisplayReason; unavailableLabel?: string } {
  const resolved = resolveSustainableApr(rawApr, visualType, emissionActive, rewardBadge)
  return {
    display: resolved.sustainableAprDisplay,
    exact: resolved.rawApr,
    reason: resolved.aprDisplayReason,
    unavailableLabel: resolved.unavailableLabel,
  }
}

export type TopPoolsAprEligibility = {
  eligible: boolean
  reason:
    | 'OK'
    | 'NOT_ACTIVE'
    | 'NO_EMISSION'
    | 'NO_APR'
    | 'MISSING_PRICE'
    | 'NEAR_ZERO_TVL'
    | 'EXTREME_UNRELIABLE'
    | 'STALE'
}

export function evaluateTopPoolsAprEligibility(input: {
  rewarding: boolean
  emissionActive: boolean
  apr: number | null | undefined
  tvlUsd: number | null | undefined
  rewardPriceUsd: number | null | undefined
  stakePriceUsd: number | null | undefined
}): TopPoolsAprEligibility {
  if (!input.rewarding) return { eligible: false, reason: 'NOT_ACTIVE' }
  if (!input.emissionActive) return { eligible: false, reason: 'NO_EMISSION' }
  if (input.apr == null || !Number.isFinite(input.apr) || input.apr <= 0) {
    return { eligible: false, reason: 'NO_APR' }
  }
  if (!(input.rewardPriceUsd != null && input.rewardPriceUsd > 0) || !(input.stakePriceUsd != null && input.stakePriceUsd > 0)) {
    return { eligible: false, reason: 'MISSING_PRICE' }
  }
  if (input.tvlUsd == null || !Number.isFinite(input.tvlUsd) || input.tvlUsd < MIN_TVL_USD_FOR_TRUSTED_APR) {
    return { eligible: false, reason: 'NEAR_ZERO_TVL' }
  }
  if (input.apr >= EXTREME_APR_FOR_RANKING && input.tvlUsd < MIN_TVL_USD_FOR_TRUSTED_APR * 10) {
    return { eligible: false, reason: 'EXTREME_UNRELIABLE' }
  }
  return { eligible: true, reason: 'OK' }
}
