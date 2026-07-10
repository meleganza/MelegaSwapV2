import {
  DEFAULT_START_BLOCK,
  INTERVAL_SECONDS,
  MARCO_WBNB_PAIR_BSC,
  MAX_EVENTS_PER_SYNC,
  MAX_BLOCKS_PER_SYNC,
  MELEGA_CHAIN_ID,
  REORG_SAFETY_BLOCKS,
} from '../constants'
import { resolveIndexerStorage } from '../storage'
import type { IndexerCheckpoint, IndexerHealthSnapshot, NormalizedIndexerEvent } from '../types'
import {
  AMM_TOPICS,
  getBlockNumber,
  getBlockTimestamp,
  getLogsChunked,
  normalizeMintBurnLog,
  normalizeSwapLog,
} from '../rpc/chunkedLogs'
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

const DEFAULT_WATCH: PairWatch[] = [
  {
    pairAddress: MARCO_WBNB_PAIR_BSC.toLowerCase(),
    token0: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
    token1: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  },
]

export async function runIncrementalSync(watchPairs: PairWatch[] = DEFAULT_WATCH): Promise<SyncResult> {
  const storage = resolveIndexerStorage()
  const chainHead = await getBlockNumber()
  const existing = (await storage.loadCheckpoint()) ?? {
    chainId: MELEGA_CHAIN_ID,
    lastIndexedBlock: DEFAULT_START_BLOCK,
    chainHeadAtSync: chainHead,
    reorgSafetyBlocks: REORG_SAFETY_BLOCKS,
    lastSuccessfulSync: new Date(0).toISOString(),
    chunkSize: 1500,
    cursorPairIndex: 0,
  }

  try {
    const fromBlock = Math.max(DEFAULT_START_BLOCK, existing.lastIndexedBlock - REORG_SAFETY_BLOCKS + 1)
    const toBlock = Math.min(chainHead, fromBlock + MAX_BLOCKS_PER_SYNC - 1)
    const normalized: NormalizedIndexerEvent[] = []

    for (const pair of watchPairs) {
      for (const [eventType, topic] of Object.entries(AMM_TOPICS) as Array<[keyof typeof AMM_TOPICS, string]>) {
        if (eventType === 'sync') continue
        const { logs } = await getLogsChunked({
          address: pair.pairAddress,
          topics: [topic],
          fromBlock,
          toBlock,
          initialChunk: existing.chunkSize,
        })
        for (const log of logs) {
          if (normalized.length >= MAX_EVENTS_PER_SYNC) break
          if (eventType === 'swap') {
            normalized.push(normalizeSwapLog(log, pair))
          } else if (eventType === 'mint') {
            normalized.push(normalizeMintBurnLog(log, 'Mint', pair))
          } else if (eventType === 'burn') {
            normalized.push(normalizeMintBurnLog(log, 'Burn', pair))
          }
        }
      }
    }

    const tsBlocks = new Set(normalized.map((e) => e.blockNumber))
    const tsMap = new Map<number, number>()
    for (const bn of tsBlocks) tsMap.set(bn, await getBlockTimestamp(bn))
    for (const e of normalized) e.blockTimestamp = tsMap.get(e.blockNumber) ?? 0

    const added = await storage.appendEvents(normalized)
    const candles = buildCandlesFromSwaps(
      normalized.filter((e) => e.eventType === 'Swap'),
      watchPairs[0].pairAddress,
      ['1H', '4H', '1D'],
    )
    if (candles.length) await storage.saveCandles(candles)

    const checkpoint: IndexerCheckpoint = {
      ...existing,
      lastIndexedBlock: toBlock,
      chainHeadAtSync: chainHead,
      lastSuccessfulSync: new Date().toISOString(),
      lastFailureReason: undefined,
    }
    await storage.saveCheckpoint(checkpoint)

    const eventCounts = await storage.countEvents()
    const health: IndexerHealthSnapshot = {
      status: added > 0 || Object.values(eventCounts).some((n) => n > 0) ? 'ready' : 'unavailable',
      storageBackend: storage.backend,
      storageConfigured: storage.configured,
      lastIndexedBlock: checkpoint.lastIndexedBlock,
      chainHead,
      indexingLag: Math.max(0, chainHead - checkpoint.lastIndexedBlock),
      lastSuccessfulSync: checkpoint.lastSuccessfulSync,
      eventCounts,
      finishedAt: new Date().toISOString(),
    }
    await storage.saveHealth(health)

    return { addedEvents: added, checkpoint, health }
  } catch (e) {
    const reason = e instanceof Error ? e.message : 'Indexer sync failed'
    const failCheckpoint: IndexerCheckpoint = {
      ...existing,
      lastFailureReason: reason,
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
    }
    await storage.saveHealth(health)
    throw e
  }
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export { INTERVAL_SECONDS }
