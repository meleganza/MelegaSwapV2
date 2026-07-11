import {
  BOOTSTRAP_MAX_BLOCKS_PER_SYNC,
  DEFAULT_CHUNK_SIZE,
  FEATURED_PAIR_SLUG,
  INDEXER_SCHEMA_VERSION,
  MARCO_WBNB_PAIR_BSC,
  MAX_BLOCKS_PER_SYNC,
  MAX_EVENTS_PER_SYNC,
  MELEGA_CHAIN_ID,
  MIN_CHUNK_SIZE,
  REORG_SAFETY_BLOCKS,
  VERIFIED_R772_SWAP_BLOCK,
} from '../constants'
import { CHECKPOINT_RESET_REASON_R772, createFreshFeaturedPairCheckpoint } from '../checkpointReset'
import { assertIndexerEventTopicsValid } from '../eventTopicIntegrity'
import { resolveIndexerStorage } from '../storage'
import type { IndexerCheckpoint, IndexerHealthSnapshot, NormalizedIndexerEvent } from '../types'
import {
  getBlockNumber,
  getProviderHealthSnapshot,
  normalizeMintBurnLog,
  normalizeSwapLog,
  scanPairEventsFromHead,
  type RawLog,
} from '../rpc/chunkedLogs'
import { AMM_TOPICS } from '../rpc/chunkedLogs'
import { scanBlockRangeEvents } from '../rpc/scanBlockRange'
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

/** R773 — MARCO/WBNB featured-pair incremental indexer (v2 namespace). */
export async function runFeaturedPairSync(pair: PairWatch = DEFAULT_WATCH): Promise<SyncResult> {
  assertIndexerEventTopicsValid()

  const storage = resolveIndexerStorage()
  const chainHead = await getBlockNumber()
  let existing = await storage.loadCheckpoint()
  if (!isV2Checkpoint(existing)) existing = null

  const eventCountsPreflight = await storage.countEvents()
  const hasEvents = Object.values(eventCountsPreflight).some((n) => n > 0)
  let checkpoint =
    existing ??
    (await createFreshFeaturedPairCheckpoint(chainHead, 'INITIAL_V2_BOOTSTRAP'))

  if (
    isV2Checkpoint(checkpoint) &&
    !checkpoint.resetReason &&
    !hasEvents &&
    checkpoint.lastFailureReason
  ) {
    checkpoint = await createFreshFeaturedPairCheckpoint(
      chainHead,
      CHECKPOINT_RESET_REASON_R772,
    )
    await storage.saveCheckpoint(checkpoint)
  }

  const blockBudget =
    checkpoint.phase === 'bootstrap' ? BOOTSTRAP_MAX_BLOCKS_PER_SYNC : MAX_BLOCKS_PER_SYNC
  let providerUsed = checkpoint.providerUsed ?? 'unknown'
  let fromBlock = 0
  let toBlock = checkpoint.lastIndexedBlock
  const normalized: NormalizedIndexerEvent[] = []

  try {
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
      providerUsed = anchor.providerUsed
      normalizeLogs(anchor.logs, pair, anchor.blockTimestamps, MAX_EVENTS_PER_SYNC, normalized)
      checkpoint = { ...checkpoint, anchorSeeded: true }
      fromBlock = VERIFIED_R772_SWAP_BLOCK
      toBlock = VERIFIED_R772_SWAP_BLOCK
    }

    const bootstrapFloor = checkpoint.bootstrapStartBlock ?? 0
    const stopBefore =
      checkpoint.phase === 'incremental'
        ? Math.max(0, chainHead - blockBudget - REORG_SAFETY_BLOCKS)
        : Math.max(bootstrapFloor, checkpoint.lastIndexedBlock - blockBudget)

    const headScan = await scanPairEventsFromHead({
      address: pair.pairAddress,
      maxBlocks: blockBudget,
      maxLogs: MAX_EVENTS_PER_SYNC,
      stopBeforeBlock: stopBefore,
      startBlock: checkpoint.phase === 'bootstrap' ? checkpoint.lastIndexedBlock : undefined,
    })
    providerUsed = headScan.providerUsed
    normalizeLogs(headScan.logs, pair, headScan.blockTimestamps, MAX_EVENTS_PER_SYNC, normalized)

    if (headScan.logs.length === 0 && checkpoint.phase === 'bootstrap' && !hasEvents) {
      const forwardFrom = Math.max(bootstrapFloor, checkpoint.lastIndexedBlock - blockBudget + 1)
      const forwardTo = checkpoint.lastIndexedBlock
      if (forwardFrom <= forwardTo) {
        const forward = await scanBlockRangeEvents({
          address: pair.pairAddress,
          fromBlock: forwardFrom,
          toBlock: forwardTo,
        })
        providerUsed = forward.providerUsed
        fromBlock = forwardFrom
        toBlock = forwardTo
        normalizeLogs(
          forward.logs,
          pair,
          forward.blockTimestamps,
          MAX_EVENTS_PER_SYNC - normalized.length,
          normalized,
        )
      }
    } else {
      fromBlock = headScan.lastScannedBlock
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
    const oldestScanned = headScan.lastScannedBlock
    const nextIndexedBlock =
      checkpoint.phase === 'bootstrap'
        ? Math.max(bootstrapFloor, oldestScanned)
        : chainHead

    if (phase === 'bootstrap' && oldestScanned <= bootstrapFloor + REORG_SAFETY_BLOCKS) {
      phase = 'incremental'
    }

    const nextCheckpoint: IndexerCheckpoint = {
      ...checkpoint,
      lastIndexedBlock: nextIndexedBlock,
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
      indexedBlockRange: { from: fromBlock, to: toBlock },
      bootstrapDays: checkpoint.bootstrapDays,
      bootstrapStartBlock: checkpoint.bootstrapStartBlock,
    }
    await storage.saveHealth(health)

    return {
      addedEvents: added,
      checkpoint: nextCheckpoint,
      health: {
        ...health,
        providerHealth: getProviderHealthSnapshot(),
      },
    }
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
