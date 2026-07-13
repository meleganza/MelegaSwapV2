import { featuredPairPrefix } from '../v2/paths'

export interface MarcoWbnbTierRow {
  slug: string
  status?: string
  tradeCount24h?: number
  volume24hQuote?: number
  candleCount?: number
  eventCount24h?: number
}

export interface G2ReconciliationInput {
  tierMetricsBody: { rows?: MarcoWbnbTierRow[] }
  swapsBody: { transactions?: unknown[] }
  candlesBody: { candles?: Array<{ quoteVolume?: number; baseVolume?: number; tradeCount?: number }> }
  storeConsistencyBody?: { canonicalNamespace?: string; consistent?: boolean }
  coverageBody?: { bootstrapWindow?: { complete?: boolean; coveragePercent?: number } }
}

export interface G2ReconciliationResult {
  slug: string
  namespace: string
  status: string
  tradeCount24h: number
  volume24hQuote: number
  eventCount24h: number
  swapRowsTotal: number
  swapsIn24hWindow: number
  candleCount: number
  candleVolumeTotal: number
  coverageComplete: boolean
  coveragePercent: number
  storeConsistent: boolean
  g2Status: 'READY' | 'EMPTY_VERIFIED' | 'PARTIAL' | 'FAIL'
  failures: string[]
}

const MARCO_WBNB_NAMESPACE = featuredPairPrefix('marco-wbnb')

export function resolveMarcoWbnbTierRow(body: { rows?: MarcoWbnbTierRow[] }): MarcoWbnbTierRow {
  const row = body.rows?.find((r) => r.slug === 'marco-wbnb')
  if (!row) {
    throw new Error('MARCO/WBNB row missing from tierMetrics.body.rows')
  }
  return row
}

export function reconcileMarcoWbnbG2(input: G2ReconciliationInput): G2ReconciliationResult {
  const failures: string[] = []
  const row = resolveMarcoWbnbTierRow(input.tierMetricsBody)
  const swapRows = input.swapsBody.transactions ?? []
  const candleRows = input.candlesBody.candles ?? []
  const tradeCount24h = row.tradeCount24h ?? 0
  const volume24hQuote = row.volume24hQuote ?? 0
  const eventCount24h = row.eventCount24h ?? 0
  const candleVolumeTotal = candleRows.reduce(
    (sum, c) => sum + (c.quoteVolume ?? c.baseVolume ?? 0),
    0,
  )
  const coverageComplete = Boolean(input.coverageBody?.bootstrapWindow?.complete)
  const coveragePercent = input.coverageBody?.bootstrapWindow?.coveragePercent ?? 0
  const storeConsistent = input.storeConsistencyBody?.consistent !== false

  if (row.status === 'READY' && swapRows.length === 0 && candleRows.length === 0) {
    failures.push('READY without durable swap/candle data')
  }
  if (tradeCount24h > 0 && eventCount24h === 0) {
    failures.push('tradeCount24h > 0 but eventCount24h is zero')
  }
  if (volume24hQuote > 0 && candleVolumeTotal === 0) {
    failures.push('volume24hQuote > 0 but candle volume is zero')
  }
  if (!storeConsistent) {
    failures.push('store consistency mismatch across namespaces')
  }

  let g2Status: G2ReconciliationResult['g2Status'] = 'PARTIAL'
  if (failures.length) {
    g2Status = 'FAIL'
  } else if (tradeCount24h > 0 && swapRows.length > 0 && candleRows.length >= 1) {
    g2Status = 'READY'
  } else if (tradeCount24h === 0 && swapRows.length === 0 && candleRows.length === 0) {
    g2Status = 'EMPTY_VERIFIED'
  }

  return {
    slug: 'marco-wbnb',
    namespace: MARCO_WBNB_NAMESPACE,
    status: row.status ?? 'UNKNOWN',
    tradeCount24h,
    volume24hQuote,
    eventCount24h,
    swapRowsTotal: swapRows.length,
    swapsIn24hWindow: tradeCount24h,
    candleCount: candleRows.length,
    candleVolumeTotal,
    coverageComplete,
    coveragePercent,
    storeConsistent,
    g2Status,
    failures,
  }
}
