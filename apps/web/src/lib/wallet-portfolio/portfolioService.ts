/**
 * Canonical Portfolio Service skeleton (R791D.3A).
 *
 * Pure orchestrator: merges product adapter outputs into one WalletPortfolio.
 * Does not fetch, compute economics, access browser/React, or integrate Command Center.
 */

import {
  WALLET_PORTFOLIO_SCHEMA,
  type PortfolioActivityItem,
  type PortfolioApprovalItem,
  type PortfolioClaimableItem,
  type PortfolioPosition,
  type PortfolioPositionImportance,
  type PortfolioPositionLifecycle,
  type PortfolioPositionType,
  type PortfolioQuickAction,
  type PortfolioSummary,
  type WalletPortfolio,
  type WalletPortfolioSectionStatus,
} from './contracts'

/**
 * Aggregation input for createWalletPortfolio.
 * Callers supply already-adapted PortfolioPosition arrays and precomputed summary.
 */
export interface CreateWalletPortfolioInput {
  wallet: string | null
  generatedAt: string
  summary: PortfolioSummary
  liquidityPositions: readonly PortfolioPosition[]
  farmPositions: readonly PortfolioPosition[]
  poolPositions: readonly PortfolioPosition[]
  claimables: readonly PortfolioClaimableItem[]
  approvals: readonly PortfolioApprovalItem[]
  recentActivity: readonly PortfolioActivityItem[]
  quickActions: readonly PortfolioQuickAction[]
  sectionStatus: WalletPortfolioSectionStatus
}

const IMPORTANCE_RANK: Record<PortfolioPositionImportance, number> = {
  CRITICAL: 0,
  HIGH: 1,
  NORMAL: 2,
  LOW: 3,
  ARCHIVED: 4,
}

/** Operational lifecycle first; stable tie-break only. */
const LIFECYCLE_RANK: Record<PortfolioPositionLifecycle, number> = {
  ACTIVE: 0,
  LOCKED: 1,
  PAUSED: 2,
  FUTURE: 3,
  ENDED: 4,
  UNAVAILABLE: 5,
}

const TYPE_RANK: Record<PortfolioPositionType, number> = {
  LIQUIDITY: 0,
  FARM: 1,
  POOL: 2,
  VAULT: 3,
  LENDING: 4,
  BORROW: 5,
  PERPETUAL: 6,
  OPTIONS: 7,
  STRATEGY: 8,
  SMARTDROP: 9,
  AI_POSITION: 10,
  BRIDGE: 11,
}

function normalizeWallet(wallet: string | null): string | null {
  if (wallet == null || wallet === '') return null
  return wallet.trim().toLowerCase()
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

/**
 * Deterministic default ordering:
 * importance → requiresAttention → lifecycle → positionType → title
 */
export function comparePortfolioPositions(a: PortfolioPosition, b: PortfolioPosition): number {
  const byImportance =
    (IMPORTANCE_RANK[a.importance] ?? 99) - (IMPORTANCE_RANK[b.importance] ?? 99)
  if (byImportance !== 0) return byImportance

  const byAttention = Number(b.requiresAttention) - Number(a.requiresAttention)
  if (byAttention !== 0) return byAttention

  const byLifecycle = (LIFECYCLE_RANK[a.status] ?? 99) - (LIFECYCLE_RANK[b.status] ?? 99)
  if (byLifecycle !== 0) return byLifecycle

  const byType = (TYPE_RANK[a.positionType] ?? 99) - (TYPE_RANK[b.positionType] ?? 99)
  if (byType !== 0) return byType

  const byTitle = a.title.localeCompare(b.title)
  if (byTitle !== 0) return byTitle

  return a.positionId.localeCompare(b.positionId)
}

function asPositionList(value: readonly PortfolioPosition[] | null | undefined): PortfolioPosition[] {
  if (!Array.isArray(value)) return []
  return value.filter((p): p is PortfolioPosition => p != null && typeof p === 'object')
}

/**
 * Create one canonical WalletPortfolio from pre-adapted product position lists.
 * Orchestrates only — does not calculate TVL, USD, APR, claimables, or counts.
 */
export function createWalletPortfolio(input: CreateWalletPortfolioInput): WalletPortfolio {
  const liquidity = asPositionList(input.liquidityPositions)
  const farms = asPositionList(input.farmPositions)
  const pools = asPositionList(input.poolPositions)

  const merged = [...liquidity, ...farms, ...pools]
  const positions = cloneJson(merged).sort(comparePortfolioPositions)

  return {
    schema: WALLET_PORTFOLIO_SCHEMA,
    wallet: normalizeWallet(input.wallet),
    generatedAt: input.generatedAt,
    summary: cloneJson(input.summary),
    positions,
    claimables: cloneJson(Array.isArray(input.claimables) ? [...input.claimables] : []),
    approvals: cloneJson(Array.isArray(input.approvals) ? [...input.approvals] : []),
    recentActivity: cloneJson(Array.isArray(input.recentActivity) ? [...input.recentActivity] : []),
    quickActions: cloneJson(Array.isArray(input.quickActions) ? [...input.quickActions] : []),
    sectionStatus: cloneJson(input.sectionStatus),
  }
}
