import type { ProgramMetrics } from './uxCopy'
import type { ProgramStatus } from './programStatus'

/** On-chain Lifecycle enum order from LBTypes. */
export enum OnChainLifecycle {
  Created = 0,
  Ready = 1,
  Active = 2,
  Paused = 3,
  SafetyPaused = 4,
  Stopped = 5,
}

export type ProgramViewLike = {
  programId?: string
  factory?: string
  owner?: string
  projectToken?: string
  quoteAsset?: string
  pair?: string
  lpRecipient?: string
  lifecycle?: number
  strategy?: { mode?: number; minimumRateBps?: number; maximumRateBps?: number }
  epochDurationSeconds?: number
  totalDepositedBudget?: { toString(): string } | string
  remainingBudget?: { toString(): string } | string
  tokensSold?: { toString(): string } | string
  tokensMatched?: { toString(): string } | string
  grossQuoteAcquired?: { toString(): string } | string
  totalFeePaid?: { toString(): string } | string
  totalQuoteAdded?: { toString(): string } | string
  totalLpMinted?: { toString(): string } | string
  executionCount?: { toString(): string } | string | number
  solvent?: boolean
}

function asString(v: { toString(): string } | string | number | undefined | null): string | null {
  if (v == null) return null
  const s = typeof v === 'string' || typeof v === 'number' ? String(v) : v.toString()
  return s
}

function asCount(v: { toString(): string } | string | number | undefined | null): number | null {
  const s = asString(v)
  if (s == null) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

/** Map on-chain lifecycle → UX ProgramStatus. */
export function lifecycleToProgramStatus(lifecycle: number | undefined | null): ProgramStatus | null {
  if (lifecycle == null || !Number.isFinite(lifecycle)) return null
  switch (lifecycle) {
    case OnChainLifecycle.Created:
      return 'AWAITING_DEPOSIT'
    case OnChainLifecycle.Ready:
      return 'READY'
    case OnChainLifecycle.Active:
      return 'ACTIVE'
    case OnChainLifecycle.Paused:
      return 'PAUSED'
    case OnChainLifecycle.SafetyPaused:
      return 'SAFETY_PAUSED'
    case OnChainLifecycle.Stopped:
      return 'STOPPED'
    default:
      return null
  }
}

/**
 * Map ProgramView → dashboard metrics.
 * Never invent display values — null when missing.
 * Zero executions → executionCount 0 is real; liquidity labels stay null until matched/added > 0.
 */
export function mapProgramViewToMetrics(view: ProgramViewLike | null | undefined): ProgramMetrics {
  if (!view) {
    return {
      liquidityBuiltLabel: null,
      budgetRemainingLabel: null,
      executionCount: null,
      lpPositionLabel: null,
    }
  }

  const tokensMatched = asString(view.tokensMatched)
  const quoteAdded = asString(view.totalQuoteAdded)
  const remaining = asString(view.remainingBudget)
  const lpMinted = asString(view.totalLpMinted)
  const executions = asCount(view.executionCount)

  const matchedOk = tokensMatched != null && tokensMatched !== '0'
  const quoteOk = quoteAdded != null && quoteAdded !== '0'
  const lpOk = lpMinted != null && lpMinted !== '0'

  return {
    liquidityBuiltLabel:
      matchedOk || quoteOk
        ? `Matched ${tokensMatched ?? '0'} · Quote added ${quoteAdded ?? '0'}`
        : null,
    budgetRemainingLabel: remaining,
    executionCount: executions,
    lpPositionLabel: lpOk ? `${lpMinted} LP` : null,
  }
}

export type ProgramReadSnapshot = {
  available: boolean
  programAddress: string | null
  view: ProgramViewLike | null
  status: ProgramStatus | null
  metrics: ProgramMetrics
  owner: string | null
  token: string | null
  quoteAsset: string | null
  pair: string | null
  lpRecipient: string | null
  strategyMode: number | null
  epochDurationSeconds: number | null
  tokensSold: string | null
  tokensMatched: string | null
  grossQuoteAcquired: string | null
  totalFeePaid: string | null
  totalLpMinted: string | null
  executionCount: number | null
}

export function emptyProgramSnapshot(): ProgramReadSnapshot {
  return {
    available: false,
    programAddress: null,
    view: null,
    status: null,
    metrics: mapProgramViewToMetrics(null),
    owner: null,
    token: null,
    quoteAsset: null,
    pair: null,
    lpRecipient: null,
    strategyMode: null,
    epochDurationSeconds: null,
    tokensSold: null,
    tokensMatched: null,
    grossQuoteAcquired: null,
    totalFeePaid: null,
    totalLpMinted: null,
    executionCount: null,
  }
}

export function snapshotFromProgramView(
  programAddress: string,
  view: ProgramViewLike,
): ProgramReadSnapshot {
  const metrics = mapProgramViewToMetrics(view)
  return {
    available: true,
    programAddress,
    view,
    status: lifecycleToProgramStatus(view.lifecycle ?? null),
    metrics,
    owner: view.owner ?? null,
    token: view.projectToken ?? null,
    quoteAsset: view.quoteAsset ?? null,
    pair: view.pair ?? null,
    lpRecipient: view.lpRecipient ?? null,
    strategyMode: view.strategy?.mode ?? null,
    epochDurationSeconds: view.epochDurationSeconds ?? null,
    tokensSold: asString(view.tokensSold),
    tokensMatched: asString(view.tokensMatched),
    grossQuoteAcquired: asString(view.grossQuoteAcquired),
    totalFeePaid: asString(view.totalFeePaid),
    totalLpMinted: asString(view.totalLpMinted),
    executionCount: asCount(view.executionCount),
  }
}
