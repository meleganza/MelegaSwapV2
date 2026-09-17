import { describe, expect, it } from 'vitest'
import { IndexerDeadline } from '../indexerDeadline'
import {
  TIER1_JOBS_PER_INVOCATION,
  TIER2_JOBS_PER_INVOCATION,
  TIER3_COLD_SAMPLE_PER_INVOCATION,
  advanceRotationIndex,
  pickRotatingBatch,
  pickRotatingPair,
  runBoundedRotatingBatch,
  selectColdInventorySample,
} from '../tierScheduler'

function pairs(count: number) {
  return Array.from({ length: count }, (_, i) => ({ slug: `p${i}`, pairAddress: `0x${i}` }))
}

describe('TIER2 scheduler throughput', () => {
  it('keeps TIER1 batch at 6 and raises TIER2 jobs per invocation to 8', () => {
    expect(TIER1_JOBS_PER_INVOCATION).toBe(6)
    expect(TIER2_JOBS_PER_INVOCATION).toBe(8)
    expect(TIER3_COLD_SAMPLE_PER_INVOCATION).toBe(0)
  })

  it('plans up to 8 unique TIER2 pairs and never duplicates a slot in one batch', () => {
    const batch = pickRotatingBatch(pairs(128), 3, TIER2_JOBS_PER_INVOCATION)
    expect(batch).toHaveLength(8)
    expect(batch.map((row) => row.slug)).toEqual(['p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'])
    expect(new Set(batch.map((row) => row.pairAddress)).size).toBe(8)
  })

  it('wraps fairly without repeating when the universe is smaller than the batch cap', () => {
    const batch = pickRotatingBatch(pairs(5), 3, TIER2_JOBS_PER_INVOCATION)
    expect(batch.map((row) => row.slug)).toEqual(['p3', 'p4', 'p0', 'p1', 'p2'])
    expect(new Set(batch.map((row) => row.slug)).size).toBe(5)
  })

  it('processes 8 TIER2 pairs sequentially in one invocation with no overlapping concurrency', async () => {
    let inflight = 0
    let maxInflight = 0
    const seen: string[] = []
    const result = await runBoundedRotatingBatch({
      pairs: pairs(20),
      rotationIndex: 0,
      maxJobs: TIER2_JOBS_PER_INVOCATION,
      shouldStop: () => false,
      runJob: async (item) => {
        inflight += 1
        maxInflight = Math.max(maxInflight, inflight)
        seen.push(item.slug)
        inflight -= 1
      },
    })
    expect(result.jobsAttempted).toBe(8)
    expect(result.jobsCompleted).toBe(8)
    expect(result.batchStoppedByDeadline).toBe(false)
    expect(result.nextRotationIndex).toBe(8)
    expect(seen).toEqual(['p0', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'])
    expect(maxInflight).toBe(1)
  })

  it('stops before the deadline and resumes the next invocation at the next unprocessed pair', async () => {
    const deadline = new IndexerDeadline(Date.now(), 20_000)
    let completed = 0
    const first = await runBoundedRotatingBatch({
      pairs: pairs(128),
      rotationIndex: 5,
      maxJobs: TIER2_JOBS_PER_INVOCATION,
      shouldStop: () => completed >= 3 || deadline.shouldStop(),
      runJob: async () => {
        completed += 1
      },
    })
    expect(first.jobsCompleted).toBe(3)
    expect(first.jobsAttempted).toBe(3)
    expect(first.batchStoppedByDeadline).toBe(true)
    expect(first.nextRotationIndex).toBe(8)
    expect(first.processed.map((row) => row.slug)).toEqual(['p5', 'p6', 'p7'])

    const second = await runBoundedRotatingBatch({
      pairs: pairs(128),
      rotationIndex: first.nextRotationIndex,
      maxJobs: TIER2_JOBS_PER_INVOCATION,
      shouldStop: () => false,
      runJob: async () => undefined,
    })
    expect(second.processed[0]?.slug).toBe('p8')
    expect(second.jobsCompleted).toBe(8)
    expect(second.nextRotationIndex).toBe(16)
  })

  it('advances the rotation cursor modulo the ACTIVE set', () => {
    expect(advanceRotationIndex(120, 8, 128)).toBe(0)
    expect(advanceRotationIndex(125, 8, 128)).toBe(5)
    expect(pickRotatingPair(pairs(3), 4)).toEqual({ pair: { slug: 'p1', pairAddress: '0x1' }, nextIndex: 2 })
  })

  it('does not activate COLD sampling in this P0 and never retries a failed job', async () => {
    expect(selectColdInventorySample(pairs(40), 0)).toEqual([])
    await expect(
      runBoundedRotatingBatch({
        pairs: pairs(8),
        rotationIndex: 0,
        maxJobs: TIER2_JOBS_PER_INVOCATION,
        shouldStop: () => false,
        runJob: async (item) => {
          if (item.slug === 'p1') throw new Error('provider-fail-once')
        },
      }),
    ).rejects.toThrow('provider-fail-once')
  })
})
