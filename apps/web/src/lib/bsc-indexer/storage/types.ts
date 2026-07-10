import type { IndexerCheckpoint, IndexerHealthSnapshot, NormalizedIndexerEvent, OhlcvCandle } from '../types'

export interface IndexerStorage {
  readonly backend: string
  readonly configured: boolean
  loadCheckpoint(): Promise<IndexerCheckpoint | null>
  saveCheckpoint(checkpoint: IndexerCheckpoint): Promise<void>
  loadHealth(): Promise<IndexerHealthSnapshot | null>
  saveHealth(health: IndexerHealthSnapshot): Promise<void>
  appendEvents(events: NormalizedIndexerEvent[]): Promise<number>
  listEvents(query: {
    limit?: number
    offset?: number
    pairAddress?: string
    eventTypes?: string[]
    fromBlock?: number
  }): Promise<NormalizedIndexerEvent[]>
  countEvents(): Promise<Record<string, number>>
  saveCandles(candles: OhlcvCandle[]): Promise<void>
  listCandles(pairAddress: string, interval: OhlcvCandle['interval'], limit?: number): Promise<OhlcvCandle[]>
}
