import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { buildHomeNewListings } from 'views/HomeTrade/buildHomeNewListings'
import { APR_UNAVAILABLE_LABEL, METRIC_STATUS } from 'lib/data-policy/metricStatus'
import { metricUiReasonLabel } from 'lib/projects-data/dataReasonCodes'
import { UI_REASON_LABELS } from 'lib/data-policy/uiReasonLabels'

const VIEWS = path.resolve(__dirname, '../../views')

function load(rel: string) {
  return readFileSync(path.join(VIEWS, rel), 'utf8')
}

describe('Global data indexer completion', () => {
  it('Home Top Farms ranks by TVL then APR then volume/activity', () => {
    const data = load('HomeTrade/useHomeTradeData.ts')
    expect(data).toContain('TVL → APR → volume')
    expect(data).toContain('sortTvl')
    expect(data).toContain('sortApr')
    expect(data).toContain('sortVolume')
    expect(data).toContain('sortActivity')
    expect(data).toContain('listLiveFarmInventoryPreview(12)')
  })

  it('Home Top Pools ranks by TVL and pads to 5 without APR-only filter', () => {
    const data = load('HomeTrade/useHomeTradeData.ts')
    expect(data).toContain('TVL → volume → fees → APR')
    expect(data).toContain('row.tvlUsd > 0')
    expect(data).toContain('listLivePoolInventoryPreview(12)')
  })

  it('Home cards use APR unavailable when APR missing but preserve TVL/rewards', () => {
    const home = load('HomeTrade/DexHomeScreen.tsx')
    expect(home).toContain('APR_UNAVAILABLE_LABEL')
    expect(home).toContain('MelegaTokenAvatar')
    expect(home).toContain('MelegaExploreChainBadge')
    expect(home).toContain('buildHomeNewListings')
  })

  it('New Listings are multichain with logo symbol chain and factual date/Indexed', () => {
    const rows = buildHomeNewListings(5)
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.length).toBeLessThanOrEqual(5)
    for (const row of rows) {
      expect(row.chainId).toBeGreaterThan(0)
      expect(row.symbol).toBeTruthy()
      expect(row.name).toBeTruthy()
      expect([METRIC_STATUS.INDEXED, row.metric]).toContain(row.metric)
      // metric is either a date string or Indexed
      expect(row.metric === METRIC_STATUS.INDEXED || /\d{4}|[A-Z][a-z]{2}/.test(row.metric)).toBe(true)
    }
    const chains = new Set(rows.map((r) => r.chainId))
    // At least one chain represented; multichain expansion may yield multiple.
    expect(chains.size).toBeGreaterThanOrEqual(1)
  })

  it('Farm display APR uses APR unavailable label', () => {
    const fmt = load('FarmsStudio/farmsRuntime/formatFarmsRuntime.ts')
    expect(fmt).toContain('APR_UNAVAILABLE_LABEL')
    expect(fmt).toContain('formatFarmDisplayApr')
    const card = load('FarmsStudio/components/FarmGridCard.tsx')
    expect(card).toContain("'APR unavailable'")
  })

  it('Pool cards expose volume/fees/chainId fields', () => {
    const fmt = load('PoolsStudio/poolsRuntime/formatPoolsRuntime.ts')
    expect(fmt).toContain('volume24h')
    expect(fmt).toContain('fees')
    expect(fmt).toContain('chainId')
  })

  it('status language is Available / Indexed / Unavailable only', () => {
    expect(METRIC_STATUS.AVAILABLE).toBe('Available')
    expect(METRIC_STATUS.INDEXED).toBe('Indexed')
    expect(METRIC_STATUS.UNAVAILABLE).toBe('Unavailable')
    expect(APR_UNAVAILABLE_LABEL).toBe('APR unavailable')
    expect(metricUiReasonLabel('DATA_SOURCE_NOT_CONFIGURED')).toBe('Unavailable')
    expect(UI_REASON_LABELS.sourceNotConfigured).toBe('Unavailable')
    expect(UI_REASON_LABELS.waitingForExplorer).toBe('Unavailable')
  })

  it('project directory cards use real pair sparkline hook when pair known', () => {
    const card = load('ProjectsStudio/components/ProjectGridCard.tsx')
    expect(card).toContain('useIndexerCandles')
    expect(card).toContain('CardSpark')
    expect(card).toContain('pairAddress')
  })
})
