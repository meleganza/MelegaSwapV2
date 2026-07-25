/**
 * FARMS_MODULE_006 — Yield Advisor focused certification tests.
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
  FARMS_MODULE_005_TIP,
  farmsYieldAdvisor,
} from '../modules/farmsYieldAdvisorTokens'
import { buildFarmsYieldAdvisorViewModel } from '../modules/buildFarmsYieldAdvisor'
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
    status: 'finished',
    tvl: '—',
    dailyRewards: '—',
    multiplier: '0x',
    liquidity: '—',
    cta: 'none',
    emissionState: 'zero',
    rewardToken: 'MXMX',
    pid,
    userStaked: new BigNumber('1000000000000000000'),
    pendingReward: new BigNumber(0),
    rawFarm: {
      pid,
      multiplier: '0X',
      lpAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      token: { symbol: 'MARCO', decimals: 18 },
      quoteToken: { symbol: 'ASTER', decimals: 18 },
      earningToken: { symbol: 'MXMX', decimals: 18 },
      lpToken: { decimals: 18 },
      ...rawPartial,
    } as any,
    ...rest,
  }
}

describe('FARMS_MODULE_006 Yield Advisor', () => {
  it('freezes Architecture 000 mockup SHA and certified tips', () => {
    const mockup = path.join(REPO, FARMS_FOUNDER_MOCKUP.relativePath)
    expect(existsSync(mockup)).toBe(true)
    const hash = createHash('sha256').update(readFileSync(mockup)).digest('hex')
    expect(hash).toBe(FARMS_FOUNDER_MOCKUP.sha256)
    expect(hash).toBe(farmsYieldAdvisor.mockupSha256)
    expect(FARMS_ARCHITECTURE_000_TIP.startsWith('8edd68d4')).toBe(true)
    expect(FARMS_MODULE_005_TIP.startsWith('640e1e6d')).toBe(true)
  })

  it('freezes Modules 001–005 sources byte-identically', () => {
    expect(sha('src/views/FarmsStudio/modules/FarmsHeroModule.tsx')).toBe(FARMS_MODULE_001_FREEZE_SHA256.FarmsHeroModule)
    expect(sha('src/views/FarmsStudio/modules/FarmsHeroArtwork.tsx')).toBe(FARMS_MODULE_001_FREEZE_SHA256.FarmsHeroArtwork)
    expect(sha('src/views/FarmsStudio/modules/FarmsHeroTrustPanel.tsx')).toBe(FARMS_MODULE_001_FREEZE_SHA256.FarmsHeroTrustPanel)
    expect(sha('src/views/FarmsStudio/modules/farmsHeroTokens.ts')).toBe(FARMS_MODULE_001_FREEZE_SHA256.farmsHeroTokens)

    expect(sha('src/views/FarmsStudio/modules/FarmsOverviewKpisModule.tsx')).toBe(
      FARMS_MODULE_002_FREEZE_SHA256.FarmsOverviewKpisModule,
    )
    expect(sha('src/views/FarmsStudio/modules/farmsOverviewKpisTokens.ts')).toBe(
      FARMS_MODULE_002_FREEZE_SHA256.farmsOverviewKpisTokens,
    )
    expect(sha('src/views/FarmsStudio/modules/buildFarmsOverviewKpis.ts')).toBe(
      FARMS_MODULE_002_FREEZE_SHA256.buildFarmsOverviewKpis,
    )
    expect(sha('src/views/FarmsStudio/modules/useFarmsOverviewKpis.ts')).toBe(
      FARMS_MODULE_002_FREEZE_SHA256.useFarmsOverviewKpis,
    )
    expect(sha('src/views/FarmsStudio/modules/farmsOverviewKpisTypes.ts')).toBe(
      FARMS_MODULE_002_FREEZE_SHA256.farmsOverviewKpisTypes,
    )

    expect(sha('src/views/FarmsStudio/modules/FarmsMyFarmsModule.tsx')).toBe(FARMS_MODULE_003_FREEZE_SHA256.FarmsMyFarmsModule)
    expect(sha('src/views/FarmsStudio/modules/FarmsMyFarmCard.tsx')).toBe(FARMS_MODULE_003_FREEZE_SHA256.FarmsMyFarmCard)
    expect(sha('src/views/FarmsStudio/modules/farmsMyFarmsTokens.ts')).toBe(FARMS_MODULE_003_FREEZE_SHA256.farmsMyFarmsTokens)
    expect(sha('src/views/FarmsStudio/modules/farmsMyFarmsTypes.ts')).toBe(FARMS_MODULE_003_FREEZE_SHA256.farmsMyFarmsTypes)
    expect(sha('src/views/FarmsStudio/modules/buildFarmsWalletPositions.ts')).toBe(
      FARMS_MODULE_003_FREEZE_SHA256.buildFarmsWalletPositions,
    )
    expect(sha('src/views/FarmsStudio/modules/useFarmsWalletPositions.ts')).toBe(
      FARMS_MODULE_003_FREEZE_SHA256.useFarmsWalletPositions,
    )

    expect(sha('src/views/FarmsStudio/modules/FarmsExploreFarmsModule.tsx')).toBe(
      FARMS_MODULE_004_FREEZE_SHA256.FarmsExploreFarmsModule,
    )
    expect(sha('src/views/FarmsStudio/modules/FarmsExploreFarmCard.tsx')).toBe(
      FARMS_MODULE_004_FREEZE_SHA256.FarmsExploreFarmCard,
    )
    expect(sha('src/views/FarmsStudio/modules/farmsExploreFarmsTokens.ts')).toBe(
      FARMS_MODULE_004_FREEZE_SHA256.farmsExploreFarmsTokens,
    )
    expect(sha('src/views/FarmsStudio/modules/farmsExploreFarmsTypes.ts')).toBe(
      FARMS_MODULE_004_FREEZE_SHA256.farmsExploreFarmsTypes,
    )
    expect(sha('src/views/FarmsStudio/modules/buildFarmsExploreFarms.ts')).toBe(
      FARMS_MODULE_004_FREEZE_SHA256.buildFarmsExploreFarms,
    )
    expect(sha('src/views/FarmsStudio/modules/useFarmsExploreFarms.ts')).toBe(
      FARMS_MODULE_004_FREEZE_SHA256.useFarmsExploreFarms,
    )

    expect(sha('src/views/FarmsStudio/modules/FarmsFinishedFarmsModule.tsx')).toBe(
      FARMS_MODULE_005_FREEZE_SHA256.FarmsFinishedFarmsModule,
    )
    expect(sha('src/views/FarmsStudio/modules/FarmsFinishedFarmCard.tsx')).toBe(
      FARMS_MODULE_005_FREEZE_SHA256.FarmsFinishedFarmCard,
    )
    expect(sha('src/views/FarmsStudio/modules/farmsFinishedFarmsTokens.ts')).toBe(
      FARMS_MODULE_005_FREEZE_SHA256.farmsFinishedFarmsTokens,
    )
    expect(sha('src/views/FarmsStudio/modules/farmsFinishedFarmsTypes.ts')).toBe(
      FARMS_MODULE_005_FREEZE_SHA256.farmsFinishedFarmsTypes,
    )
    expect(sha('src/views/FarmsStudio/modules/buildFarmsFinishedFarms.ts')).toBe(
      FARMS_MODULE_005_FREEZE_SHA256.buildFarmsFinishedFarms,
    )
    expect(sha('src/views/FarmsStudio/modules/useFarmsFinishedFarms.ts')).toBe(
      FARMS_MODULE_005_FREEZE_SHA256.useFarmsFinishedFarms,
    )
  })

  it('mounts Module 006 after Finished; Module 008 stays unmounted', () => {
    const screen = readFileSync(path.join(STUDIO, 'FarmsStudioScreen.tsx'), 'utf8')
    expect(screen).toContain('FarmsYieldAdvisorModule')
    expect(screen).toContain('data-farms-module-006="mounted"')
    expect(screen.indexOf('FarmsFinishedFarmsModule')).toBeLessThan(screen.indexOf('FarmsYieldAdvisorModule'))
    expect(screen).not.toContain('AIYieldAdvisorPanel')
    expect(screen).not.toContain('data-farms-module="008"')
    expect(screen).not.toContain('FarmsVisualPolishModule')
  })

  it('locks desktop slot 424×360 and card 390×64 with max 4', () => {
    expect(farmsYieldAdvisor.slotW).toBe('424px')
    expect(farmsYieldAdvisor.slotH).toBe('360px')
    expect(farmsYieldAdvisor.cardW).toBe('390px')
    expect(farmsYieldAdvisor.cardH).toBe('64px')
    expect(farmsYieldAdvisor.maxVisible).toBe(4)
    expect(farmsYieldAdvisor.touchMin).toBe('44px')
    expect(farmsYieldAdvisor.mobileContent390).toBe('358px')
  })

  it('Emergency recommendation routes Withdraw via ActionHost', () => {
    const emergency = makeCard({
      pid: 1,
      userStaked: new BigNumber('1000000000000000000'),
      pendingReward: new BigNumber(0),
      rawFarm: { pid: 1, enableEmergencyWithdraw: true, multiplier: '0X' } as any,
    })
    const vm = buildFarmsYieldAdvisorViewModel({
      account: '0x1',
      portfolioFarms: [emergency],
      userDataLoaded: true,
      farmsLoading: false,
    })
    expect(vm.state).toBe('ready')
    expect(vm.cards[0].kind).toBe('emergency_withdraw')
    expect(vm.cards[0].title).toBe('Emergency withdrawal available')
    expect(vm.cards[0].reason).toContain('emergency withdrawal')
    expect(vm.cards[0].actionLabel).toBe('Withdraw')
    expect(vm.cards[0].modalAction).toBe('unstake')
    expect(vm.cards[0].actionEnabled).toBe(true)
  })

  it('Withdraw finished farm recommendation', () => {
    const finished = makeCard({
      pid: 2,
      userStaked: new BigNumber('1000000000000000000'),
      pendingReward: new BigNumber(0),
      rawFarm: { pid: 2, enableEmergencyWithdraw: false, multiplier: '0X' } as any,
    })
    const vm = buildFarmsYieldAdvisorViewModel({
      account: '0x1',
      portfolioFarms: [finished],
      userDataLoaded: true,
      farmsLoading: false,
    })
    expect(vm.cards[0].kind).toBe('withdraw_finished')
    expect(vm.cards[0].title).toBe('Finished farm requires attention')
    expect(vm.cards[0].reason).toBe('Your LP remains in an ended farm.')
    expect(vm.cards[0].actionLabel).toBe('Withdraw')
    expect(vm.cards[0].modalAction).toBe('unstake')
  })

  it('Harvest recommendation for finished and active farms', () => {
    const finishedHarvest = makeCard({
      pid: 3,
      userStaked: new BigNumber(0),
      pendingReward: new BigNumber('12450000000000000000'),
      rawFarm: { pid: 3, multiplier: '0X', earningToken: { symbol: 'MXMX', decimals: 18 } } as any,
    })
    const activeHarvest = makeCard({
      pid: 4,
      status: 'live',
      cta: 'stake',
      multiplier: '1x',
      emissionState: 'active',
      userStaked: new BigNumber('1'),
      pendingReward: new BigNumber('5000000000000000000'),
      rawFarm: {
        pid: 4,
        multiplier: '1X',
        token: { symbol: 'MARCO', decimals: 18 },
        quoteToken: { symbol: 'ASTER', decimals: 18 },
        earningToken: { symbol: 'MXMX', decimals: 18 },
      } as any,
    })
    const vmFinished = buildFarmsYieldAdvisorViewModel({
      account: '0x1',
      portfolioFarms: [finishedHarvest],
      userDataLoaded: true,
      farmsLoading: false,
    })
    expect(vmFinished.cards[0].kind).toBe('harvest_rewards')
    expect(vmFinished.cards[0].title).toBe('Rewards available')
    expect(vmFinished.cards[0].reason).toContain('can be harvested')
    expect(vmFinished.cards[0].actionLabel).toBe('Harvest')
    expect(vmFinished.cards[0].modalAction).toBe('claim')
    expect(vmFinished.cards[0].accessibleName).toContain('Harvest MXMX')

    const vmActive = buildFarmsYieldAdvisorViewModel({
      account: '0x1',
      portfolioFarms: [activeHarvest],
      userDataLoaded: true,
      farmsLoading: false,
    })
    expect(vmActive.cards[0].kind).toBe('harvest_active')
    expect(vmActive.cards[0].modalAction).toBe('claim')
  })

  it('priority ordering: emergency → withdraw → harvest finished → harvest active', () => {
    const emergency = makeCard({
      pid: 10,
      userStaked: new BigNumber('1000000000000000000'),
      pendingReward: new BigNumber(0),
      rawFarm: { pid: 10, enableEmergencyWithdraw: true, multiplier: '0X' } as any,
    })
    const withdraw = makeCard({
      pid: 11,
      userStaked: new BigNumber('1000000000000000000'),
      pendingReward: new BigNumber(0),
      rawFarm: { pid: 11, enableEmergencyWithdraw: false, multiplier: '0X' } as any,
    })
    const finishedHarvest = makeCard({
      pid: 12,
      userStaked: new BigNumber(0),
      pendingReward: new BigNumber('1000000000000000000'),
      rawFarm: { pid: 12, multiplier: '0X', earningToken: { symbol: 'MXMX', decimals: 18 } } as any,
    })
    const activeHarvest = makeCard({
      pid: 13,
      status: 'live',
      cta: 'stake',
      multiplier: '1x',
      userStaked: new BigNumber('1'),
      pendingReward: new BigNumber('1000000000000000000'),
      rawFarm: { pid: 13, multiplier: '1X', earningToken: { symbol: 'MXMX', decimals: 18 } } as any,
    })
    const vm = buildFarmsYieldAdvisorViewModel({
      account: '0x1',
      portfolioFarms: [activeHarvest, finishedHarvest, withdraw, emergency],
      userDataLoaded: true,
      farmsLoading: false,
    })
    expect(vm.cards.map((c) => c.kind)).toEqual([
      'emergency_withdraw',
      'withdraw_finished',
      'harvest_rewards',
      'harvest_active',
    ])
    expect(vm.cards).toHaveLength(4)
  })

  it('No action / all-clear state', () => {
    const quiet = makeCard({
      pid: 20,
      status: 'live',
      cta: 'stake',
      multiplier: '1x',
      userStaked: new BigNumber(0),
      pendingReward: new BigNumber(0),
      rawFarm: { pid: 20, multiplier: '1X' } as any,
    })
    const vm = buildFarmsYieldAdvisorViewModel({
      account: '0x1',
      portfolioFarms: [quiet],
      userDataLoaded: true,
      farmsLoading: false,
    })
    expect(vm.state).toBe('all_clear')
    expect(vm.cards).toHaveLength(1)
    expect(vm.cards[0].title).toBe('Everything looks good')
    expect(vm.cards[0].reason).toBe('No immediate farming actions require attention.')
    expect(vm.cards[0].actionKind).toBe('none')
    expect(vm.cards[0].title.toLowerCase()).not.toContain('optimal')
  })

  it('Unavailable when sources fail with empty inventory', () => {
    const vm = buildFarmsYieldAdvisorViewModel({
      account: '0x1',
      portfolioFarms: [],
      userDataLoaded: true,
      farmsLoading: false,
      sourcesFailed: true,
    })
    expect(vm.state).toBe('unavailable')
    expect(vm.cards).toHaveLength(0)
    expect(vm.liveRegion).toBe('Yield Advisor unavailable')
  })

  it('loading and disconnected states are honest', () => {
    expect(
      buildFarmsYieldAdvisorViewModel({
        account: null,
        portfolioFarms: [],
        userDataLoaded: false,
        farmsLoading: false,
      }).state,
    ).toBe('disconnected')

    expect(
      buildFarmsYieldAdvisorViewModel({
        account: '0x1',
        portfolioFarms: [],
        userDataLoaded: false,
        farmsLoading: true,
      }).state,
    ).toBe('loading')
  })

  it('module uses factual engine only — no AI / prediction / APR opportunity advice', () => {
    const src = [
      readFileSync(path.join(MODULES, 'FarmsYieldAdvisorModule.tsx'), 'utf8'),
      readFileSync(path.join(MODULES, 'buildFarmsYieldAdvisor.ts'), 'utf8'),
      readFileSync(path.join(MODULES, 'useFarmsYieldAdvisor.ts'), 'utf8'),
      readFileSync(path.join(MODULES, 'FarmsYieldAdvisorCard.tsx'), 'utf8'),
    ].join('\n')
    expect(src.toLowerCase()).not.toContain('openai')
    expect(src.toLowerCase()).not.toContain('chatgpt')
    expect(src).not.toContain('predictedApr')
    expect(src).not.toContain('aiRecommend')
    expect(src).not.toContain('high_apr')
    expect(src).not.toContain('expected profit')
    expect(src).not.toContain('future earnings')
    expect(src).toContain('createPortal')
    expect(src).toContain('farmsYieldAdvisor.slotSelector')
    expect(src).toContain('requestModal')
    expect(farmsYieldAdvisor.slotSelector).toContain('data-farms-module-006-slot')
  })

  it('Module 003 reserved slot remains frozen and present', () => {
    const mod = readFileSync(path.join(MODULES, 'FarmsMyFarmsModule.tsx'), 'utf8')
    expect(mod).toContain('data-farms-module-006-slot="reserved"')
    expect(sha('src/views/FarmsStudio/modules/FarmsMyFarmsModule.tsx')).toBe(
      FARMS_MODULE_003_FREEZE_SHA256.FarmsMyFarmsModule,
    )
  })

  it('desktop / tablet / mobile geometry tokens and accessibility contracts', () => {
    const mod = readFileSync(path.join(MODULES, 'FarmsYieldAdvisorModule.tsx'), 'utf8')
    expect(mod).toContain('styled.section')
    expect(mod).toContain('styled.ul')
    expect(mod).toContain('prefers-reduced-motion')
    expect(mod).toContain('aria-live')
    expect(mod).toContain('Actions based on your current farm positions.')
    expect(farmsYieldAdvisor.focusRing).toBe('2px solid #F4C430')
    expect(farmsYieldAdvisor.tabletBreak).toBe('1199px')
    expect(farmsYieldAdvisor.mobileBreak).toBe('767px')
    const card = readFileSync(path.join(MODULES, 'FarmsYieldAdvisorCard.tsx'), 'utf8')
    expect(card).toContain('styled.article')
    expect(card).toContain('min-height: ${farmsYieldAdvisor.touchMin}')
  })
})
