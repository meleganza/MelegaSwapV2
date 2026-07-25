/**
 * POOLS_MODULE_007 — Analytics focused certification tests.
 */
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import BigNumber from 'bignumber.js'
import { buildPoolsAnalyticsViewModel } from '../modules/buildPoolsAnalytics'
import {
  POOLS_MODULE_001_FREEZE_SHA256,
  POOLS_MODULE_002_FREEZE_SHA256,
  POOLS_MODULE_003_FREEZE_SHA256,
  POOLS_MODULE_004_FREEZE_SHA256,
  POOLS_MODULE_005_FREEZE_SHA256,
  POOLS_MODULE_006_FREEZE_SHA256,
  poolsAnalytics,
} from '../modules/poolsAnalyticsTokens'
import { POOLS_FOUNDER_MOCKUP } from '../poolsArchitecture000Contracts'
import type { PoolPreviewCard } from '../poolsStudioData'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')
const STUDIO = path.resolve(__dirname, '..')
const MODULES = path.join(STUDIO, 'modules')

function sha256File(relFromWeb: string): string {
  return createHash('sha256').update(readFileSync(path.join(WEB, relFromWeb))).digest('hex')
}

function makeCard(partial: Partial<PoolPreviewCard> & { id: string }): PoolPreviewCard {
  return {
    name: partial.name ?? 'Analytics Pool',
    tokens: partial.tokens ?? ['MARCO', 'ASTER'],
    stakeToken: partial.stakeToken ?? 'MARCO',
    rewardToken: partial.rewardToken ?? 'ASTER',
    tvl: partial.tvl ?? '—',
    dailyRewards: partial.dailyRewards ?? '—',
    participants: partial.participants ?? '—',
    status: partial.status ?? 'live',
    displayStatus: partial.displayStatus ?? 'LIVE',
    cta: partial.cta ?? 'stake',
    sousId: partial.sousId ?? 1,
    estimatedDuration: partial.estimatedDuration ?? '—',
    rawPool: partial.rawPool ?? ({
      stakingToken: { symbol: 'MARCO', decimals: 18, address: '0xmarco' },
      earningToken: { symbol: 'ASTER', decimals: 18, address: '0xaster' },
      stakingTokenPrice: 1,
      totalStaked: new BigNumber('1000000000000000000'),
    } as any),
    ...partial,
  }
}

describe('POOLS_MODULE_007 Analytics', () => {
  it('freezes Architecture 000 mockup SHA', () => {
    const mockup = path.join(REPO, POOLS_FOUNDER_MOCKUP.relativePath)
    expect(existsSync(mockup)).toBe(true)
    const hash = createHash('sha256').update(readFileSync(mockup)).digest('hex')
    expect(hash).toBe(POOLS_FOUNDER_MOCKUP.sha256)
    expect(hash).toBe(poolsAnalytics.mockupSha256)
  })

  it('freezes Modules 001–006 sources byte-identically', () => {
    expect(sha256File('src/views/PoolsStudio/modules/PoolsHeroModule.tsx')).toBe(
      POOLS_MODULE_001_FREEZE_SHA256.PoolsHeroModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsOverviewKpisModule.tsx')).toBe(
      POOLS_MODULE_002_FREEZE_SHA256.PoolsOverviewKpisModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsMyPositionsModule.tsx')).toBe(
      POOLS_MODULE_003_FREEZE_SHA256.PoolsMyPositionsModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsExplorePoolsModule.tsx')).toBe(
      POOLS_MODULE_004_FREEZE_SHA256.PoolsExplorePoolsModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsFinishedPoolsModule.tsx')).toBe(
      POOLS_MODULE_005_FREEZE_SHA256.PoolsFinishedPoolsModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsRewardAdvisorModule.tsx')).toBe(
      POOLS_MODULE_006_FREEZE_SHA256.PoolsRewardAdvisorModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/buildPoolsRewardAdvisor.ts')).toBe(
      POOLS_MODULE_006_FREEZE_SHA256.buildPoolsRewardAdvisor,
    )
    expect(sha256File('src/views/PoolsStudio/modules/usePoolsRewardAdvisor.ts')).toBe(
      POOLS_MODULE_006_FREEZE_SHA256.usePoolsRewardAdvisor,
    )
    expect(sha256File('src/views/PoolsStudio/modules/poolsRewardAdvisorTokens.ts')).toBe(
      POOLS_MODULE_006_FREEZE_SHA256.poolsRewardAdvisorTokens,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsRewardAdvisorCard.tsx')).toBe(
      POOLS_MODULE_006_FREEZE_SHA256.PoolsRewardAdvisorCard,
    )
    expect(sha256File('src/views/PoolsStudio/modules/poolsRewardAdvisorTypes.ts')).toBe(
      POOLS_MODULE_006_FREEZE_SHA256.poolsRewardAdvisorTypes,
    )
  })

  it('mounts Module 007 after Reward Advisor; Modules 008–010 stay unmounted', () => {
    const screen = readFileSync(path.join(STUDIO, 'PoolsStudioScreen.tsx'), 'utf8')
    expect(screen).toContain('PoolsAnalyticsModule')
    expect(screen).toContain('data-pools-module-007="mounted"')
    expect(screen.indexOf('PoolsRewardAdvisorModule')).toBeLessThan(screen.indexOf('PoolsAnalyticsModule'))
    expect(screen).not.toContain('data-pools-module="008"')
    expect(screen).not.toContain('PoolsVisualPolishModule')
  })

  it('desktop geometry tokens are 1376 × 240 with 18px gap', () => {
    expect(poolsAnalytics.contentMax).toBe('1376px')
    expect(poolsAnalytics.moduleH).toBe('240px')
    expect(poolsAnalytics.panelH).toBe('240px')
    expect(poolsAnalytics.panelGap).toBe('18px')
    expect(poolsAnalytics.panelW).toBe('330.5px')
  })

  it('Pool Distribution counts Active / Ended / Emergency / Withdraw factually', () => {
    const pools = [
      makeCard({ id: 'a1', status: 'live', displayStatus: 'LIVE' }),
      makeCard({ id: 'a2', status: 'live', displayStatus: 'LIVE', rewardToken: 'MARCO' }),
      makeCard({
        id: 'e1',
        status: 'ended',
        displayStatus: 'ENDED',
        rawPool: {
          stakingToken: { symbol: 'MARCO', decimals: 18, address: '0xm' },
          earningToken: { symbol: 'ASTER', decimals: 18, address: '0xa' },
          enableEmergencyWithdraw: true,
          totalStaked: new BigNumber('1'),
        } as any,
      }),
      makeCard({
        id: 'w1',
        status: 'ended',
        displayStatus: 'ENDED',
        rawPool: {
          stakingToken: { symbol: 'RARI', decimals: 18, address: '0xr' },
          earningToken: { symbol: 'MARCO', decimals: 18, address: '0xm' },
          totalStaked: new BigNumber('1000000000000000000'),
          stakingTokenPrice: 1,
        } as any,
      }),
      makeCard({
        id: 'd1',
        status: 'ended',
        displayStatus: 'ENDED',
        rawPool: {
          stakingToken: { symbol: 'X', decimals: 18, address: '0xx' },
          earningToken: { symbol: 'Y', decimals: 18, address: '0xy' },
          totalStaked: new BigNumber(0),
        } as any,
      }),
    ]
    const vm = buildPoolsAnalyticsViewModel({
      portfolioPools: pools,
      poolsLoading: false,
    })
    expect(vm.totals.active).toBe(2)
    expect(vm.totals.emergency).toBe(1)
    expect(vm.totals.withdraw).toBe(1)
    expect(vm.totals.ended).toBe(1)
    const dist = vm.panels.find((p) => p.id === 'pool_distribution')!
    expect(dist.segments.map((s) => s.label)).toEqual(['Active', 'Ended', 'Emergency', 'Withdraw'])
  })

  it('Reward Distribution uses factual token shares only', () => {
    const pools = [
      makeCard({ id: '1', rewardToken: 'ASTER' }),
      makeCard({ id: '2', rewardToken: 'ASTER' }),
      makeCard({ id: '3', rewardToken: 'MARCO' }),
    ]
    const vm = buildPoolsAnalyticsViewModel({ portfolioPools: pools, poolsLoading: false })
    const reward = vm.panels.find((p) => p.id === 'reward_distribution')!
    const aster = reward.segments.find((s) => s.label === 'ASTER')!
    expect(aster.count).toBe(2)
    expect(aster.sharePct).toBeCloseTo((2 / 3) * 100, 5)
    expect(reward.stats.every((s) => s.value !== 'NaN%')).toBe(true)
  })

  it('Participation shows — for unavailable wallet census; no fake averages', () => {
    const noPrice = makeCard({
      id: 'np',
      rawPool: {
        stakingToken: { symbol: 'MARCO', decimals: 18, address: '0xm' },
        earningToken: { symbol: 'ASTER', decimals: 18, address: '0xa' },
        totalStaked: new BigNumber('1000000000000000000'),
        stakingTokenPrice: 0,
      } as any,
    })
    const vm = buildPoolsAnalyticsViewModel({ portfolioPools: [noPrice], poolsLoading: false })
    const part = vm.panels.find((p) => p.id === 'participation')!
    expect(part.stats.find((s) => s.id === 'wallets')?.value).toBe('—')
    expect(part.stats.find((s) => s.id === 'avg_stake')?.value).toBe('—')
    expect(part.stats.find((s) => s.id === 'avg_pool')?.value).toBe('—')
  })

  it('Pool Health reports Healthy / Partial / Unavailable / Rewarding', () => {
    const pools = [
      makeCard({
        id: 'h',
        lifecycle: { rewarding: true, active: true, funded: true } as any,
      }),
      makeCard({
        id: 'p',
        lifecycle: { rewarding: false, active: true } as any,
        rawPool: {
          stakingToken: { symbol: 'MARCO', decimals: 18, address: '0xm' },
          earningToken: { symbol: 'ASTER', decimals: 18, address: '0xa' },
          totalStaked: new BigNumber('1'),
          stakingTokenPrice: 0,
        } as any,
      }),
      makeCard({
        id: 'u',
        hiddenReason: 'indexing',
        displayStatus: 'INDEXING',
        lifecycle: { rewarding: false } as any,
      }),
    ]
    const vm = buildPoolsAnalyticsViewModel({
      portfolioPools: pools,
      poolsLoading: false,
      classificationRewarding: 1,
    })
    expect(vm.totals.rewarding).toBe(1)
    const health = vm.panels.find((p) => p.id === 'pool_health')!
    expect(health.stats.map((s) => s.label)).toEqual(['Healthy', 'Partial', 'Unavailable', 'Rewarding'])
    expect(health.state === 'partial' || health.state === 'ready').toBe(true)
  })

  it('Unavailable when sources fail with empty inventory', () => {
    const vm = buildPoolsAnalyticsViewModel({
      portfolioPools: [],
      poolsLoading: false,
      sourcesFailed: true,
    })
    expect(vm.state).toBe('unavailable')
    expect(vm.liveRegion).toBe('Analytics unavailable')
  })

  it('Loading when pools are hydrating', () => {
    const vm = buildPoolsAnalyticsViewModel({
      portfolioPools: [],
      poolsLoading: true,
    })
    expect(vm.state).toBe('loading')
  })

  it('excludes AMM factory pairs from SmartChef analytics universe', () => {
    const vm = buildPoolsAnalyticsViewModel({
      portfolioPools: [
        makeCard({ id: 'amm-1', name: 'AMM' }),
        makeCard({ id: 'sc-1' }),
      ],
      poolsLoading: false,
    })
    expect(vm.totals.smartChefUniverse).toBe(1)
    expect(vm.totals.active).toBe(1)
  })

  it('module avoids mock charts / predictions / animated graphs', () => {
    const src = [
      readFileSync(path.join(MODULES, 'PoolsAnalyticsModule.tsx'), 'utf8'),
      readFileSync(path.join(MODULES, 'PoolsAnalyticsPanel.tsx'), 'utf8'),
      readFileSync(path.join(MODULES, 'buildPoolsAnalytics.ts'), 'utf8'),
      readFileSync(path.join(MODULES, 'usePoolsAnalytics.ts'), 'utf8'),
    ].join('\n')
    expect(src).not.toContain('sparkline')
    expect(src).not.toContain('predicted')
    expect(src).not.toContain('mockAnalytics')
    expect(src).not.toContain('SAMPLE_ANALYTICS')
    expect(src).not.toContain('animation-delay')
    expect(src).toContain('poolsAnalytics.contentMax')
    expect(src).toContain('poolsAnalytics.panelH')
    expect(poolsAnalytics.contentMax).toBe('1376px')
    expect(poolsAnalytics.panelH).toBe('240px')
  })
})
