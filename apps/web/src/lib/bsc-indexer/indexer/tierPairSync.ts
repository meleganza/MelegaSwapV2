import {
  BOOTSTRAP_DAYS_FALLBACK,
  BOOTSTRAP_MAX_BLOCKS_PER_SYNC,
  BSC_AVG_BLOCK_SECONDS,
  INDEXER_SCHEMA_VERSION,
  MAX_BLOCKS_PER_SYNC,
  MAX_EVENTS_PER_SYNC,
  MELEGA_CHAIN_ID,
  MIN_CHUNK_SIZE,
  REORG_SAFETY_BLOCKS,
} from '../constants'
import { resolveIndexerStorageForSlug } from '../storage'
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
import { buildCandlesFromSwaps } from './candles'
import type { TierPairWatch } from './tierInventory'
import type { PairWatch } from './featuredPairSync'

const BOOTSTRAP_BLOCKS = Math.floor((BOOTSTRAP_DAYS_FALLBACK * 86_400) / BSC_AVG_BLOCK_SECONDS)

function freshCheckpoint(chainHead: number, slug: string): IndexerCheckpoint {
  return {
    schemaVersion: INDEXER_SCHEMA_VERSION,
    chainId: MELEGA_CHAIN_ID,
    lastIndexedBlock: Math.max(0, chainHead - BOOTSTRAP_BLOCKS),
    chainHeadAtSync: chainHead,
    reorgSafetyBlocks: REORG_SAFETY_BLOCKS,
    lastSuccessfulSync: new Date(0).toISOString(),
    chunkSize: 1,
    cursorPairIndex: 0,
    phase: 'bootstrap',
    featuredPairSlug: slug,
    bootstrapStartBlock: Math.max(0, chainHead - BOOTSTRAP_BLOCKS),
    bootstrapDays: BOOTSTRAP_DAYS_FALLBACK,
  }
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

/** R780 — bounded sync for one tier-2 liquid pair (separate durable namespace). */
export async function runTierPairSync(watch: TierPairWatch) {
  const storage = resolveIndexerStorageForSlug(watch.slug)
  const pair: PairWatch = {
    pairAddress: watch.pairAddress,
    token0: watch.token0,
    token1: watch.token1,
  }
  const chainHead = await getBlockNumber()
  let checkpoint = (await storage.loadCheckpoint()) ?? freshCheckpoint(chainHead, watch.slug)
  if (checkpoint.schemaVersion !== INDEXER_SCHEMA_VERSION) {
    checkpoint = freshCheckpoint(chainHead, watch.slug)
  }

  const blockBudget = checkpoint.phase === 'bootstrap' ? BOOTSTRAP_MAX_BLOCKS_PER_SYNC : MAX_BLOCKS_PER_SYNC
  const normalized: NormalizedIndexerEvent[] = []
  let providerUsed = checkpoint.providerUsed ?? 'unknown'

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
    checkpoint.phase === 'bootstrap' ? Math.max(bootstrapFloor, oldestScanned) : chainHead

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
    featuredPairSlug: watch.slug,
  }
  await storage.saveCheckpoint(nextCheckpoint)

  const eventCounts = await storage.countEvents()
  const health: IndexerHealthSnapshot = {
    status: Object.values(eventCounts).some((n) => n > 0) ? 'ready' : phase === 'bootstrap' ? 'syncing' : 'unavailable',
    storageBackend: storage.backend,
    storageConfigured: storage.configured,
    lastIndexedBlock: nextCheckpoint.lastIndexedBlock,
    chainHead,
    indexingLag: Math.max(0, chainHead - nextCheckpoint.lastIndexedBlock),
    lastSuccessfulSync: nextCheckpoint.lastSuccessfulSync,
    eventCounts,
    finishedAt: new Date().toISOString(),
    indexerGeneration: 'v2-featured-pair',
    featuredPairSlug: watch.slug,
    phase,
    providerUsed,
    indexedBlockRange: { from: oldestScanned, to: checkpoint.lastIndexedBlock },
    bootstrapDays: checkpoint.bootstrapDays,
    bootstrapStartBlock: checkpoint.bootstrapStartBlock,
  }
  await storage.saveHealth(health)

  return {
    slug: watch.slug,
    tier: watch.tier,
    addedEvents: added,
    checkpoint: nextCheckpoint,
    health: { ...health, providerHealth: getProviderHealthSnapshot() },
  }
}
