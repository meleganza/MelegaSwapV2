import { describe, expect, it } from 'vitest'
import { MAX_BLOCKS_PER_SYNC } from '../constants'

describe('sync bounds', () => {
  it('limits block span per sync to avoid serverless timeout', () => {
    expect(MAX_BLOCKS_PER_SYNC).toBeGreaterThan(0)
    expect(MAX_BLOCKS_PER_SYNC).toBeLessThanOrEqual(100_000)
  })
})
