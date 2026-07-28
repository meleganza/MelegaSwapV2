/**
 * POOLS_MODULE_006 — Reward Advisor focused certification tests.
 */
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import BigNumber from 'bignumber.js'
import {
  buildPoolsRewardAdvisorViewModel,
  isHighAprOpportunity,
  isPoolEndingSoon,
} from '../modules/buildPoolsRewardAdvisor'
import {
  POOLS_MODULE_001_FREEZE_SHA256,
  POOLS_MODULE_002_FREEZE_SHA256,
  POOLS_MODULE_003_FREEZE_SHA256,
  POOLS_MODULE_004_FREEZE_SHA256,
  POOLS_MODULE_005_FREEZE_SHA256,
  poolsRewardAdvisor,
} from '../modules/poolsRewardAdvisorTokens'
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
    name: partial.name ?? 'Advisor Pool',
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
      earningTokenPrice: 1,
    } as any),
    ...partial,
  }
}

describe('POOLS_MODULE_006 Reward Advisor', () => {
  it('freezes Architecture 000 mockup SHA', () => {
    const mockup = path.join(REPO, POOLS_FOUNDER_MOCKUP.relativePath)
    expect(existsSync(mockup)).toBe(true)
    const hash = createHash('sha256').update(readFileSync(mockup)).digest('hex')
    expect(hash).toBe(POOLS_FOUNDER_MOCKUP.sha256)
    expect(hash).toBe(poolsRewardAdvisor.mockupSha256)
  })

  it('freezes Modules 001–005 sources byte-identically', () => {
    expect(sha256File('src/views/PoolsStudio/modules/PoolsHeroModule.tsx')).toBe(
      POOLS_MODULE_001_FREEZE_SHA256.PoolsHeroModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsHeroArtwork.tsx')).toBe(
      POOLS_MODULE_001_FREEZE_SHA256.PoolsHeroArtwork,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsHeroTrustPanel.tsx')).toBe(
      POOLS_MODULE_001_FREEZE_SHA256.PoolsHeroTrustPanel,
    )
    expect(sha256File('src/views/PoolsStudio/modules/poolsHeroTokens.ts')).toBe(
      POOLS_MODULE_001_FREEZE_SHA256.poolsHeroTokens,
    )

    expect(sha256File('src/views/PoolsStudio/modules/PoolsOverviewKpisModule.tsx')).toBe(
      POOLS_MODULE_002_FREEZE_SHA256.PoolsOverviewKpisModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/usePoolsOverviewKpis.ts')).toBe(
      POOLS_MODULE_002_FREEZE_SHA256.usePoolsOverviewKpis,
    )
    expect(sha256File('src/views/PoolsStudio/modules/poolsOverviewKpisTokens.ts')).toBe(
      POOLS_MODULE_002_FREEZE_SHA256.poolsOverviewKpisTokens,
    )
    expect(sha256File('src/views/PoolsStudio/modules/poolsOverviewKpisTypes.ts')).toBe(
      POOLS_MODULE_002_FREEZE_SHA256.poolsOverviewKpisTypes,
    )

    expect(sha256File('src/views/PoolsStudio/modules/PoolsMyPositionsModule.tsx')).toBe(
      POOLS_MODULE_003_FREEZE_SHA256.PoolsMyPositionsModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsMyPositionCard.tsx')).toBe(
      POOLS_MODULE_003_FREEZE_SHA256.PoolsMyPositionCard,
    )
    expect(sha256File('src/views/PoolsStudio/modules/buildPoolsWalletPositions.ts')).toBe(
      POOLS_MODULE_003_FREEZE_SHA256.buildPoolsWalletPositions,
    )
    expect(sha256File('src/views/PoolsStudio/modules/usePoolsWalletPositions.ts')).toBe(
      POOLS_MODULE_003_FREEZE_SHA256.usePoolsWalletPositions,
    )
    expect(sha256File('src/views/PoolsStudio/modules/poolsMyPositionsTokens.ts')).toBe(
      POOLS_MODULE_003_FREEZE_SHA256.poolsMyPositionsTokens,
    )
    expect(sha256File('src/views/PoolsStudio/modules/poolsMyPositionsTypes.ts')).toBe(
      POOLS_MODULE_003_FREEZE_SHA256.poolsMyPositionsTypes,
    )

    expect(sha256File('src/views/PoolsStudio/modules/PoolsExplorePoolsModule.tsx')).toBe(
      POOLS_MODULE_004_FREEZE_SHA256.PoolsExplorePoolsModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsExplorePoolCard.tsx')).toBe(
      POOLS_MODULE_004_FREEZE_SHA256.PoolsExplorePoolCard,
    )
    expect(sha256File('src/views/PoolsStudio/modules/buildPoolsExplorePools.ts')).toBe(
      POOLS_MODULE_004_FREEZE_SHA256.buildPoolsExplorePools,
    )
    expect(sha256File('src/views/PoolsStudio/modules/usePoolsExplorePools.ts')).toBe(
      POOLS_MODULE_004_FREEZE_SHA256.usePoolsExplorePools,
    )
    expect(sha256File('src/views/PoolsStudio/modules/poolsExplorePoolsTokens.ts')).toBe(
      POOLS_MODULE_004_FREEZE_SHA256.poolsExplorePoolsTokens,
    )
    expect(sha256File('src/views/PoolsStudio/modules/poolsExplorePoolsTypes.ts')).toBe(
      POOLS_MODULE_004_FREEZE_SHA256.poolsExplorePoolsTypes,
    )

    expect(sha256File('src/views/PoolsStudio/modules/PoolsFinishedPoolsModule.tsx')).toBe(
      POOLS_MODULE_005_FREEZE_SHA256.PoolsFinishedPoolsModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsFinishedPoolCard.tsx')).toBe(
      POOLS_MODULE_005_FREEZE_SHA256.PoolsFinishedPoolCard,
    )
    expect(sha256File('src/views/PoolsStudio/modules/buildPoolsFinishedPools.ts')).toBe(
      POOLS_MODULE_005_FREEZE_SHA256.buildPoolsFinishedPools,
    )
    expect(sha256File('src/views/PoolsStudio/modules/usePoolsFinishedPools.ts')).toBe(
      POOLS_MODULE_005_FREEZE_SHA256.usePoolsFinishedPools,
    )
    expect(sha256File('src/views/PoolsStudio/modules/poolsFinishedPoolsTokens.ts')).toBe(
      POOLS_MODULE_005_FREEZE_SHA256.poolsFinishedPoolsTokens,
    )
    expect(sha256File('src/views/PoolsStudio/modules/poolsFinishedPoolsTypes.ts')).toBe(
      POOLS_MODULE_005_FREEZE_SHA256.poolsFinishedPoolsTypes,
    )
  })

  it('mounts Module 006 after Finished; Modules 007–008 may follow; Modules 009–010 stay unmounted', () => {
    const screen = readFileSync(path.join(STUDIO, 'PoolsStudioScreen.tsx'), 'utf8')
    expect(screen).toContain('PoolsRewardAdvisorModule')
    expect(screen).toContain('data-pools-module-006="mounted"')
    expect(screen.indexOf('PoolsFinishedPoolsModule')).toBeLessThan(screen.indexOf('PoolsRewardAdvisorModule'))
    expect(screen).not.toContain('data-pools-module="009"')
    expect(screen).not.toContain('PoolsIntegrationModule')
    expect(screen).not.toContain('PoolsTrendingModule')
  })

  it('desktop slot geometry tokens are exactly 424×360', () => {
    expect(poolsRewardAdvisor.slotW).toBe('424px')
    expect(poolsRewardAdvisor.slotH).toBe('360px')
    expect(poolsRewardAdvisor.maxVisible).toBe(4)
    expect(poolsRewardAdvisor.touchMin).toBe('44px')
  })

  it('priority Claim before Withdraw before Emergency', () => {
    const claim = makeCard({
      id: 'c',
      sousId: 1,
      pendingReward: new BigNumber('1000000000000000000'),
      userStaked: new BigNumber('1'),
    })
    const withdraw = makeCard({
      id: 'w',
      sousId: 2,
      status: 'ended',
      displayStatus: 'ENDED',
      cta: 'none',
      pendingReward: new BigNumber(0),
      userStaked: new BigNumber('1000000000000000000'),
      rawPool: {
        stakingToken: { symbol: 'MARCO', decimals: 18, address: '0xm' },
        earningToken: { symbol: 'ASTER', decimals: 18, address: '0xa' },
        isFinished: true,
      } as any,
    })
    const emergency = makeCard({
      id: 'e',
      sousId: 3,
      status: 'ended',
      displayStatus: 'ENDED',
      cta: 'none',
      pendingReward: new BigNumber(0),
      userStaked: new BigNumber('1000000000000000000'),
      rawPool: {
        stakingToken: { symbol: 'RARI', decimals: 18, address: '0xr' },
        earningToken: { symbol: 'MARCO', decimals: 18, address: '0xm' },
        enableEmergencyWithdraw: true,
        isFinished: true,
      } as any,
    })
    const vm = buildPoolsRewardAdvisorViewModel({
      account: '0x1',
      portfolioPools: [emergency, withdraw, claim],
      userDataLoaded: true,
      poolsLoading: false,
    })
    expect(vm.state).toBe('ready')
    expect(vm.cards.map((c) => c.kind)).toEqual(['claim', 'withdraw', 'emergency_withdraw'])
    expect(vm.cards[0].actionLabel).toBe('Claim')
    expect(vm.cards[1].actionLabel).toBe('Withdraw')
    expect(vm.cards[2].actionLabel).toBe('Emergency Withdraw')
    expect(vm.cards.every((c) => c.actionEnabled)).toBe(true)
  })

  it('Pool Ending Soon uses factual remainingRewardsPct / tone', () => {
    const ending = makeCard({
      id: 'end',
      remainingRewardsPct: 10,
      remainingRewardsTone: 'red',
      pendingReward: new BigNumber(0),
      userStaked: new BigNumber(0),
    })
    expect(isPoolEndingSoon(ending)).toBe(true)
    const vm = buildPoolsRewardAdvisorViewModel({
      account: '0x1',
      portfolioPools: [ending],
      userDataLoaded: true,
      poolsLoading: false,
    })
    expect(vm.cards.some((c) => c.kind === 'ending_soon')).toBe(true)
    expect(vm.cards.find((c) => c.kind === 'ending_soon')?.actionLabel).toBe('View Pool')
  })

  it('High APR Opportunity is factual stakeable ≥20% and not already staked', () => {
    const high = makeCard({
      id: 'apr',
      aprExact: 42,
      sustainableAprDisplay: '42%',
      apr: '42%',
      cta: 'stake',
      pendingReward: new BigNumber(0),
      userStaked: new BigNumber(0),
    })
    expect(isHighAprOpportunity(high)).toBe(true)
    const staked = makeCard({
      id: 'staked',
      aprExact: 50,
      sustainableAprDisplay: '50%',
      cta: 'stake',
      userStaked: new BigNumber('1'),
      pendingReward: new BigNumber(0),
    })
    expect(isHighAprOpportunity(staked)).toBe(false)
    const vm = buildPoolsRewardAdvisorViewModel({
      account: '0x1',
      portfolioPools: [high],
      userDataLoaded: true,
      poolsLoading: false,
    })
    expect(vm.cards[0].kind).toBe('high_apr')
    expect(vm.cards[0].actionLabel).toBe('Stake')
    expect(vm.cards[0].actionEnabled).toBe(true)
  })

  it('Nothing Requires Action when no factual priorities', () => {
    const quiet = makeCard({
      id: 'q',
      aprExact: 5,
      sustainableAprDisplay: '5%',
      cta: 'stake',
      pendingReward: new BigNumber(0),
      userStaked: new BigNumber(0),
      remainingRewardsPct: 80,
    })
    const vm = buildPoolsRewardAdvisorViewModel({
      account: '0x1',
      portfolioPools: [quiet],
      userDataLoaded: true,
      poolsLoading: false,
    })
    expect(vm.state).toBe('all_clear')
    expect(vm.cards).toHaveLength(1)
    expect(vm.cards[0].title).toBe('Everything looks good')
    expect(vm.cards[0].explanation).toBe('No immediate staking action is required.')
    expect(vm.cards[0].actionKind).toBe('none')
  })

  it('Unavailable when sources fail with empty inventory', () => {
    const vm = buildPoolsRewardAdvisorViewModel({
      account: '0x1',
      portfolioPools: [],
      userDataLoaded: true,
      poolsLoading: false,
      sourcesFailed: true,
    })
    expect(vm.state).toBe('unavailable')
    expect(vm.cards).toHaveLength(0)
    expect(vm.liveRegion).toBe('Advisor unavailable')
  })

  it('caps visible priority cards at 4', () => {
    const pools = [
      makeCard({
        id: 'c',
        sousId: 1,
        pendingReward: new BigNumber('1000000000000000000'),
        userStaked: new BigNumber('1'),
      }),
      makeCard({
        id: 'w',
        sousId: 2,
        status: 'ended',
        displayStatus: 'ENDED',
        cta: 'none',
        pendingReward: new BigNumber(0),
        userStaked: new BigNumber('1'),
        rawPool: {
          stakingToken: { symbol: 'A', decimals: 18, address: '0xa' },
          earningToken: { symbol: 'B', decimals: 18, address: '0xb' },
          isFinished: true,
        } as any,
      }),
      makeCard({
        id: 'e',
        sousId: 3,
        status: 'ended',
        displayStatus: 'ENDED',
        cta: 'none',
        pendingReward: new BigNumber(0),
        userStaked: new BigNumber('1'),
        rawPool: {
          stakingToken: { symbol: 'C', decimals: 18, address: '0xc' },
          earningToken: { symbol: 'D', decimals: 18, address: '0xd' },
          enableEmergencyWithdraw: true,
          isFinished: true,
        } as any,
      }),
      makeCard({
        id: 'end',
        sousId: 4,
        remainingRewardsPct: 5,
        pendingReward: new BigNumber(0),
        userStaked: new BigNumber(0),
      }),
      makeCard({
        id: 'apr',
        sousId: 5,
        aprExact: 99,
        sustainableAprDisplay: '99%',
        cta: 'stake',
        pendingReward: new BigNumber(0),
        userStaked: new BigNumber(0),
      }),
    ]
    const vm = buildPoolsRewardAdvisorViewModel({
      account: '0x1',
      portfolioPools: pools,
      userDataLoaded: true,
      poolsLoading: false,
    })
    expect(vm.cards.length).toBeLessThanOrEqual(4)
    expect(vm.cards.map((c) => c.kind)).toEqual([
      'claim',
      'withdraw',
      'emergency_withdraw',
      'ending_soon',
    ])
  })

  it('loading / disconnected states are honest', () => {
    expect(
      buildPoolsRewardAdvisorViewModel({
        account: null,
        portfolioPools: [],
        userDataLoaded: false,
        poolsLoading: false,
      }).state,
    ).toBe('disconnected')

    expect(
      buildPoolsRewardAdvisorViewModel({
        account: '0x1',
        portfolioPools: [],
        userDataLoaded: false,
        poolsLoading: true,
      }).state,
    ).toBe('loading')
  })

  it('module uses factual engine only — no AI / prediction wording', () => {
    const src = [
      readFileSync(path.join(MODULES, 'PoolsRewardAdvisorModule.tsx'), 'utf8'),
      readFileSync(path.join(MODULES, 'buildPoolsRewardAdvisor.ts'), 'utf8'),
      readFileSync(path.join(MODULES, 'usePoolsRewardAdvisor.ts'), 'utf8'),
      readFileSync(path.join(MODULES, 'PoolsRewardAdvisorCard.tsx'), 'utf8'),
    ].join('\n')
    expect(src.toLowerCase()).not.toContain('openai')
    expect(src.toLowerCase()).not.toContain('chatgpt')
    expect(src).not.toContain('predictedApr')
    expect(src).not.toContain('aiRecommend')
    expect(src).toContain('createPortal')
    expect(src).toContain('poolsRewardAdvisor.slotSelector')
    expect(poolsRewardAdvisor.slotSelector).toContain('data-pools-module-006-slot')
  })

  it('Module 003 reserved slot remains frozen and present', () => {
    const mod = readFileSync(path.join(MODULES, 'PoolsMyPositionsModule.tsx'), 'utf8')
    expect(mod).toContain('data-pools-module-006-slot="reserved"')
    expect(sha256File('src/views/PoolsStudio/modules/PoolsMyPositionsModule.tsx')).toBe(
      POOLS_MODULE_003_FREEZE_SHA256.PoolsMyPositionsModule,
    )
  })
})
