/**
 * Universal My Position card experience model (R791D.3F).
 *
 * Pure projection: PortfolioPosition → MyPositionCardModel
 * One schema for LIQUIDITY / FARM / POOL / VAULT / LENDING / STRATEGY / …
 *
 * No React. No CSS. No fetch. No economics calculations.
 */

import type {
  PortfolioActionType,
  PortfolioPosition,
  PortfolioPositionAction,
  PortfolioPositionChain,
  PortfolioPositionLifecycle,
  PortfolioPositionType,
  PortfolioTokenRef,
} from './contracts'

// ─── Value / claimable summaries ─────────────────────────────────────────────

export interface PositionValueSummary {
  currentValueUsd: string | null
  principalValueUsd: string | null
  claimableValueUsd: string | null
  pendingRewardsValueUsd: string | null
}

export interface PositionClaimableSummary {
  hasClaimable: boolean
  valueUsd: string | null
  tokens: PortfolioTokenRef[]
  actions: PortfolioPositionAction[]
}

// ─── Nested blocks ──────────────────────────────────────────────────────────

export interface MyPositionCardIdentity {
  positionId: string
  positionType: PortfolioPositionType
  protocol: string
  chain: PortfolioPositionChain
  contract: string | null
  wallet: string
}

export interface MyPositionCardLifecycle {
  status: PortfolioPositionLifecycle
  startedAt: string | null
  endsAt: string | null
  updatedAt: string | null
}

export interface MyPositionCardActions {
  primaryAction: PortfolioPositionAction
  secondaryActions: PortfolioPositionAction[]
}

export interface MyPositionCardNavigation {
  productRoute: string | null
  openRoute: string | null
  manageRoute: string | null
  analyticsRoute: string | null
}

export interface MyPositionCardAttention {
  requiresAttention: boolean
  attentionReason: string | null
}

/**
 * Universal position card — not Farm/Pool/Liquidity-specific.
 * Presentation fields come from PortfolioPosition only.
 */
export interface MyPositionCardModel {
  identity: MyPositionCardIdentity
  positionId: string
  positionType: PortfolioPositionType
  title: string
  subtitle: string | null
  icon: string | null
  badge: string[]
  tags: string[]
  value: PositionValueSummary
  claimables: PositionClaimableSummary
  lifecycle: MyPositionCardLifecycle
  actions: MyPositionCardActions
  navigation: MyPositionCardNavigation
  attention: MyPositionCardAttention
  status: PortfolioPositionLifecycle
  /** Flat attention flag for consumers that do not need the attention block. */
  requiresAttention: boolean
}

// ─── Action priority (existing actions only) ────────────────────────────────

const CLAIM_TYPES: readonly PortfolioActionType[] = ['CLAIM', 'HARVEST']
const MANAGEMENT_TYPES: readonly PortfolioActionType[] = [
  'MANAGE',
  'REMOVE_LIQUIDITY',
  'ADD_LIQUIDITY',
  'WITHDRAW',
  'UNSTAKE',
  'STAKE',
  'APPROVE',
]
const OPEN_MANAGE_TYPES: readonly PortfolioActionType[] = ['OPEN', 'MANAGE']
const ANALYTICS_TYPES: readonly PortfolioActionType[] = ['ANALYTICS']

function actionKey(action: PortfolioPositionAction): string {
  return `${action.type}:${action.label}:${action.route ?? ''}:${action.enabled}`
}

function collectAllActions(position: PortfolioPosition): PortfolioPositionAction[] {
  const seen = new Set<string>()
  const out: PortfolioPositionAction[] = []
  const push = (action: PortfolioPositionAction | null | undefined) => {
    if (!action || action.type === 'NONE') return
    const key = actionKey(action)
    if (seen.has(key)) return
    seen.add(key)
    out.push(action)
  }
  push(position.actions?.primary)
  for (const a of position.actions?.secondary ?? []) push(a)
  push(position.actions?.open)
  push(position.actions?.manage)
  push(position.actions?.analytics)
  push(position.recommendedAction)
  return out
}

function actionRank(action: PortfolioPositionAction): number {
  // 1 enabled claim/harvest
  if (action.enabled && CLAIM_TYPES.includes(action.type)) return 1
  // 2 enabled management
  if (action.enabled && MANAGEMENT_TYPES.includes(action.type)) return 2
  // 3 enabled open/manage (MANAGE already ranked 2 when enabled)
  if (action.enabled && OPEN_MANAGE_TYPES.includes(action.type)) return 3
  // 4 analytics
  if (action.enabled && ANALYTICS_TYPES.includes(action.type)) return 4
  // 5 disabled action
  if (!action.enabled) return 5
  return 6
}

/**
 * Order canonical PortfolioPosition.actions — never invent actions.
 * Priority: enabled claim/harvest → management → open/manage → analytics → disabled.
 */
export function prioritizeCardActions(position: PortfolioPosition): MyPositionCardActions {
  const available = collectAllActions(position)
  const ordered = [...available].sort((a, b) => {
    const ra = actionRank(a)
    const rb = actionRank(b)
    if (ra !== rb) return ra - rb
    return a.priority - b.priority
  })

  if (ordered.length === 0) {
    return {
      primaryAction: position.actions.primary,
      secondaryActions: [...position.actions.secondary],
    }
  }

  return {
    primaryAction: ordered[0],
    secondaryActions: ordered.slice(1),
  }
}

// ─── Claimable summary (canonical facts only) ───────────────────────────────

function isPositiveUsd(value: string | null | undefined): boolean {
  if (value == null) return false
  const trimmed = String(value).trim()
  if (trimmed === '' || trimmed === '0' || trimmed === '0.0' || trimmed === '0.00') return false
  const n = Number(trimmed)
  return Number.isFinite(n) && n > 0
}

function projectClaimables(position: PortfolioPosition): PositionClaimableSummary {
  const claimActions = collectAllActions(position).filter((a) => CLAIM_TYPES.includes(a.type))
  const hasClaimable =
    isPositiveUsd(position.claimableValueUsd) ||
    isPositiveUsd(position.pendingRewardsValueUsd) ||
    claimActions.some((a) => a.enabled)

  return {
    hasClaimable,
    valueUsd: position.claimableValueUsd,
    tokens: [...(position.rewardTokens ?? [])],
    actions: claimActions,
  }
}

// ─── Projection ─────────────────────────────────────────────────────────────

/**
 * Project one PortfolioPosition into the universal My Position card model.
 * Pure, deterministic, non-mutating. No fetch / React / Date.now.
 */
export function projectMyPositionCard(position: PortfolioPosition): MyPositionCardModel {
  const actions = prioritizeCardActions(position)
  const requiresAttention = position.requiresAttention === true

  return {
    identity: {
      positionId: position.positionId,
      positionType: position.positionType,
      protocol: position.protocol,
      chain: {
        chainId: position.chain.chainId,
        name: position.chain.name,
      },
      contract: position.contract,
      wallet: position.wallet,
    },
    positionId: position.positionId,
    positionType: position.positionType,
    title: position.title,
    subtitle: position.subtitle,
    icon: position.icon,
    badge: [...(position.badges ?? [])],
    tags: [...(position.tags ?? [])],
    value: {
      currentValueUsd: position.currentValueUsd,
      principalValueUsd: position.principalValueUsd,
      claimableValueUsd: position.claimableValueUsd,
      pendingRewardsValueUsd: position.pendingRewardsValueUsd,
    },
    claimables: projectClaimables(position),
    lifecycle: {
      status: position.status,
      startedAt: position.startedAt,
      endsAt: position.endsAt,
      updatedAt: position.updatedAt,
    },
    actions,
    navigation: {
      productRoute: position.productRoute,
      openRoute: position.openRoute,
      manageRoute: position.manageRoute,
      analyticsRoute: position.analyticsRoute,
    },
    attention: {
      requiresAttention,
      attentionReason: requiresAttention ? position.reason : null,
    },
    status: position.status,
    requiresAttention,
  }
}
