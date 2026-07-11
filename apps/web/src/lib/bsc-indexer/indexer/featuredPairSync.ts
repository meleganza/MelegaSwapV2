import {
  BOOTSTRAP_DAYS_FALLBACK,
  BOOTSTRAP_DAYS_PRIMARY,
  BOOTSTRAP_MAX_BLOCKS_PER_SYNC,
  DEFAULT_CHUNK_SIZE,
  FEATURED_PAIR_SLUG,
  INDEXER_SCHEMA_VERSION,
  MARCO_WBNB_PAIR_BSC,
  MAX_BLOCKS_PER_SYNC,
  MAX_EVENTS_PER_SYNC,
  MELEGA_CHAIN_ID,
  MIN_CHUNK_SIZE,
  RECENT_BOOTSTRAP_BLOCKS,
  REORG_SAFETY_BLOCKS,
} from '../constants'
import { resolveIndexerStorage } from '../storage'
import type { IndexerCheckpoint, IndexerHealthSnapshot, NormalizedIndexerEvent } from '../types'
import {
  AMM_TOPICS,
  getBlockNumber,
  normalizeMintBurnLog,
  normalizeSwapLog,
  type RawLog,
} from '../rpc/chunkedLogs'
import { estimateBootstrapStartBlock, scanBlockRangeEvents } from '../rpc/scanBlockRange'
import { LEGACY_INDEXER_NOTE } from '../v2/paths'
import { buildCandlesFromSwaps } from './candles'

export interface SyncResult {
  addedEvents: number
  checkpoint: IndexerCheckpoint
  health: IndexerHealthSnapshot
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

function normalizeLogs(
  logs: RawLog[],
  pair: PairWatch,
  tsMap: Map<number, number>,
  cap: number,
  out: NormalizedIndexerEvent[],
) {
  for (const log of logs) {
    if (out.length >= cap) break
    const topic = log.topics[0]?.toLowerCase()
    let event: NormalizedIndexerEvent | undefined
    if (topic === AMM_TOPICS.swap.toLowerCase()) event = normalizeSwapLog(log, pair)
    else if (topic === AMM_TOPICS.mint.toLowerCase()) event = normalizeMintBurnLog(log, 'Mint', pair)
    else if (topic === AMM_TOPICS.burn.toLowerCase()) event = normalizeMintBurnLog(log, 'Burn', pair)
    if (!event) continue
    event.blockTimestamp = tsMap.get(event.blockNumber) ?? 0
    out.push(event)
  }
}

async function createBootstrapCheckpoint(chainHead: number): Promise<IndexerCheckpoint> {
  let bootstrapDays = BOOTSTRAP_DAYS_PRIMARY
  let { bootstrapStartBlock } = await estimateBootstrapStartBlock(bootstrapDays)
  if (chainHead - bootstrapStartBlock > 500_000) {
    bootstrapDays = BOOTSTRAP_DAYS_FALLBACK
    ;({ bootstrapStartBlock } = await estimateBootstrapStartBlock(bootstrapDays))
  }
  return {
    schemaVersion: INDEXER_SCHEMA_VERSION,
    phase: 'bootstrap',
    featuredPairSlug: FEATURED_PAIR_SLUG,
    bootstrapStartBlock,
    bootstrapDays,
    chainId: MELEGA_CHAIN_ID,
    lastIndexedBlock: bootstrapStartBlock - 1,
    chainHeadAtSync: chainHead,
    reorgSafetyBlocks: REORG_SAFETY_BLOCKS,
    lastSuccessfulSync: new Date(0).toISOString(),
    chunkSize: DEFAULT_CHUNK_SIZE,
    cursorPairIndex: 0,
    legacyNote: LEGACY_INDEXER_NOTE,
  }
}

/** R771 — MARCO/WBNB featured-pair incremental indexer (v2 namespace). */
export async function runFeaturedPairSync(pair: PairWatch = DEFAULT_WATCH): Promise<SyncResult> {
  const storage = resolveIndexerStorage()
  const chainHead = await getBlockNumber()
  let existing = await storage.loadCheckpoint()
  if (!isV2Checkpoint(existing)) existing = null

  const eventCountsPreflight = await storage.countEvents()
  const hasEvents = Object.values(eventCountsPreflight).some((n) => n > 0)
  const checkpoint = existing ?? (await createBootstrapCheckpoint(chainHead))

  let fromBlock = 0
  let toBlock = checkpoint.lastIndexedBlock
  let providerUsed = checkpoint.providerUsed ?? 'unknown'
  const normalized: NormalizedIndexerEvent[] = []

  try {
    if (!hasEvents && checkpoint.phase === 'bootstrap') {
      const recentFrom = Math.max(
        checkpoint.bootstrapStartBlock ?? 0,
        chainHead - RECENT_BOOTSTRAP_BLOCKS,
      )
      const recent = await scanBlockRangeEvents({
        address: pair.pairAddress,
        fromBlock: recentFrom,
        toBlock: chainHead,
      })
      providerUsed = recent.providerUsed
      normalizeLogs(recent.logs, pair, recent.blockTimestamps, MAX_EVENTS_PER_SYNC, normalized)
    }

    const bootstrapStart = checkpoint.bootstrapStartBlock ?? 0
    fromBlock = Math.max(bootstrapStart, checkpoint.lastIndexedBlock - REORG_SAFETY_BLOCKS + 1)
    const blockBudget =
      checkpoint.phase === 'bootstrap' ? BOOTSTRAP_MAX_BLOCKS_PER_SYNC : MAX_BLOCKS_PER_SYNC
    toBlock = Math.min(chainHead, fromBlock + blockBudget - 1)

    if (fromBlock <= toBlock && normalized.length < MAX_EVENTS_PER_SYNC) {
      const forward = await scanBlockRangeEvents({
        address: pair.pairAddress,
        fromBlock,
        toBlock,
      })
      providerUsed = forward.providerUsed
      normalizeLogs(
        forward.logs,
        pair,
        forward.blockTimestamps,
        MAX_EVENTS_PER_SYNC - normalized.length,
        normalized,
      )
    } else if (normalized.length === 0) {
      toBlock = checkpoint.lastIndexedBlock
    }

    const added = await storage.appendEvents(normalized)
    const candles = buildCandlesFromSwaps(
      normalized.filter((e) => e.eventType === 'Swap'),
      pair.pairAddress,
      ['1H', '4H', '1D'],
    )
    if (candles.length) await storage.saveCandles(candles)

    let phase = checkpoint.phase ?? 'bootstrap'
    if (
      phase === 'bootstrap' &&
      toBlock >= chainHead - REORG_SAFETY_BLOCKS &&
      toBlock >= (checkpoint.bootstrapStartBlock ?? 0)
    ) {
      phase = 'incremental'
    }

    const nextCheckpoint: IndexerCheckpoint = {
      ...checkpoint,
      lastIndexedBlock: Math.max(checkpoint.lastIndexedBlock, toBlock),
      chainHeadAtSync: chainHead,
      lastSuccessfulSync: new Date().toISOString(),
      lastFailureReason: undefined,
      phase,
      providerUsed,
    }
    await storage.saveCheckpoint(nextCheckpoint)

    const eventCounts = await storage.countEvents()
    const hasStoredEvents = Object.values(eventCounts).some((n) => n > 0)
    const health: IndexerHealthSnapshot = {
      status: hasStoredEvents ? 'ready' : phase === 'bootstrap' ? 'syncing' : 'unavailable',
      storageBackend: storage.backend,
      storageConfigured: storage.configured,
      lastIndexedBlock: nextCheckpoint.lastIndexedBlock,
      chainHead,
      indexingLag: Math.max(0, chainHead - nextCheckpoint.lastIndexedBlock),
      lastSuccessfulSync: nextCheckpoint.lastSuccessfulSync,
      eventCounts,
      finishedAt: new Date().toISOString(),
      indexerGeneration: 'v2-featured-pair',
      featuredPairSlug: FEATURED_PAIR_SLUG,
      phase,
      providerUsed,
      indexedBlockRange: fromBlock <= toBlock ? { from: fromBlock, to: toBlock } : undefined,
      bootstrapDays: checkpoint.bootstrapDays,
      bootstrapStartBlock: checkpoint.bootstrapStartBlock,
    }
    await storage.saveHealth(health)

    return { addedEvents: added, checkpoint: nextCheckpoint, health }
  } catch (e) {
    const reason = e instanceof Error ? e.message : 'Featured-pair sync failed'
    const failCheckpoint: IndexerCheckpoint = {
      ...checkpoint,
      lastFailureReason: reason,
      chunkSize:
        reason.toLowerCase().includes('limit') && checkpoint.chunkSize > MIN_CHUNK_SIZE
          ? Math.max(MIN_CHUNK_SIZE, Math.floor(checkpoint.chunkSize / 2))
          : checkpoint.chunkSize,
    }
    await storage.saveCheckpoint(failCheckpoint)
    const health: IndexerHealthSnapshot = {
      status: 'error',
      storageBackend: storage.backend,
      storageConfigured: storage.configured,
      lastIndexedBlock: failCheckpoint.lastIndexedBlock,
      chainHead,
      indexingLag: Math.max(0, chainHead - failCheckpoint.lastIndexedBlock),
      lastSuccessfulSync: failCheckpoint.lastSuccessfulSync,
      lastFailureReason: reason,
      eventCounts: await storage.countEvents(),
      finishedAt: new Date().toISOString(),
      indexerGeneration: 'v2-featured-pair',
      featuredPairSlug: FEATURED_PAIR_SLUG,
      phase: checkpoint.phase,
      providerUsed,
    }
    await storage.saveHealth(health)
    throw e
  }
}
