/**
 * Pure builder for Passport Liquidity Positions.
 * Combines manual wallet LP + Liquidity Building summaries; prevents double-counting.
 */
import { PROGRAM_STATUS_LABEL, type ProgramStatus } from 'views/LiquidityStudio/liquidityBuilding/programStatus'
import {
  LIQUIDITY_ADD_HREF,
  LIQUIDITY_BUILDING_HREF,
  LIQUIDITY_UNAVAILABLE,
  LIQUIDITY_VIEW_ALL_HREF,
  type PassportLiquidityPosition,
  type PassportLiquidityPositionsViewModel,
  type PassportLiquidityFreshness,
} from './passportLiquidityTypes'

export const DOUBLE_COUNT_POLICY =
  'When a Liquidity Building program and a wallet LP share the same pair address, Passport shows a single Liquidity Building summary row (program status). Distinct owner-controlled LP positions without an active LB program remain Manual rows.'

const MAX_VISIBLE = 3

export type ManualLpInput = {
  id: string
  pairLabel: string
  token0Symbol: string
  token1Symbol: string
  token0LogoUrl?: string | null
  token1LogoUrl?: string | null
  pairAddress?: string | null
  chainLabel?: string | null
  estimatedValueUsd?: string | null
  poolShare?: string | null
  feesEarnedUsd?: string | null
  freshness?: PassportLiquidityFreshness
}

export type LbProgramInput = {
  id: string
  pairLabel: string
  token0Symbol?: string | null
  token1Symbol?: string | null
  token0LogoUrl?: string | null
  token1LogoUrl?: string | null
  pairAddress?: string | null
  programAddress?: string | null
  status: ProgramStatus | string
  liquidityBuiltLabel?: string | null
  chainLabel?: string | null
  freshness?: PassportLiquidityFreshness
}

export type PassportLiquidityPositionsInput = {
  address?: string | null
  loading?: boolean
  manualPositions?: readonly ManualLpInput[] | null
  lbPrograms?: readonly LbProgramInput[] | null
  /** Test-only — never ship as production default. */
  fixturePositions?: readonly PassportLiquidityPosition[] | null
  forceDisconnected?: boolean
}

function splitPair(label: string): { a: string; b: string } {
  const parts = label.split(/\s*\/\s*/)
  return { a: parts[0]?.trim() || '—', b: parts[1]?.trim() || '—' }
}

function shortAddress(addr?: string | null): string | null {
  if (!addr || addr.length < 10) return null
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function statusTone(status: string): PassportLiquidityPosition['statusTone'] {
  const s = status.toLowerCase()
  if (s === 'active') return 'active'
  if (s === 'error' || s === 'paused for safety' || s === 'safety paused') return 'danger'
  if (
    s === 'ready' ||
    s === 'setup required' ||
    s === 'awaiting approval' ||
    s === 'awaiting deposit' ||
    s === 'pending'
  )
    return 'action'
  return 'neutral'
}

function lbStatusLabel(status: ProgramStatus | string): string {
  if (status in PROGRAM_STATUS_LABEL) {
    return PROGRAM_STATUS_LABEL[status as ProgramStatus]
  }
  return String(status)
}

function mapManual(row: ManualLpInput): PassportLiquidityPosition {
  const { a, b } = splitPair(row.pairLabel)
  const t0 = row.token0Symbol || a
  const t1 = row.token1Symbol || b
  const value =
    row.estimatedValueUsd != null && row.estimatedValueUsd !== ''
      ? row.estimatedValueUsd
      : LIQUIDITY_UNAVAILABLE
  const freshness: PassportLiquidityFreshness =
    row.freshness ?? (value === LIQUIDITY_UNAVAILABLE ? 'unavailable' : 'indexed')
  const share = row.poolShare != null && row.poolShare !== '' ? row.poolShare : LIQUIDITY_UNAVAILABLE
  const fees =
    row.feesEarnedUsd != null && row.feesEarnedUsd !== '' ? row.feesEarnedUsd : LIQUIDITY_UNAVAILABLE
  const pairAddr = row.pairAddress?.toLowerCase() || row.id.toLowerCase()
  const href = `${LIQUIDITY_VIEW_ALL_HREF}&position=${encodeURIComponent(row.id)}`
  const supporting =
    shortAddress(row.pairAddress) || row.chainLabel || 'Manual liquidity position'
  return {
    id: `manual-${row.id}`,
    type: 'Manual',
    pairLabel: `${t0} / ${t1}`,
    token0Symbol: t0,
    token1Symbol: t1,
    token0LogoUrl: row.token0LogoUrl ?? null,
    token1LogoUrl: row.token1LogoUrl ?? null,
    chainLabel: row.chainLabel || 'BSC',
    supportingLine: supporting,
    estimatedValue: value,
    estimatedValueState: freshness,
    sharePrimary: share,
    shareSecondary: null,
    feesOrProgressLabel: fees === LIQUIDITY_UNAVAILABLE ? 'Unavailable' : 'Fees',
    feesOrProgressKind: fees === LIQUIDITY_UNAVAILABLE ? 'unavailable' : 'fees',
    feesOrProgressValue: fees,
    status: 'Active',
    statusTone: 'active',
    actionLabel: 'Manage',
    actionHref: href,
    actionAriaLabel: `Manage ${t0} / ${t1} manual liquidity position`,
    destination: href,
    freshness,
    source: 'wallet-lp',
    dedupeKey: pairAddr,
  }
}

function mapLb(row: LbProgramInput): PassportLiquidityPosition | null {
  const statusKey = String(row.status)
  if (statusKey === 'NOT_ACTIVE' || statusKey === 'STOPPED') return null
  const label = lbStatusLabel(row.status)
  const { a, b } = splitPair(row.pairLabel || '— / —')
  const t0 = row.token0Symbol || a
  const t1 = row.token1Symbol || b
  const built =
    row.liquidityBuiltLabel != null && row.liquidityBuiltLabel !== ''
      ? row.liquidityBuiltLabel
      : LIQUIDITY_UNAVAILABLE
  const pairKey = (row.pairAddress || row.programAddress || row.id).toLowerCase()
  const href = row.programAddress
    ? `${LIQUIDITY_BUILDING_HREF}&program=${encodeURIComponent(row.programAddress)}`
    : LIQUIDITY_BUILDING_HREF
  const supporting =
    shortAddress(row.programAddress) || row.chainLabel || 'Liquidity Building program'
  const freshness: PassportLiquidityFreshness = row.freshness ?? 'indexed'
  return {
    id: `lb-${row.id}`,
    type: 'Liquidity Building',
    pairLabel: `${t0} / ${t1}`,
    token0Symbol: t0,
    token1Symbol: t1,
    token0LogoUrl: row.token0LogoUrl ?? null,
    token1LogoUrl: row.token1LogoUrl ?? null,
    chainLabel: row.chainLabel || 'BSC',
    supportingLine: supporting,
    estimatedValue: LIQUIDITY_UNAVAILABLE,
    estimatedValueState: 'unavailable',
    sharePrimary: LIQUIDITY_UNAVAILABLE,
    shareSecondary: null,
    feesOrProgressLabel: built === LIQUIDITY_UNAVAILABLE ? 'Unavailable' : 'Liquidity Built',
    feesOrProgressKind: built === LIQUIDITY_UNAVAILABLE ? 'unavailable' : 'liquidity_built',
    feesOrProgressValue: built,
    status: label,
    statusTone: statusTone(label),
    actionLabel: 'Manage',
    actionHref: href,
    actionAriaLabel: `Manage ${t0} / ${t1} Liquidity Building position`,
    destination: href,
    freshness,
    source: 'liquidity-building',
    dedupeKey: pairKey,
  }
}

/**
 * Prefer Liquidity Building summary when the same pair key appears as Manual LP.
 */
export function mergeLiquidityPositions(
  manuals: PassportLiquidityPosition[],
  lbs: PassportLiquidityPosition[],
): PassportLiquidityPosition[] {
  const lbKeys = new Set(lbs.map((p) => p.dedupeKey))
  const manualsKept = manuals.filter((m) => !lbKeys.has(m.dedupeKey))
  return [...manualsKept, ...lbs]
}

export function buildPassportLiquidityPositionsViewModel(
  input: PassportLiquidityPositionsInput = {},
): PassportLiquidityPositionsViewModel {
  const loading = Boolean(input.loading)
  const walletConnected = input.forceDisconnected ? false : Boolean(input.address)

  if (input.fixturePositions) {
    const positions = [...input.fixturePositions]
    const visiblePositions = positions.slice(0, MAX_VISIBLE)
    const connected = input.forceDisconnected
      ? false
      : input.address !== undefined && input.address !== null
        ? Boolean(input.address)
        : true
    return {
      loading,
      walletConnected: connected,
      positions,
      visiblePositions,
      totalCount: positions.length,
      hasMore: positions.length > MAX_VISIBLE,
      viewAllHref: LIQUIDITY_VIEW_ALL_HREF,
      viewAllLabel: positions.length ? 'View All' : 'Explore Liquidity',
      emptyAddHref: LIQUIDITY_ADD_HREF,
      emptyBuildingHref: LIQUIDITY_BUILDING_HREF,
      doubleCountPolicy: DOUBLE_COUNT_POLICY,
    }
  }

  if (!walletConnected) {
    return {
      loading,
      walletConnected: false,
      positions: [],
      visiblePositions: [],
      totalCount: 0,
      hasMore: false,
      viewAllHref: LIQUIDITY_VIEW_ALL_HREF,
      viewAllLabel: 'Explore Liquidity',
      emptyAddHref: LIQUIDITY_ADD_HREF,
      emptyBuildingHref: LIQUIDITY_BUILDING_HREF,
      doubleCountPolicy: DOUBLE_COUNT_POLICY,
    }
  }

  const manuals = (input.manualPositions ?? []).map(mapManual)
  const lbs = (input.lbPrograms ?? [])
    .map(mapLb)
    .filter((p): p is PassportLiquidityPosition => Boolean(p))
  const positions = mergeLiquidityPositions(manuals, lbs)
  const visiblePositions = positions.slice(0, MAX_VISIBLE)

  return {
    loading,
    walletConnected: true,
    positions,
    visiblePositions,
    totalCount: positions.length,
    hasMore: positions.length > MAX_VISIBLE,
    viewAllHref: LIQUIDITY_VIEW_ALL_HREF,
    viewAllLabel: positions.length ? 'View All' : 'Explore Liquidity',
    emptyAddHref: LIQUIDITY_ADD_HREF,
    emptyBuildingHref: LIQUIDITY_BUILDING_HREF,
    doubleCountPolicy: DOUBLE_COUNT_POLICY,
  }
}

/** Desktop module height from row count (0 → empty 232). */
export function passportLiquidityModuleHeightPx(visibleRowCount: number, empty: boolean): number {
  if (empty) return 232
  const n = Math.min(Math.max(visibleRowCount, 0), MAX_VISIBLE)
  return 64 + 48 + 68 * n + 16
}
