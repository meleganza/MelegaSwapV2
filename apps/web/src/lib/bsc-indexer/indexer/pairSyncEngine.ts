import {
  BOOTSTRAP_DAYS_FALLBACK,
  BSC_AVG_BLOCK_SECONDS,
  DEFAULT_CHUNK_SIZE,
  INDEXER_SCHEMA_VERSION,
  MAX_EVENTS_PER_SYNC,
  MELEGA_CHAIN_ID,
  MIN_CHUNK_SIZE,
  REORG_SAFETY_BLOCKS,
} from '../constants'
import { AMM_TOPICS } from '../rpc/chunkedLogs'
import {
  getBlockNumber,
  getBlockTimestamp,
  getLogsChunked,
  normalizeMintBurnLog,
  normalizeSwapLog,
  scanPairEventsFromHead,
  type RawLog,
} from '../rpc/chunkedLogs'
import { resolveIndexerStorageForSlug } from '../storage'
import type { IndexerCheckpoint, IndexerHealthSnapshot, NormalizedIndexerEvent } from '../types'
import { buildCandlesFromSwaps } from './candles'
import type { PairWatch } from './featuredPairSync'

const BLOCKS_PER_DAY = Math.floor(86_400 / BSC_AVG_BLOCK_SECONDS)
const FORWARD_WINDOW_BLOCKS = BLOCKS_PER_DAY
const FORWARD_BLOCKS_PER_SYNC = 60
const BACKWARD_BLOCKS_PER_SYNC = 60

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

async function hydrateTimestamps(logs: RawLog[]): Promise<Map<number, number>> {
  const map = new Map<number, number>()
  const blocks = [...new Set(logs.map((l) => parseInt(l.blockNumber, 16)))]
  for (const bn of blocks) {
    map.set(bn, await getBlockTimestamp(bn))
  }
  return map
}

export interface PairSyncParams {
  pair: PairWatch
  slug: string
  bootstrapDays?: number
  existingCheckpoint?: IndexerCheckpoint | null
}

export interface PairSyncResult {
  addedEvents: number
  checkpoint: IndexerCheckpoint
  health: IndexerHealthSnapshot
  slug: string
}

function freshCheckpoint(chainHead: number, slug: string, bootstrapDays: number): IndexerCheckpoint {
  const bootstrapBlocks = Math.floor((bootstrapDays * 86_400) / BSC_AVG_BLOCK_SECONDS)
  const bootstrapStartBlock = Math.max(0, chainHead - bootstrapBlocks)
  return {
    schemaVersion: INDEXER_SCHEMA_VERSION,
    chainId: MELEGA_CHAIN_ID,
    lastIndexedBlock: chainHead,
    chainHeadAtSync: chainHead,
    reorgSafetyBlocks: REORG_SAFETY_BLOCKS,
    lastSuccessfulSync: new Date(0).toISOString(),
    chunkSize: DEFAULT_CHUNK_SIZE,
    cursorPairIndex: 0,
    phase: 'bootstrap',
    featuredPairSlug: slug,
    bootstrapStartBlock,
    bootstrapDays,
    forwardCursor: Math.max(0, chainHead - REORG_SAFETY_BLOCKS),
    backwardCursor: chainHead,
  }
}

/** R786 — forward-priority dual-cursor pair sync. */
export async function runPairSyncEngine(params: PairSyncParams): Promise<PairSyncResult> {
  const storage = resolveIndexerStorageForSlug(params.slug)
  const pair = params.pair
  const bootstrapDays = params.bootstrapDays ?? BOOTSTRAP_DAYS_FALLBACK
  const chainHead = await getBlockNumber()

  let checkpoint =
    params.existingCheckpoint && params.existingCheckpoint.schemaVersion === INDEXER_SCHEMA_VERSION
      ? params.existingCheckpoint
      : (await storage.loadCheckpoint()) ?? freshCheckpoint(chainHead, params.slug, bootstrapDays)

  if (checkpoint.schemaVersion !== INDEXER_SCHEMA_VERSION) {
    checkpoint = freshCheckpoint(chainHead, params.slug, bootstrapDays)
  }

  const bootstrapFloor = checkpoint.bootstrapStartBlock ?? 0
  const forwardHigh = Math.max(0, chainHead - REORG_SAFETY_BLOCKS)
  const forwardCursor = checkpoint.forwardCursor ?? forwardHigh
  const normalized: NormalizedIndexerEvent[] = []
  let providerUsed = checkpoint.providerUsed ?? 'unknown'
  let fromBlock = forwardCursor
  let toBlock = forwardHigh

  // 1) Forward pass — always first (recent swaps before historical backfill)
  if (forwardCursor < forwardHigh) {
    const forwardFrom = Math.max(forwardCursor + 1, forwardHigh - FORWARD_BLOCKS_PER_SYNC)
    const forwardTo = forwardHigh
    const topicBatches: RawLog[] = []
    let forwardChunkSize = checkpoint.chunkSize ?? DEFAULT_CHUNK_SIZE
    for (const topic of [AMM_TOPICS.swap]) {
      const chunked = await getLogsChunked({
        address: pair.pairAddress,
        topics: [topic],
        fromBlock: forwardFrom,
        toBlock: forwardTo,
        initialChunk: Math.min(forwardChunkSize, 50),
      })
      topicBatches.push(...chunked.logs)
      forwardChunkSize = chunked.finalChunkSize
    }
    providerUsed = 'chunked-forward'
    const tsMap = await hydrateTimestamps(topicBatches)
    normalizeLogs(topicBatches, pair, tsMap, MAX_EVENTS_PER_SYNC, normalized)
    checkpoint = {
      ...checkpoint,
      forwardCursor: forwardTo,
      chunkSize: forwardChunkSize,
    }
    fromBlock = forwardFrom
    toBlock = forwardTo
  }

  // 2) Backward pass — bootstrap historical window
  let phase = checkpoint.phase ?? 'bootstrap'
  if (phase === 'bootstrap') {
    const backwardHigh = checkpoint.backwardCursor ?? chainHead
    if (backwardHigh > bootstrapFloor) {
      const backwardLow = Math.max(bootstrapFloor, backwardHigh - BACKWARD_BLOCKS_PER_SYNC)
      const remaining = MAX_EVENTS_PER_SYNC - normalized.length
      if (remaining > 0 && backwardLow < backwardHigh) {
        const topicBatches: RawLog[] = []
        for (const topic of [AMM_TOPICS.swap, AMM_TOPICS.mint, AMM_TOPICS.burn]) {
          const chunked = await getLogsChunked({
            address: pair.pairAddress,
            topics: [topic],
            fromBlock: backwardLow,
            toBlock: backwardHigh,
            initialChunk: Math.min(checkpoint.chunkSize ?? DEFAULT_CHUNK_SIZE, 50),
          })
          topicBatches.push(...chunked.logs)
          checkpoint = { ...checkpoint, chunkSize: chunked.finalChunkSize }
        }
        const tsMap = await hydrateTimestamps(topicBatches)
        normalizeLogs(topicBatches, pair, tsMap, remaining, normalized)
        checkpoint = {
          ...checkpoint,
          backwardCursor: backwardLow,
          chunkSize: chunked.finalChunkSize,
        }
        fromBlock = Math.min(fromBlock, backwardLow)
        toBlock = Math.max(toBlock, backwardHigh)
      }
      if (backwardLow <= bootstrapFloor + REORG_SAFETY_BLOCKS) {
        phase = 'incremental'
      }
    } else {
      phase = 'incremental'
    }
  }

  // 3) Incremental head walk when forward chunk empty but lag remains
  if (normalized.length === 0 && phase === 'incremental') {
    const headScan = await scanPairEventsFromHead({
      address: pair.pairAddress,
      maxBlocks: 12,
      maxLogs: MAX_EVENTS_PER_SYNC,
      stopBeforeBlock: Math.max(0, forwardHigh - 12),
    })
    providerUsed = headScan.providerUsed
    normalizeLogs(headScan.logs, pair, headScan.blockTimestamps, MAX_EVENTS_PER_SYNC, normalized)
    fromBlock = headScan.lastScannedBlock
    toBlock = forwardHigh
  }

  const added = await storage.appendEvents(normalized)
  const candles = buildCandlesFromSwaps(
    normalized.filter((e) => e.eventType === 'Swap'),
    pair.pairAddress,
    ['1H', '4H', '1D'],
  )
  if (candles.length) await storage.saveCandles(candles)

  const nextIndexedBlock = Math.max(checkpoint.forwardCursor ?? forwardHigh, checkpoint.backwardCursor ?? 0)
  const nextCheckpoint: IndexerCheckpoint = {
    ...checkpoint,
    lastIndexedBlock: nextIndexedBlock,
    chainHeadAtSync: chainHead,
    lastSuccessfulSync: new Date().toISOString(),
    lastFailureReason: undefined,
    phase,
    providerUsed,
    featuredPairSlug: params.slug,
  }
  await storage.saveCheckpoint(nextCheckpoint)

  const eventCounts = await storage.countEvents()
  const hasStoredEvents = Object.values(eventCounts).some((n) => n > 0)
  const indexingLag = Math.max(0, chainHead - (nextCheckpoint.forwardCursor ?? chainHead))

  const health: IndexerHealthSnapshot = {
    status: hasStoredEvents ? 'ready' : phase === 'bootstrap' ? 'syncing' : 'unavailable',
    storageBackend: storage.backend,
    storageConfigured: storage.configured,
    lastIndexedBlock: nextCheckpoint.lastIndexedBlock,
    chainHead,
    indexingLag,
    lastSuccessfulSync: nextCheckpoint.lastSuccessfulSync,
    eventCounts,
    finishedAt: new Date().toISOString(),
    indexerGeneration: 'v2-featured-pair',
    featuredPairSlug: params.slug,
    phase,
    providerUsed,
    indexedBlockRange: { from: fromBlock, to: toBlock },
    bootstrapDays: checkpoint.bootstrapDays,
    bootstrapStartBlock: checkpoint.bootstrapStartBlock,
  }
  await storage.saveHealth(health)

  return { addedEvents: added, checkpoint: nextCheckpoint, health, slug: params.slug }
}
