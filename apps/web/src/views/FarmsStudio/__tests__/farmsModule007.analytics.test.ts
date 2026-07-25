/**
 * FARMS_MODULE_007 — Analytics focused certification tests.
 */
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { FARMS_FOUNDER_MOCKUP } from '../farmsArchitecture000Contracts'
import {
  FARMS_ARCHITECTURE_000_TIP,
  FARMS_MODULE_001_FREEZE_SHA256,
  FARMS_MODULE_002_FREEZE_SHA256,
  FARMS_MODULE_003_FREEZE_SHA256,
  FARMS_MODULE_004_FREEZE_SHA256,
  FARMS_MODULE_005_FREEZE_SHA256,
  FARMS_MODULE_006_FREEZE_SHA256,
  FARMS_MODULE_006_TIP,
  farmsAnalytics,
} from '../modules/farmsAnalyticsTokens'
import { buildFarmsAnalyticsViewModel } from '../modules/buildFarmsAnalytics'
import type { FarmPreviewCard } from '../farmsStudioData'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')
const STUDIO = path.resolve(__dirname, '..')
const MODULES = path.join(STUDIO, 'modules')
const sha = (rel: string) => createHash('sha256').update(readFileSync(path.join(WEB, rel))).digest('hex')

function makeCard(partial: Partial<FarmPreviewCard> & { pid?: number } = {}): FarmPreviewCard {
  const pid = partial.pid ?? 1
  const rawPartial = (partial.rawFarm ?? {}) as Record<string, unknown>
  const { rawFarm: _drop, ...rest } = partial
  return {
    id: `farm-${pid}`,
    pair: 'MARCO / ASTER',
    tokens: ['MARCO', 'ASTER'],
    status: 'live',
    tvl: '—',
    dailyRewards: '—',
    multiplier: '1x',
    liquidity: '—',
    cta: 'stake',
    emissionState: 'active',
    rewardToken: 'MXMX',
    pid,
    rawFarm: {
      pid,
      multiplier: '1X',
      lpAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      token: { symbol: 'MARCO', decimals: 18 },
      quoteToken: { symbol: 'ASTER', decimals: 18 },
      earningToken: { symbol: 'MXMX', decimals: 18 },
      liquidity: { toNumber: () => 1000 },
      ...rawPartial,
    } as any,
    ...rest,
  }
}

describe('FARMS_MODULE_007 Analytics', () => {
  it('freezes Architecture 000 mockup SHA and certified tips', () => {
    const mockup = path.join(REPO, FARMS_FOUNDER_MOCKUP.relativePath)
    expect(existsSync(mockup)).toBe(true)
    const hash = createHash('sha256').update(readFileSync(mockup)).digest('hex')
    expect(hash).toBe(FARMS_FOUNDER_MOCKUP.sha256)
    expect(hash).toBe(farmsAnalytics.mockupSha256)
    expect(FARMS_ARCHITECTURE_000_TIP.startsWith('8edd68d4')).toBe(true)
    expect(FARMS_MODULE_006_TIP.startsWith('86c6c068')).toBe(true)
  })

  it('freezes Modules 001–006 sources byte-identically', () => {
    expect(sha('src/views/FarmsStudio/modules/FarmsHeroModule.tsx')).toBe(FARMS_MODULE_001_FREEZE_SHA256.FarmsHeroModule)
    expect(sha('src/views/FarmsStudio/modules/FarmsOverviewKpisModule.tsx')).toBe(
      FARMS_MODULE_002_FREEZE_SHA256.FarmsOverviewKpisModule,
    )
    expect(sha('src/views/FarmsStudio/modules/FarmsMyFarmsModule.tsx')).toBe(FARMS_MODULE_003_FREEZE_SHA256.FarmsMyFarmsModule)
    expect(sha('src/views/FarmsStudio/modules/FarmsExploreFarmsModule.tsx')).toBe(
      FARMS_MODULE_004_FREEZE_SHA256.FarmsExploreFarmsModule,
    )
    expect(sha('src/views/FarmsStudio/modules/FarmsFinishedFarmsModule.tsx')).toBe(
      FARMS_MODULE_005_FREEZE_SHA256.FarmsFinishedFarmsModule,
    )
    expect(sha('src/views/FarmsStudio/modules/FarmsYieldAdvisorModule.tsx')).toBe(
      FARMS_MODULE_006_FREEZE_SHA256.FarmsYieldAdvisorModule,
    )
    expect(sha('src/views/FarmsStudio/modules/FarmsYieldAdvisorCard.tsx')).toBe(
      FARMS_MODULE_006_FREEZE_SHA256.FarmsYieldAdvisorCard,
    )
    expect(sha('src/views/FarmsStudio/modules/buildFarmsYieldAdvisor.ts')).toBe(
      FARMS_MODULE_006_FREEZE_SHA256.buildFarmsYieldAdvisor,
    )
    expect(sha('src/views/FarmsStudio/modules/useFarmsYieldAdvisor.ts')).toBe(
      FARMS_MODULE_006_FREEZE_SHA256.useFarmsYieldAdvisor,
    )
    expect(sha('src/views/FarmsStudio/modules/farmsYieldAdvisorTokens.ts')).toBe(
      FARMS_MODULE_006_FREEZE_SHA256.farmsYieldAdvisorTokens,
    )
    expect(sha('src/views/FarmsStudio/modules/farmsYieldAdvisorTypes.ts')).toBe(
      FARMS_MODULE_006_FREEZE_SHA256.farmsYieldAdvisorTypes,
    )
  })

  it('mounts Module 007 after Yield Advisor; Modules 009–010 stay unmounted', () => {
    const screen = readFileSync(path.join(STUDIO, 'FarmsStudioScreen.tsx'), 'utf8')
    expect(screen).toContain('FarmsAnalyticsModule')
    expect(screen).toContain('data-farms-module-007="mounted"')
    expect(screen.indexOf('FarmsYieldAdvisorModule')).toBeLessThan(screen.indexOf('FarmsAnalyticsModule'))
    expect(screen).not.toContain('data-farms-module="009"')
    expect(screen).not.toContain('FarmsIntegrationModule')
  })

  it('desktop geometry tokens are 1376 × 240 with 18px gap and 330px panels', () => {
    expect(farmsAnalytics.contentMax).toBe('1376px')
    expect(farmsAnalytics.moduleH).toBe('240px')
    expect(farmsAnalytics.panelH).toBe('240px')
    expect(farmsAnalytics.panelGap).toBe('18px')
    expect(farmsAnalytics.panelW).toBe('330px')
    expect(330 * 4 + 18 * 3).toBe(1374)
    expect(farmsAnalytics.mobileContent390).toBe('358px')
    expect(farmsAnalytics.mobileContent430).toBe('398px')
  })

  it('Farm Distribution counts Active / Finished / Withdraw-only / Emergency factually', () => {
    const farms = [
      makeCard({ pid: 1, status: 'live' }),
      makeCard({ pid: 2, status: 'live', rewardToken: 'ASTER' }),
      makeCard({
        pid: 3,
        status: 'finished',
        cta: 'none',
        multiplier: '0x',
        rawFarm: {
          pid: 3,
          multiplier: '0X',
          enableEmergencyWithdraw: true,
          liquidity: { toNumber: () => 100 },
          earningToken: { symbol: 'MXMX' },
        } as any,
      }),
      makeCard({
        pid: 4,
        status: 'finished',
        cta: 'none',
        multiplier: '0x',
        rawFarm: {
          pid: 4,
          multiplier: '0X',
          enableEmergencyWithdraw: false,
          liquidity: { toNumber: () => 500 },
          earningToken: { symbol: 'MXMX' },
        } as any,
      }),
      makeCard({
        pid: 5,
        status: 'finished',
        cta: 'none',
        multiplier: '0x',
        rawFarm: {
          pid: 5,
          multiplier: '0X',
          enableEmergencyWithdraw: false,
          liquidity: { toNumber: () => 0 },
          earningToken: { symbol: 'MXMX' },
        } as any,
      }),
    ]
    const vm = buildFarmsAnalyticsViewModel({ portfolioFarms: farms, farmsLoading: false })
    expect(vm.totals.active).toBe(2)
    expect(vm.totals.emergency).toBe(1)
    expect(vm.totals.withdraw).toBe(1)
    expect(vm.totals.finished).toBe(1)
    const dist = vm.panels.find((p) => p.id === 'farm_distribution')!
    expect(dist.segments.map((s) => s.label)).toEqual([
      'Active Farms',
      'Finished Farms',
      'Withdraw-only',
      'Emergency',
    ])
  })

  it('Reward Distribution uses factual token shares only', () => {
    const farms = [
      makeCard({ pid: 1, rewardToken: 'MXMX' }),
      makeCard({ pid: 2, rewardToken: 'MXMX' }),
      makeCard({ pid: 3, rewardToken: 'ASTER' }),
    ]
    const vm = buildFarmsAnalyticsViewModel({ portfolioFarms: farms, farmsLoading: false })
    const reward = vm.panels.find((p) => p.id === 'reward_distribution')!
    const mxmx = reward.segments.find((s) => s.label === 'MXMX')!
    expect(mxmx.count).toBe(2)
    expect(mxmx.sharePct).toBeCloseTo((2 / 3) * 100, 5)
    expect(reward.stats.every((s) => s.value !== 'NaN%')).toBe(true)
  })

  it('No reward data marks Reward Distribution unavailable', () => {
    const farms = [
      makeCard({
        pid: 1,
        rewardToken: undefined,
        rawFarm: { pid: 1, multiplier: '1X', earningToken: undefined, liquidity: { toNumber: () => 1 } } as any,
      }),
    ]
    const vm = buildFarmsAnalyticsViewModel({ portfolioFarms: farms, farmsLoading: false })
    const reward = vm.panels.find((p) => p.id === 'reward_distribution')!
    expect(reward.state).toBe('unavailable')
    expect(reward.segments).toHaveLength(0)
  })

  it('Participation shows — for wallets and average position; no fake farmers', () => {
    const farms = [makeCard({ pid: 1 }), makeCard({ pid: 2 })]
    const vm = buildFarmsAnalyticsViewModel({ portfolioFarms: farms, farmsLoading: false })
    const part = vm.panels.find((p) => p.id === 'participation')!
    expect(part.stats.find((s) => s.id === 'wallets')?.value).toBe('—')
    expect(part.stats.find((s) => s.id === 'avg_position')?.value).toBe('—')
    expect(part.stats.find((s) => s.id === 'total_staked')?.value).not.toBe('—')
  })

  it('Partial valuation disclosure when some farms lack liquidity USD', () => {
    const farms = [
      makeCard({ pid: 1 }),
      makeCard({
        pid: 2,
        rawFarm: {
          pid: 2,
          multiplier: '1X',
          liquidity: { toNumber: () => 0 },
          lpTotalInQuoteToken: new BigNumber(1),
          earningToken: { symbol: 'MXMX' },
        } as any,
      }),
    ]
    const vm = buildFarmsAnalyticsViewModel({ portfolioFarms: farms, farmsLoading: false })
    const part = vm.panels.find((p) => p.id === 'participation')!
    expect(part.state).toBe('partial')
  })

  it('Farm Health includes emergency and indexing unavailable', () => {
    const farms = [
      makeCard({ pid: 1, emissionState: 'active' }),
      makeCard({ pid: 2, status: 'indexing', emissionState: 'unavailable' }),
      makeCard({
        pid: 3,
        status: 'finished',
        cta: 'none',
        rawFarm: {
          pid: 3,
          multiplier: '0X',
          enableEmergencyWithdraw: true,
          liquidity: { toNumber: () => 10 },
          earningToken: { symbol: 'MXMX' },
        } as any,
      }),
    ]
    const vm = buildFarmsAnalyticsViewModel({ portfolioFarms: farms, farmsLoading: false })
    expect(vm.totals.healthy).toBe(1)
    expect(vm.totals.unavailable).toBe(1)
    expect(vm.totals.emergency).toBe(1)
    const health = vm.panels.find((p) => p.id === 'farm_health')!
    expect(health.segments.map((s) => s.label)).toEqual(['Healthy', 'Partial', 'Unavailable', 'Emergency'])
  })

  it('No active farms still builds finished/emergency distribution', () => {
    const farms = [
      makeCard({
        pid: 1,
        status: 'finished',
        cta: 'none',
        rawFarm: {
          pid: 1,
          multiplier: '0X',
          enableEmergencyWithdraw: false,
          liquidity: { toNumber: () => 0 },
          earningToken: { symbol: 'MXMX' },
        } as any,
      }),
    ]
    const vm = buildFarmsAnalyticsViewModel({ portfolioFarms: farms, farmsLoading: false })
    expect(vm.totals.active).toBe(0)
    expect(vm.totals.finished).toBe(1)
    expect(vm.state).not.toBe('loading')
  })

  it('Unavailable when sources fail with empty inventory', () => {
    const vm = buildFarmsAnalyticsViewModel({
      portfolioFarms: [],
      farmsLoading: false,
      sourcesFailed: true,
    })
    expect(vm.state).toBe('unavailable')
    expect(vm.panels.every((p) => p.state === 'unavailable')).toBe(true)
  })

  it('Loading state uses skeleton panels', () => {
    const vm = buildFarmsAnalyticsViewModel({
      portfolioFarms: [],
      farmsLoading: true,
    })
    expect(vm.state).toBe('loading')
    expect(vm.panels).toHaveLength(4)
  })

  it('module uses factual engine only — no prediction / mock analytics', () => {
    const src = [
      readFileSync(path.join(MODULES, 'FarmsAnalyticsModule.tsx'), 'utf8'),
      readFileSync(path.join(MODULES, 'buildFarmsAnalytics.ts'), 'utf8'),
      readFileSync(path.join(MODULES, 'useFarmsAnalytics.ts'), 'utf8'),
      readFileSync(path.join(MODULES, 'FarmsAnalyticsPanel.tsx'), 'utf8'),
    ].join('\n')
    expect(src.toLowerCase()).not.toContain('openai')
    expect(src).not.toContain('predictedApr')
    expect(src).not.toContain('projectedTvl')
    expect(src).not.toContain('estimatedFarmers')
    expect(src).not.toContain('mockAnalytics')
    expect(src).not.toContain('illustrative')
    expect(src).toContain('prefers-reduced-motion')
    expect(src).toContain('styled.section')
    expect(src).toContain('styled.figure')
  })

  it('Module 006 Yield Advisor remains frozen', () => {
    expect(sha('src/views/FarmsStudio/modules/FarmsYieldAdvisorModule.tsx')).toBe(
      FARMS_MODULE_006_FREEZE_SHA256.FarmsYieldAdvisorModule,
    )
    expect(sha('src/views/FarmsStudio/modules/buildFarmsYieldAdvisor.ts')).toBe(
      FARMS_MODULE_006_FREEZE_SHA256.buildFarmsYieldAdvisor,
    )
  })
})
