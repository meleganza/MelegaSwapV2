import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { REORG_SAFETY_BLOCKS } from '../constants'
import {
  confirmedTipAlreadyCovered,
  estimateMonthlyGetLogs,
  legacyHeadScanGetLogsPerRun,
  liveTipOverlapsConfirmedWindow,
  LEGACY_HEAD_SCAN_BLOCKS,
  LEGACY_HEAD_SCAN_TOPICS,
  planNearHeadLiveTip,
  STEADY_STATE_INDEXED_PAIRS,
  STEADY_STATE_RUNS_PER_MONTH,
} from '../indexer/liveTipScan'

describe('planNearHeadLiveTip', () => {
  const chainHead = 1_000_112
  const forwardHigh = chainHead - REORG_SAFETY_BLOCKS

  it('skips live scan while bootstrap is far from head', () => {
    const plan = planNearHeadLiveTip({
      chainHead,
      forwardHigh,
      gapFillCursor: forwardHigh - 5_000,
    })
    expect(plan.nearHead).toBe(false)
    expect(plan.scanFrom).toBeNull()
    expect(plan.reason).toBe('not-near-head')
  })

  it('scans only the reorg-unsafe zone when gap-fill already owns the confirmed tip', () => {
    const plan = planNearHeadLiveTip({
      chainHead,
      forwardHigh,
      gapFillCursor: forwardHigh - 80,
    })
    expect(plan.nearHead).toBe(true)
    expect(plan.reason).toBe('reorg-zone-only')
    expect(plan.scanFrom).toBe(forwardHigh + 1)
    expect(plan.scanTo).toBe(chainHead)
    expect(liveTipOverlapsConfirmedWindow(plan, forwardHigh, 999_000)).toBe(false)
  })

  it('does not mark confirmed coverage for the reorg zone', () => {
    const plan = planNearHeadLiveTip({
      chainHead,
      forwardHigh,
      gapFillCursor: forwardHigh,
    })
    expect(plan.scanFrom).toBe(forwardHigh + 1)
    expect(plan.scanTo).toBe(chainHead)
    expect(confirmedTipAlreadyCovered([{ fromBlock: 999_000, toBlock: forwardHigh }], 999_000, forwardHigh)).toBe(true)
  })
})

describe('head-scan cost model (7 pairs, 5-minute cron)', () => {
  it('quantifies legacy per-block per-topic amplification', () => {
    expect(legacyHeadScanGetLogsPerRun()).toBe(
      STEADY_STATE_INDEXED_PAIRS * LEGACY_HEAD_SCAN_BLOCKS * LEGACY_HEAD_SCAN_TOPICS,
    )
    expect(legacyHeadScanGetLogsPerRun()).toBe(504)
    expect(estimateMonthlyGetLogs(legacyHeadScanGetLogsPerRun())).toBe(504 * STEADY_STATE_RUNS_PER_MONTH)
  })
})

describe('source guards', () => {
  it('pairSyncEngine no longer calls the per-block head walker', () => {
    const src = readFileSync(path.join(__dirname, '../indexer/pairSyncEngine.ts'), 'utf8')
    expect(src).toContain('planNearHeadLiveTip')
    expect(src).not.toContain('scanPairEventsFromHead')
  })

  it('collapsed head scanner uses the OR topic filter, not a topic loop', () => {
    const src = readFileSync(path.join(__dirname, '../rpc/chunkedLogs.ts'), 'utf8')
    const fnStart = src.indexOf('export async function scanPairEventsFromHead')
    const fnEnd = src.indexOf('export async function scanSwapLogsFromHead')
    const body = src.slice(fnStart, fnEnd)
    expect(body).toContain('ammPairEventTopicsOrFilter()')
    expect(body).toContain('getLogsChunked')
    expect(body).not.toMatch(/for \(const topic of/)
  })
})
