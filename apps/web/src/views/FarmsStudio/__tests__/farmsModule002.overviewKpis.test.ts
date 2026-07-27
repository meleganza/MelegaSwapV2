/**
 * FARMS_MODULE_002 — Overview KPIs factual rules + Module 001 freeze guards.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import BigNumber from 'bignumber.js'
import { FARMS_FOUNDER_MOCKUP } from '../farmsArchitecture000Contracts'
import { farmsHero } from '../modules/farmsHeroTokens'
import {
  FARMS_MODULE_001_FREEZE_SHA256,
  FARMS_OVERVIEW_KPI_ORDER,
  farmsOverviewKpis,
} from '../modules/farmsOverviewKpisTokens'
import { buildFarmsOverviewKpisFromParts } from '../modules/buildFarmsOverviewKpis'
// Prefer pure builder import — avoids Redux/pools circular init in Vitest.
import type { FarmPreviewCard } from '../farmsStudioData'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')
const STUDIO = path.resolve(__dirname, '..')

function shaFile(relFromStudio: string) {
  return createHash('sha256').update(readFileSync(path.join(STUDIO, relFromStudio))).digest('hex')
}

function farmCard(partial: Partial<FarmPreviewCard> & { pid?: number; liq?: number; aprExact?: number }): FarmPreviewCard {
  const pid = partial.pid ?? 1
  const liq = partial.liq ?? 1000
  return {
    id: `farm-${pid}`,
    pid,
    pair: partial.pair ?? `T${pid} / MARCO`,
    tokens: partial.tokens ?? ['T', 'MARCO'],
    apr: partial.apr ?? '12.00%',
    displayApr: partial.displayApr ?? partial.apr ?? '12.00%',
    status: partial.status ?? 'live',
    tvl: partial.tvl ?? '$1K',
    liquidity: partial.liquidity ?? '$1K',
    dailyRewards: partial.dailyRewards ?? '—',
    multiplier: partial.multiplier ?? '1x',
    cta: partial.cta ?? 'stake',
    emissionState: partial.emissionState ?? 'active',
    pendingReward: partial.pendingReward,
    rawFarm: partial.rawFarm ?? ({
      pid,
      multiplier: partial.multiplier === '—' ? '0X' : '1X',
      liquidity: new BigNumber(liq),
      lpTotalInQuoteToken: '1',
      quoteTokenPriceBusd: '1',
      earningToken: { decimals: 18, symbol: 'MARCO' },
      userData: partial.pendingReward ? { earnings: partial.pendingReward } : undefined,
      apr: partial.aprExact ?? 12,
      lpRewardsApr: 0,
    } as FarmPreviewCard['rawFarm']),
    ...partial,
  }
}

describe('FARMS_MODULE_002 Overview KPIs', () => {
  it('keeps Architecture 000 mockup and Module 001 Hero sources byte-frozen', () => {
    const mockupPath = path.join(REPO, FARMS_FOUNDER_MOCKUP.relativePath)
    expect(existsSync(mockupPath)).toBe(true)
    const mockSha = createHash('sha256').update(readFileSync(mockupPath)).digest('hex')
    expect(mockSha).toBe(FARMS_FOUNDER_MOCKUP.sha256)
    expect(farmsOverviewKpis.mockupSha256).toBe(mockSha)
    expect(farmsHero.mockupSha256).toBe(mockSha)

    expect(shaFile('modules/FarmsHeroModule.tsx')).toBe(FARMS_MODULE_001_FREEZE_SHA256.FarmsHeroModule)
    expect(shaFile('modules/FarmsHeroArtwork.tsx')).toBe(FARMS_MODULE_001_FREEZE_SHA256.FarmsHeroArtwork)
    expect(shaFile('modules/FarmsHeroTrustPanel.tsx')).toBe(FARMS_MODULE_001_FREEZE_SHA256.FarmsHeroTrustPanel)
    expect(shaFile('modules/farmsHeroTokens.ts')).toBe(FARMS_MODULE_001_FREEZE_SHA256.farmsHeroTokens)

    const hero = readFileSync(path.join(STUDIO, 'modules/FarmsHeroModule.tsx'), 'utf8')
    expect(hero).toContain('data-farms-module="001"')
    expect(hero).toContain('1376x260')
  })

  it('locks six-card order and desktop geometry contracts', () => {
    expect([...FARMS_OVERVIEW_KPI_ORDER]).toEqual([
      'tvl',
      'activeFarms',
      'activeFarmers',
      'rewards24h',
      'sustainableApr',
      'harvestable',
    ])
    expect(farmsOverviewKpis.moduleW).toBe('1376px')
    expect(farmsOverviewKpis.moduleH).toBe('112px')
    expect(farmsOverviewKpis.cardW).toBe('216px')
    expect(farmsOverviewKpis.cardH).toBe('112px')
    expect(farmsOverviewKpis.cardGap).toBe('16px')
    expect(216 * 6 + 16 * 5).toBe(1376)
  })

  it('shows 24H rewards from factual MasterChef emission schedule', () => {
    const vm = buildFarmsOverviewKpisFromParts({
      previewCards: [farmCard({ pid: 1, liq: 5000, apr: '20.00%' })],
      farmsLoading: false,
      userDataLoaded: true,
      account: '0xabc',
      cakePriceUsd: 1,
      emissionPerDayMarco: 1200,
      emissionStatus: 'ready',
    })
    const r24 = vm.cards.find((c) => c.id === 'rewards24h')!
    expect(r24.value).toBe('$1.2K')
    expect(r24.supporting).toMatch(/emission/i)
    expect(vm.diagnostics.rewards24hSource).toBe('masterchef_emission_per_block')
    expect(vm.diagnostics.emissionNotUsedAs24h).toBe(false)
  })

  it('keeps 24H rewards unavailable when emission missing', () => {
    const vm = buildFarmsOverviewKpisFromParts({
      previewCards: [farmCard({ pid: 1, liq: 5000, apr: '20.00%' })],
      farmsLoading: false,
      userDataLoaded: true,
      account: '0xabc',
      cakePriceUsd: 1,
      emissionStatus: 'unavailable',
      emissionReason: 'MasterChef emission unavailable',
    })
    const r24 = vm.cards.find((c) => c.id === 'rewards24h')!
    expect(r24.value).toBe('—')
    expect(r24.supporting).toMatch(/unavailable/i)
    expect(vm.diagnostics.emissionNotUsedAs24h).toBe(true)
  })

  it('never invents Active Farmers without indexed wallets', () => {
    const vm = buildFarmsOverviewKpisFromParts({
      previewCards: [farmCard({ pid: 1, liq: 5000 })],
      farmsLoading: false,
      userDataLoaded: false,
      cakePriceUsd: 0,
    })
    const farmers = vm.cards.find((c) => c.id === 'activeFarmers')!
    expect(farmers.value).toBe('—')
    expect(farmers.supporting).toContain('Unique wallet data unavailable')
    expect(vm.diagnostics.activeFarmersCount).toBeNull()
  })

  it('displays Active Farmers from indexed MasterChef wallets', () => {
    const vm = buildFarmsOverviewKpisFromParts({
      previewCards: [farmCard({ pid: 1, liq: 5000 })],
      farmsLoading: false,
      userDataLoaded: false,
      cakePriceUsd: 0,
      activeFarmersCount: 7,
      activeFarmersStatus: 'partial',
      activeFarmersReason: 'Indexed MasterChef activity window',
    })
    const farmers = vm.cards.find((c) => c.id === 'activeFarmers')!
    expect(farmers.value).toBe('7')
    expect(vm.diagnostics.activeFarmersCount).toBe(7)
  })

  it('sums LP farm TVL only and discloses partial valuation', () => {
    const vm = buildFarmsOverviewKpisFromParts({
      previewCards: [
        farmCard({ pid: 1, liq: 2000 }),
        farmCard({
          pid: 2,
          liq: 0,
          rawFarm: {
            pid: 2,
            multiplier: '1X',
            liquidity: new BigNumber(0),
            lpTotalInQuoteToken: '10',
            quoteTokenPriceBusd: undefined,
            earningToken: { decimals: 18, symbol: 'MARCO' },
          } as FarmPreviewCard['rawFarm'],
        }),
        farmCard({ pid: 0, liq: 999999 }), // excluded non-LP pid
      ],
      farmsLoading: false,
      userDataLoaded: false,
      cakePriceUsd: 0,
    })
    const tvl = vm.cards.find((c) => c.id === 'tvl')!
    expect(tvl.state).toBe('partial')
    expect(tvl.value).not.toBe('$0.00')
    expect(tvl.supporting).toMatch(/Partial/)
    expect(vm.diagnostics.poolsTvlNotIncluded).toBe(true)
  })

  it('counts only currently farmable Active Farms', () => {
    const vm = buildFarmsOverviewKpisFromParts({
      previewCards: [
        farmCard({ pid: 1, status: 'live' }),
        farmCard({ pid: 2, status: 'finished', multiplier: '—', rawFarm: { pid: 2, multiplier: '0X', liquidity: new BigNumber(1) } as FarmPreviewCard['rawFarm'] }),
        farmCard({ pid: 0, status: 'live', liq: 100 }),
      ],
      farmsLoading: false,
      userDataLoaded: false,
      cakePriceUsd: 0,
    })
    expect(vm.cards.find((c) => c.id === 'activeFarms')!.value).toBe('1')
  })

  it('picks highest sustainable APR among rewarding live farms with liquidity', () => {
    const vm = buildFarmsOverviewKpisFromParts({
      previewCards: [
        farmCard({ pid: 1, pair: 'A / MARCO', apr: '12.00%', aprExact: 12, liq: 1000 }),
        farmCard({ pid: 2, pair: 'B / MARCO', apr: '28.50%', aprExact: 28.5, liq: 2000 }),
        farmCard({
          pid: 3,
          pair: 'Ended / MARCO',
          apr: '99.00%',
          status: 'finished',
          emissionState: 'inactive',
          rawFarm: { pid: 3, multiplier: '0X', liquidity: new BigNumber(1) } as FarmPreviewCard['rawFarm'],
        }),
      ],
      farmsLoading: false,
      userDataLoaded: false,
      cakePriceUsd: 0,
    })
    const apr = vm.cards.find((c) => c.id === 'sustainableApr')!
    expect(apr.value).toBe('28.50%')
    expect(apr.supporting).toBe('B / MARCO')
  })

  it('handles harvestable disconnected / zero / valued', () => {
    const disconnected = buildFarmsOverviewKpisFromParts({
      previewCards: [],
      farmsLoading: false,
      userDataLoaded: false,
      cakePriceUsd: 1,
    })
    expect(disconnected.cards.find((c) => c.id === 'harvestable')!.supporting).toBe('Connect wallet')

    const zero = buildFarmsOverviewKpisFromParts({
      previewCards: [farmCard({ pid: 1 })],
      account: '0x1',
      userDataLoaded: true,
      farmsLoading: false,
      cakePriceUsd: 2,
    })
    expect(zero.cards.find((c) => c.id === 'harvestable')!.value).toBe('$0.00')
    expect(zero.cards.find((c) => c.id === 'harvestable')!.supporting).toBe('No harvest')

    const valued = buildFarmsOverviewKpisFromParts({
      previewCards: [
        farmCard({
          pid: 1,
          pendingReward: new BigNumber('1000000000000000000'),
        }),
      ],
      account: '0x1',
      userDataLoaded: true,
      farmsLoading: false,
      cakePriceUsd: 2,
    })
    const h = valued.cards.find((c) => c.id === 'harvestable')!
    expect(h.value).toMatch(/^\$2(\.00)?$/)
    expect(h.supporting).toContain('1 farm')
  })

  it('keeps KPI failures independent (module still returns six cards)', () => {
    const vm = buildFarmsOverviewKpisFromParts({
      previewCards: [],
      farmsLoading: false,
      userDataLoaded: false,
      cakePriceUsd: 0,
    })
    expect(vm.cards).toHaveLength(6)
    expect(vm.cards.every((c) => typeof c.value === 'string')).toBe(true)
    expect(vm.cards.find((c) => c.id === 'activeFarmers')!.state).toBe('unavailable')
    expect(vm.cards.find((c) => c.id === 'rewards24h')!.state).toBe('unavailable')
  })

  it('mounts Module 002 before Module 003 without Modules 004–010', () => {
    const screen = readFileSync(path.join(STUDIO, 'FarmsStudioScreen.tsx'), 'utf8')
    expect(screen).toContain('FarmsHeroModule')
    expect(screen).toContain('FarmsOverviewKpisModule')
    expect(screen.indexOf('FarmsHeroModule')).toBeLessThan(screen.indexOf('FarmsOverviewKpisModule'))
    expect(screen).not.toContain('FarmsKpiRow')
    expect(screen).toContain('data-farms-module-002="mounted"')
    expect(screen).toContain('data-farms-module-003="mounted"')
    expect(screen).toContain('FarmsMyFarmsModule')
    for (const id of ['004', '005', '006', '007', '008', '009', '010']) {
      expect(screen).not.toContain(`data-farms-module="${id}"`)
    }
  })

  it('does not ship mock KPI dollar fixtures or emission-as-24h in Module 002 sources', () => {
    const src = [
      readFileSync(path.join(STUDIO, 'modules/FarmsOverviewKpisModule.tsx'), 'utf8'),
      readFileSync(path.join(STUDIO, 'modules/useFarmsOverviewKpis.ts'), 'utf8'),
      readFileSync(path.join(STUDIO, 'modules/farmsOverviewKpisTokens.ts'), 'utf8'),
    ].join('\n')
    expect(src).not.toContain('$24.56')
    expect(src).not.toContain('formatTotalDailyEmissionKpi')
    expect(src).not.toContain('useMasterChefEmission')
  })

  it('ownership map records Module 002 file assignment', () => {
    const map = readFileSync(path.join(WEB, 'docs/runtime/FARMS_MODULE_OWNERSHIP_MAP.md'), 'utf8')
    expect(map).toContain('FarmsOverviewKpisModule.tsx')
    expect(map).toContain('useFarmsOverviewKpis.ts')
    expect(map).toContain('farms-module-002-overview-kpis')
  })
})
