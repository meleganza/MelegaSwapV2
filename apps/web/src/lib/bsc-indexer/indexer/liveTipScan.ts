import { REORG_SAFETY_BLOCKS } from '../constants'
import { findCoverageGaps, type CoverageRange } from './coverageRanges'

/** Same forward chunk used by pairSyncEngine gap-fill. */
export const FORWARD_CHUNK_BLOCKS = 200
/** Near-head when remaining confirmed gap is within two forward chunks. */
export const NEAR_HEAD_LOOKBACK_BLOCKS = FORWARD_CHUNK_BLOCKS * 2
/** Legacy per-block walk window (audit evidence). */
export const LEGACY_HEAD_SCAN_BLOCKS = 24
/** Swap + Mint + Burn — one eth_getLogs each on the legacy head walk. */
export const LEGACY_HEAD_SCAN_TOPICS = 3
/** Featured pair + six founder Tier-1 pairs per 5-minute orchestrator run. */
export const STEADY_STATE_INDEXED_PAIRS = 7
/** Every-5-minute cron × 24h × 30d. */
export const STEADY_STATE_RUNS_PER_MONTH = 8_640

export type LiveTipScanReason = 'not-near-head' | 'reorg-zone-only' | 'no-reorg-zone'

export interface LiveTipScanPlan {
  nearHead: boolean
  /** Inclusive chunked OR-filter range for the unconfirmed tip, or null when skipped. */
  scanFrom: number | null
  scanTo: number | null
  reason: LiveTipScanReason
}

export function isNearHead(gapFillCursor: number, forwardHigh: number): boolean {
  return gapFillCursor >= forwardHigh - NEAR_HEAD_LOOKBACK_BLOCKS
}

/**
 * Live tip plan: never re-scan the confirmed window that gap-fill already covers.
 * Only the reorg-unsafe zone (forwardHigh+1 … chainHead) is scanned, in one range.
 */
export function planNearHeadLiveTip(input: {
  chainHead: number
  forwardHigh: number
  gapFillCursor: number
}): LiveTipScanPlan {
  const nearHead = isNearHead(input.gapFillCursor, input.forwardHigh)
  if (!nearHead) {
    return { nearHead: false, scanFrom: null, scanTo: null, reason: 'not-near-head' }
  }
  const scanFrom = input.forwardHigh + 1
  const scanTo = input.chainHead
  if (scanFrom > scanTo) {
    return { nearHead: true, scanFrom: null, scanTo: null, reason: 'no-reorg-zone' }
  }
  return { nearHead: true, scanFrom, scanTo, reason: 'reorg-zone-only' }
}

export function liveTipOverlapsConfirmedWindow(
  plan: LiveTipScanPlan,
  forwardHigh: number,
  bootstrapFloor: number,
): boolean {
  if (plan.scanFrom === null || plan.scanTo === null) return false
  return plan.scanFrom <= forwardHigh && plan.scanTo >= bootstrapFloor
}

export function confirmedTipAlreadyCovered(
  coverageRanges: CoverageRange[],
  bootstrapFloor: number,
  forwardHigh: number,
): boolean {
  return findCoverageGaps(coverageRanges, bootstrapFloor, forwardHigh).length === 0
}

/** Legacy amplification: one eth_getLogs per block per topic per pair. */
export function legacyHeadScanGetLogsPerRun(pairs = STEADY_STATE_INDEXED_PAIRS): number {
  return pairs * LEGACY_HEAD_SCAN_BLOCKS * LEGACY_HEAD_SCAN_TOPICS
}

export function estimateMonthlyGetLogs(perRunCalls: number, runs = STEADY_STATE_RUNS_PER_MONTH): number {
  return perRunCalls * runs
}

export function reorgUnsafeFloor(chainHead: number, reorgSafety = REORG_SAFETY_BLOCKS): number {
  return Math.max(0, chainHead - reorgSafety)
}
