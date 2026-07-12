import {
  FEATURED_PAIR_SLUG,
  INDEXER_SCHEMA_VERSION,
  MARCO_WBNB_PAIR_BSC,
  MAX_EVENTS_PER_SYNC,
  VERIFIED_R772_SWAP_BLOCK,
} from '../constants'
import { CHECKPOINT_RESET_REASON_R772, createFreshFeaturedPairCheckpoint } from '../checkpointReset'
import { assertIndexerEventTopicsValid } from '../eventTopicIntegrity'
import { resolveIndexerStorage } from '../storage'
import type { IndexerCheckpoint, IndexerHealthSnapshot } from '../types'
import { getProviderHealthSnapshot, getBlockNumber, normalizeSwapLog, scanBlockRangeEvents } from '../rpc/chunkedLogs'
import { runPairSyncEngine } from './pairSyncEngine'
import type { IndexerDeadline } from './indexerDeadline'
import { bootstrapWindowSummary } from './coverageRanges'

export interface SyncResult {
  addedEvents: number
  addedCandles: number
  checkpoint: IndexerCheckpoint
  health: IndexerHealthSnapshot
  forwardRangesProcessed: number
  gapRangesProcessed: number
  partialProgress: boolean
  coverageSummary?: ReturnType<typeof bootstrapWindowSummary>
}

export interface PairWatch {
  pairAddress: string
  token0: string
  token1: string
}

const DEFAULT_WATCH: PairWatch = {
  pairAddress: MARCO_WBNB_PAIR_BSC.toLowerCase(),
  token0: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
  token1: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
}

function isV2Checkpoint(cp: IndexerCheckpoint | null): cp is IndexerCheckpoint {
  return Boolean(cp && cp.schemaVersion === INDEXER_SCHEMA_VERSION)
}

/** R773/R786/R787 — MARCO/WBNB featured pair with anchor seed + deadline-budgeted engine. */
export async function runFeaturedPairSync(
  deadline?: IndexerDeadline,
  pair: PairWatch = DEFAULT_WATCH,
): Promise<SyncResult> {
  assertIndexerEventTopicsValid()
  const storage = resolveIndexerStorage()
  const eventCountsPreflight = await storage.countEvents()
  const hasEvents = Object.values(eventCountsPreflight).some((n) => n > 0)
  const chainHead = await getBlockNumber()
  let existing = await storage.loadCheckpoint()
  if (!isV2Checkpoint(existing)) existing = null

  let checkpoint =
    existing ?? (await createFreshFeaturedPairCheckpoint(chainHead, 'INITIAL_V2_BOOTSTRAP'))

  if (
    isV2Checkpoint(checkpoint) &&
    !checkpoint.resetReason &&
    !hasEvents &&
    checkpoint.lastFailureReason
  ) {
    checkpoint = await createFreshFeaturedPairCheckpoint(
      checkpoint.chainHeadAtSync || checkpoint.lastIndexedBlock,
      CHECKPOINT_RESET_REASON_R772,
    )
    await storage.saveCheckpoint(checkpoint)
  }

  if (
    isV2Checkpoint(checkpoint) &&
    checkpoint.resetReason === CHECKPOINT_RESET_REASON_R772 &&
    !checkpoint.anchorSeeded &&
    !hasEvents
  ) {
    const anchor = await scanBlockRangeEvents({
      address: pair.pairAddress,
      fromBlock: VERIFIED_R772_SWAP_BLOCK,
      toBlock: VERIFIED_R772_SWAP_BLOCK,
    })
    const anchorEvent = anchor.logs[0]
    if (anchorEvent) {
      const normalized = normalizeSwapLog(anchorEvent, pair)
      normalized.blockTimestamp = anchor.blockTimestamps.get(normalized.blockNumber) ?? 0
      await storage.appendEvents([normalized])
      checkpoint = { ...checkpoint, anchorSeeded: true }
      await storage.saveCheckpoint(checkpoint)
    }
  }

  const result = await runPairSyncEngine({
    pair,
    slug: FEATURED_PAIR_SLUG,
    bootstrapDays: 7,
    existingCheckpoint: checkpoint,
    deadline,
  })

  return {
    addedEvents: result.addedEvents,
    addedCandles: result.addedCandles,
    checkpoint: result.checkpoint,
    forwardRangesProcessed: result.forwardRangesProcessed,
    gapRangesProcessed: result.gapRangesProcessed,
    partialProgress: result.partialProgress,
    coverageSummary: result.coverageSummary,
    health: {
      ...result.health,
      providerHealth: getProviderHealthSnapshot(),
    },
  }
}
