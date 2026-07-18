/**
 * Pure Farm → PortfolioPosition adapter (R791D.2E).
 *
 * Converts verified farm stake facts into one canonical PortfolioPosition.
 * No fetch, RPC, browser, React, Date.now, mutation, or random values.
 * Not connected to Command Center or Farms runtime.
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
  type PortfolioUnlockState,
} from '../contracts'

const PROTOCOL_ID = 'melega-v2'
const PRODUCER_ID = 'farm-runtime'
const SOURCE_ID = 'FARM_STAKE'
const SUBTITLE = 'Farm position'
const PRODUCT_ROUTE_DEFAULT = '/farms'

// ─── Adapter-boundary facts ─────────────────────────────────────────────────

export interface FarmTokenFacts {
  chainId: number | null
  address: string | null
  symbol: string | null
  name: string | null
  decimals: number | null
  logoURI: string | null
}

export interface FarmBalanceFacts {
  raw: string | null
  formatted: string | null
  decimals: number | null
}

export interface FarmApprovalFacts {
  id: string
  spender: string
  token: FarmTokenFacts
  allowance: string | null
  needsAttention: boolean
}

/**
 * Pure facts for one wallet-owned farm position.
 * Does not import Farms Studio runtime / SDK types.
 */
export interface FarmPositionFacts {
  wallet: string
  chainId: number
  chainName: string
  protocolId?: string
  protocolDisplayName?: string

  /** MasterChef / farm contract when known. */
  contractAddress: string | null
  /** Farm pid or other sub-position discriminator. */
  pid?: string | number | null
  sourceId?: string
  farmName?: string | null

  stakeToken: FarmTokenFacts | null
  rewardTokens: FarmTokenFacts[]
  underlyingAssets?: FarmTokenFacts[]

  stakedBalance: FarmBalanceFacts
  ownershipVerified: boolean
  stakedBalanceIsZero?: boolean

  pendingRewards?: FarmBalanceFacts | null
  hasClaimableRewards?: boolean

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
  isEnded?: boolean
  runtimeUnavailable?: boolean

  approvals?: FarmApprovalFacts[]
  approvalRequired?: boolean
  criticalWarning?: string | null
  ownershipDataBlocksManagement?: boolean

  icon?: string | null
  productRoute?: string | null
  openRoute?: string | null
  manageRoute?: string | null
  harvestRoute?: string | null
  withdrawRoute?: string | null
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

function mapToken(token: FarmTokenFacts): PortfolioTokenRef {
  return {
    chainId: token.chainId,
    address: normalizeAddress(token.address),
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals,
    logoURI: token.logoURI,
  }
}

function isPositiveBalance(balance: FarmBalanceFacts, explicitZero?: boolean): boolean {
  if (explicitZero === true) return false
  const raw = balance.raw
  if (raw != null && raw !== '') {
    try {
      if (/^-?\d+$/.test(raw.trim())) return BigInt(raw.trim()) > BigInt(0)
    } catch {
      // fall through
    }
  }
  const formatted = balance.formatted
  if (formatted != null && formatted !== '' && formatted !== '—') {
    const n = Number(formatted.replace(/,/g, ''))
    if (Number.isFinite(n)) return n > 0
  }
  return false
}

function shouldInclude(facts: FarmPositionFacts): boolean {
  if (facts.ownershipVerified === false) return false
  if (facts.stakedBalanceIsZero === true) return false
  return isPositiveBalance(facts.stakedBalance, facts.stakedBalanceIsZero)
}

function hasClaimable(facts: FarmPositionFacts): boolean {
  if (facts.hasClaimableRewards === true) return true
  if (facts.pendingRewards && isPositiveBalance(facts.pendingRewards)) return true
  if (facts.claimableValueUsd != null) {
    const n = Number(String(facts.claimableValueUsd).replace(/[^0-9.]/g, ''))
    if (Number.isFinite(n) && n > 0) return true
  }
  if (facts.pendingRewardsValueUsd != null) {
    const n = Number(String(facts.pendingRewardsValueUsd).replace(/[^0-9.]/g, ''))
    if (Number.isFinite(n) && n > 0) return true
  }
  return false
}

function resolveLifecycle(facts: FarmPositionFacts): PortfolioPositionLifecycle {
  if (facts.runtimeUnavailable === true) return 'UNAVAILABLE'
  if (facts.isPaused === true) return 'PAUSED'
  if (facts.isLocked === true || facts.unlockState === 'locked') return 'LOCKED'
  if (facts.isEnded === true) return 'ENDED'
  if (shouldInclude(facts)) return 'ACTIVE'
  return 'UNAVAILABLE'
}

function resolveUnlockState(facts: FarmPositionFacts): PortfolioUnlockState {
  if (facts.unlockState) return facts.unlockState
  if (facts.isLocked === true) return 'locked'
  if (facts.isLocked === false) return 'unlocked'
  return 'unknown'
}

function hasUsefulIncompleteOptionalFacts(facts: FarmPositionFacts): boolean {
  return (
    facts.currentValueUsd == null ||
    facts.apr == null ||
    facts.stakeToken == null ||
    facts.rewardTokens.length === 0 ||
    facts.pendingRewards == null
  )
}

function resolveDataState(facts: FarmPositionFacts): PortfolioDataState {
  if (facts.runtimeUnavailable === true) return 'UNAVAILABLE'
  if (!facts.ownershipVerified) return 'UNAVAILABLE'
  if (!facts.contractAddress && facts.pid == null && !facts.sourceId) return 'UNAVAILABLE'
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
  if (type === 'NONE') return createNonePortfolioAction(label)
  return {
    type,
    label,
    priority,
    route,
    enabled,
    reasonDisabled: enabled ? null : reasonDisabled,
  }
}

function resolveTitle(facts: FarmPositionFacts): string {
  const name = facts.farmName?.trim()
  if (name) return name
  const stakeSymbol = facts.stakeToken?.symbol?.trim()
  if (stakeSymbol) return `${stakeSymbol} Farm`
  const stakeName = facts.stakeToken?.name?.trim()
  if (stakeName) return `${stakeName} Farm`
  return 'Farm'
}

function buildActions(facts: FarmPositionFacts): {
  actions: PortfolioPositionActions
  primary: PortfolioPositionAction
} {
  const openRoute = facts.openRoute ?? facts.productRoute ?? PRODUCT_ROUTE_DEFAULT
  const manageRoute = facts.manageRoute ?? facts.productRoute ?? PRODUCT_ROUTE_DEFAULT
  const harvestRoute = facts.harvestRoute ?? manageRoute
  const withdrawRoute = facts.withdrawRoute ?? manageRoute
  const analyticsRoute = facts.analyticsRoute ?? null

  const open = action('OPEN', 'Open', 10, openRoute, Boolean(openRoute), openRoute ? null : 'Open route unavailable')
  const manage = action(
    'MANAGE',
    'Manage',
    20,
    manageRoute,
    Boolean(manageRoute) && facts.runtimeUnavailable !== true,
    facts.runtimeUnavailable ? 'Farm runtime unavailable' : manageRoute ? null : 'Manage route unavailable',
  )
  const analytics = analyticsRoute
    ? action('ANALYTICS', 'Analytics', 40, analyticsRoute, true, null)
    : action('ANALYTICS', 'Analytics', 40, null, false, 'Analytics route unavailable')
  const withdraw = action(
    'WITHDRAW',
    'Withdraw',
    15,
    withdrawRoute,
    Boolean(withdrawRoute) && facts.runtimeUnavailable !== true,
    facts.runtimeUnavailable ? 'Farm runtime unavailable' : withdrawRoute ? null : 'Withdraw route unavailable',
  )
  const harvest = action(
    'HARVEST',
    'Harvest',
    1,
    harvestRoute,
    Boolean(harvestRoute) && facts.runtimeUnavailable !== true,
    facts.runtimeUnavailable ? 'Farm runtime unavailable' : harvestRoute ? null : 'Harvest route unavailable',
  )

  const isUnavailable = facts.runtimeUnavailable === true
  const isEnded = facts.isEnded === true
  const claimable = hasClaimable(facts)

  let primary: PortfolioPositionAction

  if (isUnavailable) {
    primary = createNonePortfolioAction('Unavailable')
  } else if (isEnded) {
    primary = withdraw.enabled ? withdraw : createNonePortfolioAction('Ended')
  } else if (claimable && harvest.enabled) {
    primary = harvest
  } else if (manage.enabled) {
    primary = manage
  } else {
    primary = createNonePortfolioAction('No action available')
  }

  const secondary: PortfolioPositionAction[] = []
  if (withdraw.enabled && primary.type !== 'WITHDRAW') secondary.push(withdraw)
  if (analytics.enabled) secondary.push(analytics)
  if (open.enabled && primary.type !== 'OPEN') secondary.push(open)

  return {
    primary,
    actions: {
      primary,
      secondary,
      open: open.route || open.enabled ? open : null,
      manage: manage.route || manage.enabled ? manage : null,
      analytics: analytics.route || analytics.enabled ? analytics : null,
    },
  }
}

function buildBadges(facts: FarmPositionFacts): string[] {
  const badges: string[] = ['YOUR POSITION']
  if (facts.isLocked === true || facts.unlockState === 'locked') badges.push('LOCKED')
  if (facts.isEnded === true) badges.push('ENDED')
  if (resolveDataState(facts) === 'PARTIAL') badges.push('PARTIAL DATA')
  return badges
}

function buildTags(facts: FarmPositionFacts): string[] {
  const tags = ['FARM']
  const protocol = (facts.protocolId ?? PROTOCOL_ID).trim()
  if (protocol) tags.push(protocol.toUpperCase())
  const stake = facts.stakeToken?.symbol?.trim()
  if (stake) tags.push(stake)
  return tags
}

function requiresAttention(facts: FarmPositionFacts): boolean {
  if (facts.approvalRequired === true) return true
  if (facts.criticalWarning) return true
  if (facts.ownershipDataBlocksManagement === true) return true
  if (facts.runtimeUnavailable === true) return true
  if (hasClaimable(facts)) return true
  return false
}

function machineReason(primary: PortfolioPositionAction): string | null {
  if (primary.type === 'HARVEST') return 'Claimable farm rewards are available to harvest.'
  if (primary.type === 'WITHDRAW') return 'Farm position can be withdrawn.'
  if (primary.type === 'MANAGE') return 'Farm position is available to manage.'
  if (primary.type === 'NONE') return primary.reasonDisabled
  return null
}

// ─── Primary export ─────────────────────────────────────────────────────────

/**
 * Adapt verified Farm position facts into one canonical PortfolioPosition.
 * Returns null only when facts prove the wallet does not own the stake.
 */
export function adaptFarmPositionToPortfolioPosition(facts: FarmPositionFacts): PortfolioPosition | null {
  if (!shouldInclude(facts)) return null

  const wallet = normalizeWallet(facts.wallet)
  const protocolId = (facts.protocolId ?? PROTOCOL_ID).trim().toLowerCase()
  const sourceId = facts.sourceId ?? SOURCE_ID
  const contractAddress = normalizeAddress(facts.contractAddress)
  const contractOrSourceId = contractAddress ?? sourceId
  const subPositionId =
    facts.pid == null || facts.pid === '' ? null : String(facts.pid)

  const positionId = buildPortfolioPositionId({
    wallet,
    chainId: facts.chainId,
    positionType: 'FARM',
    protocolId,
    contractOrSourceId,
    subPositionId,
  })

  const lifecycle = resolveLifecycle(facts)
  const dataState = resolveDataState(facts)
  const { actions, primary } = buildActions(facts)
  const unlockState = resolveUnlockState(facts)
  const attention = requiresAttention(facts)
  const title = resolveTitle(facts)

  const underlying =
    facts.underlyingAssets && facts.underlyingAssets.length > 0
      ? facts.underlyingAssets.map((t) => ({
          token: mapToken(t),
          amount: null,
          valueUsd: null,
        }))
      : facts.stakeToken
        ? [
            {
              token: mapToken(facts.stakeToken),
              amount: {
                raw: facts.stakedBalance.raw,
                formatted: facts.stakedBalance.formatted,
                decimals: facts.stakedBalance.decimals,
              },
              valueUsd: null,
            },
          ]
        : []

  return {
    schema: PORTFOLIO_POSITION_SCHEMA,
    positionId,
    positionType: 'FARM',
    wallet,
    protocol: facts.protocolDisplayName?.trim() || protocolId,
    chain: {
      chainId: facts.chainId,
      name: facts.chainName,
    },
    contract: contractAddress,
    source: sourceId,

    title,
    subtitle: SUBTITLE,
    icon: facts.icon ?? null,
    badges: buildBadges(facts),
    tags: buildTags(facts),

    importance: 'NORMAL',
    requiresAttention: attention,

    underlyingAssets: underlying,
    lpToken: null,
    stakeToken: facts.stakeToken ? mapToken(facts.stakeToken) : null,
    rewardTokens: (facts.rewardTokens ?? []).map(mapToken),

    currentValueUsd: facts.currentValueUsd,
    principalValueUsd: facts.principalValueUsd ?? null,
    claimableValueUsd: facts.claimableValueUsd ?? null,
    pendingRewardsValueUsd: facts.pendingRewardsValueUsd ?? null,
    apr: facts.apr ?? null,
    apy: facts.apy ?? null,
    feesEarnedUsd: facts.feesEarnedUsd ?? null,

    balance: {
      raw: facts.stakedBalance.raw,
      formatted: facts.stakedBalance.formatted,
      decimals: facts.stakedBalance.decimals,
    },
    poolShare: null,
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
    reason: machineReason(primary),

    actions,

    productRoute: facts.productRoute ?? PRODUCT_ROUTE_DEFAULT,
    openRoute: facts.openRoute ?? facts.productRoute ?? PRODUCT_ROUTE_DEFAULT,
    manageRoute: facts.manageRoute ?? facts.productRoute ?? PRODUCT_ROUTE_DEFAULT,
    analyticsRoute: facts.analyticsRoute ?? null,

    producer: PRODUCER_ID,
    observedAt: facts.observedAt ?? null,
    blockNumber: facts.blockNumber ?? null,
    confidence: facts.confidence ?? null,
    dataState,
  }
}
