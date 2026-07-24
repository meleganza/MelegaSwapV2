/**
 * PASSPORT_MODULE_005 — Liquidity Positions view-model contracts.
 * Summarizes factual manual LP + Liquidity Building; never invents valuations.
 */

export const LIQUIDITY_VIEW_ALL_HREF = '/liquidity-studio?view=positions'
export const LIQUIDITY_ADD_HREF = '/liquidity-studio?view=add'
export const LIQUIDITY_BUILDING_HREF = '/liquidity-studio?view=building'
export const LIQUIDITY_UNAVAILABLE = '—' as const

export const PASSPORT_LIQUIDITY_TYPES = ['Manual', 'Liquidity Building'] as const
export type PassportLiquidityType = (typeof PASSPORT_LIQUIDITY_TYPES)[number]

export const PASSPORT_MANUAL_STATUSES = ['Active', 'Closed', 'Pending', 'Unavailable'] as const
export type PassportManualStatus = (typeof PASSPORT_MANUAL_STATUSES)[number]

/** Canonical LB program statuses (labels from Liquidity Building PROGRAM_STATUS_LABEL). */
export const PASSPORT_LB_STATUSES = [
  'Setup Required',
  'Awaiting Approval',
  'Awaiting Deposit',
  'Ready',
  'Active',
  'Paused',
  'Paused for safety',
  'Budget Depleted',
  'Stopped',
  'Error',
] as const
export type PassportLbStatus = (typeof PASSPORT_LB_STATUSES)[number]

export type PassportLiquidityStatus = PassportManualStatus | PassportLbStatus | string

export type PassportLiquidityFreshness =
  | 'indexed'
  | 'partial'
  | 'unavailable'
  | 'stale'

export type PassportFeesOrProgressKind = 'fees' | 'liquidity_built' | 'unavailable' | 'none'

export type PassportLiquidityPosition = {
  id: string
  type: PassportLiquidityType
  pairLabel: string
  token0Symbol: string
  token1Symbol: string
  token0LogoUrl: string | null
  token1LogoUrl: string | null
  chainLabel: string
  supportingLine: string
  estimatedValue: string
  estimatedValueState: PassportLiquidityFreshness
  sharePrimary: string
  shareSecondary: string | null
  feesOrProgressLabel: string
  feesOrProgressKind: PassportFeesOrProgressKind
  feesOrProgressValue: string
  status: PassportLiquidityStatus
  statusTone: 'active' | 'action' | 'neutral' | 'danger'
  actionLabel: 'Manage'
  actionHref: string
  actionAriaLabel: string
  destination: string
  freshness: PassportLiquidityFreshness
  source: 'wallet-lp' | 'liquidity-building' | 'fixture'
  /** Pair/program key used for double-count prevention. */
  dedupeKey: string
}

export type PassportLiquidityPositionsViewModel = {
  loading: boolean
  walletConnected: boolean
  positions: PassportLiquidityPosition[]
  /** Positions shown in module (max 3). */
  visiblePositions: PassportLiquidityPosition[]
  totalCount: number
  hasMore: boolean
  viewAllHref: string
  viewAllLabel: string
  emptyAddHref: string
  emptyBuildingHref: string
  doubleCountPolicy: string
}

declare global {
  interface Window {
    __PASSPORT_MODULE_005_FIXTURE__?: {
      walletConnected?: boolean
      positions?: PassportLiquidityPosition[]
    }
  }
}
