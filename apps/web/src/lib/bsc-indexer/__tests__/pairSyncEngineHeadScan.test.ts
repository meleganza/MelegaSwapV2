import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  BURN_TOPIC,
  INDEXER_SCHEMA_VERSION,
  MELEGA_CHAIN_ID,
  MINT_TOPIC,
  REORG_SAFETY_BLOCKS,
  SWAP_TOPIC,
} from '../constants'
import { ammPairEventTopicsOrFilter } from '../eventTopics'
import type { IndexerCheckpoint } from '../types'
import type { RawLog } from '../rpc/chunkedLogs'
import { getTestIndexerStorage, resetTestIndexerStorages } from './memoryIndexerStorage'
import {
  estimateMonthlyGetLogs,
  legacyHeadScanGetLogsPerRun,
  STEADY_STATE_INDEXED_PAIRS,
} from '../indexer/liveTipScan'

const getLogsCalls: Array<{ fromBlock: number; toBlock: number; address: string }> = []

vi.mock('../storage', async () => {
  const { getTestIndexerStorage } = await import('./memoryIndexerStorage')
  return {
    resolveIndexerStorageForSlug: (slug: string) => getTestIndexerStorage(slug),
  }
})

vi.mock('../rpc/chunkedLogs', async () => {
  const actual = await vi.importActual<typeof import('../rpc/chunkedLogs')>('../rpc/chunkedLogs')
  return {
    ...actual,
    getBlockNumber: vi.fn(),
    getBlockTimestamp: vi.fn(async (block: number) => 1_700_000_000 + block),
    getLogsChunked: vi.fn(),
  }
})

import { getBlockNumber, getLogsChunked } from '../rpc/chunkedLogs'
import { runPairSyncEngine } from '../indexer/pairSyncEngine'

const PAIR = '0x7286c16c3c05d4c17b689be7948ec4fa4e861d1e'
const TOKEN0 = '0x963556de0eb8138e97a85f0a86ee0acd159d210b'
const TOKEN1 = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const CHAIN_HEAD = 1_000_112
const FORWARD_HIGH = CHAIN_HEAD - REORG_SAFETY_BLOCKS
const BOOTSTRAP_FLOOR = 999_000
const PRIOR_TIP = 1_000_000

function hexQty(n: number): string {
  return `0x${n.toString(16)}`
}

function rawLog(topic: string, block: number, suffix: string, logIndex: number): RawLog {
  return {
    address: PAIR,
    topics: [
      topic,
      `0x${'0'.repeat(24)}${'11'.repeat(20)}`,
      `0x${'0'.repeat(24)}${'22'.repeat(20)}`,
    ],
    data: `0x${'0'.repeat(256)}`,
    blockNumber: hexQty(block),
    transactionHash: `0x${suffix}${'ab'.repeat(16)}`.slice(0, 66),
    logIndex: hexQty(logIndex),
  }
}

const FIXTURE_LOGS: RawLog[] = [
  rawLog(SWAP_TOPIC, 1_000_050, 'aa', 1),
  rawLog(MINT_TOPIC, 1_000_090, 'bb', 2),
  rawLog(BURN_TOPIC, 1_000_108, 'cc', 3),
]

function incrementalCheckpoint(slug: string): IndexerCheckpoint {
  return {
    schemaVersion: INDEXER_SCHEMA_VERSION,
    chainId: MELEGA_CHAIN_ID,
    lastIndexedBlock: PRIOR_TIP,
    chainHeadAtSync: PRIOR_TIP + REORG_SAFETY_BLOCKS,
    reorgSafetyBlocks: REORG_SAFETY_BLOCKS,
    lastSuccessfulSync: '2026-09-01T00:00:00.000Z',
    chunkSize: 200,
    cursorPairIndex: 0,
    phase: 'incremental',
    featuredPairSlug: slug,
    bootstrapStartBlock: BOOTSTRAP_FLOOR,
    bootstrapDays: 7,
    gapFillCursor: PRIOR_TIP,
    forwardCursor: PRIOR_TIP,
    coverageRanges: [{ fromBlock: BOOTSTRAP_FLOOR, toBlock: PRIOR_TIP }],
  }
}

beforeEach(() => {
  resetTestIndexerStorages()
  getLogsCalls.length = 0
  vi.mocked(getBlockNumber).mockResolvedValue(CHAIN_HEAD)
  vi.mocked(getLogsChunked).mockImplementation(async (params) => {
    getLogsCalls.push({
      fromBlock: params.fromBlock,
      toBlock: params.toBlock,
      address: params.address,
    })
    expect(params.topics).toEqual(ammPairEventTopicsOrFilter())
    const logs = FIXTURE_LOGS.filter((log) => {
      const block = parseInt(log.blockNumber, 16)
      return block >= params.fromBlock && block <= params.toBlock
    })
    return { logs, finalChunkSize: params.initialChunk ?? 200 }
  })
})

describe('runPairSyncEngine head-scan collapse', () => {
  it('indexes Swap/Mint/Burn without scanning the same head range twice', async () => {
    const slug = 'marco-wbnb'
    const storage = getTestIndexerStorage(slug)
    await storage.saveCheckpoint(incrementalCheckpoint(slug))

    const result = await runPairSyncEngine({
      pair: { pairAddress: PAIR, token0: TOKEN0, token1: TOKEN1 },
      slug,
      existingCheckpoint: incrementalCheckpoint(slug),
      adaptiveGapFill: true,
    })

    const events = await storage.listEvents({ limit: 50 })
    const types = events.map((e) => e.eventType).sort()
    expect(types).toEqual(['Burn', 'Mint', 'Swap'])
    expect(events.map((e) => e.blockNumber).sort((a, b) => a - b)).toEqual([1_000_050, 1_000_090, 1_000_108])

    expect(result.checkpoint.reorgSafetyBlocks).toBe(REORG_SAFETY_BLOCKS)
    expect(result.checkpoint.lastIndexedBlock).toBe(FORWARD_HIGH)
    expect(result.checkpoint.gapFillCursor).toBe(FORWARD_HIGH)
    const coveredTo = Math.max(...(result.checkpoint.coverageRanges ?? []).map((r) => r.toBlock))
    expect(coveredTo).toBe(FORWARD_HIGH)
    expect(coveredTo).toBeLessThan(CHAIN_HEAD)

    const overlaps = getLogsCalls.some((a, i) =>
      getLogsCalls.some(
        (b, j) => i < j && a.address === b.address && a.fromBlock <= b.toBlock && b.fromBlock <= a.toBlock,
      ),
    )
    expect(overlaps).toBe(false)
    expect(getLogsCalls.some((c) => c.fromBlock <= FORWARD_HIGH && c.toBlock > FORWARD_HIGH)).toBe(false)
  })

  it('quantifies a large eth_getLogs reduction for 7 pairs in a 5-minute steady-state run', async () => {
    const slugs = Array.from({ length: STEADY_STATE_INDEXED_PAIRS }, (_, i) => `pair-${i}`)
    for (const [index, slug] of slugs.entries()) {
      const storage = getTestIndexerStorage(slug)
      await storage.saveCheckpoint(incrementalCheckpoint(slug))
      await runPairSyncEngine({
        pair: { pairAddress: PAIR, token0: TOKEN0, token1: TOKEN1 },
        slug,
        existingCheckpoint: incrementalCheckpoint(slug),
        adaptiveGapFill: index === 0,
        maxGapRangesPerRun: 4,
      })
    }

    const after = getLogsCalls.length
    const before = legacyHeadScanGetLogsPerRun()
    expect(before).toBe(504)
    expect(after).toBeLessThanOrEqual(STEADY_STATE_INDEXED_PAIRS * 2)
    expect(after).toBeGreaterThanOrEqual(STEADY_STATE_INDEXED_PAIRS)
    expect(after).toBeLessThan(before / 10)

    const monthlyBefore = estimateMonthlyGetLogs(before)
    const monthlyAfter = estimateMonthlyGetLogs(after)
    expect(monthlyBefore - monthlyAfter).toBe((before - after) * 8_640)
    expect(monthlyBefore - monthlyAfter).toBeGreaterThan(4_000_000)
  })

  it('keeps checkpoints identical across a second deterministic pass (no event loss/dupes)', async () => {
    const slug = 'replay'
    const storage = getTestIndexerStorage(slug)
    const first = await runPairSyncEngine({
      pair: { pairAddress: PAIR, token0: TOKEN0, token1: TOKEN1 },
      slug,
      existingCheckpoint: incrementalCheckpoint(slug),
    })
    const firstEvents = await storage.listEvents({ limit: 50 })
    const second = await runPairSyncEngine({
      pair: { pairAddress: PAIR, token0: TOKEN0, token1: TOKEN1 },
      slug,
      existingCheckpoint: first.checkpoint,
    })
    const secondEvents = await storage.listEvents({ limit: 50 })
    expect(second.addedEvents).toBe(0)
    expect(secondEvents).toHaveLength(firstEvents.length)
    expect(second.checkpoint.lastIndexedBlock).toBe(first.checkpoint.lastIndexedBlock)
    expect(second.checkpoint.coverageRanges).toEqual(first.checkpoint.coverageRanges)
  })
})
