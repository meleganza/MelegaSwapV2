/**
 * Command Center Portfolio Intelligence layer (R791D.4E).
 *
 * Operational intelligence only — derives from WalletPortfolio facts.
 * Not advice. Not yield guidance. Not scoring. Not economics math.
 */

import type {
  PortfolioPosition,
  PortfolioPositionAction,
  PortfolioSectionStatusCode,
  WalletPortfolio,
  WalletPortfolioSectionStatus,
} from 'lib/wallet-portfolio/contracts'

export type PortfolioIntelligenceGeneratedState =
  | 'WALLET_NOT_CONNECTED'
  | 'EMPTY'
  | 'READY'

export type PortfolioIntelligenceAttentionSource = 'requiresAttention' | 'sectionStatus'

export interface PortfolioIntelligenceAttentionItem {
  id: string
  positionId: string | null
  title: string
  reason: string | null
  source: PortfolioIntelligenceAttentionSource
  section: keyof WalletPortfolioSectionStatus | null
}

export interface PortfolioIntelligenceActionItem {
  id: string
  positionId: string
  positionTitle: string
  action: PortfolioPositionAction
  route: string | null
  priority: number
  reason: string | null
}

export type PortfolioIntelligenceHealthKind = 'section' | 'lifecycle' | 'dataState'

export interface PortfolioIntelligenceHealthItem {
  id: string
  kind: PortfolioIntelligenceHealthKind
  title: string
  detail: string | null
  positionId: string | null
  section: keyof WalletPortfolioSectionStatus | null
}

export interface PortfolioIntelligenceSummary {
  activePositions: number
  attentionCount: number
  actionCount: number
  claimableCount: number
  unavailableCount: number
  historicalCount: number
}

export interface PortfolioIntelligenceModel {
  attentionItems: PortfolioIntelligenceAttentionItem[]
  actionItems: PortfolioIntelligenceActionItem[]
  healthItems: PortfolioIntelligenceHealthItem[]
  summary: PortfolioIntelligenceSummary
  generatedState: PortfolioIntelligenceGeneratedState
}

/** Canonical operational action types for intelligence action items. */
const INTELLIGENCE_ACTION_TYPES = new Set([
  'CLAIM',
  'HARVEST',
  'WITHDRAW',
  'REMOVE_LIQUIDITY',
  'APPROVE',
])

const SECTION_KEYS: (keyof WalletPortfolioSectionStatus)[] = [
  'summary',
  'positions',
  'claimables',
  'approvals',
  'activity',
]

const UNAVAILABLE_SECTION: PortfolioSectionStatusCode[] = ['UNAVAILABLE', 'UNSUPPORTED_NETWORK']

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

function buildAttentionItems(
  positions: readonly PortfolioPosition[],
  sectionStatus: WalletPortfolioSectionStatus,
): PortfolioIntelligenceAttentionItem[] {
  const items: PortfolioIntelligenceAttentionItem[] = []

  for (const position of positions) {
    if (position.requiresAttention !== true) continue
    items.push({
      id: `attention:position:${position.positionId}`,
      positionId: position.positionId,
      title: position.title,
      reason: position.reason,
      source: 'requiresAttention',
      section: null,
    })
  }

  for (const key of SECTION_KEYS) {
    const section = sectionStatus[key]
    if (!section || !UNAVAILABLE_SECTION.includes(section.status)) continue
    if (section.status === 'UNAVAILABLE' || section.status === 'UNSUPPORTED_NETWORK') {
      items.push({
        id: `attention:section:${key}`,
        positionId: null,
        title: `Section ${key}`,
        reason: section.message ?? section.errorCode ?? section.status,
        source: 'sectionStatus',
        section: key,
      })
    }
  }

  return items
}

function buildActionItems(positions: readonly PortfolioPosition[]): PortfolioIntelligenceActionItem[] {
  const items: PortfolioIntelligenceActionItem[] = []
  for (const position of positions) {
    const seen = new Set<string>()
    for (const action of collectPositionActions(position)) {
      if (!INTELLIGENCE_ACTION_TYPES.has(action.type)) continue
      if (action.enabled !== true) continue
      const key = `${action.type}:${action.label}:${action.route ?? ''}`
      if (seen.has(key)) continue
      seen.add(key)
      items.push({
        id: `action:${position.positionId}:${key}`,
        positionId: position.positionId,
        positionTitle: position.title,
        action,
        route: action.route,
        priority: action.priority,
        reason: action.reasonDisabled,
      })
    }
  }
  return items.sort((a, b) => a.priority - b.priority)
}

function buildHealthItems(
  positions: readonly PortfolioPosition[],
  sectionStatus: WalletPortfolioSectionStatus,
): PortfolioIntelligenceHealthItem[] {
  const items: PortfolioIntelligenceHealthItem[] = []

  for (const key of SECTION_KEYS) {
    const section = sectionStatus[key]
    if (!section) continue
    if (section.status === 'UNAVAILABLE' || section.status === 'PARTIAL') {
      items.push({
        id: `health:section:${key}:${section.status}`,
        kind: 'section',
        title: `Section ${key}`,
        detail: section.message ?? section.status,
        positionId: null,
        section: key,
      })
    }
  }

  for (const position of positions) {
    if (position.status === 'ENDED') {
      items.push({
        id: `health:lifecycle:${position.positionId}`,
        kind: 'lifecycle',
        title: position.title,
        detail: 'ENDED',
        positionId: position.positionId,
        section: null,
      })
    }
    if (position.dataState === 'UNAVAILABLE' || position.dataState === 'PARTIAL') {
      items.push({
        id: `health:data:${position.positionId}:${position.dataState}`,
        kind: 'dataState',
        title: position.title,
        detail: position.dataState,
        positionId: position.positionId,
        section: null,
      })
    }
  }

  return items
}

function buildSummary(
  positions: readonly PortfolioPosition[],
  actionItems: readonly PortfolioIntelligenceActionItem[],
  attentionItems: readonly PortfolioIntelligenceAttentionItem[],
): PortfolioIntelligenceSummary {
  let activePositions = 0
  let claimableCount = 0
  let unavailableCount = 0
  let historicalCount = 0

  for (const position of positions) {
    if (position.status === 'ACTIVE') activePositions += 1
    if (position.status === 'ENDED') historicalCount += 1
    if (position.dataState === 'UNAVAILABLE') unavailableCount += 1
    const hasClaimableAction = collectPositionActions(position).some(
      (a) => a.enabled === true && (a.type === 'CLAIM' || a.type === 'HARVEST'),
    )
    if (hasClaimableAction) claimableCount += 1
  }

  return {
    activePositions,
    attentionCount: attentionItems.filter((i) => i.source === 'requiresAttention').length,
    actionCount: actionItems.length,
    claimableCount,
    unavailableCount,
    historicalCount,
  }
}

/**
 * Pure projection: WalletPortfolio → PortfolioIntelligenceModel.
 * No fetch. No Date.now. No economics. No scoring.
 */
export function buildPortfolioIntelligence(input: {
  portfolio: WalletPortfolio
  walletConnected: boolean
}): PortfolioIntelligenceModel {
  if (!input.walletConnected) {
    return {
      attentionItems: [],
      actionItems: [],
      healthItems: [],
      summary: {
        activePositions: 0,
        attentionCount: 0,
        actionCount: 0,
        claimableCount: 0,
        unavailableCount: 0,
        historicalCount: 0,
      },
      generatedState: 'WALLET_NOT_CONNECTED',
    }
  }

  const positions = Array.isArray(input.portfolio.positions) ? input.portfolio.positions : []
  const sectionStatus = input.portfolio.sectionStatus

  if (positions.length === 0) {
    const healthItems = buildHealthItems([], sectionStatus)
    return {
      attentionItems: buildAttentionItems([], sectionStatus),
      actionItems: [],
      healthItems,
      summary: {
        activePositions: 0,
        attentionCount: 0,
        actionCount: 0,
        claimableCount: 0,
        unavailableCount: 0,
        historicalCount: 0,
      },
      generatedState: 'EMPTY',
    }
  }

  const attentionItems = buildAttentionItems(positions, sectionStatus)
  const actionItems = buildActionItems(positions)
  const healthItems = buildHealthItems(positions, sectionStatus)
  const summary = buildSummary(positions, actionItems, attentionItems)

  return {
    attentionItems,
    actionItems,
    healthItems,
    summary,
    generatedState: 'READY',
  }
}
