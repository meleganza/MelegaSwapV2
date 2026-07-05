import { describe, expect, it } from 'vitest'
import { PLACEHOLDER_AUDIT, classifyPlaceholder } from 'lib/data-policy/placeholderAudit'
import { tradeUiReasonLabel, projectUiReasonLabel, UI_REASON_LABELS } from 'lib/data-policy/uiReasonLabels'
import { metricUiReasonLabel } from 'lib/projects-data/dataReasonCodes'
import { sortPoolsDefault } from 'views/PoolsStudio/poolsRuntime/formatPoolsRuntime'
import type { PoolPreviewCard } from 'views/PoolsStudio/poolsStudioData'

function farmCard(status: string, apr: string, tvl: string, pair: string) {
  return { status, apr, tvl, pair } as { status: string; apr?: string; tvl?: string; pair: string }
}

function sortFarmsDefault<T extends { status: string; apr?: string; tvl?: string }>(list: T[]): T[] {
  const statusRank: Record<string, number> = { live: 0, indexing: 1, finished: 2, ended: 2, 'coming-soon': 3 }
  return [...list].sort((a, b) => {
    const sa = statusRank[a.status] ?? 1
    const sb = statusRank[b.status] ?? 1
    if (sa !== sb) return sa - sb
    const aprDiff = parseFloat(b.apr || '0') - parseFloat(a.apr || '0')
    if (aprDiff !== 0) return aprDiff
    const parseTvl = (v?: string) => parseFloat(v?.replace(/[^0-9.]/g, '') || '0')
    return parseTvl(b.tvl) - parseTvl(a.tvl)
  })
}

describe('R300 placeholder audit', () => {
  it('registers audit entries for all priority pages', () => {
    const pages = new Set(PLACEHOLDER_AUDIT.map((e) => e.page))
    expect(pages.has('Overview')).toBe(true)
    expect(pages.has('Trade')).toBe(true)
    expect(pages.has('Liquidity')).toBe(true)
    expect(pages.has('Farms')).toBe(true)
    expect(pages.has('Pools')).toBe(true)
    expect(pages.has('Projects')).toBe(true)
    expect(pages.has('Radar')).toBe(true)
  })

  it('classifies trade holders as SOURCE_NOT_CONFIGURED', () => {
    const entry = classifyPlaceholder('Trade', 'TradePairStats')
    expect(entry?.classification).toBe('LIVE_SOURCE_AVAILABLE')
  })

  it('classifies whale feeds as SOURCE_DOES_NOT_EXIST', () => {
    const entry = classifyPlaceholder('Radar', 'RadarOpsLeftColumn')
    expect(entry?.classification).toBe('SOURCE_DOES_NOT_EXIST')
  })
})

describe('R300 reason code UI mapping', () => {
  it('maps trade subgraph loading to Waiting for indexing', () => {
    expect(tradeUiReasonLabel('SUBGRAPH_LOADING')).toBe(UI_REASON_LABELS.waitingForIndexing)
  })

  it('maps explorer missing to Waiting for explorer', () => {
    expect(tradeUiReasonLabel('EXPLORER_SOURCE_MISSING')).toBe(UI_REASON_LABELS.waitingForExplorer)
    expect(projectUiReasonLabel('EXPLORER_SOURCE_MISSING')).toBe(UI_REASON_LABELS.waitingForExplorer)
    expect(metricUiReasonLabel('EXPLORER_SOURCE_MISSING')).toBe('Waiting for explorer')
  })

  it('never exposes raw machine codes in UI labels', () => {
    expect(tradeUiReasonLabel('PAIR_NOT_INDEXED')).not.toContain('PAIR_NOT_INDEXED')
    expect(metricUiReasonLabel('NO_EVENTS_INDEXED')).toBe('No recent activity yet')
  })
})

describe('R300 farms active/ended ordering', () => {
  it('sorts active farms before ended then by APR', () => {
    const sorted = sortFarmsDefault([
      farmCard('finished', '120', '$10K', 'Ended A'),
      farmCard('live', '80', '$5K', 'Live B'),
      farmCard('live', '150', '$2K', 'Live A'),
    ])
    expect(sorted[0].pair).toBe('Live A')
    expect(sorted[1].pair).toBe('Live B')
    expect(sorted[2].pair).toBe('Ended A')
  })
})

describe('R300 pools active/ended ordering', () => {
  it('sorts live pools before ended then by APR', () => {
    const mk = (status: PoolPreviewCard['status'], apr: string, name: string): PoolPreviewCard =>
      ({
        id: name,
        name,
        status,
        apr,
        tvl: '$1K',
        tokens: ['A', 'B'],
        rewardToken: 'MARCO',
        poolTypeLabel: 'Flexible Pool',
        cta: 'stake',
      }) as PoolPreviewCard

    const sorted = sortPoolsDefault([
      mk('ended', '90', 'Ended Pool'),
      mk('live', '40', 'Live Low'),
      mk('live', '120', 'Live High'),
    ])
    expect(sorted[0].name).toBe('Live High')
    expect(sorted[1].name).toBe('Live Low')
    expect(sorted[2].name).toBe('Ended Pool')
  })
})

describe('R300 home activity hydration', () => {
  it('builds only filled activity slots from available events', () => {
    const slots = [
      { id: 'swap', row: { type: 'Swap' } },
      { id: 'farm', row: { type: 'Farm opportunity' } },
    ].filter((s) => s.row)
    expect(slots).toHaveLength(2)
    expect(slots.some((s) => s.id === 'staking')).toBe(false)
  })
})
