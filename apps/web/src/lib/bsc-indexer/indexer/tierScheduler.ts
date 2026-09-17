import { head, put } from '@vercel/blob'
import type { TierSchedulerState } from '../types'

const SCHEDULER_KEY = 'melega-indexer/v2/tier-scheduler/state.json'

/** Existing TIER1 founder/core batch — do not inflate HOT just to claim breadth. */
export const TIER1_JOBS_PER_INVOCATION = 6
/** Bounded ACTIVE refresh batch per cron invocation. */
export const TIER2_JOBS_PER_INVOCATION = 8
/**
 * P1 COLD→ACTIVE: tiny cursor sample per invocation. Never scan the full TIER3 set.
 * Two sequential jobs is the target; deadline-aware batching can stop at 0–1.
 */
export const TIER3_COLD_SAMPLE_PER_INVOCATION = 2

function defaultState(): TierSchedulerState {
  return {
    tier1RotationIndex: 0,
    tier2RotationIndex: 0,
    tier3RotationIndex: 0,
    promotedActiveAddresses: [],
    consecutiveFailures: 0,
  }
}

export async function loadTierSchedulerState(): Promise<TierSchedulerState> {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  if (!token) return defaultState()
  try {
    const meta = await head(SCHEDULER_KEY, { token })
    const res = await fetch(meta.url, { headers: { authorization: `Bearer ${token}` } })
    if (!res.ok) return defaultState()
    return { ...defaultState(), ...(await res.json()) }
  } catch {
    return defaultState()
  }
}

export async function saveTierSchedulerState(state: TierSchedulerState): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  if (!token) return
  await put(SCHEDULER_KEY, JSON.stringify(state), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    token,
  })
}

export function pickRotatingPair<T extends { slug: string }>(
  pairs: T[],
  index: number,
): { pair: T | null; nextIndex: number } {
  if (!pairs.length) return { pair: null, nextIndex: 0 }
  const pair = pairs[index % pairs.length] ?? null
  return { pair, nextIndex: (index + 1) % pairs.length }
}

export function advanceRotationIndex(current: number, completed: number, universeSize: number): number {
  if (universeSize <= 0) return 0
  return (((current + completed) % universeSize) + universeSize) % universeSize
}

/** Unique rotating window — never repeats a slot inside one batch. */
export function pickRotatingBatch<T>(pairs: T[], index: number, maxCount: number): T[] {
  if (!pairs.length || maxCount <= 0) return []
  const count = Math.min(maxCount, pairs.length)
  const start = ((index % pairs.length) + pairs.length) % pairs.length
  const picked: T[] = []
  const seen = new Set<number>()
  for (let i = 0; i < count; i += 1) {
    const slot = (start + i) % pairs.length
    if (seen.has(slot)) break
    seen.add(slot)
    const item = pairs[slot]
    if (item !== undefined) picked.push(item)
  }
  return picked
}

/** Sequential, deadline-aware batch. No fan-out, no retry. */
export async function runBoundedRotatingBatch<T>(args: {
  pairs: T[]
  rotationIndex: number
  maxJobs: number
  shouldStop: () => boolean
  runJob: (item: T) => Promise<void>
}): Promise<{
  processed: T[]
  jobsAttempted: number
  jobsCompleted: number
  batchStoppedByDeadline: boolean
  nextRotationIndex: number
}> {
  const planned = pickRotatingBatch(args.pairs, args.rotationIndex, args.maxJobs)
  const processed: T[] = []
  let jobsAttempted = 0
  let batchStoppedByDeadline = false

  for (const item of planned) {
    if (args.shouldStop()) {
      batchStoppedByDeadline = true
      break
    }
    jobsAttempted += 1
    await args.runJob(item)
    processed.push(item)
  }

  return {
    processed,
    jobsAttempted,
    jobsCompleted: processed.length,
    batchStoppedByDeadline,
    nextRotationIndex: advanceRotationIndex(args.rotationIndex, processed.length, args.pairs.length),
  }
}

/** Cursor window over already-known COLD inventory. Bounded by TIER3_COLD_SAMPLE_PER_INVOCATION. */
export function selectColdInventorySample<T>(
  cold: T[],
  rotationIndex: number,
  limit = TIER3_COLD_SAMPLE_PER_INVOCATION,
): T[] {
  if (limit <= 0 || !cold.length) return []
  return pickRotatingBatch(cold, rotationIndex, limit)
}
