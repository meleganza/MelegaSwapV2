import { Transaction } from 'state/info/types'
import type { NormalizedIndexerEvent, OhlcvCandle } from '../types'
import { mapIndexerEventsToTransactions } from './mapIndexerEvents'

export interface DurableIndexerMeta {
  source: 'bsc-durable-indexer'
  status: 'ready' | 'empty' | 'unavailable' | 'loading'
  reason?: string
  lastIndexedBlock?: number
  chainHead?: number
  indexingLag?: number
  lastSuccessfulSync?: string
  eventCounts?: Record<string, number>
  storageBackend?: string
}

export interface DurableIndexerResponse {
  transactions: Transaction[]
  meta: DurableIndexerMeta
}

async function fetchBnbUsdHint(): Promise<number | undefined> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd',
      { headers: { accept: 'application/json' } },
    )
    if (!res.ok) return undefined
    const json = (await res.json()) as { binancecoin?: { usd?: number } }
    const usd = json.binancecoin?.usd
    return usd != null && Number.isFinite(usd) && usd > 0 ? usd : undefined
  } catch {
    return undefined
  }
}

export async function fetchDurableIndexerTransactions(params?: {
  pairAddress?: string
  limit?: number
  offset?: number
}): Promise<DurableIndexerResponse> {
  const empty = (meta: DurableIndexerMeta): DurableIndexerResponse => ({ transactions: [], meta })

  try {
    const qs = new URLSearchParams()
    if (params?.pairAddress) qs.set('pair', params.pairAddress)
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.offset) qs.set('offset', String(params.offset))

    const [eventsRes, healthRes] = await Promise.all([
      fetch(`/api/indexer/events?${qs.toString()}`),
      fetch('/api/indexer/health'),
    ])

    const healthJson = healthRes.ok ? await healthRes.json() : null
    const baseMeta: DurableIndexerMeta = {
      source: 'bsc-durable-indexer',
      status: 'unavailable',
      lastIndexedBlock: healthJson?.lastIndexedBlock,
      chainHead: healthJson?.chainHead,
      indexingLag: healthJson?.indexingLag,
      lastSuccessfulSync: healthJson?.lastSuccessfulSync,
      eventCounts: healthJson?.eventCounts,
      storageBackend: healthJson?.storageBackend,
    }

    if (!eventsRes.ok) {
      return empty({
        ...baseMeta,
        reason: healthJson?.lastFailureReason ?? `Indexer events API HTTP ${eventsRes.status}`,
      })
    }

    const [bnbUsd, payload] = await Promise.all([
      fetchBnbUsdHint(),
      eventsRes.json() as Promise<{
        status: string
        reason?: string
        events: NormalizedIndexerEvent[]
        meta?: { lastIndexedBlock?: number; indexingLag?: number; eventCounts?: Record<string, number> }
      }>,
    ])

    const transactions = mapIndexerEventsToTransactions(payload.events ?? [], { bnbUsd })
    const status =
      payload.status === 'ready' || transactions.length > 0
        ? 'ready'
        : payload.status === 'empty'
          ? 'empty'
          : 'unavailable'

    return {
      transactions,
      meta: {
        ...baseMeta,
        status,
        reason: payload.reason,
        lastIndexedBlock: payload.meta?.lastIndexedBlock ?? baseMeta.lastIndexedBlock,
        indexingLag: payload.meta?.indexingLag ?? baseMeta.indexingLag,
        eventCounts: payload.meta?.eventCounts ?? baseMeta.eventCounts,
      },
    }
  } catch (e) {
    return empty({
      source: 'bsc-durable-indexer',
      status: 'unavailable',
      reason: e instanceof Error ? e.message : 'Durable indexer request failed',
    })
  }
}

export async function fetchIndexerCandles(
  pairAddress: string,
  interval: OhlcvCandle['interval'] = '1H',
): Promise<{ status: string; candles: OhlcvCandle[]; reason?: string }> {
  try {
    const qs = new URLSearchParams({ pair: pairAddress, interval })
    const res = await fetch(`/api/indexer/candles?${qs.toString()}`)
    if (!res.ok) return { status: 'unavailable', candles: [], reason: `HTTP ${res.status}` }
    const json = (await res.json()) as { status: string; candles: OhlcvCandle[]; meta?: { reason?: string } }
    return { status: json.status, candles: json.candles ?? [], reason: json.meta?.reason }
  } catch (e) {
    return {
      status: 'unavailable',
      candles: [],
      reason: e instanceof Error ? e.message : 'Candle fetch failed',
    }
  }
}

export async function fetchAmmPairsPage(params: {
  q?: string
  page?: number
  pageSize?: number
  classification?: string
}) {
  const qs = new URLSearchParams()
  if (params.q) qs.set('q', params.q)
  if (params.page) qs.set('page', String(params.page))
  if (params.pageSize) qs.set('pageSize', String(params.pageSize))
  if (params.classification) qs.set('classification', params.classification)
  const res = await fetch(`/api/indexer/pairs?${qs.toString()}`)
  if (!res.ok) throw new Error(`Pairs API HTTP ${res.status}`)
  return res.json()
}
