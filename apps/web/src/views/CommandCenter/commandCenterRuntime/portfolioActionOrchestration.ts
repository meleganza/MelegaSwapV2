/**
 * Command Center Portfolio Action Orchestration foundation (R791D.5C).
 *
 * Deterministic action organization and routing only.
 * Not autonomous execution. Not transaction automation. Not financial advice.
 */

import type {
  PortfolioPosition,
  PortfolioPositionAction,
  WalletPortfolio,
} from 'lib/wallet-portfolio/contracts'
import type { PortfolioAssistantContext } from './portfolioAssistantContext'

/** Allowed orchestration action types — no new types. */
export const PORTFOLIO_ORCHESTRATION_ACTION_TYPES = [
  'CLAIM',
  'HARVEST',
  'WITHDRAW',
  'REMOVE_LIQUIDITY',
  'APPROVE',
  'MANAGE',
  'ANALYTICS',
  'OPEN',
] as const

export type PortfolioOrchestrationActionType =
  (typeof PORTFOLIO_ORCHESTRATION_ACTION_TYPES)[number]

const ORCHESTRATION_TYPE_SET = new Set<string>(PORTFOLIO_ORCHESTRATION_ACTION_TYPES)

/** Operational priority — not financial importance. Lower = higher priority. */
export const PORTFOLIO_ACTION_PRIORITY: Record<PortfolioOrchestrationActionType, number> = {
  APPROVE: 1,
  CLAIM: 2,
  HARVEST: 3,
  WITHDRAW: 4,
  REMOVE_LIQUIDITY: 5,
  MANAGE: 6,
  ANALYTICS: 7,
  OPEN: 8,
}

export type PortfolioActionGroup =
  | 'ATTENTION_REQUIRED'
  | 'CLAIMABLE'
  | 'MANAGEMENT'
  | 'ANALYTICS'

export const PORTFOLIO_ACTION_GROUPS: readonly PortfolioActionGroup[] = [
  'ATTENTION_REQUIRED',
  'CLAIMABLE',
  'MANAGEMENT',
  'ANALYTICS',
] as const

export type PortfolioActionOrchestrationState =
  | 'DISCONNECTED'
  | 'EMPTY'
  | 'READY'
  | 'PARTIAL'

export interface PortfolioActionCardModel {
  positionId: string
  positionTitle: string
  actionType: PortfolioOrchestrationActionType
  label: string
  reason: string | null
  route: string | null
  enabled: boolean
  group: PortfolioActionGroup
}

export interface PortfolioActionGroupBucket {
  group: PortfolioActionGroup
  actions: PortfolioActionCardModel[]
}

export interface PortfolioActionOrchestrationModel {
  availableActions: PortfolioActionCardModel[]
  groupedActions: PortfolioActionGroupBucket[]
  priorityActions: PortfolioActionCardModel[]
  blockedActions: PortfolioActionCardModel[]
  state: PortfolioActionOrchestrationState
}

/** Patterns that would indicate transaction execution (must never appear as calls). */
const EXECUTION_CALL_PATTERNS = [
  new RegExp(`\\b${'write'}${'Contract'}\\s*\\(`),
  new RegExp(`\\b${'send'}${'Transaction'}\\s*\\(`),
  new RegExp(`\\b${'eth'}_${'send'}${'Transaction'}\\b`),
  new RegExp(`\\b${'sign'}${'TypedData'}\\s*\\(`),
  new RegExp(`\\b${'estimate'}${'Gas'}\\s*\\(`),
] as const

/** Guard for tests: orchestration source must not call execution APIs. */
export function orchestrationContainsExecutionMarkers(sourceText: string): boolean {
  // Strip this guard's own pattern constructors so comments/tests stay honest.
  const withoutGuard = sourceText.replace(
    /const EXECUTION_CALL_PATTERNS[\s\S]*?orchestrationContainsExecutionMarkers[\s\S]*?^}/m,
    '',
  )
  return EXECUTION_CALL_PATTERNS.some((re) => re.test(withoutGuard))
}

function collectPositionActions(position: PortfolioPosition): PortfolioPositionAction[] {
  const out: PortfolioPositionAction[] = []
  const push = (a: PortfolioPositionAction | null | undefined) => {
    if (!a || a.type === 'NONE') return
    out.push(a)
  }
  push(position.actions?.primary)
  for (const a of position.actions?.secondary ?? []) push(a)
  push(position.actions?.open)
  push(position.actions?.manage)
  push(position.actions?.analytics)
  push(position.recommendedAction)
  return out
}

export function resolvePortfolioActionGroup(input: {
  actionType: PortfolioOrchestrationActionType
  requiresAttention: boolean
}): PortfolioActionGroup {
  if (input.requiresAttention) return 'ATTENTION_REQUIRED'
  if (input.actionType === 'CLAIM' || input.actionType === 'HARVEST') return 'CLAIMABLE'
  if (input.actionType === 'ANALYTICS' || input.actionType === 'OPEN') return 'ANALYTICS'
  return 'MANAGEMENT'
}

function cardKey(card: Pick<PortfolioActionCardModel, 'positionId' | 'actionType' | 'label' | 'route'>): string {
  return `${card.positionId}|${card.actionType}|${card.label}|${card.route ?? ''}`
}

function comparePriority(a: PortfolioActionCardModel, b: PortfolioActionCardModel): number {
  const pa = PORTFOLIO_ACTION_PRIORITY[a.actionType]
  const pb = PORTFOLIO_ACTION_PRIORITY[b.actionType]
  if (pa !== pb) return pa - pb
  const byTitle = a.positionTitle.localeCompare(b.positionTitle)
  if (byTitle !== 0) return byTitle
  return a.label.localeCompare(b.label)
}

function sectionIsPartial(portfolio: WalletPortfolio): boolean {
  return Object.values(portfolio.sectionStatus ?? {}).some((s) => s?.status === 'PARTIAL')
}

/**
 * Pure projection: assistant context + position actions → orchestration model.
 * No fetch. No Date.now. No economics. No transaction execution.
 */
export function buildPortfolioActionOrchestration(input: {
  assistantContext: PortfolioAssistantContext
  portfolio: WalletPortfolio
  walletConnected: boolean
}): PortfolioActionOrchestrationModel {
  if (!input.walletConnected) {
    return {
      availableActions: [],
      groupedActions: PORTFOLIO_ACTION_GROUPS.map((group) => ({ group, actions: [] })),
      priorityActions: [],
      blockedActions: [],
      state: 'DISCONNECTED',
    }
  }

  const positions = Array.isArray(input.portfolio.positions) ? input.portfolio.positions : []
  const byId = new Map(positions.map((p) => [p.positionId, p]))
  const byTitle = new Map(positions.map((p) => [p.title, p]))
  const cards = new Map<string, PortfolioActionCardModel>()

  const upsert = (card: PortfolioActionCardModel) => {
    const key = cardKey(card)
    const existing = cards.get(key)
    if (!existing) {
      cards.set(key, card)
      return
    }
    // Prefer enabled; keep earliest group if same
    if (!existing.enabled && card.enabled) {
      cards.set(key, card)
    }
  }

  // Source 1: PortfolioPosition.actions (allowed types only)
  for (const position of positions) {
    for (const action of collectPositionActions(position)) {
      if (!ORCHESTRATION_TYPE_SET.has(action.type)) continue
      const actionType = action.type as PortfolioOrchestrationActionType
      upsert({
        positionId: position.positionId,
        positionTitle: position.title,
        actionType,
        label: action.label,
        reason: action.reasonDisabled ?? position.reason,
        route: action.route,
        enabled: action.enabled === true,
        group: resolvePortfolioActionGroup({
          actionType,
          requiresAttention: position.requiresAttention === true,
        }),
      })
    }
  }

  // Source 2: PortfolioAssistantContext.actions (no invented types)
  for (const action of input.assistantContext.actions ?? []) {
    if (!ORCHESTRATION_TYPE_SET.has(action.type)) continue
    const matched =
      byTitle.get(action.position) ??
      [...byId.values()].find((p) => p.title === action.position) ??
      null
    const positionId = matched?.positionId ?? `assistant:${action.position}`
    const requiresAttention = matched?.requiresAttention === true
    const actionType = action.type as PortfolioOrchestrationActionType
    upsert({
      positionId,
      positionTitle: action.position,
      actionType,
      label: action.label,
      reason: action.reason,
      route: action.route,
      enabled: action.enabled === true,
      group: resolvePortfolioActionGroup({ actionType, requiresAttention }),
    })
  }

  const all = [...cards.values()]
  const availableActions = all.filter((c) => c.enabled).sort(comparePriority)
  const blockedActions = all.filter((c) => !c.enabled).sort(comparePriority)
  const priorityActions = [...availableActions]

  const groupedActions: PortfolioActionGroupBucket[] = PORTFOLIO_ACTION_GROUPS.map((group) => ({
    group,
    actions: availableActions.filter((c) => c.group === group),
  }))

  let state: PortfolioActionOrchestrationState = 'EMPTY'
  if (availableActions.length > 0) {
    state =
      blockedActions.length > 0 || sectionIsPartial(input.portfolio) ? 'PARTIAL' : 'READY'
  } else if (blockedActions.length > 0 || sectionIsPartial(input.portfolio)) {
    state = 'PARTIAL'
  } else {
    state = 'EMPTY'
  }

  return {
    availableActions,
    groupedActions,
    priorityActions,
    blockedActions,
    state,
  }
}
