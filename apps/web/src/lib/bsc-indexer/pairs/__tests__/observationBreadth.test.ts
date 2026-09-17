import { readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'
import { MAX_AMM_PAIRS_PAGE_SIZE, resolveAmmPairsPageSize } from '../registry'
import { paginatePairs } from '../classify'

const registrySrc = readFileSync(join(__dirname, '../registry.ts'), 'utf8')
const trendingSrc = readFileSync(join(__dirname, '../../../../views/HomeTrade/useDexTrendingRankings.ts'), 'utf8')
const producerSrc = readFileSync(join(__dirname, '../../../trending/buildServerTopMoversSnapshot.ts'), 'utf8')

describe('market observation pair-page breadth', () => {
  it('honors the Factory-universe page size instead of silently capping at 100', () => {
    expect(MAX_AMM_PAIRS_PAGE_SIZE).toBeGreaterThanOrEqual(500)
    expect(resolveAmmPairsPageSize(undefined)).toBe(50)
    expect(resolveAmmPairsPageSize(500)).toBe(500)
    expect(resolveAmmPairsPageSize(10_000)).toBe(MAX_AMM_PAIRS_PAGE_SIZE)
    expect(resolveAmmPairsPageSize(-1)).toBe(50)
    expect(registrySrc).not.toMatch(/Math\.min\(100,\s*params\.pageSize/)
    expect(registrySrc).toContain('resolveAmmPairsPageSize')
  })

  it('returns the requested page of a 505-row tradeable universe instead of the first 100 only', () => {
    const rows = Array.from({ length: 505 }, (_, i) => ({ id: i }))
    const capped = paginatePairs(rows, 1, resolveAmmPairsPageSize(500))
    expect(capped.total).toBe(505)
    expect(capped.pageSize).toBe(500)
    expect(capped.rows).toHaveLength(500)
    expect(capped.rows[0]).toEqual({ id: 0 })
    expect(capped.rows[499]).toEqual({ id: 499 })
  })

  it('client pair loader follows total across pages and server Top Movers includes Factory bases', () => {
    expect(trendingSrc).toContain('pageSize=${TRADEABLE_PAIRS_PAGE_SIZE}')
    expect(trendingSrc).toContain('TRADEABLE_PAIRS_MAX_PAGES')
    expect(trendingSrc).toMatch(/json\.total/)
    expect(producerSrc).toContain('collectTradeableObservationAddresses')
    expect(producerSrc).toContain('loadClassifiedAmmPairsAsync')
    expect(producerSrc).toContain('mergeObservationAddresses')
  })
})
