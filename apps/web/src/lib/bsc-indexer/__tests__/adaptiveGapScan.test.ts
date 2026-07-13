import { describe, expect, it } from 'vitest'
import { computeAdaptiveBlockSpan, ADAPTIVE_MAX_BLOCK_SPAN } from '../indexer/adaptiveGapScan'

describe('adaptiveGapScan', () => {
  it('scales span with remaining deadline', () => {
    const small = computeAdaptiveBlockSpan({
      remainingMs: 20_000,
      blocksRemaining: 500_000,
      currentChunkSize: 100,
    })
    const large = computeAdaptiveBlockSpan({
      remainingMs: 45_000,
      blocksRemaining: 500_000,
      currentChunkSize: 100,
      recentBlocksPerSecond: 8,
    })
    expect(large).toBeGreaterThan(small)
    expect(large).toBeLessThanOrEqual(ADAPTIVE_MAX_BLOCK_SPAN)
  })
})
