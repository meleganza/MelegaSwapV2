/**
 * Pure Liquidity → PortfolioPosition adapter (R791D.2D).
 *
 * Converts verified wallet-held LP facts into one canonical PortfolioPosition.
 * No fetch, RPC, browser, React, Date.now, mutation, or random values.
 * Not connected to Command Center or Liquidity Studio runtime.
 */

import {
  PORTFOLIO_POSITION_SCHEMA,
  buildPortfolioPositionId,
  createNonePortfolioAction,
  type PortfolioDataState,
  type PortfolioPosition,
  type PortfolioPositionAction,
  type PortfolioPositionActions,
  type PortfolioPositionLifecycle,
  type PortfolioTokenRef,
  type PortfolioUnderlyingAsset,
  type PortfolioUnlockState,
} from '../contracts'

const PROTOCOL_ID = 'melega-v2'
const PRODUCER_ID = 'liquidity-studio'
const SOURCE_ID = 'DIRECT_WALLET_LP'
const SUBTITLE = 'Liquidity position'
const PRODUCT_ROUTE_DEFAULT = '/liquidity-studio'

// ─── Adapter-boundary facts (pure; does not modify Liquidity runtime) ───────

export interface LiquidityTokenFacts {
  chainId: number | null
  address: string | null
  symbol: string | null
  name: string | null
  decimals: number | null
  logoURI: string | null
}

export interface LiquidityBalanceFacts {
  raw: string | null
  formatted: string | null
  decimals: number | null
}

export interface LiquidityApprovalFacts {
  id: string
  spender: string
  token: LiquidityTokenFacts
  allowance: string | null
  needsAttention: boolean
}

/**
 * Pure facts for one wallet-owned liquidity position.
 * Mirrors owned-LP recovery truth without importing SDK/React types.
 */
export interface LiquidityPositionFacts {
  wallet: string
  chainId: number
  chainName: string
  protocolId?: string
  protocolDisplayName?: string

  pairAddress: string | null
  sourceId?: string
  subPositionId?: string | null

  token0: LiquidityTokenFacts
  token1: LiquidityTokenFacts
  lpToken: LiquidityTokenFacts | null

  lpBalance: LiquidityBalanceFacts
  /** Explicit ownership flag. When false → null position. */
  ownershipVerified: boolean
  /** Explicit zero ownership when producer proved no LP. */
  lpBalanceIsZero?: boolean

  poolShare: string | null
  underlyingAmount0: LiquidityBalanceFacts | null
  underlyingAmount1: LiquidityBalanceFacts | null

  currentValueUsd: string | null
  principalValueUsd?: string | null
  claimableValueUsd?: string | null
  pendingRewardsValueUsd?: string | null
  apr?: string | null
  apy?: string | null
  feesEarnedUsd?: string | null

  unlockState?: PortfolioUnlockState
  isLocked?: boolean
  isPaused?: boolean
  runtimeUnavailable?: boolean

  approvals?: LiquidityApprovalFacts[]
  approvalRequired?: boolean
  criticalWarning?: string | null
  ownershipDataBlocksManagement?: boolean

  icon?: string | null
  productRoute?: string | null
  openRoute?: string | null
  manageRoute?: string | null
  removeRoute?: string | null
  addLiquidityRoute?: string | null
  analyticsRoute?: string | null

  observedAt?: string | null
  blockNumber?: number | null
  confidence?: number | null
  riskLevel?: PortfolioPosition['riskLevel']
  health?: PortfolioPosition['health']
  machinePriority?: number
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalizeAddress(value: string | null | undefined): string | null {
  if (value == null || value === '') return null
  return value.trim().toLowerCase()
}

function normalizeWallet(wallet: string): string {
  return wallet.trim().toLowerCase()
}

function shortAddress(address: string): string {
  const a = address.trim()
  if (a.length < 10) return a
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

function tokenLabel(token: LiquidityTokenFacts): string {
  if (token.symbol && token.symbol.trim()) return token.symbol.trim()
  if (token.name && token.name.trim()) return token.name.trim()
  const addr = normalizeAddress(token.address)
  if (addr) return shortAddress(addr)
  return 'UNKNOWN'
}

function mapToken(token: LiquidityTokenFacts): PortfolioTokenRef {
  return {
    chainId: token.chainId,
    address: normalizeAddress(token.address),
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals,
    logoURI: token.logoURI,
  }
}

function mapUnderlying(
  token: LiquidityTokenFacts,
  amount: LiquidityBalanceFacts | null,
): PortfolioUnderlyingAsset {
  return {
    token: mapToken(token),
    amount: amount
      ? {
          raw: amount.raw,
          formatted: amount.formatted,
          decimals: amount.decimals,
        }
      : null,
    valueUsd: null,
  }
}

function isPositiveLpBalance(facts: LiquidityPositionFacts): boolean {
  if (facts.lpBalanceIsZero === true) return false
  const raw = facts.lpBalance.raw
  if (raw != null && raw !== '') {
    try {
      // Prefer raw integer when present
      if (/^-?\d+$/.test(raw.trim())) {
        return BigInt(raw.trim()) > BigInt(0)
      }
    } catch {
      // fall through to formatted
    }
  }
  const formatted = facts.lpBalance.formatted
  if (formatted != null && formatted !== '' && formatted !== '—') {
    const n = Number(formatted.replace(/,/g, ''))
    if (Number.isFinite(n)) return n > 0
  }
  // If ownership verified and producer did not prove zero, treat as present when raw/formatted unknown
  return false
}

function shouldInclude(facts: LiquidityPositionFacts): boolean {
  if (facts.ownershipVerified === false) return false
  if (facts.lpBalanceIsZero === true) return false
  return isPositiveLpBalance(facts)
}

function resolveLifecycle(facts: LiquidityPositionFacts): PortfolioPositionLifecycle {
  if (facts.runtimeUnavailable === true) return 'UNAVAILABLE'
  if (facts.isPaused === true) return 'PAUSED'
  if (facts.isLocked === true || facts.unlockState === 'locked') return 'LOCKED'
  if (shouldInclude(facts) && (facts.pairAddress || facts.sourceId)) return 'ACTIVE'
  if (shouldInclude(facts)) return 'ACTIVE'
  return 'UNAVAILABLE'
}

function resolveUnlockState(facts: LiquidityPositionFacts): PortfolioUnlockState {
  if (facts.unlockState) return facts.unlockState
  if (facts.isLocked === true) return 'locked'
  if (facts.isLocked === false) return 'unlocked'
  return 'unknown'
}

function hasUsefulIncompleteOptionalFacts(facts: LiquidityPositionFacts): boolean {
  return (
    facts.currentValueUsd == null ||
    facts.poolShare == null ||
    facts.token0.symbol == null ||
    facts.token1.symbol == null ||
    facts.underlyingAmount0 == null ||
    facts.underlyingAmount1 == null ||
    facts.lpToken == null
  )
}

function resolveDataState(facts: LiquidityPositionFacts): PortfolioDataState {
  if (facts.runtimeUnavailable === true) return 'UNAVAILABLE'
  if (!facts.ownershipVerified) return 'UNAVAILABLE'
  if (!facts.pairAddress && !facts.sourceId) return 'UNAVAILABLE'
  if (hasUsefulIncompleteOptionalFacts(facts)) return 'PARTIAL'
  return 'READY'
}

function action(
  type: PortfolioPositionAction['type'],
  label: string,
  priority: number,
  route: string | null,
  enabled: boolean,
  reasonDisabled: string | null,
): PortfolioPositionAction {
  if (type === 'NONE') {
    return createNonePortfolioAction(label)
  }
  return {
    type,
    label,
    priority,
    route,
    enabled,
    reasonDisabled: enabled ? null : reasonDisabled,
  }
}

function buildActions(facts: LiquidityPositionFacts): {
  actions: PortfolioPositionActions
  primary: PortfolioPositionAction
} {
  const openRoute = facts.openRoute ?? facts.productRoute ?? PRODUCT_ROUTE_DEFAULT
  const manageRoute = facts.manageRoute ?? facts.removeRoute ?? facts.productRoute ?? PRODUCT_ROUTE_DEFAULT
  const analyticsRoute = facts.analyticsRoute ?? null
  const removeRoute = facts.removeRoute ?? manageRoute
  const addRoute = facts.addLiquidityRoute ?? null

  const open = action('OPEN', 'Open', 10, openRoute, Boolean(openRoute), openRoute ? null : 'Open route unavailable')
  const manage = action(
    'MANAGE',
    'Manage',
    20,
    manageRoute,
    Boolean(manageRoute) && facts.runtimeUnavailable !== true,
    facts.runtimeUnavailable
      ? 'Liquidity runtime unavailable'
      : manageRoute
        ? null
        : 'Manage route unavailable',
  )
  const analytics = analyticsRoute
    ? action('ANALYTICS', 'Analytics', 40, analyticsRoute, true, null)
    : action('ANALYTICS', 'Analytics', 40, null, false, 'Analytics route unavailable')

  const isLockedPosition = facts.isLocked === true || facts.unlockState === 'locked'
  const isUnavailable = facts.runtimeUnavailable === true

  let primary: PortfolioPositionAction

  if (isUnavailable) {
    primary = createNonePortfolioAction('Unavailable')
  } else if (isLockedPosition) {
    primary = manage.enabled ? manage : createNonePortfolioAction('Locked')
  } else if (shouldInclude(facts) && removeRoute) {
    primary = action('REMOVE_LIQUIDITY', 'Remove Liquidity', 1, removeRoute, true, null)
  } else if (manage.enabled) {
    primary = manage
  } else {
    primary = createNonePortfolioAction('No action available')
  }

  const secondary: PortfolioPositionAction[] = []
  if (addRoute) {
    secondary.push(action('ADD_LIQUIDITY', 'Add Liquidity', 30, addRoute, true, null))
  }
  if (analytics.enabled) secondary.push(analytics)
  if (open.enabled && primary.type !== 'OPEN') secondary.push(open)

  return {
    primary,
    actions: {
      primary,
      secondary,
      open: open.enabled || open.route ? open : null,
      manage: manage.enabled || manage.route ? manage : null,
      analytics: analytics.route || analytics.enabled ? analytics : null,
    },
  }
}

function buildBadges(facts: LiquidityPositionFacts): string[] {
  const badges: string[] = ['YOUR POSITION']
  if (facts.isLocked === true || facts.unlockState === 'locked') badges.push('LOCKED')
  if (resolveDataState(facts) === 'PARTIAL') badges.push('PARTIAL DATA')
  return badges
}

function buildTags(facts: LiquidityPositionFacts): string[] {
  const tags = ['LIQUIDITY']
  const protocol = (facts.protocolId ?? PROTOCOL_ID).trim()
  if (protocol) tags.push(protocol.toUpperCase())
  const s0 = facts.token0.symbol?.trim()
  const s1 = facts.token1.symbol?.trim()
  if (s0) tags.push(s0)
  if (s1) tags.push(s1)
  return tags
}

function requiresAttention(facts: LiquidityPositionFacts): boolean {
  if (facts.approvalRequired === true) return true
  if (facts.criticalWarning) return true
  if (facts.ownershipDataBlocksManagement === true) return true
  if (facts.runtimeUnavailable === true) return true
  return false
}

// ─── Primary export ─────────────────────────────────────────────────────────

/**
 * Adapt verified Liquidity position facts into one canonical PortfolioPosition.
 * Returns null only when facts prove the wallet does not own the position.
 */
export function adaptLiquidityPositionToPortfolioPosition(
  facts: LiquidityPositionFacts,
): PortfolioPosition | null {
  if (!shouldInclude(facts)) return null

  const wallet = normalizeWallet(facts.wallet)
  const protocolId = (facts.protocolId ?? PROTOCOL_ID).trim().toLowerCase()
  const sourceId = facts.sourceId ?? SOURCE_ID
  const pairAddress = normalizeAddress(facts.pairAddress)
  const contractOrSourceId = pairAddress ?? sourceId

  const positionId = buildPortfolioPositionId({
    wallet,
    chainId: facts.chainId,
    positionType: 'LIQUIDITY',
    protocolId,
    contractOrSourceId,
    subPositionId: facts.subPositionId ?? null,
  })

  const title = `${tokenLabel(facts.token0)} / ${tokenLabel(facts.token1)}`
  const lifecycle = resolveLifecycle(facts)
  const dataState = resolveDataState(facts)
  const { actions, primary } = buildActions(facts)
  const unlockState = resolveUnlockState(facts)
  const attention = requiresAttention(facts)

  const lpToken = facts.lpToken
    ? mapToken(facts.lpToken)
    : pairAddress
      ? {
          chainId: facts.chainId,
          address: pairAddress,
          symbol: null,
          name: null,
          decimals: facts.lpBalance.decimals,
          logoURI: null,
        }
      : null

  return {
    schema: PORTFOLIO_POSITION_SCHEMA,
    positionId,
    positionType: 'LIQUIDITY',
    wallet,
    protocol: facts.protocolDisplayName?.trim() || protocolId,
    chain: {
      chainId: facts.chainId,
      name: facts.chainName,
    },
    contract: pairAddress,
    source: sourceId,

    title,
    subtitle: SUBTITLE,
    icon: facts.icon ?? null,
    badges: buildBadges(facts),
    tags: buildTags(facts),

    importance: 'NORMAL',
    requiresAttention: attention,

    underlyingAssets: [
      mapUnderlying(facts.token0, facts.underlyingAmount0),
      mapUnderlying(facts.token1, facts.underlyingAmount1),
    ],
    lpToken,
    stakeToken: null,
    rewardTokens: [],

    currentValueUsd: facts.currentValueUsd,
    principalValueUsd: facts.principalValueUsd ?? null,
    claimableValueUsd: facts.claimableValueUsd ?? null,
    pendingRewardsValueUsd: facts.pendingRewardsValueUsd ?? null,
    apr: facts.apr ?? null,
    apy: facts.apy ?? null,
    feesEarnedUsd: facts.feesEarnedUsd ?? null,

    balance: {
      raw: facts.lpBalance.raw,
      formatted: facts.lpBalance.formatted,
      decimals: facts.lpBalance.decimals,
    },
    poolShare: facts.poolShare,
    ownershipVerified: facts.ownershipVerified,
    unlockState,
    approvals: (facts.approvals ?? []).map((a) => ({
      id: a.id,
      spender: a.spender.trim().toLowerCase(),
      token: mapToken(a.token),
      allowance: a.allowance,
      needsAttention: a.needsAttention,
    })),

    status: lifecycle,
    startedAt: null,
    endsAt: null,
    updatedAt: facts.observedAt ?? null,

    recommendedAction: primary,
    riskLevel: facts.riskLevel ?? null,
    health: facts.health ?? null,
    priority: facts.machinePriority ?? (attention ? 10 : 0),
    reason:
      primary.type === 'REMOVE_LIQUIDITY'
        ? 'Liquidity position can be managed via Remove Liquidity.'
        : primary.type === 'NONE'
          ? primary.reasonDisabled
          : primary.type === 'MANAGE'
            ? 'Liquidity position is available to manage.'
            : null,

    actions,

    productRoute: facts.productRoute ?? PRODUCT_ROUTE_DEFAULT,
    openRoute: facts.openRoute ?? facts.productRoute ?? PRODUCT_ROUTE_DEFAULT,
    manageRoute: facts.manageRoute ?? facts.removeRoute ?? facts.productRoute ?? PRODUCT_ROUTE_DEFAULT,
    analyticsRoute: facts.analyticsRoute ?? null,

    producer: PRODUCER_ID,
    observedAt: facts.observedAt ?? null,
    blockNumber: facts.blockNumber ?? null,
    confidence: facts.confidence ?? null,
    dataState,
  }
}
