import { head, put } from '@vercel/blob'
import type { TierSchedulerState } from '../types'

const SCHEDULER_KEY = 'melega-indexer/v2/tier-scheduler/state.json'

function defaultState(): TierSchedulerState {
  return {
    tier1RotationIndex: 0,
    tier2RotationIndex: 0,
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
