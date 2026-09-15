import type { IndexerCheckpoint, IndexerHealthSnapshot, NormalizedIndexerEvent, OhlcvCandle } from '../types'
import type { IndexerStorage } from '../storage/types'

export function createMemoryIndexerStorage(): IndexerStorage {
  let checkpoint: IndexerCheckpoint | null = null
  let health: IndexerHealthSnapshot | null = null
  let events: NormalizedIndexerEvent[] = []
  const candles = new Map<string, OhlcvCandle[]>()

  return {
    backend: 'memory-test',
    configured: true,
    async loadCheckpoint() {
      return checkpoint ? { ...checkpoint, coverageRanges: checkpoint.coverageRanges?.map((r) => ({ ...r })) } : null
    },
    async saveCheckpoint(next) {
      checkpoint = {
        ...next,
        coverageRanges: next.coverageRanges?.map((r) => ({ ...r })),
      }
    },
    async loadHealth() {
      return health
    },
    async saveHealth(next) {
      health = next
    },
    async appendEvents(incoming) {
      const seen = new Set(events.map((e) => `${e.chainId}:${e.txHash}:${e.logIndex}`))
      let added = 0
      for (const event of incoming) {
        const key = `${event.chainId}:${event.txHash}:${event.logIndex}`
        if (seen.has(key)) continue
        seen.add(key)
        events.push(event)
        added += 1
      }
      return added
    },
    async listEvents(query) {
      let rows = [...events]
      if (query.pairAddress) {
        const pair = query.pairAddress.toLowerCase()
        rows = rows.filter((e) => e.pairAddress?.toLowerCase() === pair)
      }
      if (query.eventTypes?.length) {
        const set = new Set(query.eventTypes)
        rows = rows.filter((e) => set.has(e.eventType))
      }
      if (query.fromBlock) rows = rows.filter((e) => e.blockNumber >= query.fromBlock!)
      rows.sort((a, b) => b.blockNumber - a.blockNumber || b.logIndex - a.logIndex)
      const offset = query.offset ?? 0
      return rows.slice(offset, offset + (query.limit ?? 50))
    },
    async countEvents() {
      const counts: Record<string, number> = {}
      for (const event of events) counts[event.eventType] = (counts[event.eventType] ?? 0) + 1
      return counts
    },
    async saveCandles(batch) {
      for (const candle of batch) {
        const key = `${candle.pairAddress.toLowerCase()}:${candle.interval}`
        const existing = candles.get(key) ?? []
        const map = new Map(existing.map((c) => [c.bucketTimestamp, c]))
        map.set(candle.bucketTimestamp, candle)
        candles.set(key, [...map.values()])
      }
    },
    async listCandles(pairAddress, interval, limit = 200) {
      const key = `${pairAddress.toLowerCase()}:${interval}`
      return (candles.get(key) ?? []).slice(-limit)
    },
  }
}

const storages = new Map<string, IndexerStorage>()

export function getTestIndexerStorage(slug: string): IndexerStorage {
  const existing = storages.get(slug)
  if (existing) return existing
  const created = createMemoryIndexerStorage()
  storages.set(slug, created)
  return created
}

export function resetTestIndexerStorages(): void {
  storages.clear()
}
