/**
 * Canonical wallet portfolio contracts for the Melega DEX.
 *
 * Schema authority:
 * - melega.wallet-portfolio.v1
 * - melega.portfolio-position.v1
 *
 * Invariants (R791D.2C):
 * 1. One wallet portfolio.
 * 2. One positions[] collection.
 * 3. One canonical position model.
 * 4. No product-specific arrays at root.
 * 5. Unknown economics use null (never fabricate zero).
 * 6. Zero requires explicit producer truth.
 * 7. Actions are structured objects.
 * 8. Lifecycle is canonical.
 * 9. Presentation metadata is consumer-ready.
 * 10. Section failures remain isolated.
 * 11. Identity is deterministic.
 * 12. No React dependency.
 * 13. No network dependency.
 * 14. No browser dependency.
 *
 * This module is contract-only. It must not fetch data, access browser globals,
 * use Date.now, or connect to Command Center / product runtimes.
 */

// ─── Schema identifiers ─────────────────────────────────────────────────────

export const WALLET_PORTFOLIO_SCHEMA = 'melega.wallet-portfolio.v1' as const
export const PORTFOLIO_POSITION_SCHEMA = 'melega.portfolio-position.v1' as const

export type WalletPortfolioSchemaId = typeof WALLET_PORTFOLIO_SCHEMA
export type PortfolioPositionSchemaId = typeof PORTFOLIO_POSITION_SCHEMA

// ─── Position types ─────────────────────────────────────────────────────────

/** Initial active + reserved future position types. Do not hardcode UI routes here. */
export type PortfolioPositionType =
  | 'LIQUIDITY'
  | 'FARM'
  | 'POOL'
  | 'VAULT'
  | 'LENDING'
  | 'BORROW'
  | 'PERPETUAL'
  | 'OPTIONS'
  | 'STRATEGY'
  | 'SMARTDROP'
  | 'AI_POSITION'
  | 'BRIDGE'

export const PORTFOLIO_POSITION_TYPES = [
  'LIQUIDITY',
  'FARM',
  'POOL',
  'VAULT',
  'LENDING',
  'BORROW',
  'PERPETUAL',
  'OPTIONS',
  'STRATEGY',
  'SMARTDROP',
  'AI_POSITION',
  'BRIDGE',
] as const satisfies readonly PortfolioPositionType[]

// ─── Canonical lifecycle ────────────────────────────────────────────────────

export type PortfolioPositionLifecycle =
  | 'ACTIVE'
  | 'ENDED'
  | 'FUTURE'
  | 'UNAVAILABLE'
  | 'PAUSED'
  | 'LOCKED'

export const PORTFOLIO_POSITION_LIFECYCLES = [
  'ACTIVE',
  'ENDED',
  'FUTURE',
  'UNAVAILABLE',
  'PAUSED',
  'LOCKED',
] as const satisfies readonly PortfolioPositionLifecycle[]

// ─── Importance / attention ─────────────────────────────────────────────────

export type PortfolioPositionImportance =
  | 'CRITICAL'
  | 'HIGH'
  | 'NORMAL'
  | 'LOW'
  | 'ARCHIVED'

export const PORTFOLIO_POSITION_IMPORTANCE = [
  'CRITICAL',
  'HIGH',
  'NORMAL',
  'LOW',
  'ARCHIVED',
] as const satisfies readonly PortfolioPositionImportance[]

// ─── Actions ────────────────────────────────────────────────────────────────

export type PortfolioActionType =
  | 'OPEN'
  | 'MANAGE'
  | 'ANALYTICS'
  | 'CLAIM'
  | 'HARVEST'
  | 'WITHDRAW'
  | 'REMOVE_LIQUIDITY'
  | 'ADD_LIQUIDITY'
  | 'STAKE'
  | 'UNSTAKE'
  | 'APPROVE'
  | 'NONE'

export const PORTFOLIO_ACTION_TYPES = [
  'OPEN',
  'MANAGE',
  'ANALYTICS',
  'CLAIM',
  'HARVEST',
  'WITHDRAW',
  'REMOVE_LIQUIDITY',
  'ADD_LIQUIDITY',
  'STAKE',
  'UNSTAKE',
  'APPROVE',
  'NONE',
] as const satisfies readonly PortfolioActionType[]

/**
 * Structured action belonging to a position (not to a page).
 * NONE must never be enabled. Disabled actions require an honest reason.
 */
export interface PortfolioPositionAction {
  type: PortfolioActionType
  label: string
  priority: number
  route: string | null
  enabled: boolean
  reasonDisabled: string | null
}

export interface PortfolioPositionActions {
  primary: PortfolioPositionAction
  secondary: PortfolioPositionAction[]
  open: PortfolioPositionAction | null
  manage: PortfolioPositionAction | null
  analytics: PortfolioPositionAction | null
}

// ─── Shared token / amount shapes ───────────────────────────────────────────

export interface PortfolioTokenRef {
  chainId: number | null
  address: string | null
  symbol: string | null
  name: string | null
  decimals: number | null
  logoURI: string | null
}

export interface PortfolioBalance {
  raw: string | null
  formatted: string | null
  decimals: number | null
}

export interface PortfolioUnderlyingAsset {
  token: PortfolioTokenRef
  amount: PortfolioBalance | null
  valueUsd: string | null
}

export type PortfolioUnlockState =
  | 'unlocked'
  | 'locked'
  | 'cooldown'
  | 'unknown'

export interface PortfolioPositionApproval {
  id: string
  spender: string
  token: PortfolioTokenRef
  allowance: string | null
  needsAttention: boolean
}

export type PortfolioDataState = 'READY' | 'PARTIAL' | 'UNAVAILABLE'

export type PortfolioRiskLevel = 'low' | 'medium' | 'high' | 'unknown' | null
export type PortfolioHealthLevel = 'healthy' | 'attention' | 'critical' | 'unknown' | null

// ─── Section status (preserves R791D.1A isolation) ──────────────────────────

export type PortfolioSectionStatusCode =
  | 'LOADING'
  | 'READY'
  | 'PARTIAL'
  | 'EMPTY'
  | 'UNAVAILABLE'
  | 'WALLET_NOT_CONNECTED'
  | 'UNSUPPORTED_NETWORK'

export interface PortfolioSectionStatus {
  status: PortfolioSectionStatusCode
  updatedAt: string | null
  errorCode: string | null
  message: string | null
}

export interface WalletPortfolioSectionStatus {
  summary: PortfolioSectionStatus
  positions: PortfolioSectionStatus
  claimables: PortfolioSectionStatus
  approvals: PortfolioSectionStatus
  activity: PortfolioSectionStatus
}

// ─── PortfolioPosition ──────────────────────────────────────────────────────

export interface PortfolioPositionChain {
  chainId: number
  name: string
}

export interface PortfolioPositionEconomics {
  currentValueUsd: string | null
  principalValueUsd: string | null
  claimableValueUsd: string | null
  pendingRewardsValueUsd: string | null
  apr: string | null
  apy: string | null
  feesEarnedUsd: string | null
}

export interface PortfolioPositionAssets {
  underlyingAssets: PortfolioUnderlyingAsset[]
  lpToken: PortfolioTokenRef | null
  stakeToken: PortfolioTokenRef | null
  rewardTokens: PortfolioTokenRef[]
}

export interface PortfolioPositionState {
  balance: PortfolioBalance | null
  poolShare: string | null
  ownershipVerified: boolean
  unlockState: PortfolioUnlockState
  approvals: PortfolioPositionApproval[]
}

export interface PortfolioPositionLifecycleBlock {
  status: PortfolioPositionLifecycle
  startedAt: string | null
  endsAt: string | null
  updatedAt: string | null
}

export interface PortfolioPositionMachine {
  recommendedAction: PortfolioPositionAction
  riskLevel: PortfolioRiskLevel
  health: PortfolioHealthLevel
  priority: number
  reason: string | null
}

export interface PortfolioPositionNavigation {
  productRoute: string | null
  openRoute: string | null
  manageRoute: string | null
  analyticsRoute: string | null
}

export interface PortfolioPositionProvenance {
  producer: string
  observedAt: string | null
  blockNumber: number | null
  confidence: number | null
  dataState: PortfolioDataState
}

export interface PortfolioPositionPresentation {
  title: string
  subtitle: string | null
  icon: string | null
  badges: string[]
  tags: string[]
}

/**
 * Canonical portfolio position — one model for all products and consumers.
 * Product affinity is expressed only via positionType / tags / provenance.
 */
export interface PortfolioPosition {
  schema: PortfolioPositionSchemaId

  // Identity
  positionId: string
  positionType: PortfolioPositionType
  wallet: string
  protocol: string
  chain: PortfolioPositionChain
  contract: string | null
  source: string

  // Presentation
  title: string
  subtitle: string | null
  icon: string | null
  badges: string[]
  tags: string[]

  // Importance
  importance: PortfolioPositionImportance
  requiresAttention: boolean

  // Assets
  underlyingAssets: PortfolioUnderlyingAsset[]
  lpToken: PortfolioTokenRef | null
  stakeToken: PortfolioTokenRef | null
  rewardTokens: PortfolioTokenRef[]

  // Economics — null = unknown; never replace unknown with zero
  currentValueUsd: string | null
  principalValueUsd: string | null
  claimableValueUsd: string | null
  pendingRewardsValueUsd: string | null
  apr: string | null
  apy: string | null
  feesEarnedUsd: string | null

  // Position
  balance: PortfolioBalance | null
  poolShare: string | null
  ownershipVerified: boolean
  unlockState: PortfolioUnlockState
  approvals: PortfolioPositionApproval[]

  // Lifecycle
  status: PortfolioPositionLifecycle
  startedAt: string | null
  endsAt: string | null
  updatedAt: string | null

  // Machine
  recommendedAction: PortfolioPositionAction
  riskLevel: PortfolioRiskLevel
  health: PortfolioHealthLevel
  priority: number
  reason: string | null

  // Actions (structured; not loose string arrays)
  actions: PortfolioPositionActions

  // Navigation
  productRoute: string | null
  openRoute: string | null
  manageRoute: string | null
  analyticsRoute: string | null

  // Provenance
  producer: string
  observedAt: string | null
  blockNumber: number | null
  confidence: number | null
  dataState: PortfolioDataState
}

// ─── WalletPortfolio root ───────────────────────────────────────────────────

export interface PortfolioSummary {
  netValueUsd: string | null
  claimableValueUsd: string | null
  activePositionCount: number
  historicalPositionCount: number
  attentionPositionCount: number
  pendingActionCount: number
}

export interface PortfolioClaimableItem {
  id: string
  positionId: string | null
  sourceType: PortfolioPositionType | null
  title: string
  amount: string | null
  valueUsd: string | null
  action: PortfolioPositionAction
}

export interface PortfolioApprovalItem {
  id: string
  positionId: string | null
  token: PortfolioTokenRef
  spender: string
  needsAttention: boolean
  action: PortfolioPositionAction
}

export interface PortfolioActivityItem {
  id: string
  kind: 'transaction' | 'claim' | 'add' | 'remove' | 'stake' | 'unstake' | 'other'
  label: string
  time: string
  positionId: string | null
  href: string | null
}

export interface PortfolioQuickAction {
  id: string
  label: string
  href: string
  frequencyRank: number
}

/**
 * Canonical wallet portfolio root.
 *
 * FORBIDDEN root fields (must never appear):
 * liquidityPositions, farmPositions, poolPositions, liquidity, farms, pools
 *
 * The only position collection is positions: PortfolioPosition[]
 */
export interface WalletPortfolio {
  schema: WalletPortfolioSchemaId
  wallet: string | null
  generatedAt: string
  summary: PortfolioSummary
  /** Sole position collection — no product-specific roots. */
  positions: PortfolioPosition[]
  claimables: PortfolioClaimableItem[]
  approvals: PortfolioApprovalItem[]
  recentActivity: PortfolioActivityItem[]
  quickActions: PortfolioQuickAction[]
  sectionStatus: WalletPortfolioSectionStatus
}

// ─── Identity helper ────────────────────────────────────────────────────────

export interface BuildPortfolioPositionIdInput {
  wallet: string
  chainId: number
  positionType: PortfolioPositionType
  protocolId: string
  /** Contract address or canonical source identifier when no contract exists. */
  contractOrSourceId: string
  /** Optional genuine sub-position discriminator (pid, sousId, tokenId, etc.). */
  subPositionId?: string | null
}

function normalizeIdentityPart(value: string): string {
  return value.trim().toLowerCase()
}

/**
 * Deterministic portfolio position identity.
 * Same economic position → same ID. Chain / type / sub-position isolate IDs.
 * Does not use array index, display title, symbol alone, random, timestamp, or UUID.
 */
export function buildPortfolioPositionId(input: BuildPortfolioPositionIdInput): string {
  const wallet = normalizeIdentityPart(input.wallet)
  const protocol = normalizeIdentityPart(input.protocolId)
  const contractOrSource = normalizeIdentityPart(input.contractOrSourceId)
  const type = input.positionType
  const chain = String(input.chainId)
  const sub =
    input.subPositionId == null || input.subPositionId === ''
      ? ''
      : normalizeIdentityPart(String(input.subPositionId))

  const parts = ['pp', chain, type, protocol, contractOrSource, wallet]
  if (sub) parts.push(sub)
  return parts.join(':')
}

// ─── Empty portfolio factory ────────────────────────────────────────────────

export interface CreateEmptyWalletPortfolioInput {
  wallet: string | null
  generatedAt: string
  sectionStatus?: Partial<WalletPortfolioSectionStatus>
}

function createSectionStatus(
  status: PortfolioSectionStatusCode,
  updatedAt: string | null = null,
): PortfolioSectionStatus {
  return {
    status,
    updatedAt,
    errorCode: null,
    message: null,
  }
}

function defaultSectionStatus(
  wallet: string | null,
  generatedAt: string,
): WalletPortfolioSectionStatus {
  const base: PortfolioSectionStatusCode =
    wallet == null || wallet === '' ? 'WALLET_NOT_CONNECTED' : 'EMPTY'
  return {
    summary: createSectionStatus(base, generatedAt),
    positions: createSectionStatus(base, generatedAt),
    claimables: createSectionStatus(base, generatedAt),
    approvals: createSectionStatus(base, generatedAt),
    activity: createSectionStatus(base, generatedAt),
  }
}

/**
 * Structural empty portfolio factory.
 * Does not fetch, does not use Date.now, does not mutate inputs.
 * generatedAt must be supplied explicitly by the caller.
 */
export function createEmptyWalletPortfolio(input: CreateEmptyWalletPortfolioInput): WalletPortfolio {
  const wallet =
    input.wallet == null || input.wallet === '' ? null : normalizeIdentityPart(input.wallet)

  const defaults = defaultSectionStatus(wallet, input.generatedAt)
  const override = input.sectionStatus ?? {}

  return {
    schema: WALLET_PORTFOLIO_SCHEMA,
    wallet,
    generatedAt: input.generatedAt,
    summary: {
      netValueUsd: null,
      claimableValueUsd: null,
      activePositionCount: 0,
      historicalPositionCount: 0,
      attentionPositionCount: 0,
      pendingActionCount: 0,
    },
    positions: [],
    claimables: [],
    approvals: [],
    recentActivity: [],
    quickActions: [],
    sectionStatus: {
      summary: override.summary ?? defaults.summary,
      positions: override.positions ?? defaults.positions,
      claimables: override.claimables ?? defaults.claimables,
      approvals: override.approvals ?? defaults.approvals,
      activity: override.activity ?? defaults.activity,
    },
  }
}

/** Helper for tests / adapters: a disabled NONE action (must never be enabled). */
export function createNonePortfolioAction(label = 'None'): PortfolioPositionAction {
  return {
    type: 'NONE',
    label,
    priority: Number.MAX_SAFE_INTEGER,
    route: null,
    enabled: false,
    reasonDisabled: 'No recommended action',
  }
}
