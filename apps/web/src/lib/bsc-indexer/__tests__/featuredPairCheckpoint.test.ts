import { describe, expect, it } from 'vitest'
import { INDEXER_SCHEMA_VERSION } from '../constants'
import type { IndexerCheckpoint } from '../types'

function isV2Checkpoint(cp: IndexerCheckpoint | null): boolean {
  return Boolean(cp && cp.schemaVersion === INDEXER_SCHEMA_VERSION)
}

describe('v2 checkpoint namespace', () => {
  it('ignores legacy checkpoints without schemaVersion 2', () => {
    const legacy: IndexerCheckpoint = {
      chainId: 56,
      lastIndexedBlock: 26_001_999,
      chainHeadAtSync: 109_000_000,
      reorgSafetyBlocks: 12,
      lastSuccessfulSync: '2026-07-10T21:30:38.306Z',
      chunkSize: 1,
      cursorPairIndex: 0,
    }
    expect(isV2Checkpoint(legacy)).toBe(false)
  })

  it('accepts v2 featured-pair checkpoints', () => {
    const v2: IndexerCheckpoint = {
      schemaVersion: INDEXER_SCHEMA_VERSION,
      phase: 'bootstrap',
      featuredPairSlug: 'marco-wbnb',
      bootstrapStartBlock: 108_500_000,
      bootstrapDays: 7,
      chainId: 56,
      lastIndexedBlock: 108_500_000,
      chainHeadAtSync: 109_000_000,
      reorgSafetyBlocks: 12,
      lastSuccessfulSync: new Date().toISOString(),
      chunkSize: 1,
      cursorPairIndex: 0,
    }
    expect(isV2Checkpoint(v2)).toBe(true)
  })
})
