/**
 * Portfolio View Engine foundation (R791D.3C).
 *
 * Pure deterministic transforms:
 *   WalletPortfolio → PortfolioViewResult
 *
 * Does not render, fetch, mutate, reorder, or invent economics.
 * Views are filters over portfolio.positions[] that preserve service ordering.
 */

import type {
  PortfolioPosition,
  PortfolioPositionAction,
  WalletPortfolio,
} from './contracts'

// ─── Canonical view types ───────────────────────────────────────────────────

export type PortfolioViewType =
  | 'ALL'
  | 'MY_POSITIONS'
  | 'ACTIVE'
  | 'HISTORICAL'
  | 'CLAIMABLE'
  | 'NEEDS_ATTENTION'
  | 'LIQUIDITY'
  | 'FARM'
  | 'POOL'
  | 'LEGACY'
  | 'WITHDRAW_OPPORTUNITIES'

export const PORTFOLIO_VIEW_TYPES = [
  'ALL',
  'MY_POSITIONS',
  'ACTIVE',
  'HISTORICAL',
  'CLAIMABLE',
  'NEEDS_ATTENTION',
  'LIQUIDITY',
  'FARM',
  'POOL',
  'LEGACY',
  'WITHDRAW_OPPORTUNITIES',
] as const satisfies readonly PortfolioViewType[]

// ─── View result ────────────────────────────────────────────────────────────

/** Deterministic counts over the filtered view — no fabricated USD. */
export interface PortfolioViewSummary {
  positionCount: number
  ownershipVerifiedCount: number
  activeCount: number
  historicalCount: number
  attentionCount: number
  claimableCount: number
}

export interface PortfolioViewResult {
  view: PortfolioViewType
  positions: PortfolioPosition[]
  count: number
  empty: boolean
  summary: PortfolioViewSummary
}

// ─── Claimable helpers (canonical fields only) ──────────────────────────────

function isPositiveEconomic(value: string | null | undefined): boolean {
  if (value == null) return false
  const trimmed = String(value).trim()
  if (trimmed === '' || trimmed === '0' || trimmed === '0.0' || trimmed === '0.00') return false
  const n = Number(trimmed)
  return Number.isFinite(n) && n > 0
}

function isClaimAction(action: PortfolioPositionAction | null | undefined): boolean {
  if (!action || !action.enabled) return false
  return action.type === 'CLAIM' || action.type === 'HARVEST'
}

function hasClaimableActionEnabled(position: PortfolioPosition): boolean {
  if (isClaimAction(position.recommendedAction)) return true
  if (isClaimAction(position.actions?.primary)) return true
  const secondary = position.actions?.secondary
  if (Array.isArray(secondary) && secondary.some(isClaimAction)) return true
  return false
}

function hasClaimableEconomics(position: PortfolioPosition): boolean {
  return (
    isPositiveEconomic(position.claimableValueUsd) ||
    isPositiveEconomic(position.pendingRewardsValueUsd)
  )
}

function isClaimablePosition(position: PortfolioPosition): boolean {
  return hasClaimableEconomics(position) || hasClaimableActionEnabled(position)
}

function isWithdrawAction(action: PortfolioPositionAction | null | undefined): boolean {
  if (!action || !action.enabled) return false
  return action.type === 'WITHDRAW' || action.type === 'UNSTAKE' || action.type === 'REMOVE_LIQUIDITY'
}

function isWithdrawOpportunity(position: PortfolioPosition): boolean {
  if (isWithdrawAction(position.recommendedAction)) return true
  if (isWithdrawAction(position.actions?.primary)) return true
  const secondary = position.actions?.secondary
  if (Array.isArray(secondary) && secondary.some(isWithdrawAction)) return true
  return false
}

function isLegacyPosition(position: PortfolioPosition): boolean {
  if (position.status === 'ENDED' || position.status === 'UNAVAILABLE') return true
  if (position.importance === 'ARCHIVED') return true
  return false
}

// ─── View predicates (filters only — no ranking) ────────────────────────────

type ViewPredicate = (position: PortfolioPosition) => boolean

const VIEW_PREDICATES: Record<PortfolioViewType, ViewPredicate> = {
  ALL: () => true,
  MY_POSITIONS: (p) => p.ownershipVerified === true,
  ACTIVE: (p) => p.status === 'ACTIVE',
  HISTORICAL: (p) => p.status === 'ENDED',
  CLAIMABLE: isClaimablePosition,
  NEEDS_ATTENTION: (p) => p.requiresAttention === true,
  LIQUIDITY: (p) => p.positionType === 'LIQUIDITY',
  FARM: (p) => p.positionType === 'FARM',
  POOL: (p) => p.positionType === 'POOL',
  LEGACY: isLegacyPosition,
  WITHDRAW_OPPORTUNITIES: isWithdrawOpportunity,
}

function buildViewSummary(positions: readonly PortfolioPosition[]): PortfolioViewSummary {
  let ownershipVerifiedCount = 0
  let activeCount = 0
  let historicalCount = 0
  let attentionCount = 0
  let claimableCount = 0

  for (const p of positions) {
    if (p.ownershipVerified === true) ownershipVerifiedCount += 1
    if (p.status === 'ACTIVE') activeCount += 1
    if (p.status === 'ENDED') historicalCount += 1
    if (p.requiresAttention === true) attentionCount += 1
    if (isClaimablePosition(p)) claimableCount += 1
  }

  return {
    positionCount: positions.length,
    ownershipVerifiedCount,
    activeCount,
    historicalCount,
    attentionCount,
    claimableCount,
  }
}

/**
 * Resolve a portfolio view from WalletPortfolio.positions[].
 *
 * Pure, deterministic, non-mutating. Preserves Portfolio Service ordering.
 * Future position types (VAULT, LENDING, …) pass through ALL and attribute
 * filters without engine changes; type-specific views match by equality only.
 */
export function resolvePortfolioView(
  portfolio: WalletPortfolio,
  view: PortfolioViewType,
): PortfolioViewResult {
  const source = Array.isArray(portfolio?.positions) ? portfolio.positions : []
  const predicate = VIEW_PREDICATES[view]
  const positions = source.filter(predicate)
  const count = positions.length

  return {
    view,
    positions,
    count,
    empty: count === 0,
    summary: buildViewSummary(positions),
  }
}
