import { describe, expect, it } from 'vitest'
import { reconcileMarcoWbnbG2, resolveMarcoWbnbTierRow } from '../reconciliation/g2Reconciliation'

describe('g2Reconciliation', () => {
  const fixtureRow = {
    slug: 'marco-wbnb',
    status: 'READY',
    tradeCount24h: 1,
    volume24hQuote: 0.000219538905014194,
    candleCount: 3,
    eventCount24h: 1,
  }

  it('resolves MARCO/WBNB from tierMetrics.body.rows', () => {
    const row = resolveMarcoWbnbTierRow({ rows: [fixtureRow] })
    expect(row.slug).toBe('marco-wbnb')
    expect(row.tradeCount24h).toBe(1)
  })

  it('fails when MARCO/WBNB row is absent', () => {
    expect(() => resolveMarcoWbnbTierRow({ rows: [] })).toThrow(/missing/)
  })

  it('marks READY when trade count and swaps align', () => {
    const result = reconcileMarcoWbnbG2({
      tierMetricsBody: { rows: [fixtureRow] },
      swapsBody: { transactions: [{}, {}, {}] },
      candlesBody: { candles: [{ quoteVolume: 0.005, tradeCount: 1 }] },
      storeConsistencyBody: { consistent: true },
      coverageBody: { bootstrapWindow: { complete: false, coveragePercent: 2.5 } },
    })
    expect(result.g2Status).toBe('READY')
    expect(result.failures).toHaveLength(0)
  })

  it('fails READY without durable data', () => {
    const result = reconcileMarcoWbnbG2({
      tierMetricsBody: { rows: [{ ...fixtureRow, status: 'READY' }] },
      swapsBody: { transactions: [] },
      candlesBody: { candles: [] },
      storeConsistencyBody: { consistent: true },
    })
    expect(result.g2Status).toBe('FAIL')
    expect(result.failures.length).toBeGreaterThan(0)
  })
})
