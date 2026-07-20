/**
 * Command Center AI Portfolio Assistant context foundation (R791D.5A).
 *
 * Machine-readable operational context derived from WalletPortfolio +
 * PortfolioIntelligenceModel. Not a chatbot. Not financial advice.
 * Not autonomous execution. No LLM calls.
 */

import type {
  PortfolioClaimableItem,
  PortfolioPosition,
  PortfolioPositionAction,
  WalletPortfolio,
} from 'lib/wallet-portfolio/contracts'
import { PORTFOLIO_VIEW_TYPES, type PortfolioViewType } from 'lib/wallet-portfolio/viewEngine'
import type {
  PortfolioIntelligenceActionItem,
  PortfolioIntelligenceAttentionItem,
  PortfolioIntelligenceHealthItem,
  PortfolioIntelligenceModel,
} from './portfolioIntelligence'

/** Assistant operational states — no advice semantics. */
export type PortfolioAssistantState =
  | 'DISCONNECTED'
  | 'EMPTY'
  | 'READY'
  | 'PARTIAL'
  | 'UNAVAILABLE'

/** Actions allowed in assistant action context (from intelligence only). */
export const PORTFOLIO_ASSISTANT_ACTION_TYPES = [
  'CLAIM',
  'HARVEST',
  'WITHDRAW',
  'REMOVE_LIQUIDITY',
  'APPROVE',
] as const

export type PortfolioAssistantActionType = (typeof PORTFOLIO_ASSISTANT_ACTION_TYPES)[number]

const ASSISTANT_ACTION_TYPE_SET = new Set<string>(PORTFOLIO_ASSISTANT_ACTION_TYPES)

export interface PortfolioAssistantIdentity {
  wallet: string | null
  connected: boolean
  /** Public chain label when known; never private keys or secrets. */
  chain: { chainId: number; name: string } | null
}

export interface PortfolioAssistantPositionContext {
  title: string
  type: string
  status: string
  value: string | null
  claimable: string | null
  actions: Array<{
    type: string
    label: string
    enabled: boolean
    route: string | null
  }>
  attention: boolean
  route: string | null
}

export interface PortfolioAssistantActionContext {
  label: string
  position: string
  reason: string | null
  route: string | null
  enabled: boolean
  type: PortfolioAssistantActionType
}

export interface PortfolioAssistantAttentionContext {
  title: string
  reason: string | null
  positionTitle: string | null
  source: PortfolioIntelligenceAttentionItem['source']
}

export interface PortfolioAssistantClaimableContext {
  title: string
  amount: string | null
  value: string | null
  positionId: string | null
  sourceType: string | null
  actionLabel: string | null
  route: string | null
  enabled: boolean
}

export interface PortfolioAssistantHealthContext {
  title: string
  detail: string | null
  kind: PortfolioIntelligenceHealthItem['kind']
}

export interface PortfolioAssistantActivityContext {
  label: string
  kind: string
  time: string
  href: string | null
}

export interface PortfolioAssistantSummary {
  /** Deterministic natural-language lines — operational facts only. */
  lines: string[]
  activePositions: number
  attentionCount: number
  actionCount: number
  claimableCount: number
  historicalCount: number
  unavailableCount: number
  farmClaimableCount: number
  positionCount: number
}

export interface PortfolioAssistantContext {
  identity: PortfolioAssistantIdentity
  summary: PortfolioAssistantSummary
  positions: PortfolioAssistantPositionContext[]
  attention: PortfolioAssistantAttentionContext[]
  actions: PortfolioAssistantActionContext[]
  claimables: PortfolioAssistantClaimableContext[]
  health: PortfolioAssistantHealthContext[]
  activity: PortfolioAssistantActivityContext[]
  availableViews: readonly PortfolioViewType[]
  state: PortfolioAssistantState
}

const FORBIDDEN_ADVICE_PATTERNS = [
  /good investment/i,
  /best opportunity/i,
  /should buy/i,
  /should sell/i,
  /maximize yield/i,
] as const

function plural(count: number, singular: string, pluralForm?: string): string {
  return count === 1 ? singular : pluralForm ?? `${singular}s`
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

function resolveChain(portfolio: WalletPortfolio): PortfolioAssistantIdentity['chain'] {
  const positions = Array.isArray(portfolio.positions) ? portfolio.positions : []
  if (positions.length === 0) return null
  const first = positions[0]?.chain
  if (!first || typeof first.chainId !== 'number') return null
  const allSame = positions.every(
    (p) => p.chain?.chainId === first.chainId && p.chain?.name === first.name,
  )
  if (!allSame) return null
  return { chainId: first.chainId, name: first.name }
}

function projectPosition(position: PortfolioPosition): PortfolioAssistantPositionContext {
  const actions = collectPositionActions(position)
    .filter((a) => ASSISTANT_ACTION_TYPE_SET.has(a.type) || a.enabled)
    .map((a) => ({
      type: a.type,
      label: a.label,
      enabled: a.enabled === true,
      route: a.route,
    }))

  return {
    title: position.title,
    type: position.positionType,
    status: position.status,
    value: position.currentValueUsd,
    claimable: position.claimableValueUsd ?? position.pendingRewardsValueUsd,
    actions,
    attention: position.requiresAttention === true,
    route: position.manageRoute ?? position.openRoute ?? position.productRoute,
  }
}

function projectAction(item: PortfolioIntelligenceActionItem): PortfolioAssistantActionContext | null {
  const type = item.action?.type
  if (!type || !ASSISTANT_ACTION_TYPE_SET.has(type)) return null
  return {
    label: item.action.label,
    position: item.positionTitle,
    reason: item.reason,
    route: item.route ?? item.action.route,
    enabled: item.action.enabled === true,
    type: type as PortfolioAssistantActionType,
  }
}

function projectAttention(
  item: PortfolioIntelligenceAttentionItem,
  positionsById: Map<string, PortfolioPosition>,
): PortfolioAssistantAttentionContext {
  const positionTitle =
    item.positionId != null ? positionsById.get(item.positionId)?.title ?? item.title : null
  return {
    title: item.title,
    reason: item.reason,
    positionTitle: item.source === 'requiresAttention' ? positionTitle ?? item.title : null,
    source: item.source,
  }
}

function projectClaimable(item: PortfolioClaimableItem): PortfolioAssistantClaimableContext {
  return {
    title: item.title,
    amount: item.amount,
    value: item.valueUsd,
    positionId: item.positionId,
    sourceType: item.sourceType,
    actionLabel: item.action?.label ?? null,
    route: item.action?.route ?? null,
    enabled: item.action?.enabled === true,
  }
}

function projectHealth(item: PortfolioIntelligenceHealthItem): PortfolioAssistantHealthContext {
  return {
    title: item.title,
    detail: item.detail,
    kind: item.kind,
  }
}

function countFarmClaimables(
  positions: readonly PortfolioPosition[],
  claimables: readonly PortfolioClaimableItem[],
): number {
  const farmIds = new Set(
    positions.filter((p) => p.positionType === 'FARM').map((p) => p.positionId),
  )
  let fromClaimables = 0
  for (const c of claimables) {
    if (c.sourceType === 'FARM') {
      fromClaimables += 1
      continue
    }
    if (c.positionId && farmIds.has(c.positionId)) fromClaimables += 1
  }
  if (fromClaimables > 0) return fromClaimables

  let fromPositions = 0
  for (const p of positions) {
    if (p.positionType !== 'FARM') continue
    const hasClaim = collectPositionActions(p).some(
      (a) => a.enabled === true && (a.type === 'CLAIM' || a.type === 'HARVEST'),
    )
    if (hasClaim) fromPositions += 1
  }
  return fromPositions
}

/**
 * Deterministic operational summaries. Never invents economics or advice.
 */
export function buildPortfolioAssistantSummaryLines(input: {
  state: PortfolioAssistantState
  activePositions: number
  attentionCount: number
  actionCount: number
  claimableCount: number
  historicalCount: number
  farmClaimableCount: number
  positionCount: number
}): string[] {
  const {
    state,
    activePositions,
    attentionCount,
    actionCount,
    claimableCount,
    historicalCount,
    farmClaimableCount,
    positionCount,
  } = input

  if (state === 'DISCONNECTED') {
    return ['Connect a wallet to load portfolio context.']
  }
  if (state === 'EMPTY') {
    return ['Your portfolio has no positions.']
  }
  if (state === 'UNAVAILABLE') {
    return ['Portfolio data is currently unavailable.']
  }

  const lines: string[] = []

  if (activePositions > 0) {
    lines.push(`You have ${activePositions} active ${plural(activePositions, 'position')}.`)
  } else if (positionCount > 0) {
    lines.push(`You have ${positionCount} ${plural(positionCount, 'position')}.`)
  }

  if (attentionCount > 0) {
    lines.push(
      `${attentionCount} ${plural(attentionCount, 'position')} require${attentionCount === 1 ? 's' : ''} attention.`,
    )
  }

  if (farmClaimableCount > 0) {
    lines.push(
      `${farmClaimableCount} ${plural(farmClaimableCount, 'farm')} ${farmClaimableCount === 1 ? 'has' : 'have'} claimable rewards.`,
    )
  } else if (claimableCount > 0) {
    lines.push(
      `${claimableCount} ${plural(claimableCount, 'position')} ${claimableCount === 1 ? 'has' : 'have'} claimable rewards.`,
    )
  }

  if (actionCount > 0) {
    lines.push(`${actionCount} operational ${plural(actionCount, 'action')} ${actionCount === 1 ? 'is' : 'are'} available.`)
  }

  if (historicalCount > 0 && activePositions === 0) {
    lines.push(`${historicalCount} historical ${plural(historicalCount, 'position')}.`)
  }

  if (state === 'PARTIAL') {
    lines.push('Some portfolio sections are partial.')
  }

  if (lines.length === 0) {
    lines.push('Portfolio context is ready.')
  }

  return lines
}

export function resolvePortfolioAssistantState(input: {
  walletConnected: boolean
  portfolio: WalletPortfolio
  intelligence: PortfolioIntelligenceModel
}): PortfolioAssistantState {
  if (!input.walletConnected) return 'DISCONNECTED'

  const positions = Array.isArray(input.portfolio.positions) ? input.portfolio.positions : []
  const claimables = Array.isArray(input.portfolio.claimables) ? input.portfolio.claimables : []
  if (positions.length === 0 && claimables.length === 0) return 'EMPTY'

  const sections = Object.values(input.portfolio.sectionStatus ?? {})
  const hasUnavailable = sections.some(
    (s) => s?.status === 'UNAVAILABLE' || s?.status === 'UNSUPPORTED_NETWORK',
  )
  if (hasUnavailable || input.intelligence.summary.unavailableCount > 0) {
    return 'UNAVAILABLE'
  }

  const hasPartial = sections.some((s) => s?.status === 'PARTIAL')
  if (hasPartial) return 'PARTIAL'

  return 'READY'
}

/**
 * Pure projection: WalletPortfolio + PortfolioIntelligenceModel → PortfolioAssistantContext.
 * No fetch. No Date.now. No LLM. No invented economics.
 */
export function buildPortfolioAssistantContext(input: {
  portfolio: WalletPortfolio
  intelligence: PortfolioIntelligenceModel
  walletConnected: boolean
}): PortfolioAssistantContext {
  const { portfolio, intelligence, walletConnected } = input
  const positions = walletConnected && Array.isArray(portfolio.positions) ? portfolio.positions : []
  const claimables = walletConnected && Array.isArray(portfolio.claimables) ? portfolio.claimables : []
  const activity = walletConnected && Array.isArray(portfolio.recentActivity) ? portfolio.recentActivity : []

  const state = resolvePortfolioAssistantState({ walletConnected, portfolio, intelligence })
  const positionsById = new Map(positions.map((p) => [p.positionId, p]))

  const actions = intelligence.actionItems
    .map(projectAction)
    .filter((a): a is PortfolioAssistantActionContext => a != null)

  const attention = intelligence.attentionItems.map((item) => projectAttention(item, positionsById))

  const farmClaimableCount = countFarmClaimables(positions, claimables)

  const summaryCounts = {
    activePositions: intelligence.summary.activePositions,
    attentionCount: intelligence.summary.attentionCount,
    actionCount: actions.length,
    claimableCount: intelligence.summary.claimableCount,
    historicalCount: intelligence.summary.historicalCount,
    unavailableCount: intelligence.summary.unavailableCount,
    farmClaimableCount,
    positionCount: positions.length,
  }

  const summary: PortfolioAssistantSummary = {
    lines: buildPortfolioAssistantSummaryLines({ state, ...summaryCounts }),
    ...summaryCounts,
  }

  return {
    identity: {
      wallet: walletConnected ? portfolio.wallet : null,
      connected: walletConnected,
      chain: walletConnected ? resolveChain(portfolio) : null,
    },
    summary,
    positions: positions.map(projectPosition),
    attention,
    actions,
    claimables: claimables.map(projectClaimable),
    health: intelligence.healthItems.map(projectHealth),
    activity: activity.map((a) => ({
      label: a.label,
      kind: a.kind,
      time: a.time,
      href: a.href,
    })),
    availableViews: PORTFOLIO_VIEW_TYPES,
    state,
  }
}

/** Guard for tests / consumers: summary lines must never contain advice language. */
export function containsForbiddenAdviceLanguage(text: string): boolean {
  return FORBIDDEN_ADVICE_PATTERNS.some((re) => re.test(text))
}
