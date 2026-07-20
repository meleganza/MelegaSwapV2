import type { LbActivityItem } from './uxCopy'
import { translateActivityReason } from './uxCopy'

/** Canonical machine event names from Program + runtime. */
export type LbMachineEventType =
  | 'ProgramCreated'
  | 'BudgetDeposited'
  | 'ProgramActivated'
  | 'ExecutionCompleted'
  | 'ExecutionSkipped'
  | 'ProgramPaused'
  | 'ProgramResumed'
  | 'ProgramStopped'
  | 'Waiting'

export type LbMachineEvent = {
  id: string
  type: LbMachineEventType
  /** Optional payload from receipt / view */
  projectTokenSold?: string
  grossQuoteAcquired?: string
  quoteAssetAdded?: string
  lpMinted?: string
  skipReason?: string
  at?: string
}

const USER_TITLE: Record<LbMachineEventType, string> = {
  ProgramCreated: 'Program created',
  BudgetDeposited: 'Budget deposited',
  ProgramActivated: 'Program activated',
  ExecutionCompleted: 'Liquidity built from market demand',
  ExecutionSkipped: 'Execution skipped',
  ProgramPaused: 'Program paused',
  ProgramResumed: 'Program resumed',
  ProgramStopped: 'Program stopped',
  Waiting: 'Waiting',
}

/**
 * Map verified machine events → user activity items.
 * Dedupes by `id`. Never invents events.
 */
export function mapActivityEvents(events: readonly LbMachineEvent[]): LbActivityItem[] {
  const seen = new Set<string>()
  const out: LbActivityItem[] = []

  for (const e of events) {
    if (!e?.id || seen.has(e.id)) continue
    seen.add(e.id)

    if (e.type === 'ExecutionCompleted') {
      out.push({
        id: e.id,
        kind: 'EXECUTION_COMPLETED',
        title: USER_TITLE.ExecutionCompleted,
        tokenSold: e.projectTokenSold,
        quoteAcquired: e.grossQuoteAcquired,
        liquidityAdded: e.quoteAssetAdded ?? e.lpMinted,
        at: e.at,
      })
      continue
    }

    if (e.type === 'ExecutionSkipped') {
      out.push({
        id: e.id,
        kind: 'EXECUTION_SKIPPED',
        title: USER_TITLE.ExecutionSkipped,
        reason: translateActivityReason(e.skipReason),
        at: e.at,
      })
      continue
    }

    if (e.type === 'Waiting') {
      out.push({
        id: e.id,
        kind: 'WAITING',
        title: USER_TITLE.Waiting,
        reason: translateActivityReason(e.skipReason ?? 'CONDITIONS_NOT_FAVORABLE'),
        at: e.at,
      })
      continue
    }

    out.push({
      id: e.id,
      kind: 'WAITING',
      title: USER_TITLE[e.type],
      detail: e.type,
      at: e.at,
    })
  }

  return out
}

/** Build activity from latestExecution when executionCount > 0 — verified receipt fields only. */
export function activityFromLatestExecution(input: {
  executionCount: number | null
  latest: {
    executionId?: string
    projectTokenSold?: { toString(): string } | string
    grossQuoteAcquired?: { toString(): string } | string
    quoteAssetAdded?: { toString(): string } | string
    lpMinted?: { toString(): string } | string
    successTimestamp?: number | { toString(): string }
  } | null
}): LbActivityItem[] {
  if (!input.executionCount || input.executionCount <= 0 || !input.latest?.executionId) {
    return []
  }
  const id = String(input.latest.executionId)
  return mapActivityEvents([
    {
      id,
      type: 'ExecutionCompleted',
      projectTokenSold: String(input.latest.projectTokenSold ?? ''),
      grossQuoteAcquired: String(input.latest.grossQuoteAcquired ?? ''),
      quoteAssetAdded: String(input.latest.quoteAssetAdded ?? ''),
      lpMinted: String(input.latest.lpMinted ?? ''),
      at: input.latest.successTimestamp != null ? String(input.latest.successTimestamp) : undefined,
    },
  ])
}
