import {
  BOOTSTRAP_DAYS_FALLBACK,
  BSC_AVG_BLOCK_SECONDS,
  BOOTSTRAP_MAX_BLOCKS_PER_SYNC,
  INDEXER_SCHEMA_VERSION,
  MAX_EVENTS_PER_SYNC,
  MELEGA_CHAIN_ID,
  REORG_SAFETY_BLOCKS,
  SWAP_TOPIC,
  MINT_TOPIC,
  BURN_TOPIC,
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
const FORWARD_CHUNK_BLOCKS = BOOTSTRAP_MAX_BLOCKS_PER_SYNC
const BACKWARD_CHUNK_BLOCKS = BOOTSTRAP_MAX_BLOCKS_PER_SYNC

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

async function newestStoredBlock(storage: ReturnType<typeof resolveIndexerStorageForSlug>): Promise<number> {
  const events = await storage.listEvents({ limit: 1 })
  return events[0]?.blockNumber ?? 0
}

/** Rewind a falsely advanced forward cursor that skipped a large indexing gap. */
async function resolveForwardCursor(
  checkpoint: IndexerCheckpoint,
  storage: ReturnType<typeof resolveIndexerStorageForSlug>,
  bootstrapFloor: number,
  forwardHigh: number,
): Promise<number> {
  const newestBlock = await newestStoredBlock(storage)
  let cursor = checkpoint.forwardCursor ?? Math.max(bootstrapFloor, newestBlock)
  const nearHead = forwardHigh - cursor <= REORG_SAFETY_BLOCKS
  const gapBehind = newestBlock > 0 && forwardHigh - newestBlock > FORWARD_CHUNK_BLOCKS * 2
  if (nearHead && gapBehind) {
    cursor = Math.max(bootstrapFloor, newestBlock)
  }
  return Math.min(cursor, forwardHigh)
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
    lastIndexedBlock: bootstrapStartBlock,
    chainHeadAtSync: chainHead,
    reorgSafetyBlocks: REORG_SAFETY_BLOCKS,
    lastSuccessfulSync: new Date(0).toISOString(),
    chunkSize: FORWARD_CHUNK_BLOCKS,
    cursorPairIndex: 0,
    phase: 'bootstrap',
    featuredPairSlug: slug,
    bootstrapStartBlock,
    bootstrapDays,
    forwardCursor: bootstrapStartBlock,
    backwardCursor: chainHead,
  }
}

/** R786 — forward-priority dual-cursor pair sync with chunked eth_getLogs. */
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
  let forwardCursor = await resolveForwardCursor(checkpoint, storage, bootstrapFloor, forwardHigh)
  const normalized: NormalizedIndexerEvent[] = []
  let providerUsed = checkpoint.providerUsed ?? 'unknown'
  let fromBlock = forwardCursor
  let toBlock = forwardCursor

  // 1) Forward pass — advance from cursor+1 toward head (never jump to tip only)
  if (forwardCursor < forwardHigh) {
    const forwardFrom = Math.max(bootstrapFloor, forwardCursor + 1)
    const forwardTo = Math.min(forwardHigh, forwardFrom + FORWARD_CHUNK_BLOCKS - 1)
    const forward = await getLogsChunked({
      address: pair.pairAddress,
      topics: [SWAP_TOPIC],
      fromBlock: forwardFrom,
      toBlock: forwardTo,
      initialChunk: checkpoint.chunkSize ?? FORWARD_CHUNK_BLOCKS,
    })
    providerUsed = 'chunked-forward-eth_getLogs'
    const tsMap = await hydrateTimestamps(forward.logs)
    normalizeLogs(forward.logs, pair, tsMap, MAX_EVENTS_PER_SYNC, normalized)
    forwardCursor = forwardTo
    checkpoint = {
      ...checkpoint,
      forwardCursor,
      chunkSize: forward.finalChunkSize,
    }
    fromBlock = forwardFrom
    toBlock = forwardTo
  }

  // 2) Backward pass — fill bootstrap window when forward chunk had spare budget
  let phase = checkpoint.phase ?? 'bootstrap'
  if (phase === 'bootstrap' && normalized.length < MAX_EVENTS_PER_SYNC / 2) {
    const backwardHigh = checkpoint.backwardCursor ?? chainHead
    if (backwardHigh > bootstrapFloor) {
      const backwardLow = Math.max(bootstrapFloor, backwardHigh - BACKWARD_CHUNK_BLOCKS)
      const remaining = MAX_EVENTS_PER_SYNC - normalized.length
      if (remaining > 0 && backwardLow < backwardHigh) {
        const backward = await getLogsChunked({
          address: pair.pairAddress,
          topics: [SWAP_TOPIC, MINT_TOPIC, BURN_TOPIC],
          fromBlock: backwardLow,
          toBlock: backwardHigh,
          initialChunk: checkpoint.chunkSize ?? BACKWARD_CHUNK_BLOCKS,
        })
        const tsMap = await hydrateTimestamps(backward.logs)
        normalizeLogs(backward.logs, pair, tsMap, remaining, normalized)
        checkpoint = {
          ...checkpoint,
          backwardCursor: backwardLow,
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

  if (forwardCursor >= forwardHigh - REORG_SAFETY_BLOCKS && phase === 'bootstrap') {
    phase = 'incremental'
  }

  // 3) Incremental head walk when caught up but this chunk had no logs
  if (normalized.length === 0 && phase === 'incremental' && forwardCursor >= forwardHigh - REORG_SAFETY_BLOCKS) {
    const headScan = await scanPairEventsFromHead({
      address: pair.pairAddress,
      maxBlocks: 24,
      maxLogs: MAX_EVENTS_PER_SYNC,
      stopBeforeBlock: Math.max(0, forwardHigh - 24),
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

  const nextIndexedBlock = Math.max(forwardCursor, checkpoint.backwardCursor ?? 0)
  const nextCheckpoint: IndexerCheckpoint = {
    ...checkpoint,
    forwardCursor,
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
  const indexingLag = Math.max(0, chainHead - forwardCursor)

  const health: IndexerHealthSnapshot = {
    status: hasStoredEvents ? 'ready' : phase === 'bootstrap' ? 'syncing' : 'unavailable',
    storageBackend: storage.backend,
    storageConfigured: storage.configured,
    lastIndexedBlock: forwardCursor,
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
