import { describe, expect, it } from 'vitest'
import { MAX_BLOCKS_PER_SYNC } from '../constants'
import { resolveProtocolActivityScanWindow } from '../indexer/protocolActivityBounds'

describe('protocolActivitySync bounds', () => {
  it('caps each scan to MAX_BLOCKS_PER_SYNC blocks', () => {
    const chainHead = 1_000_000
    const window = resolveProtocolActivityScanWindow({
      chainHead,
      storedCursor: null,
      recentBlocks: 10_000,
    })
    expect(window.toBlock - window.fromBlock + 1).toBeLessThanOrEqual(MAX_BLOCKS_PER_SYNC)
    expect(window.caughtUp).toBe(false)
  })

  it('resumes from stored cursor within the recent window', () => {
    const chainHead = 1_000_000
    const window = resolveProtocolActivityScanWindow({
      chainHead,
      storedCursor: 995_000,
      recentBlocks: 10_000,
    })
    expect(window.fromBlock).toBe(995_001)
    expect(window.toBlock).toBe(Math.min(chainHead, 995_001 + MAX_BLOCKS_PER_SYNC - 1))
  })

  it('reports caught up when cursor is at chain head', () => {
    const chainHead = 1_000_000
    const window = resolveProtocolActivityScanWindow({
      chainHead,
      storedCursor: chainHead,
      recentBlocks: 10_000,
    })
    expect(window.caughtUp).toBe(true)
  })
})
