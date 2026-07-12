import {
  BOOTSTRAP_DAYS_FALLBACK,
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
import type { CoverageRange } from './coverageRanges'
import {
  addCoverageRange,
  bootstrapWindowSummary,
  findCoverageGaps,
  selectNextGap,
} from './coverageRanges'
import type { IndexerDeadline } from './indexerDeadline'
import type { IndexerCheckpoint, IndexerHealthSnapshot, NormalizedIndexerEvent } from '../types'
import { buildCandlesFromSwaps } from './candles'
import type { PairWatch } from './featuredPairSync'

const FORWARD_CHUNK_BLOCKS = 100

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
  deadline?: IndexerDeadline
}

export interface PairSyncResult {
  addedEvents: number
  addedCandles: number
  checkpoint: IndexerCheckpoint
  health: IndexerHealthSnapshot
  slug: string
  forwardRangesProcessed: number
  gapRangesProcessed: number
  stoppedBeforeDeadline: boolean
  partialProgress: boolean
  coverageSummary?: ReturnType<typeof bootstrapWindowSummary>
}

function freshCheckpoint(chainHead: number, slug: string, bootstrapDays: number): IndexerCheckpoint {
  const bootstrapBlocks = Math.floor((bootstrapDays * 86_400) / 3)
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
    gapFillCursor: bootstrapStartBlock,
    forwardCursor: bootstrapStartBlock,
    backwardCursor: chainHead,
    coverageRanges: [],
  }
}

async function scanRange(
  pair: PairWatch,
  fromBlock: number,
  toBlock: number,
  chunkSize: number,
  cap: number,
  out: NormalizedIndexerEvent[],
) {
  const result = await getLogsChunked({
    address: pair.pairAddress,
    topics: [SWAP_TOPIC, MINT_TOPIC, BURN_TOPIC],
    fromBlock,
    toBlock,
    initialChunk: chunkSize,
  })
  const tsMap = await hydrateTimestamps(result.logs)
  normalizeLogs(result.logs, pair, tsMap, cap, out)
  return { finalChunkSize: result.finalChunkSize, providerUsed: 'chunked-forward-eth_getLogs' as const }
}

/** R787 — deadline-budgeted pair sync with explicit coverage ranges. */
export async function runPairSyncEngine(params: PairSyncParams): Promise<PairSyncResult> {
  const storage = resolveIndexerStorageForSlug(params.slug)
  const pair = params.pair
  const bootstrapDays = params.bootstrapDays ?? BOOTSTRAP_DAYS_FALLBACK
  const deadline = params.deadline
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
  let coverageRanges: CoverageRange[] = [...(checkpoint.coverageRanges ?? [])]
  const normalized: NormalizedIndexerEvent[] = []
  let providerUsed = checkpoint.providerUsed ?? 'unknown'
  let fromBlock = bootstrapFloor
  let toBlock = bootstrapFloor
  let forwardRangesProcessed = 0
  let gapRangesProcessed = 0
  let gapFillCursor = checkpoint.gapFillCursor ?? bootstrapFloor
  let phase = checkpoint.phase ?? 'bootstrap'

  // 1) Forward live sync — head tip first when near head
  const nearHead = gapFillCursor >= forwardHigh - FORWARD_CHUNK_BLOCKS * 2
  if (nearHead && !deadline?.shouldStop()) {
    const headScan = await scanPairEventsFromHead({
      address: pair.pairAddress,
      maxBlocks: 24,
      maxLogs: MAX_EVENTS_PER_SYNC - normalized.length,
      stopBeforeBlock: Math.max(0, forwardHigh - 24),
    })
    providerUsed = headScan.providerUsed
    normalizeLogs(headScan.logs, pair, headScan.blockTimestamps, MAX_EVENTS_PER_SYNC, normalized)
    if (headScan.logs.length) {
      const bn = headScan.lastScannedBlock
      coverageRanges = addCoverageRange(coverageRanges, { fromBlock: bn, toBlock: forwardHigh })
      gapFillCursor = Math.max(gapFillCursor, forwardHigh)
      forwardRangesProcessed += 1
      fromBlock = bn
      toBlock = forwardHigh
    }
  }

  // 2) Gap fill — newest uncovered interval toward head
  while (!deadline?.shouldStop() && normalized.length < MAX_EVENTS_PER_SYNC) {
    const gaps = findCoverageGaps(coverageRanges, bootstrapFloor, forwardHigh)
    const nextGap = selectNextGap(gaps)
    if (!nextGap) {
      if (gapFillCursor < forwardHigh) {
        const forwardFrom = Math.max(bootstrapFloor, gapFillCursor + 1)
        const forwardTo = Math.min(forwardHigh, forwardFrom + FORWARD_CHUNK_BLOCKS - 1)
        const scan = await scanRange(
          pair,
          forwardFrom,
          forwardTo,
          checkpoint.chunkSize ?? FORWARD_CHUNK_BLOCKS,
          MAX_EVENTS_PER_SYNC - normalized.length,
          normalized,
        )
        providerUsed = scan.providerUsed
        checkpoint = { ...checkpoint, chunkSize: scan.finalChunkSize }
        coverageRanges = addCoverageRange(coverageRanges, { fromBlock: forwardFrom, toBlock: forwardTo })
        gapFillCursor = forwardTo
        gapRangesProcessed += 1
        fromBlock = forwardFrom
        toBlock = forwardTo
        await storage.saveCheckpoint({
          ...checkpoint,
          gapFillCursor,
          forwardCursor: gapFillCursor,
          coverageRanges,
          lastIndexedBlock: gapFillCursor,
          chainHeadAtSync: chainHead,
          lastSuccessfulSync: new Date().toISOString(),
        })
        continue
      }
      break
    }

    const gapFrom = nextGap.fromBlock
    const gapTo = Math.min(nextGap.toBlock, gapFrom + FORWARD_CHUNK_BLOCKS - 1)
    const scan = await scanRange(
      pair,
      gapFrom,
      gapTo,
      checkpoint.chunkSize ?? FORWARD_CHUNK_BLOCKS,
      MAX_EVENTS_PER_SYNC - normalized.length,
      normalized,
    )
    providerUsed = scan.providerUsed
    checkpoint = { ...checkpoint, chunkSize: scan.finalChunkSize }
    coverageRanges = addCoverageRange(coverageRanges, { fromBlock: gapFrom, toBlock: gapTo })
    gapFillCursor = Math.max(gapFillCursor, gapTo)
    gapRangesProcessed += 1
    fromBlock = gapFrom
    toBlock = gapTo
    await storage.saveCheckpoint({
      ...checkpoint,
      gapFillCursor,
      forwardCursor: gapFillCursor,
      coverageRanges,
      lastIndexedBlock: gapFillCursor,
      chainHeadAtSync: chainHead,
      lastSuccessfulSync: new Date().toISOString(),
    })
  }

  if (gapFillCursor >= forwardHigh - REORG_SAFETY_BLOCKS) {
    phase = 'incremental'
  }

  const added = await storage.appendEvents(normalized)
  const candles = buildCandlesFromSwaps(
    normalized.filter((e) => e.eventType === 'Swap'),
    pair.pairAddress,
    ['1H', '4H', '1D'],
  )
  if (candles.length) await storage.saveCandles(candles)

  const coverageSummary = bootstrapWindowSummary(coverageRanges, bootstrapFloor, forwardHigh)
  const nextCheckpoint: IndexerCheckpoint = {
    ...checkpoint,
    gapFillCursor,
    forwardCursor: gapFillCursor,
    coverageRanges,
    lastIndexedBlock: gapFillCursor,
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
  const indexingLag = Math.max(0, chainHead - gapFillCursor)
  const stoppedBeforeDeadline = Boolean(deadline?.shouldStop(0))

  const health: IndexerHealthSnapshot = {
    status: hasStoredEvents ? 'ready' : phase === 'bootstrap' ? 'syncing' : 'unavailable',
    storageBackend: storage.backend,
    storageConfigured: storage.configured,
    lastIndexedBlock: gapFillCursor,
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

  return {
    addedEvents: added,
    addedCandles: candles.length,
    checkpoint: nextCheckpoint,
    health,
    slug: params.slug,
    forwardRangesProcessed,
    gapRangesProcessed,
    stoppedBeforeDeadline,
    partialProgress: stoppedBeforeDeadline || gapRangesProcessed > 0 || forwardRangesProcessed > 0,
    coverageSummary,
  }
}
